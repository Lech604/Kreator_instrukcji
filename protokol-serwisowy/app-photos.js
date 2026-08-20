// ============================================================================
// APP-PHOTOS.JS — dokumentacja fotograficzna: dodawanie, podgląd, rozmiar
// ============================================================================

var photos = []; // [{b64, caption, size, width, height}]

function handlePhotoDrop(ev){ ev.preventDefault(); handlePhotoFiles(ev.dataTransfer.files); }

// Maksymalny bok zdjęcia po przeskalowaniu (px). Zdjęcia z aparatu/telefonu
// bywają wielokrotnie większe niż realnie potrzeba (kilka-kilkanaście MPx) —
// wstawiane bez zmian znacząco zwiększały rozmiar plików PDF/DOCX. Przeskalowanie
// do rozsądnego rozmiaru przed zapisaniem w pamięci usuwa ten problem.
var PHOTO_MAX_DIM = 1600;

function handlePhotoFiles(files){
  Array.from(files).forEach(file => {
    const r = new FileReader();
    r.onload = function(e){
      const b64 = e.target.result;
      // Wczytaj obraz, żeby poznać jego naturalne proporcje (do eksportu DOCX/PDF)
      // i przeskalować go do rozsądnego rozmiaru przed zapisaniem (patrz PHOTO_MAX_DIM).
      const img = new Image();
      img.onload = function(){
        const naturalW = img.naturalWidth || 800;
        const naturalH = img.naturalHeight || 600;
        const scale = Math.min(1, PHOTO_MAX_DIM / Math.max(naturalW, naturalH));
        const outW = Math.max(1, Math.round(naturalW * scale));
        const outH = Math.max(1, Math.round(naturalH * scale));
        let outB64 = b64;
        try {
          if (scale < 1) {
            const canvas = document.createElement('canvas');
            canvas.width = outW; canvas.height = outH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, outW, outH);
            outB64 = canvas.toDataURL('image/jpeg', 0.85);
          }
        } catch(err) {
          // Np. obraz z innego źródła blokujący odczyt canvasu — w razie
          // błędu zostajemy przy oryginalnym pliku zamiast psuć import.
          outB64 = b64;
        }
        photos.push({ b64: outB64, caption: '', size: 100, width: outW, height: outH });
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
