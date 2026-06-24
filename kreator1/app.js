/* ==========================================
KREATOR INSTRUKCJI KROK PO KROKU
Wersja 2.0 – nowoczesny interfejs
Funkcje: autosave, drag&drop, podgląd live,
         numerowanie kroków, eksport PDF/DOCX
========================================== */

/* ---------- STAN ---------- */
let steps = [];
let stepCounter = 0;

/* ---------- SZABLONY ---------- */
const TEMPLATES = {
  default: { name: 'Domyślny',    accent: '#2563eb', bg: '#ffffff' },
  tech:    { name: 'Techniczny',  accent: '#374151', bg: '#f9fafb' },
  dali:    { name: 'DALI',        accent: '#7c3aed', bg: '#faf5ff' },
  minimal: { name: 'Minimalistyczny', accent: '#059669', bg: '#f0fdf4' },
};

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Podgląd on-change
  ['docTitle','docDesc','docEnding'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { saveState(); renderPreview(); });
  });

  ['templateSelect','photoPrefix'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { saveState(); renderPreview(); });
  });

  document.getElementById('addStep').addEventListener('click', () => addStep());
  document.getElementById('btnPDF').addEventListener('click', exportPDF);
  document.getElementById('btnDOCX').addEventListener('click', exportDOCX);
  document.getElementById('btnClear').addEventListener('click', clearAll);

  // Drag & drop dla kroków
  initDragDrop();

  renderPreview();
});

/* ==========================================
KROKI
========================================== */
function addStep(data) {
  stepCounter++;
  const id = data?.id || stepCounter;
  const step = {
    id,
    text:      data?.text      || '',
    longText:  data?.longText  || '',
    ending:    data?.ending    || '',
    images:    data?.images    || [],
  };
  steps.push(step);

  const el = createStepEl(step);
  document.getElementById('stepsContainer').appendChild(el);

  // Przywróć zdjęcia jeśli są
  if (step.images.length) {
    step.images.forEach(img => addImageBlock(step.id, img));
  }

  saveState();
  renderPreview();
  return el;
}

function createStepEl(step) {
  const el = document.createElement('div');
  el.className = 'stepItem';
  el.id = 'step-' + step.id;
  el.draggable = true;

  el.innerHTML = `
    <div class="step-header">
      <div class="step-num">${steps.indexOf(step) + 1}</div>
      <input type="text" class="step-input" value="${esc(step.text)}" placeholder="Krótki opis kroku (nagłówek)">
      <div class="step-controls">
        <span class="drag-handle" title="Przeciągnij aby zmienić kolejność">⠿</span>
        <button class="btn-step-up" title="Przesuń wyżej">↑</button>
        <button class="btn-step-down" title="Przesuń niżej">↓</button>
        <button class="btn-step-del" title="Usuń krok">✕</button>
      </div>
    </div>
    <div class="step-body">
      <textarea class="step-long-text" rows="3" placeholder="Szczegółowy opis kroku (opcjonalnie)...">${esc(step.longText)}</textarea>
      <div class="step-images-container" id="images-${step.id}"></div>
      <button class="btn-add-image" data-step="${step.id}">📷 Dodaj zdjęcie</button>
    </div>
  `;

  // Zdarzenia
  const stepInput = el.querySelector('.step-input');
  stepInput.addEventListener('input', e => {
    const s = steps.find(s => s.id === step.id);
    if (s) s.text = e.target.value;
    saveState(); renderPreview();
  });

  const longText = el.querySelector('.step-long-text');
  longText.addEventListener('input', e => {
    const s = steps.find(s => s.id === step.id);
    if (s) s.longText = e.target.value;
    saveState(); renderPreview();
  });

  el.querySelector('.btn-step-del').addEventListener('click', () => removeStep(step.id));
  el.querySelector('.btn-step-up').addEventListener('click', () => moveStep(step.id, -1));
  el.querySelector('.btn-step-down').addEventListener('click', () => moveStep(step.id, 1));
  el.querySelector('.btn-add-image').addEventListener('click', () => addImageBlock(step.id));

  return el;
}

function removeStep(id) {
  steps = steps.filter(s => s.id !== id);
  const el = document.getElementById('step-' + id);
  if (el) el.remove();
  renumberSteps();
  saveState(); renderPreview();
}

