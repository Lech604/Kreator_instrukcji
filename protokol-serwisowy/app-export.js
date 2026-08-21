// ============================================================================
// APP-EXPORT.JS — generowanie podglądu do druku/PDF oraz eksport DOCX
// ============================================================================

// ── BUILD PRINT HTML ─────────────────────────────────────────────────────────
function buildPrintHTML(){
  const d = collectData();
  const sameAddr = document.getElementById('same-address').checked;
  const faktura = d.faktura === 'stanowi'
    ? 'stanowi podstawę wystawienia faktury VAT'
    : d.faktura === 'nie-stanowi'
    ? 'nie stanowi podstawy wystawienia faktury VAT'
    : '___________________________';

  const photosHTML = photos.map(function(p, i){
    const sizePct = p.size || 100;
    return '<div class="avoid-break" style="margin-bottom:12px">'
      +'<img src="'+p.b64+'" style="max-width:'+sizePct+'%;max-height:180mm;object-fit:contain;border-radius:4px;display:block;margin:0 auto">'
      +(p.caption ? '<p style="font-size:9pt;color:#555;margin-top:4px;font-style:italic;text-align:center">Fot. '+(i+1)+': '+escHtml(p.caption)+'</p>' : '')
      +'</div>';
  }).join('');

  const objSection = sameAddr
    ? '<p style="color:#555;font-size:10pt;font-style:italic">Tożsame z danymi zgłaszającego</p>'
    : '<p>'+escHtml(d.objNazwa)+(d.objBudynek?' / '+escHtml(d.objBudynek):'')+'</p>'
      +(d.objUlica?'<p>'+escHtml(d.objUlica)+'</p>':'')
      +(d.objMiejscowosc?'<p>'+escHtml(d.objMiejscowosc)+'</p>':'');

  return '<div style="font-family:Arial,sans-serif;font-size:11pt;color:#000;max-width:800px;margin:0 auto">'

    // Header
    +'<div class="avoid-break-after" style="background:#1a1a2e;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;margin-bottom:0">'
    +'<div style="font-size:18pt;font-weight:700">Protokół wykonania usługi serwisowej</div>'
    +'<div style="font-size:10pt;color:#e8b84b;margin-top:4px">Prolight Solutions Sp. z o.o.</div>'
    +'</div>'

    // Table
    +'<table style="width:100%;border-collapse:collapse;border:1px solid #374151">'

    // Dane zgłaszającego
    +'<tr><td style="background:#f0f2f5;font-weight:700;padding:8px 12px;border:1px solid #d1d5db;width:180px;vertical-align:top;font-size:10pt">Dane zgłaszającego</td>'
    +'<td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top">'
    +'<strong>'+escHtml(d.zglFirma)+'</strong>'
    +(d.zglBudynek?'<br>'+escHtml(d.zglBudynek):'')
    +(d.zglUlica?'<br>'+escHtml(d.zglUlica):'')
    +(d.zglMiejscowosc?'<br>'+escHtml(d.zglMiejscowosc):'')
    +(d.zglOsoba?'<br>Osoba: '+escHtml(d.zglOsoba):'')
    +(d.zglKontakt?'<br>Kontakt: '+escHtml(d.zglKontakt):'')
    +'</td></tr>'

    // Dane obiektu
    +'<tr><td style="background:#f0f2f5;font-weight:700;padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;font-size:10pt">Dane obiektu</td>'
    +'<td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top">'+objSection+'</td></tr>'

    // Daty
    +'<tr><td style="background:#f0f2f5;font-weight:700;padding:8px 12px;border:1px solid #d1d5db;font-size:10pt">Daty realizacji</td>'
    +'<td style="padding:8px 12px;border:1px solid #d1d5db">'
    +'Rozpoczęcie: <strong>'+fmtDate(d.dataStart)+'</strong>&nbsp;&nbsp;&nbsp;'
    +'Zakończenie: <strong>'+fmtDate(d.dataEnd)+'</strong>'
    +(d.nrZlecenia?'&nbsp;&nbsp;&nbsp;Nr zlecenia: <strong>'+escHtml(d.nrZlecenia)+'</strong>':'')
    +'</td></tr>'

    // Prace
    +'<tr><td style="background:#f0f2f5;font-weight:700;padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;font-size:10pt">Wykonane prace</td>'
    +'<td style="padding:8px 12px;border:1px solid #d1d5db;line-height:1.6;vertical-align:top">'+escHtml(d.praceOpis).replace(/\n/g,'<br>')+'</td></tr>'

    // Materiały
    +(d.materialy?'<tr><td style="background:#f0f2f5;font-weight:700;padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;font-size:10pt">Użyte materiały</td>'
    +'<td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top">'+escHtml(d.materialy).replace(/\n/g,'<br>')+'</td></tr>':'')

    // Uwagi
    +(d.uwagi?'<tr><td style="background:#f0f2f5;font-weight:700;padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;font-size:10pt">Uwagi / zalecenia</td>'
    +'<td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top">'+escHtml(d.uwagi).replace(/\n/g,'<br>')+'</td></tr>':'')

    // Odbiór
    +'<tr><td style="background:#f0f2f5;font-weight:700;padding:8px 12px;border:1px solid #d1d5db;font-size:10pt">Data odbioru</td>'
    +'<td style="padding:8px 12px;border:1px solid #d1d5db"><strong>'+fmtDate(d.dataOdbioru)+'</strong></td></tr>'

    // Faktura
    +'<tr><td style="background:#f0f2f5;font-weight:700;padding:8px 12px;border:1px solid #d1d5db;font-size:10pt">Faktura VAT</td>'
    +'<td style="padding:8px 12px;border:1px solid #d1d5db">Niniejszy protokół <strong>'+faktura+'</strong>.</td></tr>'

    +'</table>'

    // Zdjęcia
    +(photos.length?'<div style="margin-top:20px"><div class="avoid-break-after" style="font-weight:700;font-size:12pt;margin-bottom:10px;color:#1a1a2e;border-bottom:2px solid #1a1a2e;padding-bottom:4px">Dokumentacja fotograficzna</div>'+photosHTML+'</div>':'')

    // Podpisy
    +'<div class="avoid-break" style="margin-top:24px">'
    +'<div style="font-weight:700;font-size:12pt;margin-bottom:14px;color:#1a1a2e;border-bottom:2px solid #1a1a2e;padding-bottom:4px">Protokół sporządzono w dwóch jednobrzmiących egzemplarzach</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">'
    +'<div class="avoid-break" style="border:1px solid #d1d5db;border-radius:6px;padding:14px">'
    +'<div style="font-size:9pt;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Osoba uprawniona do odbioru</div>'
    +'<div style="font-size:11pt;margin-bottom:4px">'+escHtml(d.sigOdbiorca)+'</div>'
    +'<div style="border-top:1px solid #374151;margin-top:40px;padding-top:6px;font-size:9pt;color:#6b7280">Podpis / pieczęć</div>'
    +'</div>'
    +'<div class="avoid-break" style="border:1px solid #d1d5db;border-radius:6px;padding:14px">'
    +'<div style="font-size:9pt;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Wykonawca</div>'
    +'<div style="font-size:11pt;margin-bottom:4px">'+escHtml(d.sigWykonawca)+'</div>'
    +(d.sigWykonawcaOsoba?'<div style="font-size:10pt;color:#374151;margin-bottom:4px">'+escHtml(d.sigWykonawcaOsoba)+'</div>':'')
    +'<div style="font-size:10pt;color:#374151;margin-bottom:4px">'+fmtDate(d.sigDataWyk)+'</div>'
    +'<div style="border-top:1px solid #374151;margin-top:40px;padding-top:6px;font-size:9pt;color:#6b7280">Podpis</div>'
    +'</div>'
    +'</div>'
    +'</div>'

    +'</div>';
}

