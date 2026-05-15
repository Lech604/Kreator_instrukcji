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
/* GLOBAL STYLE */
body {
  margin: 0;
  padding: 0;
  background: #eef1f5;
  font-family: "Segoe UI", Arial, sans-serif;
  color: #333;
}

/* APP LAYOUT */
#app {
  display: flex;
  gap: 25px;
  padding: 25px;
  max-width: 1400px;
  margin: auto;
}

/* LEFT PANEL – EDITOR */
#editor {
  width: 40%;
  background: #ffffff;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #dcdcdc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

#editor h2 {
  margin-top: 0;
  font-size: 22px;
  color: #2a4d8f;
}

#editor label {
  display: block;
  margin-top: 15px;
  font-weight: 600;
}

#editor input,
#editor textarea,
#editor select {
  width: 100%;
  padding: 10px;
  margin-top: 6px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 15px;
  box-sizing: border-box;
}

#editor button {
  margin-top: 10px;
  padding: 10px 14px;
  background: #2a4d8f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

#editor button:hover {
  background: #1f3a6b;
}

/* STEP ITEMS */
.stepItem {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.stepInput {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #bbb;
}

.stepItem button {
  background: #ddd;
  color: #333;
  border-radius: 6px;
  padding: 6px 10px;
}

.stepItem button:hover {
  background: #ccc;
}

/* RIGHT PANEL – PREVIEW */
#preview {
  width: 60%;
  background: #ffffff;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #dcdcdc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

#preview h2 {
  margin-top: 0;
  font-size: 22px;
  color: #2a4d8f;
}

#output {
  margin-top: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #ccc;
}