function moveStep(id, dir) {
  const idx = steps.findIndex(s => s.id === id);
  if (idx < 0) return;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= steps.length) return;
  [steps[idx], steps[newIdx]] = [steps[newIdx], steps[idx]];

  const container = document.getElementById('stepsContainer');
  const els = [...container.children];
  const el = document.getElementById('step-' + id);
  const target = els[newIdx];
  if (el && target) {
    if (dir < 0) container.insertBefore(el, target);
    else container.insertBefore(target, el);
  }
  renumberSteps();
  saveState(); renderPreview();
}

function renumberSteps() {
  steps.forEach((s, i) => {
    const numEl = document.querySelector('#step-' + s.id + ' .step-num');
    if (numEl) numEl.textContent = i + 1;
  });
}

/* ==========================================
ZDJĘCIA W KROKACH
========================================== */
function addImageBlock(stepId, imageData) {
  const step = steps.find(s => s.id === stepId);
  if (!step) return;

  const imgId = Date.now() + Math.random();
  const imgObj = imageData || { id: imgId, src: null, caption: '', size: 100, afterText: '' };
  if (!imageData) step.images.push(imgObj);

  const container = document.getElementById('images-' + stepId);
  if (!container) return;

  const block = document.createElement('div');
  block.className = 'imageBlock';
  block.id = 'imgblock-' + imgObj.id;

  block.innerHTML = `
    <div class="image-upload-area ${imgObj.src ? 'has-image' : ''}">
      <label class="btn-upload" title="Wybierz zdjęcie">
        ${imgObj.src ? '🔄 Zmień zdjęcie' : '📷 Wybierz zdjęcie'}
        <input type="file" accept="image/*" style="display:none">
      </label>
      ${imgObj.src ? `<img src="${imgObj.src}" class="step-image-thumb">` : '<span class="upload-hint">Brak zdjęcia</span>'}
    </div>
    <div class="image-meta">
      <input type="text" class="image-caption" value="${esc(imgObj.caption)}" placeholder="Podpis zdjęcia...">
      <div class="image-size-row">
        <label class="size-label">Rozmiar: <span class="size-val">${imgObj.size}%</span></label>
        <input type="range" class="image-size-range" min="20" max="100" step="5" value="${imgObj.size}">
      </div>
    </div>
    <textarea class="after-image-text" rows="2" placeholder="Tekst po zdjęciu (opcjonalnie)...">${esc(imgObj.afterText)}</textarea>
    <button class="btn-del-image">✕ Usuń zdjęcie</button>
  `;

  // Zdarzenia
  const fileInput = block.querySelector('input[type="file"]');
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      imgObj.src = ev.target.result;
      // Zaktualizuj podgląd w bloku
      let thumbEl = block.querySelector('.step-image-thumb');
      const uploadArea = block.querySelector('.image-upload-area');
      const hint = block.querySelector('.upload-hint');
      const uploadBtn = block.querySelector('.btn-upload');
      if (!thumbEl) {
        thumbEl = document.createElement('img');
        thumbEl.className = 'step-image-thumb';
        uploadArea.appendChild(thumbEl);
      }
      thumbEl.src = ev.target.result;
      thumbEl.style.display = 'block';
      if (hint) hint.remove();
      if (uploadBtn) uploadBtn.innerHTML = '🔄 Zmień zdjęcie <input type="file" accept="image/*" style="display:none">';
      uploadArea.classList.add('has-image');
      // Re-attach file listener
      const newInput = uploadBtn?.querySelector('input[type="file"]');
      if (newInput) newInput.addEventListener('change', fileInput.onchange);
      saveState(); renderPreview();
    };
    reader.readAsDataURL(file);
  });

  block.querySelector('.image-caption').addEventListener('input', e => {
    imgObj.caption = e.target.value;
    saveState(); renderPreview();
  });

  block.querySelector('.image-size-range').addEventListener('input', e => {
    imgObj.size = parseInt(e.target.value);
    block.querySelector('.size-val').textContent = imgObj.size + '%';
    saveState(); renderPreview();
  });

  block.querySelector('.after-image-text').addEventListener('input', e => {
    imgObj.afterText = e.target.value;
    saveState(); renderPreview();
  });

  block.querySelector('.btn-del-image').addEventListener('click', () => {
    step.images = step.images.filter(i => i.id !== imgObj.id);
    block.remove();
    saveState(); renderPreview();
  });

  container.appendChild(block);
}

