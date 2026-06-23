/* ==========================================
   KONWERSJA ENTER → <br>
========================================== */
function nl2br(str) {
  return str.replace(/\n/g, "<br>");
}

/* ==========================================
   ESCAPE HTML – ochrona przed XSS
========================================== */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ==========================================
   REFERENCJE
========================================== */
const stepsContainer = document.getElementById("stepsContainer");
const output = document.getElementById("output");

/* ==========================================
   OBSŁUGA ZMIAN W POLACH GŁÓWNYCH
========================================== */
document.getElementById("title").addEventListener("input", () => { updatePreview(); saveState(); });
document.getElementById("description").addEventListener("input", () => { updatePreview(); saveState(); });
document.getElementById("ending").addEventListener("input", () => { updatePreview(); saveState(); });
document.getElementById("templateSelect").addEventListener("change", () => { updatePreview(); saveState(); });
document.getElementById("photoPrefix").addEventListener("change", () => { updatePreview(); saveState(); });

/* ==========================================
   DODAWANIE KROKU
========================================== */
document.getElementById("addStep").addEventListener("click", () => {
  addStep("", "");
  updateStepNumbers();
  updatePreview();
  saveState();
});

function addStep(text, longText) {
  const stepDiv = document.createElement("div");
  stepDiv.className = "stepItem";

  stepDiv.innerHTML = `
    <div class="stepHeader">
      <span class="stepNumber"></span>
      <input type="text" class="stepInput" placeholder="Wpisz krok...">
      <button class="moveUp" title="Przesuń w górę">↑</button>
      <button class="moveDown" title="Przesuń w dół">↓</button>
      <button class="deleteStep" title="Usuń krok">🗑</button>
    </div>
    <textarea class="stepLongText" placeholder="Dodatkowy opis (opcjonalnie)...">${escapeHtml(longText || "")}</textarea>
    <div class="stepImages"></div>
    <button class="addStepImage">📷 Dodaj zdjęcie</button>
  `;

  stepDiv.querySelector(".stepInput").value = text || "";

  stepsContainer.appendChild(stepDiv);

  stepDiv.querySelector(".deleteStep").addEventListener("click", () => {
    stepDiv.remove();
    updateStepNumbers();
    updatePreview();
    saveState();
  });

  stepDiv.querySelector(".moveUp").addEventListener("click", () => {
    if (stepDiv.previousElementSibling) {
      stepsContainer.insertBefore(stepDiv, stepDiv.previousElementSibling);
      updateStepNumbers();
      updatePreview();
      saveState();
    }
  });

  stepDiv.querySelector(".moveDown").addEventListener("click", () => {
    if (stepDiv.nextElementSibling) {
      stepsContainer.insertBefore(stepDiv.nextElementSibling, stepDiv);
      updateStepNumbers();
      updatePreview();
      saveState();
    }
  });

  stepDiv.querySelector(".stepInput").addEventListener("input", () => { updatePreview(); saveState(); });
  stepDiv.querySelector(".stepLongText").addEventListener("input", () => { updatePreview(); saveState(); });

  stepDiv.querySelector(".addStepImage").addEventListener("click", () => {
    addImageToStep(stepDiv);
  });

  stepDiv.setAttribute("draggable", "true");

  stepDiv.addEventListener("dragstart", (e) => {
    e.dataTransfer.effectAllowed = "move";
    stepDiv.classList.add("dragging");
    window._draggingStep = stepDiv;
  });

  stepDiv.addEventListener("dragend", () => {
    stepDiv.classList.remove("dragging");
    document.querySelectorAll(".stepItem").forEach(s => s.classList.remove("drag-over"));
    window._draggingStep = null;
    updateStepNumbers();
    updatePreview();
    saveState();
  });

  stepDiv.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const dragging = window._draggingStep;
    if (dragging && dragging !== stepDiv) {
      document.querySelectorAll(".stepItem").forEach(s => s.classList.remove("drag-over"));
      stepDiv.classList.add("drag-over");
    }
  });

  stepDiv.addEventListener("drop", (e) => {
    e.preventDefault();
    const dragging = window._draggingStep;
    if (dragging && dragging !== stepDiv) {
      stepsContainer.insertBefore(dragging, stepDiv);
    }
    stepDiv.classList.remove("drag-over");
  });
}

