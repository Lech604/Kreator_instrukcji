/* ============================================================
   Kreator Instrukcji Oświetlenia — app.js v4
   Logika i struktura z v3, eksport (DOCX/PDF/HTML) z v1
   ============================================================ */

// ── STAŁE ────────────────────────────────────────────────────────────────────
const COLS=[
  {id:'blue',  bg:'#eff6ff',border:'#3b82f6',text:'#1e40af',dot:'#3b82f6'},
  {id:'purple',bg:'#f5f3ff',border:'#8b5cf6',text:'#5b21b6',dot:'#8b5cf6'},
  {id:'green', bg:'#ecfdf5',border:'#10b981',text:'#065f46',dot:'#10b981'},
  {id:'amber', bg:'#fffbeb',border:'#f59e0b',text:'#78350f',dot:'#f59e0b'},
  {id:'red',   bg:'#fef2f2',border:'#ef4444',text:'#7f1d1d',dot:'#ef4444'},
  {id:'gray',  bg:'#f9fafb',border:'#6b7280',text:'#1f2937',dot:'#6b7280'},
];
const COL=id=>COLS.find(c=>c.id===id)||COLS[0];
const CTRL={button:'tylko przycisk',sensor:'tylko sensor',both:'przycisk + sensor'};
const PANEL_TYPES=[
  {id:'PB2',label:'PB2',keys:2},
  {id:'PB4',label:'PB4',keys:4},
  {id:'PB6',label:'PB6',keys:6},
  {id:'PB8',label:'PB8',keys:8},
];
const KEY_ACTIONS=['Włącz/Wyłącz','Włącz','Wyłącz','Ściemnianie','Rozjaśnianie','Scena','HCL','Brak'];
const ACTION_COLORS={'short1':'#dbeafe','long1':'#e0e7ff','long2':'#ede9fe','short2':'#fce7f3'};
const ACTION_TEXT={'short1':'#1e40af','long1':'#3730a3','long2':'#5b21b6','short2':'#9d174d'};

// ── STAN ─────────────────────────────────────────────────────────────────────
let curStep=0;
let secCnt=0, devCnt=0, zoneCnt=0;
const dbImages={PB2:null,PB4:null,PB6:null,PB8:null};
let sections=[];

