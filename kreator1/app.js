/* ==========================================
   KONWERSJA ENTER → <br>
========================================== */
function nl2br(str) {
    return str.replace(/\n/g, "<br>");
}

/* ==========================================
   REFERENCJE
========================================== */
const stepsContainer = document.getElementById("stepsContainer");
const output = document.getElementById("output");

/* ==========================================
   OBSŁUGA ZMIAN W POLACH GŁÓWNYCH
========================================== */
document.getElementById("title").addEventListener("input", updatePreview);
document.getElementById("description").addEventListener("input", updatePreview);
document.getElementById("ending").addEventListener("input", updatePreview);
document.getElementById("templateSelect").addEventListener("change", updatePreview);
document.getElementById("photoPrefix").addEventListener("change", updatePreview);

/* ==========================================
   DODAWANIE KROKU
========================================== */
document.getElementById("addStep").addEventListener("click", () => {
    addStep("");
    updatePreview();
});

function addStep(text) {
    const stepDiv = document.createElement("div");
    stepDiv.className = "stepItem";

    stepDiv.innerHTML = `
        <div class="stepHeader">
            <input type="text" class="stepInput" value="${text}" placeholder="Wpisz krok...">
            <button class="moveUp">↑</button>
            <button class="moveDown">↓</button>
            <button class="deleteStep">🗑</button>
        </div>

        <textarea class="stepLongText" placeholder="Dodatkowy opis (opcjonalnie)..."></textarea>

        <div class="stepImages"></div>
        <button class="addStepImage">Dodaj zdjęcie</button>
    `;
    stepsContainer.appendChild(stepDiv);

    // Obsługa przycisków kroków
    stepDiv.querySelector(".deleteStep").addEventListener("click", () => {
        stepDiv.remove();
        updatePreview();
    });

    stepDiv.querySelector(".moveUp").addEventListener("click", () => {
        if (stepDiv.previousElementSibling) {
            stepsContainer.insertBefore(stepDiv, stepDiv.previousElementSibling);
            updatePreview();
        }
    });

    stepDiv.querySelector(".moveDown").addEventListener("click", () => {
        if (stepDiv.nextElementSibling) {
            stepsContainer.insertBefore(stepDiv.nextElementSibling, stepDiv);
            updatePreview();
        }
    });

    stepDiv.querySelector(".stepInput").addEventListener("input", updatePreview);
    stepDiv.querySelector(".stepLongText").addEventListener("input", updatePreview);

    // Dodawanie zdjęcia
    stepDiv.querySelector(".addStepImage").addEventListener("click", () => {
        addImageToStep(stepDiv);
    });
}
/* ==========================================
   DODAWANIE ZDJĘCIA DO KROKU
========================================== */
function addImageToStep(stepDiv) {
    const container = stepDiv.querySelector(".stepImages");

    const block = document.createElement("div");
    block.className = "imageBlock";

    block.innerHTML = `
        <input type="file" accept="image/*" class="imageInput">
        <img style="display:none;">
        <input type="text" class="imageCaption" placeholder="Podpis zdjęcia...">

        <div class="imageControls">
            <span class="imageSizeValue">100%</span>
            <button class="imgMinus">➖</button>
            <button class="imgPlus">➕</button>
        </div>

        <textarea class="afterImageText" placeholder="Tekst po zdjęciu (opcjonalnie)..." rows="2"></textarea>
        <button class="deleteImage">Usuń zdjęcie</button>
    `;

    container.appendChild(block);

    const fileInput = block.querySelector(".imageInput");
    const img = block.querySelector("img");

    let size = 100;

    const sizeValue = block.querySelector(".imageSizeValue");
    const minusBtn = block.querySelector(".imgMinus");
    const plusBtn = block.querySelector(".imgPlus");
    // Wczytywanie zdjęcia
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            img.src = e.target.result;
            img.style.display = "block";
            updatePreview();
        };
        reader.readAsDataURL(file);
    });

    // Powiększanie / pomniejszanie
    minusBtn.addEventListener("click", () => {
        if (size > 20) {
            size -= 10;
            img.style.width = size + "%";
            sizeValue.textContent = size + "%";
            updatePreview();
        }
    });

    plusBtn.addEventListener("click", () => {
        if (size < 200) {
            size += 10;
            img.style.width = size + "%";
            sizeValue.textContent = size + "%";
            updatePreview();
        }
    });

    // Usuwanie zdjęcia
    block.querySelector(".deleteImage").addEventListener("click", () => {
        block.remove();
        updatePreview();
    });

    // Podpis zdjęcia
    block.querySelector(".imageCaption").addEventListener("input", updatePreview);
    block.querySelector(".afterImageText").addEventListener("input", updatePreview);
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

    // Tytuł
    if (title.trim() !== "") {
        html += `<h1>${title}</h1>`;
    }

    // Opis
    if (description.trim() !== "") {
        html += `<p>${description}</p>`;
    }

    // Kroki
    const steps = stepsContainer.querySelectorAll(".stepItem");
    if (steps.length > 0) {
        html += "<ol>";

        let photoCounter = 0;

        steps.forEach(step => {
            const stepTitle = step.querySelector(".stepInput").value;
            const stepLong = nl2br(step.querySelector(".stepLongText").value);

            // Sprawdź czy krok ma zdjęcia - jeśli tak, owijamy wszystko w blok avoid-break
            const images = step.querySelectorAll(".imageBlock");
            const hasImages = Array.from(images).some(b => {
                const img = b.querySelector("img");
                return img.src && img.style.display !== "none";
            });

            if (hasImages) {
                html += `<div class="stepBlock">`;
            }

            html += `<li>${stepTitle}</li>`;

            if (stepLong.trim() !== "") {
                html += `<div class="stepLongTextPreview">${stepLong}</div>`;
            }

            // Zdjęcia
            images.forEach(imgBlock => {
                const img = imgBlock.querySelector("img");
                const caption = imgBlock.querySelector(".imageCaption").value;
                const afterText = nl2br(imgBlock.querySelector(".afterImageText").value);

                if (img.src && img.style.display !== "none") {
                    photoCounter++;
                    const prefix = document.getElementById("photoPrefix").value;
                    const fotLabel = prefix
                        ? (caption ? `${prefix} ${photoCounter}: ${caption}` : `${prefix} ${photoCounter}`)
                        : (caption ? caption : "");
                    html += `
                        <div class="imagePreview">
                            <img src="${img.src}" style="width:${img.style.width || '100%'};">
                            ${fotLabel ? `<p class="fotCaption">${fotLabel}</p>` : ""}
                            ${afterText ? `<div class="afterImageTextPreview">${afterText}</div>` : ""}
                        </div>
                    `;
                }
            });

            if (hasImages) {
                html += `</div>`;
            }
        });

        html += "</ol>";
    }

    // Zakończenie
    if (ending.trim() !== "") {
        html += `<h3>${ending}</h3>`;
    }

    output.innerHTML = html;
}
/* ==========================================
   EKSPORT DO PDF
========================================== */
document.getElementById("exportPDF").addEventListener("click", () => {
    const element = document.getElementById("output");

    const opt = {
        margin:       [15, 15, 15, 15],
        filename:     'instrukcja.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  {
            scale: 2,
            useCORS: false,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).toPdf().get('pdf').then(pdf => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            pdf.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        }
    }).save();
});

