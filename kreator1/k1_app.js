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
document.getElementById("exportPDF").addEventListener("click", function() {
    var content = document.getElementById("output").innerHTML;
    var win = window.open("", "_blank", "width=900,height=700");
    if (!win) { alert("Przegladarka zablokovala popup. Zezwol na popupy."); return; }
    var css = 'body{font-family:Segoe UI,Arial,sans-serif;background:#fff;color:#000;}'
        + '.page{max-width:800px;margin:0 auto;padding:20mm 18mm;}'
        + 'ol li{font-weight:700;font-size:18px;margin-bottom:10px;}'
        + '.stepLongTextPreview{font-size:15px;color:#444;margin:6px 0 12px;line-height:1.5;}'
        + '.imagePreview{page-break-inside:avoid;break-inside:avoid;margin-bottom:10px;}'
        + '.imagePreview img{max-width:100%;border-radius:4px;}'
        + '.imagePreview p{font-size:13px;color:#666;margin-top:4px;font-style:italic;}'
        + '.afterImageTextPreview{font-size:15px;color:#333;margin:4px 0 8px;line-height:1.4;}'
        + 'h1{font-size:24px;color:#2a4d8f;border-bottom:2px solid #2a4d8f;padding-bottom:6px;margin-bottom:12px;}'
        + 'h3{font-size:16px;color:#2a4d8f;margin-top:24px;}'
        + 'p{font-size:15px;line-height:1.5;margin-bottom:10px;}'
        + '.no-print{display:block;}'
        + '@media print{@page{size:A4;margin:0mm;}.page{padding:14mm 16mm;}.no-print{display:none!important;}}';
    var html = '<!DOCTYPE html><html><head><meta charset=UTF-8><title>Instrukcja</title>'
        + '<style>'+css+'</style></head><body>'
        + '<div class="no-print" style="background:#2a4d8f;color:#fff;padding:12px 20px;'
        + 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'
        + '<span style="font-size:13px;">Kliknij Drukuj i wybierz Zapisz jako PDF</span>'
        + '<button onclick="window.print()" style="background:#1f7a1f;color:#fff;border:none;'
        + 'padding:8px 20px;border-radius:6px;font-size:13px;cursor:pointer;">Drukuj / PDF</button>'
        + '</div><div class="page">'+content+'</div>'
        + '</body></html>';
    win.document.write(html);
    win.document.close();
    setTimeout(function(){ win.print(); }, 800);
});