// ── EXPORT PDF ────────────────────────────────────────────────────────────────
// Generuje PDF bezpośrednio w przeglądarce (html2pdf.js / jsPDF), z własną
// stopką "Strona X z Y". Dzięki temu PDF nie zależy od okna drukowania
// przeglądarki — nie pojawia się w nim natywna stopka Chrome z adresem URL.
async function exportPDF(){
  const btn = document.getElementById('btn-pdf');
  if (typeof html2pdf === 'undefined'){
    alert('Biblioteka do generowania PDF nie została załadowana (sprawdź połączenie z internetem).');
    return;
  }
  const origText = btn ? btn.textContent : '';
  if (btn){ btn.disabled = true; btn.textContent = 'Generuję...'; }

  const holder = document.getElementById('print-content');
  const wrap = document.getElementById('preview-container');
  const prevHolderStyle = holder.getAttribute('style') || '';
  const prevWrapStyle = wrap.getAttribute('style') || '';

  try {
    const content = buildPrintHTML();
    // UWAGA: celowo NIE ustawiamy tu CSS "break-inside:avoid" /
    // "page-break-inside:avoid" (mimo że taka była wcześniejsza wersja tego
    // kodu). Okazało się, że html2canvas ma błąd w obsłudze tych właściwości
    // — ich obecność na dużych elementach (np. zdjęciach) powoduje, że
    // kolejne takie elementy są rysowane w kompletnie złej pozycji na
    // canvasie (przesunięcie rzędu setek-tysięcy pikseli, potwierdzone
    // eksperymentalnie). Same klasy "avoid-break"/"avoid-break-after"
    // zostają w HTML-u — są potrzebne wyłącznie jako znaczniki dla naszej
    // własnej, ręcznej logiki podziału na strony (patrz noBreakZones
    // poniżej), która i tak w pełni zastępuje CSS-owe dzielenie stron.
    const helperCss = '<style>'
      +'table{border-collapse:collapse;width:100%}'
      +'</style>';
    holder.innerHTML = helperCss + content;

    // Kontener na pełnym ekranie (position:fixed;inset:0) nad resztą
    // interfejsu — sprawdzone doświadczalnie jako niezawodny sposób na
    // poprawne przechwycenie treści przez html2canvas (element zepchnięty
    // poza widoczny obszar ujemnym marginesem bywał renderowany jako pusty
    // lub przycięty).
    wrap.style.cssText = 'display:block;position:fixed;inset:0;z-index:99999;background:#fff;overflow:auto';
    holder.style.cssText = 'box-sizing:border-box;width:800px;margin:0 auto;background:#fff;font-family:Arial,sans-serif;color:#000;font-size:11pt';
    window.scrollTo(0, 0);
    // Dajemy przeglądarce dwie klatki na przeliczenie layoutu i namalowanie
    // nowo ustawionych stylów, zanim html2canvas zacznie przechwytywać —
    // bez tego bywało, że przechwytywał układ sprzed zmiany, co dawało
    // niespójne, przycięte renderowanie.
    await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });

    // html2canvas potrafi błędnie wykryć obszar do przechwycenia (przycinać
    // treść) w zależności od układu strony — dlatego jawnie podajemy
    // dokładny, zmierzony prostokąt elementu zamiast polegać na automatyce.
    const rect = holder.getBoundingClientRect();
    const scale = 2;
    // Mały bufor (w pikselach CSS) doklejany do szerokości przechwytywanego
    // obszaru. html2canvas przy elementach, których prawa krawędź (np.
    // obramowanie ramki) pokrywa się DOKŁADNIE z prawą krawędzią
    // przechwytywanego obszaru (zero marginesu), potrafi tę krawędź
    // przyciąć/pominąć — potwierdzone eksperymentalnie na polu "Wykonawca"
    // (znikało prawe obramowanie ramki, niezależnie od obecności zdjęć).
    // Przechwytywanie odrobinę szerszego obszaru niż realna treść daje
    // wystarczający margines, żeby taka krawędź zawsze mieściła się w
    // całości na canvasie; dodatkowy pasek jest czystym białym tłem, więc
    // jest niezauważalny w wyniku.
    // UWAGA: na Safari ten sam problem okazał się dotyczyć WIĘCEJ elementów
    // naraz (obramowania całej tabeli i obu pól podpisu, nie tylko pola
    // "Wykonawca") — bufor 8px, wystarczający na Chrome, tam nie wystarczał.
    // Zwiększony do 24px jako bezpieczny margines z zapasem (dodatkowe białe
    // tło nadal jest niezauważalne w wyniku).
    const captureWidthBuffer = 24;

    // Zbieramy strefy elementów, których nie chcemy przecinać w poprzek
    // granicy stron (sekcje oznaczone "avoid-break" — w tym pojedyncze
    // pola podpisu — oraz wiersze tabeli). Pozycje liczymy względem górnej
    // krawędzi holdera i przeliczamy na układ współrzędnych canvasu (skala).
    // To robimy PRZED przechwyceniem canvasu, na tym samym, jeszcze
    // niezmienionym układzie strony co przy renderowaniu.
    const noBreakZones = Array.from(holder.querySelectorAll('.avoid-break, tr')).map(function(el){
      const r = el.getBoundingClientRect();
      return {
        top: (r.top - rect.top) * scale,
        bottom: (r.bottom - rect.top) * scale
      };
    }).filter(function(z){ return z.bottom > z.top; });

    // Przechwytujemy CAŁĄ treść jako jeden długi canvas. Wbudowany
    // mechanizm dzielenia na strony w html2pdf.js (toPdf()) potrafił błędnie
    // przeliczać skalowanie przy niestandardowych marginesach i przycinał
    // treść po prawej stronie — dlatego stronicowanie i tak liczymy sami
    // poniżej, na podstawie tego (poprawnego) canvasu.
    const canvas = await html2pdf().set({
      html2canvas: {
        scale: scale, useCORS: true, backgroundColor: '#ffffff',
        x: rect.left, y: rect.top, width: rect.width + captureWidthBuffer, height: rect.height
      }
    }).from(holder).toCanvas().get('canvas');

    // Docinamy strefy do faktycznej wysokości canvasu (drobne różnice
    // zaokrągleń mogłyby inaczej wywołać zbędną, prawie pustą stronę na końcu).
    noBreakZones.forEach(function(z){
      z.top = Math.max(0, Math.min(z.top, canvas.height));
      z.bottom = Math.max(0, Math.min(z.bottom, canvas.height));
    });

    // Marginesy strony PDF (mm) — góra/lewo/dół/prawo. Dół jest większy,
    // żeby zostawić miejsce na stopkę z numeracją stron.
    const M = { top: 16, left: 14, bottom: 20, right: 14 };
    const PAGE_W = 210, PAGE_H = 297; // A4 w mm
    const contentWmm = PAGE_W - M.left - M.right;
    const contentHmm = PAGE_H - M.top - M.bottom;
    const pxPerMm = canvas.width / contentWmm;
    const sliceHeightPx = Math.max(1, Math.floor(contentHmm * pxPerMm));

    // html2canvas mierzy i zawija tekst nieco inaczej niż natywny silnik
    // layoutu przeglądarki (na którym opieramy się przy getBoundingClientRect),
    // więc granice elementów bywają przesunięte o kilka-kilkanaście pikseli.
    // Doliczamy margines bezpieczeństwa (~1 linia tekstu), żeby nie wpaść w
    // sytuację, w której element "prawie się mieści" wg pomiaru DOM, a w
    // praktyce i tak zostaje przycięty przez faktyczne renderowanie canvasu.
    const zoneSafetyPx = 24 * scale;

    // Wyznaczamy granice kolejnych stron: domyślnie co "sliceHeightPx", ale
    // jeśli taka granica wypadłaby w środku elementu z listy "nie dziel",
    // cofamy ją do początku tego elementu — przenosi się on wtedy w całości
    // na kolejną stronę (o ile sam nie jest wyższy niż jedna strona — wtedy
    // i tak trzeba go przeciąć, więc granica zostaje bez zmian).
    const pageEnds = [];
    let cursor = 0;
    let guardTotal = 0;
    while (cursor < canvas.height && guardTotal < 500){
      guardTotal++;
      // Naturalna granica strony — bez uwzględnienia stref "nie dziel".
      // Strefy sprawdzamy WYŁĄCZNIE względem tej stałej granicy (a nie
      // względem już przesuniętej), żeby uniknąć efektu domina: cofnięcie
      // granicy z powodu jednej (późniejszej) strefy nie może dodatkowo
      // "wypychać" wcześniejszej strefy, która przy naturalnej granicy
      // mieściła się bez problemu — inaczej strona zostaje niepotrzebnie
      // niemal pusta.
      const naturalEnd = Math.min(cursor + sliceHeightPx, canvas.height);
      let pageEnd = naturalEnd;
      for (let zi = 0; zi < noBreakZones.length; zi++){
        const z = noBreakZones[zi];
        // Przenosimy element w całości na kolejną stronę tylko, gdy
        // faktycznie zmieści się on w całości na jednej stronie — w
        // przeciwnym razie i tak trzeba go przeciąć, więc przesuwanie
        // tylko marnowałoby miejsce na bieżącej stronie.
        const zBottomBuffered = Math.min(z.bottom + zoneSafetyPx, canvas.height);
        if (z.top > cursor && z.top < naturalEnd && zBottomBuffered > naturalEnd && (zBottomBuffered - z.top) <= sliceHeightPx){
          pageEnd = Math.min(pageEnd, z.top);
        }
      }
      pageEnds.push(pageEnd);
      cursor = pageEnd;
    }

    // html2pdf.js (a więc i jsPDF) nie eksponuje swojego konstruktora jako
    // globalnej zmiennej — pobieramy gotową, poprawnie skonfigurowaną
    // instancję jsPDF przy pomocy niewielkiego, tymczasowego elementu, a
    // następnie zastępujemy jego jedyną stronę własnymi, poprawnie
    // wyciętymi obrazami.
    const dummy = document.createElement('div');
    dummy.style.cssText = 'width:1px;height:1px;overflow:hidden';
    document.body.appendChild(dummy);
    const pdf = await html2pdf().set({ jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
      .from(dummy).toPdf().get('pdf');
    document.body.removeChild(dummy);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    const sctx = sliceCanvas.getContext('2d');

    let prevEnd = 0;
    for (let i = 0; i < pageEnds.length; i++){
      const startPx = Math.round(prevEnd);
      const thisSliceHeightPx = Math.max(1, Math.round(pageEnds[i]) - startPx);
      sliceCanvas.height = thisSliceHeightPx;
      sctx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      sctx.drawImage(canvas, 0, startPx, canvas.width, thisSliceHeightPx, 0, 0, canvas.width, thisSliceHeightPx);
      const imgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
      const thisSliceHmm = thisSliceHeightPx / pxPerMm;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', M.left, M.top, contentWmm, thisSliceHmm);
      prevEnd = pageEnds[i];
    }
    pdf.deletePage(1); // usuwamy pustą stronę startową (z elementu-atrapy)

    // Własna stopka z numeracją stron (bez adresu URL, bez zależności od
    // ustawień "Nagłówki i stopki" przeglądarki).
    const totalP = pdf.internal.getNumberOfPages();
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    for (let i = 1; i <= totalP; i++){
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text('Strona ' + i + ' z ' + totalP, pageW / 2, pageH - 10, { align: 'center' });
    }

    pdf.save('protokol-serwisowy.pdf');
  } catch(err){
    alert('Błąd generowania PDF: ' + err.message);
    console.error(err);
  } finally {
    holder.innerHTML = '';
    holder.setAttribute('style', prevHolderStyle);
    wrap.setAttribute('style', prevWrapStyle);
    if (btn){ btn.disabled = false; btn.textContent = origText; }
  }
}

