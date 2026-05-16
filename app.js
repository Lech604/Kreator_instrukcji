// ==========================================
// KONWERSJA ENTER → <br>
// ==========================================
function nl2br(str) {
    return str.replace(/\n/g, "<br>");
}

// ==========================================
// REFERENCJE
// ==========================================
const stepsContainer = document.getElementById("stepsContainer");
const output = document.getElementById("output");

// ==========================================
// OBSŁUGA ZMIAN W POLACH GŁÓWNYCH
// ==========================================
document.getElementById("title").addEventListener("input", updatePreview);
document.getElementById("description").addEventListener("input", updatePreview);
document.getElementById("ending").addEventListener("input", updatePreview);
document.getElementById("templateSelect").addEventListener("change", updatePreview);

// ==========================================
// DODAWANIE KROKU
// ==========================================
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

// ==========================================
// DODAWANIE ZDJĘCIA DO KROKU
// ==========================================
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

    // Zmniejszanie zdjęcia
    minusBtn.addEventListener("click", () => {
        size = Math.max(30, size - 10);
        img.style.width = size + "%";
        sizeValue.textContent = size + "%";
        updatePreview();
    });

    // Powiększanie zdjęcia
    plusBtn.addEventListener("click", () => {
        size = Math.min(200, size + 10);
        img.style.width = size + "%";
        sizeValue.textContent = size + "%";
        updatePreview();
    });

    // Wczytywanie zdjęcia
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = e => {
            img.src = e.target.result;
            img.style.display = "block";
            img.style.width = size + "%";
            updatePreview();
        };
        reader.readAsDataURL(file);
    });

    block.querySelector(".imageCaption").addEventListener("input", updatePreview);

    block.querySelector(".deleteImage").addEventListener("click", () => {
        block.remove();
        updatePreview();
    });
}

// ==========================================
// PODGLĄD
// ==========================================
function updatePreview() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const ending = document.getElementById("ending").value;
    const template = document.getElementById("templateSelect").value;

    let html = "";

    if (title.trim()) html += `<h2>${title}</h2>`;
    if (description.trim()) html += `<p>${nl2br(description)}</p>`;

    html += `<ol>`;

    document.querySelectorAll(".stepItem").forEach(step => {
        const text = step.querySelector(".stepInput").value.trim();
        const longText = step.querySelector(".stepLongText").value.trim();

        html += `<li>${text}`;

        if (longText) {
            html += `<div class="stepLongTextPreview">${nl2br(longText)}</div>`;
        }

        // Zdjęcia
        const images = step.querySelectorAll(".imageBlock img");
        const captions = step.querySelectorAll(".imageCaption");
        const sizes = step.querySelectorAll(".imageSizeValue");

        images.forEach((img, i) => {
            if (img.src) {
                const size = sizes[i].textContent.replace("%", "");

                html += `
                    <div class="imagePreview">
                        <img src="${img.src}" style="width:${size}%;">
                        ${captions[i].value ? `<p><em>${captions[i].value}</em></p>` : ""}
                    </div>
                `;
            }
        });

        html += `</li>`;
    });

    html += `</ol>`;

    if (ending.trim()) {
        html += `<hr><h3>Zakończenie instrukcji</h3><p>${nl2br(ending)}</p>`;
    }

    output.className = template;
    output.innerHTML = html;
}

// ==========================================
// EKSPORT DO PDF
// ==========================================
document.getElementById("exportPDF").addEventListener("click", () => {
    const element = document.getElementById("output");

    const opt = {
        margin: 10,
        filename: 'instrukcja.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
});

// ==========================================
// START
// ==========================================
addStep("");
updatePreview();