/* ==========================================
DRAG & DROP
========================================== */
function initDragDrop() {
  const container = document.getElementById('stepsContainer');
  let dragging = null;

  container.addEventListener('dragstart', e => {
    const stepEl = e.target.closest('.stepItem');
    if (!stepEl) return;
    dragging = stepEl;
    stepEl.classList.add('dragging');
  });

  container.addEventListener('dragend', e => {
    if (dragging) dragging.classList.remove('dragging');
    dragging = null;
    // Sync steps order to DOM order
    const newOrder = [...container.querySelectorAll('.stepItem')].map(el => {
      const id = parseInt(el.id.replace('step-', ''));
      return steps.find(s => s.id === id);
    }).filter(Boolean);
    steps = newOrder;
    renumberSteps();
    saveState(); renderPreview();
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragging) return;
    const target = e.target.closest('.stepItem');
    if (!target || target === dragging) return;
    const rect = target.getBoundingClientRect();
    const mid  = rect.top + rect.height / 2;
    if (e.clientY < mid) container.insertBefore(dragging, target);
    else container.insertBefore(dragging, target.nextSibling);
  });
}

/* ==========================================
PODGLĄD NA ŻYWO
========================================== */
function renderPreview() {
  const title      = val('docTitle')  || 'Instrukcja';
  const desc       = val('docDesc');
  const ending     = val('docEnding');
  const prefix     = val('photoPrefix') || 'Fot.';
  const tplKey     = val('templateSelect') || 'default';
  const tpl        = TEMPLATES[tplKey] || TEMPLATES.default;

  let photoCounter = 0;
  let html = '';

  html += `<div class="prev-header" style="border-bottom:3px solid ${tpl.accent};padding-bottom:10px;margin-bottom:16px">
    <div class="prev-title" style="color:${tpl.accent};font-size:20px;font-weight:700">${esc(title)}</div>
    ${desc ? `<div class="prev-desc" style="color:#555;font-size:13px;margin-top:6px">${esc(desc)}</div>` : ''}
  </div>`;

  steps.forEach((step, i) => {
    html += `<div class="prev-step" style="margin-bottom:20px">
      <div class="prev-step-header" style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div class="prev-step-num" style="background:${tpl.accent};color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">${i + 1}</div>
        <div class="prev-step-title" style="font-size:14px;font-weight:600">${esc(step.text || '(bez tytułu)')}</div>
      </div>`;

    if (step.longText) {
      html += `<div class="prev-step-body" style="font-size:13px;color:#444;margin-left:38px;white-space:pre-line">${esc(step.longText)}</div>`;
    }

    step.images.forEach(img => {
      if (img.src) {
        photoCounter++;
        html += `<div class="prev-image-block" style="margin:10px 0 10px 38px">
          <img src="${img.src}" style="max-width:${img.size}%;border-radius:4px;display:block">
          ${img.caption ? `<div class="prev-caption" style="font-size:11px;color:#777;margin-top:3px">${prefix} ${photoCounter}. ${esc(img.caption)}</div>` : ''}
          ${img.afterText ? `<div style="font-size:13px;color:#444;margin-top:6px;white-space:pre-line">${esc(img.afterText)}</div>` : ''}
        </div>`;
      }
    });

    html += '</div>';
  });

  if (ending.trim()) {
    html += `<div class="prev-ending" style="margin-top:20px;padding:12px;background:#f0fdf4;border-left:4px solid #16a34a;font-size:13px;color:#166534">${esc(ending)}</div>`;
  }

  document.getElementById('previewContent').innerHTML = html;
}

/* ==========================================
EKSPORT PDF
========================================== */
async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const previewEl = document.getElementById('previewDoc');

  try {
    const canvas = await html2canvas(previewEl, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const imgW  = pageW - 20;
    const imgH  = imgW * canvas.height / canvas.width;

    if (imgH <= pageH - 20) {
      doc.addImage(imgData, 'PNG', 10, 10, imgW, imgH);
    } else {
      const totalPages = Math.ceil(imgH / (pageH - 20));
      for (let p = 0; p < totalPages; p++) {
        if (p > 0) doc.addPage();
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width  = canvas.width;
        const slicePx = (pageH - 20) * canvas.width / imgW;
        sliceCanvas.height = slicePx;
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, p * slicePx, canvas.width, slicePx, 0, 0, canvas.width, slicePx);
        doc.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 10, 10, imgW, pageH - 20);
      }
    }

    doc.save((val('docTitle') || 'instrukcja').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf');
  } catch (err) {
    alert('Błąd eksportu PDF: ' + err.message);
  }
}

