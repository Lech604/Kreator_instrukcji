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

        steps.forEach(step => {
            const stepTitle = step.querySelector(".stepInput").value;
            const stepLong = nl2br(step.querySelector(".stepLongText").value);

            html += `<li>${stepTitle}</li>`;

            if (stepLong.trim() !== "") {
                html += `<div class="stepLongTextPreview">${stepLong}</div>`;
            }

            // Zdjęcia
            const images = step.querySelectorAll(".imageBlock");
            images.forEach(imgBlock => {
                const img = imgBlock.querySelector("img");
                const caption = imgBlock.querySelector(".imageCaption").value;

                if (img.src && img.style.display !== "none") {
                    html += `
                        <div class="imagePreview">
                            <img src="${img.src}" style="width:${img.style.width || '100%'};">
                            ${caption ? `<p>${caption}</p>` : ""}
                        </div>
                    `;
                }
            });
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
    const element = document.getElementById("output").cloneNode(true);
    element.style.display = "block";
    element.style.width = "100%";

    const opt = {
        margin:       10,
        filename:     'instrukcja.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

 
setTimeout(() => {
    html2pdf().set(opt).from(element).save();
}, 500);
});

});
