// =========================
// REFERENCJE DO ELEMENTÓW
// =========================
const stepsContainer = document.getElementById("stepsContainer");
const imagesContainer = document.getElementById("imagesContainer");
const output = document.getElementById("output");

// =========================
// OBSŁUGA PRZYCISKÓW
// =========================
document.getElementById("addStep").addEventListener("click", () => {
    addStep("");
    updatePreview();
});

document.getElementById("addImage").addEventListener("click", () => {
    addImageBlock();
    updatePreview();
});

// =========================
// FUNKCJA: DODAWANIE KROKU
// =========================
function addStep(text) {
    const stepDiv = document.createElement("div");
    stepDiv.className = "stepItem";

    stepDiv.innerHTML = `
        <input type="text" class="stepInput" value="${text}" placeholder="Wpisz krok...">
        <button class="moveUp">↑</button>
        <button class="moveDown">↓</button>
        <button class="deleteStep">🗑</button>
    `;

    stepsContainer.appendChild(stepDiv);

    // Usuwanie kroku
    stepDiv.querySelector(".deleteStep").addEventListener("click", () => {
        stepDiv.remove();
        updatePreview();
    });

    // Przesuwanie w górę
    stepDiv.querySelector(".moveUp").addEventListener("click", () => {
        if (stepDiv.previousElementSibling) {
            stepsContainer.insertBefore(stepDiv, stepDiv.previousElementSibling);
            updatePreview();
        }
    });

    // Przesuwanie w dół
    stepDiv.querySelector(".moveDown").addEventListener("click", () => {
        if (stepDiv.nextElementSibling) {
            stepsContainer.insertBefore(stepDiv.nextElementSibling, stepDiv);
            updatePreview();
        }
    });

    // Aktualizacja podglądu przy pisaniu
    stepDiv.querySelector(".stepInput").addEventListener("input", updatePreview);
}

// =========================
// FUNKCJA: DODAWANIE ZDJĘCIA
// =========================
function addImageBlock() {
    const div = document.createElement("div");
    div.className = "imageBlock";

    div.innerHTML = `
        <input type="file" accept="image/*" class="imageInput">
        <img style="display:none;">
        <input type="text" class="imageCaption" placeholder="Podpis zdjęcia...">
        <button class="moveUp">↑</button>
        <button class="moveDown">↓</button>
        <button class="deleteImage">🗑</button>
    `;

    imagesContainer.appendChild(div);

    const fileInput = div.querySelector(".imageInput");
    const img = div.querySelector("img");

    // Wczytywanie zdjęcia
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = e => {
            img.src = e.target.result;
            img.style.display = "block";
            updatePreview();
        };
        reader.readAsDataURL(file);
    });

    // Podpis zdjęcia
    div.querySelector(".imageCaption").addEventListener("input", updatePreview);

    // Usuwanie zdjęcia
    div.querySelector(".deleteImage").addEventListener("click", () => {
        div.remove();
        updatePreview();
    });

    // Przesuwanie w górę
    div.querySelector(".moveUp").addEventListener("click", () => {
        if (div.previousElementSibling) {
            imagesContainer.insertBefore(div, div.previousElementSibling);
            updatePreview();
        }
    });

    // Przesuwanie w dół
    div.querySelector(".moveDown").addEventListener("click", () => {
        if (div.nextElementSibling) {
            imagesContainer.insertBefore(div.nextElementSibling, div);
            updatePreview();
        }
    });
}

// =========================
// FUNKCJA: GENEROWANIE PODGLĄDU
// =========================
function updatePreview() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const template = document.getElementById("templateSelect").value;

    let html = `<h2>${title}</h2>`;

    if (description.trim() !== "") {
        html += `<p>${description}</p>`;
    }

    // Kroki
    html += `<ol>`;
    document.querySelectorAll(".stepInput").forEach(input => {
        if (input.value.trim() !== "") {
            html += `<li>${input.value}</li>`;
        }
    });
    html += `</ol>`;

    // Zdjęcia
    document.querySelectorAll(".imageBlock").forEach(block => {
        const img = block.querySelector("img").src;
        const caption = block.querySelector(".imageCaption").value;

        if (img) {
            html += `
                <div class="imagePreview">
                    <img src="${img}">
                    ${caption ? `<p><em>${caption}</em></p>` : ""}
                </div>
            `;
        }
    });

    output.className = template;
    output.innerHTML = html;
}

// =========================
// START: dodaj pierwszy krok
// =========================
addStep("");
updatePreview();