/* ==========================================
   NUMERACJA KROKÓW
========================================== */
function updateStepNumbers() {
  const steps = stepsContainer.querySelectorAll(".stepItem");
  steps.forEach((step, idx) => {
    const numEl = step.querySelector(".stepNumber");
    if (numEl) numEl.textContent = "Krok " + (idx + 1) + ":";
  });
}

/* ==========================================
   DODAWANIE ZDJĘCIA DO KROKU
========================================== */
function addImageToStep(stepDiv, initialSrc, initialCaption, initialSize, initialAfterText) {
  const container = stepDiv.querySelector(".stepImages");

  const block = document.createElement("div");
  block.className = "imageBlock";

  block.innerHTML = `
    <input type="file" accept="image/*" class="imageInput">
    <img style="display:none;">
    <input type="text" class="imageCaption" placeholder="Podpis zdjęcia...">
    <div class="imageControls">
      <label class="sizeLabel">Rozmiar:</label>
      <input type="range" class="imageSizeRange" min="20" max="200" value="100" step="5">
      <span class="imageSizeValue">100%</span>
    </div>
    <textarea class="afterImageText" placeholder="Tekst po zdjęciu (opcjonalnie)..." rows="2"></textarea>
    <button class="deleteImage">🗑 Usuń zdjęcie</button>
  `;

  container.appendChild(block);

  const fileInput = block.querySelector(".imageInput");
  const img = block.querySelector("img");
  const sizeRange = block.querySelector(".imageSizeRange");
  const sizeValue = block.querySelector(".imageSizeValue");

  let size = initialSize || 100;
  sizeRange.value = size;
  sizeValue.textContent = size + "%";

  if (initialSrc) {
    img.src = initialSrc;
    img.style.display = "block";
    img.style.width = size + "%";
  }
  if (initialCaption) block.querySelector(".imageCaption").value = initialCaption;
  if (initialAfterText) block.querySelector(".afterImageText").value = initialAfterText;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;
      img.style.display = "block";
      img.style.width = size + "%";
      updatePreview();
      saveState();
    };
    reader.readAsDataURL(file);
  });

  sizeRange.addEventListener("input", () => {
    size = parseInt(sizeRange.value);
    img.style.width = size + "%";
    sizeValue.textContent = size + "%";
    updatePreview();
    saveState();
  });

  block.querySelector(".deleteImage").addEventListener("click", () => {
    block.remove();
    updatePreview();
    saveState();
  });

  block.querySelector(".imageCaption").addEventListener("input", () => { updatePreview(); saveState(); });
  block.querySelector(".afterImageText").addEventListener("input", () => { updatePreview(); saveState(); });
}