const SNAMES=['Ustawienia','Sekcje','Podgląd'];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function e(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function uid(){return Date.now()+(Math.random()*99999|0);}

// ── STEPS ─────────────────────────────────────────────────────────────────────
function renderSteps(){
  const bar=document.getElementById('steps-bar');bar.innerHTML='';
  SNAMES.forEach((s,i)=>{
    if(i>0){const d=document.createElement('div');d.className='step-sep';bar.appendChild(d);}
    const b=document.createElement('button');
    b.className='step-btn '+(i===curStep?'active':i<curStep?'done':'todo');
    b.innerHTML=`<span class="step-num">${i<curStep?'✓':i+1}</span>${s}`;
    b.onclick=()=>goTo(i);
    bar.appendChild(b);
  });
}
function goTo(n){
  document.getElementById('page-'+curStep).classList.add('hidden');
  curStep=n;
  document.getElementById('page-'+curStep).classList.remove('hidden');
  renderSteps();
  if(n===2)renderPreview();
  window.scrollTo({top:0,behavior:'smooth'});
}

// ── BAZA ZDJĘĆ ────────────────────────────────────────────────────────────────
function loadDB(type,input){
  const f=input.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{
    dbImages[type]=ev.target.result;
    const slot=document.getElementById('db-'+type);
    const img=document.getElementById('dbimg-'+type);
    const lbl=document.getElementById('dbl-'+type);
    slot.classList.add('loaded');
    img.src=ev.target.result;
    img.classList.remove('hidden');
    lbl.innerHTML=`<div style="font-size:14px">✓</div><div style="font-weight:700">${type}</div><small>wczytano</small>`;
    // aktualizuj istniejące panele tego typu które nie mają własnego zdjęcia
    sections.forEach(s=>(s.devices||[]).forEach(d=>{
      if(d.type==='panel'&&d.panelType===type&&!d.imageOverride)d.image=ev.target.result;
    }));
  };
  r.readAsDataURL(f);
}

// ── SEKCJE ────────────────────────────────────────────────────────────────────
function mkSection(name){
  return {id:uid(),name:name||'Sekcja '+(++secCnt),image:null,devices:[],zones:[],activeTab:'info'};
}
function addSection(){
  const s=mkSection();
  sections.push(s);
  renderSections();
  // auto-otwórz nową sekcję
  setTimeout(()=>{
    const body=document.getElementById('sbody-'+s.id);
    if(body)body.classList.remove('hidden');
  },30);
}
function delSection(sid){sections=sections.filter(s=>s.id!==sid);renderSections();}
function toggleSection(sid){
  const b=document.getElementById('sbody-'+sid);
  if(b)b.classList.toggle('hidden');
}
function setSec(sid,k,v){
  sections=sections.map(s=>s.id===sid?{...s,[k]:v}:s);
}
function switchTab(sid,tab){
  sections=sections.map(s=>s.id===sid?{...s,activeTab:tab}:s);
  document.querySelectorAll(`.sec-tab[data-sid="${sid}"]`).forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll(`.sec-tab-panel[data-sid="${sid}"]`).forEach(p=>p.classList.toggle('active',p.dataset.tab===tab));
}

function handleSecImg(sid,file){
  if(!file)return;
  const r=new FileReader();
  r.onload=ev=>{
    sections=sections.map(s=>s.id===sid?{...s,image:ev.target.result}:s);
    const pr=document.getElementById('simg-prev-'+sid);
    const ph=document.getElementById('simg-ph-'+sid);
    const rm=document.getElementById('simg-rm-'+sid);
    if(pr){pr.src=ev.target.result;pr.classList.remove('hidden');}
    if(ph)ph.classList.add('hidden');
    if(rm)rm.classList.remove('hidden');
  };
  r.readAsDataURL(file);
}
function removeSecImg(sid){
  sections=sections.map(s=>s.id===sid?{...s,image:null}:s);
  const pr=document.getElementById('simg-prev-'+sid);
  const ph=document.getElementById('simg-ph-'+sid);
  const rm=document.getElementById('simg-rm-'+sid);
  if(pr){pr.src='';pr.classList.add('hidden');}
  if(ph)ph.classList.remove('hidden');
  if(rm)rm.classList.add('hidden');
}

// ── URZĄDZENIA ────────────────────────────────────────────────────────────────
function mkDevice(type,sid){
  const d={id:uid(),type,sectionId:sid,name:'',desc:'',image:null,imageOverride:false};
  if(type==='panel'){d.panelType='PB4';d.image=dbImages['PB4']||null;d.keys=mkKeys('PB4');}
  if(type==='tablet'){/* no extra */}
  if(type==='sensor'){d.sensorDesc='';d.sensorImage=null;}
  return d;
}
function mkKeys(pt){
  const n=PANEL_TYPES.find(p=>p.id===pt)?.keys||4;
  return Array.from({length:n},(_,i)=>({num:i+1,name:'',action:'Włącz/Wyłącz'}));
}
function addDevice(sid,type){
  const s=sections.find(s=>s.id===sid);if(!s)return;
  const d=mkDevice(type,sid);
  sections=sections.map(s=>s.id===sid?{...s,devices:[...s.devices,d]}:s);
  refreshDevices(sid);
  refreshSecBadges(sid);
}
function delDevice(devId){
  let sid;
  sections.forEach(s=>{if((s.devices||[]).find(d=>d.id===devId))sid=s.id;});
  sections=sections.map(s=>({...s,devices:(s.devices||[]).filter(d=>d.id!==devId)}));
  if(sid){refreshDevices(sid);refreshSecBadges(sid);}
}
function setPanelType(devId,pt){
  sections=sections.map(s=>({...s,devices:(s.devices||[]).map(d=>{
    if(d.id!==devId)return d;
    const img=!d.imageOverride?(dbImages[pt]||null):d.image;
    return {...d,panelType:pt,keys:mkKeys(pt),image:img};
  })}));
  // update UI
  document.querySelectorAll(`.pb-btn[data-dev="${devId}"]`).forEach(b=>b.classList.toggle('active',b.dataset.pt===pt));
  const ke=document.getElementById('keys-'+devId);
  if(ke){let d;sections.forEach(s=>(s.devices||[]).forEach(x=>{if(x.id===devId)d=x;}));if(d)ke.innerHTML=renderKeysHTML(d);}
  const ip=document.getElementById('devimg-'+devId);
  if(ip){let d;sections.forEach(s=>(s.devices||[]).forEach(x=>{if(x.id===devId)d=x;}));if(d){ip.src=d.image||'';ip.classList.toggle('hidden',!d.image);}}
}
function setDevField(devId,field,val){
  sections=sections.map(s=>({...s,devices:(s.devices||[]).map(d=>d.id===devId?{...d,[field]:val}:d)}));
}
function upKey(devId,num,field,val){
  sections=sections.map(s=>({...s,devices:(s.devices||[]).map(d=>{
    if(d.id!==devId)return d;
    return {...d,keys:d.keys.map(k=>k.num===num?{...k,[field]:val}:k)};
  })}));
}
function handleDevImg(devId,file,isSensor){
  if(!file)return;
  const r=new FileReader();
  r.onload=ev=>{
    const data=ev.target.result;
    sections=sections.map(s=>({...s,devices:(s.devices||[]).map(d=>{
      if(d.id!==devId)return d;
      if(isSensor)return {...d,sensorImage:data};
      return {...d,image:data,imageOverride:true};
    })}));
    const ip=document.getElementById('devimg-'+devId);
    if(ip){ip.src=data;ip.classList.remove('hidden');}
    const ph=document.getElementById('devph-'+devId);
    if(ph)ph.classList.add('hidden');
  };
  r.readAsDataURL(file);
}

function renderKeysHTML(d){
  if(!d.keys||!d.keys.length)return'';
  return`<table class="key-table">
    <thead><tr><th>Klawisz</th><th>Nazwa / co steruje</th><th>Typ akcji</th></tr></thead>
    <tbody>${d.keys.map(k=>`<tr>
      <td><span class="key-num-badge">K${k.num}</span></td>
      <td><input class="inp" style="font-size:12px;padding:5px 8px" placeholder="np. Oświetlenie ogólne" value="${e(k.name)}" oninput="upKey(${d.id},${k.num},'name',this.value)"></td>
      <td><select class="key-action-sel" onchange="upKey(${d.id},${k.num},'action',this.value)">
        ${KEY_ACTIONS.map(a=>`<option ${k.action===a?'selected':''}>${a}</option>`).join('')}
      </select></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderDeviceCard(d){
  const labels={panel:'Panel',tablet:'Tablet',sensor:'Sensor'};
  const colors={panel:'background:#dbeafe;color:#1e40af',tablet:'background:#ecfdf5;color:#065f46',sensor:'background:#f3f4f6;color:#374151'};
  const sub=d.type==='panel'?d.panelType:labels[d.type];
  const title=d.name||labels[d.type];

  let body='';
  if(d.type==='panel'){
    body=`
      <div class="field"><label class="lbl">Typ panelu</label>
        <div class="pb-grid">${PANEL_TYPES.map(pt=>`<button class="pb-btn${d.panelType===pt.id?' active':''}" data-dev="${d.id}" data-pt="${pt.id}" onclick="setPanelType(${d.id},'${pt.id}')">${pt.label}</button>`).join('')}</div>
      </div>
      <div class="field"><label class="lbl">Nazwa / lokalizacja</label>
        <input class="inp" value="${e(d.name)}" placeholder="np. Panel przy wejściu" oninput="setDevField(${d.id},'name',this.value)">
      </div>
      <div class="field"><label class="lbl">Opis / uwagi <span style="font-weight:400">(opcjonalny)</span></label>
        <textarea class="inp" rows="2" placeholder="Uwagi dla użytkownika..." oninput="setDevField(${d.id},'desc',this.value)">${e(d.desc)}</textarea>
      </div>
      <div class="field"><label class="lbl">Zdjęcie panelu <span style="font-weight:400">(zastępuje bazę)</span></label>
        <div class="img-drop" style="min-height:70px" onclick="document.getElementById('dinp-${d.id}').click()">
          <div class="img-ph" id="devph-${d.id}" ${d.image?'style="display:none"':''}><div class="ic">📷</div><p>Kliknij aby wczytać własne</p></div>
          <img id="devimg-${d.id}" src="${d.image||''}" ${d.image?'':'class="hidden"'} style="max-height:150px;object-fit:contain;width:100%">
        </div>
        <input type="file" id="dinp-${d.id}" accept="image/*" class="hidden" onchange="handleDevImg(${d.id},this.files[0],false)">
      </div>
      <div class="field"><label class="lbl">Klawisze</label>
        <div id="keys-${d.id}">${renderKeysHTML(d)}</div>
      </div>`;
  } else if(d.type==='tablet'){
    body=`
      <div class="field"><label class="lbl">Nazwa / lokalizacja</label>
        <input class="inp" value="${e(d.name)}" placeholder="np. Tablet przy recepcji" oninput="setDevField(${d.id},'name',this.value)">
      </div>
      <div class="field"><label class="lbl">Opis interfejsu / funkcji</label>
        <textarea class="inp" rows="3" placeholder="Jakie sceny/funkcje obsługuje tablet..." oninput="setDevField(${d.id},'desc',this.value)">${e(d.desc)}</textarea>
      </div>
      <div class="field"><label class="lbl">Zdjęcie ekranu <span style="font-weight:400">(opcjonalne)</span></label>
        <div class="img-drop" style="min-height:70px" onclick="document.getElementById('dinp-${d.id}').click()">
          <div class="img-ph" id="devph-${d.id}" ${d.image?'style="display:none"':''}><div class="ic">📷</div><p>Kliknij aby wczytać</p></div>
          <img id="devimg-${d.id}" src="${d.image||''}" ${d.image?'':'class="hidden"'} style="max-height:150px;object-fit:contain;width:100%">
        </div>
        <input type="file" id="dinp-${d.id}" accept="image/*" class="hidden" onchange="handleDevImg(${d.id},this.files[0],false)">
      </div>`;
  } else { // sensor
    body=`
      <div class="field"><label class="lbl">Nazwa / lokalizacja</label>
        <input class="inp" value="${e(d.name)}" placeholder="np. Czujnik sufit — środek" oninput="setDevField(${d.id},'name',this.value)">
      </div>
      <div class="field"><label class="lbl">Opis działania</label>
        <textarea class="inp" rows="3" placeholder="Typ detekcji, czasy reakcji, progi natężenia, HCL, uwagi..." oninput="setDevField(${d.id},'sensorDesc',this.value)">${e(d.sensorDesc||'')}</textarea>
      </div>
      <div class="field"><label class="lbl">Rzut zasięgu detekcji <span style="font-weight:400">(opcjonalny)</span></label>
        <div class="img-drop" style="min-height:70px" onclick="document.getElementById('dinp-${d.id}').click()">
          <div class="img-ph" id="devph-${d.id}" ${d.sensorImage?'style="display:none"':''}><div class="ic">📷</div><p>Kliknij aby wczytać rzut zasięgu</p></div>
          <img id="devimg-${d.id}" src="${d.sensorImage||''}" ${d.sensorImage?'':'class="hidden"'} style="max-height:150px;object-fit:contain;width:100%">
        </div>
        <input type="file" id="dinp-${d.id}" accept="image/*" class="hidden" onchange="handleDevImg(${d.id},this.files[0],true)">
      </div>`;
  }

  return `<div class="dev-card" id="dcard-${d.id}">
    <div class="dev-hdr" onclick="toggleDev(${d.id})">
      <div>
        <span class="dev-title">${e(title)}</span>
        <span class="dev-badge" style="${colors[d.type]}">${sub}</span>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <button onclick="event.stopPropagation();delDevice(${d.id})" class="btn btn-danger btn-sm" style="font-size:11px;padding:3px 9px">usuń</button>
        <span style="color:#9ca3af;font-size:11px">▼</span>
      </div>
    </div>
    <div class="dev-body hidden" id="dbody-${d.id}">${body}</div>
  </div>`;
}

function toggleDev(devId){
  const b=document.getElementById('dbody-'+devId);
  if(b)b.classList.toggle('hidden');
}

function refreshDevices(sid){
  const s=sections.find(s=>s.id===sid);
  const el=document.getElementById('devlist-'+sid);
  if(!el||!s)return;
  if(!s.devices||!s.devices.length){
    el.innerHTML='<p class="empty-msg" style="padding:8px 0">Brak urządzeń — dodaj panel, tablet lub sensor</p>';
    return;
  }
  el.innerHTML=s.devices.map(d=>renderDeviceCard(d)).join('');
}

// ── STREFY ────────────────────────────────────────────────────────────────────
function mkZone(sid){
  const s=sections.find(s=>s.id===sid);
  const idx=s?s.zones.length:0;
  return {id:uid(),sectionId:sid,name:'S'+(idx+1),description:'',colorId:COLS[idx%COLS.length].id,controlType:'button',logicRules:[]};
}
function addZone(sid){
  const z=mkZone(sid);
  sections=sections.map(s=>s.id===sid?{...s,zones:[...s.zones,z]}:s);
  refreshZones(sid);
  refreshSecBadges(sid);
}
function delZone(sid,zid){
  sections=sections.map(s=>s.id===sid?{...s,zones:s.zones.filter(z=>z.id!==zid)}:s);
  refreshZones(sid);
  refreshSecBadges(sid);
}
function toggleZone(zid){
  const b=document.getElementById('zbody-'+zid);
  if(b)b.classList.toggle('hidden');
}
function setZ(sid,zid,k,v){sections=sections.map(s=>s.id===sid?{...s,zones:s.zones.map(z=>z.id===zid?{...z,[k]:v}:z)}:s);}
function setZColor(sid,zid,cid){setZ(sid,zid,'colorId',cid);refreshZones(sid);}
function setZCtrl(sid,zid,v){setZ(sid,zid,'controlType',v);refreshZones(sid);}
function addRule(sid,zid){sections=sections.map(s=>s.id===sid?{...s,zones:s.zones.map(z=>z.id===zid?{...z,logicRules:[...z.logicRules,{id:uid(),trigger:'',action:'',note:''}]}:z)}:s);refreshZones(sid);}
function setRule(sid,zid,rid,f,v){sections=sections.map(s=>s.id===sid?{...s,zones:s.zones.map(z=>z.id===zid?{...z,logicRules:z.logicRules.map(r=>r.id===rid?{...r,[f]:v}:r)}:z)}:s);}
function delRule(sid,zid,rid){sections=sections.map(s=>s.id===sid?{...s,zones:s.zones.map(z=>z.id===zid?{...z,logicRules:z.logicRules.filter(r=>r.id!==rid)}:z)}:s);refreshZones(sid);}

function renderZoneCard(z,sid){
  const c=COL(z.colorId);
  const cDotsH=COLS.map(cl=>`<div class="cdot${z.colorId===cl.id?' sel':''}" style="background:${cl.dot}" onclick="setZColor(${sid},${z.id},'${cl.id}')"></div>`).join('');
  const ctrlH=['button','sensor','both'].map(v=>`<button class="ctrl-btn${z.controlType===v?' active':''}" onclick="setZCtrl(${sid},${z.id},'${v}')">${CTRL[v]}</button>`).join('');
  const rulesH=z.logicRules.map((r,ri)=>`
    <div class="rule-box">
      <div class="rule-hdr"><span class="rule-lbl">Reguła ${ri+1}</span><button class="xbtn" onclick="delRule(${sid},${z.id},${r.id})">×</button></div>
      <div class="grid2" style="margin-bottom:7px">
        <div><label class="lbl" style="font-size:9px">Wyzwalacz</label><input class="inp" style="font-size:12px" placeholder="np. Naciśnięcie przycisku" value="${e(r.trigger)}" oninput="setRule(${sid},${z.id},${r.id},'trigger',this.value)"></div>
        <div><label class="lbl" style="font-size:9px">Akcja</label><input class="inp" style="font-size:12px" placeholder="np. Sensor zablokowany" value="${e(r.action)}" oninput="setRule(${sid},${z.id},${r.id},'action',this.value)"></div>
      </div>
      <div><label class="lbl" style="font-size:9px">Uwaga</label><input class="inp" style="font-size:12px" placeholder="np. Po 20 min braku ruchu — powrót do sensora" value="${e(r.note)}" oninput="setRule(${sid},${z.id},${r.id},'note',this.value)"></div>
    </div>`).join('');

  return `<div class="zone-wrap" style="border-color:${c.border}" id="zwrap-${z.id}">
    <div class="zone-hdr" style="background:${c.bg}" onclick="toggleZone(${z.id})">
      <div class="zone-hdr-l">
        <div class="zdot" style="background:${c.dot}"></div>
        <span class="zname" id="zname-${z.id}" style="color:${c.text}">${e(z.name)||'Strefa'}</span>
        <span class="zpill" style="background:${c.dot}22;color:${c.text}">${CTRL[z.controlType]}</span>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <button onclick="event.stopPropagation();delZone(${sid},${z.id})" class="btn btn-danger btn-sm" style="font-size:11px;padding:3px 9px">usuń</button>
        <span style="color:#9ca3af;font-size:11px">▼</span>
      </div>
    </div>
    <div class="zbody hidden" id="zbody-${z.id}">
      <div class="grid2 field">
        <div><label class="lbl">Nazwa strefy</label><input class="inp" value="${e(z.name)}" oninput="setZ(${sid},${z.id},'name',this.value);document.getElementById('zname-${z.id}').textContent=this.value||'Strefa'"></div>
        <div><label class="lbl">Kolor</label><div class="color-row">${cDotsH}</div></div>
      </div>
      <div class="field"><label class="lbl">Opis strefy</label><textarea class="inp" rows="2" placeholder="np. Oświetlenie biurek przy oknie" oninput="setZ(${sid},${z.id},'description',this.value)">${e(z.description)}</textarea></div>
      <div class="field"><label class="lbl">Typ sterowania</label><div class="ctrl-btns">${ctrlH}</div></div>
      <div class="field" style="margin-bottom:0">
        <div class="sub-hdr"><label class="lbl">Logika działania</label><button class="add-link" onclick="addRule(${sid},${z.id})">+ dodaj regułę</button></div>
        ${rulesH||'<p class="empty-msg">Brak zdefiniowanej logiki</p>'}
      </div>
    </div>
  </div>`;
}

function refreshZones(sid){
  const s=sections.find(s=>s.id===sid);
  const el=document.getElementById('zonelist-'+sid);
  if(!el||!s)return;
  el.innerHTML=s.zones.length
    ? s.zones.map(z=>renderZoneCard(z,sid)).join('')
    : '<p class="empty-msg" style="padding:8px 0">Brak stref — dodaj strefę</p>';
}

// ── RENDER SECTIONS ────────────────────────────────────────────────────────────
function renderSections(){
  const list=document.getElementById('sections-list');
  const emp=document.getElementById('sections-empty');
  list.innerHTML='';
  emp.classList.toggle('hidden',sections.length>0);

  sections.forEach(sec=>{
    const dc=(sec.devices||[]).length;
    const zc=(sec.zones||[]).length;
    const div=document.createElement('div');
    div.className='sec-wrap';
    div.id='sec-card-'+sec.id;
    div.innerHTML=`
      <div class="sec-hdr" onclick="toggleSection(${sec.id})">
        <div class="sec-hdr-l">
          <div class="sec-icon" id="secicon-${sec.id}">${e(sec.name).charAt(0)||'?'}</div>
          <span class="sec-name-txt" id="secname-${sec.id}">${e(sec.name)||'Sekcja'}</span>
          <span class="sec-count" id="seccount-${sec.id}">${dc} urządz. · ${zc} stref</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button onclick="event.stopPropagation();delSection(${sec.id})" class="btn btn-danger btn-sm" style="font-size:11px">usuń sekcję</button>
          <span style="color:#9ca3af;font-size:12px">▼</span>
        </div>
      </div>
      <div class="sec-body hidden" id="sbody-${sec.id}">
        <!-- TABY -->
        <div class="sec-tabs">
          <button class="sec-tab${sec.activeTab==='info'?' active':''}" data-sid="${sec.id}" data-tab="info" onclick="switchTab(${sec.id},'info')">Informacje</button>
          <button class="sec-tab${sec.activeTab==='dev'?' active':''}" data-sid="${sec.id}" data-tab="dev" onclick="switchTab(${sec.id},'dev')">Urządzenia</button>
          <button class="sec-tab${sec.activeTab==='zones'?' active':''}" data-sid="${sec.id}" data-tab="zones" onclick="switchTab(${sec.id},'zones')">Strefy</button>
        </div>

        <!-- TAB: INFORMACJE -->
        <div class="sec-tab-panel${sec.activeTab==='info'?' active':''}" data-sid="${sec.id}" data-tab="info">
          <div class="field">
            <label class="lbl">Nazwa sekcji / pomieszczenia</label>
            <input class="inp" value="${e(sec.name)}" oninput="setSec(${sec.id},'name',this.value);document.getElementById('secname-${sec.id}').textContent=this.value||'Sekcja';document.getElementById('secicon-${sec.id}').textContent=this.value.charAt(0)||'?'">
          </div>
          <div class="field">
            <label class="lbl">Grafika rzutu / schematu <span style="font-weight:400">(opcjonalna)</span></label>
            <div class="img-drop" style="min-height:90px" onclick="document.getElementById('simg-inp-${sec.id}').click()" ondragover="event.preventDefault()" ondrop="(function(ev){ev.preventDefault();handleSecImg(${sec.id},ev.dataTransfer.files[0])})(event)">
              <div class="img-ph" id="simg-ph-${sec.id}" ${sec.image?'style="display:none"':''}><div class="ic">🖼</div><p>Kliknij lub przeciągnij rzut / schemat</p></div>
              <img id="simg-prev-${sec.id}" src="${sec.image||''}" ${sec.image?'':'class="hidden"'} style="width:100%;max-height:180px;object-fit:contain;background:#f9fafb;border-radius:8px">
            </div>
            <input type="file" id="simg-inp-${sec.id}" accept="image/*" class="hidden" onchange="handleSecImg(${sec.id},this.files[0])">
            <button id="simg-rm-${sec.id}" class="btn btn-danger btn-sm ${sec.image?'':'hidden'}" onclick="removeSecImg(${sec.id})" style="margin-top:6px;font-size:11px">Usuń grafikę</button>
          </div>
        </div>

        <!-- TAB: URZĄDZENIA -->
        <div class="sec-tab-panel${sec.activeTab==='dev'?' active':''}" data-sid="${sec.id}" data-tab="dev">
          <div id="devlist-${sec.id}">
            ${(sec.devices||[]).length
              ? sec.devices.map(d=>renderDeviceCard(d)).join('')
              : '<p class="empty-msg" style="padding:8px 0">Brak urządzeń — dodaj panel, tablet lub sensor</p>'}
          </div>
          <div style="display:flex;gap:7px;margin-top:8px">
            <button class="btn btn-outline btn-sm" onclick="addDevice(${sec.id},'panel')">+ Panel</button>
            <button class="btn btn-outline btn-sm" onclick="addDevice(${sec.id},'tablet')">+ Tablet</button>
            <button class="btn btn-outline btn-sm" onclick="addDevice(${sec.id},'sensor')">+ Sensor</button>
          </div>
        </div>

        <!-- TAB: STREFY -->
        <div class="sec-tab-panel${sec.activeTab==='zones'?' active':''}" data-sid="${sec.id}" data-tab="zones">
          <div id="zonelist-${sec.id}">
            ${(sec.zones||[]).length
              ? sec.zones.map(z=>renderZoneCard(z,sec.id)).join('')
              : '<p class="empty-msg" style="padding:8px 0">Brak stref — dodaj strefę</p>'}
          </div>
          <div class="add-zone-row">
            <button class="add-link" onclick="addZone(${sec.id})">+ dodaj strefę</button>
          </div>
        </div>
      </div>`;
    list.appendChild(div);
  });
}

function refreshSecBadges(sid){
  const s=sections.find(s=>s.id===sid);if(!s)return;
  const el=document.getElementById('seccount-'+sid);
  if(el)el.textContent=`${(s.devices||[]).length} urządz. · ${(s.zones||[]).length} stref`;
}

// ── PODGLĄD ───────────────────────────────────────────────────────────────────
function renderPreview(){
  const title=document.getElementById('f-title').value;
  const subtitle=document.getElementById('f-subtitle').value;
  const tags=document.getElementById('f-tags').value;
  const note=document.getElementById('f-note').value;
  const tagsH=tags.split(',').filter(Boolean).map(t=>`<span class="pv-tag">${e(t.trim())}</span>`).join('');

  let sectionsH='';
  sections.forEach(sec=>{
    const imgH=sec.image?`<div style="text-align:center;margin:8px 0 12px"><img src="${sec.image}" style="max-width:100%;max-height:160px;object-fit:contain;border-radius:8px;border:1px solid #f3f4f6"></div>`:'';
    const devsH=(sec.devices||[]).map(d=>{
      const lbls={panel:'Panel',tablet:'Tablet',sensor:'Sensor'};
      const sub=d.type==='panel'?d.panelType:lbls[d.type];
      return `<div style="font-size:12px;color:#374151;margin-left:10px;margin-bottom:2px">
        · <strong>${e(d.name)||sub}</strong> <span style="font-size:10px;color:#9ca3af">[${sub}]</span>
        ${d.type==='panel'&&d.keys?` — ${d.keys.filter(k=>k.name).length}/${d.keys.length} kl.`:''}
      </div>`;
    }).join('');
    const zonesH=(sec.zones||[]).map(z=>{
      const c=COL(z.colorId);
      return `<div style="display:flex;align-items:center;gap:6px;margin-left:10px;margin-bottom:2px">
        <div style="width:7px;height:7px;border-radius:50%;background:${c.dot};flex-shrink:0"></div>
        <span style="font-size:12px;font-weight:600;color:${c.text}">${e(z.name)}</span>
        <span style="font-size:11px;color:#9ca3af">— ${e(z.description)||CTRL[z.controlType]}</span>
      </div>`;
    }).join('');

    sectionsH+=`<div style="margin-bottom:14px">
      <div style="font-weight:700;font-size:12px;color:#111827;margin-bottom:6px">
        <span style="background:#111827;color:#fff;border-radius:5px;padding:1px 7px;font-size:10px">${e(sec.name)}</span>
      </div>
      ${imgH}
      ${devsH}
      ${zonesH}
    </div>`;
  });

  document.getElementById('preview-out').innerHTML=`
    <div class="pv-hdr">
      <div class="pv-title">${e(title)}</div>
      <div class="pv-sub">${e(subtitle)}</div>
      <div class="pv-tags">${tagsH}</div>
    </div>
    <div class="card" style="padding:14px">
      ${sectionsH||'<p style="color:#d1d5db;font-size:13px">Brak sekcji — wróć do kroku 2</p>'}
      ${note?`<div class="note-box">${e(note)}</div>`:''}
    </div>`;
}

// ── BUILD HTML CONTENT (shared by HTML/PDF export) ──────────────────────────
function buildHTMLContent(){
  const title=document.getElementById('f-title').value||'Instrukcja';
  const subtitle=document.getElementById('f-subtitle').value;
  const tags=document.getElementById('f-tags').value;
  const note=document.getElementById('f-note').value;
  const tagsH=tags.split(',').filter(Boolean)
    .map(t=>`<span style="font-size:10px;font-family:monospace;background:#1f2937!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;color:#6ee7b7!important;padding:2px 9px;border-radius:4px;border:1px solid #374151">${e(t.trim())}</span>`).join('');

  function flowChip(txt,bg,col){return`<span style="display:inline-block;font-size:11px;padding:4px 10px;border-radius:6px;background:${bg}!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;color:${col}!important;font-weight:500">${e(txt)}</span>`;}
  function arrow(){return`<span style="font-size:13px;color:#9ca3af;margin:0 3px">→</span>`;}

  let sectionsDetailH='';
  sections.forEach(sec=>{
    const imgH=sec.image?`<div style="text-align:center;margin:14px 0"><img src="${sec.image}" style="max-height:200px;object-fit:contain;border-radius:10px;border:1px solid #e5e7eb"></div>`:'';

    // Urządzenia
    let devsH='';
    (sec.devices||[]).forEach(d=>{
      const lbls={panel:'Panel',tablet:'Tablet',sensor:'Sensor'};
      const sub=d.type==='panel'?d.panelType:lbls[d.type];
      devsH+=`<div style="border:1px solid #f3f4f6;border-radius:8px;overflow:hidden;margin-bottom:10px">
        <div style="padding:7px 12px;background:#f9fafb;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:8px">
          <span style="background:#e5e7eb;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">${e(d.name)||sub}</span>
          <span style="font-size:10px;color:#9ca3af">${sub}</span>
        </div>`;
      if(d.image&&d.type==='panel'){
        devsH+=`<div style="text-align:center;padding:8px"><img src="${d.image}" style="max-height:120px;object-fit:contain;border-radius:6px"></div>`;
      }
      if(d.desc){devsH+=`<div style="padding:6px 12px;font-size:12px;color:#6b7280">${e(d.desc)}</div>`;}
      if(d.type==='panel'&&d.keys&&d.keys.length){
        devsH+=`<table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr>
            <th style="text-align:left;padding:5px 8px;background:#fff;font-size:9px;font-weight:600;text-transform:uppercase;color:#9ca3af;width:80px">Klawisz</th>
            <th style="text-align:left;padding:5px 8px;background:#fff;font-size:9px;font-weight:600;text-transform:uppercase;color:#9ca3af">Nazwa</th>
            <th style="text-align:left;padding:5px 8px;background:#fff;font-size:9px;font-weight:600;text-transform:uppercase;color:#9ca3af;width:150px">Akcja</th>
          </tr></thead><tbody>
          ${d.keys.map(k=>`<tr>
            <td style="padding:5px 8px;border-bottom:1px solid #f9fafb"><span style="background:#111827;color:#fff;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700;font-family:monospace">K${k.num}</span></td>
            <td style="padding:5px 8px;border-bottom:1px solid #f9fafb;color:#374151;font-weight:500">${e(k.name)||'—'}</td>
            <td style="padding:5px 8px;border-bottom:1px solid #f9fafb;color:#6b7280">${e(k.action)}</td>
          </tr>`).join('')}
          </tbody></table>`;
      }
      if(d.type==='sensor'&&d.sensorDesc){devsH+=`<div style="padding:6px 12px;font-size:12px;color:#6b7280">${e(d.sensorDesc)}</div>`;}
      if(d.type==='sensor'&&d.sensorImage){devsH+=`<div style="text-align:center;padding:8px"><img src="${d.sensorImage}" style="max-height:120px;object-fit:contain;border-radius:6px"></div>`;}
      if(d.type==='tablet'&&d.image){devsH+=`<div style="text-align:center;padding:8px"><img src="${d.image}" style="max-height:120px;object-fit:contain;border-radius:6px"></div>`;}
      devsH+=`</div>`;
    });

    // Strefy
    let zonesLogicH='';
    (sec.zones||[]).forEach(z=>{
      const c=COL(z.colorId);
      let inner='';
      if(z.logicRules&&z.logicRules.length){
        z.logicRules.forEach((r,i)=>{
          const parts=[];
          if(r.trigger)parts.push(flowChip(r.trigger,'#f3f4f6','#374151'));
          if(r.trigger&&r.action)parts.push(arrow());
          if(r.action)parts.push(flowChip(r.action,c.bg,c.text));
          if(r.note)parts.push(`<span style="font-size:10px;color:#9ca3af;font-style:italic;margin-left:3px">${e(r.note)}</span>`);
          inner+=`<div style="display:flex;flex-wrap:wrap;align-items:center;gap:3px;padding:6px 0;border-bottom:1px solid #f9fafb">
            <span style="font-size:11px;color:#d1d5db;min-width:18px;font-family:monospace">${i+1}.</span>${parts.join('')}</div>`;
        });
      }
      if(!inner&&(!z.description))return;
      zonesLogicH+=`<div style="border-radius:9px;border:1px solid ${c.border}44;overflow:hidden;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;background:${c.bg}!important;-webkit-print-color-adjust:exact;print-color-adjust:exact">
          <div style="width:9px;height:9px;border-radius:50%;background:${c.dot};flex-shrink:0"></div>
          <span style="font-weight:700;font-size:12px;color:${c.text}">${e(z.name)}</span>
          <span style="font-size:11px;color:#6b7280">— ${e(z.description)||CTRL[z.controlType]}</span>
        </div>
        ${inner?`<div style="padding:10px 12px;background:#fff">${inner}</div>`:''}
      </div>`;
    });

    sectionsDetailH+=`
      <div style="margin-bottom:28px">
        <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="background:#111827!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;color:#fff!important;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700">${e(sec.name)}</span>
        </div>
        ${imgH}
        ${devsH?`<div style="margin-bottom:12px">${devsH}</div>`:''}
        ${zonesLogicH?`<div>${zonesLogicH}</div>`:''}
      </div>`;
  });

  const noteH=note?`<div style="background:#fffbeb!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;border:1px solid #f59e0b;border-radius:10px;padding:12px 16px;font-size:12px;color:#78350f;line-height:1.6;margin-top:8px">
    <strong style="display:block;margin-bottom:3px">ℹ Uwaga</strong>${e(note)}</div>`:'';

  return{title,subtitle,tagsH,sectionsDetailH,noteH};
}

// ── EXPORT HTML ────────────────────────────────────────────────────────────────
function exportHTML(){
  const{title,subtitle,tagsH,sectionsDetailH,noteH}=buildHTMLContent();
  const html=`<!DOCTYPE html>
<html lang="pl"><head><meta charset="UTF-8"><title>${e(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{font-family:'DM Sans',sans-serif;background:#f3f4f6;color:#111827}.page{max-width:800px;margin:0 auto;padding:32px 24px}@media print{body{background:#fff}.page{padding:0}@page{margin:14mm;size:A4}}</style>
</head><body><div class="page">
<div style="background:#111827!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;color:#fff;border-radius:12px;padding:22px 26px;margin-bottom:22px">
  <div style="font-size:20px;font-weight:700">${e(title)}</div>
  ${subtitle?`<div style="font-size:12px;color:#9ca3af;margin-top:4px">${e(subtitle)}</div>`:''}
  <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">${tagsH}</div>
</div>
${sectionsDetailH}${noteH}
</div></body></html>`;
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
  a.download='instrukcja.html';a.click();
  closeExport();
}

// ── EXPORT PDF ─────────────────────────────────────────────────────────────────
function exportPDF(){
  const{title,subtitle,tagsH,sectionsDetailH,noteH}=buildHTMLContent();
  const win=window.open('','_blank','width=900,height=700');
  if(!win){alert('Przeglądarka zablokowała popup. Zezwól na popupy i spróbuj ponownie.');return;}
  win.document.write(`<!DOCTYPE html>
<html lang="pl"><head><meta charset="UTF-8"><title>${e(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{font-family:'DM Sans',system-ui,sans-serif;background:#fff;color:#111827}.page{max-width:800px;margin:0 auto;padding:28px 24px}.no-print{display:block}@media print{.no-print{display:none!important}.page{padding:0;max-width:100%}@page{margin:12mm 10mm;size:A4}}</style>
</head><body>
<div class="no-print" style="background:#111827;color:#fff;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-radius:8px;max-width:800px;margin:0 auto 20px">
  <span style="font-size:13px">Kliknij "Drukuj" i wybierz "Zapisz jako PDF" — zaznacz opcję <strong>Grafika w tle</strong></span>
  <button onclick="window.print()" style="background:#059669;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer">🖨 Drukuj / PDF</button>
</div>
<div class="page">
<div style="background:#111827!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;color:#fff;border-radius:12px;padding:22px 26px;margin-bottom:22px">
  <div style="font-size:20px;font-weight:700">${e(title)}</div>
  ${subtitle?`<div style="font-size:12px;color:#9ca3af;margin-top:4px">${e(subtitle)}</div>`:''}
  <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">${tagsH}</div>
</div>
${sectionsDetailH}${noteH}
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},800);};<\/script>
</body></html>`);
  win.document.close();
  closeExport();
}

// ── EXPORT DOCX ────────────────────────────────────────────────────────────────
async function exportDOCX(){
  const btn=document.getElementById('btn-exp-docx');
  btn.disabled=true;btn.textContent='⏳ Generuję...';
  try{
    const{Document,Packer,Paragraph,TextRun,HeadingLevel,ImageRun,
          AlignmentType,BorderStyle,Table,TableRow,TableCell,WidthType,
          ShadingType}=window.docx;

    const title=document.getElementById('f-title').value||'Instrukcja';
    const subtitle=document.getElementById('f-subtitle').value;
    const tags=document.getElementById('f-tags').value;
    const note=document.getElementById('f-note').value;
    const children=[];

    // Tytuł
    children.push(new Paragraph({
      children:[new TextRun({text:title,bold:true,size:40,color:'FFFFFF',font:'DM Sans'})],
      shading:{type:ShadingType.SOLID,color:'111827',fill:'111827'},
      spacing:{before:0,after:200},
    }));
    if(subtitle)children.push(new Paragraph({
      children:[new TextRun({text:subtitle,size:22,color:'9CA3AF',font:'DM Sans'})],
      shading:{type:ShadingType.SOLID,color:'111827',fill:'111827'},
      spacing:{before:0,after:100},
    }));
    if(tags)children.push(new Paragraph({
      children:[new TextRun({text:'Tagi: '+tags,size:18,color:'6EE7B7',font:'Courier New'})],
      shading:{type:ShadingType.SOLID,color:'111827',fill:'111827'},
      spacing:{before:0,after:400},
    }));

    for(const sec of sections){
      // Nagłówek sekcji
      children.push(new Paragraph({
        children:[new TextRun({text:sec.name,bold:true,size:28,color:'FFFFFF',font:'DM Sans'})],
        shading:{type:ShadingType.SOLID,color:'1F2937',fill:'1F2937'},
        spacing:{before:300,after:100},
      }));
      // Obraz sekcji
      if(sec.image){
        try{
          const imgData=sec.image.split(',')[1];
          const byteStr=atob(imgData);const arr=new Uint8Array(byteStr.length);
          for(let i=0;i<byteStr.length;i++)arr[i]=byteStr.charCodeAt(i);
          children.push(new Paragraph({children:[new ImageRun({data:arr,transformation:{width:400,height:250},type:'png'})],alignment:AlignmentType.CENTER,spacing:{before:100,after:200}}));
        }catch(ie){console.warn(ie);}
      }

      // Urządzenia
      for(const d of (sec.devices||[])){
        const lbls={panel:'Panel',tablet:'Tablet',sensor:'Sensor'};
        const sub=d.type==='panel'?d.panelType:lbls[d.type];
        children.push(new Paragraph({
          children:[new TextRun({text:`${sub}: ${d.name||sub}`,bold:true,size:22,color:'374151'})],
          spacing:{before:160,after:60},
        }));
        // Zdjęcie urządzenia
        const imgSrc=d.type==='sensor'?d.sensorImage:d.image;
        if(imgSrc){
          try{
            const imgData=imgSrc.split(',')[1];
            const byteStr=atob(imgData);const arr=new Uint8Array(byteStr.length);
            for(let i=0;i<byteStr.length;i++)arr[i]=byteStr.charCodeAt(i);
            children.push(new Paragraph({children:[new ImageRun({data:arr,transformation:{width:200,height:130},type:'png'})],spacing:{before:40,after:80}}));
          }catch(ie){console.warn(ie);}
        }
        // Tabela klawiszy dla panelu
        if(d.type==='panel'&&d.keys&&d.keys.length){
          const headerRow=new TableRow({children:[
            new TableCell({children:[new Paragraph({children:[new TextRun({text:'KLAWISZ',bold:true,size:16,color:'9CA3AF'})]})],shading:{type:ShadingType.SOLID,color:'F9FAFB',fill:'F9FAFB'},width:{size:15,type:WidthType.PERCENTAGE}}),
            new TableCell({children:[new Paragraph({children:[new TextRun({text:'NAZWA',bold:true,size:16,color:'9CA3AF'})]})],shading:{type:ShadingType.SOLID,color:'F9FAFB',fill:'F9FAFB'},width:{size:50,type:WidthType.PERCENTAGE}}),
            new TableCell({children:[new Paragraph({children:[new TextRun({text:'AKCJA',bold:true,size:16,color:'9CA3AF'})]})],shading:{type:ShadingType.SOLID,color:'F9FAFB',fill:'F9FAFB'},width:{size:35,type:WidthType.PERCENTAGE}}),
          ]});
          const dataRows=d.keys.map(k=>new TableRow({children:[
            new TableCell({children:[new Paragraph({children:[new TextRun({text:'K'+k.num,size:18,bold:true,font:'Courier New'})]})] ,width:{size:15,type:WidthType.PERCENTAGE}}),
            new TableCell({children:[new Paragraph({children:[new TextRun({text:k.name||'—',size:18,color:'374151'})]})] ,width:{size:50,type:WidthType.PERCENTAGE}}),
            new TableCell({children:[new Paragraph({children:[new TextRun({text:k.action||'',size:18,color:'6B7280'})]})] ,width:{size:35,type:WidthType.PERCENTAGE}}),
          ]}));
          children.push(new Table({rows:[headerRow,...dataRows],width:{size:100,type:WidthType.PERCENTAGE}}));
          children.push(new Paragraph({spacing:{before:100,after:0}}));
        }
        if(d.desc||d.sensorDesc){
          children.push(new Paragraph({children:[new TextRun({text:d.desc||d.sensorDesc||'',size:18,color:'6B7280'})],spacing:{before:40,after:80}}));
        }
      }

      // Strefy
      for(const z of (sec.zones||[])){
        const c=COL(z.colorId);
        const hexColor=c.text.replace('#','');
        const hexBg=c.bg.replace('#','');
        children.push(new Paragraph({
          children:[
            new TextRun({text:'● ',bold:true,size:22,color:c.dot.replace('#','')}),
            new TextRun({text:z.name,bold:true,size:22,color:hexColor}),
            z.description?new TextRun({text:'  —  '+z.description,size:20,color:'6B7280'}):new TextRun({text:''}),
          ],
          shading:{type:ShadingType.SOLID,color:hexBg.toUpperCase(),fill:hexBg.toUpperCase()},
          spacing:{before:200,after:80},
          border:{bottom:{style:BorderStyle.SINGLE,size:1,color:'E5E7EB'}},
        }));
        if(z.logicRules&&z.logicRules.length){
          children.push(new Paragraph({children:[new TextRun({text:'Logika działania:',bold:true,size:20,color:'374151'})],spacing:{before:120,after:40}}));
          z.logicRules.forEach((r,i)=>{
            const parts=[];
            if(r.trigger)parts.push(r.trigger);
            if(r.action)parts.push('→ '+r.action);
            if(r.note)parts.push('('+r.note+')');
            children.push(new Paragraph({
              children:[
                new TextRun({text:`${i+1}.  `,size:18,color:'9CA3AF',font:'Courier New'}),
                new TextRun({text:parts.join('   '),size:18,color:'374151'}),
              ],
              spacing:{before:40,after:40},
            }));
          });
        }
        children.push(new Paragraph({spacing:{before:100,after:0}}));
      }
    }

    if(note){
      children.push(new Paragraph({
        children:[new TextRun({text:'ℹ Uwaga',bold:true,size:20,color:'78350F'})],
        shading:{type:ShadingType.SOLID,color:'FFFBEB',fill:'FFFBEB'},
        border:{all:{style:BorderStyle.SINGLE,size:4,color:'F59E0B'}},
        spacing:{before:300,after:80},
      }));
      children.push(new Paragraph({
        children:[new TextRun({text:note,size:18,color:'78350F'})],
        shading:{type:ShadingType.SOLID,color:'FFFBEB',fill:'FFFBEB'},
        spacing:{before:0,after:200},
      }));
    }

    const doc=new Document({creator:'Kreator Instrukcji — Vertex',title,description:subtitle,sections:[{properties:{},children}]});
    const blob=await Packer.toBlob(doc);
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='instrukcja.docx';
    a.click();
    closeExport();
  }catch(err){
    alert('Błąd generowania DOCX: '+err.message);
    console.error(err);
  }
  btn.disabled=false;
  btn.textContent='📄 Pobierz DOCX (Word — edytowalny)';
}

function openExport(){document.getElementById('export-modal').classList.remove('hidden');}
function closeExport(){document.getElementById('export-modal').classList.add('hidden');}

// ── INIT ──────────────────────────────────────────────────────────────────────
renderSteps();
renderSections();
