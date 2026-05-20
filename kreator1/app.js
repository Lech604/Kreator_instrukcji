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
    window.print();
});

/* ==========================================
   EKSPORT DO DOCX (JSZip + XML)
========================================== */
document.getElementById("exportDOCX").addEventListener("click", async function() {
    const btn = document.getElementById("exportDOCX");
    btn.disabled = true;
    btn.textContent = "⏳ Generuję...";
    try {
        if (typeof JSZip === 'undefined') throw new Error("JSZip nie załadowany. Odśwież stronę.");

        const title  = document.getElementById("title").value || "Instrukcja";
        const desc   = document.getElementById("description").value;
        const ending = document.getElementById("ending").value;
        const prefix = document.getElementById("photoPrefix").value;
        const steps  = document.getElementById("stepsContainer").querySelectorAll(".stepItem");

        function ex(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function para(text, opts){
            opts = opts||{};
            const sz = opts.sz||22;
            const bold = opts.bold?'<w:b/>':'';
            const color = opts.color?`<w:color w:val="${opts.color}"/>`:'';
            const indent = opts.indent?`<w:ind w:left="${opts.indent}"/>`:'';
            const before = opts.before||0;
            const after  = opts.after||80;
            return `<w:p><w:pPr><w:spacing w:before="${before}" w:after="${after}"/>${indent}</w:pPr>
              <w:r><w:rPr>${bold}${color}<w:sz w:val="${sz}"/></w:rPr>
              <w:t xml:space="preserve">${ex(text)}</w:t></w:r></w:p>`;
        }

        let bodyXml = '';
        const imageFiles = [];
        let rIdNum = 10;

        // Tytuł
        bodyXml += `<w:p><w:pPr><w:spacing w:before="0" w:after="200"/>
          <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="2A4D8F"/></w:pBdr></w:pPr>
          <w:r><w:rPr><w:b/><w:color w:val="2A4D8F"/><w:sz w:val="48"/></w:rPr>
          <w:t>${ex(title)}</w:t></w:r></w:p>`;

        // Opis
        if (desc.trim()) {
            desc.split('\n').forEach(line => {
                bodyXml += para(line, {color:'444444', after:60});
            });
            bodyXml += para('', {after:120});
        }

        let stepNum = 0;
        let photoCounter = 0;
        for (const step of steps) {
            stepNum++;
            const stepTitle = step.querySelector(".stepInput").value || ("Krok "+stepNum);
            const stepLong  = step.querySelector(".stepLongText").value;

            bodyXml += para(stepNum+'.   '+stepTitle, {bold:true, sz:28, color:'111827', before:240, after:80});

            if (stepLong.trim()) {
                stepLong.split('\n').forEach(line => {
                    bodyXml += para(line, {color:'444444', sz:22, indent:360, after:60});
                });
            }

            const imgBlocks = step.querySelectorAll(".imageBlock");
            for (const block of imgBlocks) {
                const img     = block.querySelector("img");
                const caption = block.querySelector(".imageCaption").value;
                const after   = block.querySelector(".afterImageText").value;
                if (!img.src || img.style.display==="none") continue;
                photoCounter++;

                const sizePercent = parseInt(img.style.width)||100;
                const cx = Math.round(5486400 * sizePercent / 100);
                const cy = Math.round(cx * 0.65);
                const b64 = img.src.split(',')[1];
                const ext = img.src.startsWith('data:image/png')?'png':'jpeg';
                const rId = 'rId'+rIdNum;
                rIdNum++;
                imageFiles.push({rId, ext, data:b64, idx:photoCounter});

                bodyXml += `<w:p><w:pPr><w:spacing w:before="100" w:after="60"/></w:pPr>
                  <w:r><w:drawing>
                    <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
                      <wp:extent cx="${cx}" cy="${cy}"/>
                      <wp:docPr id="${rIdNum}" name="img${photoCounter}"/>
                      <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                          <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                            <pic:nvPicPr>
                              <pic:cNvPr id="${rIdNum}" name="img${photoCounter}"/>
                              <pic:cNvPicPr/>
                            </pic:nvPicPr>
                            <pic:blipFill>
                              <a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                              <a:stretch><a:fillRect/></a:stretch>
                            </pic:blipFill>
                            <pic:spPr>
                              <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
                              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                            </pic:spPr>
                          </pic:pic>
                        </a:graphicData>
                      </a:graphic>
                    </wp:inline>
                  </w:drawing></w:r></w:p>`;

                const fotLabel = prefix
                    ? (caption?(prefix+' '+photoCounter+': '+caption):(prefix+' '+photoCounter))
                    : caption;
                if (fotLabel) bodyXml += para(fotLabel, {sz:18, color:'666666', after:60});
                if (after.trim()) after.split('\n').forEach(l => { bodyXml += para(l, {sz:22, color:'333333', after:60}); });
            }
        }

        if (ending.trim()) {
            bodyXml += `<w:p><w:pPr><w:spacing w:before="400" w:after="0"/>
              <w:pBdr><w:top w:val="single" w:sz="6" w:space="1" w:color="2A4D8F"/></w:pBdr></w:pPr>
              <w:r><w:rPr><w:b/><w:color w:val="2A4D8F"/><w:sz w:val="26"/></w:rPr>
              <w:t>${ex(ending)}</w:t></w:r></w:p>`;
        }

        // Build ZIP
        const zip = new JSZip();

        const imgCT = imageFiles.map(f=>`<Override PartName="/word/media/img${f.idx}.${f.ext}" ContentType="image/${f.ext==='jpeg'?'jpeg':'png'}"/>`).join('');
        zip.file('[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  ${imgCT}
</Types>`);

        zip.folder('_rels').file('.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

        const imgRels = imageFiles.map(f=>`<Relationship Id="${f.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/img${f.idx}.${f.ext}"/>`).join('');
        zip.folder('word').folder('_rels').file('document.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId_styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  ${imgRels}
</Relationships>`);

        zip.folder('word').file('styles.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/>
    <w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
</w:styles>`);

        zip.folder('word').file('document.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>${bodyXml}
  <w:sectPr>
    <w:pgSz w:w="11906" w:h="16838"/>
    <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>
  </w:sectPr></w:body></w:document>`);

        const media = zip.folder('word').folder('media');
        for (const f of imageFiles) {
            media.file(`img${f.idx}.${f.ext}`, f.data, {base64:true});
        }

        const blob = await zip.generateAsync({type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'instrukcja.docx';
        a.click();

    } catch(err) {
        alert("Błąd: " + err.message);
        console.error(err);
    }
    btn.disabled = false;
    btn.textContent = "📄 Eksportuj do DOCX";
});