/* ==========================================
   GENEROWANIE PODGLĄDU
========================================== */
function updatePreview() {
  const title = document.getElementById("title").value;
  const description = nl2br(document.getElementById("description").value);
  const ending = nl2br(document.getElementById("ending").value);
  const template = document.getElementById("templateSelect").value;

  let html = "";

  if (title.trim() !== "") {
    html += `<h1>${title}</h1>`;
  }

  if (description.trim() !== "") {
    html += `<p>${description}</p>`;
  }

  const steps = stepsContainer.querySelectorAll(".stepItem");
  if (steps.length > 0) {
    html += "<ol>";
    let photoCounter = 0;

    steps.forEach(step => {
      const stepTitle = step.querySelector(".stepInput").value;
      const stepLong = nl2br(step.querySelector(".stepLongText").value);

      const images = step.querySelectorAll(".imageBlock");
      const hasImages = Array.from(images).some(b => {
        const img = b.querySelector("img");
        return img.src && img.style.display !== "none";
      });

      if (hasImages) html += `<div class="stepBlock">`;
      html += `<li>${stepTitle}</li>`;

      if (stepLong.trim() !== "") {
        html += `<div class="stepLongTextPreview">${stepLong}</div>`;
      }

      images.forEach(imgBlock => {
        const img = imgBlock.querySelector("img");
        const caption = imgBlock.querySelector(".imageCaption").value;
        const afterText = nl2br(imgBlock.querySelector(".afterImageText").value);
        const sizeRange = imgBlock.querySelector(".imageSizeRange");
        const sizeVal = sizeRange ? sizeRange.value + "%" : (img.style.width || "100%");

        if (img.src && img.style.display !== "none") {
          photoCounter++;
          const prefix = document.getElementById("photoPrefix").value;
          const fotLabel = prefix
            ? (caption ? `${prefix} ${photoCounter}: ${caption}` : `${prefix} ${photoCounter}`)
            : (caption ? caption : "");
          html += `
            <div class="imagePreview">
              <img src="${img.src}" style="width:${sizeVal};">
              ${fotLabel ? `<p class="fotCaption">${fotLabel}</p>` : ""}
              ${afterText ? `<div class="afterImageTextPreview">${afterText}</div>` : ""}
            </div>
          `;
        }
      });

      if (hasImages) html += `</div>`;
    });

    html += "</ol>";
  }

  if (ending.trim() !== "") {
    html += `<p class="ending">${ending}</p>`;
  }

  applyTemplateStyles(template);
  output.innerHTML = html;
}

/* ==========================================
   STYLE SZABLONÓW
========================================== */
function applyTemplateStyles(template) {
  let styleEl = document.getElementById("templateStyle");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "templateStyle";
    document.head.appendChild(styleEl);
  }

  const styles = {
    default: `
      #output h1 { color: #2a4d8f; border-bottom: 2px solid #2a4d8f; padding-bottom: 6px; }
      #output ol { counter-reset: step-counter; padding-left: 0; }
      #output ol li { background: #f0f4ff; border-left: 4px solid #2a4d8f; padding: 8px 12px; margin: 6px 0; list-style: none; counter-increment: step-counter; }
      #output ol li::before { content: counter(step-counter) ". "; font-weight: bold; color: #2a4d8f; }
      #output .ending { color: #555; font-style: italic; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 20px; }
      #output .fotCaption { font-size: 13px; color: #666; font-style: italic; }
    `,
    tech: `
      #output { font-family: "Courier New", monospace; }
      #output h1 { color: #1a1a1a; background: #f0f0f0; padding: 10px; border-left: 5px solid #333; }
      #output ol { counter-reset: step-counter; padding-left: 0; }
      #output ol li { background: #fafafa; border: 1px solid #ccc; padding: 8px 12px; margin: 4px 0; list-style: none; counter-increment: step-counter; font-family: monospace; }
      #output ol li::before { content: "[" counter(step-counter) "] "; font-weight: bold; color: #333; }
      #output .ending { background: #f0f0f0; padding: 10px; border-left: 5px solid #333; font-family: monospace; }
      #output .fotCaption { font-size: 12px; color: #555; font-family: monospace; }
    `,
    dali: `
      #output h1 { color: #e65c00; border-bottom: 3px solid #e65c00; padding-bottom: 8px; }
      #output ol { counter-reset: step-counter; padding-left: 0; }
      #output ol li { background: #fff8f0; border-left: 4px solid #e65c00; padding: 8px 12px; margin: 6px 0; list-style: none; counter-increment: step-counter; }
      #output ol li::before { content: counter(step-counter) ". "; font-weight: bold; color: #e65c00; }
      #output .ending { color: #e65c00; border-top: 2px solid #e65c00; padding-top: 10px; margin-top: 20px; }
      #output .fotCaption { font-size: 13px; color: #e65c00; font-style: italic; }
    `,
    ikea: `
      #output { font-family: "Verdana", sans-serif; }
      #output h1 { color: #0058a3; font-size: 28px; letter-spacing: 1px; border-bottom: 4px solid #ffda1a; padding-bottom: 8px; }
      #output ol { counter-reset: step-counter; padding-left: 0; }
      #output ol li { background: #fff; border: 2px solid #0058a3; border-radius: 6px; padding: 10px 14px; margin: 8px 0; list-style: none; counter-increment: step-counter; font-weight: bold; }
      #output ol li::before { content: counter(step-counter); display: inline-block; background: #0058a3; color: white; border-radius: 50%; width: 24px; height: 24px; text-align: center; line-height: 24px; margin-right: 10px; font-size: 13px; }
      #output .ending { background: #ffda1a; color: #0058a3; padding: 10px 14px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
      #output .fotCaption { font-size: 12px; color: #0058a3; }
    `
  };

  styleEl.textContent = styles[template] || styles.default;
}