// ── EXPORT DOCX ─────────────────────────────────────────────────────────────
// Oblicza rozmiar obrazka (w EMU) zachowując proporcje i uwzględniając suwak rozmiaru
function computeImageEmu(photo){
  var maxWidthIn = 6, maxHeightIn = 8; // maksymalny obszar strony
  var pxW = photo.width || 800, pxH = photo.height || 600;
  var ratio = pxH / pxW;
  var sizePct = (photo.size || 100) / 100;
  var widthIn = maxWidthIn * sizePct;
  var heightIn = widthIn * ratio;
  if (heightIn > maxHeightIn) { heightIn = maxHeightIn; widthIn = heightIn / ratio; }
  return { cx: Math.round(widthIn * 914400), cy: Math.round(heightIn * 914400) };
}

async function exportDOCX(){
  const btn = document.getElementById('btn-docx');
  btn.disabled = true; btn.textContent = 'Generuję...';
  try {
    if (typeof JSZip === 'undefined') throw new Error('JSZip nie zaladowany.');
    const d = collectData();
    const sameAddr = document.getElementById('same-address').checked;
    const faktura = d.faktura === 'stanowi'
      ? 'stanowi podstawę wystawienia faktury VAT'
      : d.faktura === 'nie-stanowi'
      ? 'nie stanowi podstawy wystawienia faktury VAT'
      : '';

    function ex(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function row(label, value){
      return '<w:tr><w:trPr><w:cantSplit/></w:trPr>'
        +'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F0F2F5"/><w:tcW w:w="2500" w:type="dxa"/></w:tcPr>'
        +'<w:p><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>'+ex(label)+'</w:t></w:r></w:p></w:tc>'
        +'<w:tc><w:p>'+value+'</w:p></w:tc>'
        +'</w:tr>';
    }
    function txt(s, bold){ return '<w:r>'+(bold?'<w:rPr><w:b/></w:rPr>':'')+'<w:t xml:space="preserve">'+ex(s)+'</w:t></w:r>'; }
    function para(text, bold, sz, color){
      sz=sz||22; var b=bold?'<w:b/>':''; var c=color?('<w:color w:val="'+color+'"/>'):'';
      return '<w:p><w:r><w:rPr>'+b+c+'<w:sz w:val="'+sz+'"/></w:rPr><w:t xml:space="preserve">'+ex(text)+'</w:t></w:r></w:p>';
    }

    var imageFiles=[], rid=20;
    var body='';

    // Title
    body+='<w:p><w:pPr><w:spacing w:after="100"/>'
      +'<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="1A1A2E"/></w:pBdr></w:pPr>'
      +'<w:r><w:rPr><w:b/><w:sz w:val="40"/><w:color w:val="1A1A2E"/></w:rPr>'
      +'<w:t>Protokół wykonania usługi serwisowej</w:t></w:r></w:p>';
    body+='<w:p><w:r><w:rPr><w:sz w:val="20"/><w:color w:val="7C6A1E"/></w:rPr>'
      +'<w:t>Prolight Solutions Sp. z o.o.</w:t></w:r></w:p>';
    body+='<w:p><w:pPr><w:spacing w:after="200"/></w:pPr></w:p>';

    // Table
    var zglVal = txt(d.zglFirma,true)+'<w:r><w:br/></w:r>'+txt(d.zglBudynek)+'<w:r><w:br/></w:r>'+txt(d.zglUlica)+'<w:r><w:br/></w:r>'+txt(d.zglMiejscowosc)
      +(d.zglOsoba?'<w:r><w:br/></w:r>'+txt('Osoba: '+d.zglOsoba):'')
      +(d.zglKontakt?'<w:r><w:br/></w:r>'+txt('Kontakt: '+d.zglKontakt):'');

    var objVal = sameAddr ? txt('Tożsame z danymi zgłaszającego')
      : txt(d.objNazwa+(d.objBudynek?' / '+d.objBudynek:''),true)+'<w:r><w:br/></w:r>'+txt(d.objUlica)+'<w:r><w:br/></w:r>'+txt(d.objMiejscowosc);

    var datesVal = txt('Rozpoczęcie: ',false)+'<w:r><w:rPr><w:b/></w:rPr><w:t>'+ex(d.dataStart?d.dataStart.split('-').reverse().join('.'):'___')+'</w:t></w:r>'
      +'<w:r><w:t xml:space="preserve">   Zakończenie: </w:t></w:r>'
      +'<w:r><w:rPr><w:b/></w:rPr><w:t>'+ex(d.dataEnd?d.dataEnd.split('-').reverse().join('.'):'___')+'</w:t></w:r>'
      +(d.nrZlecenia?'<w:r><w:t xml:space="preserve">   Nr zlecenia: </w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>'+ex(d.nrZlecenia)+'</w:t></w:r>':'');

    var praceLines = (d.praceOpis||'').split('\n');
    var praceVal = praceLines.map(function(l,i){ return txt(l)+(i<praceLines.length-1?'<w:r><w:br/></w:r>':''); }).join('');

    body += '<w:tbl>'
      +'<w:tblPr><w:tblW w:w="9000" w:type="dxa"/>'
      +'<w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="374151"/>'
      +'<w:left w:val="single" w:sz="4" w:space="0" w:color="374151"/>'
      +'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="374151"/>'
      +'<w:right w:val="single" w:sz="4" w:space="0" w:color="374151"/>'
      +'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>'
      +'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>'
      +'</w:tblBorders></w:tblPr>'
      +row('Dane zgłaszającego', zglVal)
      +row('Dane obiektu', objVal)
      +row('Daty realizacji', datesVal)
      +row('Wykonane prace', praceVal)
      +(d.materialy?row('Użyte materiały', txt(d.materialy)):'')
      +(d.uwagi?row('Uwagi / zalecenia', txt(d.uwagi)):'')
      +row('Data odbioru', txt(d.dataOdbioru?d.dataOdbioru.split('-').reverse().join('.'):'___',true))
      +(faktura?row('Faktura VAT', txt('Niniejszy protokół '+faktura+'.')):'')
      +'</w:tbl>';

    body += '<w:p><w:pPr><w:spacing w:before="300"/></w:pPr></w:p>';

    // Photos
    if (photos.length > 0) {
      body += para('Dokumentacja fotograficzna', true, 28, '1A1A2E');
      for (var pi=0; pi<photos.length; pi++) {
        var p = photos[pi];
        var b64 = p.b64.split(',')[1];
        var ext = p.b64.startsWith('data:image/png') ? 'png' : 'jpeg';
        var rId = 'rId'+rid; rid++;
        imageFiles.push({rId:rId, ext:ext, data:b64, idx:pi+1});
        var dim = computeImageEmu(p);
        var cx = dim.cx, cy = dim.cy;
        body += '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing>'
          +'<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">'
          +'<wp:extent cx="'+cx+'" cy="'+cy+'"/>'
          +'<wp:docPr id="'+rid+'" name="img'+(pi+1)+'"/>'
          +'<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
          +'<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
          +'<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
          +'<pic:nvPicPr><pic:cNvPr id="'+rid+'" name="img'+(pi+1)+'"/><pic:cNvPicPr/></pic:nvPicPr>'
          +'<pic:blipFill><a:blip r:embed="'+rId+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>'
          +'<a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
          +'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm>'
          +'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
          +'</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
        if (p.caption) body += para('Fot. '+(pi+1)+': '+p.caption, false, 18, '555555');
      }
    }

    // Signatures
    body += '<w:p><w:pPr><w:spacing w:before="300" w:after="100"/>'
      +'<w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="1A1A2E"/></w:pBdr></w:pPr>'
      +'<w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1A1A2E"/></w:rPr>'
      +'<w:t>Protokół sporządzono w dwóch jednobrzmiących egzemplarzach</w:t></w:r></w:p>';

    body += '<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/>'
      +'<w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>'
      +'<w:left w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>'
      +'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>'
      +'<w:right w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>'
      +'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>'
      +'</w:tblBorders></w:tblPr>'
      +'<w:tr><w:trPr><w:cantSplit/></w:trPr>'
      +'<w:tc><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="6B7280"/></w:rPr><w:t>Osoba uprawniona do odbioru</w:t></w:r></w:p>'
      +'<w:p><w:r><w:t>'+ex(d.sigOdbiorca)+'</w:t></w:r></w:p>'
      +'<w:p><w:pPr><w:spacing w:before="800"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="6B7280"/></w:rPr><w:t>Podpis / pieczęć</w:t></w:r></w:p></w:tc>'
      +'<w:tc><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="6B7280"/></w:rPr><w:t>Wykonawca</w:t></w:r></w:p>'
      +'<w:p><w:r><w:t>'+ex(d.sigWykonawca)+'</w:t></w:r></w:p>'
      +(d.sigWykonawcaOsoba?'<w:p><w:r><w:t>'+ex(d.sigWykonawcaOsoba)+'</w:t></w:r></w:p>':'')
      +'<w:p><w:r><w:t>'+ex(d.sigDataWyk?d.sigDataWyk.split('-').reverse().join('.'):'')+'</w:t></w:r></w:p>'
      +'<w:p><w:pPr><w:spacing w:before="800"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="6B7280"/></w:rPr><w:t>Podpis</w:t></w:r></w:p></w:tc>'
      +'</w:tr></w:tbl>';

    // Build ZIP
    var iCT = imageFiles.map(function(f){
      return '<Override PartName="/word/media/img'+f.idx+'.'+f.ext+'" ContentType="image/'+f.ext+'"/>';
    }).join('');
    var iRL = imageFiles.map(function(f){
      return '<Relationship Id="'+f.rId+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/img'+f.idx+'.'+f.ext+'"/>';
    }).join('');

    // Stopka z numeracją stron ("Strona X z Y")
    var footerXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      +'<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
      +'<w:p><w:pPr><w:jc w:val="center"/></w:pPr>'
      +'<w:r><w:rPr><w:sz w:val="18"/><w:color w:val="6B7280"/></w:rPr><w:t xml:space="preserve">Strona </w:t></w:r>'
      +'<w:fldSimple w:instr=" PAGE "><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="6B7280"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple>'
      +'<w:r><w:rPr><w:sz w:val="18"/><w:color w:val="6B7280"/></w:rPr><w:t xml:space="preserve"> z </w:t></w:r>'
      +'<w:fldSimple w:instr=" NUMPAGES "><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="6B7280"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple>'
      +'</w:p></w:ftr>';

    var settingsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      +'<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
      +'<w:updateFields w:val="true"/>'
      +'</w:settings>';

    var zip = new JSZip();
    zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      +'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      +'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
      +'<Default Extension="xml" ContentType="application/xml"/>'
      +'<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
      +'<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
      +'<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
      +'<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>'
      +iCT+'</Types>');
    zip.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      +'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      +'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
      +'</Relationships>');
    zip.folder('word').folder('_rels').file('document.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      +'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      +'<Relationship Id="rId_styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
      +'<Relationship Id="rId_footer1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>'
      +'<Relationship Id="rId_settings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>'
      +iRL+'</Relationships>');
    zip.folder('word').file('styles.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      +'<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
      +'<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/>'
      +'<w:rPr><w:sz w:val="22"/></w:rPr></w:style></w:styles>');
    zip.folder('word').file('footer1.xml', footerXml);
    zip.folder('word').file('settings.xml', settingsXml);
    zip.folder('word').file('document.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      +'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
      +' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
      +' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"'
      +' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
      +' xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
      +'<w:body>'+body
      +'<w:sectPr>'
      +'<w:footerReference w:type="default" r:id="rId_footer1"/>'
      +'<w:pgSz w:w="11906" w:h="16838"/>'
      +'<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:footer="567"/>'
      +'</w:sectPr></w:body></w:document>');
    var media = zip.folder('word').folder('media');
    imageFiles.forEach(function(f){ media.file('img'+f.idx+'.'+f.ext, f.data, {base64:true}); });

    var blob = await zip.generateAsync({type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'protokol-serwisowy.docx';
    a.click();

  } catch(err){ alert('Blad DOCX: '+err.message); console.error(err); }
  btn.disabled=false; btn.textContent='📄 Pobierz DOCX';
}
