document.getElementById("generate").addEventListener("click", () => {
  const title = document.getElementById("title").value;
  const steps = document.getElementById("steps").value.split("\n");

  let html = `<h3>${title}</h3><ol>`;

  steps.forEach(step => {
    if (step.trim() !== "") {
      html += `<li>${step}</li>`;
    }
  });

  html += "</ol>";

  document.getElementById("output").innerHTML = html;
});