/* ==========================================
   ZAPIS / ODCZYT STANU (localStorage)
========================================== */
function saveState() {
  try {
    const state = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      ending: document.getElementById("ending").value,
      template: document.getElementById("templateSelect").value,
      photoPrefix: document.getElementById("photoPrefix").value,
      steps: []
    };

    stepsContainer.querySelectorAll(".stepItem").forEach(step => {
      const stepData = {
        text: step.querySelector(".stepInput").value,
        longText: step.querySelector(".stepLongText").value,
        images: []
      };
      step.querySelectorAll(".imageBlock").forEach(imgBlock => {
        const img = imgBlock.querySelector("img");
        const sizeRange = imgBlock.querySelector(".imageSizeRange");
        if (img && img.style.display !== "none") {
          stepData.images.push({
            src: img.src,
            caption: imgBlock.querySelector(".imageCaption").value,
            size: sizeRange ? parseInt(sizeRange.value) : 100,
            afterText: imgBlock.querySelector(".afterImageText").value
          });
        }
      });
      state.steps.push(stepData);
    });

    localStorage.setItem("kreator2_state", JSON.stringify(state));
  } catch(e) {
    console.warn("Nie można zapisać stanu:", e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem("kreator2_state");
    if (!raw) return;
    const state = JSON.parse(raw);

    document.getElementById("title").value = state.title || "";
    document.getElementById("description").value = state.description || "";
    document.getElementById("ending").value = state.ending || "";
    if (state.template) document.getElementById("templateSelect").value = state.template;
    if (state.photoPrefix) document.getElementById("photoPrefix").value = state.photoPrefix;

    (state.steps || []).forEach(stepData => {
      addStep(stepData.text || "", stepData.longText || "");
      if (stepData.images && stepData.images.length > 0) {
        const lastStep = stepsContainer.lastElementChild;
        stepData.images.forEach(imgData => {
          addImageToStep(lastStep, imgData.src, imgData.caption, imgData.size, imgData.afterText);
        });
      }
    });

    updateStepNumbers();
    updatePreview();
  } catch(e) {
    console.warn("Nie można wczytać stanu:", e);
  }
}

document.getElementById("clearState").addEventListener("click", () => {
  if (confirm("Czy na pewno chcesz wyczyścić całą instrukcję? Tej operacji nie można cofnąć.")) {
    localStorage.removeItem("kreator2_state");
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("ending").value = "";
    stepsContainer.innerHTML = "";
    updatePreview();
  }
});

/* ==========================================
   EKSPORT DO PDF
========================================== */
document.getElementById("exportPDF").addEventListener("click", () => {
  const title = document.getElementById("title").value;
  const steps = stepsContainer.querySelectorAll(".stepItem");

  if (!title.trim() && steps.length === 0) {
    alert("Instrukcja jest pusta. Dodaj tytuł lub co najmniej jeden krok przed eksportem.");
    return;
  }

  const element = document.getElementById("output");
  const opt = {
    margin: [15, 15, 15, 15],
    filename: (title.trim() || "instrukcja") + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] }
  };

  html2pdf().set(opt).from(element).toPdf().get("pdf").then(pdf => {
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: "center" });
    }
  }).save();
});

