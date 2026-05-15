document.getElementById("generate").addEventListener("click", () => {
  const title = document.getElementById("title").value;
  const steps = document.getElementById("steps").value.split("\n");

  // Pobieramy ikonę z selecta
  const icon = document.getElementById("iconSelect").value;

  // Dodajemy ikonę do tytułu
  let html = `<h3>${icon} ${title}</h3><ol>`;

  steps.forEach(step => {
    if (step.trim() !== "") {
      html += `<li>${step}</li>`;
    }
  });

  html += "</ol>";

  document.getElementById("output").innerHTML = html;
  document.getElementById("output").className = document.getElementById("templateSelect").value;

});
// Kontenery
const stepsContainer = document.getElementById("stepsContainer");
const output = document.getElementById("output");

// Przycisk dodawania kroku
document.getElementById("addStep").addEventListener("click", () => {
    addStep("");
    updatePreview();
});

// Funkcja dodająca krok
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

    // Obsługa przycisków
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
}

// Funkcja generująca podgląd
function updatePreview() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const template = document.getElementById("templateSelect").value;

    let html = `<h2>${title}</h2>`;
    if (description.trim() !== "") {
        html += `<p>${description}</p>`;
    }

    html += `<ol>`;
    document.querySelectorAll(".stepInput").forEach(input => {
        if (input.value.trim() !== "") {
            html += `<li>${input.value}</li>`;
        }
    });
    html += `</ol>`;

    output.className = template;
    output.innerHTML = html;
}