/* ==========================================
   EKSPORT DO DOCX
========================================== */
document.getElementById("exportDOCX").addEventListener("click", async () => {
    const btn = document.getElementById("exportDOCX");
    btn.disabled = true;
    btn.textContent = "⏳ Generuję DOCX...";

    try {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel,
                ImageRun, AlignmentType, BorderStyle, ShadingType,
                NumberingFormat } = window.docx;

        const title     = document.getElementById("title").value || "Instrukcja";
        const desc      = document.getElementById("description").value;
        const ending    = document.getElementById("ending").value;
        const prefix    = document.getElementById("photoPrefix").value;
        const steps     = document.getElementById("stepsContainer").querySelectorAll(".stepItem");

        const children = [];

        // ── Tytuł ──
        children.push(new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 44, font: "Segoe UI", color: "2A4D8F" })],
            spacing: { after: 200 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2A4D8F" } },
        }));

        // ── Opis ──
        if (desc.trim()) {
            children.push(new Paragraph({
                children: [new TextRun({ text: desc, size: 24, font: "Segoe UI", color: "444444" })],
                spacing: { after: 300 },
            }));
        }

        // ── Kroki ──
        let photoCounter = 0;
        let stepNum = 0;
        for (const step of steps) {
            stepNum++;
            const stepTitle = step.querySelector(".stepInput").value || `Krok ${stepNum}`;
            const stepLong  = step.querySelector(".stepLongText").value;

            // Numer + tytuł kroku
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: `${stepNum}.  `, bold: true, size: 28, font: "Segoe UI", color: "111827" }),
                    new TextRun({ text: stepTitle, bold: true, size: 28, font: "Segoe UI", color: "111827" }),
                ],
                spacing: { before: 280, after: 80 },
            }));

            // Dodatkowy opis
            if (stepLong.trim()) {
                children.push(new Paragraph({
                    children: [new TextRun({ text: stepLong, size: 22, font: "Segoe UI", color: "444444" })],
                    spacing: { after: 120 },
                }));
            }

            // Zdjęcia
            const imgBlocks = step.querySelectorAll(".imageBlock");
            for (const block of imgBlocks) {
                const img     = block.querySelector("img");
                const caption = block.querySelector(".imageCaption").value;
                const after   = block.querySelector(".afterImageText").value;

                if (!img.src || img.style.display === "none") continue;
                photoCounter++;

                try {
                    // Convert base64 to Uint8Array
                    const b64 = img.src.split(",")[1];
                    const byteStr = atob(b64);
                    const arr = new Uint8Array(byteStr.length);
                    for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);

                    // Size from img.style.width percentage
                    const sizePercent = parseInt(img.style.width) || 100;
                    const maxW = 580; // points approx full width
                    const w = Math.round(maxW * sizePercent / 100);
                    const h = Math.round(w * 0.65); // estimate aspect ratio

                    children.push(new Paragraph({
                        children: [new ImageRun({ data: arr, transformation: { width: w, height: h }, type: "png" })],
                        spacing: { before: 100, after: 60 },
                    }));
                } catch(imgErr) { console.warn("Image error:", imgErr); }

                // Podpis
                const fotLabel = prefix
                    ? (caption ? `${prefix} ${photoCounter}: ${caption}` : `${prefix} ${photoCounter}`)
                    : caption;
                if (fotLabel) {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: fotLabel, size: 18, italics: true, color: "666666", font: "Segoe UI" })],
                        spacing: { after: 60 },
                    }));
                }

                // Tekst po zdjęciu
                if (after.trim()) {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: after, size: 22, font: "Segoe UI", color: "333333" })],
                        spacing: { after: 100 },
                    }));
                }
            }
        }

        // ── Zakończenie ──
        if (ending.trim()) {
            children.push(new Paragraph({
                children: [new TextRun({ text: ending, bold: true, size: 26, font: "Segoe UI", color: "2A4D8F" })],
                spacing: { before: 400, after: 200 },
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: "2A4D8F" } },
            }));
        }

        const doc = new Document({
            creator: "Kreator Instrukcji – Uniwersalny",
            title,
            sections: [{ properties: {}, children }],
        });

        const blob = await Packer.toBlob(doc);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "instrukcja.docx";
        a.click();

    } catch(err) {
        alert("Błąd generowania DOCX: " + err.message);
        console.error(err);
    }

    btn.disabled = false;
    btn.textContent = "📄 Eksportuj do DOCX (Word)";
});