/* ==========================================
   EKSPORT DO DOCX (html-docx-js)
========================================== */
document.getElementById("exportDOCX").addEventListener("click", function() {
  const title = document.getElementById("title").value;
  const steps = stepsContainer.querySelectorAll(".stepItem");

  if (!title.trim() && steps.length === 0) {
    alert("Instrukcja jest pusta. Dodaj tytuł lub co najmniej jeden krok przed eksportem.");
    return;
  }

  const btn = document.getElementById("exportDOCX");
  btn.disabled = true;
  btn.textContent = "⏳ Generuję DOCX...";

  try {
    if (typeof htmlDocx === "undefined") {
      throw new Error("Biblioteka html-docx-js nie załadowała się. Sprawdź połączenie z internetem.");
    }

    const titleVal = title || "Instrukcja";
    const desc = document.getElementById("description").value;
    const ending = document.getElementById("ending").value;
    const prefix = document.getElementById("photoPrefix").value;
    const stepsAll = document.getElementById("stepsContainer").querySelectorAll(".stepItem");

    let content = `<html><head><meta charset="UTF-8">
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #111; }
        h1 { color: #2a4d8f; font-size: 18pt; }
        ol { margin-left: 20px; }
        li { margin-bottom: 8px; font-size: 11pt; }
        .stepLong { font-size: 10pt; color: #444; margin: 4px 0 8px 0; }
        .caption { font-size: 9pt; color: #666; font-style: italic; }
        .ending { font-style: italic; color: #555; border-top: 1px solid #ccc; padding-top: 8px; margin-top: 16px; }
        img { max-width: 100%; }
      </style>
      </head><body>
      <h1>${titleVal}</h1>
      ${desc ? "<p>" + desc.replace(/\n/g, "<br>") + "</p>" : ""}
      <ol>`;

    let photoCounter = 0;
    stepsAll.forEach(step => {
      const stepTitle = step.querySelector(".stepInput").value;
      const stepLong = step.querySelector(".stepLongText").value;
      content += `<li>${stepTitle}</li>`;
      if (stepLong.trim()) {
        content += `<p class="stepLong">${stepLong.replace(/\n/g, "<br>")}</p>`;
      }
      step.querySelectorAll(".imageBlock").forEach(imgBlock => {
        const img = imgBlock.querySelector("img");
        const caption = imgBlock.querySelector(".imageCaption").value;
        const afterText = imgBlock.querySelector(".afterImageText").value;
        const sizeRange = imgBlock.querySelector(".imageSizeRange");
        const sizeVal = sizeRange ? sizeRange.value : "100";
        if (img && img.src && img.style.display !== "none") {
          photoCounter++;
          const fotLabel = prefix
            ? (caption ? `${prefix} ${photoCounter}: ${caption}` : `${prefix} ${photoCounter}`)
            : (caption || "");
          content += `<img src="${img.src}" width="${sizeVal}%"><br>`;
          if (fotLabel) content += `<p class="caption">${fotLabel}</p>`;
          if (afterText.trim()) content += `<p>${afterText.replace(/\n/g, "<br>")}</p>`;
        }
      });
    });

    content += `</ol>`;
    if (ending.trim()) content += `<p class="ending">${ending.replace(/\n/g, "<br>")}</p>`;
    content += `</body></html>`;

    const blob = htmlDocx.asBlob(content);
    saveAs(blob, (titleVal || "instrukcja") + ".docx");

  } catch(e) {
    alert("Błąd podczas eksportu DOCX: " + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "📄 Eksportuj do DOCX (Word)";
  }
});

/* ==========================================
   START – wczytaj zapisany stan
========================================== */
loadState();
if (stepsContainer.querySelectorAll(".stepItem").length === 0) {
  updatePreview();
}
