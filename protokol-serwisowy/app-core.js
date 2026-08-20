// ============================================================================
// APP-CORE.JS — dane formularza, autosave, pomocnicze funkcje
// (moduł fotografii: app-photos.js, moduł eksportu: app-export.js)
// ============================================================================

// ── AUTO SAVE (localStorage) ────────────────────────────────────────────────
function autoSave(){
  const data = collectData();
  localStorage.setItem('protokol-serwisowy', JSON.stringify(data));
  document.getElementById('status-pill').textContent = '● Zapisano automatycznie';
  document.getElementById('status-pill').className = 'status-pill status-done';
}

function collectData(){
  return {
    zglFirma:    v('zgl-firma'),
    zglBudynek:  v('zgl-budynek'),
    zglAdres:    v('zgl-adres'),
    zglOsoba:    v('zgl-osoba'),
    zglKontakt:  v('zgl-kontakt'),
    sameAddress: document.getElementById('same-address').checked,
    objNazwa:    v('obj-nazwa'),
    objBudynek:  v('obj-budynek'),
    objAdres:    v('obj-adres'),
    dataStart:   v('data-start'),
    dataEnd:     v('data-end'),
    nrZlecenia:  v('nr-zlecenia'),
    praceOpis:   v('prace-opis'),
    materialy:   v('materialy'),
    uwagi:       v('uwagi'),
    faktura:     document.querySelector('input[name="faktura"]:checked')?.value || '',
    dataOdbioru: v('data-odbioru'),
    sigOdbiorca: v('sig-odbiorca'),
    sigWykonawca:v('sig-wykonawca'),
    sigDataWyk:  v('sig-data-wyk'),
  };
}

function v(id){ return document.getElementById(id)?.value || ''; }

function loadSaved(){
  const raw = localStorage.getItem('protokol-serwisowy');
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val||''; };
    set('zgl-firma', d.zglFirma); set('zgl-budynek', d.zglBudynek);
    set('zgl-adres', d.zglAdres); set('zgl-osoba', d.zglOsoba);
    set('zgl-kontakt', d.zglKontakt);
    if (d.sameAddress) { document.getElementById('same-address').checked=true; toggleSameAddress(); }
    set('obj-nazwa', d.objNazwa); set('obj-budynek', d.objBudynek); set('obj-adres', d.objAdres);
    set('data-start', d.dataStart); set('data-end', d.dataEnd); set('nr-zlecenia', d.nrZlecenia);
    set('prace-opis', d.praceOpis); set('materialy', d.materialy); set('uwagi', d.uwagi);
    if (d.faktura) { const r = document.querySelector('input[name="faktura"][value="'+d.faktura+'"]'); if(r) r.checked=true; }
    set('data-odbioru', d.dataOdbioru); set('sig-odbiorca', d.sigOdbiorca);
    set('sig-wykonawca', d.sigWykonawca); set('sig-data-wyk', d.sigDataWyk);
    document.getElementById('status-pill').textContent = '● Wczytano zapisany projekt';
    document.getElementById('status-pill').className = 'status-pill status-done';
  } catch(e){}
}

function clearForm(){
  if (!confirm('Wyczyścić formularz? Dane zostaną usunięte.')) return;
  localStorage.removeItem('protokol-serwisowy');
  document.querySelectorAll('.inp').forEach(el => el.value = '');
  document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
  document.getElementById('same-address').checked = false;
  document.getElementById('photos-grid').innerHTML = '';
  photos = [];
  document.getElementById('sig-wykonawca').value = 'Prolight Solutions Sp. z o.o.';
  document.getElementById('status-pill').textContent = '● Wersja robocza';
  document.getElementById('status-pill').className = 'status-pill status-draft';
}

// ── SAME ADDRESS ─────────────────────────────────────────────────────────────
function toggleSameAddress(){
  const checked = document.getElementById('same-address').checked;
  document.getElementById('obiekt-fields').style.display = checked ? 'none' : 'block';
}

// ── FORMAT DATE ───────────────────────────────────────────────────────────────
function fmtDate(d){ if(!d) return '___________'; const parts=d.split('-'); return parts[2]+'.'+parts[1]+'.'+parts[0]; }

// ── HTML ESCAPE ───────────────────────────────────────────────────────────────
function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function(){
  loadSaved();
  // Set today as default for sig date
  var today = new Date().toISOString().split('T')[0];
  if (!document.getElementById('sig-data-wyk').value) document.getElementById('sig-data-wyk').value = today;
  if (!document.getElementById('data-start').value) document.getElementById('data-start').value = today;
  if (!document.getElementById('data-end').value) document.getElementById('data-end').value = today;
});