/* ==========================================
EKSPORT DOCX
========================================== */
function exportDOCX() {
  const title  = val('docTitle')  || 'Instrukcja';
  const desc   = val('docDesc');
  const ending = val('docEnding');
  const prefix = val('photoPrefix') || 'Fot.';
  const tplKey = val('templateSelect') || 'default';
  const tpl    = TEMPLATES[tplKey] || TEMPLATES.default;

  let photoCounter = 0;
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 2cm; background: ${tpl.bg}; }
    h1   { font-size: 18pt; color: ${tpl.accent}; margin-bottom: 6px; }
    .desc { font-size: 10pt; color: #666; margin-bottom: 20px; }
    .step { margin-bottom: 20px; }
    .step-num { display:inline-block; background:${tpl.accent}; color:#fff; width:22px; height:22px;
                border-radius:50%; text-align:center; line-height:22px; font-size:10pt; font-weight:bold; margin-right:8px; }
    .step-title { font-size: 12pt; font-weight: 600; }
    .step-body  { font-size: 10pt; color: #444; margin: 6px 0 6px 30px; }
    .caption    { font-size: 9pt; color: #777; font-style:italic; margin-top:3px; }
    img         { max-width: 100%; display:block; margin: 8px 0 2px 30px; }
    .ending     { margin-top:20px; padding:10px 14px; background:#f0fdf4; border-left:4px solid #16a34a;
                  font-size:10pt; color:#166534; }
  </style>
  </head><body>
  <h1>${esc(title)}</h1>
  ${desc ? `<div class="desc">${esc(desc)}</div>` : ''}`;

  steps.forEach((step, i) => {
    html += `<div class="step">
      <div><span class="step-num">${i + 1}</span><span class="step-title">${esc(step.text || '(bez tytułu)')}</span></div>`;

    if (step.longText) {
      html += `<div class="step-body">${esc(step.longText).replace(/\n/g, '<br>')}</div>`;
    }

    step.images.forEach(img => {
      if (img.src) {
        photoCounter++;
        html += `<img src="${img.src}" style="max-width:${img.size}%">`;
        if (img.caption) html += `<div class="caption">${prefix} ${photoCounter}. ${esc(img.caption)}</div>`;
        if (img.afterText) html += `<div class="step-body">${esc(img.afterText).replace(/\n/g, '<br>')}</div>`;
      }
    });

    html += '</div>';
  });

  if (ending.trim()) {
    html += `<div class="ending">${esc(ending)}</div>`;
  }

  html += '</body></html>';

  try {
    const blob = htmlDocx.asBlob(html);
    const filename = (val('docTitle') || 'instrukcja').replace(/[^a-zA-Z0-9_-]/g, '_') + '.docx';
    saveAs(blob, filename);
  } catch (err) {
    alert('Błąd eksportu DOCX: ' + err.message);
  }
}

/* ==========================================
ZAPIS / ODCZYT STANU (localStorage)
========================================== */
function saveState() {
  const data = {
    title:    val('docTitle'),
    desc:     val('docDesc'),
    ending:   val('docEnding'),
    prefix:   val('photoPrefix'),
    template: val('templateSelect'),
    steps,
  };
  try {
    localStorage.setItem('kreator1_state', JSON.stringify(data));
  } catch (e) { /* baza pełna (zdjęcia base64) */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem('kreator1_state');
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.title)    document.getElementById('docTitle').value    = data.title;
    if (data.desc)     document.getElementById('docDesc').value     = data.desc;
    if (data.ending)   document.getElementById('docEnding').value   = data.ending;
    if (data.prefix)   document.getElementById('photoPrefix').value = data.prefix;
    if (data.template) document.getElementById('templateSelect').value = data.template;

    stepCounter = 0;
    steps = [];
    (data.steps || []).forEach(s => addStep(s));

  } catch (e) { console.error('loadState:', e); }
}

function clearAll() {
  if (!confirm('Wyczyścić wszystkie dane? Tej operacji nie można cofnąć.')) return;
  localStorage.removeItem('kreator1_state');

  ['docTitle','docDesc','docEnding'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('photoPrefix').value = 'Fot.';
  document.getElementById('templateSelect').value = 'default';

  steps = [];
  stepCounter = 0;
  document.getElementById('stepsContainer').innerHTML = '';
  renderPreview();
}

/* ---------- HELPERS ---------- */
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