/* EKSPORT DO DOCX */
document.getElementById("exportDOCX").addEventListener("click", async function() {
    var btn = document.getElementById("exportDOCX");
    btn.disabled = true;
    btn.textContent = "Generuje...";
    try {
        if (typeof JSZip === "undefined") throw new Error("JSZip nie zaladowany. Odswiez strone.");

        var title  = document.getElementById("title").value || "Instrukcja";
        var desc   = document.getElementById("description").value;
        var ending = document.getElementById("ending").value;
        var prefix = document.getElementById("photoPrefix").value;
        var steps  = document.getElementById("stepsContainer").querySelectorAll(".stepItem");

        function ex(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

        function attr(name, val) { return ' ' + name + '="' + val + '"'; }

        function wp(text, bold, color, sz, indent, before, after) {
            sz=sz||22; before=before||0; after=after||80;
            var b=bold?'<w:b/>':'';
            var c=color?('<w:color w:val="'+color+'"/>'):'';
            var ind=indent?('<w:ind w:left="'+indent+'"/>'):'';
            return '<w:p><w:pPr><w:spacing w:before="'+before+'" w:after="'+after+'"/>'+ind+'</w:pPr>'
                +'<w:r><w:rPr>'+b+c+'<w:sz w:val="'+sz+'"/></w:rPr>'
                +'<w:t xml:space="preserve">'+ex(text)+'</w:t></w:r></w:p>';
        }

        var body="", imageFiles=[], rid=10;

        body+='<w:p><w:pPr><w:spacing w:before="0" w:after="200"/>'
            +'<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="2A4D8F"/></w:pBdr></w:pPr>'
            +'<w:r><w:rPr><w:b/><w:color w:val="2A4D8F"/><w:sz w:val="48"/></w:rPr>'
            +'<w:t>'+ex(title)+'</w:t></w:r></w:p>';

        if (desc.trim()) desc.split("\n").forEach(function(l){ body+=wp(l,false,"444444",22,0,0,60); });

        var sn=0,pc=0;
        for (var i=0;i<steps.length;i++) {
            var step=steps[i]; sn++;
            var st=step.querySelector(".stepInput").value||("Krok "+sn);
            var sl=step.querySelector(".stepLongText").value;
            body+=wp(sn+".   "+st,true,"111827",28,0,240,80);
            if (sl.trim()) sl.split("\n").forEach(function(l){ body+=wp(l,false,"444444",22,360,0,60); });

            var blocks=step.querySelectorAll(".imageBlock");
            for (var j=0;j<blocks.length;j++) {
                var blk=blocks[j];
                var img=blk.querySelector("img");
                var cap=blk.querySelector(".imageCaption").value;
                var aft=blk.querySelector(".afterImageText").value;
                if (!img.src||img.style.display==="none") continue;
                pc++;
                var sp=parseInt(img.style.width)||100;
                var cx=Math.round(5486400*sp/100);
                var nw=img.naturalWidth||800, nh=img.naturalHeight||600;
                var cy=Math.round(cx*(nh/nw));
                var b64=img.src.split(",")[1];
                var ext=img.src.startsWith("data:image/png")?"png":"jpeg";
                var rId="rId"+rid; rid++;
                imageFiles.push({rId:rId,ext:ext,data:b64,idx:pc});

                body+='<w:p><w:pPr><w:spacing w:before="100" w:after="60"/></w:pPr><w:r><w:drawing>'
                    +'<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">'
                    +'<wp:extent cx="'+cx+'" cy="'+cy+'"/>'
                    +'<wp:docPr id="'+rid+'" name="img'+pc+'"/>'
                    +'<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
                    +'<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
                    +'<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
                    +'<pic:nvPicPr><pic:cNvPr id="'+rid+'" name="img'+pc+'"/><pic:cNvPicPr/></pic:nvPicPr>'
                    +'<pic:blipFill><a:blip r:embed="'+rId+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>'
                    +'<a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
                    +'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm>'
                    +'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
                    +'</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';

                var lbl=prefix?(cap?(prefix+" "+pc+": "+cap):(prefix+" "+pc)):cap;
                if (lbl) body+=wp(lbl,false,"666666",18,0,0,60);
                if (aft.trim()) aft.split("\n").forEach(function(l){ body+=wp(l,false,"333333",22,0,0,60); });
            }
        }

        if (ending.trim()) {
            body+='<w:p><w:pPr><w:spacing w:before="400" w:after="0"/>'
                +'<w:pBdr><w:top w:val="single" w:sz="6" w:space="1" w:color="2A4D8F"/></w:pBdr></w:pPr>'
                +'<w:r><w:rPr><w:b/><w:color w:val="2A4D8F"/><w:sz w:val="26"/></w:rPr>'
                +'<w:t>'+ex(ending)+'</w:t></w:r></w:p>';
        }

        var iCT=imageFiles.map(function(f){
            return '<Override PartName="/word/media/img'+f.idx+'.'+f.ext+'" ContentType="image/'+f.ext+'"/>';
        }).join("");
        var iRL=imageFiles.map(function(f){
            return '<Relationship Id="'+f.rId+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/img'+f.idx+'.'+f.ext+'"/>';
        }).join("");

        var zip=new JSZip();
        zip.file("[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            +'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            +'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            +'<Default Extension="xml" ContentType="application/xml"/>'
            +'<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
            +'<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
            +iCT+'</Types>');
        zip.folder("_rels").file(".rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            +'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            +'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
            +'</Relationships>');
        zip.folder("word").folder("_rels").file("document.xml.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            +'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            +'<Relationship Id="rId_styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            +iRL+'</Relationships>');
        zip.folder("word").file("styles.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            +'<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            +'<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/>'
            +'<w:rPr><w:sz w:val="22"/></w:rPr></w:style></w:styles>');
        zip.folder("word").file("document.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            +'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
            +' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
            +' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"'
            +' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
            +' xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
            +'<w:body>'+body
            +'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
            +'<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>'
            +'</w:sectPr></w:body></w:document>');
        var media=zip.folder("word").folder("media");
        imageFiles.forEach(function(f){ media.file("img"+f.idx+"."+f.ext,f.data,{base64:true}); });

        var blob=await zip.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
        var a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download="instrukcja.docx";
        a.click();

    } catch(err){ alert("Blad: "+err.message); console.error(err); }
    btn.disabled=false;
    btn.textContent="Eksportuj do DOCX (Word)";
});
