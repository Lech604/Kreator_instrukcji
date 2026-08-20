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
      +'<p>'+escHtml(d.objAdres)+'</p>';

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
    +(d.zglAdres?'<br>'+escHtml(d.zglAdres):'')
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
    +'<div style="border:1px solid #d1d5db;border-radius:6px;padding:14px">'
    +'<div style="font-size:9pt;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Osoba uprawniona do odbioru</div>'
    +'<div style="font-size:11pt;margin-bottom:4px">'+escHtml(d.sigOdbiorca)+'</div>'
    +'<div style="border-top:1px solid #374151;margin-top:40px;padding-top:6px;font-size:9pt;color:#6b7280">Podpis / pieczęć</div>'
    +'</div>'
    +'<div style="border:1px solid #d1d5db;border-radius:6px;padding:14px">'
    +'<div style="font-size:9pt;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Wykonawca</div>'
    +'<div style="font-size:11pt;margin-bottom:4px">'+escHtml(d.sigWykonawca)+'</div>'
    +'<div style="font-size:10pt;color:#374151;margin-bottom:4px">'+fmtDate(d.sigDataWyk)+'</div>'
    +'<div style="border-top:1px solid #374151;margin-top:40px;padding-top:6px;font-size:9pt;color:#6b7280">Podpis</div>'
    +'</div>'
    +'</div>'
    +'</div>'

    +'</div>';
}

// ── EXPORT PDF ────────────────────────────────────────────────────────────────
function exportPDF(){
  const content = buildPrintHTML();
  const win = window.open('','_blank','width=900,height=700');
  if (!win){ alert('Przeglądarka zablokowała popup. Zezwól na popupy.'); return; }
  const css = '*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}'
    +'body{font-family:Arial,sans-serif;background:#fff;color:#000;margin:0}'
    +'.page{max-width:800px;margin:0 auto;padding:16mm 14mm;}'
    +'.no-print{display:block;}'
    +'table{border-collapse:collapse;width:100%}'
    +'tr{break-inside:avoid;page-break-inside:avoid}'
    +'.avoid-break{break-inside:avoid;page-break-inside:avoid}'
    +'.avoid-break-after{break-after:avoid;page-break-after:avoid}'
    +'@page{size:A4;margin:16mm 14mm 20mm 14mm;'
    +'@bottom-center{content:"Strona " counter(page) " z " counter(pages);font-size:9px;color:#6b7280;font-family:Arial,sans-serif;}'
    +'}'
    +'@media print{.page{padding:14mm 12mm;}.no-print{display:none!important;}}';
  win.document.write('<!DOCTYPE html><html><head><meta charset=UTF-8><title>Protokol Serwisowy</title>'
    +'<style>'+css+'</style></head><body>'
    +'<div class="no-print" style="background:#1a1a2e;color:#fff;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'
    +'<span style="font-size:13px">Protokół serwisowy — kliknij Drukuj i wybierz Zapisz jako PDF</span>'
    +'<button onclick="window.print()" style="background:#e8b84b;color:#1a1a2e;border:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;">🖨 Drukuj / PDF</button>'
    +'</div>'
    +'<div class="page">'+content+'</div>'
    +'</body></html>');
  win.document.close();
  setTimeout(function(){ win.print(); }, 800);
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
    var zglVal = txt(d.zglFirma,true)+'<w:r><w:br/></w:r>'+txt(d.zglBudynek)+'<w:r><w:br/></w:r>'+txt(d.zglAdres)
      +(d.zglOsoba?'<w:r><w:br/></w:r>'+txt('Osoba: '+d.zglOsoba):'')
      +(d.zglKontakt?'<w:r><w:br/></w:r>'+txt('Kontakt: '+d.zglKontakt):'');

    var objVal = sameAddr ? txt('Tożsame z danymi zgłaszającego')
      : txt(d.objNazwa+(d.objBudynek?' / '+d.objBudynek:''),true)+'<w:r><w:br/></w:r>'+txt(d.objAdres);

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
