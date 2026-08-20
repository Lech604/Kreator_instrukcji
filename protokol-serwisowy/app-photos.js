// ============================================================================
// APP-PHOTOS.JS — dokumentacja fotograficzna: dodawanie, podgląd, rozmiar
// ============================================================================

var photos = []; // [{b64, caption, size, width, height}]

function handlePhotoDrop(ev){ ev.preventDefault(); handlePhotoFiles(ev.dataTransfer.files); }

function handlePhotoFiles(files){
  Array.from(files).forEach(file => {
    const r = new FileReader();
    r.onload = function(e){
      const b64 = e.target.result;
      // Wczytaj obraz, żeby poznać jego naturalne proporcje (do eksportu DOCX/PDF)
      const img = new Image();
      img.onload = function(){
        photos.push({ b64: b64, caption: '', size: 100, width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
        renderPhotos();
      };
      img.onerror = function(){
        photos.push({ b64: b64, caption: '', size: 100, width: 800, height: 600 });
        renderPhotos();
      };
      img.src = b64;
    };
    r.readAsDataURL(file);
  });
}

function renderPhotos(){
  const grid = document.getElementById('photos-grid');
  grid.innerHTML = '';
  photos.forEach(function(p, i){
    const div = document.createElement('div');
    div.className = 'photo-thumb';
    div.innerHTML = '<img src="'+p.b64+'">'
      +'<button class="photo-thumb-rm" onclick="removePhoto('+i+')">×</button>'
      +'<div class="photo-cap"><input placeholder="Podpis..." value="'+escHtml(p.caption)+'" oninput="photos['+i+'].caption=this.value"></div>'
      +'<div class="photo-size-row" title="Rozmiar zdjęcia w eksporcie PDF/DOCX">'
      +'<input type="range" min="20" max="100" step="5" value="'+(p.size||100)+'" oninput="photos['+i+'].size=parseInt(this.value,10);this.nextElementSibling.textContent=this.value+\'%\'">'
      +'<span class="photo-size-label">'+(p.size||100)+'%</span>'
      +'</div>';
    grid.appendChild(div);
  });
}

function removePhoto(i){ photos.splice(i,1); renderPhotos(); }
