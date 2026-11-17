/* GENERATED from "Calculation Sheets BG/MEP Calculator/index.html" by build-shopify.py.
   Edit the source and rebuild. Changes made here are overwritten. */
(()=>{
const MARKUP=`<header class="top">
  <button class="navbtn" id="navbtn" aria-expanded="false" aria-controls="nav">Calculators</button>
  <div class="brand"><span class="mark" id="mark" aria-hidden="true">E</span><h1 id="appname">Engineer's Calculator</h1><span class="by" id="by">Benchmark Guides</span></div>
  <div class="grow"></div>
  <div class="seg langseg" id="langseg" role="radiogroup" aria-label="Language / اللغة"><button type="button" role="radio" data-lang="ar" lang="ar">ع</button><button type="button" role="radio" data-lang="en" lang="en">EN</button></div>
</header>
<div class="wrap">
  <nav id="nav" aria-label="Calculators">
    <div class="search"><input id="q" type="search" placeholder="Search calculators…" aria-label="Search calculators"></div>
    <div id="navlist"></div>
    <p class="navnote" id="navnote">Every calculator lists the BG sheets or code clauses it is based on. Values are for preliminary design; check against the governing code and manufacturer data.</p>
  </nav>
  <main>
    <article class="sheet" id="sheet"></article>
    <p class="foot" id="foot">Engineer's Calculator · Rev A · Inputs are remembered in this browser only.</p>
  </main>
</div>`;
function mount(host){
const STANDALONE=host.getAttribute('data-mode')!=='embedded';
const root=host.attachShadow({mode:'open'});
const app=document.createElement('div');app.className='app';app.dataset.mode=STANDALONE?'standalone':'embedded';app.innerHTML=MARKUP;
if(host.dataset.css){const l=document.createElement('link');l.rel='stylesheet';l.href=host.dataset.css;app.style.visibility='hidden';const show=()=>{app.style.visibility=''};l.onload=show;l.onerror=show;setTimeout(show,2500);root.appendChild(l)}
else{const t=document.getElementById('bgc-css');if(t)root.appendChild(t.content.cloneNode(true))}
root.appendChild(app);
const scrollToTop=()=>{const off=STANDALONE?0:(parseFloat(getComputedStyle(app).getPropertyValue('--k-top'))||0);const y=host.getBoundingClientRect().top+scrollY-off;if(scrollY>y+1)window.scrollTo({top:Math.max(0,y)})};

/* ---------- helpers ---------- */
const $=s=>root.querySelector(s);
const PI=Math.PI, G=9.81, SQ3=Math.sqrt(3);
function fmt(x,d){
  if(x===null||x===undefined||Number.isNaN(x)) return '—';
  if(typeof x==='string') return x;
  if(!isFinite(x)) return '∞';
  if(d===undefined){const a=Math.abs(x); d=a>=1000?0:a>=100?1:a>=10?2:a>=1?2:a===0?0:3;}
  return x.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
}
const nextStd=(x,list)=>{for(const v of list) if(v>=x-1e-9) return v; return null;};
function interp(tbl,x){ // tbl sorted [[x,y],...]
  if(x<=tbl[0][0]) return tbl[0][1]*(x/tbl[0][0]);
  for(let i=1;i<tbl.length;i++){ if(x<=tbl[i][0]){const [x0,y0]=tbl[i-1],[x1,y1]=tbl[i]; return y0+(y1-y0)*(x-x0)/(x1-x0);} }
  const n=tbl.length; const [x0,y0]=tbl[n-2],[x1,y1]=tbl[n-1]; return y0+(y1-y0)*(x-x0)/(x1-x0);
}
function bisect(f,lo,hi,it=80){let flo=f(lo);for(let i=0;i<it;i++){const m=(lo+hi)/2,fm=f(m);if((fm>0)===(flo>0)){lo=m;flo=fm}else hi=m}return (lo+hi)/2}
const opt=(arr)=>arr.map((t,i)=>Array.isArray(t)?{v:String(t[0]),t:t[1]}:{v:String(i),t});

/* water properties */
const rhoW=T=>1000*(1-((T+288.9414)/(508929.2*(T+68.12963)))*Math.pow(T-3.9863,2));
const muW=T=>2.414e-5*Math.pow(10,247.8/(T+273.15-140));
const nuW=T=>muW(T)/rhoW(T);
const pvapW=T=>Math.pow(10,8.07131-1730.63/(233.426+T))*0.133322; // kPa
function darcyF(Re,relRough){ if(Re<2300) return 64/Math.max(Re,1); return 0.25/Math.pow(Math.log10(relRough/3.7+5.74/Math.pow(Re,0.9)),2); }
function pipeCalc(Qls,IDmm,eps_mm,T){ // returns v m/s, R Pa/m
  const D=IDmm/1000,A=PI*D*D/4,v=Qls/1000/A,Re=v*D/nuW(T),f=darcyF(Re,eps_mm/IDmm);
  return {v,R:f/D*rhoW(T)*v*v/2,Re};
}
const PIPES={
  steel:{name:'Steel Sch 40',eps:0.046,s:[['½"',15.8],['¾"',20.9],['1"',26.6],['1¼"',35.1],['1½"',40.9],['2"',52.5],['2½"',62.7],['3"',77.9],['4"',102.3],['5"',128.2],['6"',154.1],['8"',202.7],['10"',254.5],['12"',303.2],['14"',333.4],['16"',381.0],['18"',428.7],['20"',477.8]]},
  copper:{name:'Copper Type L',eps:0.0015,s:[['½"',13.84],['¾"',19.94],['1"',26.04],['1¼"',32.13],['1½"',38.23],['2"',50.42],['2½"',62.61],['3"',74.80],['4"',99.19]]},
  ppr:{name:'PPR PN20',eps:0.007,s:[['20 mm',13.2],['25 mm',16.6],['32 mm',21.2],['40 mm',26.6],['50 mm',33.4],['63 mm',42.0],['75 mm',50.0],['90 mm',60.0],['110 mm',73.4]]}
};
function pipeSelect(Qls,mat,T,vmax,Rmax){
  const P=PIPES[mat]; let sel=-1;
  const rows=P.s.map(([n,id],i)=>{const c=pipeCalc(Qls,id,P.eps,T); const ok=c.v<=vmax&&c.R<=Rmax; if(ok&&sel<0) sel=i; return {n,id,...c,ok};});
  return {rows,sel,P};
}
/* ft of water per 100 ft = (Pa/m)/9806.65*100 */
const RtoFt100=R=>R/9806.65*100;

/* electrical tables (Cu, XLPE 90°C, multicore, IEC 60364-5-52) */
const CBL={size:[1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300],
  R20:[12.1,7.41,4.61,3.08,1.83,1.15,0.727,0.524,0.387,0.268,0.193,0.153,0.124,0.0991,0.0754,0.0601],
  C2:[24,33,45,58,80,107,138,171,209,269,328,382,441,506,599,693],
  C3:[22,30,40,51,70,94,119,148,180,232,282,328,379,434,514,593],
  E2:[26,36,49,63,86,115,149,185,225,289,352,410,473,542,641,741],
  E3:[23,32,42,54,75,100,127,158,192,246,298,346,399,456,538,621]};
const AMB={25:1.04,30:1.00,35:0.96,40:0.91,45:0.87,50:0.82,55:0.76};
const CB=[6,10,16,20,25,32,40,50,63,80,100,125,160,200,250,315,400,500,630,800,1000,1250,1600,2000,2500,3200,4000];
const MOTOR=[0.37,0.55,0.75,1.1,1.5,2.2,3,4,5.5,7.5,11,15,18.5,22,30,37,45,55,75,90,110,132,160,200,250,315,355,400];
const TX=[50,100,160,200,250,315,400,500,630,800,1000,1250,1500,1600,2000,2500,3150];

/* ---------- data from the sheets ---------- */
const PEOPLE=[ // BG-MEC-CS-223: W per person, [sens,lat] at room DB 28/27/26/24/21 °C
 ['Theater, grade school — seated at rest',51,51,57,45,62,41,67,35,76,26],
 ['High school — seated, very light work',53,64,57,60,63,54,70,47,81,37],
 ['Office, hotel, apartment, retail — office work',53,79,59,73,63,69,72,60,84,48],
 ['Bank, drug store — standing, walking slowly',53,94,59,88,64,82,75,72,85,62],
 ['Restaurant — sedentary (incl. food)',56,106,64,97,70,91,82,79,94,67],
 ['Factory — light bench work',56,164,64,155,72,148,86,133,107,113],
 ['Dance hall — moderate dancing',64,185,72,177,81,169,95,154,117,132],
 ['Factory — fairly heavy work',79,214,88,205,97,196,111,182,135,158],
 ['Factory, bowling alley — heavy work',132,293,136,289,142,283,154,271,177,248]];
const ROOMT=[28,27,26,24,21];
const EQUIP_AREA=[['0','No allowance'],['50','High-tech office (50 W/m²)'],['150',"Dealer's room (150 W/m²)"],['750','Telecom switch room (750 W/m²)'],['1000','Mainframe room (1000 W/m²)']];
const VENT62=[ // name, Rp L/s·person, Ra L/s·m², default people per 100 m²
 ['Office space',2.5,0.3,5],['Conference / meeting',2.5,0.3,50],['Reception area',2.5,0.3,30],['Classroom (age 9+)',5,0.6,35],
 ['Lecture classroom',3.8,0.3,65],['Restaurant dining',3.8,0.9,70],['Cafeteria / fast food',3.8,0.9,100],['Retail sales',3.8,0.6,15],
 ['Mall common area',3.8,0.3,40],['Hotel bedroom',2.5,0.3,10],['Lobby / pre-function',3.8,0.3,30],['Place of worship',2.5,0.3,120],
 ['Library',2.5,0.6,10],['Health club / aerobics',10,0.3,40]];
const DUCT_V=[ // BG-MEC-CS-142, recommended / maximum m/s (residence, public, industrial)
 ['Outside air intakes','3.5 / 4.0','4.0 / 4.5','5.0 / 6.0'],['Filters','1.3 / 1.5','1.5 / 1.8','1.8 / 1.8'],['Heating coils','2.3 / 2.5','2.5 / 3.0','3.0 / 3.5'],
 ['Fan outlets','5–8 / 8.5','6.5–10 / 7.5–11','8–12 / 8.5–14'],['Main ducts','3.5–4.5 / 4–5','5–6.5 / 5.5–8','6–9 / 6.5–11'],
 ['Branch ducts','3.0 / 3.5–5','3–4.5 / 4–6.5','4–5 / 5–9'],['Branch risers','2.5 / 3.3–4','3–3.5 / 4–6','4.0 / 5–8']];
const WSFU=[ // name, private, public, flush valve?
 ['Water closet — flush tank',3,5,0],['Water closet — flush valve',6,10,1],['Urinal — flush valve',5,5,1],['Urinal — flush tank',3,3,0],
 ['Lavatory',1,2,0],['Shower',2,4,0],['Bathtub',2,4,0],['Kitchen sink',2,4,0],['Service / mop sink',3,3,0],['Dishwasher',1,2,0],
 ['Clothes washer',2,4,0],['Drinking fountain',0.25,0.25,0],['Bathroom group — tank WC',6,6,0],['Bathroom group — flush valve WC',8,8,1]];
const HUNTER=[[1,3.0,null],[2,5.0,null],[3,6.5,null],[4,8.0,null],[5,9.4,15.0],[6,10.7,17.4],[7,11.8,19.8],[8,12.8,22.2],[9,13.7,24.6],[10,14.6,27.0],
 [12,16.0,28.6],[14,17.0,30.2],[16,18.0,31.8],[18,18.8,33.4],[20,19.6,35.0],[25,21.5,38.0],[30,23.3,42.0],[35,24.9,44.0],[40,26.3,46.0],[45,27.7,48.0],
 [50,29.1,50.0],[60,32.0,54.0],[70,35.0,58.0],[80,38.0,61.2],[90,41.0,64.3],[100,43.5,67.5],[120,48.0,73.0],[140,52.5,77.0],[160,57.0,81.0],[180,61.0,85.5],
 [200,65.0,90.0],[225,70.0,95.5],[250,75.0,101.0],[275,80.0,104.5],[300,85.0,108.0],[400,105,127],[500,124,143],[750,170,177],[1000,208,208],
 [1250,239,239],[1500,269,269],[1750,297,297],[2000,325,325],[2500,380,380],[3000,433,433],[4000,525,525],[5000,593,593]];
const DFU=[['Lavatory',1],['Water closet — tank, private',3],['Water closet — tank, public',4],['Water closet — flush valve',4],['Urinal',4],['Urinal ≤ 1 gpf',2],
 ['Shower',2],['Bathtub',2],['Kitchen sink',2],['Dishwasher',2],['Clothes washer',3],['Floor drain (2")',2],['Service sink',3],['Drinking fountain',0.5],['Bathroom group',5]];
const WC_IDX=[1,2,3,14];
const DRN={n:['1½"','2"','2½"','3"','4"','5"','6"','8"','10"','12"','15"'],
  branch:[3,6,12,20,160,360,620,1400,2500,3900,7000],
  stack3:[4,10,20,48,240,540,960,2200,3800,6000,null],
  stackT:[8,24,42,72,500,1100,1900,3600,5600,8400,null],
  bd18:[null,null,null,36,180,390,700,1600,2900,4600,8300],
  bd14:[3,21,24,42,216,480,840,1920,3500,5600,10000],
  bd12:[3,26,31,50,250,575,1000,2300,4200,6700,12000]};
const LEADER=[['2',2880],['3',8800],['4',18400],['5',34600],['6',54000],['8',116000]]; // ft² at 1 in/h (BG-MEC-CS-360)
const HWB=['Apartment','Hospital','Hotel','Office','School','Gymnasium','Private residence'];
const HWF=[ // gph at 60 °C per fixture for each building type above
 ['Lavatory — private',[2,2,2,2,2,2,2]],['Lavatory — public',[4,6,8,6,15,8,0]],['Bathtub',[20,20,20,0,0,30,20]],['Dishwasher',[15,100,125,0,60,0,15]],
 ['Kitchen sink',[10,20,30,20,20,0,10]],['Laundry tub',[20,28,28,0,0,0,20]],['Pantry sink',[5,10,10,10,10,0,5]],['Shower',[30,75,75,30,225,225,30]],['Service sink',[20,20,30,20,20,0,15]]];
const HW_DF=[0.30,0.25,0.25,0.30,0.40,0.40,0.30], HW_SF=[1.25,0.60,0.80,2.00,1.00,1.00,0.70];
const HAZ=[ // name, density mm/min, area m², max cov m², max spacing m, hose L/min, duration min
 ['Light hazard',4.1,139,20.9,4.6,379,30],['Ordinary hazard group 1',6.1,139,12.1,4.6,946,60],['Ordinary hazard group 2',8.1,139,12.1,4.6,946,60],
 ['Extra hazard group 1',12.2,232,9.3,3.7,1893,90],['Extra hazard group 2',16.3,232,9.3,3.7,1893,120]];
const AGENT=[['FM-200 (HFC-227ea)',0.1269,0.000513,7.0,9.0],['Novec 1230 (FK-5-1-12)',0.0664,0.0002741,4.5,10.0]];
const PF_STD=[5,10,15,20,25,30,40,50,60,75,100,125,150,175,200,250,300,350,400,450,500,600,700,800,900,1000,1200,1500];
const LUX=[['500','Office / drawing work — 500 lx'],['300','Classroom / prayer hall — 300 lx'],['750','Technical drawing — 750 lx'],['200','Lobby / reception — 200 lx'],['150','Plant / A/C room — 150 lx'],['100','Corridor / stairs — 100 lx'],['1000','Detailed inspection — 1000 lx']];
const UF_EST=[[0.6,0.40],[0.8,0.48],[1.0,0.53],[1.25,0.58],[1.5,0.62],[2.0,0.67],[2.5,0.71],[3.0,0.73],[4.0,0.76],[5.0,0.78]];
const LAMBDA={2:1.00,3:1.67,4:2.15,5:2.54,6:2.87,7:3.14,8:3.39,9:3.61,10:3.81};
const CONDUIT=[16,20,25,32,40,50,63,75,100,150];
const TRAY=[50,100,150,200,300,450,600,750,900];

/* ---------- calculators ---------- */
const GDISC={HV:'mec',PL:'mec',FP:'mec',EL:'ele',ST:'str',CV:'civ',GN:'gen',OP:'prc',AR:'arc'};
const GROUPS=[['HV','HVAC'],['PL','Plumbing'],['FP','Fire protection'],['EL','Electrical'],['AR','Architecture'],['ST','Structural'],['CV','Civil & geotechnical'],['GN','Fundamentals'],['OP','Site & quality control']];
const C=[];
const def=o=>C.push(o);

def({id:'cooling-load',g:'HV',code:'HV-01',t:'Room cooling load',
 d:'Quick sensible and latent cooling load for a room using the rule-of-thumb equations from the AC Equations sheet and the ASHRAE people heat-gain table.',
 src:[['BG-MEC-CS-012','AC Equations'],['BG-MEC-CS-223','Heat Gain From People'],['BG-MEC-CS-073','cool-load']],
 inp:[{h:'Room'},{id:'L',l:'Length',u:'m',v:12},{id:'W',l:'Width',u:'m',v:8},{id:'H',l:'Height',u:'m',v:3},
  {id:'tr',l:'Room design temperature',type:'sel',o:ROOMT.map((t,i)=>[String(i),t+' °C DB']),v:'3'},
  {h:'Internal gains'},{id:'n',l:'Number of people',u:'pers',v:12},{id:'act',l:'Activity',type:'sel',o:opt(PEOPLE.map(p=>p[0])),v:'2',wide:1},
  {id:'lw',l:'Installed lighting',u:'W',v:1100},{id:'lt',l:'Lighting type',type:'sel',o:[['1.22','Fluorescent (×1.22 ballast)'],['1','LED / incandescent (×1.0)']],v:'1.22'},
  {id:'eq',l:'Equipment (sensible)',u:'W',v:2400},{id:'ea',l:'Area-based equipment',type:'sel',o:EQUIP_AREA,v:'0'},
  {id:'sf',l:'Safety factor',u:'%',v:10}],
 calc(v){
  const A=v.L*v.W, V=A*v.H, p=PEOPLE[+v.act], ti=+v.tr, ps=p[1+ti*2], pl=p[2+ti*2];
  const fab=V*30, fa=V*5, li=v.lw*(+v.lt), pS=v.n*ps, pL=v.n*pl, eqA=A*(+v.ea), eq=v.eq;
  const S=fab+fa+li+pS+eqA+eq, Lt=pL, k=1+v.sf/100, T=(S+Lt)*k;
  return {res:[
   {l:'Total cooling load',v:T/1000,u:'kW',key:1},{l:'Cooling capacity',v:T/3516.85,u:'TR',key:1},
   {l:'Total',v:T*3.41214,u:'BTU/h',d:0},{l:'Sensible / latent',v:fmt(S*k/1000,2)+' / '+fmt(Lt*k/1000,2),u:'kW'},
   {l:'Sensible heat ratio',v:S/(S+Lt),d:2},{l:'Load density',v:T/A,u:'W/m²',d:0},{l:'Area per TR',v:A/(T/3516.85),u:'m²/TR',d:1}],
   tbl:{head:['Component','Rule','W'],rows:[
    ['Building fabric & solar','30 W per m³ of volume',fmt(fab,0)],['Fresh air & infiltration','5 W per m³',fmt(fa,0)],
    ['Lighting','installed W × '+v.lt,fmt(li,0)],['People — sensible',v.n+' × '+ps+' W',fmt(pS,0)],['People — latent',v.n+' × '+pl+' W',fmt(pL,0)],
    ['Equipment',fmt(v.eq,0)+' W + '+v.ea+' W/m²',fmt(eq+eqA,0)],['Safety factor',v.sf+' %',fmt((S+Lt)*(k-1),0)]].map(c=>({c}))},
   chk:[T/A>250?{s:'warn',t:'Load density above 250 W/m². Check the inputs or use a full load calculation (HAP / ASHRAE RTS).'}:{s:'ok',t:'Load density is in the usual range for a quick estimate.'}]};
 },
 f:['Fabric = V × 30 W        Fresh air = V × 5 W','Lighting = W × 1.22 (fluorescent)','People = n × (sensible + latent) from table','Total = Σ × (1 + SF)        1 TR = 3.517 kW'],
 notes:['This is the rule-of-thumb method in the AC Equations sheet. Use it for early sizing, not for final equipment selection.']});

def({id:'air-change',g:'HV',code:'HV-02',t:'Air change rate',
 d:'Airflow needed to achieve a given number of air changes per hour in a room.',
 src:[['BG-MEC-CS-024','Air Change (Multaqa)'],['BG-MEC-CS-198','FRESH AIR']],
 inp:[{id:'L',l:'Length',u:'m',v:10},{id:'W',l:'Width',u:'m',v:6},{id:'H',l:'Height',u:'m',v:3},{id:'ach',l:'Air changes',u:'ACH',v:10}],
 calc(v){const A=v.L*v.W,V=A*v.H,q=V*v.ach;
  return {res:[{l:'Required airflow',v:q*0.588578,u:'CFM',key:1,d:0},{l:'Required airflow',v:q/3.6,u:'L/s',key:1,d:0},
   {l:'Required airflow',v:q,u:'m³/h',d:0},{l:'Room area',v:A,u:'m²'},{l:'Room volume',v:V,u:'m³'}]};},
 f:['Q (m³/h) = L × W × H × ACH','CFM = m³/h × 0.5886        L/s = m³/h ÷ 3.6']});

def({id:'fresh-air',g:'HV',code:'HV-03',t:'Outdoor air (ASHRAE 62.1)',
 d:'Breathing-zone outdoor air from the people and area rates of ASHRAE 62.1, ventilation rate procedure.',
 src:[['BG-MEC-CS-468','Fresh air — CFM per person'],['BG-MEC-CS-469','Fresh air — CFM per m²'],['BG-MEC-CS-198','FRESH AIR']],
 inp:[{id:'occ',l:'Occupancy category',type:'sel',o:opt(VENT62.map(x=>x[0])),v:'0',wide:1},{id:'A',l:'Floor area',u:'m²',v:400},
  {id:'P',l:'Occupants',u:'pers',v:0,hint:'0 = use the default density'},
  {id:'ez',l:'Zone air distribution Ez',type:'sel',o:[['1','1.0 — ceiling supply, cooling'],['0.8','0.8 — ceiling supply, warm air'],['1.2','1.2 — floor supply, displacement']],v:'1',wide:1}],
 calc(v){const c=VENT62[+v.occ],P=v.P>0?v.P:Math.ceil(c[3]*v.A/100),Vbz=c[1]*P+c[2]*v.A,Voz=Vbz/(+v.ez);
  return {res:[{l:'Zone outdoor air Voz',v:Voz,u:'L/s',key:1,d:0},{l:'Zone outdoor air Voz',v:Voz*2.11888,u:'CFM',key:1,d:0},
   {l:'Zone outdoor air',v:Voz*3.6,u:'m³/h',d:0},{l:'Occupants used',v:P,u:'pers',d:0},{l:'People component Rp·Pz',v:c[1]*P,u:'L/s',d:1},
   {l:'Area component Ra·Az',v:c[2]*v.A,u:'L/s',d:1},{l:'Per person',v:Voz/P,u:'L/s·p',d:1}],
   tbl:{head:['Category','Rp L/s·p','Ra L/s·m²','Default /100 m²'],rows:VENT62.map((x,i)=>({hl:i==v.occ,c:[x[0],fmt(x[1],1),fmt(x[2],1),x[3]]}))}};},
 f:['Vbz = Rp × Pz + Ra × Az','Voz = Vbz ÷ Ez']});

def({id:'duct',g:'HV',code:'HV-04',t:'Duct sizing',
 d:'Size a round and rectangular duct by velocity or by equal friction rate, with the friction loss of the chosen size.',
 src:[['BG-MEC-CS-025','Air Duct Calculator'],['BG-MEC-CS-138','DUCT SIZER'],['BG-MEC-CS-142','Duct Velocities'],['BG-MEC-CS-154','E-Ductulator09']],
 inp:[{id:'Q',l:'Airflow',u:'L/s',v:1500},{id:'m',l:'Sizing method',type:'sel',o:[['f','Equal friction'],['v','Velocity']],v:'f'},
  {id:'R',l:'Friction rate (equal friction)',u:'Pa/m',v:1.0},{id:'V',l:'Velocity (velocity method)',u:'m/s',v:6},
  {id:'h',l:'Rectangular duct depth',u:'mm',v:300},{id:'eps',l:'Duct material',type:'sel',o:[['0.09','Galvanised steel (ε 0.09 mm)'],['0.9','Flexible duct (ε 0.9 mm)'],['0.15','Fibreglass duct board (ε 0.15 mm)']],v:'0.09'}],
 calc(v){
  const Q=v.Q/1000, rho=1.2, nu=1.5e-5, e=(+v.eps)/1000;
  const dp=(D,Vv)=>{const Re=Vv*D/nu;let f=0.11*Math.pow(e/D+68/Re,0.25);if(f<0.018)f=0.85*f+0.0028;return f/D*rho*Vv*Vv/2};
  const dpQ=D=>dp(D,Q/(PI*D*D/4));
  let D= v.m==='v'? Math.sqrt(4*Q/(PI*v.V)) : bisect(D=>dpQ(D)-v.R,0.03,5);
  const Dr=Math.max(100,Math.ceil(D*1000/50-1e-9)*50)/1000;
  const De=(a,b)=>1.30*Math.pow(a*b,0.625)/Math.pow(a+b,0.25);
  const H=v.h/1000; let W=bisect(w=>De(w,H)-D,0.02,20); const Wr=Math.max(100,Math.ceil(W*1000/50-1e-9)*50)/1000;
  const vr=Q/(PI*Dr*Dr/4), vrect=Q/(Wr*H), Der=De(Wr,H), ar=Math.max(Wr,H)/Math.min(Wr,H);
  return {res:[{l:'Round duct',v:fmt(Dr*1000,0)+' Ø',u:'mm',key:1},{l:'Rectangular duct',v:fmt(Wr*1000,0)+' × '+fmt(v.h,0),u:'mm',key:1},
   {l:'Theoretical diameter',v:D*1000,u:'mm',d:0},{l:'Velocity — round',v:vr,u:'m/s'},{l:'Friction — round',v:dpQ(Dr),u:'Pa/m',d:2},
   {l:'Velocity — rectangular',v:vrect,u:'m/s'},{l:'Friction — rectangular',v:dp(Der,Q/(PI*Der*Der/4)),u:'Pa/m',d:2},
   {l:'Equivalent diameter (rect.)',v:Der*1000,u:'mm',d:0},{l:'Velocity pressure',v:0.5*rho*vrect*vrect,u:'Pa',d:1},{l:'Airflow',v:v.Q*2.11888,u:'CFM',d:0}],
   chk:[ar>4?{s:'warn',t:'Aspect ratio '+fmt(ar,1)+':1 is above 4:1. Increase the depth.'}:{s:'ok',t:'Aspect ratio '+fmt(ar,1)+':1.'},
    vrect>10?{s:'warn',t:'Velocity above 10 m/s: expect noise in occupied spaces.'}:{s:'ok',t:'Velocity within low-velocity range.'}],
   tbl:{cap:'Recommended / maximum velocities, m/s (BG-MEC-CS-142)',head:['Element','Residence','Public buildings','Industrial'],rows:DUCT_V.map(c=>({c}))}};
 },
 f:['Δp/L = f / D × ρV²/2         f′ = 0.11 (ε/D + 68/Re)^0.25 (Altshul-Tsal)','De = 1.30 (a·b)^0.625 / (a+b)^0.25  (Huebscher)'],
 notes:['Sizes round up to the next 50 mm. Air at 1.2 kg/m³, 20 °C.']});

def({id:'supply-air',g:'HV',code:'HV-05',t:'Supply airflow',
 d:'Supply air quantity needed to remove a room sensible load at a given supply-to-room temperature difference.',
 src:[['BG-MEC-CS-411','SUPPLY AIR'],['BG-MEC-CS-012','AC Equations']],
 inp:[{id:'q',l:'Room sensible load',u:'kW',v:12},{id:'tr',l:'Room temperature',u:'°C',v:24},{id:'ts',l:'Supply air temperature',u:'°C',v:13}],
 calc(v){const dT=v.tr-v.ts, Q=v.q*1000/(1.23*dT);
  return {res:[{l:'Supply airflow',v:Q,u:'L/s',key:1,d:0},{l:'Supply airflow',v:Q*2.11888,u:'CFM',key:1,d:0},{l:'Supply airflow',v:Q*3.6,u:'m³/h',d:0},{l:'ΔT',v:dT,u:'K',d:1},{l:'CFM per TR (sensible)',v:Q*2.11888/(v.q/3.51685),d:0}],
   chk:[dT<=0?{s:'bad',t:'Supply temperature must be below room temperature.'}:dT>14?{s:'warn',t:'ΔT above 14 K risks draughts and condensation at diffusers.'}:{s:'ok',t:'ΔT is in the normal 8–12 K range or close to it.'}]};},
 f:['Q (L/s) = Qs (W) ÷ (1.23 × ΔT)']});

def({id:'air-heat',g:'HV',code:'HV-06',t:'Air heat transfer',
 d:'Sensible, latent and total heat carried by an airstream, for coil loads and fresh air loads.',
 src:[['BG-MEC-CS-333','PsychProcess08'],['BG-MEC-CS-116','Dehumidification Calculation'],['BG-MEC-CS-012','AC Equations']],
 inp:[{id:'Q',l:'Airflow',u:'L/s',v:1000},{id:'dt',l:'Dry-bulb difference',u:'K',v:12},{id:'dw',l:'Moisture difference',u:'g/kg',v:6}],
 calc(v){const s=1.23*v.Q*v.dt,l=3.01*v.Q*v.dw,t=s+l;
  return {res:[{l:'Total heat',v:t/1000,u:'kW',key:1},{l:'Total',v:t/3516.85,u:'TR',key:1},{l:'Sensible',v:s/1000,u:'kW'},{l:'Latent',v:l/1000,u:'kW'},{l:'Sensible heat ratio',v:s/t,d:2},{l:'Condensate',v:v.Q*1.2*v.dw/1000*3.6,u:'L/h',d:1}]};},
 f:['Qs = 1.23 × Q × ΔT        (W, Q in L/s)','Ql = 3.01 × Q × Δw        (Δw in g/kg)','Condensate = ρ × Q × Δw']});

def({id:'stair-press',g:'HV',code:'HV-07',t:'Stair pressurisation',
 d:'Fan airflow for a pressurised escape stair: leakage with all doors closed plus airflow across open doors.',
 src:[['BG-MEC-CS-382','Stair case pressurization'],['BG-MEC-CS-394','Staircase Pressurization'],['BG-MEC-CS-396','Stairwell Press — open door']],
 inp:[{h:'Doors closed'},{id:'nd',l:'Stair doors',u:'no.',v:4},{id:'al',l:'Leakage area per door',u:'m²',v:0.03},{id:'p',l:'Pressure differential',u:'Pa',v:25},
  {id:'n',l:'Leakage exponent n',u:'',v:2},{id:'ex',l:'Allowance for unknown leaks',u:'%',v:50},
  {h:'Doors open'},{id:'dh',l:'Door height',u:'m',v:2.1},{id:'dw',l:'Door width',u:'m',v:0.9},{id:'vel',l:'Velocity through open door',u:'m/s',v:2},
  {id:'oe',l:'Escape doors fully open',u:'no.',v:1},{id:'oo',l:'Other doors open (counted at 50 %)',u:'no.',v:1}],
 calc(v){const AE=v.nd*v.al,Q1=0.827*AE*Math.pow(v.p,1/v.n),Q1a=Q1*(1+v.ex/100),Ad=v.dh*v.dw,Ao=v.oe*Ad+v.oo*0.5*Ad,Q2=Ao*v.vel,QT=Q1a+Q2;
  return {res:[{l:'Total fan airflow',v:QT,u:'m³/s',key:1,d:3},{l:'Total fan airflow',v:QT*2118.88,u:'CFM',key:1,d:0},{l:'Total fan airflow',v:QT*1000,u:'L/s',d:0},
   {l:'Q1 — doors closed',v:Q1,u:'m³/s',d:4},{l:'Q1 with allowance',v:Q1a,u:'m³/s',d:4},{l:'Leakage area AE',v:AE,u:'m²',d:3},{l:'Open door area',v:Ao,u:'m²',d:3},{l:'Q2 — doors open',v:Q2,u:'m³/s',d:3}]};},
 f:['Q1 = 0.827 × AE × P^(1/n)','Q2 = A_open × V','QT = Q1 × (1 + allowance) + Q2'],
 ex:'Defaults reproduce the ACC sheet of BG-MEC-CS-382: QT = 6.414 m³/s.'});

def({id:'chw',g:'HV',code:'HV-08',t:'Chilled water flow & pipe size',
 d:'Water flow for a cooling or heating load, and the smallest pipe that meets velocity and friction limits.',
 src:[['BG-MEC-CS-051','CH PIPE SIZE SELECTION'],['BG-MEC-CS-062','chw pipe size'],['BG-MEC-CS-304','PIPE FRICTION CALCULATION'],['BG-MEC-CS-305','PIPE SIZER']],
 inp:[{id:'q',l:'Load',u:'kW',v:350},{id:'dt',l:'Water ΔT',u:'K',v:5.56},{id:'T',l:'Mean water temperature',u:'°C',v:9},
  {id:'mat',l:'Pipe material',type:'sel',o:[['steel','Steel Sch 40'],['copper','Copper Type L']],v:'steel'},
  {id:'vmax',l:'Max velocity',u:'m/s',v:3.0},{id:'rmax',l:'Max friction',u:'Pa/m',v:400}],
 calc(v){const cp=4.19,Q=v.q/(cp*v.dt*rhoW(v.T)/1000),ps=pipeSelect(Q,v.mat,v.T,v.vmax,v.rmax),s=ps.rows[ps.sel];
  return {res:[{l:'Water flow',v:Q,u:'L/s',key:1},{l:'Water flow',v:Q*15.8503,u:'US gpm',key:1,d:1},{l:'Water flow',v:Q*3.6,u:'m³/h',d:1},
   {l:'Selected pipe',v:s?s.n:'none',u:s?ps.P.name:'',key:1},{l:'Velocity',v:s?s.v:NaN,u:'m/s'},{l:'Friction',v:s?s.R:NaN,u:'Pa/m',d:0},{l:'Friction',v:s?RtoFt100(s.R):NaN,u:'ft/100 ft',d:2},{l:'Load',v:v.q/3.51685,u:'TR',d:1}],
   chk:[s?{s:'ok',t:'Smallest size meeting both limits.'}:{s:'bad',t:'No size in the list meets the limits. Raise the limits or split the flow.'}],
   tbl:pipeTbl(ps)};},
 f:['Q = kW ÷ (cp × ΔT × ρ)','Δp/L = f / D × ρv²/2   (Darcy, Swamee-Jain f)'],
 notes:['1 TR at 10 °F ΔT ≈ 2.4 US gpm. Typical limits: 400 Pa/m (4 ft/100 ft), 1.2 m/s up to 2", 3 m/s for large mains.']});

def({id:'pump-head',g:'HV',code:'HV-09',t:'Pump head & motor',
 d:'Pump head from static lift, pipe friction, fittings and equipment pressure drops, and the motor size it needs.',
 src:[['BG-MEC-CS-338','PUMP HEAD'],['BG-MEC-CS-054','chilled water pump head calculation'],['BG-MEC-CS-350','Pumps Head Calculation Sheet'],['BG-MEC-CS-417','System Head Calculation Worksheet']],
 inp:[{id:'Q',l:'Flow',u:'L/s',v:15},{id:'hs',l:'Static head',u:'m',v:0,hint:'0 for a closed loop'},{id:'L',l:'Pipe length (index run)',u:'m',v:180},
  {id:'R',l:'Friction rate',u:'Pa/m',v:300},{id:'fit',l:'Fittings allowance',u:'% of pipe',v:50},
  {id:'e1',l:'Chiller / heat exchanger',u:'kPa',v:60},{id:'e2',l:'Coil / AHU',u:'kPa',v:40},{id:'e3',l:'Control valve',u:'kPa',v:35},{id:'e4',l:'Strainer, other',u:'kPa',v:15},
  {id:'sf',l:'Safety factor',u:'%',v:10},{id:'ep',l:'Pump efficiency',u:'%',v:70},{id:'em',l:'Motor efficiency',u:'%',v:90}],
 calc(v){const hp=v.L*(1+v.fit/100)*v.R/9806.65,he=(v.e1+v.e2+v.e3+v.e4)/9.80665,H=(v.hs+hp+he)*(1+v.sf/100),
  Ph=9.80665*v.Q*H/1000,Ps=Ph/(v.ep/100),Pm=Ps/(v.em/100),m=nextStd(Ps*1.1,MOTOR);
  return {res:[{l:'Pump head',v:H,u:'m',key:1,d:1},{l:'Pump head',v:H*9.80665,u:'kPa',d:0},{l:'Pump head',v:H*3.28084,u:'ft',d:1},
   {l:'Hydraulic power',v:Ph,u:'kW'},{l:'Shaft power',v:Ps,u:'kW'},{l:'Electrical input',v:Pm,u:'kW'},{l:'Motor rating (shaft + 10 %)',v:m,u:'kW',key:1}],
   tbl:{head:['Component','m'],rows:[['Static',fmt(v.hs,2)],['Pipe + fittings',fmt(hp,2)],['Equipment',fmt(he,2)],['Safety factor',fmt(H-(v.hs+hp+he),2)],['Total',fmt(H,2)]].map((c,i)=>({c,hl:i==4}))}};},
 f:['H = [Hs + L(1+k)R/ρg + ΣΔp/ρg] × (1 + SF)','P = ρ g Q H ÷ (ηp × ηm)']});

def({id:'exp-tank',g:'HV',code:'HV-10',t:'Expansion tank',
 d:'Expansion volume of a closed water system and the size of a diaphragm or plain tank to absorb it.',
 src:[['BG-MEC-CS-174','ExpansionTank Sizing'],['BG-MEC-CS-168','Exp-Tank'],['BG-MEC-CS-177','External HVAC CHW Expn']],
 inp:[{id:'Vs',l:'System water volume',u:'L',v:8000},{id:'t1',l:'Fill (lowest) temperature',u:'°C',v:10},{id:'t2',l:'Highest temperature',u:'°C',v:40},
  {id:'p1',l:'Fill pressure at tank',u:'bar g',v:1.5},{id:'p2',l:'Max pressure at tank',u:'bar g',v:4.5,hint:'≈ 90 % of relief valve setting'},
  {id:'a',l:'Pipe material',type:'sel',o:[['11.7e-6','Steel'],['16.7e-6','Copper']],v:'11.7e-6'}],
 calc(v){const a=+v.a,r1=rhoW(v.t1),r2=rhoW(v.t2),Ve=v.Vs*((r1/r2-1)-3*a*(v.t2-v.t1)),P1=v.p1+1.01325,P2=v.p2+1.01325,Pa=1.01325,
  Vd=Ve/(1-P1/P2),Vp=Ve/(Pa/P1-Pa/P2);
  return {res:[{l:'Diaphragm tank volume',v:Vd,u:'L',key:1,d:0},{l:'Expansion volume',v:Ve,u:'L',d:1},{l:'Acceptance factor',v:1-P1/P2,d:3},{l:'Plain (air-water) tank',v:Vp,u:'L',d:0},
   {l:'Water density at fill / max',v:fmt(r1,1)+' / '+fmt(r2,1),u:'kg/m³'}],
   chk:[v.p2<=v.p1?{s:'bad',t:'Max pressure must be above fill pressure.'}:{s:'ok',t:'Select the next larger standard tank with an acceptance volume ≥ '+fmt(Ve,0)+' L.'}]};},
 f:['Ve = Vs [(ρ1/ρ2 − 1) − 3α Δt]','Diaphragm: Vt = Ve ÷ (1 − P1/P2)    (absolute pressures)','Plain: Vt = Ve ÷ (Pa/P1 − Pa/P2)'],
 notes:['ASHRAE Handbook — HVAC Systems & Equipment, Ch. 13 method.']});

def({id:'fan',g:'HV',code:'HV-11',t:'Fan power',
 d:'Absorbed and motor power for a fan from airflow and total pressure.',
 src:[['BG-MEC-CS-183','Fans calculations'],['BG-MEC-CS-182','Fan Static Pressure — DAR'],['BG-MEC-CS-165','EXHAUST FANS']],
 inp:[{id:'Q',l:'Airflow',u:'L/s',v:5000},{id:'p',l:'Fan total pressure',u:'Pa',v:750},{id:'ef',l:'Fan efficiency',u:'%',v:65},{id:'ed',l:'Drive efficiency',u:'%',v:95},{id:'mg',l:'Motor margin',u:'%',v:15}],
 calc(v){const Pa=v.Q/1000*v.p/1000,Ps=Pa/(v.ef/100)/(v.ed/100),m=nextStd(Ps*(1+v.mg/100),MOTOR);
  return {res:[{l:'Motor rating',v:m,u:'kW',key:1},{l:'Shaft power',v:Ps,u:'kW'},{l:'Air power',v:Pa,u:'kW'},{l:'Specific fan power',v:Ps/(v.Q/1000),u:'kW/(m³/s)'},{l:'Airflow',v:v.Q*2.11888,u:'CFM',d:0},{l:'Pressure',v:v.p/249.089,u:'in wg',d:2}]};},
 f:['Air power = Q × Δp','Shaft = Air power ÷ (ηfan × ηdrive)']});

def({id:'genset-vent',g:'HV',code:'HV-12',t:'Generator room ventilation',
 d:'Ventilation for a generator room: air to carry away radiated heat plus engine combustion air, and louvre areas.',
 src:[['BG-MEC-CS-205','Generator Room Ventilation (DAR)'],['BG-MEC-CS-203','generator room'],['BG-ELE-CS-048','generator room']],
 inp:[{id:'H',l:'Heat radiated to room',u:'kW',v:60,hint:'From the generator datasheet'},{id:'dt',l:'Allowed temperature rise',u:'K',v:8},
  {id:'c',l:'Combustion air',u:'m³/min',v:40},{id:'vi',l:'Intake louvre face velocity',u:'m/s',v:2.0},{id:'fa',l:'Louvre free area ratio',u:'%',v:50}],
 calc(v){const Qh=v.H/(1.2*1.005*v.dt),Qc=v.c/60,Q=Qh+Qc,A=Q/v.vi/(v.fa/100);
  return {res:[{l:'Intake airflow',v:Q,u:'m³/s',key:1,d:2},{l:'Intake airflow',v:Q*2118.88,u:'CFM',key:1,d:0},{l:'Heat removal air',v:Qh,u:'m³/s',d:2},
   {l:'Combustion air',v:Qc,u:'m³/s',d:2},{l:'Intake louvre gross area',v:A,u:'m²',d:2},{l:'Exhaust air (excl. combustion)',v:Qh,u:'m³/s',d:2}]};},
 f:['Q heat = H ÷ (ρ cp ΔT)','Q intake = Q heat + Q combustion','Louvre area = Q ÷ (v × free-area ratio)']});

/* ---- plumbing ---- */
def({id:'wsfu',g:'PL',code:'PL-01',t:'Water demand (fixture units)',
 d:'Probable peak water demand by the Hunter fixture-unit method, and the supply pipe size it needs.',
 src:[['BG-MEC-CS-460','WFU-NEW'],['BG-MEC-CS-449','Water Demand'],['BG-MEC-CS-129','Domestic-Water-Sizing-v2'],['BG-MEC-CS-453','Water pipes size']],
 inp:[{id:'use',l:'Occupancy',type:'sel',o:[['1','Private (dwellings)'],['2','Public']],v:'2',onchange:'refu'},
  {id:'mat',l:'Pipe material',type:'sel',o:[['ppr','PPR PN20'],['copper','Copper Type L'],['steel','Steel Sch 40']],v:'ppr'},
  {id:'vmax',l:'Max velocity',u:'m/s',v:2.0},{id:'rmax',l:'Max friction',u:'Pa/m',v:800},
  {id:'rows',type:'rows',cols:[{id:'f',l:'Fixture',type:'sel',o:opt(WSFU.map(x=>x[0])),set:(r,s)=>{r.fu=WSFU[+r.f][+s.use]}},{id:'q',l:'Qty',v:1},{id:'fu',l:'FU each',v:1}],
   v:[{f:'1',q:10,fu:10},{f:'2',q:4,fu:5},{f:'4',q:12,fu:2},{f:'8',q:2,fu:3}]}],
 refu(s){s.rows.forEach(r=>r.fu=WSFU[+r.f][+s.use]);},
 calc(v){let fu=0,fv=false;v.rows.forEach(r=>{fu+=(+r.q||0)*(+r.fu||0);if(WSFU[+r.f][3]&&+r.q>0)fv=true;});
  const curve=HUNTER.filter(x=>fv?x[2]!==null:true).map(x=>[x[0],fv?x[2]:x[1]]);
  const gpm=fu>0?interp(curve,fu):0,Q=gpm*0.0630902,ps=pipeSelect(Q,v.mat,20,v.vmax,v.rmax),s=ps.rows[ps.sel];
  return {res:[{l:'Total fixture units',v:fu,u:'WSFU',d:1},{l:'Probable demand',v:Q,u:'L/s',key:1},{l:'Probable demand',v:gpm,u:'US gpm',d:1},
   {l:'Demand curve',v:fv?'flush valve':'flush tank'},{l:'Main pipe size',v:s?s.n:'none',u:s?ps.P.name:'',key:1},{l:'Velocity',v:s?s.v:NaN,u:'m/s'},{l:'Friction',v:s?s.R:NaN,u:'Pa/m',d:0}],
   chk:[s?{s:'ok',t:'Smallest size meeting both limits.'}:{s:'bad',t:'No size meets the limits. Raise them or choose a larger pipe range.'}],tbl:pipeTbl(ps)};},
 f:['Demand = Hunter curve (IPC Appendix E, Table E103.3(3))','Flush-valve curve is used when any flush-valve fixture is present.'],
 notes:['FU values follow the Hunter (UPC/NPC) table; edit any row to match your code.']});

def({id:'dfu',g:'PL',code:'PL-02',t:'Drainage pipe size',
 d:'Total drainage fixture units and the minimum pipe size for a horizontal branch, stack or building drain.',
 src:[['BG-MEC-CS-130','Drainage Spreadsheet July 2012'],['BG-MEC-CS-207','gravity lines'],['BG-MEC-CS-208','gravity lines — Drainage']],
 inp:[{id:'t',l:'Pipe use',type:'sel',o:[['branch','Horizontal fixture branch'],['stack3','Stack — up to 3 branch intervals'],['stackT','Stack — total, more than 3 intervals'],['bd18','Building drain at 1 % (⅛"/ft)'],['bd14','Building drain at 2 % (¼"/ft)'],['bd12','Building drain at 4 % (½"/ft)']],v:'bd14',wide:1},
  {id:'rows',type:'rows',cols:[{id:'f',l:'Fixture',type:'sel',o:opt(DFU.map(x=>x[0])),set:r=>{r.fu=DFU[+r.f][1]}},{id:'q',l:'Qty',v:1},{id:'fu',l:'DFU each',v:1}],
   v:[{f:'2',q:20,fu:4},{f:'0',q:24,fu:1},{f:'4',q:6,fu:4},{f:'11',q:8,fu:2}]}],
 calc(v){let fu=0,wc=false;v.rows.forEach(r=>{fu+=(+r.q||0)*(+r.fu||0);if(WC_IDX.includes(+r.f)&&+r.q>0)wc=true;});
  const cap=DRN[v.t];let i=cap.findIndex(c=>c!==null&&c>=fu);let bumped=false;if(wc&&i>=0&&i<3){i=3;bumped=true;}
  return {res:[{l:'Total drainage fixture units',v:fu,u:'DFU',d:1},{l:'Minimum pipe size',v:i>=0?DRN.n[i]:'> 15"',key:1},{l:'Capacity of that size',v:i>=0?cap[i]:NaN,u:'DFU',d:0}],
   chk:[bumped?{s:'warn',t:'Raised to 3" because water closets discharge into this pipe.'}:{s:'ok',t:'Size from IPC Table 710.1.'},fu>0&&i<0?{s:'bad',t:'Load exceeds the table. Split the system.'}:null].filter(Boolean),
   tbl:{head:['Size','Max DFU'],rows:DRN.n.map((n,k)=>({hl:k===i,dim:cap[k]===null,c:[n,cap[k]===null?'—':cap[k]]}))}};},
 notes:['Sizes and capacities from IPC Tables 709.1, 710.1(1) and 710.1(2).']});

def({id:'roof-drain',g:'PL',code:'PL-03',t:'Roof rainwater drains',
 d:'Number of vertical rainwater leaders for a roof area at a design rainfall intensity.',
 src:[['BG-MEC-CS-360','roofrain drain calculation']],
 inp:[{id:'A',l:'Roof area',u:'m²',v:1200},{id:'i',l:'Rainfall intensity',u:'mm/h',v:75},{id:'s',l:'Leader size',type:'sel',o:LEADER.map((x,k)=>[String(k),x[0]+'"']),v:'2'}],
 calc(v){const inh=v.i/25.4,cap=LEADER[+v.s][1]/inh*0.09290304,n=Math.ceil(v.A/cap-1e-9),Q=v.A*v.i/3600;
  return {res:[{l:'Number of leaders',v:n,key:1,d:0},{l:'Area per leader (max)',v:cap,u:'m²',d:0},{l:'Total rain flow',v:Q,u:'L/s',d:1},{l:'Rainfall',v:inh,u:'in/h',d:2}],
   tbl:{head:['Leader','Max roof area m² at '+fmt(v.i,0)+' mm/h'],rows:LEADER.map((x,k)=>({hl:k==v.s,c:[x[0]+'"',fmt(x[1]/inh*0.09290304,0)]}))}};},
 f:['Allowable area = A(1 in/h) ÷ rainfall (in/h)','Leaders = roof area ÷ allowable area']});

def({id:'hazen',g:'PL',code:'PL-04',t:'Pipe friction (Hazen-Williams)',
 d:'Friction loss and velocity for water in a pipe, as used for water supply and fire protection.',
 src:[['BG-MEC-CS-213','hazen-williams-equation'],['BG-MEC-CS-220','Head loss calculation — fire hydrant'],['BG-MEC-CS-303','Pipe Flow HW']],
 inp:[{id:'Q',l:'Flow',u:'L/s',v:10},{id:'d',l:'Internal diameter',u:'mm',v:77.9},{id:'C',l:'C factor',type:'sel',o:[['150','150 — PVC, PPR, copper'],['140','140 — new steel / ductile lined'],['120','120 — steel (NFPA wet)'],['100','100 — old steel / dry system']],v:'120'},{id:'L',l:'Equivalent length',u:'m',v:100}],
 calc(v){const Q=v.Q/1000,D=v.d/1000,h=10.67*Math.pow(Q,1.852)/(Math.pow(+v.C,1.852)*Math.pow(D,4.8704)),vel=Q/(PI*D*D/4);
  return {res:[{l:'Head loss',v:h*v.L,u:'m',key:1},{l:'Pressure loss',v:h*v.L*9.80665/100,u:'bar',key:1,d:3},{l:'Loss per 100 m',v:h*100,u:'m',d:2},
   {l:'Loss',v:h*9806.65,u:'Pa/m',d:0},{l:'Loss',v:h*9806.65/22620.6,u:'psi/ft',d:4},{l:'Velocity',v:vel,u:'m/s'}],
   chk:[vel>3?{s:'warn',t:'Velocity above 3 m/s.'}:{s:'ok',t:'Velocity within normal limits.'}]};},
 f:['hf = 10.67 L Q^1.852 ÷ (C^1.852 d^4.87)   (SI)','p = 4.52 Q^1.85 ÷ (C^1.85 d^4.87)   (psi/ft, gpm, in)']});

def({id:'hot-water',g:'PL',code:'PL-05',t:'Hot water heater & storage',
 d:'Probable hot water demand, storage volume and heater rating by the ASHRAE fixture method.',
 src:[['BG-MEC-CS-226','HOT WATER CALCULATION'],['BG-MEC-CS-125','Domestic Hot Water Cylinders capacities'],['BG-MEC-CS-122','DHWC-1']],
 inp:[{id:'b',l:'Building type',type:'sel',o:opt(HWB),v:'2'},{id:'dt',l:'Temperature rise',u:'K',v:45},{id:'uf',l:'Usable storage fraction',u:'%',v:70},
  {id:'rows',type:'rows',cols:[{id:'f',l:'Fixture',type:'sel',o:opt(HWF.map(x=>x[0]))},{id:'q',l:'Qty',v:1}],
   v:[{f:'0',q:120},{f:'2',q:120},{f:'7',q:20},{f:'4',q:4},{f:'8',q:6}]}],
 calc(v){const b=+v.b;let g=0;v.rows.forEach(r=>{g+=(+r.q||0)*HWF[+r.f][1][b]});
  const pd=g*HW_DF[b],st=pd*HW_SF[b],Lh=pd*3.78541,stL=st*3.78541,tank=stL/(v.uf/100),kW=Lh*4.186*v.dt/3600;
  return {res:[{l:'Heater rating',v:kW,u:'kW',key:1,d:1},{l:'Storage tank volume',v:tank,u:'L',key:1,d:0},{l:'Probable demand',v:Lh,u:'L/h',d:0},
   {l:'Possible max demand',v:g*3.78541,u:'L/h',d:0},{l:'Usable storage',v:stL,u:'L',d:0},{l:'Demand factor / storage factor',v:fmt(HW_DF[b],2)+' / '+fmt(HW_SF[b],2)}],
   tbl:{head:['Fixture','gph each ('+HWB[b]+')'],rows:HWF.map(x=>({c:[x[0],x[1][b]||'—']}))}};},
 f:['Probable demand = Σ(qty × gph) × demand factor','Storage = probable demand × storage factor ÷ usable fraction','kW = L/h × 4.186 × ΔT ÷ 3600'],
 notes:['Fixture rates at 60 °C from the ASHRAE Handbook — HVAC Applications, service water heating.']});

def({id:'water-tank',g:'PL',code:'PL-06',t:'Water storage tank',
 d:'Domestic water storage for a population, with optional fire reserve, and tank plan size.',
 src:[['BG-MEC-CS-420','tank-size'],['BG-MEC-CS-447','WATER CALCULATION'],['BG-MEC-CS-462','WS Calculation']],
 inp:[{id:'p',l:'Population',u:'pers',v:300},{id:'c',l:'Consumption',u:'L/pers·day',v:200},{id:'d',l:'Storage',u:'days',v:1},
  {id:'f',l:'Fire reserve',u:'m³',v:0},{id:'h',l:'Water depth',u:'m',v:2.5},{id:'fb',l:'Freeboard',u:'m',v:0.3}],
 calc(v){const V=v.p*v.c*v.d/1000+v.f,A=V/v.h,s=Math.sqrt(A);
  return {res:[{l:'Storage volume',v:V,u:'m³',key:1,d:1},{l:'Daily demand',v:v.p*v.c/1000,u:'m³/day',d:1},{l:'Plan area',v:A,u:'m²',d:1},
   {l:'Square tank side',v:s,u:'m',d:2},{l:'Overall height',v:v.h+v.fb,u:'m',d:2},{l:'Average flow',v:v.p*v.c/86400,u:'L/s',d:2}]};},
 notes:['Split the volume into two compartments so one can be cleaned while the other stays in service.']});

def({id:'npsh',g:'PL',code:'PL-07',t:'NPSH available',
 d:'Net positive suction head available to a pump, checked against the pump NPSH required.',
 src:[['BG-MEC-CS-294','NPSH calculation'],['BG-MEC-CS-407','Suction head calc']],
 inp:[{id:'alt',l:'Site altitude',u:'m',v:0},{id:'T',l:'Water temperature',u:'°C',v:35},{id:'hs',l:'Static suction head',u:'m',v:1.5,hint:'+ flooded, − suction lift'},
  {id:'hf',l:'Suction line losses',u:'m',v:0.8},{id:'r',l:'Pump NPSH required',u:'m',v:3.5},{id:'mg',l:'Required margin',u:'m',v:1.0}],
 calc(v){const Pa=101.325*Math.pow(1-2.25577e-5*v.alt,5.25588),pv=pvapW(v.T),rho=rhoW(v.T),ha=Pa*1000/(rho*G),hv=pv*1000/(rho*G),N=ha-hv+v.hs-v.hf,m=N-v.r;
  return {res:[{l:'NPSH available',v:N,u:'m',key:1},{l:'Margin over NPSHr',v:m,u:'m'},{l:'Atmospheric head',v:ha,u:'m'},{l:'Vapour pressure head',v:hv,u:'m',d:3},{l:'Vapour pressure',v:pv,u:'kPa',d:2}],
   chk:[m>=v.mg?{s:'ok',t:'NPSHa exceeds NPSHr by at least the required margin.'}:m>=0?{s:'warn',t:'Margin below '+fmt(v.mg,1)+' m. Risk of cavitation at high flow.'}:{s:'bad',t:'NPSHa below NPSHr: the pump will cavitate.'}]};},
 f:['NPSHa = (Patm − Pv) ÷ ρg + hs − hf']});

/* ---- fire ---- */
def({id:'sprinkler',g:'FP',code:'FP-01',t:'Sprinkler water demand',
 d:'Density/area sprinkler demand, hose allowance and fire water storage per NFPA 13.',
 src:[['BG-MEC-CS-242','hydraulic calculation for FF'],['BG-MEC-CS-243','Hydraulic Calculations'],['BG-MEC-CS-274','mai_fire_calculations']],
 inp:[{id:'hz',l:'Hazard classification',type:'sel',o:opt(HAZ.map(x=>x[0])),v:'1',wide:1},{id:'A',l:'Design area',u:'m²',v:0,hint:'0 = NFPA default for the hazard'},
  {id:'cov',l:'Coverage per sprinkler',u:'m²',v:0,hint:'0 = maximum for the hazard'},{id:'K',l:'K-factor',type:'sel',o:[['57','K 57 (4.0)'],['80','K 80 (5.6)'],['115','K 115 (8.0)'],['161','K 161 (11.2)'],['202','K 202 (14.0)']],v:'80'},
  {id:'ov',l:'Hydraulic imbalance allowance',u:'%',v:10},{id:'hose',l:'Hose allowance',u:'L/min',v:0,hint:'0 = NFPA default'},{id:'dur',l:'Duration',u:'min',v:0,hint:'0 = NFPA minimum'}],
 calc(v){const h=HAZ[+v.hz],A=v.A||h[2],cov=Math.min(v.cov||h[3],h[3]),n=Math.ceil(A/cov-1e-9),q0=h[1]*cov,K=+v.K,qmin=K*Math.sqrt(0.5),q=Math.max(q0,qmin),p=Math.pow(q/K,2),
  Qs=n*q*(1+v.ov/100),hose=v.hose||h[5],dur=v.dur||h[6],Qt=Qs+hose,V=Qt*dur/1000;
  return {res:[{l:'Total demand (sprinklers + hose)',v:Qt,u:'L/min',key:1,d:0},{l:'Fire water storage',v:V,u:'m³',key:1,d:1},{l:'Sprinkler demand',v:Qs,u:'L/min',d:0},
   {l:'Sprinklers in design area',v:n,d:0},{l:'Flow per sprinkler',v:q,u:'L/min',d:1},{l:'Pressure at end sprinkler',v:p,u:'bar',d:2},
   {l:'Density × area',v:fmt(h[1],1)+' mm/min × '+fmt(A,0)+' m²'},{l:'Total demand',v:Qt/3.78541,u:'US gpm',d:0},{l:'Duration',v:dur,u:'min',d:0}],
   chk:[q0<qmin?{s:'warn',t:'Flow set by the 0.5 bar (7 psi) minimum pressure, not the density.'}:{s:'ok',t:'Density governs the sprinkler flow.'},
    (v.cov>h[3])?{s:'warn',t:'Coverage capped at the hazard maximum of '+h[3]+' m².'}:null].filter(Boolean),
   tbl:{head:['Hazard','mm/min','Area m²','Max cov. m²','Hose L/min','Duration min'],rows:HAZ.map((x,i)=>({hl:i==v.hz,c:[x[0],fmt(x[1],1),x[2],fmt(x[3],1),x[5],x[6]]}))}};},
 f:['n = design area ÷ coverage        q = density × coverage','P = (q ÷ K)²        Storage = (Qs + hose) × duration'],
 notes:['Preliminary demand only. Final pipe sizing needs a full hydraulic calculation from the most remote area to the source.']});

def({id:'spr-spacing',g:'FP',code:'FP-02',t:'Sprinkler layout',
 d:'Number of standard spray sprinklers and their spacing for a rectangular room.',
 src:[['BG-MEC-CS-381','sprinklers spacing']],
 inp:[{id:'L',l:'Room length',u:'m',v:18},{id:'W',l:'Room width',u:'m',v:11},{id:'hz',l:'Hazard',type:'sel',o:opt(HAZ.map(x=>x[0])),v:'1',wide:1}],
 calc(v){const h=HAZ[+v.hz],S=h[4],cmax=h[3];let nl=Math.ceil(v.L/S-1e-9),nw=Math.ceil(v.W/S-1e-9);
  while((v.L/nl)*(v.W/nw)>cmax+1e-9){ if(v.L/nl>=v.W/nw) nl++; else nw++; }
  const sl=v.L/nl,sw=v.W/nw;
  return {res:[{l:'Sprinklers',v:nl*nw,key:1,d:0},{l:'Layout',v:nl+' × '+nw},{l:'Spacing along length',v:sl,u:'m'},{l:'Spacing along width',v:sw,u:'m'},
   {l:'Distance to wall',v:fmt(sl/2,2)+' / '+fmt(sw/2,2),u:'m'},{l:'Coverage per sprinkler',v:sl*sw,u:'m²'},{l:'Max spacing / coverage',v:fmt(S,1)+' m / '+fmt(cmax,1)+' m²'}],
   chk:[{s:'ok',t:'Wall distance is half the spacing and below the 2.3 m limit.'}]};},
 f:['n = ⌈L ÷ Smax⌉ × ⌈W ÷ Smax⌉, then add rows until coverage ≤ max']});

def({id:'clean-agent',g:'FP',code:'FP-03',t:'Clean agent quantity',
 d:'Agent mass for a total flooding FM-200 or Novec 1230 system per NFPA 2001.',
 src:[['BG-MEC-CS-195','FM200-Calculator'],['BG-MEC-CS-293','NOVEC 1230 Total Flooding System']],
 inp:[{id:'a',l:'Agent',type:'sel',o:opt(AGENT.map(x=>x[0])),v:'0',wide:1},{id:'L',l:'Length',u:'m',v:8},{id:'W',l:'Width',u:'m',v:6},{id:'H',l:'Height (incl. raised floor / ceiling void)',u:'m',v:3.6},
  {id:'T',l:'Minimum design temperature',u:'°C',v:20},{id:'C',l:'Design concentration',u:'%',v:0,hint:'0 = typical Class A value'},{id:'af',l:'Altitude correction factor',u:'',v:1.0},{id:'cyl',l:'Cylinder fill',u:'kg',v:0,hint:'optional'}],
 calc(v){const g=AGENT[+v.a],Cc=v.C||g[3],V=v.L*v.W*v.H,S=g[1]+g[2]*v.T,Wt=V/S*Cc/(100-Cc)*v.af;
  return {res:[{l:'Agent quantity',v:Wt,u:'kg',key:1,d:1},{l:'Protected volume',v:V,u:'m³',d:1},{l:'Specific vapour volume S',v:S,u:'m³/kg',d:4},{l:'Design concentration',v:Cc,u:'%',d:2},
   {l:'Cylinders',v:v.cyl>0?Math.ceil(Wt/v.cyl):'—',d:0}],
   chk:[Cc>g[4]?{s:'bad',t:'Concentration above NOAEL ('+g[4]+' %). Not allowed in normally occupied spaces.'}:{s:'ok',t:'Concentration at or below NOAEL ('+g[4]+' %).'}]};},
 f:['W = (V ÷ S) × C ÷ (100 − C)','S = k1 + k2 × T']});

/* ---- electrical ---- */
def({id:'load-current',g:'EL',code:'EL-01',t:'Load current & breaker',
 d:'Design current for a single- or three-phase load and the next standard breaker rating.',
 src:[['BG-ELE-CS-023','CB & cable size for 1ph line'],['BG-ELE-CS-024','CB and cable size for panel'],['BG-ELE-CS-002','3ph- pwr']],
 inp:[{id:'ph',l:'System',type:'sel',o:[['3','Three-phase'],['1','Single-phase']],v:'3'},{id:'V',l:'Voltage (line)',u:'V',v:400},{id:'P',l:'Load',u:'kW',v:45},{id:'pf',l:'Power factor',u:'',v:0.85},
  {id:'df',l:'Demand factor',u:'',v:1.0},{id:'mg',l:'Breaker margin',u:'%',v:25}],
 calc(v){const P=v.P*v.df*1000,I=v.ph==='3'?P/(SQ3*v.V*v.pf):P/(v.V*v.pf),cb=nextStd(I*(1+v.mg/100),CB),S=P/v.pf/1000;
  return {res:[{l:'Design current Ib',v:I,u:'A',key:1,d:1},{l:'Breaker rating In',v:cb,u:'A',key:1,d:0},{l:'Apparent power',v:S,u:'kVA',d:1},{l:'Reactive power',v:S*Math.sin(Math.acos(v.pf)),u:'kvar',d:1}]};},
 f:['3-ph: I = P ÷ (√3 V cosφ)        1-ph: I = P ÷ (V cosφ)','In ≥ Ib × (1 + margin)']});

def({id:'cable',g:'EL',code:'EL-02',t:'Cable size & voltage drop',
 d:'Smallest copper XLPE cable that carries the breaker rating after derating and keeps the voltage drop within the limit.',
 src:[['BG-ELE-CS-102','Voltage Drop'],['BG-ELE-CS-045','FINAL VOLTAGE DROP CALCULATION SHEET'],['BG-ELE-CS-018','Cable VD CB SC Calculation'],['BG-ELE-CS-107','XLPE cable, breaker calc']],
 inp:[{id:'ph',l:'System',type:'sel',o:[['3','Three-phase'],['1','Single-phase']],v:'3'},{id:'V',l:'Voltage (line)',u:'V',v:400},
  {id:'P',l:'Load',u:'kW',v:45},{id:'pf',l:'Power factor',u:'',v:0.85},{id:'L',l:'Cable length',u:'m',v:120},{id:'par',l:'Parallel runs',u:'no.',v:1},
  {id:'m',l:'Installation',type:'sel',o:[['C','Clipped direct / solid tray (C)'],['E','Perforated tray / free air (E)']],v:'E'},
  {id:'amb',l:'Ambient air',type:'sel',o:Object.keys(AMB).map(k=>[k,k+' °C (×'+AMB[k].toFixed(2)+')']),v:'40'},
  {id:'kg',l:'Grouping factor',u:'',v:0.85},{id:'vd',l:'Voltage drop limit',u:'%',v:4},{id:'mg',l:'Breaker margin',u:'%',v:25}],
 calc(v){const three=v.ph==='3',P=v.P*1000,I=three?P/(SQ3*v.V*v.pf):P/(v.V*v.pf),In=nextStd(I*(1+v.mg/100),CB),ka=AMB[v.amb],n=Math.max(1,Math.round(v.par)),
  tab=CBL[v.m+(three?'3':'2')],sin=Math.sin(Math.acos(v.pf)),X=0.08;
  let sel=-1;const rows=CBL.size.map((s,i)=>{const Iz=tab[i]*ka*v.kg*n,R=CBL.R20[i]*1.275,mv=(three?SQ3:2)*(R*v.pf+X*sin),dv=mv*I*v.L/1000/n,pc=dv/v.V*100,ok=Iz>=In&&pc<=v.vd;if(ok&&sel<0)sel=i;return {s,Iz,mv,dv,pc,ok}});
  const r=rows[sel];
  return {res:[{l:'Cable size',v:r?(n>1?n+' × ':'')+(three?'4C ':'2C ')+r.s+' mm²':'none',u:'Cu XLPE',key:1},{l:'Design current Ib',v:I,u:'A',d:1},{l:'Breaker In',v:In,u:'A',d:0},
   {l:'Derated capacity Iz',v:r?r.Iz:NaN,u:'A',d:0},{l:'Voltage drop',v:r?r.dv:NaN,u:'V',d:2},{l:'Voltage drop',v:r?r.pc:NaN,u:'%',key:1,d:2},{l:'mV/A/m',v:r?r.mv:NaN,d:3},{l:'Derating total',v:ka*v.kg,d:3}],
   chk:[r?{s:'ok',t:'Iz ≥ In and voltage drop ≤ '+v.vd+' %.'}:{s:'bad',t:'No single size up to 300 mm² works. Add a parallel run.'}],
   tbl:{head:['Size mm²','Iz derated A','mV/A/m','ΔV V','ΔV %','OK'],rows:rows.slice(Math.max(0,sel-2),sel<0?rows.length:sel+3).map(x=>({hl:r&&x.s===r.s,dim:!x.ok,c:[x.s,fmt(x.Iz,0),fmt(x.mv,3),fmt(x.dv,2),fmt(x.pc,2),x.ok?'yes':'no']}))}};},
 f:['Iz = It × Ca × Cg × runs ≥ In','ΔV = k × Ib × L × (R cosφ + X sinφ) ÷ runs     k = √3 (3-ph), 2 (1-ph)','R at 90 °C = R20 × 1.275,  X = 0.08 Ω/km'],
 notes:['Current ratings: IEC 60364-5-52, XLPE 90 °C copper multicore, methods C and E. Check against the cable manufacturer.']});

def({id:'short-circuit',g:'EL',code:'EL-03',t:'Short-circuit current',
 d:'Three-phase symmetrical fault current at the transformer LV terminals and at the end of a cable.',
 src:[['BG-ELE-CS-083','Short Circuit Calculations'],['BG-ELE-CS-044','FINAL SHORT CIRCUIT'],['BG-ELE-CS-021','Calculation of short circuit']],
 inp:[{id:'S',l:'Transformer rating',u:'kVA',v:1000},{id:'V',l:'Secondary voltage',u:'V',v:400},{id:'Z',l:'Impedance',u:'%',v:6},{id:'xr',l:'Transformer X/R',u:'',v:6},
  {id:'MVA',l:'Upstream fault level',u:'MVA',v:500,hint:'0 = infinite source'},{id:'L',l:'Cable length',u:'m',v:50},{id:'cs',l:'Cable size',type:'sel',o:CBL.size.map((s,i)=>[String(i),s+' mm² Cu']),v:'13'},{id:'n',l:'Parallel runs',u:'no.',v:2}],
 calc(v){const V=v.V,Zs=v.MVA>0?V*V/(v.MVA*1e6):0,Xs=Zs*0.995,Rs=Zs*0.0995,Zt=v.Z/100*V*V/(v.S*1000),Rt=Zt/Math.sqrt(1+v.xr*v.xr),Xt=Rt*v.xr,
  Rc=CBL.R20[+v.cs]*v.L/1000/v.n,Xc=0.08*v.L/1000/v.n,R1=Rs+Rt,X1=Xs+Xt,Z1=Math.hypot(R1,X1),Z2=Math.hypot(R1+Rc,X1+Xc),I1=V/(SQ3*Z1)/1000,I2=V/(SQ3*Z2)/1000;
  return {res:[{l:'Fault at transformer LV',v:I1,u:'kA',key:1,d:1},{l:'Fault at cable end',v:I2,u:'kA',key:1,d:1},{l:'Full-load current',v:v.S*1000/(SQ3*V),u:'A',d:0},
   {l:'Transformer only (infinite source)',v:V/(SQ3*Zt)/1000,u:'kA',d:1},{l:'Z source / transformer / cable',v:fmt(Zs*1000,2)+' / '+fmt(Zt*1000,2)+' / '+fmt(Math.hypot(Rc,Xc)*1000,2),u:'mΩ'}],
   chk:[{s:'ok',t:'Choose switchgear with a breaking capacity above '+fmt(Math.ceil(I1),0)+' kA at the main board.'}]};},
 f:['Zt = Z% × V² ÷ S        Zs = V² ÷ MVA','Isc = V ÷ (√3 × |Zs + Zt + Zcable|)'],
 ex:'1000 kVA, 400 V, 6 %, infinite source gives 24.1 kA, the usual hand-check value.'});

def({id:'pf',g:'EL',code:'EL-04',t:'Power factor correction',
 d:'Capacitor bank rating to raise power factor from an existing to a target value.',
 src:[['BG-ELE-CS-078','Power Factor Improvement']],
 inp:[{id:'P',l:'Active load',u:'kW',v:500},{id:'p1',l:'Existing power factor',u:'',v:0.76},{id:'p2',l:'Target power factor',u:'',v:0.93},{id:'V',l:'Voltage',u:'V',v:400}],
 calc(v){const t1=Math.tan(Math.acos(v.p1)),t2=Math.tan(Math.acos(v.p2)),k=t1-t2,Q=v.P*k,S1=v.P/v.p1,S2=v.P/v.p2;
  return {res:[{l:'Capacitor bank',v:Q,u:'kvar',key:1,d:0},{l:'Standard bank',v:nextStd(Q,PF_STD),u:'kvar',key:1,d:0},{l:'Multiplier',v:k,d:3},
   {l:'kVA before / after',v:fmt(S1,0)+' / '+fmt(S2,0),u:'kVA'},{l:'Current before / after',v:fmt(S1*1000/(SQ3*v.V),0)+' / '+fmt(S2*1000/(SQ3*v.V),0),u:'A'},{l:'Current reduction',v:(1-S2/S1)*100,u:'%',d:1}]};},
 f:['kvar = kW × (tan φ1 − tan φ2)'],
 ex:'Defaults reproduce the IEEE Table 50 example in BG-ELE-CS-078: 500 kW × 0.46 = 230 kvar.'});

def({id:'lighting',g:'EL',code:'EL-05',t:'Lighting (lumen method)',
 d:'Number of luminaires for an average illuminance, with layout spacing and power density.',
 src:[['BG-ELE-CS-056','Lighting Calculations'],['BG-ELE-CS-022','calculate number of luminaires'],['BG-ELE-CS-050','ILLUMINATION LEVEL']],
 inp:[{id:'L',l:'Room length',u:'m',v:12},{id:'W',l:'Room width',u:'m',v:8},{id:'hm',l:'Mounting height above work plane',u:'m',v:2.0},
  {id:'E',l:'Required illuminance',type:'sel',o:LUX,v:'500',wide:1},{id:'F',l:'Lumens per luminaire',u:'lm',v:3600},{id:'w',l:'Watts per luminaire',u:'W',v:36},
  {id:'uf',l:'Utilisation factor',u:'',v:0,hint:'0 = generic estimate from room index'},{id:'mf',l:'Maintenance factor',u:'',v:0.8}],
 calc(v){const A=v.L*v.W,K=A/(v.hm*(v.L+v.W)),uf=v.uf||interp(UF_EST,K),E=+v.E,N=Math.ceil(E*A/(v.F*uf*v.mf)-1e-9);
  let cols=Math.max(1,Math.round(Math.sqrt(N*v.L/v.W))),rows=Math.ceil(N/cols);const n=cols*rows,Ea=n*v.F*uf*v.mf/A;
  return {res:[{l:'Luminaires (minimum)',v:N,key:1,d:0},{l:'Suggested layout',v:cols+' × '+rows+' = '+n,key:1},{l:'Average illuminance',v:Ea,u:'lx',d:0},
   {l:'Room index K',v:K,d:2},{l:'Utilisation factor',v:uf,d:2},{l:'Spacing',v:fmt(v.L/cols,2)+' × '+fmt(v.W/rows,2),u:'m'},{l:'Spacing-to-height ratio',v:Math.max(v.L/cols,v.W/rows)/v.hm,d:2},
   {l:'Lighting power density',v:n*v.w/A,u:'W/m²',d:1}],
   chk:[v.uf?{s:'ok',t:'Using your utilisation factor.'}:{s:'warn',t:'UF is a generic estimate (reflectances 70/50/20). Use the manufacturer UF table for final design.'},
    Math.max(v.L/cols,v.W/rows)/v.hm>1.5?{s:'warn',t:'Spacing-to-height ratio above 1.5: check uniformity.'}:{s:'ok',t:'Spacing-to-height ratio within 1.5.'}]};},
 f:['K = L·W ÷ [Hm (L + W)]','N = E × A ÷ (Φ × UF × MF)']});

def({id:'transformer',g:'EL',code:'EL-06',t:'Transformer sizing',
 d:'Transformer rating from connected load, demand factor and spare capacity.',
 src:[['BG-ELE-CS-091','transformers calc.'],['BG-ELE-CS-089','TR. CALC'],['BG-ELE-CS-074','PEAK LOAD TABULATION']],
 inp:[{id:'S',l:'Connected load',u:'kVA',v:1400},{id:'df',l:'Demand factor',u:'',v:0.7},{id:'sp',l:'Future spare',u:'%',v:20},{id:'ld',l:'Max loading',u:'%',v:80},{id:'V',l:'Secondary voltage',u:'V',v:400}],
 calc(v){const D=v.S*v.df,R=D*(1+v.sp/100)/(v.ld/100),T=nextStd(R,TX);
  return {res:[{l:'Transformer rating',v:T??'> 3150',u:'kVA',key:1,d:0},{l:'Maximum demand',v:D,u:'kVA',d:0},{l:'Required rating',v:R,u:'kVA',d:0},{l:'Loading at max demand',v:T?D/T*100:NaN,u:'%',d:0},{l:'Secondary full-load current',v:T?T*1000/(SQ3*v.V):NaN,u:'A',d:0}]};},
 f:['Required = Connected × DF × (1 + spare) ÷ max loading']});

def({id:'conduit',g:'EL',code:'EL-07',t:'Conduit fill',
 d:'Minimum conduit size for a set of cables at the 53 / 31 / 40 % fill limits.',
 src:[['BG-ELE-CS-028','Conduit Fill By 40%'],['BG-ELE-CS-027','Conduit calculation'],['BG-ELE-CS-029','Conduit fill (table)']],
 inp:[{id:'rows',type:'rows',cols:[{id:'d',l:'Cable OD mm',v:6},{id:'q',l:'Qty',v:1}],v:[{d:4.8,q:3},{d:5.5,q:3}]}],
 calc(v){let A=0,n=0;v.rows.forEach(r=>{A+=(+r.q||0)*PI*Math.pow(+r.d||0,2)/4;n+=(+r.q||0)});
  const lim=n<=1?0.53:n===2?0.31:0.40,Areq=A/lim,D=Math.sqrt(4*Areq/PI),c=nextStd(D,CONDUIT);
  return {res:[{l:'Conduit size',v:c??'> 150',u:'mm',key:1,d:0},{l:'Cables',v:n,d:0},{l:'Cable area',v:A,u:'mm²',d:0},{l:'Fill limit',v:lim*100,u:'%',d:0},{l:'Required diameter',v:D,u:'mm',d:1},{l:'Actual fill',v:c?A/(PI*c*c/4)*100:NaN,u:'%',d:1}],
   tbl:{head:['Conduit mm','Max cable area mm² at '+lim*100+' %'],rows:CONDUIT.map(s=>({hl:s===c,c:[s,fmt(PI*s*s/4*lim,0)]}))}};},
 f:['Required area = Σ(π d²/4) ÷ fill limit','Fill limit: 1 cable 53 %, 2 cables 31 %, 3+ cables 40 %'],
 notes:['As in the source sheet, the nominal conduit diameter is used. Check the manufacturer inside diameter for heavy-gauge conduit.']});

def({id:'tray',g:'EL',code:'EL-08',t:'Cable tray width',
 d:'Cable tray width for a set of cables, by single-layer spacing or by fill ratio, with spare capacity.',
 src:[['BG-ELE-CS-014','cable tray calculation 20%'],['BG-ELE-CS-011','cable tray calculation 10%'],['BG-ELE-CS-092','Tray Capacity']],
 inp:[{id:'m',l:'Method',type:'sel',o:[['layer','Single layer, spaced'],['fill','Fill ratio of tray section']],v:'layer'},{id:'gap',l:'Gap between cables',type:'sel',o:[['0','Touching'],['1','One cable diameter']],v:'0'},
  {id:'h',l:'Tray depth',u:'mm',v:75},{id:'fr',l:'Fill ratio (fill method)',u:'%',v:40},{id:'sp',l:'Spare capacity',u:'%',v:20},
  {id:'rows',type:'rows',cols:[{id:'d',l:'Cable OD mm',v:20},{id:'q',l:'Qty',v:1}],v:[{d:19.6,q:6},{d:60.1,q:1},{d:42.1,q:2}]}],
 calc(v){let sd=0,A=0,n=0;v.rows.forEach(r=>{const d=+r.d||0,q=+r.q||0;sd+=q*d*(1+(+v.gap));A+=q*PI*d*d/4;n+=q});
  const W=(v.m==='layer'?sd:A/(v.h*v.fr/100))*(1+v.sp/100),t=nextStd(W,TRAY),nt=t?1:Math.ceil(W/900);
  return {res:[{l:'Tray width',v:t?t+' mm':nt+' × 900 mm',key:1},{l:'Required width',v:W,u:'mm',d:0},{l:'Cables',v:n,d:0},{l:'Σ diameters',v:sd/(1+(+v.gap)),u:'mm',d:1},{l:'Σ cable area',v:A,u:'mm²',d:0},{l:'Fill of chosen tray',v:t?A/(t*v.h)*100:NaN,u:'%',d:1}]};},
 f:['Single layer: W = Σ n·d × (1 + gap) × (1 + spare)','Fill: W = Σ π d²/4 ÷ (depth × fill) × (1 + spare)']});

def({id:'earth-rod',g:'EL',code:'EL-09',t:'Earth electrode resistance',
 d:'Resistance of a vertical earth rod and of several rods in a line, against a target value.',
 src:[['BG-ELE-CS-081','Rod calculation'],['BG-ELE-CS-080','rod'],['BG-ELE-CS-058','lightning cal.']],
 inp:[{id:'rho',l:'Soil resistivity',u:'Ω·m',v:100},{id:'L',l:'Rod length',u:'m',v:3},{id:'d',l:'Rod diameter',u:'mm',v:16},{id:'n',l:'Number of rods',type:'sel',o:[1,2,3,4,5,6,7,8,9,10].map(x=>[String(x),String(x)]),v:'4'},
  {id:'s',l:'Rod spacing',u:'m',v:6},{id:'tg',l:'Target resistance',u:'Ω',v:10}],
 calc(v){const R1=v.rho/(2*PI*v.L)*(Math.log(8*v.L/(v.d/1000))-1),n=+v.n,a=v.rho/(2*PI*R1*v.s),Rn=n===1?R1:R1/n*(1+LAMBDA[n]*a);
  return {res:[{l:'Combined resistance',v:Rn,u:'Ω',key:1},{l:'Single rod',v:R1,u:'Ω'},{l:'Rods',v:n,d:0},{l:'Spacing ≥ rod length',v:v.s>=v.L?'yes':'no'}],
   chk:[Rn<=v.tg?{s:'ok',t:'Meets the '+v.tg+' Ω target.'}:{s:'bad',t:'Above the '+v.tg+' Ω target. Add rods, lengthen them or treat the soil.'},v.s<v.L?{s:'warn',t:'Spacing less than rod length reduces the benefit of extra rods.'}:null].filter(Boolean)};},
 f:['R1 = ρ ÷ (2πL) × [ln(8L ÷ d) − 1]','Rn = R1 ÷ n × (1 + λα),   α = ρ ÷ (2π R1 s)   (BS 7430)']});

/* ---- tools ---- */
const UNITS={
 'Flow':{base:'m³/s',u:[['L/s',1e-3],['m³/h',1/3600],['m³/s',1],['L/min',1/60000],['CFM',0.000471947],['US gpm',6.30902e-5]]},
 'Pressure':{u:[['Pa',1],['kPa',1000],['bar',1e5],['psi',6894.757],['in wg',249.089],['mm H₂O',9.80665],['m H₂O',9806.65],['ft H₂O',2989.07]]},
 'Power & cooling':{u:[['W',1],['kW',1000],['BTU/h',0.29307107],['TR',3516.85],['hp',745.7],['kcal/h',1.163]]},
 'Length':{u:[['mm',0.001],['m',1],['in',0.0254],['ft',0.3048]]},
 'Area':{u:[['mm²',1e-6],['m²',1],['in²',0.00064516],['ft²',0.09290304]]},
 'Volume':{u:[['L',0.001],['m³',1],['US gal',0.00378541],['imp gal',0.00454609],['ft³',0.0283168]]},
 'Velocity':{u:[['m/s',1],['fpm',0.00508],['ft/s',0.3048],['km/h',1/3.6]]},
 'Temperature':{u:[['°C'],['°F'],['K']]}};
const UK=Object.keys(UNITS);
def({id:'units',g:'GN',code:'GN-01',t:'Unit converter',
 d:'Convert the units used across engineering work: flow, pressure, cooling, length, area, volume, velocity and temperature.',
 src:[['BG-GEN-CS-008','Ultimate Converter'],['BG-GEN-CS-003','CONVCALC'],['BG-MEC-CS-433','UnitsConverter14'],['BG-MEC-CS-029','ALL Purpose worksheet (Conversions)'],['BG-MEC-CS-072','conv-table (formulas)']],
 inp:[{id:'cat',l:'Quantity',type:'sel',o:opt(UK),v:'0',onchange:'resetUnit'},{id:'x',l:'Value',u:'',v:1000},{id:'from',l:'From unit',type:'sel',o:s=>UNITS[UK[+s.cat]].u.map((u,i)=>[String(i),u[0]]),v:'0'}],
 resetUnit(s){s.from='0'},
 calc(v){const U=UNITS[UK[+v.cat]].u,f=U[+v.from]||U[0];let out;
  if(UK[+v.cat]==='Temperature'){const c=f[0]==='°C'?v.x:f[0]==='°F'?(v.x-32)/1.8:v.x-273.15;out=[c,c*1.8+32,c+273.15];}
  else{const b=v.x*f[1];out=U.map(u=>b/u[1]);}
  return {res:U.map((u,i)=>({l:u[0],v:out[i],key:i===(+v.from===0?1:0),d:Math.abs(out[i])>=1000?1:Math.abs(out[i])>=1?3:5}))};}});

/* ---------- structural, civil, fundamentals, operations ---------- */
const ab=d=>PI*d*d/4;
const beta1=fc=>fc<=28?0.85:Math.max(0.65,0.85-0.05*(fc-28)/7);
function flexAs(Mu,b,d,fc,fy){const Rn=Mu*1e6/(0.9*b*d*d),k=1-2*Rn/(0.85*fc);if(k<0)return NaN;return 0.85*fc/fy*(1-Math.sqrt(k))*b*d}
const BARS=[10,12,16,20,25,28,32].map(x=>[String(x),'Ø'+x]);
const W_SHAPES=[['W8×10',10,8.87,30.8],['W10×12',12,12.6,53.8],['W12×14',14,17.4,88.6],['W12×19',19,24.7,130],['W14×22',22,33.2,199],['W12×26',26,37.2,204],
 ['W16×26',26,44.2,301],['W14×30',30,47.3,291],['W16×31',31,54.0,375],['W18×35',35,66.5,510],['W18×40',40,78.4,612],['W21×44',44,95.4,843],['W21×50',50,110,984],
 ['W24×55',55,134,1350],['W24×62',62,153,1550],['W24×76',76,200,2100],['W27×84',84,244,2850],['W30×99',99,312,3990],['W33×118',118,415,5900],['W36×135',135,509,7800]];
const CT=[['0.0724|0.8','Steel moment frame'],['0.0466|0.9','Concrete moment frame'],['0.0731|0.75','Steel EBF / BRBF'],['0.0488|0.75','All other systems']];
const EXPO={B:[7.0,365.76],C:[9.5,274.32],D:[11.5,213.36]};

def({id:'rc-flexure',g:'ST',code:'ST-01',t:'RC beam flexure',
 d:'Tension reinforcement for a rectangular reinforced concrete beam under a factored moment, ACI 318.',
 src:[['BG-STR-CS-398','RECTBEAM'],['BG-STR-CS-024','ACI-Bend'],['BG-STR-CS-170','Concrete Beam Design Based on ACI'],['BG-STR-CS-006','Design Of Beams']],
 inp:[{id:'Mu',l:'Factored moment Mu',u:'kN·m',v:180},{id:'b',l:'Width b',u:'mm',v:300},{id:'h',l:'Depth h',u:'mm',v:600},{id:'c',l:'Cover to bar centre',u:'mm',v:60},
  {id:'fc',l:"Concrete f'c",u:'MPa',v:28},{id:'fy',l:'Steel fy',u:'MPa',v:420},{id:'db',l:'Bar diameter',type:'sel',o:BARS,v:'20'}],
 calc(v){const d=v.h-v.c,Asr=flexAs(v.Mu,v.b,d,v.fc,v.fy),Amin=Math.max(0.25*Math.sqrt(v.fc)/v.fy,1.4/v.fy)*v.b*d,As=Math.max(Asr,Amin),n=Math.ceil(As/ab(+v.db)-1e-9),Ap=n*ab(+v.db),
  a=Ap*v.fy/(0.85*v.fc*v.b),c=a/beta1(v.fc),et=0.003*(d-c)/c,phi=et>=0.005?0.9:et<=0.002?0.65:0.65+0.25*(et-0.002)/0.003,phiMn=phi*Ap*v.fy*(d-a/2)/1e6;
  return {res:[{l:'Bars',v:isNaN(Asr)?'section too small':n+' Ø'+v.db,key:1},{l:'Steel required As',v:As,u:'mm²',key:1,d:0},{l:'Effective depth d',v:d,u:'mm',d:0},{l:'Minimum steel',v:Amin,u:'mm²',d:0},
   {l:'Steel provided',v:Ap,u:'mm²',d:0},{l:'Steel ratio',v:Ap/(v.b*d)*100,u:'%',d:2},{l:'Net tensile strain εt',v:et,d:4},{l:'φMn provided',v:phiMn,u:'kN·m',d:1}],
   chk:[isNaN(Asr)?{s:'bad',t:'Moment exceeds the singly reinforced capacity. Increase depth or add compression steel.'}:
    et>=0.005?{s:'ok',t:'Tension-controlled (εt ≥ 0.005), φ = 0.90.'}:et>=0.004?{s:'warn',t:'Transition zone: φ = '+fmt(phi,2)+'. Consider a deeper section.'}:{s:'bad',t:'εt below 0.004: not allowed for beams. Increase depth.'},
    phiMn>=v.Mu?{s:'ok',t:'φMn ≥ Mu.'}:{s:'bad',t:'φMn below Mu with the rounded bars.'}]};},
 f:['Rn = Mu ÷ (φ b d²)','ρ = 0.85f′c/fy × [1 − √(1 − 2Rn ÷ 0.85f′c)]','As,min = max(0.25√f′c, 1.4) ÷ fy × b d']});

def({id:'rc-shear',g:'ST',code:'ST-02',t:'RC beam shear',
 d:'Stirrup spacing for a reinforced concrete beam under factored shear, ACI 318.',
 src:[['BG-STR-CS-030','ACI-Shear'],['BG-STR-CS-012','5- SHEAR'],['BG-STR-CS-453','ShearReinfCalc']],
 inp:[{id:'Vu',l:'Factored shear Vu',u:'kN',v:220},{id:'b',l:'Web width b',u:'mm',v:300},{id:'d',l:'Effective depth d',u:'mm',v:540},{id:'fc',l:"Concrete f'c",u:'MPa',v:28},
  {id:'fy',l:'Stirrup fyt',u:'MPa',v:420},{id:'ds',l:'Stirrup diameter',type:'sel',o:BARS.slice(0,3),v:'10'},{id:'n',l:'Legs',u:'no.',v:2}],
 calc(v){const r=Math.sqrt(v.fc),Vc=0.17*r*v.b*v.d/1000,phi=0.75,Vs=Math.max(0,v.Vu/phi-Vc),Av=v.n*ab(+v.ds),Vsmax=0.66*r*v.b*v.d/1000,
  sReq=Vs>0?Av*v.fy*v.d/(Vs*1000):Infinity,sMin=Av*v.fy/(Math.max(0.062*r,0.35)*v.b),sMax=Vs>0.33*r*v.b*v.d/1000?Math.min(v.d/4,300):Math.min(v.d/2,600),
  need=v.Vu>0.5*phi*Vc,s=Math.floor(Math.min(sReq,sMin,sMax)/25)*25;
  return {res:[{l:'Stirrups',v:need?'Ø'+v.ds+' @ '+s+' mm':'not required',key:1},{l:'φVc',v:phi*Vc,u:'kN',d:1},{l:'Vs required',v:Vs,u:'kN',d:1},{l:'Spacing for strength',v:sReq,u:'mm',d:0},
   {l:'Spacing for Av,min',v:sMin,u:'mm',d:0},{l:'Maximum spacing',v:sMax,u:'mm',d:0}],
   chk:[Vs>Vsmax?{s:'bad',t:'Vs exceeds 0.66√f′c b d. Enlarge the section.'}:{s:'ok',t:'Section size is adequate for shear.'},
    !need?{s:'ok',t:'Vu ≤ ½φVc: no stirrups needed by calculation.'}:v.Vu<=phi*Vc?{s:'warn',t:'Minimum stirrups govern (Vu ≤ φVc).'}:null].filter(Boolean)};},
 f:['Vc = 0.17 λ √f′c b d','s = Av fyt d ÷ Vs,   Vs = Vu/φ − Vc','s ≤ d/2 (d/4 when Vs > 0.33√f′c b d)']});

def({id:'one-way-slab',g:'ST',code:'ST-03',t:'One-way slab',
 d:'Thickness, factored moment and main bar spacing for a one-way solid slab per metre width, ACI 318.',
 src:[['BG-STR-CS-332','One Way Slab'],['BG-STR-CS-003','1-way solid concrete slab design'],['BG-STR-CS-335','One-way solid RC slab design to BS 8110']],
 inp:[{id:'L',l:'Clear span',u:'m',v:4},{id:'sup',l:'Support condition',type:'sel',o:[['0','Simply supported'],['1','One end continuous'],['2','Both ends continuous'],['3','Cantilever']],v:'1',wide:1},
  {id:'h',l:'Slab thickness',u:'mm',v:0,hint:'0 = ACI minimum, rounded up'},{id:'sdl',l:'Finishes & partitions',u:'kN/m²',v:2.0},{id:'ll',l:'Live load',u:'kN/m²',v:3.0},
  {id:'fc',l:"Concrete f'c",u:'MPa',v:28},{id:'fy',l:'Steel fy',u:'MPa',v:420},{id:'db',l:'Bar diameter',type:'sel',o:BARS.slice(0,4),v:'12'},{id:'cv',l:'Clear cover',u:'mm',v:20}],
 calc(v){const div=[20,24,28,10][+v.sup],cf=[1/8,1/10,1/11,1/2][+v.sup],hmin=v.L*1000/div,h=v.h||Math.ceil(hmin/10)*10,d=h-v.cv-(+v.db)/2,
  D=h/1000*24+v.sdl,wu=Math.max(1.2*D+1.6*v.ll,1.4*D),Mu=wu*v.L*v.L*cf,As=Math.max(flexAs(Mu,1000,d,v.fc,v.fy),0.0018*1000*h),
  smax=Math.min(3*h,450),s=Math.floor(Math.min(1000*ab(+v.db)/As,smax)/25)*25;
  return {res:[{l:'Main bars',v:isNaN(As)?'increase thickness':'Ø'+v.db+' @ '+s+' mm',key:1},{l:'Thickness',v:h,u:'mm',key:1,d:0},{l:'Minimum thickness (no deflection calc)',v:hmin,u:'mm',d:0},
   {l:'Factored load wu',v:wu,u:'kN/m²',d:2},{l:'Mu per metre',v:Mu,u:'kN·m/m',d:2},{l:'As required',v:As,u:'mm²/m',d:0},{l:'Shrinkage steel 0.0018bh',v:0.0018*1000*h,u:'mm²/m',d:0}],
   chk:[h<hmin?{s:'warn',t:'Thinner than the ACI Table 7.3.1.1 minimum: check deflection.'}:{s:'ok',t:'Meets the ACI minimum thickness.'}]};},
 f:['h ≥ L/20, L/24, L/28, L/10','wu = 1.2D + 1.6L','Mu = wu L² × (1/8, 1/10, 1/11, 1/2)']});

def({id:'column',g:'ST',code:'ST-04',t:'RC short column (axial)',
 d:'Axial capacity of a short tied or spiral concrete column, and the size needed for a factored load, ACI 318.',
 src:[['BG-STR-CS-009','3- Design Of Columns'],['BG-STR-CS-381','Pure Axial'],['BG-STR-CS-149','Column Design'],['BG-STR-CS-397','Rectangular Concrete Column Design']],
 inp:[{id:'Pu',l:'Factored axial load Pu',u:'kN',v:2200},{id:'b',l:'Width b',u:'mm',v:400},{id:'h',l:'Depth h',u:'mm',v:400},{id:'rho',l:'Steel ratio',u:'%',v:1.5},
  {id:'fc',l:"Concrete f'c",u:'MPa',v:28},{id:'fy',l:'Steel fy',u:'MPa',v:420},{id:'ty',l:'Column type',type:'sel',o:[['t','Tied'],['s','Spiral']],v:'t'},{id:'db',l:'Bar diameter',type:'sel',o:BARS.slice(2),v:'20'}],
 calc(v){const k=v.ty==='t'?0.80:0.85,phi=v.ty==='t'?0.65:0.75,Ag=v.b*v.h,rho=v.rho/100,n=Math.max(v.ty==='t'?4:6,Math.ceil(rho*Ag/ab(+v.db)-1e-9)),As=n*ab(+v.db),
  P=k*phi*(0.85*v.fc*(Ag-As)+v.fy*As)/1000,Agr=v.Pu*1000/(k*phi*(0.85*v.fc*(1-rho)+v.fy*rho)),side=Math.ceil(Math.sqrt(Agr)/25)*25;
  return {res:[{l:'Design capacity φPn,max',v:P,u:'kN',key:1,d:0},{l:'Utilisation',v:v.Pu/P*100,u:'%',key:1,d:0},{l:'Bars',v:n+' Ø'+v.db},{l:'Steel provided',v:As/Ag*100,u:'%',d:2},
   {l:'Square size needed for Pu',v:side+' × '+side,u:'mm'}],
   chk:[v.Pu<=P?{s:'ok',t:'Capacity exceeds Pu.'}:{s:'bad',t:'Pu exceeds capacity.'},rho<0.01||rho>0.08?{s:'bad',t:'Steel ratio must be 1–8 %.'}:rho>0.04?{s:'warn',t:'Above 4 % steel makes lap splices congested.'}:null,
    {s:'warn',t:'Short column, axial load only. Check slenderness and moments separately.'}].filter(Boolean)};},
 f:['φPn,max = k φ [0.85 f′c (Ag − Ast) + fy Ast]','Tied: k 0.80, φ 0.65    Spiral: k 0.85, φ 0.75']});

def({id:'footing',g:'ST',code:'ST-05',t:'Isolated footing',
 d:'Square spread footing size, thickness from punching and beam shear, and bottom reinforcement, ACI 318.',
 src:[['BG-STR-CS-211','Design of isolated footing'],['BG-STR-CS-151','Column Footing Design Based on ACI'],['BG-STR-CS-258','FOOTINGS — rectangular spread'],['BG-STR-CS-288','Isolated Footing']],
 inp:[{id:'PD',l:'Dead load',u:'kN',v:800},{id:'PL',l:'Live load',u:'kN',v:400},{id:'qa',l:'Allowable soil pressure',u:'kPa',v:200},{id:'sw',l:'Footing & backfill allowance',u:'%',v:10},
  {id:'c',l:'Square column side',u:'mm',v:400},{id:'fc',l:"Concrete f'c",u:'MPa',v:28},{id:'fy',l:'Steel fy',u:'MPa',v:420},{id:'db',l:'Bar diameter',type:'sel',o:BARS.slice(1,5),v:'16'},{id:'cv',l:'Cover',u:'mm',v:75}],
 calc(v){const B=Math.ceil(Math.sqrt((v.PD+v.PL)*(1+v.sw/100)/v.qa)/0.05-1e-9)*0.05,Pu=1.2*v.PD+1.6*v.PL,qu=Pu/(B*B),c=v.c/1000,r=Math.sqrt(v.fc);
  let h=300,d,V2,P2,V1,P1;for(;h<=2000;h+=25){d=(h-v.cv-(+v.db))/1000;const b0=4*(c+d);V2=qu*(B*B-(c+d)*(c+d));P2=0.75*0.33*r*b0*d*1000;V1=qu*B*Math.max(0,(B-c)/2-d);P1=0.75*0.17*r*B*d*1000;if(V2<=P2&&V1<=P1)break}
  const Mu=qu*B*Math.pow((B-c)/2,2)/2,As=Math.max(flexAs(Mu,B*1000,d*1000,v.fc,v.fy),0.0018*B*1000*h),n=Math.ceil(As/ab(+v.db)-1e-9),s=(B*1000-2*v.cv)/(n-1);
  return {res:[{l:'Footing size',v:fmt(B,2)+' × '+fmt(B,2),u:'m',key:1},{l:'Thickness',v:h,u:'mm',key:1,d:0},{l:'Bars each way',v:n+' Ø'+v.db+' @ '+fmt(Math.floor(s/5)*5,0)+' mm'},
   {l:'Factored soil pressure',v:qu,u:'kPa',d:0},{l:'Punching Vu / φVc',v:fmt(V2,0)+' / '+fmt(P2,0),u:'kN'},{l:'Beam shear Vu / φVc',v:fmt(V1,0)+' / '+fmt(P1,0),u:'kN'},
   {l:'Mu at column face',v:Mu,u:'kN·m',d:0},{l:'As each way',v:As,u:'mm²',d:0}],
   chk:[{s:'ok',t:'Service pressure '+fmt((v.PD+v.PL)*(1+v.sw/100)/(B*B),0)+' kPa ≤ '+v.qa+' kPa.'},s>450?{s:'warn',t:'Bar spacing above 450 mm: use smaller bars.'}:null].filter(Boolean)};},
 f:['B = √[(PD + PL)(1 + allowance) ÷ qa]','Punching: φVc = 0.75 × 0.33√f′c b0 d     Beam: φVc = 0.75 × 0.17√f′c B d','Mu = qu B (B − c)² ÷ 8']});

def({id:'punching',g:'ST',code:'ST-06',t:'Punching shear',
 d:'Two-way (punching) shear capacity of a flat slab or footing at a column, ACI 318.',
 src:[['BG-STR-CS-010','4- Check Punching'],['BG-STR-CS-140','Check punching shear'],['BG-STR-CS-379','Punching'],['BG-STR-CS-380','Punching shear to BS 8110']],
 inp:[{id:'Vu',l:'Factored shear Vu',u:'kN',v:600},{id:'c1',l:'Column side c1',u:'mm',v:400},{id:'c2',l:'Column side c2',u:'mm',v:400},{id:'d',l:'Effective depth d',u:'mm',v:200},
  {id:'fc',l:"Concrete f'c",u:'MPa',v:28},{id:'pos',l:'Column position',type:'sel',o:[['40','Interior'],['30','Edge'],['20','Corner']],v:'40'}],
 calc(v){const a=+v.pos,d=v.d,b0=a===40?2*(v.c1+d)+2*(v.c2+d):a===30?2*(v.c1+d/2)+(v.c2+d):(v.c1+d/2)+(v.c2+d/2),be=Math.max(v.c1,v.c2)/Math.min(v.c1,v.c2),r=Math.sqrt(v.fc),
  vc=Math.min(0.33,0.17*(1+2/be),0.083*(2+a*d/b0))*r,P=0.75*vc*b0*d/1000;
  return {res:[{l:'Capacity φVc',v:P,u:'kN',key:1,d:0},{l:'Utilisation',v:v.Vu/P*100,u:'%',key:1,d:0},{l:'Critical perimeter b0',v:b0,u:'mm',d:0},{l:'Stress vc',v:vc,u:'MPa',d:3},{l:'Column aspect β',v:be,d:2}],
   chk:[v.Vu<=P?{s:'ok',t:'Punching shear is adequate.'}:{s:'bad',t:'Punching fails. Thicken the slab, add a drop panel or shear studs.'}]};},
 f:['vc = min(0.33, 0.17(1 + 2/β), 0.083(2 + αs d/b0)) √f′c','φVc = 0.75 vc b0 d']});

def({id:'dev-length',g:'ST',code:'ST-07',t:'Development & lap length',
 d:'Tension development length, standard hook length and Class B lap splice for deformed bars, ACI 318.',
 src:[['BG-STR-CS-014','6- Development Length'],['BG-STR-CS-214','Development Length'],['BG-STR-CS-395','REBARS — development and splices'],['BG-STR-CS-215','DevelopmentSpliceConcrete']],
 inp:[{id:'db',l:'Bar diameter',type:'sel',o:BARS,v:'20'},{id:'fy',l:'Steel fy',u:'MPa',v:420},{id:'fc',l:"Concrete f'c",u:'MPa',v:28},
  {id:'cs',l:'Spacing and cover',type:'sel',o:[['1','Clear spacing ≥ db and cover ≥ db (with stirrups)'],['0','Other cases']],v:'1',wide:1},
  {id:'pt',l:'Bar position',type:'sel',o:[['1.3','Top bar (>300 mm fresh concrete below)'],['1','Other']],v:'1',wide:1},
  {id:'pe',l:'Coating',type:'sel',o:[['1','Uncoated'],['1.2','Epoxy, other'],['1.5','Epoxy, low cover']],v:'1'},{id:'lam',l:'Concrete',type:'sel',o:[['1','Normal weight'],['0.75','Lightweight']],v:'1'}],
 calc(v){const db=+v.db,small=db<=19,K=v.cs==='1'?(small?2.1:1.7):(small?1.4:1.1),pp=Math.min(1.7,(+v.pt)*(+v.pe)),r=Math.sqrt(Math.min(v.fc,69)),
  ld=Math.max(300,v.fy*pp/(K*(+v.lam)*r)*db),ldh=Math.max(8*db,150,0.24*(+v.pe)*v.fy/((+v.lam)*r)*db);
  return {res:[{l:'Development length ld',v:Math.ceil(ld/10)*10,u:'mm',key:1,d:0},{l:'Lap splice (Class B, 1.3 ld)',v:Math.ceil(1.3*ld/10)*10,u:'mm',key:1,d:0},
   {l:'Hooked bar ldh',v:Math.ceil(ldh/10)*10,u:'mm',d:0},{l:'ld ÷ db',v:ld/db,d:1},{l:'ψt × ψe',v:pp,d:2}]};},
 f:['ld = fy ψt ψe ÷ (K λ √f′c) × db ≥ 300 mm','K = 2.1 / 1.7 (good conditions, ≤ Ø19 / > Ø19); 1.4 / 1.1 otherwise','ldh = 0.24 ψe fy ÷ (λ √f′c) × db ≥ max(8db, 150)']});

def({id:'beam',g:'ST',code:'ST-08',t:'Simple beam analysis',
 d:'Reactions, shear, bending moment and deflection of a simply supported beam with a uniform load and a point load.',
 src:[['BG-STR-CS-087','BeamAnalysis'],['BG-STR-CS-096','BEAMANAL — single-span and continuous'],['BG-STR-CS-090','Beam Calculator']],
 inp:[{id:'L',l:'Span',u:'m',v:6},{id:'w',l:'Uniform load',u:'kN/m',v:25},{id:'P',l:'Point load',u:'kN',v:40},{id:'a',l:'Point load from left support',u:'m',v:2},
  {id:'E',l:'Elastic modulus E',u:'GPa',v:200},{id:'I',l:'Second moment I',u:'×10⁶ mm⁴',v:250},{id:'lim',l:'Deflection limit',type:'sel',o:[['360','L/360'],['240','L/240'],['180','L/180']],v:'360'}],
 calc(v){const L=v.L,a=Math.min(Math.max(v.a,0),L),b=L-a,EI=v.E*1e6*v.I*1e-6,RA=v.w*L/2+v.P*b/L,RB=v.w*L+v.P-RA;
  let Mmax=0,xm=0,ymax=0,xy=0;for(let i=0;i<=400;i++){const x=L*i/400,M=RA*x-v.w*x*x/2-(x>a?v.P*(x-a):0);if(M>Mmax){Mmax=M;xm=x}
   const yu=v.w*x*(L*L*L-2*L*x*x+x*x*x)/(24*EI),yp=x<=a?v.P*b*x*(L*L-b*b-x*x)/(6*L*EI):v.P*a*(L-x)*(L*L-a*a-(L-x)*(L-x))/(6*L*EI);if(yu+yp>ymax){ymax=yu+yp;xy=x}}
  const dl=L/(+v.lim)*1000;
  return {res:[{l:'Maximum moment',v:Mmax,u:'kN·m',key:1,d:1},{l:'Maximum deflection',v:ymax*1000,u:'mm',key:1,d:1},{l:'Reaction A',v:RA,u:'kN',d:1},{l:'Reaction B',v:RB,u:'kN',d:1},
   {l:'Maximum shear',v:Math.max(RA,RB),u:'kN',d:1},{l:'Moment located at',v:xm,u:'m',d:2},{l:'Deflection limit',v:dl,u:'mm',d:1}],
   chk:[ymax*1000<=dl?{s:'ok',t:'Deflection within L/'+v.lim+'.'}:{s:'bad',t:'Deflection exceeds L/'+v.lim+'. Increase I.'}]};},
 f:['UDL: y = w x (L³ − 2L x² + x³) ÷ 24EI','Point load: y = P b x (L² − b² − x²) ÷ 6L EI   (x ≤ a)','Maximum values found by scanning 400 points along the span.']});

def({id:'steel-beam',g:'ST',code:'ST-09',t:'Steel W-beam selection',
 d:'Lightest W-shape for a simply supported, fully braced floor beam by strength and live-load deflection, AISC 360 LRFD.',
 src:[['BG-STR-CS-484','STEEL BEAM'],['BG-STR-CS-485','Steel I-Beam Calculation Note'],['BG-STR-CS-097','BEAMCOL9'],['BG-GEN-CS-002','AISC member dimensions and properties']],
 inp:[{id:'L',l:'Span',u:'m',v:8},{id:'wd',l:'Dead load (incl. self weight)',u:'kN/m',v:10},{id:'wl',l:'Live load',u:'kN/m',v:8},{id:'Fy',l:'Yield strength Fy',u:'MPa',v:345},
  {id:'lim',l:'Live-load deflection limit',type:'sel',o:[['360','L/360'],['240','L/240']],v:'360'}],
 calc(v){const wu=Math.max(1.2*v.wd+1.6*v.wl,1.4*v.wd),Mu=wu*v.L*v.L/8,Z=Mu*1e6/(0.9*v.Fy),Delta=v.L*1000/(+v.lim),Ireq=5*v.wl*Math.pow(v.L*1000,4)/(384*200000*Delta);
  const rows=W_SHAPES.map(x=>({n:x[0],kg:x[1]*1.48816,Z:x[2]*16387.064,I:x[3]*416231.4})).map(r=>({...r,ok:r.Z>=Z&&r.I>=Ireq}));
  const sel=rows.filter(r=>r.ok).sort((a,b)=>a.kg-b.kg)[0];
  return {res:[{l:'Lightest section',v:sel?sel.n:'none in list',key:1},{l:'Mass',v:sel?sel.kg:NaN,u:'kg/m',key:1,d:1},{l:'Mu',v:Mu,u:'kN·m',d:1},{l:'Zx required',v:Z/1e3,u:'×10³ mm³',d:0},
   {l:'Ix required',v:Ireq/1e6,u:'×10⁶ mm⁴',d:1},{l:'φMn of selection',v:sel?0.9*v.Fy*sel.Z/1e6:NaN,u:'kN·m',d:1}],
   chk:[{s:'warn',t:'Assumes a compact section with continuous lateral bracing (Lb ≤ Lp). Check shear and bracing.'}],
   tbl:{head:['Section','kg/m','Zx ×10³ mm³','Ix ×10⁶ mm⁴','OK'],rows:rows.map(r=>({hl:sel&&r.n===sel.n,dim:!r.ok,c:[r.n,fmt(r.kg,1),fmt(r.Z/1e3,0),fmt(r.I/1e6,1),r.ok?'yes':'no']}))}};},
 f:['Mu = wu L² ÷ 8,  Zx ≥ Mu ÷ (0.9 Fy)','Ix ≥ 5 wL L⁴ ÷ (384 E Δ)']});

def({id:'wind',g:'ST',code:'ST-10',t:'Wind pressure (ASCE 7)',
 d:'Velocity pressure at a height and the main wind-force design pressures on windward and leeward walls, ASCE 7-16.',
 src:[['BG-STR-CS-530','Wind-ASCE7-02'],['BG-STR-CS-527','WIND LOAD'],['BG-STR-CS-524','Wind Analysis for Low-rise Buildings'],['BG-STR-CS-015','6-Wind Load']],
 inp:[{id:'V',l:'Basic wind speed (3-s gust)',u:'m/s',v:45},{id:'ex',l:'Exposure',type:'sel',o:[['B','B — urban'],['C','C — open'],['D','D — coastal']],v:'C'},{id:'z',l:'Height z',u:'m',v:15},
  {id:'kzt',l:'Topographic Kzt',u:'',v:1.0},{id:'kd',l:'Directionality Kd',u:'',v:0.85},{id:'G',l:'Gust factor G',u:'',v:0.85},{id:'gc',l:'Internal GCpi',u:'±',v:0.18}],
 calc(v){const [al,zg]=EXPO[v.ex],z=Math.max(v.z,4.6),Kz=2.01*Math.pow(z/zg,2/al),q=0.613*Kz*v.kzt*v.kd*v.V*v.V/1000,pw=q*v.G*0.8,pl=q*v.G*-0.5;
  return {res:[{l:'Velocity pressure qz',v:q,u:'kPa',key:1,d:3},{l:'Net wall pressure (windward + leeward)',v:pw-pl,u:'kPa',key:1,d:3},{l:'Kz',v:Kz,d:3},{l:'Windward wall (Cp 0.8)',v:pw,u:'kPa',d:3},
   {l:'Leeward wall (Cp −0.5)',v:pl,u:'kPa',d:3},{l:'Internal pressure',v:'±'+fmt(q*v.gc,3),u:'kPa'}],
   chk:[{s:'warn',t:'Leeward Cp −0.5 assumes L/B ≤ 1, and qz is used for both faces. Use qh for the leeward and roof pressures in final design.'}]};},
 f:['Kz = 2.01 (z / zg)^(2/α)','qz = 0.613 Kz Kzt Kd V²  (N/m²)','p = q G Cp − qi (GCpi)']});

def({id:'seismic',g:'ST',code:'ST-11',t:'Seismic base shear',
 d:'Equivalent lateral force base shear from design spectral accelerations, ASCE 7 / IBC.',
 src:[['BG-STR-CS-278','IBC 2006 Seismic Calc'],['BG-STR-CS-434','Seismic analysis based on IBC 2000'],['BG-STR-CS-447','Seismic design spectral acceleration'],['BG-STR-CS-450','Seismic-UBC']],
 inp:[{id:'sds',l:'SDS',u:'g',v:0.8},{id:'sd1',l:'SD1',u:'g',v:0.4},{id:'R',l:'Response modification R',u:'',v:8},{id:'Ie',l:'Importance factor Ie',u:'',v:1.0},
  {id:'sys',l:'Structural system',type:'sel',o:CT,v:'0.0466|0.9',wide:1},{id:'hn',l:'Building height hn',u:'m',v:30},{id:'TL',l:'Long-period TL',u:'s',v:8},{id:'W',l:'Seismic weight W',u:'kN',v:50000}],
 calc(v){const [ct,x]=v.sys.split('|').map(Number),T=ct*Math.pow(v.hn,x),RI=v.R/v.Ie,c1=v.sds/RI,c2=T<=v.TL?v.sd1/(T*RI):v.sd1*v.TL/(T*T*RI),cmin=Math.max(0.044*v.sds*v.Ie,0.01),
  Cs=Math.max(Math.min(c1,c2),cmin),k=T<=0.5?1:T>=2.5?2:1+(T-0.5)/2;
  return {res:[{l:'Base shear V',v:Cs*v.W,u:'kN',key:1,d:0},{l:'Seismic coefficient Cs',v:Cs,key:1,d:4},{l:'Approximate period Ta',v:T,u:'s',d:3},{l:'Cs from SDS',v:c1,d:4},{l:'Cs upper limit (SD1)',v:c2,d:4},
   {l:'Cs minimum',v:cmin,d:4},{l:'Distribution exponent k',v:k,d:2}],
   chk:[Cs===cmin?{s:'warn',t:'Minimum Cs governs.'}:Cs===c2?{s:'ok',t:'Period-dependent limit governs.'}:{s:'ok',t:'SDS plateau governs.'}]};},
 f:['Ta = Ct hn^x','Cs = SDS ÷ (R/Ie) ≤ SD1 ÷ [T (R/Ie)] ≥ max(0.044 SDS Ie, 0.01)','V = Cs W']});

def({id:'ret-wall',g:'ST',code:'ST-12',t:'Retaining wall stability',
 d:'Overturning, sliding and soil bearing checks for a cantilever retaining wall with Rankine active pressure.',
 src:[['BG-STR-CS-408','Retaining Wall Design Based on ACI'],['BG-STR-CS-173','ConcreteRetainingWall'],['BG-STR-CS-410','Retaining wall design to BS 8110'],['BG-STR-CS-405','Retaining Wall']],
 inp:[{h:'Geometry'},{id:'H',l:'Stem height above base',u:'m',v:4},{id:'tb',l:'Base thickness',u:'m',v:0.4},{id:'tt',l:'Stem thickness, top',u:'m',v:0.25},{id:'ts',l:'Stem thickness, bottom',u:'m',v:0.4},
  {id:'toe',l:'Toe length',u:'m',v:0.8},{id:'heel',l:'Heel length',u:'m',v:2.2},
  {h:'Soil'},{id:'g',l:'Soil unit weight',u:'kN/m³',v:18},{id:'phi',l:'Friction angle φ',u:'°',v:30},{id:'q',l:'Surcharge',u:'kPa',v:10},{id:'mu',l:'Base friction μ',u:'',v:0.5},{id:'qa',l:'Allowable bearing',u:'kPa',v:200}],
 calc(v){const Ka=(1-Math.sin(v.phi*PI/180))/(1+Math.sin(v.phi*PI/180)),Ht=v.H+v.tb,B=v.toe+v.ts+v.heel,gc=24,
  Pa1=0.5*Ka*v.g*Ht*Ht,Pa2=Ka*v.q*Ht,Pa=Pa1+Pa2,Mo=Pa1*Ht/3+Pa2*Ht/2,
  F=[[v.tt*v.H*gc,v.toe+v.tt/2],[0.5*(v.ts-v.tt)*v.H*gc,v.toe+v.tt+(v.ts-v.tt)/3],[B*v.tb*gc,B/2],[v.heel*v.H*v.g,v.toe+v.ts+v.heel/2],[v.heel*v.q,v.toe+v.ts+v.heel/2]],
  N=F.reduce((s,f)=>s+f[0],0),Mr=F.reduce((s,f)=>s+f[0]*f[1],0),FSo=Mr/Mo,FSs=v.mu*N/Pa,e=B/2-(Mr-Mo)/N,qmax=e<=B/6?N/B*(1+6*e/B):2*N/(3*(B/2-e)),qmin=e<=B/6?N/B*(1-6*e/B):0;
  return {res:[{l:'FS overturning',v:FSo,key:1,d:2},{l:'FS sliding',v:FSs,key:1,d:2},{l:'Max bearing pressure',v:qmax,u:'kPa',key:1,d:0},{l:'Min bearing pressure',v:qmin,u:'kPa',d:0},
   {l:'Base width',v:B,u:'m',d:2},{l:'Ka',v:Ka,d:3},{l:'Active thrust',v:Pa,u:'kN/m',d:1},{l:'Vertical load',v:N,u:'kN/m',d:1},{l:'Eccentricity',v:e,u:'m',d:3}],
   chk:[FSo>=2?{s:'ok',t:'Overturning FS ≥ 2.0.'}:{s:'bad',t:'Overturning FS below 2.0: lengthen the heel.'},FSs>=1.5?{s:'ok',t:'Sliding FS ≥ 1.5.'}:{s:'bad',t:'Sliding FS below 1.5: add a shear key or widen the base.'},
    qmax<=v.qa?{s:'ok',t:'Bearing pressure within allowable.'}:{s:'bad',t:'Bearing pressure exceeds allowable.'},e>B/6?{s:'warn',t:'Resultant outside the middle third: part of the base lifts.'}:null].filter(Boolean)};},
 f:['Ka = (1 − sin φ) ÷ (1 + sin φ)','Pa = ½ Ka γ H² + Ka q H','FS = Mr ÷ Mo,   μ ΣV ÷ Pa;   q = ΣV/B (1 ± 6e/B)'],
 notes:['Passive resistance in front of the toe is ignored, which is conservative. Concrete taken as 24 kN/m³.']});

def({id:'rebar',g:'ST',code:'ST-13',t:'Rebar weight schedule',
 d:'Steel weight from a bar bending schedule, totalled by bar diameter.',
 src:[['BG-STR-CS-041','bar bending'],['BG-STR-CS-074','BAR BENDING SCHEDULE PROGRAM'],['BG-STR-CS-494','Summary of Steel Dia used']],
 inp:[{id:'ws',l:'Wastage',u:'%',v:3},{id:'rows',type:'rows',cols:[{id:'d',l:'Bar Ø',type:'sel',o:[8,10,12,14,16,18,20,22,25,28,32].map(x=>[String(x),'Ø'+x])},{id:'L',l:'Length each m',v:6},{id:'n',l:'No. of bars',v:10}],
  v:[{d:'16',L:6.2,n:24},{d:'12',L:4.5,n:40},{d:'8',L:1.6,n:120},{d:'20',L:9,n:12}]}],
 calc(v){const by={};let tot=0;v.rows.forEach(r=>{const d=+r.d,kg=d*d/162*(+r.L||0)*(+r.n||0);by[d]=(by[d]||0)+kg;tot+=kg});const k=1+v.ws/100;
  return {res:[{l:'Total steel',v:tot*k/1000,u:'t',key:1,d:3},{l:'Total steel',v:tot*k,u:'kg',key:1,d:0},{l:'Net of wastage',v:tot,u:'kg',d:0}],
   tbl:{head:['Diameter','kg/m','Weight kg','incl. wastage'],rows:Object.keys(by).sort((a,b)=>a-b).map(d=>({c:['Ø'+d,fmt(d*d/162,3),fmt(by[d],1),fmt(by[d]*k,1)]}))}};},
 f:['Weight (kg/m) = d² ÷ 162   (d in mm)']});

/* civil & geotechnical */
def({id:'bearing',g:'CV',code:'CV-01',t:'Soil bearing capacity',
 d:'Ultimate and allowable bearing capacity of a shallow footing by the general bearing capacity equation.',
 src:[['BG-CIV-CS-001','bearing'],['BG-CIV-CS-002','Bearing Design'],['BG-CIV-CS-003','Bearing Design Method A'],['BG-CIV-CS-008','Geotechnical design']],
 inp:[{id:'B',l:'Footing width B',u:'m',v:2},{id:'L',l:'Footing length L',u:'m',v:2,hint:'Use a large value for a strip'},{id:'Df',l:'Founding depth Df',u:'m',v:1.5},
  {id:'c',l:'Cohesion c',u:'kPa',v:0},{id:'phi',l:'Friction angle φ',u:'°',v:30},{id:'g',l:'Soil unit weight γ',u:'kN/m³',v:18},{id:'FS',l:'Factor of safety',u:'',v:3}],
 calc(v){const p=v.phi*PI/180,t=Math.tan(p),Nq=Math.exp(PI*t)*Math.pow(Math.tan(PI/4+p/2),2),Nc=v.phi>0?(Nq-1)/t:5.14,Ng=2*(Nq+1)*t,BL=Math.min(1,v.B/v.L),
  Fcs=1+BL*Nq/Nc,Fqs=1+BL*t,Fgs=1-0.4*BL,r=v.Df/v.B<=1?v.Df/v.B:Math.atan(v.Df/v.B),Fqd=1+2*t*Math.pow(1-Math.sin(p),2)*r,Fcd=v.phi>0?Fqd-(1-Fqd)/(Nc*t):1+0.4*r,
  q=v.g*v.Df,qu=v.c*Nc*Fcs*Fcd+q*Nq*Fqs*Fqd+0.5*v.g*v.B*Ng*Fgs,qa=qu/v.FS,qn=(qu-q)/v.FS;
  return {res:[{l:'Allowable bearing',v:qa,u:'kPa',key:1,d:0},{l:'Net allowable',v:qn,u:'kPa',key:1,d:0},{l:'Ultimate bearing qu',v:qu,u:'kPa',d:0},{l:'Allowable load',v:qa*v.B*Math.min(v.L,1e6),u:'kN',d:0},
   {l:'Nc / Nq / Nγ',v:fmt(Nc,2)+' / '+fmt(Nq,2)+' / '+fmt(Ng,2)},{l:'Overburden q',v:q,u:'kPa',d:1}]};},
 f:['qu = c Nc Fcs Fcd + q Nq Fqs Fqd + ½ γ B Nγ Fγs','Nq = e^(π tan φ) tan²(45 + φ/2),  Nc = (Nq − 1) cot φ,  Nγ = 2(Nq + 1) tan φ','Shape: De Beer.  Depth: Hansen.'],
 notes:['No groundwater correction. If the water table is within B below the footing, use the submerged unit weight.']});

def({id:'consolidation',g:'CV',code:'CV-02',t:'Consolidation settlement',
 d:'Primary consolidation settlement of a clay layer and the time to reach a degree of consolidation, Terzaghi one-dimensional theory.',
 src:[["BG-CIV-CS-011","Terzaghi's Consolidation Equation"],["BG-CIV-CS-012","Terzaghi's Consolidation Equation"],['BG-CIV-CS-009','Large Strain Consolidation']],
 inp:[{id:'H',l:'Clay layer thickness',u:'m',v:4},{id:'e0',l:'Initial void ratio e0',u:'',v:0.9},{id:'Cc',l:'Compression index Cc',u:'',v:0.3},{id:'Cr',l:'Recompression index Cr',u:'',v:0.05},
  {id:'s0',l:'Initial effective stress (mid-layer)',u:'kPa',v:80},{id:'ds',l:'Stress increase Δσ',u:'kPa',v:60},{id:'sc',l:'Preconsolidation pressure',u:'kPa',v:80},
  {id:'cv',l:'Coefficient cv',u:'m²/yr',v:2},{id:'dr',l:'Drainage',type:'sel',o:[['2','Top and bottom'],['1','One side only']],v:'2'},{id:'U',l:'Degree of consolidation',u:'%',v:90}],
 calc(v){const sf=v.s0+v.ds,sc=Math.max(v.sc,v.s0),f=v.H/(1+v.e0),lg=Math.log10;let S;
  if(sc<=v.s0)S=v.Cc*f*lg(sf/v.s0);else if(sf<=sc)S=v.Cr*f*lg(sf/v.s0);else S=f*(v.Cr*lg(sc/v.s0)+v.Cc*lg(sf/sc));
  const Hd=v.H/(+v.dr),U=Math.min(Math.max(v.U,1),99.9),Tv=U<60?PI/4*Math.pow(U/100,2):1.781-0.933*lg(100-U),t=Tv*Hd*Hd/v.cv;
  return {res:[{l:'Primary settlement',v:S*1000,u:'mm',key:1,d:0},{l:'Time to '+fmt(U,0)+' %',v:t,u:'years',key:1,d:2},{l:'Time',v:t*365,u:'days',d:0},{l:'Time factor Tv',v:Tv,d:3},
   {l:'Drainage path',v:Hd,u:'m',d:2},{l:'Clay state',v:sc<=v.s0?'normally consolidated':'overconsolidated'}]};},
 f:['NC: S = Cc H ÷ (1 + e0) × log(σ′f ÷ σ′0)','OC: S = H ÷ (1 + e0) × [Cr log(σ′c/σ′0) + Cc log(σ′f/σ′c)]','t = Tv Hdr² ÷ cv']});

def({id:'phase',g:'CV',code:'CV-03',t:'Soil phase relations',
 d:'Dry unit weight, void ratio, porosity and saturation from specific gravity, water content and bulk unit weight.',
 src:[['BG-CIV-CS-013','Volume-Mass Relations for Unsaturated Soils'],['BG-PRC-CS-039','4.30 Modified Proctor']],
 inp:[{id:'Gs',l:'Specific gravity Gs',u:'',v:2.7},{id:'w',l:'Water content w',u:'%',v:15},{id:'g',l:'Bulk unit weight γ',u:'kN/m³',v:19},{id:'gw',l:'Unit weight of water',u:'kN/m³',v:9.81}],
 calc(v){const w=v.w/100,gd=v.g/(1+w),e=v.Gs*v.gw/gd-1,n=e/(1+e),S=w*v.Gs/e,gs=(v.Gs+e)*v.gw/(1+e);
  return {res:[{l:'Dry unit weight γd',v:gd,u:'kN/m³',key:1,d:2},{l:'Void ratio e',v:e,key:1,d:3},{l:'Porosity n',v:n*100,u:'%',d:1},{l:'Degree of saturation S',v:S*100,u:'%',d:1},
   {l:'Saturated unit weight',v:gs,u:'kN/m³',d:2},{l:'Dry density',v:gd/9.80665,u:'t/m³',d:3},{l:'Zero-air-voids γd at this w',v:v.Gs*v.gw/(1+w*v.Gs),u:'kN/m³',d:2}],
   chk:[S>1?{s:'bad',t:'Saturation above 100 %: the inputs are inconsistent.'}:{s:'ok',t:'Inputs are consistent.'}]};},
 f:['γd = γ ÷ (1 + w)','e = Gs γw ÷ γd − 1,   n = e ÷ (1 + e)','S = w Gs ÷ e']});

def({id:'manning',g:'CV',code:'CV-04',t:'Gravity pipe flow (Manning)',
 d:'Flow and velocity in a partly full circular pipe or culvert by the Manning equation.',
 src:[['BG-STR-CS-139','CHANFLOW'],['BG-CIV-CS-005','Design of pipe of watercourse'],['BG-CIV-CS-010','Pipe design sheet of watercourse'],['BG-MEC-CS-207','gravity lines']],
 inp:[{id:'D',l:'Pipe diameter',u:'mm',v:300},{id:'S',l:'Slope',u:'%',v:1},{id:'n',l:'Manning n',type:'sel',o:[['0.011','0.011 — PVC / HDPE'],['0.013','0.013 — concrete'],['0.015','0.015 — old concrete'],['0.024','0.024 — corrugated metal']],v:'0.013'},
  {id:'y',l:'Depth of flow y/D',u:'%',v:75}],
 calc(v){const D=v.D/1000,s=v.S/100,n=+v.n,man=(A,P)=>A*Math.pow(A/P,2/3)*Math.sqrt(s)/n,y=Math.min(Math.max(v.y,1),100)/100,th=2*Math.acos(1-2*y),
  A=D*D/8*(th-Math.sin(th)),P=D*th/2,Q=man(A,P),Af=PI*D*D/4,Qf=man(Af,PI*D);
  return {res:[{l:'Flow',v:Q*1000,u:'L/s',key:1,d:1},{l:'Velocity',v:Q/A,u:'m/s',key:1,d:2},{l:'Full-bore flow',v:Qf*1000,u:'L/s',d:1},{l:'Full-bore velocity',v:Qf/Af,u:'m/s',d:2},
   {l:'Q ÷ Qfull',v:Q/Qf*100,u:'%',d:0},{l:'Hydraulic radius',v:A/P*1000,u:'mm',d:1}],
   chk:[Q/A<0.6?{s:'warn',t:'Velocity below 0.6 m/s: not self-cleansing.'}:Q/A>3?{s:'warn',t:'Velocity above 3 m/s: check scour.'}:{s:'ok',t:'Self-cleansing velocity achieved.'}]};},
 f:['Q = (1/n) A R^(2/3) S^(1/2)','θ = 2 acos(1 − 2y/D),  A = D²(θ − sin θ) ÷ 8,  P = Dθ ÷ 2']});

/* fundamentals */
def({id:'section',g:'GN',code:'GN-02',t:'Section properties',
 d:'Area, second moment, elastic and plastic modulus and radius of gyration for common cross-sections.',
 src:[['BG-GEN-CS-005','SECTPROP — section properties'],['BG-GEN-CS-006','Shapes Properties'],['BG-STR-CS-432','section-analysis']],
 inp:[{id:'s',l:'Shape',type:'sel',o:[['r','Rectangle'],['hr','Hollow rectangle'],['c','Solid circle'],['t','Circular tube'],['i','I-section (symmetric)']],v:'i',wide:1},
  {id:'b',l:'Width / flange width b',u:'mm',v:200},{id:'h',l:'Depth / diameter h',u:'mm',v:400},{id:'t',l:'Wall / flange thickness t',u:'mm',v:13.5},{id:'tw',l:'Web thickness tw',u:'mm',v:8.6},
  {id:'rho',l:'Density',u:'kg/m³',v:7850}],
 calc(v){const b=v.b,h=v.h,t=v.t,tw=v.tw;let A,Ix,Iy,Zx;
  if(v.s==='r'){A=b*h;Ix=b*h**3/12;Iy=h*b**3/12;Zx=b*h*h/4}
  else if(v.s==='hr'){const bi=b-2*t,hi=h-2*t;A=b*h-bi*hi;Ix=(b*h**3-bi*hi**3)/12;Iy=(h*b**3-hi*bi**3)/12;Zx=(b*h*h-bi*hi*hi)/4}
  else if(v.s==='c'){A=PI*h*h/4;Ix=Iy=PI*h**4/64;Zx=h**3/6}
  else if(v.s==='t'){const di=h-2*t;A=PI*(h*h-di*di)/4;Ix=Iy=PI*(h**4-di**4)/64;Zx=(h**3-di**3)/6}
  else{const hw=h-2*t;A=2*b*t+hw*tw;Ix=(b*h**3-(b-tw)*hw**3)/12;Iy=2*t*b**3/12+hw*tw**3/12;Zx=b*t*(h-t)+tw*hw*hw/4}
  const Sx=Ix/(h/2);
  return {res:[{l:'Area A',v:A,u:'mm²',key:1,d:0},{l:'Ix',v:Ix/1e6,u:'×10⁶ mm⁴',key:1,d:2},{l:'Elastic modulus Sx',v:Sx/1e3,u:'×10³ mm³',d:1},{l:'Plastic modulus Zx',v:Zx/1e3,u:'×10³ mm³',d:1},
   {l:'Shape factor Zx/Sx',v:Zx/Sx,d:3},{l:'Iy',v:Iy/1e6,u:'×10⁶ mm⁴',d:2},{l:'rx / ry',v:fmt(Math.sqrt(Ix/A),1)+' / '+fmt(Math.sqrt(Iy/A),1),u:'mm'},{l:'Mass',v:A*v.rho/1e6,u:'kg/m',d:2}]};},
 f:['Ix = Σ(b h³/12 + A y²)','Sx = Ix ÷ (h/2),   Zx = Σ A·|y| about the equal-area axis','r = √(I/A)'],
 notes:['Fillets and root radii are ignored, so rolled sections come out slightly lighter than catalogue values.']});

/* operations */
def({id:'cube-test',g:'OP',code:'OP-01',t:'Concrete cube test results',
 d:'Mean, standard deviation and characteristic strength of a set of concrete test results, with conformity checks.',
 src:[['BG-PRC-CS-025','4.16 Concrete Cube Test'],['BG-PRC-CS-012','4.05 Record of Concrete Pour'],['BG-PRC-CS-015','4.07 Record of Testing']],
 inp:[{id:'fck',l:'Specified strength',u:'MPa',v:30},{id:'std',l:'Acceptance rule',type:'sel',o:[['bs','BS EN 206 (cubes)'],['aci','ACI 318 (cylinders)']],v:'bs'},
  {id:'rows',type:'rows',cols:[{id:'f',l:'Result MPa',v:35}],v:[34.5,36.2,33.1,38.0,35.4,31.9,37.2,36.8,34.0].map(f=>({f}))}],
 calc(v){const x=v.rows.map(r=>+r.f).filter(f=>f>0),n=x.length,m=x.reduce((a,b)=>a+b,0)/Math.max(n,1),sd=n>1?Math.sqrt(x.reduce((a,b)=>a+(b-m)**2,0)/(n-1)):0,mn=Math.min(...x);
  let avg3=Infinity;for(let i=2;i<n;i++)avg3=Math.min(avg3,(x[i]+x[i-1]+x[i-2])/3);
  const lowI=v.std==='bs'?v.fck-4:(v.fck<=35?v.fck-3.5:0.9*v.fck),okMean=v.std==='bs'?m>=v.fck+4:(n<3||avg3>=v.fck),okInd=mn>=lowI;
  return {res:[{l:'Mean strength',v:m,u:'MPa',key:1,d:1},{l:'Characteristic (mean − 1.64 s)',v:m-1.64*sd,u:'MPa',key:1,d:1},{l:'Results',v:n,d:0},{l:'Standard deviation',v:sd,u:'MPa',d:2},
   {l:'Lowest result',v:mn,u:'MPa',d:1},{l:'Lowest average of 3 consecutive',v:n>=3?avg3:NaN,u:'MPa',d:1},{l:'Coefficient of variation',v:sd/m*100,u:'%',d:1}],
   chk:[okMean?{s:'ok',t:v.std==='bs'?'Mean ≥ fck + 4 MPa.':'Every average of 3 consecutive results ≥ f′c.'}:{s:'bad',t:v.std==='bs'?'Mean below fck + 4 MPa.':'An average of 3 consecutive results is below f′c.'},
    okInd?{s:'ok',t:'No individual result below '+fmt(lowI,1)+' MPa.'}:{s:'bad',t:'An individual result is below '+fmt(lowI,1)+' MPa. Investigate (cores).'}]};},
 f:['s = √[Σ(x − x̄)² ÷ (n − 1)]','BS EN 206 (groups of 3): mean ≥ fck + 4, each ≥ fck − 4','ACI 318: avg of 3 ≥ f′c, each ≥ f′c − 3.5 (≤ 35 MPa) or 0.9 f′c']});

def({id:'concrete-qty',g:'OP',code:'OP-02',t:'Concrete materials',
 d:'Cement, sand, coarse aggregate and water for a volume of concrete from a nominal mix ratio.',
 src:[['BG-PRC-CS-054','Estimate of Material and Labor'],['BG-PRC-CS-051','Detail of items for any quantity'],['BG-PRC-CS-048','BOQ']],
 inp:[{id:'V',l:'Concrete volume (wet)',u:'m³',v:10},{id:'c',l:'Cement part',u:'',v:1},{id:'s',l:'Sand parts',u:'',v:2},{id:'a',l:'Aggregate parts',u:'',v:4},
  {id:'k',l:'Dry volume factor',u:'',v:1.54},{id:'wc',l:'Water / cement ratio',u:'',v:0.5},{id:'bag',l:'Cement bag',u:'kg',v:50},{id:'ws',l:'Wastage',u:'%',v:5}],
 calc(v){const T=v.c+v.s+v.a,Vd=v.V*v.k*(1+v.ws/100),cm=Vd*v.c/T,kg=cm*1440;
  return {res:[{l:'Cement',v:Math.ceil(kg/v.bag),u:'bags',key:1,d:0},{l:'Cement',v:kg/1000,u:'t',d:2},{l:'Sand',v:Vd*v.s/T,u:'m³',key:1,d:2},{l:'Coarse aggregate',v:Vd*v.a/T,u:'m³',key:1,d:2},
   {l:'Water',v:kg*v.wc,u:'L',d:0},{l:'Cement per m³',v:kg/v.V,u:'kg/m³',d:0}]};},
 f:['Dry volume = wet volume × 1.54 × (1 + wastage)','Each material = dry volume × part ÷ Σ parts','Cement mass = volume × 1440 kg/m³']});

def({id:'sieve',g:'OP',code:'OP-03',t:'Sieve analysis',
 d:'Percent passing, D10 / D30 / D60, uniformity and curvature coefficients from a sieve test.',
 src:[['BG-PRC-CS-038','4.29 Sieve Analysis']],
 inp:[{id:'rows',type:'rows',cols:[{id:'s',l:'Sieve mm (0 = pan)',v:0},{id:'m',l:'Retained g',v:0}],
  v:[[37.5,0],[19,250],[9.5,400],[4.75,350],[2.36,300],[1.18,250],[0.6,200],[0.3,150],[0.15,70],[0.075,20],[0,10]].map(([s,m])=>({s,m}))}],
 calc(v){const r=v.rows.map(x=>({s:+x.s,m:+x.m||0})).sort((a,b)=>b.s-a.s),tot=r.reduce((a,b)=>a+b.m,0);let cum=0;
  const pts=r.map(x=>{cum+=x.m;return {s:x.s,m:x.m,ret:x.m/tot*100,pass:100-cum/tot*100}});const sv=pts.filter(p=>p.s>0);
  const Dx=X=>{for(let i=0;i<sv.length-1;i++){const a=sv[i],b=sv[i+1];if(a.pass>=X&&b.pass<=X){if(a.pass===b.pass)return b.s;return Math.pow(10,Math.log10(b.s)+(X-b.pass)/(a.pass-b.pass)*(Math.log10(a.s)-Math.log10(b.s)))}}return NaN};
  const D10=Dx(10),D30=Dx(30),D60=Dx(60),Cu=D60/D10,Cc=D30*D30/(D10*D60),gravel=(sv.find(p=>p.s<=4.75)||{pass:0}).pass<50,
  well=gravel?Cu>=4&&Cc>=1&&Cc<=3:Cu>=6&&Cc>=1&&Cc<=3;
  return {res:[{l:'Cu (D60/D10)',v:Cu,key:1,d:2},{l:'Cc (D30²/D10·D60)',v:Cc,key:1,d:2},{l:'D10 / D30 / D60',v:fmt(D10,3)+' / '+fmt(D30,3)+' / '+fmt(D60,3),u:'mm'},{l:'Total mass',v:tot,u:'g',d:0},
   {l:'Grading',v:isNaN(Cu)?'—':(well?'well graded ':'poorly graded ')+(gravel?'gravel':'sand')}],
   chk:[isNaN(D10)?{s:'warn',t:'Less than 10 % passes the finest sieve, so D10 cannot be found.'}:{s:'ok',t:'Classification per USCS gradation limits.'}],
   tbl:{head:['Sieve mm','Retained g','Retained %','Passing %'],rows:pts.map(p=>({c:[p.s?fmt(p.s,3):'Pan',fmt(p.m,0),fmt(p.ret,1),fmt(p.pass,1)]}))}};},
 f:['Passing % = 100 − cumulative retained %','Dx by log-linear interpolation','Cu = D60 ÷ D10,   Cc = D30² ÷ (D10 × D60)']});


/* architecture (code-based; ref:1 shows "Based on" with the code clauses) */
const OLF=[ // name, m² per occupant, basis — IBC 2021 Table 1004.5 (converted from ft²)
 ['Assembly — chairs only (concentrated)',0.65,'net'],['Assembly — tables and chairs (unconcentrated)',1.4,'net'],['Assembly — standing space',0.46,'net'],
 ['Prayer hall',0.65,'net'],['Business / office (IBC 2018+)',13.9,'gross'],['Business / office (IBC 2015, SBC 201)',9.3,'gross'],
 ['Classroom',1.9,'net'],['Shops and vocational rooms',4.6,'net'],['Mercantile / retail',5.6,'gross'],['Residential',18.6,'gross'],
 ['Hospital — inpatient treatment',22.3,'gross'],['Hospital — sleeping areas',11.1,'gross'],['Outpatient clinic',13.9,'gross'],
 ['Commercial kitchen',18.6,'gross'],['Library — reading rooms',4.6,'net'],['Library — stack area',9.3,'gross'],['Exercise room / gym',4.6,'gross'],
 ['Industrial',9.3,'gross'],['Accessory storage / mechanical room',27.9,'gross'],['Warehouse',46.5,'gross'],['Parking garage',18.6,'gross']];
const exitsFor=n=>n<=0?0:n<50?1:n<=500?2:n<=1000?3:4;
const TRAVEL=[ // name, travel distance unspr / spr, common path unspr / spr, dead end unspr / spr (m); NaN = not permitted
 ['Assembly (A)',61,76,23,23,6.1,6.1],['Business / office (B)',61,91,23,30,6.1,15.2],['Educational (E)',61,76,23,23,6.1,15.2],
 ['Mercantile (M)',61,76,23,23,6.1,15.2],['Residential — apartments (R-2)',61,76,23,38,6.1,15.2],
 ['Factory / storage — moderate hazard (F-1, S-1)',61,76,23,30,6.1,15.2],['Factory / storage — low hazard (F-2, S-2)',91,122,23,30,6.1,15.2],
 ['Hospital (I-2)',NaN,61,NaN,30,NaN,6.1]];
const SPR=[['0','Not sprinklered'],['1','Sprinklered']];
const WCT=[ // name, WC male 1 per, WC female 1 per, lavatory 1 per, drinking fountain 1 per, urinal share — IPC 2021 Table 2902.1, §424.2
 ['Assembly — theatres, cinemas (A-1)',125,65,200,500,0.67],['Assembly — restaurants, cafés (A-2)',75,75,200,500,0.67],
 ['Assembly — halls, museums, libraries (A-3)',125,65,200,500,0.67],['Places of worship (A-3)',150,75,200,1000,0.67],
 ['Business / office (B)','b','b','b',100,0.5],['Educational (E)',50,50,50,100,0.67],['Mercantile / retail (M)',500,500,750,1000,0.5],
 ['Factory / industrial (F)',100,100,100,400,0.5],['Storage (S)',100,100,100,1000,0.5]];
const tier=(n,a,na,b)=>n<=0?0:n<=na?Math.ceil(n/a):Math.ceil(na/a)+Math.ceil((n-na)/b);
const AREA_CAT=['Net usable area','Circulation (corridors, lobbies, stairs)','Toilets, services and shafts','Walls, columns and structure','Parking and loading','Balconies and terraces'];
const PARK=[ // name, spaces, per (1 = per unit, 100 = per 100 m²) — typical municipal ratios, edit to suit
 ['Office — per 100 m²',2.5,100],['Retail / shops — per 100 m²',3.3,100],['Restaurant / café — per 100 m²',6.7,100],['Mall / supermarket — per 100 m²',4,100],
 ['Apartment — per unit',1.5,1],['Villa — per unit',2,1],['Hotel — per room',0.5,1],['Hospital — per bed',1,1],['Clinic — per 100 m²',3.3,100],
 ['School — per classroom',2,1],['Mosque — per 100 m² prayer area',5,100],['Event hall — per 100 m²',10,100],['Warehouse — per 100 m²',0.5,100],['Industrial — per 100 m²',1,100]];
const accPark=n=>n<=0?0:n<=25?1:n<=50?2:n<=75?3:n<=100?4:n<=150?5:n<=200?6:n<=300?7:n<=400?8:n<=500?9:n<=1000?Math.ceil(n*0.02):20+Math.ceil((n-1000)/100);
const MATS=[ // name, thermal conductivity W/m·K (0 = air gap, R 0.18)
 ['Reinforced concrete',2.3],['Plain concrete',1.75],['Hollow concrete block (equivalent)',0.9],['Solid concrete block',1.13],['Autoclaved aerated block (AAC)',0.16],
 ['Clay brick',0.77],['Limestone',1.5],['Granite / marble',2.8],['Cement plaster',0.72],['Gypsum plaster',0.4],['Gypsum board',0.25],['Cement screed',1.4],
 ['Ceramic / porcelain tile',1.3],['Extruded polystyrene (XPS)',0.034],['Expanded polystyrene (EPS)',0.038],['Polyurethane / PIR foam',0.025],['Mineral / rock wool',0.04],
 ['Bitumen membrane',0.23],['Timber (softwood)',0.13],['Gravel ballast',2.0],['Unventilated air gap ≥ 25 mm',0]];
const AIRGAP=MATS.length-1;
const ORIENT=[['North',150],['East',650],['South',350],['West',650],['Skylight (horizontal)',950]];
const psat=T=>6.112*Math.exp(17.62*T/(243.12+T));
const LIFT_T=[['Office — multi-tenant',30,12],['Office — single tenant',25,15],['Hotel',40,12],['Residential',60,6],['Hospital',30,10]];
const ABS=[ // name, α at 500 Hz
 ['Concrete / painted plaster',0.02],['Ceramic tile / marble',0.01],['Gypsum board on studs',0.05],['Glass — large panes',0.04],['Timber floor',0.10],
 ['Carpet on concrete',0.14],['Carpet on underlay',0.40],['Mineral fibre ceiling tile',0.60],['Perforated gypsum ceiling with backing',0.65],
 ['Fabric-wrapped panel 50 mm',0.85],['Heavy curtains (draped)',0.55],['Timber panelling',0.10],['Upholstered seating (per m²)',0.70],['Open doorway',1.0]];
const RT_T=[['Classroom',0.6],['Meeting / conference room',0.6],['Open-plan office',0.8],['Lecture hall (speech)',0.9],['Restaurant',1.0],['Prayer hall',1.2],['Multi-purpose hall',1.2],['Concert hall (music)',1.8]];

def({id:'occupant-load',g:'AR',code:'AR-01',t:'Occupant load',ref:1,
 d:'Design occupant load of a floor or building from the area of each use and the IBC occupant load factors, with the number of exits it needs.',
 src:[['IBC 2021','Table 1004.5'],['IBC 2021','§1006.3.3'],['SBC 201','Chapter 10']],
 inp:[{id:'rows',type:'rows',cols:[{id:'u',l:'Use',type:'sel',o:opt(OLF.map(x=>x[0]))},{id:'a',l:'Area m²',v:100}],v:[{u:'4',a:1200},{u:'1',a:180},{u:'18',a:60}]}],
 calc(v){const r=v.rows.map(x=>{const o=OLF[+x.u]||OLF[0],a=+x.a||0;return {o,a,n:a>0?Math.ceil(a/o[1]-1e-9):0}}),N=r.reduce((s,x)=>s+x.n,0),A=r.reduce((s,x)=>s+x.a,0);
  return {res:[{l:'Occupant load',v:N,u:'pers',key:1,d:0},{l:'Exits required',v:exitsFor(N),key:1,d:0},{l:'Total area',v:A,u:'m²',d:0},{l:'Average area per person',v:N?A/N:NaN,u:'m²/pers',d:2}],
   chk:[N<50?{s:'ok',t:'Under 50 occupants: one exit can be enough if the common path of travel is within the limit (AR-03).'}:{s:'ok',t:'50 occupants or more: at least two exits are needed.'}],
   tbl:{head:['Use','m² per person','Basis','Area m²','Occupants'],rows:r.map(x=>({c:[x.o[0],fmt(x.o[1],2),x.o[2],fmt(x.a,0),fmt(x.n,0)]}))}};},
 f:['Occupants = ⌈ area ÷ load factor ⌉ for each use, then Σ','Exits: 1–500 → 2,  501–1,000 → 3,  over 1,000 → 4  (IBC §1006.3.3)'],
 notes:['Gross area includes corridors, stairs, toilets and walls. Net area is the occupied floor only.','Fixed seating is counted by the number of seats, not by area.','SBC 201 and IBC 2015 use 9.3 m² per person for offices; IBC 2018 and later use 13.9 m². Use the edition your authority enforces.']});

def({id:'exit-width',g:'AR',code:'AR-02',t:'Egress width and exits',ref:1,
 d:'Required stair and door width for an occupant load and the number of exits, with a check of the widths drawn.',
 src:[['IBC 2021','§1005.3'],['IBC 2021','§1005.5'],['IBC 2021','§1006.3.3'],['IBC 2021','§1010.1.1, §1011.2, §1020.3']],
 inp:[{id:'N',l:'Occupant load',u:'pers',v:420,hint:'For the floor served (AR-01)'},
  {id:'sp',l:'Sprinklers and voice alarm',type:'sel',o:[['0','No'],['1','Sprinklered with emergency voice / alarm']],v:'0',wide:1},
  {h:'As drawn'},{id:'ns',l:'Exit stairs',u:'no.',v:2},{id:'ws',l:'Clear width of each stair',u:'mm',v:1700},
  {id:'nd',l:'Exit doors',u:'no.',v:2},{id:'wd',l:'Clear width of each door',u:'mm',v:1100}],
 calc(v){const sp=v.sp==='1',fs=sp?5.1:7.6,fd=sp?3.8:5.1,N=v.N,E=exitsFor(N),minS=N<50?914:1118,minC=N<50?914:1118,
  Ws=N*fs,Wd=N*fd,perS=Math.max(minS,Ws/Math.max(E,1)),perD=Math.max(813,Wd/Math.max(E,1)),totS=v.ns*v.ws,totD=v.nd*v.wd;
  return {res:[{l:'Exits required',v:E,key:1,d:0},{l:'Each stair, at least',v:perS,u:'mm',key:1,d:0},{l:'Each door, at least',v:perD,u:'mm',key:1,d:0},
   {l:'Total stair width',v:Ws,u:'mm',d:0},{l:'Total door width',v:Wd,u:'mm',d:0},{l:'Corridor width, at least',v:minC,u:'mm',d:0},
   {l:'Stair factor',v:fs,u:'mm/pers',d:1},{l:'Door factor',v:fd,u:'mm/pers',d:1}],
   chk:[v.ns>=E?{s:'ok',t:'Number of exit stairs meets the requirement.'}:{s:'bad',t:'Not enough exit stairs for this occupant load.'},
    v.nd>=E?{s:'ok',t:'Number of exit doors meets the requirement.'}:{s:'bad',t:'Not enough exit doors for this occupant load.'},
    totS>=Ws&&v.ws>=minS?{s:'ok',t:'Stair width is enough.'}:{s:'bad',t:'Stair width is too small.'},
    totD>=Wd&&v.wd>=813?{s:'ok',t:'Door width is enough.'}:{s:'bad',t:'Door width is too small.'},
    v.ns>1&&(v.ns-1)*v.ws<0.5*Ws?{s:'bad',t:'Losing one stair leaves less than half the required width (IBC §1005.5).'}:{s:'ok',t:'Losing one stair leaves at least half the required width.'}]};},
 f:['Stair width = occupants × 7.6 mm  (5.1 mm when sprinklered with voice alarm)','Other egress = occupants × 5.1 mm  (3.8 mm when sprinklered with voice alarm)','Minimums: stair 1,118 mm (914 mm under 50 occupants), door clear 813 mm, corridor 1,118 mm'],
 notes:['Stair width is measured between handrails; door width is the clear opening with the door open at 90°.','Size each floor for its own occupant load; stairs do not need to widen as they go down unless floors converge.']});

def({id:'travel',g:'AR',code:'AR-03',t:'Travel distance and common path',ref:1,
 d:'Checks the exit access travel distance, common path of egress travel and dead-end corridors against the IBC limits.',
 src:[['IBC 2021','Table 1017.2'],['IBC 2021','Table 1006.2.1'],['IBC 2021','§1020.5']],
 inp:[{id:'o',l:'Occupancy',type:'sel',o:opt(TRAVEL.map(x=>x[0])),v:'1',wide:1},{id:'sp',l:'Sprinklers',type:'sel',o:SPR,v:'1'},
  {h:'As drawn'},{id:'td',l:'Longest travel distance to an exit',u:'m',v:58},{id:'cp',l:'Common path of travel',u:'m',v:22},{id:'de',l:'Longest dead-end corridor',u:'m',v:8}],
 calc(v){const t=TRAVEL[+v.o],k=v.sp==='1'?1:0,TD=t[1+k],CP=t[3+k],DE=t[5+k],c=(x,L,ok,bad)=>isNaN(L)?{s:'bad',t:'Not permitted without sprinklers.'}:x<=L?{s:'ok',t:ok}:{s:'bad',t:bad};
  return {res:[{l:'Travel distance limit',v:TD,u:'m',key:1,d:0},{l:'Common path limit',v:CP,u:'m',key:1,d:0},{l:'Dead-end limit',v:DE,u:'m',d:1},
   {l:'Travel distance used',v:v.td/TD*100,u:'%',d:0}],
   chk:[c(v.td,TD,'Travel distance within the limit.','Travel distance exceeds the limit. Add an exit or move one.'),
    c(v.cp,CP,'Common path within the limit.','Common path exceeds the limit. Provide a second way out sooner.'),
    c(v.de,DE,'Dead-end corridor within the limit.','Dead-end corridor too long.')],
   tbl:{head:['Occupancy','Travel m','Travel m (spr.)','Common path m','Common path m (spr.)'],rows:TRAVEL.map((x,i)=>({hl:i==v.o,c:[x[0],fmt(x[1],0),fmt(x[2],0),fmt(x[3],0),fmt(x[4],0)]}))}};},
 f:['Travel distance is measured along the natural path from the most remote point to the door of an exit (stair, exit passage or outside).','Common path: the part of that route before the occupant has two separate ways to go.'],
 notes:['Common path limits shown are for spaces with more than 30 occupants (more than 10 in R-2 and some others); smaller rooms get longer limits.','— means not permitted.']});

def({id:'exit-sep',g:'AR',code:'AR-04',t:'Exit separation',ref:1,
 d:'Minimum distance between two exits: half the diagonal of the area served, or one third when the building is sprinklered.',
 src:[['IBC 2021','§1007.1.1']],
 inp:[{id:'L',l:'Length of area served',u:'m',v:60},{id:'W',l:'Width of area served',u:'m',v:25},{id:'sp',l:'Sprinklers',type:'sel',o:SPR,v:'0'},
  {id:'d',l:'Distance between exits as drawn',u:'m',v:35,hint:'Straight line between the nearest edges of the two exit doors'}],
 calc(v){const D=Math.hypot(v.L,v.W),k=v.sp==='1'?1/3:1/2,m=D*k;
  return {res:[{l:'Minimum separation',v:m,u:'m',key:1,d:1},{l:'Overall diagonal',v:D,u:'m',d:1},{l:'Rule',v:v.sp==='1'?'one third of the diagonal':'half the diagonal'}],
   chk:[v.d>=m?{s:'ok',t:'Exits are far enough apart.'}:{s:'bad',t:'Exits are too close together. Move them apart.'}]};},
 f:['Separation ≥ diagonal ÷ 2   (not sprinklered)','Separation ≥ diagonal ÷ 3   (sprinklered throughout)'],
 notes:['With three or more exits, two must meet this rule and the others must be placed so that a single fire is unlikely to block them all.','For exit stairs, the distance can be measured along a fire-rated corridor connecting them.']});

def({id:'stair',g:'AR',code:'AR-05',t:'Stair design',ref:1,
 d:'Number of risers, riser height and going for a floor-to-floor height, with the comfort rule, pitch, flights and landings.',
 src:[['IBC 2021','§1011.5'],['IBC 2021','§1011.8'],['SBC 201','§1011']],
 inp:[{id:'H',l:'Floor-to-floor height',u:'mm',v:3600},{id:'ty',l:'Stair type',type:'sel',o:[['c','Public / commercial'],['r','Inside a dwelling']],v:'c'},
  {id:'lay',l:'Layout',type:'sel',o:[['1','Straight'],['2','Dog-leg, 2 flights'],['3','U-shape, 3 flights']],v:'2'},
  {id:'W',l:'Stair clear width',u:'mm',v:1200},{id:'Rt',l:'Target riser',u:'mm',v:0,hint:'0 = highest riser allowed'}],
 calc(v){const dw=v.ty==='r',Rmax=dw?196:178,Gmin=dw?254:279,tg=v.Rt>0?Math.min(v.Rt,Rmax):Rmax,n=Math.max(2,Math.ceil(v.H/tg-1e-9)),R=v.H/n,
  G=Math.max(Gmin,Math.ceil((630-2*R)/5-1e-9)*5),fl=Math.max(+v.lay,Math.ceil(v.H/3658-1e-9)),fr=Array.from({length:fl},(_,i)=>Math.floor(n/fl)+(i<n%fl?1:0)),
  run=(fr[0]-1)*G,land=v.lay==='1'?Math.min(v.W,1219):v.W,pitch=Math.atan(R/G)*180/PI,b=2*R+G;
  const plan=v.lay==='1'?fmt((n-fl)*G+(fl-1)*land,0)+' × '+fmt(v.W,0):v.lay==='2'?fmt(run+2*land,0)+' × '+fmt(2*v.W+100,0):'—';
  return {res:[{l:'Risers',v:n,key:1,d:0},{l:'Riser height',v:R,u:'mm',key:1,d:1},{l:'Going (tread)',v:G,u:'mm',key:1,d:0},
   {l:'2R + G',v:b,u:'mm',d:0},{l:'Pitch',v:pitch,u:'°',d:1},{l:'Flights',v:fl,d:0},{l:'Risers per flight',v:fr.join(' + ')},{l:'Treads',v:n-fl,d:0},
   {l:'Run of longest flight',v:run,u:'mm',d:0},{l:'Landing depth, at least',v:land,u:'mm',d:0},{l:'Plan size (approx.)',v:plan,u:'mm'}],
   chk:[R<=Rmax&&R>=102?{s:'ok',t:'Riser between 102 mm and '+Rmax+' mm.'}:{s:'bad',t:'Riser outside 102 – '+Rmax+' mm.'},
    b>=600&&b<=650?{s:'ok',t:'2R + G is within 600 – 650 mm: a comfortable stair.'}:{s:'warn',t:'2R + G is outside 600 – 650 mm: the stair may feel awkward.'},
    v.W>=1118?{s:'ok',t:'Width suits 50 occupants or more.'}:v.W>=914?{s:'warn',t:'Width below 1,118 mm: only for fewer than 50 occupants.'}:{s:'bad',t:'Width below the 914 mm minimum.'}]};},
 f:['n = ⌈ H ÷ Rmax ⌉,   R = H ÷ n','G = max(Gmin, 630 − 2R) rounded up to 5 mm','Pitch = atan(R ÷ G),   one flight rises 3,658 mm at most','Public: R 102–178 mm, G ≥ 279 mm.   Dwelling: R ≤ 196 mm, G ≥ 254 mm'],
 notes:['Headroom of at least 2,032 mm is needed along the whole stair, measured vertically from the nosing line.','All risers and goings in a flight must match within 9.5 mm.','Plan size for a dog-leg stair includes the half landing, a floor landing and a 100 mm gap between flights.']});

def({id:'ramp',g:'AR',code:'AR-06',t:'Ramp design',ref:1,
 d:'Length, runs and landings of a ramp for a given rise and slope, with accessibility checks.',
 src:[['IBC 2021','§1012'],['ICC A117.1','§405'],['ADA 2010','§405']],
 inp:[{id:'r',l:'Total rise',u:'mm',v:900},{id:'n',l:'Slope 1 :',u:'',v:12,hint:'12 = 1:12 (8.3 %)'},{id:'use',l:'Ramp use',type:'sel',o:[['a','Accessible route'],['e','Other egress']],v:'a'},
  {id:'W',l:'Clear width between handrails',u:'mm',v:1200},{id:'Ld',l:'Landing length',u:'mm',v:1525}],
 calc(v){const runs=Math.max(1,Math.ceil(v.r/760-1e-9)),rr=v.r/runs,rl=rr*v.n,hz=v.r*v.n+(runs-1)*v.Ld,all=hz+2*v.Ld,acc=v.use==='a';
  return {res:[{l:'Ramp length (horizontal)',v:hz/1000,u:'m',key:1,d:2},{l:'Runs',v:runs,key:1,d:0},{l:'Rise of each run',v:rr,u:'mm',d:0},{l:'Length of each run',v:rl/1000,u:'m',d:2},
   {l:'Intermediate landings',v:runs-1,d:0},{l:'Overall length with top and bottom landings',v:all/1000,u:'m',d:2},{l:'Slope',v:100/v.n,u:'%',d:1},{l:'Angle',v:Math.atan(1/v.n)*180/PI,u:'°',d:1},
   {l:'Handrails',v:v.r>152?'required on both sides':'not required'}],
   chk:[acc?(v.n>=12?{s:'ok',t:'Slope 1:12 or flatter, as required on an accessible route.'}:{s:'bad',t:'Slope steeper than 1:12 is not allowed on an accessible route.'})
     :(v.n>=8?{s:'ok',t:'Slope 1:8 or flatter, as required for an egress ramp.'}:{s:'bad',t:'Slope steeper than 1:8 is not allowed for a means of egress.'}),
    v.W>=1118?{s:'ok',t:'Width suits an egress ramp.'}:v.W>=915&&acc?{s:'warn',t:'Width meets the accessible minimum (915 mm) but not the 1,118 mm egress minimum.'}:{s:'bad',t:'Ramp too narrow.'},
    v.Ld>=1525?{s:'ok',t:'Landings are long enough.'}:{s:'bad',t:'Landings must be at least 1,525 mm long.'}]};},
 f:['Runs = ⌈ rise ÷ 760 mm ⌉','Run length = rise of run × n','Length = rise × n + (runs − 1) × landing'],
 notes:['Landings are needed at the top and bottom of every run, and wherever the ramp turns (1,525 × 1,525 mm).','Cross slope must not exceed 1:48. Provide edge protection where the side drops off.','Car park ramps for vehicles follow different rules (typically 1:6 to 1:10 with transitions).']});

def({id:'toilets',g:'AR',code:'AR-07',t:'Toilet fixture count',ref:1,
 d:'Minimum number of water closets, lavatories and drinking fountains for an occupant load, from the IPC table.',
 src:[['IPC 2021','Table 2902.1'],['IPC 2021','§424.2'],['SBC 701','Chapter 29']],
 inp:[{id:'o',l:'Occupancy',type:'sel',o:opt(WCT.map(x=>x[0])),v:'4',wide:1},{id:'N',l:'Occupant load',u:'pers',v:420},{id:'pm',l:'Share of men',u:'%',v:50}],
 calc(v){const t=WCT[+v.o],m=v.N*v.pm/100,w=v.N-m,biz=t[1]==='b',
  wm=biz?tier(m,25,50,50):Math.ceil(m/t[1]-1e-9),wf=biz?tier(w,25,50,50):Math.ceil(w/t[2]-1e-9),
  lm=biz?tier(m,40,80,80):Math.ceil(m/t[3]-1e-9),lf=biz?tier(w,40,80,80):Math.ceil(w/t[3]-1e-9),df=Math.ceil(v.N/t[4]-1e-9),ur=Math.floor(wm*t[5]);
  return {res:[{l:'Water closets — men',v:wm,key:1,d:0},{l:'Water closets — women',v:wf,key:1,d:0},{l:'Lavatories — men',v:lm,d:0},{l:'Lavatories — women',v:lf,d:0},
   {l:'Urinals can replace up to',v:ur,u:'WC',d:0},{l:'Drinking fountains',v:df,d:0},{l:'Service sinks',v:1,d:0}],
   chk:[v.N<=15?{s:'ok',t:'15 occupants or fewer: one shared facility is allowed.'}:{s:'ok',t:'Separate facilities for men and women are needed.'}],
   tbl:{head:['Fixture','Men','Women','Ratio'],rows:[
    {c:['Water closets',fmt(wm,0),fmt(wf,0),biz?'1:25 for the first 50, then 1:50':'1:'+t[1]+' men,  1:'+t[2]+' women']},
    {c:['Lavatories',fmt(lm,0),fmt(lf,0),biz?'1:40 for the first 80, then 1:80':'1:'+t[3]]},
    {c:['Drinking fountains',fmt(df,0),'','1:'+t[4]]}]}};},
 f:['Occupant load is split by the share of men and women (50 / 50 unless the use justifies otherwise).','Fixtures = ⌈ occupants ÷ ratio ⌉ for each sex','Urinals may replace up to 67 % of men\'s water closets in assembly and educational uses, 50 % elsewhere.'],
 notes:['Every toilet room needs at least one accessible water closet; with six or more closets, one ambulatory stall too.','Ablution facilities for prayer areas are not covered by this table.','A water cooler or bottle filler can replace up to half of the drinking fountains.']});

def({id:'area-schedule',g:'AR',code:'AR-08',t:'Area schedule and efficiency',ref:1,
 d:'Gross and net floor areas from a schedule of spaces, with the building efficiency (net-to-gross ratio).',
 src:[['BOMA / IPMS','Area measurement'],['IBC 2021','§202 Floor area, gross / net']],
 inp:[{id:'pk',l:'Parking and balconies',type:'sel',o:[['0','Exclude from GFA'],['1','Include in GFA']],v:'0'},
  {id:'rows',type:'rows',cols:[{id:'k',l:'Category',type:'sel',o:opt(AREA_CAT)},{id:'a',l:'Area per floor m²',v:100},{id:'n',l:'Floors',v:1}],
  v:[{k:'0',a:820,n:8},{k:'1',a:110,n:8},{k:'2',a:45,n:8},{k:'3',a:45,n:8},{k:'4',a:1800,n:2}]}],
 calc(v){const tot=AREA_CAT.map(()=>0);v.rows.forEach(r=>{tot[+r.k]+=(+r.a||0)*(+r.n||0)});
  const inc=v.pk==='1',GFA=tot.reduce((s,x,i)=>s+(i>=4&&!inc?0:x),0),NFA=tot[0],eff=GFA?NFA/GFA:NaN;
  return {res:[{l:'Gross floor area (GFA)',v:GFA,u:'m²',key:1,d:0},{l:'Efficiency (net ÷ gross)',v:eff*100,u:'%',key:1,d:1},{l:'Net usable area',v:NFA,u:'m²',d:0},
   {l:'Circulation share',v:GFA?tot[1]/GFA*100:NaN,u:'%',d:1},{l:'Excluded from GFA',v:inc?0:tot[4]+tot[5],u:'m²',d:0}],
   chk:[eff<0.7?{s:'warn',t:'Efficiency below 70 %: a lot of area goes to circulation and services.'}:eff>0.9?{s:'warn',t:'Efficiency above 90 %: check that circulation, shafts and walls are all counted.'}:{s:'ok',t:'Efficiency in the usual range (offices 75 – 85 %, residential 80 – 88 %).'}],
   tbl:{head:['Category','Area m²','% of GFA'],rows:AREA_CAT.map((n,i)=>({dim:i>=4&&!inc,c:[n,fmt(tot[i],0),GFA?fmt(tot[i]/GFA*100,1):'—']}))}};},
 f:['GFA = Σ all areas inside the outer face of external walls','Efficiency = net usable ÷ GFA']});

def({id:'far',g:'AR',code:'AR-09',t:'FAR and site coverage',ref:1,
 d:'Maximum built-up area and footprint for a plot from the floor-area ratio, site coverage and setbacks, checked against a proposal.',
 src:[['Local zoning','Building regulations'],['MOMRAH','Building requirements']],
 inp:[{h:'Plot'},{id:'L',l:'Plot depth',u:'m',v:40},{id:'W',l:'Plot frontage',u:'m',v:30},{id:'sf',l:'Front setback',u:'m',v:6},{id:'sr',l:'Rear setback',u:'m',v:2},{id:'ss',l:'Side setback (each)',u:'m',v:2},
  {h:'Planning limits'},{id:'far',l:'Floor-area ratio (FAR)',u:'',v:2.4},{id:'cov',l:'Site coverage',u:'%',v:60},{id:'fm',l:'Maximum floors',u:'',v:4,hint:'0 = no limit'},
  {h:'Proposal'},{id:'fp',l:'Ground floor footprint',u:'m²',v:640},{id:'ty',l:'Typical upper floor',u:'m²',v:700},{id:'nf',l:'Floors including ground',u:'',v:4}],
 calc(v){const P=v.L*v.W,B=Math.max(0,v.L-v.sf-v.sr)*Math.max(0,v.W-2*v.ss),MF=Math.min(v.cov/100*P,B),MG=v.far*P,G=v.fp+Math.max(0,v.nf-1)*v.ty,
  fl=v.ty>0?1+Math.floor((MG-Math.min(v.fp,MF))/v.ty+1e-9):NaN;
  return {res:[{l:'Maximum GFA',v:MG,u:'m²',key:1,d:0},{l:'Maximum footprint',v:MF,u:'m²',key:1,d:0},{l:'Plot area',v:P,u:'m²',d:0},{l:'Buildable area inside setbacks',v:B,u:'m²',d:0},
   {l:'Proposed GFA',v:G,u:'m²',d:0},{l:'Proposed FAR',v:G/P,d:2},{l:'Proposed coverage',v:v.fp/P*100,u:'%',d:1},{l:'Floors the FAR allows',v:v.fm>0?Math.min(fl,v.fm):fl,d:0},{l:'GFA still available',v:MG-G,u:'m²',d:0}],
   chk:[v.fp<=MF+1e-9?{s:'ok',t:'Footprint within coverage and setbacks.'}:{s:'bad',t:'Footprint exceeds the coverage limit or the setbacks.'},
    G<=MG+1e-9?{s:'ok',t:'GFA within the FAR.'}:{s:'bad',t:'GFA exceeds the FAR.'},
    v.fm<=0||v.nf<=v.fm?{s:'ok',t:'Number of floors within the limit.'}:{s:'bad',t:'Too many floors.'}]};},
 f:['Plot area = depth × frontage','Buildable = (depth − front − rear) × (frontage − 2 × side)','Max footprint = min(coverage × plot, buildable)','Max GFA = FAR × plot'],
 notes:['What counts towards FAR varies: basements, parking, roof structures and balconies are often excluded. Use the definitions of your municipality.']});

def({id:'parking',g:'AR',code:'AR-10',t:'Parking requirement',ref:1,
 d:'Parking spaces required by use, accessible and van spaces, and the parking area needed.',
 src:[['ADA 2010','§208.2'],['IBC 2021','§1106'],['Local zoning','Parking ratios']],
 inp:[{id:'rows',type:'rows',cols:[{id:'f',l:'Use',type:'sel',o:opt(PARK.map(x=>x[0])),set:r=>{r.k=PARK[+r.f][1]}},{id:'q',l:'m² or units',v:1000},{id:'k',l:'Spaces each',v:2.5}],
   v:[{f:'0',q:6000,k:2.5},{f:'1',q:800,k:3.3}]},
  {id:'ab',l:'Area per space incl. aisles',u:'m²',v:27,hint:'25 – 30 m² for 90° bays'},{id:'lv',l:'Parking levels',u:'',v:2}],
 calc(v){const r=v.rows.map(x=>{const p=PARK[+x.f]||PARK[0],q=+x.q||0,k=+x.k||0;return {p,q,k,n:Math.ceil(q/p[2]*k-1e-9)}}),N=r.reduce((s,x)=>s+x.n,0),acc=accPark(N),A=N*v.ab;
  return {res:[{l:'Spaces required',v:N,key:1,d:0},{l:'Accessible spaces',v:acc,key:1,d:0},{l:'of which van-accessible',v:Math.ceil(acc/6),d:0},
   {l:'Parking area',v:A,u:'m²',d:0},{l:'Area per level',v:v.lv>0?A/v.lv:NaN,u:'m²',d:0}],
   chk:[{s:'warn',t:'Ratios are typical values. Replace them with the ratios of your municipality.'}],
   tbl:{head:['Use','Quantity','Spaces each','Spaces'],rows:r.map(x=>({c:[x.p[0],fmt(x.q,0),fmt(x.k,2),fmt(x.n,0)]}))}};},
 f:['Spaces = ⌈ quantity ÷ basis × ratio ⌉ for each use','Accessible: 1 per 25 up to 100, then a table up to 500, 2 % up to 1,000, then 20 + 1 per 100','Van-accessible = ⌈ accessible ÷ 6 ⌉'],
 notes:['Typical bay 2.5 × 5.5 m; aisle 6.0 m for 90° bays, 4.5 m for 60°, 3.5 m for 45° (one-way).','Accessible bay 2.5 m plus a 1.5 m access aisle (2.5 m aisle for vans); place them nearest the entrance.']});

def({id:'u-value',g:'AR',code:'AR-11',t:'U-value of a wall or roof',ref:1,
 d:'Thermal transmittance of a wall, roof or floor build-up from its layers, with a check against the energy code limit.',
 src:[['ISO 6946','Thermal resistance'],['SBC 601 / 602','Building envelope'],['ASHRAE 90.1','Appendix A']],
 inp:[{id:'el',l:'Element',type:'sel',o:[['w','Wall'],['r','Roof'],['f','Exposed floor']],v:'w'},
  {id:'rows',type:'rows',cols:[{id:'m',l:'Material',type:'sel',o:opt(MATS.map(x=>x[0])),set:r=>{r.l=MATS[+r.m][1]}},{id:'d',l:'Thickness mm',v:20},{id:'l',l:'λ W/m·K',v:0.72}],
   v:[{m:'8',d:15,l:0.72},{m:'2',d:200,l:0.9},{m:'13',d:75,l:0.034},{m:'2',d:100,l:0.9},{m:'8',d:15,l:0.72}]},
  {id:'lim',l:'U-value limit',u:'W/m²K',v:0.4,hint:'From your energy code'},{id:'dT',l:'Inside–outside temperature difference',u:'K',v:22}],
 calc(v){const rs={w:[0.13,0.04],r:[0.10,0.04],f:[0.17,0.04]}[v.el]||[0.13,0.04],
  L=v.rows.map(x=>{const m=+x.m,d=+x.d||0,l=+x.l||0;return {n:MATS[m]?MATS[m][0]:'',d,l,R:m===AIRGAP?0.18:(l>0?d/1000/l:0)}}),
  Rt=rs[0]+rs[1]+L.reduce((s,x)=>s+x.R,0),U=1/Rt,T=L.reduce((s,x)=>s+x.d,0);
  return {res:[{l:'U-value',v:U,u:'W/m²K',key:1,d:3},{l:'Total resistance R',v:Rt,u:'m²K/W',key:1,d:2},{l:'Heat flow',v:U*v.dT,u:'W/m²',d:1},{l:'Total thickness',v:T,u:'mm',d:0}],
   chk:[U<=v.lim?{s:'ok',t:'U-value meets the limit.'}:{s:'bad',t:'U-value exceeds the limit. Add insulation.'}],
   tbl:{head:['Layer','mm','λ','R m²K/W'],rows:[{c:['Inside surface','','',fmt(rs[0],2)]}].concat(L.map(x=>({c:[x.n,fmt(x.d,0),x.n&&x.R&&x.l?fmt(x.l,3):'—',fmt(x.R,3)]})),[{c:['Outside surface','','',fmt(rs[1],2)]}])}};},
 f:['R = d ÷ λ for each layer','U = 1 ÷ (Rsi + ΣR + Rse)','Rsi: wall 0.13, roof 0.10, floor 0.17.   Rse 0.04'],
 notes:['Conductivities are typical design values; use the manufacturer\'s declared λ for insulation and blocks.','Thermal bridges (columns, beams, ties) are ignored here and can raise the real U-value by 10 – 30 %.']});

def({id:'wwr',g:'AR',code:'AR-12',t:'Window-to-wall ratio and solar gain',ref:1,
 d:'Window-to-wall ratio by facade and overall, with the glazing SHGC check and an estimate of peak solar gain.',
 src:[['SBC 601','Building envelope'],['ASHRAE 90.1','§5.5.4']],
 inp:[{id:'rows',type:'rows',cols:[{id:'o',l:'Facade',type:'sel',o:opt(ORIENT.map(x=>x[0]))},{id:'w',l:'Wall area m²',v:200},{id:'g',l:'Glazing m²',v:50}],
   v:[{o:'0',w:300,g:90},{o:'1',w:200,g:40},{o:'2',w:300,g:90},{o:'3',w:200,g:40}]},
  {id:'sh',l:'Glass SHGC',u:'',v:0.25},{id:'shl',l:'SHGC limit',u:'',v:0.25},{id:'lim',l:'WWR limit',u:'%',v:40}],
 calc(v){const r=v.rows.map(x=>{const o=ORIENT[+x.o]||ORIENT[0],w=+x.w||0,g=+x.g||0;return {o,w,g,q:g*v.sh*o[1]}}),
  Wt=r.filter(x=>x.o!==ORIENT[4]).reduce((s,x)=>s+x.w,0),Gt=r.filter(x=>x.o!==ORIENT[4]).reduce((s,x)=>s+x.g,0),Q=r.reduce((s,x)=>s+x.q,0),wwr=Wt?Gt/Wt*100:NaN,
  hi=r.filter(x=>x.w>0&&x.g/x.w*100>v.lim+1e-9);
  return {res:[{l:'Overall WWR',v:wwr,u:'%',key:1,d:1},{l:'Peak solar gain (estimate)',v:Q/1000,u:'kW',key:1,d:1},{l:'Total glazing',v:Gt,u:'m²',d:0},{l:'Glazing allowed at the limit',v:Wt*v.lim/100,u:'m²',d:0}],
   chk:[wwr<=v.lim?{s:'ok',t:'Overall WWR within the limit.'}:{s:'bad',t:'Overall WWR exceeds the limit.'},
    hi.length?{s:'warn',t:'Some facades exceed the limit on their own.'}:{s:'ok',t:'Every facade is within the limit.'},
    v.sh<=v.shl?{s:'ok',t:'Glass SHGC meets the limit.'}:{s:'bad',t:'Glass SHGC exceeds the limit. Use a lower-SHGC glass or add shading.'}],
   tbl:{head:['Facade','Wall m²','Glazing m²','WWR %','Solar W/m²','Gain kW'],rows:r.map(x=>({hl:x.w>0&&x.g/x.w*100>v.lim,c:[x.o[0],fmt(x.w,0),fmt(x.g,0),x.w?fmt(x.g/x.w*100,1):'—',fmt(x.o[1],0),fmt(x.q/1000,2)]}))}};},
 f:['WWR = Σ glazing ÷ Σ gross wall area','Solar gain = glazing × SHGC × peak irradiance'],
 notes:['Peak irradiance values are typical clear-sky figures for latitudes of about 20 – 30° N, for comparing options only.','External shading (fins, overhangs) lowers the effective SHGC; many codes allow credit for it.']});

def({id:'daylight',g:'AR',code:'AR-13',t:'Daylight factor',ref:1,
 d:'Average daylight factor of a side-lit room, the glazing-to-floor ratio, and the limiting room depth.',
 src:[['BRE 209 / BS 8206-2','Average daylight factor'],['IBC 2021','§1204.2']],
 inp:[{id:'Wr',l:'Room width (window wall)',u:'m',v:6},{id:'D',l:'Room depth',u:'m',v:7},{id:'H',l:'Room height',u:'m',v:3},
  {id:'Aw',l:'Glazed area',u:'m²',v:7.2},{id:'hw',l:'Window head height',u:'m',v:2.7},{id:'T',l:'Glass light transmittance',u:'',v:0.6},
  {id:'th',l:'Visible sky angle θ',u:'°',v:70,hint:'90° if nothing blocks the view'},{id:'R',l:'Average surface reflectance',u:'',v:0.5},{id:'M',l:'Maintenance (dirt) factor',u:'',v:0.9}],
 calc(v){const F=v.Wr*v.D,S=2*(v.Wr*v.D+v.Wr*v.H+v.D*v.H),DF=v.Aw*v.T*v.M*v.th/(S*(1-v.R*v.R)),Dm=2/(1-v.R)/(1/v.Wr+1/v.hw),g=v.Aw/F*100;
  return {res:[{l:'Average daylight factor',v:DF,u:'%',key:1,d:1},{l:'Glazing ÷ floor area',v:g,u:'%',key:1,d:1},{l:'Limiting room depth',v:Dm,u:'m',d:1},
   {l:'Floor area',v:F,u:'m²',d:1},{l:'Total room surface area',v:S,u:'m²',d:1}],
   chk:[DF<2?{s:'warn',t:'Below 2 %: the room will look gloomy and need electric light most of the day.'}:DF>5?{s:'warn',t:'Above 5 %: well daylit, but check glare and solar heat gain.'}:{s:'ok',t:'2 – 5 %: a well daylit room.'},
    g>=8?{s:'ok',t:'Glazing is at least 8 % of the floor area.'}:{s:'bad',t:'Glazing is below 8 % of the floor area.'},
    v.D<=Dm?{s:'ok',t:'Room is not too deep for side lighting.'}:{s:'warn',t:'Room is deeper than the limit: the back will look dark.'}]};},
 f:['DF = T × Aw × θ × M ÷ [ A × (1 − R²) ]   (%)','Depth limit:  D/W + D/h ≤ 2 ÷ (1 − Rb)'],
 notes:['A is the total area of all room surfaces (floor, ceiling and walls, including windows).','Use simulation (Radiance, DIALux) for complex rooms or climate-based daylight metrics.']});

def({id:'condensation',g:'AR',code:'AR-14',t:'Dew point and surface condensation',ref:1,
 d:'Dew point of the air and the surface temperature of a wall, roof or glass, to check for condensation and mould.',
 src:[['ISO 13788','Surface temperature'],['ASHRAE Fundamentals','Chapter 25']],
 inp:[{id:'Ti',l:'Room air temperature',u:'°C',v:21},{id:'RH',l:'Room relative humidity',u:'%',v:60},{id:'To',l:'Outside temperature',u:'°C',v:5},
  {id:'U',l:'U-value of the element',u:'W/m²K',v:1.2,hint:'From AR-11; glazing 1.5 – 5.8'},
  {id:'rs',l:'Inside surface resistance',type:'sel',o:[['0.13','0.13 — open wall or glass'],['0.25','0.25 — corner or behind furniture']],v:'0.13',wide:1}],
 calc(v){const rh=Math.min(Math.max(v.RH,1),100),g=Math.log(rh/100)+17.62*v.Ti/(243.12+v.Ti),Td=243.12*g/(17.62-g),dT=v.Ti-v.To,Rs=+v.rs,
  Ts=v.Ti-v.U*Rs*dT,pv=rh/100*psat(v.Ti),sRH=Math.min(100,pv/psat(Ts)*100),f=dT?(Ts-v.To)/dT:NaN,Um=dT>0?(v.Ti-Td)/(Rs*dT):NaN;
  return {res:[{l:'Dew point',v:Td,u:'°C',key:1,d:1},{l:'Inside surface temperature',v:Ts,u:'°C',key:1,d:1},{l:'Margin above dew point',v:Ts-Td,u:'K',d:1},
   {l:'Relative humidity at the surface',v:sRH,u:'%',d:0},{l:'Temperature factor fRsi',v:f,d:2},{l:'Highest U-value without condensation',v:Um,u:'W/m²K',d:2}],
   chk:[Ts<=Td?{s:'bad',t:'Surface is at or below the dew point: condensation will form.'}:{s:'ok',t:'Surface stays above the dew point.'},
    sRH>=80?{s:'warn',t:'Surface humidity of 80 % or more: mould can grow.'}:{s:'ok',t:'Surface humidity below 80 %: low mould risk.'}]};},
 f:['γ = ln(RH) + 17.62 T ÷ (243.12 + T),   Td = 243.12 γ ÷ (17.62 − γ)','Tsi = Ti − U × Rsi × (Ti − To)','Surface RH = pv ÷ psat(Tsi)'],
 notes:['In air-conditioned buildings in hot, humid climates the risk is inside the wall: keep the vapour barrier on the outer (warm) side of the insulation.','Use the same check for chilled pipes and ducts: their surface temperature must stay above the room dew point, or insulate them.']});

def({id:'lift',g:'AR',code:'AR-15',t:'Lift traffic analysis',ref:1,
 d:'Up-peak round trip time, interval and handling capacity of a group of lifts, and the number of lifts needed.',
 src:[['CIBSE Guide D','Transportation systems'],['BS EN 81-20','Lift sizes']],
 inp:[{id:'ty',l:'Building type',type:'sel',o:opt(LIFT_T.map(x=>x[0])),v:'0',wide:1},{id:'N',l:'Floors served above the lobby',u:'',v:10},{id:'fh',l:'Floor height',u:'m',v:3.6},
  {id:'pp',l:'Population per floor',u:'pers',v:80,hint:'Office: net area ÷ 10 m²'},
  {id:'cc',l:'Car size',type:'sel',o:[['8','8 persons (630 kg)'],['10','10 persons (800 kg)'],['13','13 persons (1,000 kg)'],['16','16 persons (1,275 kg)'],['21','21 persons (1,600 kg)'],['26','26 persons (2,000 kg)']],v:'13'},
  {id:'v',l:'Rated speed',type:'sel',o:[['1','1.0 m/s'],['1.6','1.6 m/s'],['2','2.0 m/s'],['2.5','2.5 m/s'],['3.5','3.5 m/s'],['5','5.0 m/s']],v:'2'},
  {id:'L',l:'Number of lifts',u:'',v:5},{id:'ts',l:'Time lost per stop',u:'s',v:10,hint:'Doors plus acceleration'},{id:'tp',l:'Passenger transfer time',u:'s',v:1.2}],
 calc(v){const T=LIFT_T[+v.ty],N=Math.max(1,Math.round(v.N)),P=0.8*(+v.cc),S=N*(1-Math.pow(1-1/N,P));let H=N;for(let i=1;i<N;i++)H-=Math.pow(i/N,P);
  const tv=v.fh/(+v.v),RTT=2*H*tv+(S+1)*v.ts+2*P*v.tp,pop=N*v.pp,run=L=>({int:RTT/L,hc:300*P*L/RTT/pop*100}),cur=run(v.L);
  let need=NaN;for(let L=1;L<=30;L++){const x=run(L);if(x.int<=T[1]&&x.hc>=T[2]){need=L;break}}
  return {res:[{l:'Interval',v:cur.int,u:'s',key:1,d:1},{l:'5-minute handling capacity',v:cur.hc,u:'%',key:1,d:1},{l:'Lifts needed for the targets',v:need,key:1,d:0},
   {l:'Round trip time',v:RTT,u:'s',d:1},{l:'Persons moved in 5 minutes',v:300*P*v.L/RTT,u:'pers',d:0},{l:'Building population',v:pop,u:'pers',d:0},
   {l:'Passengers per trip',v:P,d:1},{l:'Probable stops',v:S,d:1},{l:'Highest reversal floor',v:H,d:1}],
   chk:[cur.int<=T[1]?{s:'ok',t:'Interval meets the target of '+T[1]+' s.'}:{s:'bad',t:'Interval longer than the target of '+T[1]+' s.'},
    cur.hc>=T[2]?{s:'ok',t:'Handling capacity meets the target of '+T[2]+' %.'}:{s:'bad',t:'Handling capacity below the target of '+T[2]+' %.'},
    N*v.fh/(+v.v)>25?{s:'warn',t:'Travel at rated speed takes over 25 s: consider a faster lift or zoning.'}:{s:'ok',t:'Speed suits the travel height.'}]};},
 f:['P = 0.8 × car capacity','S = N [1 − (1 − 1/N)^P],   H = N − Σ (i/N)^P','RTT = 2 H tv + (S + 1) ts + 2 P tp,   tv = floor height ÷ speed','Interval = RTT ÷ L,   HC5 = 300 P L ÷ RTT'],
 notes:['This is the classic up-peak calculation for a single lobby. Modern destination control and lunchtime traffic need simulation by the lift supplier.','Add a separate goods or firefighting lift where the code or the building\'s use calls for one.']});

def({id:'reverb',g:'AR',code:'AR-16',t:'Reverberation time',ref:1,
 d:'Reverberation time of a room from its volume and surface finishes (Sabine and Eyring), compared with the target for its use.',
 src:[['ISO 3382-2','Reverberation time'],['ANSI S12.60','Classrooms'],['BB93','Acoustic design of schools']],
 inp:[{id:'L',l:'Length',u:'m',v:12},{id:'W',l:'Width',u:'m',v:8},{id:'H',l:'Height',u:'m',v:3},{id:'use',l:'Room use',type:'sel',o:opt(RT_T.map(x=>x[0])),v:'0',wide:1},
  {id:'p',l:'People present',u:'pers',v:20},
  {id:'rows',type:'rows',cols:[{id:'m',l:'Finish',type:'sel',o:opt(ABS.map(x=>x[0]))},{id:'a',l:'Area m²',v:20}],v:[{m:'1',a:96},{m:'7',a:96},{m:'2',a:96},{m:'3',a:24}]}],
 calc(v){const V=v.L*v.W*v.H,Sr=2*(v.L*v.W+v.L*v.H+v.W*v.H),r=v.rows.map(x=>{const m=ABS[+x.m]||ABS[0],a=+x.a||0;return {m,a,A:a*m[1]}}),
  Sa=r.reduce((s,x)=>s+x.a,0),As=r.reduce((s,x)=>s+x.A,0),A=As+0.45*v.p,RT=0.161*V/A,ab=Sa?A/Sa:0,RTe=ab>0&&ab<1?0.161*V/(-Sa*Math.log(1-ab)):NaN,tg=RT_T[+v.use][1],need=0.161*V/tg-A;
  return {res:[{l:'Reverberation time (Sabine)',v:RT,u:'s',key:1,d:2},{l:'Target',v:tg,u:'s',key:1,d:1},{l:'Reverberation time (Eyring)',v:RTe,u:'s',d:2},
   {l:'Room volume',v:V,u:'m³',d:0},{l:'Total absorption',v:A,u:'m² sabins',d:1},{l:'Mean absorption coefficient',v:ab,d:2},
   {l:'Extra absorption needed',v:Math.max(0,need),u:'m² sabins',d:1},{l:'≈ area of 0.85 acoustic panel',v:Math.max(0,need)/0.85,u:'m²',d:1}],
   chk:[RT<=tg*1.1?(RT<tg*0.5?{s:'warn',t:'Much shorter than the target: the room may sound dead.'}:{s:'ok',t:'Reverberation time meets the target.'}):{s:'bad',t:'Reverberation time too long. Add absorption.'},
    Math.abs(Sa-Sr)>0.1*Sr?{s:'warn',t:'Finish areas do not add up to the room surface area. Check the schedule.'}:{s:'ok',t:'Finish areas match the room surface area.'}],
   tbl:{head:['Finish','Area m²','α 500 Hz','Absorption m²'],rows:r.map(x=>({c:[x.m[0],fmt(x.a,1),fmt(x.m[1],2),fmt(x.A,1)]})).concat([{c:['People','',fmt(0.45,2)+' each',fmt(0.45*v.p,1)]}])}};},
 f:['Sabine: RT = 0.161 V ÷ A','Eyring: RT = 0.161 V ÷ [ −S ln(1 − ᾱ) ]','A = Σ α S + 0.45 m² per person'],
 notes:['Coefficients are at 500 Hz. Check 125 Hz to 4 kHz with product data for final design.','Seats, curtains and people add a lot of absorption: an empty hall sounds more reverberant than a full one.']});


/* pipe table builder (defined after use in calc, hoisted function) */
function pipeTbl(ps){
  const lo=Math.max(0,(ps.sel<0?ps.rows.length:ps.sel)-2),hi=Math.min(ps.rows.length,ps.sel<0?ps.rows.length:ps.sel+3);
  return {head:['Size','ID mm','Velocity m/s','Friction Pa/m','ft/100 ft','Meets limits'],
   rows:ps.rows.slice(lo,hi).map((r,k)=>({hl:lo+k===ps.sel,dim:!r.ok,c:[r.n,fmt(r.id,1),fmt(r.v,2),fmt(r.R,0),fmt(RtoFt100(r.R),2),r.ok?'yes':'no']}))};
}

/* ---------- state ---------- */
const STORE='mepcalc.v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(e){saved={}}
const S={};
function defaults(c){const o={};c.inp.forEach(i=>{if(i.h)return;o[i.id]=i.type==='rows'?JSON.parse(JSON.stringify(i.v)):i.v});return o}
function st(c){if(!S[c.id]){S[c.id]=Object.assign(defaults(c),saved[c.id]||{});}return S[c.id]}
function persist(){try{const o={};for(const k in S)o[k]=S[k];localStorage.setItem(STORE,JSON.stringify(o))}catch(e){}}
function num(c,s){const o={};c.inp.forEach(i=>{if(i.h)return;const x=s[i.id];o[i.id]=i.type==='rows'?x:(i.type==='sel'?String(x):(x===''||x===null||isNaN(+x)?0:+x))});return o}

/* ---------- language ---------- */
const AR={
"Architecture":"المعماري","Based on":"المرجع","Every calculator lists the BG sheets or code clauses it is based on. Values are for preliminary design; check against the governing code and manufacturer data.":"كل حاسبة تذكر أوراق BG أو بنود الكود التي بُنيت عليها. القيم للتصميم المبدئي؛ راجعها مع الكود المعتمد وبيانات المصنّعين.",
"m²/pers":"m²/شخص","mm/pers":"mm/شخص","net":"صافية","gross":"إجمالية","WC":"مرحاض","m² sabins":"m² سابين","No":"لا","Not sprinklered":"بدون رشاشات","Sprinklered":"مزوّد برشاشات","Sprinklers":"الرشاشات","As drawn":"حسب المخططات","Use":"الاستخدام","Area m²":"المساحة m²","Occupancy":"الإشغال","Occupant load":"حمل الإشغال","Exits required":"عدد المخارج المطلوبة",
"Assembly — chairs only (concentrated)":"تجمّع — كراسي فقط (مركّز)","Assembly — tables and chairs (unconcentrated)":"تجمّع — طاولات وكراسي (غير مركّز)","Assembly — standing space":"تجمّع — وقوف","Prayer hall":"مصلى","Business / office (IBC 2018+)":"أعمال / مكاتب (IBC 2018 وما بعده)","Business / office (IBC 2015, SBC 201)":"أعمال / مكاتب (IBC 2015، SBC 201)",
"Classroom":"فصل دراسي","Shops and vocational rooms":"ورش وغرف مهنية","Mercantile / retail":"تجاري / محلات","Residential":"سكني","Hospital — inpatient treatment":"مستشفى — علاج المنوّمين","Hospital — sleeping areas":"مستشفى — مناطق النوم","Outpatient clinic":"عيادات خارجية","Commercial kitchen":"مطبخ تجاري","Library — reading rooms":"مكتبة — قاعات القراءة","Library — stack area":"مكتبة — منطقة الرفوف","Exercise room / gym":"صالة رياضية","Industrial":"صناعي","Accessory storage / mechanical room":"مخزن ملحق / غرفة ميكانيكية","Warehouse":"مستودع","Parking garage":"مواقف سيارات",
"Occupant load":"حمل الإشغال","Design occupant load of a floor or building from the area of each use and the IBC occupant load factors, with the number of exits it needs.":"حمل الإشغال التصميمي لطابق أو مبنى من مساحة كل استخدام ومعاملات حمل الإشغال في IBC، مع عدد المخارج المطلوبة.",
"Total area":"المساحة الكلية","Average area per person":"متوسط المساحة للشخص","Under 50 occupants: one exit can be enough if the common path of travel is within the limit (AR-03).":"أقل من 50 شاغلًا: قد يكفي مخرج واحد إذا كان المسار المشترك ضمن الحد (AR-03).","50 occupants or more: at least two exits are needed.":"50 شاغلًا أو أكثر: يلزم مخرجان على الأقل.",
"m² per person":"m² لكل شخص","Basis":"الأساس","Occupants":"عدد الشاغلين",
"Gross area includes corridors, stairs, toilets and walls. Net area is the occupied floor only.":"المساحة الإجمالية تشمل الممرات والسلالم ودورات المياه والجدران. المساحة الصافية هي المساحة المشغولة فقط.","Fixed seating is counted by the number of seats, not by area.":"المقاعد الثابتة تُحسب بعدد المقاعد لا بالمساحة.","SBC 201 and IBC 2015 use 9.3 m² per person for offices; IBC 2018 and later use 13.9 m². Use the edition your authority enforces.":"يستخدم SBC 201 و IBC 2015 قيمة 9.3 m² للشخص في المكاتب، ويستخدم IBC 2018 وما بعده 13.9 m². استخدم الإصدار الذي تعتمده الجهة المختصة.",
"Egress width and exits":"عرض مسارات الهروب والمخارج","Required stair and door width for an occupant load and the number of exits, with a check of the widths drawn.":"عرض السلالم والأبواب المطلوب لحمل إشغال معيّن وعدد المخارج، مع التحقق من العروض في المخططات.",
"For the floor served (AR-01)":"للطابق المخدوم (AR-01)","Sprinklers and voice alarm":"الرشاشات والإنذار الصوتي","Sprinklered with emergency voice / alarm":"مزوّد برشاشات ونظام إنذار صوتي للطوارئ","Exit stairs":"سلالم الهروب","Clear width of each stair":"العرض الصافي لكل سلم","Exit doors":"أبواب الخروج","Clear width of each door":"العرض الصافي لكل باب",
"Each stair, at least":"كل سلم، على الأقل","Each door, at least":"كل باب، على الأقل","Total stair width":"إجمالي عرض السلالم","Total door width":"إجمالي عرض الأبواب","Corridor width, at least":"عرض الممر، على الأقل","Stair factor":"معامل السلالم","Door factor":"معامل الأبواب",
"Number of exit stairs meets the requirement.":"عدد سلالم الهروب يحقق المتطلب.","Not enough exit stairs for this occupant load.":"عدد سلالم الهروب غير كافٍ لهذا الحمل.","Number of exit doors meets the requirement.":"عدد أبواب الخروج يحقق المتطلب.","Not enough exit doors for this occupant load.":"عدد أبواب الخروج غير كافٍ لهذا الحمل.",
"Stair width is enough.":"عرض السلالم كافٍ.","Stair width is too small.":"عرض السلالم أقل من المطلوب.","Door width is enough.":"عرض الأبواب كافٍ.","Door width is too small.":"عرض الأبواب أقل من المطلوب.","Losing one stair leaves less than half the required width (IBC §1005.5).":"فقدان سلم واحد يترك أقل من نصف العرض المطلوب (IBC §1005.5).","Losing one stair leaves at least half the required width.":"فقدان سلم واحد يترك نصف العرض المطلوب على الأقل.",
"Stair width is measured between handrails; door width is the clear opening with the door open at 90°.":"يُقاس عرض السلم بين الدرابزينات، وعرض الباب هو الفتحة الصافية والباب مفتوح بزاوية 90°.","Size each floor for its own occupant load; stairs do not need to widen as they go down unless floors converge.":"صمّم كل طابق لحمل إشغاله؛ لا يلزم توسيع السلالم في الطوابق السفلى إلا إذا تجمّعت إليها طوابق أخرى.",
"Travel distance and common path":"مسافة الانتقال والمسار المشترك","Checks the exit access travel distance, common path of egress travel and dead-end corridors against the IBC limits.":"يتحقق من مسافة الانتقال إلى المخرج والمسار المشترك والممرات المغلقة مقارنة بحدود IBC.",
"Assembly (A)":"تجمّع (A)","Business / office (B)":"أعمال / مكاتب (B)","Educational (E)":"تعليمي (E)","Mercantile (M)":"تجاري (M)","Residential — apartments (R-2)":"سكني — شقق (R-2)","Factory / storage — moderate hazard (F-1, S-1)":"مصانع / مخازن — خطورة متوسطة (F-1، S-1)","Factory / storage — low hazard (F-2, S-2)":"مصانع / مخازن — خطورة منخفضة (F-2، S-2)","Hospital (I-2)":"مستشفى (I-2)",
"Longest travel distance to an exit":"أطول مسافة انتقال إلى مخرج","Common path of travel":"المسار المشترك","Longest dead-end corridor":"أطول ممر مغلق","Travel distance limit":"حد مسافة الانتقال","Common path limit":"حد المسار المشترك","Dead-end limit":"حد الممر المغلق","Travel distance used":"نسبة مسافة الانتقال المستخدمة",
"Not permitted without sprinklers.":"غير مسموح بدون رشاشات.","Travel distance within the limit.":"مسافة الانتقال ضمن الحد.","Travel distance exceeds the limit. Add an exit or move one.":"مسافة الانتقال تتجاوز الحد. أضف مخرجًا أو انقل أحد المخارج.","Common path within the limit.":"المسار المشترك ضمن الحد.","Common path exceeds the limit. Provide a second way out sooner.":"المسار المشترك يتجاوز الحد. وفّر طريق خروج ثانيًا في نقطة أقرب.","Dead-end corridor within the limit.":"الممر المغلق ضمن الحد.","Dead-end corridor too long.":"الممر المغلق أطول من المسموح.",
"Travel m":"الانتقال m","Travel m (spr.)":"الانتقال m (رشاشات)","Common path m":"المسار المشترك m","Common path m (spr.)":"المسار المشترك m (رشاشات)",
"Common path limits shown are for spaces with more than 30 occupants (more than 10 in R-2 and some others); smaller rooms get longer limits.":"حدود المسار المشترك المعروضة للفراغات التي يزيد شاغلوها عن 30 (أو 10 في R-2 وبعض الإشغالات)؛ والفراغات الأصغر لها حدود أطول.","— means not permitted.":"— تعني غير مسموح.",
"Exit separation":"التباعد بين المخارج","Minimum distance between two exits: half the diagonal of the area served, or one third when the building is sprinklered.":"أقل مسافة بين مخرجين: نصف قطر المساحة المخدومة، أو الثلث عندما يكون المبنى مزوّدًا بالرشاشات.",
"Length of area served":"طول المساحة المخدومة","Width of area served":"عرض المساحة المخدومة","Distance between exits as drawn":"المسافة بين المخارج في المخططات","Straight line between the nearest edges of the two exit doors":"خط مستقيم بين أقرب حافتين لبابي المخرجين",
"Minimum separation":"أقل تباعد","Overall diagonal":"القطر الكلي","Rule":"القاعدة","one third of the diagonal":"ثلث القطر","half the diagonal":"نصف القطر","Exits are far enough apart.":"المخارج متباعدة بما يكفي.","Exits are too close together. Move them apart.":"المخارج متقاربة أكثر من اللازم. باعد بينها.",
"With three or more exits, two must meet this rule and the others must be placed so that a single fire is unlikely to block them all.":"مع ثلاثة مخارج أو أكثر، يجب أن يحقق مخرجان هذه القاعدة وأن توزَّع البقية بحيث لا يحجبها حريق واحد كلها.","For exit stairs, the distance can be measured along a fire-rated corridor connecting them.":"لسلالم الهروب يمكن قياس المسافة على امتداد ممر مقاوم للحريق يربط بينها.",
"Stair design":"تصميم السلالم","Number of risers, riser height and going for a floor-to-floor height, with the comfort rule, pitch, flights and landings.":"عدد القوائم وارتفاع القائمة وعرض النائمة لارتفاع طابق معيّن، مع قاعدة الراحة والميل والقلبات والبسطات.",
"Floor-to-floor height":"الارتفاع بين الطوابق","Stair type":"نوع السلم","Public / commercial":"عام / تجاري","Inside a dwelling":"داخل وحدة سكنية","Layout":"الشكل","Straight":"مستقيم","Dog-leg, 2 flights":"قلبتان متعاكستان","U-shape, 3 flights":"على شكل U، ثلاث قلبات","Stair clear width":"العرض الصافي للسلم","Target riser":"ارتفاع القائمة المستهدف","0 = highest riser allowed":"0 = أعلى قائمة مسموحة",
"Risers":"عدد القوائم","Riser height":"ارتفاع القائمة","Going (tread)":"عرض النائمة","Pitch":"زاوية الميل","Flights":"عدد القلبات","Risers per flight":"القوائم في كل قلبة","Treads":"عدد النوائم","Run of longest flight":"طول أطول قلبة","Landing depth, at least":"عمق البسطة، على الأقل","Plan size (approx.)":"المقاس في المسقط (تقريبي)",
"Riser between {0} mm and {1} mm.":"القائمة بين {0} mm و {1} mm.","Riser outside {0} – {1} mm.":"القائمة خارج المدى {0} – {1} mm.","2R + G is within 600 – 650 mm: a comfortable stair.":"2R + G بين 600 و 650 mm: سلم مريح.","2R + G is outside 600 – 650 mm: the stair may feel awkward.":"2R + G خارج المدى 600 – 650 mm: قد يكون السلم غير مريح.",
"Width suits 50 occupants or more.":"العرض مناسب لـ 50 شاغلًا أو أكثر.","Width below 1,118 mm: only for fewer than 50 occupants.":"العرض أقل من 1,118 mm: لأقل من 50 شاغلًا فقط.","Width below the 914 mm minimum.":"العرض أقل من الحد الأدنى 914 mm.",
"Headroom of at least 2,032 mm is needed along the whole stair, measured vertically from the nosing line.":"يلزم ارتفاع خالٍ لا يقل عن 2,032 mm على امتداد السلم، يُقاس رأسيًا من خط حواف الدرج.","All risers and goings in a flight must match within 9.5 mm.":"يجب ألا يزيد الفرق بين القوائم أو النوائم في القلبة الواحدة عن 9.5 mm.","Plan size for a dog-leg stair includes the half landing, a floor landing and a 100 mm gap between flights.":"مقاس السلم ذي القلبتين يشمل البسطة الوسطى وبسطة الطابق وفراغًا 100 mm بين القلبتين.",
"Ramp design":"تصميم المنحدرات","Length, runs and landings of a ramp for a given rise and slope, with accessibility checks.":"طول المنحدر وعدد أجزائه وبسطاته لارتفاع وميل معيّنين، مع التحقق من متطلبات الوصول الشامل.",
"Total rise":"الارتفاع الكلي","Slope 1 :":"الميل 1 :","12 = 1:12 (8.3 %)":"12 = 1:12 (8.3 %)","Ramp use":"استخدام المنحدر","Accessible route":"مسار وصول شامل","Other egress":"مسار هروب آخر","Clear width between handrails":"العرض الصافي بين الدرابزينات","Landing length":"طول البسطة",
"Ramp length (horizontal)":"طول المنحدر (أفقيًا)","Runs":"عدد الأجزاء","Rise of each run":"ارتفاع كل جزء","Length of each run":"طول كل جزء","Intermediate landings":"البسطات الوسطى","Overall length with top and bottom landings":"الطول الكلي مع البسطتين العلوية والسفلية","Angle":"الزاوية","Handrails":"الدرابزين","required on both sides":"مطلوب على الجانبين","not required":"غير مطلوب",
"Slope 1:12 or flatter, as required on an accessible route.":"الميل 1:12 أو أقل، كما يلزم في مسار الوصول الشامل.","Slope steeper than 1:12 is not allowed on an accessible route.":"الميل الأشد من 1:12 غير مسموح في مسار الوصول الشامل.","Slope 1:8 or flatter, as required for an egress ramp.":"الميل 1:8 أو أقل، كما يلزم في منحدر الهروب.","Slope steeper than 1:8 is not allowed for a means of egress.":"الميل الأشد من 1:8 غير مسموح في مسارات الهروب.",
"Width suits an egress ramp.":"العرض مناسب لمنحدر هروب.","Width meets the accessible minimum (915 mm) but not the 1,118 mm egress minimum.":"العرض يحقق حد الوصول الشامل (915 mm) لكنه أقل من حد الهروب 1,118 mm.","Ramp too narrow.":"المنحدر أضيق من المسموح.","Landings are long enough.":"البسطات بطول كافٍ.","Landings must be at least 1,525 mm long.":"يجب ألا يقل طول البسطة عن 1,525 mm.",
"Landings are needed at the top and bottom of every run, and wherever the ramp turns (1,525 × 1,525 mm).":"تلزم بسطة أعلى وأسفل كل جزء، وعند كل تغيير في الاتجاه (1,525 × 1,525 mm).","Cross slope must not exceed 1:48. Provide edge protection where the side drops off.":"يجب ألا يتجاوز الميل العرضي 1:48. وفّر حماية للحواف المكشوفة.","Car park ramps for vehicles follow different rules (typically 1:6 to 1:10 with transitions).":"منحدرات السيارات في المواقف لها قواعد مختلفة (عادة 1:6 إلى 1:10 مع أجزاء انتقالية).",
"Toilet fixture count":"عدد الأجهزة الصحية","Minimum number of water closets, lavatories and drinking fountains for an occupant load, from the IPC table.":"أقل عدد من المراحيض والمغاسل وبرادات الشرب لحمل إشغال معيّن، من جدول IPC.",
"Assembly — theatres, cinemas (A-1)":"تجمّع — مسارح وسينما (A-1)","Assembly — restaurants, cafés (A-2)":"تجمّع — مطاعم ومقاهٍ (A-2)","Assembly — halls, museums, libraries (A-3)":"تجمّع — قاعات ومتاحف ومكتبات (A-3)","Places of worship (A-3)":"دور العبادة (A-3)","Mercantile / retail (M)":"تجاري / محلات (M)","Factory / industrial (F)":"مصانع (F)","Storage (S)":"مخازن (S)","Share of men":"نسبة الرجال",
"Water closets — men":"مراحيض — رجال","Water closets — women":"مراحيض — نساء","Lavatories — men":"مغاسل — رجال","Lavatories — women":"مغاسل — نساء","Urinals can replace up to":"يمكن استبدال مباول بما يصل إلى","Drinking fountains":"برادات الشرب","Service sinks":"أحواض الخدمة",
"15 occupants or fewer: one shared facility is allowed.":"15 شاغلًا أو أقل: يُسمح بدورة مياه مشتركة واحدة.","Separate facilities for men and women are needed.":"يلزم فصل دورات مياه الرجال والنساء.",
"Fixture":"الجهاز","Men":"رجال","Women":"نساء","Ratio":"النسبة","Water closets":"المراحيض","Lavatories":"المغاسل","1:25 for the first 50, then 1:50":"1:25 لأول 50، ثم 1:50","1:40 for the first 80, then 1:80":"1:40 لأول 80، ثم 1:80","{0}:{1} men,  {2}:{3} women":"{0}:{1} رجال،  {2}:{3} نساء",
"Every toilet room needs at least one accessible water closet; with six or more closets, one ambulatory stall too.":"كل دورة مياه تحتاج مرحاضًا واحدًا على الأقل لذوي الإعاقة؛ ومع ستة مراحيض أو أكثر تلزم أيضًا حجرة لمستخدمي أدوات المشي.","Ablution facilities for prayer areas are not covered by this table.":"أماكن الوضوء للمصليات غير مشمولة في هذا الجدول.","A water cooler or bottle filler can replace up to half of the drinking fountains.":"يمكن أن يحل مبرد مياه أو موزّع تعبئة محل نصف برادات الشرب كحد أقصى.",
"Area schedule and efficiency":"جدول المساحات والكفاءة","Gross and net floor areas from a schedule of spaces, with the building efficiency (net-to-gross ratio).":"المساحات الإجمالية والصافية من جدول الفراغات، مع كفاءة المبنى (نسبة الصافي إلى الإجمالي).",
"Net usable area":"المساحة الصافية المستغلة","Circulation (corridors, lobbies, stairs)":"الحركة (ممرات وردهات وسلالم)","Toilets, services and shafts":"دورات المياه والخدمات والفتحات الرأسية","Walls, columns and structure":"الجدران والأعمدة والهيكل","Parking and loading":"المواقف والتحميل","Balconies and terraces":"الشرفات والتراسات",
"Parking and balconies":"المواقف والشرفات","Exclude from GFA":"استبعاد من المساحة الإجمالية","Include in GFA":"إدراج في المساحة الإجمالية","Category":"الفئة","Area per floor m²":"المساحة لكل طابق m²","Floors":"الطوابق",
"Gross floor area (GFA)":"المساحة الإجمالية (GFA)","Efficiency (net ÷ gross)":"الكفاءة (صافي ÷ إجمالي)","Circulation share":"نسبة الحركة","Excluded from GFA":"المستبعد من المساحة الإجمالية","% of GFA":"% من الإجمالي",
"Efficiency below 70 %: a lot of area goes to circulation and services.":"الكفاءة أقل من 70 %: نسبة كبيرة من المساحة للحركة والخدمات.","Efficiency above 90 %: check that circulation, shafts and walls are all counted.":"الكفاءة أعلى من 90 %: تأكد من احتساب الحركة والفتحات الرأسية والجدران.","Efficiency in the usual range (offices 75 – 85 %, residential 80 – 88 %).":"الكفاءة في المدى المعتاد (مكاتب 75 – 85 %، سكني 80 – 88 %).",
"FAR and site coverage":"معامل البناء ونسبة التغطية","Maximum built-up area and footprint for a plot from the floor-area ratio, site coverage and setbacks, checked against a proposal.":"أقصى مسطح بناء وأقصى بصمة للمبنى على قطعة الأرض من معامل البناء ونسبة التغطية والارتدادات، مع التحقق من المقترح.",
"Plot":"قطعة الأرض","Plot depth":"عمق القطعة","Plot frontage":"واجهة القطعة","Front setback":"الارتداد الأمامي","Rear setback":"الارتداد الخلفي","Side setback (each)":"الارتداد الجانبي (لكل جانب)","Planning limits":"اشتراطات التخطيط","Floor-area ratio (FAR)":"معامل البناء (FAR)","Site coverage":"نسبة التغطية","Maximum floors":"أقصى عدد للطوابق","0 = no limit":"0 = بلا حد",
"Proposal":"المقترح","Ground floor footprint":"مساحة الدور الأرضي","Typical upper floor":"الدور المتكرر","Floors including ground":"عدد الطوابق شاملًا الأرضي",
"Maximum GFA":"أقصى مسطح بناء","Maximum footprint":"أقصى بصمة للمبنى","Plot area":"مساحة القطعة","Buildable area inside setbacks":"المساحة القابلة للبناء داخل الارتدادات","Proposed GFA":"مسطح البناء المقترح","Proposed FAR":"معامل البناء المقترح","Proposed coverage":"نسبة التغطية المقترحة","Floors the FAR allows":"الطوابق التي يسمح بها معامل البناء","GFA still available":"مسطح البناء المتبقي",
"Footprint within coverage and setbacks.":"البصمة ضمن نسبة التغطية والارتدادات.","Footprint exceeds the coverage limit or the setbacks.":"البصمة تتجاوز نسبة التغطية أو الارتدادات.","GFA within the FAR.":"مسطح البناء ضمن معامل البناء.","GFA exceeds the FAR.":"مسطح البناء يتجاوز معامل البناء.","Number of floors within the limit.":"عدد الطوابق ضمن الحد.","Too many floors.":"عدد الطوابق أكثر من المسموح.",
"What counts towards FAR varies: basements, parking, roof structures and balconies are often excluded. Use the definitions of your municipality.":"ما يُحتسب في معامل البناء يختلف: كثيرًا ما تُستبعد القبو والمواقف وملاحق السطح والشرفات. استخدم تعريفات البلدية.",
"Parking requirement":"متطلبات المواقف","Parking spaces required by use, accessible and van spaces, and the parking area needed.":"عدد المواقف المطلوبة حسب الاستخدام، ومواقف ذوي الإعاقة والفانات، ومساحة المواقف اللازمة.",
"Office — per 100 m²":"مكاتب — لكل 100 m²","Retail / shops — per 100 m²":"محلات تجارية — لكل 100 m²","Restaurant / café — per 100 m²":"مطعم / مقهى — لكل 100 m²","Mall / supermarket — per 100 m²":"مركز تجاري / سوبرماركت — لكل 100 m²","Apartment — per unit":"شقة — لكل وحدة","Villa — per unit":"فيلا — لكل وحدة","Hotel — per room":"فندق — لكل غرفة","Hospital — per bed":"مستشفى — لكل سرير","Clinic — per 100 m²":"عيادات — لكل 100 m²","School — per classroom":"مدرسة — لكل فصل","Mosque — per 100 m² prayer area":"مسجد — لكل 100 m² من المصلى","Event hall — per 100 m²":"قاعة مناسبات — لكل 100 m²","Warehouse — per 100 m²":"مستودع — لكل 100 m²","Industrial — per 100 m²":"صناعي — لكل 100 m²",
"m² or units":"m² أو وحدات","Spaces each":"مواقف لكل وحدة","Area per space incl. aisles":"المساحة لكل موقف شاملة الممرات","25 – 30 m² for 90° bays":"25 – 30 m² للمواقف العمودية","Parking levels":"أدوار المواقف",
"Spaces required":"المواقف المطلوبة","Accessible spaces":"مواقف ذوي الإعاقة","of which van-accessible":"منها مواقف فان","Parking area":"مساحة المواقف","Area per level":"المساحة لكل دور","Ratios are typical values. Replace them with the ratios of your municipality.":"النسب قيم استرشادية. استبدلها بنسب البلدية لديك.","Quantity":"الكمية","Spaces":"المواقف",
"Typical bay 2.5 × 5.5 m; aisle 6.0 m for 90° bays, 4.5 m for 60°, 3.5 m for 45° (one-way).":"الموقف المعتاد 2.5 × 5.5 m؛ الممر 6.0 m للمواقف العمودية، و4.5 m لزاوية 60°، و3.5 m لزاوية 45° (اتجاه واحد).","Accessible bay 2.5 m plus a 1.5 m access aisle (2.5 m aisle for vans); place them nearest the entrance.":"موقف ذوي الإعاقة 2.5 m مع ممر جانبي 1.5 m (2.5 m للفانات)؛ ضعها أقرب ما يمكن للمدخل.",
"U-value of a wall or roof":"معامل الانتقال الحراري U للجدار أو السقف","Thermal transmittance of a wall, roof or floor build-up from its layers, with a check against the energy code limit.":"معامل الانتقال الحراري لجدار أو سقف أو أرضية من طبقاتها، مع التحقق من حد كود الطاقة.",
"Element":"العنصر","Wall":"جدار","Roof":"سقف","Exposed floor":"أرضية مكشوفة","Material":"المادة","Thickness mm":"السمك mm","U-value limit":"حد معامل U","From your energy code":"من كود الطاقة المعتمد","Inside–outside temperature difference":"فرق الحرارة بين الداخل والخارج",
"Reinforced concrete":"خرسانة مسلحة","Plain concrete":"خرسانة عادية","Hollow concrete block (equivalent)":"بلوك خرساني مفرغ (مكافئ)","Solid concrete block":"بلوك خرساني مصمت","Autoclaved aerated block (AAC)":"بلوك خلوي خفيف (AAC)","Clay brick":"طوب طيني","Limestone":"حجر جيري","Granite / marble":"جرانيت / رخام","Cement plaster":"لياسة أسمنتية","Gypsum plaster":"لياسة جبسية","Gypsum board":"ألواح جبسية","Cement screed":"طبقة تسوية أسمنتية","Ceramic / porcelain tile":"بلاط سيراميك / بورسلين","Extruded polystyrene (XPS)":"بوليسترين مبثوق (XPS)","Expanded polystyrene (EPS)":"بوليسترين ممدد (EPS)","Polyurethane / PIR foam":"فوم بولي يوريثان / PIR","Mineral / rock wool":"صوف صخري / معدني","Bitumen membrane":"عازل بيتوميني","Timber (softwood)":"خشب طري","Gravel ballast":"حصى","Unventilated air gap ≥ 25 mm":"فراغ هوائي غير مهوّى ≥ 25 mm",
"U-value":"معامل U","Total resistance R":"المقاومة الكلية R","Heat flow":"التدفق الحراري","Total thickness":"السمك الكلي","U-value meets the limit.":"معامل U يحقق الحد.","U-value exceeds the limit. Add insulation.":"معامل U يتجاوز الحد. زد العزل.","Layer":"الطبقة","Inside surface":"السطح الداخلي","Outside surface":"السطح الخارجي",
"Conductivities are typical design values; use the manufacturer's declared λ for insulation and blocks.":"قيم الموصلية قيم تصميمية نموذجية؛ استخدم قيمة λ المعلنة من المصنّع للعزل والبلوك.","Thermal bridges (columns, beams, ties) are ignored here and can raise the real U-value by 10 – 30 %.":"الجسور الحرارية (أعمدة وكمرات ورباطات) مهملة هنا، وقد ترفع معامل U الفعلي بنسبة 10 – 30 %.",
"Window-to-wall ratio and solar gain":"نسبة النوافذ إلى الجدران والكسب الشمسي","Window-to-wall ratio by facade and overall, with the glazing SHGC check and an estimate of peak solar gain.":"نسبة النوافذ إلى الجدران لكل واجهة وللمبنى، مع التحقق من معامل SHGC للزجاج وتقدير ذروة الكسب الشمسي.",
"Facade":"الواجهة","Wall area m²":"مساحة الجدار m²","Wall m²":"الجدار m²","Glazing m²":"الزجاج m²","North":"شمال","East":"شرق","South":"جنوب","West":"غرب","Skylight (horizontal)":"منور سقفي (أفقي)","Glass SHGC":"SHGC للزجاج","SHGC limit":"حد SHGC","WWR limit":"حد نسبة النوافذ",
"Overall WWR":"نسبة النوافذ الكلية","Peak solar gain (estimate)":"ذروة الكسب الشمسي (تقديري)","Total glazing":"إجمالي الزجاج","Glazing allowed at the limit":"الزجاج المسموح عند الحد",
"Overall WWR within the limit.":"نسبة النوافذ الكلية ضمن الحد.","Overall WWR exceeds the limit.":"نسبة النوافذ الكلية تتجاوز الحد.","Some facades exceed the limit on their own.":"بعض الواجهات تتجاوز الحد منفردة.","Every facade is within the limit.":"كل الواجهات ضمن الحد.","Glass SHGC meets the limit.":"معامل SHGC للزجاج يحقق الحد.","Glass SHGC exceeds the limit. Use a lower-SHGC glass or add shading.":"معامل SHGC للزجاج يتجاوز الحد. استخدم زجاجًا أقل أو أضف تظليلًا.",
"WWR %":"النسبة %","Solar W/m²":"الإشعاع W/m²","Gain kW":"الكسب kW",
"Peak irradiance values are typical clear-sky figures for latitudes of about 20 – 30° N, for comparing options only.":"قيم ذروة الإشعاع أرقام نموذجية لسماء صافية عند خطوط عرض 20 – 30° شمالًا تقريبًا، للمقارنة بين البدائل فقط.","External shading (fins, overhangs) lowers the effective SHGC; many codes allow credit for it.":"التظليل الخارجي (زعانف وبروزات) يخفض SHGC الفعلي، وتسمح كثير من الأكواد باحتسابه.",
"Daylight factor":"معامل ضوء النهار","Average daylight factor of a side-lit room, the glazing-to-floor ratio, and the limiting room depth.":"متوسط معامل ضوء النهار لغرفة مضاءة جانبيًا، ونسبة الزجاج إلى الأرضية، وأقصى عمق للغرفة.",
"Room width (window wall)":"عرض الغرفة (جدار النافذة)","Room depth":"عمق الغرفة","Room height":"ارتفاع الغرفة","Glazed area":"مساحة الزجاج","Window head height":"ارتفاع أعلى النافذة","Glass light transmittance":"نفاذية الزجاج للضوء","Visible sky angle θ":"زاوية السماء المرئية θ","90° if nothing blocks the view":"90° إذا لم يحجب شيء الرؤية","Average surface reflectance":"متوسط انعكاسية الأسطح","Maintenance (dirt) factor":"معامل الصيانة (الأتربة)",
"Average daylight factor":"متوسط معامل ضوء النهار","Glazing ÷ floor area":"الزجاج ÷ مساحة الأرضية","Limiting room depth":"أقصى عمق للغرفة","Total room surface area":"مجموع مساحات أسطح الغرفة",
"Below 2 %: the room will look gloomy and need electric light most of the day.":"أقل من 2 %: ستبدو الغرفة معتمة وتحتاج إضاءة صناعية معظم اليوم.","Above 5 %: well daylit, but check glare and solar heat gain.":"أعلى من 5 %: إضاءة طبيعية جيدة، لكن راجع الوهج والكسب الحراري الشمسي.","2 – 5 %: a well daylit room.":"2 – 5 %: غرفة جيدة الإضاءة الطبيعية.",
"Glazing is at least 8 % of the floor area.":"الزجاج لا يقل عن 8 % من مساحة الأرضية.","Glazing is below 8 % of the floor area.":"الزجاج أقل من 8 % من مساحة الأرضية.","Room is not too deep for side lighting.":"عمق الغرفة مناسب للإضاءة الجانبية.","Room is deeper than the limit: the back will look dark.":"الغرفة أعمق من الحد: سيبدو الجزء الخلفي معتمًا.",
"A is the total area of all room surfaces (floor, ceiling and walls, including windows).":"A مجموع مساحات أسطح الغرفة (الأرضية والسقف والجدران شاملة النوافذ).","Use simulation (Radiance, DIALux) for complex rooms or climate-based daylight metrics.":"استخدم المحاكاة (Radiance، DIALux) للغرف المعقدة أو لمقاييس ضوء النهار المعتمدة على المناخ.",
"Dew point and surface condensation":"نقطة الندى والتكثف السطحي","Dew point of the air and the surface temperature of a wall, roof or glass, to check for condensation and mould.":"نقطة ندى الهواء ودرجة حرارة سطح الجدار أو السقف أو الزجاج، للتحقق من التكثف والعفن.",
"Room air temperature":"درجة حرارة هواء الغرفة","Room relative humidity":"الرطوبة النسبية للغرفة","Outside temperature":"درجة الحرارة الخارجية","U-value of the element":"معامل U للعنصر","From AR-11; glazing 1.5 – 5.8":"من AR-11؛ الزجاج 1.5 – 5.8","Inside surface resistance":"مقاومة السطح الداخلي","0.13 — open wall or glass":"0.13 — جدار مكشوف أو زجاج","0.25 — corner or behind furniture":"0.25 — ركن أو خلف الأثاث",
"Dew point":"نقطة الندى","Inside surface temperature":"درجة حرارة السطح الداخلي","Margin above dew point":"الهامش فوق نقطة الندى","Relative humidity at the surface":"الرطوبة النسبية عند السطح","Temperature factor fRsi":"معامل الحرارة fRsi","Highest U-value without condensation":"أعلى معامل U بدون تكثف",
"Surface is at or below the dew point: condensation will form.":"السطح عند نقطة الندى أو أقل: سيحدث تكثف.","Surface stays above the dew point.":"السطح أعلى من نقطة الندى.","Surface humidity of 80 % or more: mould can grow.":"رطوبة السطح 80 % أو أكثر: قد ينمو العفن.","Surface humidity below 80 %: low mould risk.":"رطوبة السطح أقل من 80 %: خطر العفن منخفض.",
"In air-conditioned buildings in hot, humid climates the risk is inside the wall: keep the vapour barrier on the outer (warm) side of the insulation.":"في المباني المكيفة بالمناخ الحار الرطب يكون الخطر داخل الجدار: ضع عازل البخار على الجهة الخارجية (الدافئة) من العزل.","Use the same check for chilled pipes and ducts: their surface temperature must stay above the room dew point, or insulate them.":"استخدم نفس التحقق لمواسير المياه المبردة والدكت: يجب أن تبقى حرارة سطحها أعلى من نقطة ندى الغرفة، وإلا فاعزلها.",
"Lift traffic analysis":"تحليل حركة المصاعد","Up-peak round trip time, interval and handling capacity of a group of lifts, and the number of lifts needed.":"زمن الرحلة الكاملة في ذروة الصعود والفاصل الزمني وسعة النقل لمجموعة مصاعد، وعدد المصاعد اللازم.",
"Building type":"نوع المبنى","Office — multi-tenant":"مكاتب — عدة مستأجرين","Office — single tenant":"مكاتب — مستأجر واحد","Hotel":"فندق","Hospital":"مستشفى","Floors served above the lobby":"الطوابق المخدومة فوق الردهة","Floor height":"ارتفاع الطابق","Population per floor":"عدد الشاغلين لكل طابق","Office: net area ÷ 10 m²":"مكاتب: المساحة الصافية ÷ 10 m²",
"Car size":"سعة الكابينة","8 persons (630 kg)":"8 أشخاص (630 kg)","10 persons (800 kg)":"10 أشخاص (800 kg)","13 persons (1,000 kg)":"13 شخصًا (1,000 kg)","16 persons (1,275 kg)":"16 شخصًا (1,275 kg)","21 persons (1,600 kg)":"21 شخصًا (1,600 kg)","26 persons (2,000 kg)":"26 شخصًا (2,000 kg)",
"Rated speed":"السرعة المقننة","Number of lifts":"عدد المصاعد","Time lost per stop":"الزمن الضائع لكل توقف","Doors plus acceleration":"الأبواب والتسارع","Passenger transfer time":"زمن دخول وخروج الراكب",
"Interval":"الفاصل الزمني","5-minute handling capacity":"سعة النقل في 5 دقائق","Lifts needed for the targets":"المصاعد اللازمة لتحقيق الأهداف","Round trip time":"زمن الرحلة الكاملة","Persons moved in 5 minutes":"الأشخاص المنقولون في 5 دقائق","Building population":"عدد شاغلي المبنى","Passengers per trip":"الركاب في كل رحلة","Probable stops":"التوقفات المحتملة","Highest reversal floor":"أعلى طابق انعكاس",
"Interval meets the target of {0} s.":"الفاصل الزمني يحقق الهدف {0} s.","Interval longer than the target of {0} s.":"الفاصل الزمني أطول من الهدف {0} s.","Handling capacity meets the target of {0} %.":"سعة النقل تحقق الهدف {0} %.","Handling capacity below the target of {0} %.":"سعة النقل أقل من الهدف {0} %.",
"Travel at rated speed takes over 25 s: consider a faster lift or zoning.":"الرحلة بالسرعة المقننة تتجاوز 25 s: فكّر في سرعة أعلى أو تقسيم المصاعد إلى مناطق.","Speed suits the travel height.":"السرعة مناسبة لارتفاع المشوار.",
"This is the classic up-peak calculation for a single lobby. Modern destination control and lunchtime traffic need simulation by the lift supplier.":"هذا هو الحساب التقليدي لذروة الصعود من ردهة واحدة. أنظمة التحكم بالوجهة وحركة وقت الظهيرة تحتاج محاكاة من مورّد المصاعد.","Add a separate goods or firefighting lift where the code or the building's use calls for one.":"أضف مصعد بضائع أو مصعد إطفاء مستقلًا حيث يتطلبه الكود أو استخدام المبنى.",
"Reverberation time":"زمن الارتداد الصوتي","Reverberation time of a room from its volume and surface finishes (Sabine and Eyring), compared with the target for its use.":"زمن الارتداد الصوتي لغرفة من حجمها وتشطيبات أسطحها (سابين وآيرنج)، مقارنة بالهدف لاستخدامها.",
"Room use":"استخدام الغرفة","Meeting / conference room":"غرفة اجتماعات","Open-plan office":"مكتب مفتوح","Lecture hall (speech)":"قاعة محاضرات (كلام)","Restaurant":"مطعم","Multi-purpose hall":"قاعة متعددة الأغراض","Concert hall (music)":"قاعة موسيقى","People present":"عدد الحاضرين","Finish":"التشطيب",
"Concrete / painted plaster":"خرسانة / لياسة مدهونة","Ceramic tile / marble":"سيراميك / رخام","Gypsum board on studs":"ألواح جبسية على قوائم","Glass — large panes":"زجاج — ألواح كبيرة","Timber floor":"أرضية خشبية","Carpet on concrete":"موكيت على خرسانة","Carpet on underlay":"موكيت على بطانة","Mineral fibre ceiling tile":"بلاطات سقف ألياف معدنية","Perforated gypsum ceiling with backing":"سقف جبسي مثقب مع طبقة خلفية","Fabric-wrapped panel 50 mm":"لوح مغلف بالقماش 50 mm","Heavy curtains (draped)":"ستائر ثقيلة","Timber panelling":"تكسيات خشبية","Upholstered seating (per m²)":"مقاعد منجدة (لكل m²)","Open doorway":"فتحة باب مفتوحة",
"Reverberation time (Sabine)":"زمن الارتداد (سابين)","Target":"الهدف","Reverberation time (Eyring)":"زمن الارتداد (آيرنج)","Room volume":"حجم الغرفة","Total absorption":"الامتصاص الكلي","Mean absorption coefficient":"متوسط معامل الامتصاص","Extra absorption needed":"الامتصاص الإضافي اللازم","≈ area of 0.85 acoustic panel":"≈ مساحة ألواح صوتية بمعامل 0.85",
"Much shorter than the target: the room may sound dead.":"أقصر بكثير من الهدف: قد يبدو صوت الغرفة مكتومًا.","Reverberation time meets the target.":"زمن الارتداد يحقق الهدف.","Reverberation time too long. Add absorption.":"زمن الارتداد أطول من اللازم. أضف مواد ماصّة.","Finish areas do not add up to the room surface area. Check the schedule.":"مجموع مساحات التشطيبات لا يساوي مساحة أسطح الغرفة. راجع الجدول.","Finish areas match the room surface area.":"مساحات التشطيبات تطابق مساحة أسطح الغرفة.",
"α 500 Hz":"α عند 500 Hz","Absorption m²":"الامتصاص m²","People":"الأشخاص","{0} each":"{0} لكل شخص",
"Coefficients are at 500 Hz. Check 125 Hz to 4 kHz with product data for final design.":"المعاملات عند 500 Hz. راجع الترددات من 125 Hz إلى 4 kHz من بيانات المنتجات في التصميم النهائي.","Seats, curtains and people add a lot of absorption: an empty hall sounds more reverberant than a full one.":"المقاعد والستائر والأشخاص تضيف امتصاصًا كبيرًا: القاعة الفارغة أكثر ارتدادًا من الممتلئة.",

"HVAC":"التكييف والتهوية","Plumbing":"الصحي","Fire protection":"مكافحة الحريق","Electrical":"الكهرباء","Structural":"الإنشائي","Civil & geotechnical":"المدني والجيوتقني","Fundamentals":"أساسيات","Site & quality control":"الموقع وضبط الجودة",
"Room cooling load":"حمل التبريد للغرفة","Quick sensible and latent cooling load for a room using the rule-of-thumb equations from the AC Equations sheet and the ASHRAE people heat-gain table.":"حساب سريع لحمل التبريد المحسوس والكامن لغرفة باستخدام المعادلات التقريبية من ورقة AC Equations وجدول ASHRAE للكسب الحراري من الأشخاص.",
"This is the rule-of-thumb method in the AC Equations sheet. Use it for early sizing, not for final equipment selection.":"هذه هي الطريقة التقريبية في ورقة AC Equations. استخدمها للتحجيم المبدئي، لا لاختيار المعدات النهائي.",
"Room":"الغرفة","Length":"الطول","Width":"العرض","Height":"الارتفاع","Room design temperature":"درجة حرارة التصميم للغرفة","Internal gains":"الأحمال الداخلية","Number of people":"عدد الأشخاص","Activity":"النشاط",
"Theater, grade school — seated at rest":"مسرح، مدرسة ابتدائية — جلوس في راحة","High school — seated, very light work":"مدرسة ثانوية — جلوس، عمل خفيف جدًا","Office, hotel, apartment, retail — office work":"مكتب، فندق، شقة، محل — عمل مكتبي","Bank, drug store — standing, walking slowly":"بنك، صيدلية — وقوف، مشي بطيء","Restaurant — sedentary (incl. food)":"مطعم — جلوس (يشمل الطعام)","Factory — light bench work":"مصنع — عمل خفيف على طاولة","Dance hall — moderate dancing":"قاعة رقص — رقص معتدل","Factory — fairly heavy work":"مصنع — عمل ثقيل نسبيًا","Factory, bowling alley — heavy work":"مصنع، صالة بولينج — عمل ثقيل",
"Installed lighting":"قدرة الإنارة المركبة","Lighting type":"نوع الإنارة","Fluorescent (×1.22 ballast)":"فلورسنت (×1.22 للبالاست)","LED / incandescent (×1.0)":"LED / متوهج (×1.0)","Equipment (sensible)":"المعدات (محسوس)","Area-based equipment":"معدات حسب المساحة","No allowance":"بدون إضافة",
"High-tech office (50 W/m²)":"مكتب تقني (50 W/m²)","Dealer's room (150 W/m²)":"غرفة تداول (150 W/m²)","Telecom switch room (750 W/m²)":"غرفة سنترال اتصالات (750 W/m²)","Mainframe room (1000 W/m²)":"غرفة خوادم مركزية (1000 W/m²)","Safety factor":"معامل الأمان",
"Air change rate":"معدل تغيير الهواء","Airflow needed to achieve a given number of air changes per hour in a room.":"كمية الهواء اللازمة لتحقيق عدد معين من مرات تغيير الهواء في الساعة داخل غرفة.","Air changes":"مرات تغيير الهواء",
"Outdoor air (ASHRAE 62.1)":"الهواء الخارجي (ASHRAE 62.1)","Breathing-zone outdoor air from the people and area rates of ASHRAE 62.1, ventilation rate procedure.":"الهواء الخارجي لمنطقة التنفس من معدلات الأشخاص والمساحة في ASHRAE 62.1، طريقة معدل التهوية.","Occupancy category":"فئة الإشغال",
"Office space":"مكاتب","Conference / meeting":"قاعة اجتماعات","Reception area":"منطقة استقبال","Classroom (age 9+)":"فصل دراسي (9 سنوات فأكثر)","Lecture classroom":"قاعة محاضرات","Restaurant dining":"صالة طعام مطعم","Cafeteria / fast food":"كافتيريا / وجبات سريعة","Retail sales":"محلات بيع","Mall common area":"ممرات المول","Hotel bedroom":"غرفة فندقية","Lobby / pre-function":"ردهة / بهو","Place of worship":"دار عبادة","Library":"مكتبة","Health club / aerobics":"نادٍ صحي / أيروبكس",
"Floor area":"مساحة الأرضية","Occupants":"عدد الشاغلين","0 = use the default density":"0 = استخدام الكثافة الافتراضية","Zone air distribution Ez":"كفاءة توزيع الهواء Ez","1.0 — ceiling supply, cooling":"1.0 — تغذية سقفية، تبريد","0.8 — ceiling supply, warm air":"0.8 — تغذية سقفية، هواء دافئ","1.2 — floor supply, displacement":"1.2 — تغذية أرضية، إزاحة",
"Duct sizing":"تحجيم مجاري الهواء","Size a round and rectangular duct by velocity or by equal friction rate, with the friction loss of the chosen size.":"تحجيم مجرى هواء دائري ومستطيل بطريقة السرعة أو الاحتكاك المتساوي، مع فقد الاحتكاك للمقاس المختار.","Sizes round up to the next 50 mm. Air at 1.2 kg/m³, 20 °C.":"تُقرّب المقاسات لأعلى إلى أقرب 50 mm. الهواء عند 1.2 kg/m³ و20 °C.",
"Airflow":"كمية الهواء","Sizing method":"طريقة التحجيم","Equal friction":"احتكاك متساوٍ","Velocity":"السرعة","Friction rate (equal friction)":"معدل الاحتكاك (احتكاك متساوٍ)","Velocity (velocity method)":"السرعة (طريقة السرعة)","Rectangular duct depth":"عمق المجرى المستطيل","Duct material":"مادة المجرى","Galvanised steel (ε 0.09 mm)":"صاج مجلفن (ε 0.09 mm)","Flexible duct (ε 0.9 mm)":"مجرى مرن (ε 0.9 mm)","Fibreglass duct board (ε 0.15 mm)":"ألواح فايبرجلاس (ε 0.15 mm)",
"Supply airflow":"كمية هواء التغذية","Supply air quantity needed to remove a room sensible load at a given supply-to-room temperature difference.":"كمية هواء التغذية اللازمة لإزالة الحمل المحسوس للغرفة عند فرق حرارة معين بين التغذية والغرفة.","Room sensible load":"الحمل المحسوس للغرفة","Room temperature":"درجة حرارة الغرفة","Supply air temperature":"درجة حرارة هواء التغذية",
"Air heat transfer":"الحرارة المنقولة بالهواء","Sensible, latent and total heat carried by an airstream, for coil loads and fresh air loads.":"الحرارة المحسوسة والكامنة والكلية التي يحملها تيار هواء، لأحمال الملفات والهواء النقي.","Dry-bulb difference":"فرق الحرارة الجافة","Moisture difference":"فرق المحتوى الرطوبي",
"Stair pressurisation":"تضغيط السلالم","Fan airflow for a pressurised escape stair: leakage with all doors closed plus airflow across open doors.":"كمية هواء المروحة لسلم هروب مضغوط: التسرب والأبواب مغلقة مضافًا إليه الهواء عبر الأبواب المفتوحة.","Defaults reproduce the ACC sheet of BG-MEC-CS-382: QT = 6.414 m³/s.":"القيم الافتراضية تطابق ورقة ACC في BG-MEC-CS-382: QT = 6.414 m³/s.",
"Doors closed":"الأبواب مغلقة","Stair doors":"أبواب السلم","Leakage area per door":"مساحة التسرب لكل باب","Pressure differential":"فرق الضغط","Leakage exponent n":"أس التسرب n","Allowance for unknown leaks":"إضافة للتسربات غير المعروفة","Doors open":"الأبواب مفتوحة","Door height":"ارتفاع الباب","Door width":"عرض الباب","Velocity through open door":"السرعة عبر الباب المفتوح","Escape doors fully open":"أبواب الهروب المفتوحة كليًا","Other doors open (counted at 50 %)":"أبواب أخرى مفتوحة (تُحسب 50 %)",
"Chilled water flow & pipe size":"تدفق المياه المبردة وقطر الماسورة","Water flow for a cooling or heating load, and the smallest pipe that meets velocity and friction limits.":"تدفق المياه لحمل تبريد أو تدفئة، وأصغر ماسورة تحقق حدود السرعة والاحتكاك.","1 TR at 10 °F ΔT ≈ 2.4 US gpm. Typical limits: 400 Pa/m (4 ft/100 ft), 1.2 m/s up to 2\", 3 m/s for large mains.":"1 TR عند ΔT 10 °F ≈ 2.4 US gpm. الحدود المعتادة: 400 Pa/m (4 ft/100 ft)، و1.2 m/s حتى 2\"، و3 m/s للخطوط الرئيسية الكبيرة.",
"Load":"الحمل","Water ΔT":"فرق حرارة المياه ΔT","Mean water temperature":"متوسط حرارة المياه","Pipe material":"مادة الماسورة","Steel Sch 40":"حديد Sch 40","Copper Type L":"نحاس Type L","Max velocity":"أقصى سرعة","Max friction":"أقصى احتكاك",
"Pump head & motor":"ضاغط المضخة والمحرك","Pump head from static lift, pipe friction, fittings and equipment pressure drops, and the motor size it needs.":"ضاغط المضخة من الرفع الاستاتيكي واحتكاك المواسير والقطع وفواقد ضغط المعدات، وقدرة المحرك اللازمة.","Flow":"التدفق","Static head":"الضاغط الاستاتيكي","0 for a closed loop":"0 للدائرة المغلقة","Pipe length (index run)":"طول الماسورة (أبعد مسار)","Friction rate":"معدل الاحتكاك","Fittings allowance":"إضافة القطع","Chiller / heat exchanger":"الشيلر / المبادل الحراري","Coil / AHU":"الملف / وحدة مناولة الهواء","Control valve":"محبس التحكم","Strainer, other":"المصفاة، وغيرها","Pump efficiency":"كفاءة المضخة","Motor efficiency":"كفاءة المحرك",
"Expansion tank":"خزان التمدد","Expansion volume of a closed water system and the size of a diaphragm or plain tank to absorb it.":"حجم التمدد لنظام مياه مغلق وحجم خزان الغشاء أو الخزان العادي اللازم لاستيعابه.","ASHRAE Handbook — HVAC Systems & Equipment, Ch. 13 method.":"طريقة ASHRAE Handbook — HVAC Systems & Equipment، الفصل 13.","System water volume":"حجم مياه النظام","Fill (lowest) temperature":"حرارة التعبئة (الأدنى)","Highest temperature":"أعلى درجة حرارة","Fill pressure at tank":"ضغط التعبئة عند الخزان","Max pressure at tank":"أقصى ضغط عند الخزان","≈ 90 % of relief valve setting":"≈ 90 % من ضبط صمام الأمان","Steel":"حديد","Copper":"نحاس",
"Fan power":"قدرة المروحة","Absorbed and motor power for a fan from airflow and total pressure.":"القدرة الممتصة وقدرة المحرك لمروحة من كمية الهواء والضغط الكلي.","Fan total pressure":"الضغط الكلي للمروحة","Fan efficiency":"كفاءة المروحة","Drive efficiency":"كفاءة نقل الحركة","Motor margin":"هامش المحرك",
"Generator room ventilation":"تهوية غرفة المولد","Ventilation for a generator room: air to carry away radiated heat plus engine combustion air, and louvre areas.":"تهوية غرفة المولد: هواء لطرد الحرارة المشعة مضافًا إليه هواء احتراق المحرك، ومساحات الجلالات.","Heat radiated to room":"الحرارة المشعة إلى الغرفة","From the generator datasheet":"من نشرة بيانات المولد","Allowed temperature rise":"الارتفاع المسموح في الحرارة","Combustion air":"هواء الاحتراق","Intake louvre face velocity":"سرعة الهواء على جلالة السحب","Louvre free area ratio":"نسبة المساحة الحرة للجلالة",
"Water demand (fixture units)":"الطلب على المياه (وحدات الأجهزة)","Probable peak water demand by the Hunter fixture-unit method, and the supply pipe size it needs.":"الطلب الأقصى المحتمل على المياه بطريقة وحدات الأجهزة (Hunter)، وقطر ماسورة التغذية اللازم.","FU values follow the Hunter (UPC/NPC) table; edit any row to match your code.":"قيم FU من جدول Hunter (UPC/NPC)؛ عدّل أي صف ليوافق الكود المعتمد لديك.","Occupancy":"الإشغال","Private (dwellings)":"خاص (مساكن)","Public":"عام","PPR PN20":"PPR PN20","Fixture":"الجهاز الصحي",
"Water closet — flush tank":"مرحاض — صندوق طرد","Water closet — flush valve":"مرحاض — فلاش فالف","Urinal — flush valve":"مبولة — فلاش فالف","Urinal — flush tank":"مبولة — صندوق طرد","Lavatory":"مغسلة","Shower":"دش","Bathtub":"بانيو","Kitchen sink":"حوض مطبخ","Service / mop sink":"حوض خدمة","Dishwasher":"غسالة أطباق","Clothes washer":"غسالة ملابس","Drinking fountain":"مشرب مياه","Bathroom group — tank WC":"مجموعة حمام — مرحاض بصندوق","Bathroom group — flush valve WC":"مجموعة حمام — مرحاض بفلاش فالف","Qty":"العدد","FU each":"FU للوحدة",
"Drainage pipe size":"قطر ماسورة الصرف","Total drainage fixture units and the minimum pipe size for a horizontal branch, stack or building drain.":"مجموع وحدات الصرف وأقل قطر ماسورة لفرع أفقي أو عمود صرف أو خط صرف المبنى.","Sizes and capacities from IPC Tables 709.1, 710.1(1) and 710.1(2).":"الأقطار والسعات من جداول IPC رقم 709.1 و710.1(1) و710.1(2).","Pipe use":"استخدام الماسورة","Horizontal fixture branch":"فرع أفقي للأجهزة","Stack — up to 3 branch intervals":"عمود صرف — حتى 3 أدوار","Stack — total, more than 3 intervals":"عمود صرف — إجمالي، أكثر من 3 أدوار","Building drain at 1 % (⅛\"/ft)":"خط صرف المبنى بميل 1 % (⅛\"/ft)","Building drain at 2 % (¼\"/ft)":"خط صرف المبنى بميل 2 % (¼\"/ft)","Building drain at 4 % (½\"/ft)":"خط صرف المبنى بميل 4 % (½\"/ft)",
"Water closet — tank, private":"مرحاض — صندوق، خاص","Water closet — tank, public":"مرحاض — صندوق، عام","Urinal":"مبولة","Urinal ≤ 1 gpf":"مبولة ≤ 1 gpf","Floor drain (2\")":"صفاية أرضية (2\")","Service sink":"حوض خدمة","Bathroom group":"مجموعة حمام","DFU each":"DFU للوحدة",
"Roof rainwater drains":"صرف مياه الأمطار للسطح","Number of vertical rainwater leaders for a roof area at a design rainfall intensity.":"عدد مواسير الأمطار الرأسية لمساحة سطح عند شدة مطر تصميمية.","Roof area":"مساحة السطح","Rainfall intensity":"شدة المطر","Leader size":"قطر ماسورة المطر",
"Pipe friction (Hazen-Williams)":"احتكاك المواسير (Hazen-Williams)","Friction loss and velocity for water in a pipe, as used for water supply and fire protection.":"فقد الاحتكاك والسرعة للمياه في ماسورة، كما في التغذية بالمياه ومكافحة الحريق.","Internal diameter":"القطر الداخلي","C factor":"معامل C","150 — PVC, PPR, copper":"150 — PVC، PPR، نحاس","140 — new steel / ductile lined":"140 — حديد جديد / دكتايل مبطن","120 — steel (NFPA wet)":"120 — حديد (NFPA رطب)","100 — old steel / dry system":"100 — حديد قديم / نظام جاف","Equivalent length":"الطول المكافئ",
"Hot water heater & storage":"سخان المياه والتخزين","Probable hot water demand, storage volume and heater rating by the ASHRAE fixture method.":"الطلب المحتمل على المياه الساخنة وحجم التخزين وقدرة السخان بطريقة الأجهزة من ASHRAE.","Fixture rates at 60 °C from the ASHRAE Handbook — HVAC Applications, service water heating.":"معدلات الأجهزة عند 60 °C من ASHRAE Handbook — HVAC Applications، تسخين مياه الخدمة.","Building type":"نوع المبنى","Apartment":"شقق سكنية","Hospital":"مستشفى","Hotel":"فندق","Office":"مكاتب","School":"مدرسة","Gymnasium":"صالة رياضية","Private residence":"سكن خاص","Temperature rise":"ارتفاع الحرارة","Usable storage fraction":"النسبة المستفادة من التخزين","Lavatory — private":"مغسلة — خاص","Lavatory — public":"مغسلة — عام","Laundry tub":"حوض غسيل","Pantry sink":"حوض بوفيه",
"Water storage tank":"خزان المياه","Domestic water storage for a population, with optional fire reserve, and tank plan size.":"تخزين المياه المنزلية لعدد من السكان، مع احتياطي حريق اختياري، ومساحة الخزان.","Split the volume into two compartments so one can be cleaned while the other stays in service.":"قسّم الحجم إلى خليتين لتنظيف إحداهما بينما تبقى الأخرى في الخدمة.","Population":"عدد السكان","Consumption":"الاستهلاك","Storage":"التخزين","Fire reserve":"احتياطي الحريق","Water depth":"عمق المياه","Freeboard":"الارتفاع الحر",
"NPSH available":"NPSH المتاح","Net positive suction head available to a pump, checked against the pump NPSH required.":"صافي ضاغط السحب الموجب المتاح للمضخة، مقارنةً بـ NPSH المطلوب للمضخة.","Site altitude":"ارتفاع الموقع","Water temperature":"حرارة المياه","Static suction head":"ضاغط السحب الاستاتيكي","+ flooded, − suction lift":"+ سحب مغمور، − رفع سحب","Suction line losses":"فواقد خط السحب","Pump NPSH required":"NPSH المطلوب للمضخة","Required margin":"الهامش المطلوب",
"Sprinkler water demand":"الطلب المائي للرشاشات","Density/area sprinkler demand, hose allowance and fire water storage per NFPA 13.":"طلب الرشاشات بطريقة الكثافة/المساحة، وإضافة الخراطيم، وتخزين مياه الحريق وفق NFPA 13.","Preliminary demand only. Final pipe sizing needs a full hydraulic calculation from the most remote area to the source.":"طلب مبدئي فقط. التحجيم النهائي للمواسير يحتاج حسابًا هيدروليكيًا كاملًا من أبعد منطقة حتى المصدر.","Hazard classification":"تصنيف الخطورة","Light hazard":"خطورة خفيفة","Ordinary hazard group 1":"خطورة عادية مجموعة 1","Ordinary hazard group 2":"خطورة عادية مجموعة 2","Extra hazard group 1":"خطورة عالية مجموعة 1","Extra hazard group 2":"خطورة عالية مجموعة 2",
"Design area":"مساحة التصميم","0 = NFPA default for the hazard":"0 = القيمة الافتراضية في NFPA للخطورة","Coverage per sprinkler":"مساحة التغطية لكل رشاش","0 = maximum for the hazard":"0 = الحد الأقصى للخطورة","K-factor":"معامل K","Hydraulic imbalance allowance":"إضافة عدم الاتزان الهيدروليكي","Hose allowance":"إضافة الخراطيم","0 = NFPA default":"0 = القيمة الافتراضية في NFPA","Duration":"المدة","0 = NFPA minimum":"0 = الحد الأدنى في NFPA",
"Sprinkler layout":"توزيع الرشاشات","Number of standard spray sprinklers and their spacing for a rectangular room.":"عدد الرشاشات القياسية والمسافات بينها لغرفة مستطيلة.","Room length":"طول الغرفة","Room width":"عرض الغرفة","Hazard":"الخطورة",
"Clean agent quantity":"كمية الغاز النظيف","Agent mass for a total flooding FM-200 or Novec 1230 system per NFPA 2001.":"كتلة الغاز لنظام غمر كلي FM-200 أو Novec 1230 وفق NFPA 2001.","Agent":"الغاز","FM-200 (HFC-227ea)":"FM-200 (HFC-227ea)","Novec 1230 (FK-5-1-12)":"Novec 1230 (FK-5-1-12)","Height (incl. raised floor / ceiling void)":"الارتفاع (يشمل الأرضية المرفوعة / فراغ السقف)","Minimum design temperature":"أدنى درجة حرارة تصميمية","Design concentration":"تركيز التصميم","0 = typical Class A value":"0 = القيمة المعتادة لحرائق الفئة A","Altitude correction factor":"معامل تصحيح الارتفاع","Cylinder fill":"تعبئة الأسطوانة","optional":"اختياري",
"Load current & breaker":"تيار الحمل والقاطع","Design current for a single- or three-phase load and the next standard breaker rating.":"تيار التصميم لحمل أحادي أو ثلاثي الطور وقيمة القاطع القياسية التالية.","System":"النظام","Three-phase":"ثلاثي الطور","Single-phase":"أحادي الطور","Voltage (line)":"الجهد (بين الخطوط)","Power factor":"معامل القدرة","Demand factor":"معامل الطلب","Breaker margin":"هامش القاطع",
"Cable size & voltage drop":"مقطع الكابل وهبوط الجهد","Smallest copper XLPE cable that carries the breaker rating after derating and keeps the voltage drop within the limit.":"أصغر كابل نحاس XLPE يتحمل قيمة القاطع بعد معاملات التخفيض ويحافظ على هبوط الجهد ضمن الحد.","Current ratings: IEC 60364-5-52, XLPE 90 °C copper multicore, methods C and E. Check against the cable manufacturer.":"سعات التيار: IEC 60364-5-52، كابل نحاس متعدد الأقطاب XLPE 90 °C، طريقتا التركيب C وE. راجعها مع بيانات مصنّع الكابل.","Cable length":"طول الكابل","Parallel runs":"عدد الكابلات المتوازية","Installation":"طريقة التركيب","Clipped direct / solid tray (C)":"مثبت مباشرة / حامل مصمت (C)","Perforated tray / free air (E)":"حامل مثقب / هواء طلق (E)","Ambient air":"حرارة الهواء المحيط","Grouping factor":"معامل التجميع","Voltage drop limit":"حد هبوط الجهد",
"Short-circuit current":"تيار القصر","Three-phase symmetrical fault current at the transformer LV terminals and at the end of a cable.":"تيار القصر الثلاثي المتماثل عند أطراف الجهد المنخفض للمحول وعند نهاية كابل.","1000 kVA, 400 V, 6 %, infinite source gives 24.1 kA, the usual hand-check value.":"محول 1000 kVA و400 V و6 % مع مصدر لانهائي يعطي 24.1 kA، وهي قيمة المراجعة اليدوية المعتادة.","Transformer rating":"قدرة المحول","Secondary voltage":"الجهد الثانوي","Impedance":"المعاوقة","Transformer X/R":"نسبة X/R للمحول","Upstream fault level":"مستوى القصر من المصدر","0 = infinite source":"0 = مصدر لانهائي","Cable size":"مقطع الكابل",
"Power factor correction":"تحسين معامل القدرة","Capacitor bank rating to raise power factor from an existing to a target value.":"قدرة بنك المكثفات لرفع معامل القدرة من قيمته الحالية إلى القيمة المستهدفة.","Defaults reproduce the IEEE Table 50 example in BG-ELE-CS-078: 500 kW × 0.46 = 230 kvar.":"القيم الافتراضية تطابق مثال جدول IEEE رقم 50 في BG-ELE-CS-078: 500 kW × 0.46 = 230 kvar.","Active load":"الحمل الفعّال","Existing power factor":"معامل القدرة الحالي","Target power factor":"معامل القدرة المستهدف","Voltage":"الجهد",
"Lighting (lumen method)":"الإنارة (طريقة اللومن)","Number of luminaires for an average illuminance, with layout spacing and power density.":"عدد وحدات الإنارة لشدة إضاءة متوسطة، مع المسافات بينها وكثافة القدرة.","Mounting height above work plane":"ارتفاع التركيب فوق مستوى العمل","Required illuminance":"شدة الإضاءة المطلوبة","Office / drawing work — 500 lx":"مكاتب / أعمال رسم — 500 lx","Classroom / prayer hall — 300 lx":"فصل دراسي / مصلى — 300 lx","Technical drawing — 750 lx":"رسم هندسي — 750 lx","Lobby / reception — 200 lx":"ردهة / استقبال — 200 lx","Plant / A/C room — 150 lx":"غرفة معدات / تكييف — 150 lx","Corridor / stairs — 100 lx":"ممرات / سلالم — 100 lx","Detailed inspection — 1000 lx":"فحص دقيق — 1000 lx","Lumens per luminaire":"اللومن لكل وحدة","Watts per luminaire":"الوات لكل وحدة","Utilisation factor":"معامل الاستفادة","0 = generic estimate from room index":"0 = تقدير عام من دليل الغرفة","Maintenance factor":"معامل الصيانة",
"Transformer sizing":"تحجيم المحول","Transformer rating from connected load, demand factor and spare capacity.":"قدرة المحول من الحمل الموصّل ومعامل الطلب والسعة الاحتياطية.","Connected load":"الحمل الموصّل","Future spare":"الاحتياطي المستقبلي","Max loading":"أقصى تحميل",
"Conduit fill":"إشغال المواسير الكهربائية","Minimum conduit size for a set of cables at the 53 / 31 / 40 % fill limits.":"أقل قطر ماسورة لمجموعة كابلات عند حدود الإشغال 53 / 31 / 40 %.","As in the source sheet, the nominal conduit diameter is used. Check the manufacturer inside diameter for heavy-gauge conduit.":"كما في الورقة الأصلية، يُستخدم القطر الاسمي للماسورة. راجع القطر الداخلي من المصنّع للمواسير الثقيلة.","Cable OD mm":"القطر الخارجي للكابل mm",
"Cable tray width":"عرض حامل الكابلات","Cable tray width for a set of cables, by single-layer spacing or by fill ratio, with spare capacity.":"عرض حامل الكابلات لمجموعة كابلات، بطريقة الطبقة الواحدة أو نسبة الإشغال، مع سعة احتياطية.","Method":"الطريقة","Single layer, spaced":"طبقة واحدة بمسافات","Fill ratio of tray section":"نسبة إشغال مقطع الحامل","Gap between cables":"المسافة بين الكابلات","Touching":"متلامسة","One cable diameter":"قطر كابل واحد","Tray depth":"عمق الحامل","Fill ratio (fill method)":"نسبة الإشغال (طريقة الإشغال)","Spare capacity":"السعة الاحتياطية",
"Earth electrode resistance":"مقاومة قضبان التأريض","Resistance of a vertical earth rod and of several rods in a line, against a target value.":"مقاومة قضيب تأريض رأسي ومجموعة قضبان على خط واحد، مقارنةً بقيمة مستهدفة.","Soil resistivity":"المقاومة النوعية للتربة","Rod length":"طول القضيب","Rod diameter":"قطر القضيب","Number of rods":"عدد القضبان","Rod spacing":"المسافة بين القضبان","Target resistance":"المقاومة المستهدفة",
"Unit converter":"محوّل الوحدات","Convert the units used across engineering work: flow, pressure, cooling, length, area, volume, velocity and temperature.":"تحويل الوحدات المستخدمة في الأعمال الهندسية: التدفق والضغط والتبريد والطول والمساحة والحجم والسرعة والحرارة.","Quantity":"الكمية","Pressure":"الضغط","Power & cooling":"القدرة والتبريد","Area":"المساحة","Volume":"الحجم","Temperature":"درجة الحرارة","Value":"القيمة","From unit":"من الوحدة",
"RC beam flexure":"انحناء الكمرة الخرسانية","Tension reinforcement for a rectangular reinforced concrete beam under a factored moment, ACI 318.":"حديد الشد لكمرة خرسانية مسلحة مستطيلة تحت عزم مصعّد، وفق ACI 318.","Factored moment Mu":"العزم المصعّد Mu","Width b":"العرض b","Depth h":"العمق h","Cover to bar centre":"الغطاء حتى مركز السيخ","Concrete f'c":"مقاومة الخرسانة f'c","Steel fy":"إجهاد خضوع الحديد fy","Bar diameter":"قطر السيخ",
"RC beam shear":"قص الكمرة الخرسانية","Stirrup spacing for a reinforced concrete beam under factored shear, ACI 318.":"مسافات الكانات لكمرة خرسانية مسلحة تحت قص مصعّد، وفق ACI 318.","Factored shear Vu":"القص المصعّد Vu","Web width b":"عرض الجذع b","Effective depth d":"العمق الفعّال d","Stirrup fyt":"إجهاد خضوع الكانات fyt","Stirrup diameter":"قطر الكانة","Legs":"عدد الفروع",
"One-way slab":"بلاطة في اتجاه واحد","Thickness, factored moment and main bar spacing for a one-way solid slab per metre width, ACI 318.":"السمك والعزم المصعّد وتباعد الحديد الرئيسي لبلاطة مصمتة في اتجاه واحد لكل متر عرض، وفق ACI 318.","Clear span":"البحر الصافي","Support condition":"حالة الارتكاز","Simply supported":"بسيطة الارتكاز","One end continuous":"مستمرة من طرف","Both ends continuous":"مستمرة من الطرفين","Cantilever":"كابولي","Slab thickness":"سمك البلاطة","0 = ACI minimum, rounded up":"0 = الحد الأدنى في ACI مقرّبًا لأعلى","Finishes & partitions":"التشطيبات والقواطع","Live load":"الحمل الحي","Clear cover":"الغطاء الخرساني",
"RC short column (axial)":"عمود خرساني قصير (محوري)","Axial capacity of a short tied or spiral concrete column, and the size needed for a factored load, ACI 318.":"السعة المحورية لعمود خرساني قصير بكانات أو حلزوني، والمقاس اللازم لحمل مصعّد، وفق ACI 318.","Factored axial load Pu":"الحمل المحوري المصعّد Pu","Steel ratio":"نسبة التسليح","Column type":"نوع العمود","Tied":"بكانات","Spiral":"حلزوني",
"Isolated footing":"قاعدة منفصلة","Square spread footing size, thickness from punching and beam shear, and bottom reinforcement, ACI 318.":"مقاس قاعدة منفصلة مربعة، وسمكها من القص الثاقب وقص الكمرة، والتسليح السفلي، وفق ACI 318.","Dead load":"الحمل الميت","Allowable soil pressure":"جهد التربة المسموح","Footing & backfill allowance":"إضافة وزن القاعدة والردم","Square column side":"ضلع العمود المربع","Cover":"الغطاء",
"Punching shear":"القص الثاقب","Two-way (punching) shear capacity of a flat slab or footing at a column, ACI 318.":"مقاومة القص الثاقب (في اتجاهين) لبلاطة مسطحة أو قاعدة عند عمود، وفق ACI 318.","Column side c1":"ضلع العمود c1","Column side c2":"ضلع العمود c2","Column position":"موقع العمود","Interior":"داخلي","Edge":"طرفي","Corner":"ركني",
"Development & lap length":"طول التماسك والوصلة","Tension development length, standard hook length and Class B lap splice for deformed bars, ACI 318.":"طول التماسك في الشد، وطول الخطاف القياسي، ووصلة التراكب من الفئة B للأسياخ المشرشرة، وفق ACI 318.","Spacing and cover":"التباعد والغطاء","Clear spacing ≥ db and cover ≥ db (with stirrups)":"تباعد صافٍ ≥ db وغطاء ≥ db (مع كانات)","Other cases":"حالات أخرى","Bar position":"موقع السيخ","Top bar (>300 mm fresh concrete below)":"سيخ علوي (>300 mm خرسانة طازجة أسفله)","Other":"أخرى","Coating":"الطلاء","Uncoated":"غير مطلي","Epoxy, other":"إيبوكسي، أخرى","Epoxy, low cover":"إيبوكسي، غطاء قليل","Concrete":"الخرسانة","Normal weight":"عادية الوزن","Lightweight":"خفيفة الوزن",
"Simple beam analysis":"تحليل كمرة بسيطة","Reactions, shear, bending moment and deflection of a simply supported beam with a uniform load and a point load.":"ردود الأفعال والقص وعزم الانحناء والترخيم لكمرة بسيطة الارتكاز تحت حمل موزع وحمل مركز.","Span":"البحر","Uniform load":"الحمل الموزع","Point load":"الحمل المركز","Point load from left support":"بعد الحمل المركز عن الركيزة اليسرى","Elastic modulus E":"معامل المرونة E","Second moment I":"عزم القصور الذاتي I","Deflection limit":"حد الترخيم",
"Steel W-beam selection":"اختيار كمرة حديد W","Lightest W-shape for a simply supported, fully braced floor beam by strength and live-load deflection, AISC 360 LRFD.":"أخف قطاع W لكمرة سقف بسيطة الارتكاز ومقيدة جانبيًا بالكامل، حسب المقاومة وترخيم الحمل الحي، وفق AISC 360 LRFD.","Dead load (incl. self weight)":"الحمل الميت (يشمل الوزن الذاتي)","Yield strength Fy":"إجهاد الخضوع Fy","Live-load deflection limit":"حد ترخيم الحمل الحي",
"Wind pressure (ASCE 7)":"ضغط الرياح (ASCE 7)","Velocity pressure at a height and the main wind-force design pressures on windward and leeward walls, ASCE 7-16.":"ضغط السرعة عند ارتفاع معين، وضغوط التصميم الرئيسية على الحوائط المواجهة والخلفية للرياح، وفق ASCE 7-16.","Basic wind speed (3-s gust)":"سرعة الرياح الأساسية (هبة 3 ثوانٍ)","Exposure":"فئة التعرض","B — urban":"B — حضري","C — open":"C — مفتوح","D — coastal":"D — ساحلي","Height z":"الارتفاع z","Topographic Kzt":"معامل الطبوغرافيا Kzt","Directionality Kd":"معامل الاتجاه Kd","Gust factor G":"معامل الهبّات G","Internal GCpi":"الضغط الداخلي GCpi",
"Seismic base shear":"قص القاعدة الزلزالي","Equivalent lateral force base shear from design spectral accelerations, ASCE 7 / IBC.":"قص القاعدة بطريقة القوة الجانبية المكافئة من تسارعات الطيف التصميمية، وفق ASCE 7 / IBC.","Response modification R":"معامل تعديل الاستجابة R","Importance factor Ie":"معامل الأهمية Ie","Structural system":"النظام الإنشائي","Steel moment frame":"إطار حديد مقاوم للعزوم","Concrete moment frame":"إطار خرساني مقاوم للعزوم","Steel EBF / BRBF":"حديد EBF / BRBF","All other systems":"جميع الأنظمة الأخرى","Building height hn":"ارتفاع المبنى hn","Long-period TL":"الزمن الطويل TL","Seismic weight W":"الوزن الزلزالي W",
"Retaining wall stability":"اتزان الحائط الساند","Overturning, sliding and soil bearing checks for a cantilever retaining wall with Rankine active pressure.":"فحوص الانقلاب والانزلاق وجهد التربة لحائط ساند كابولي بضغط رانكين الإيجابي.","Passive resistance in front of the toe is ignored, which is conservative. Concrete taken as 24 kN/m³.":"أُهملت المقاومة السلبية أمام المقدمة، وهذا في جانب الأمان. وزن الخرسانة 24 kN/m³.","Geometry":"الأبعاد","Stem height above base":"ارتفاع الجذع فوق القاعدة","Base thickness":"سمك القاعدة","Stem thickness, top":"سمك الجذع أعلى","Stem thickness, bottom":"سمك الجذع أسفل","Toe length":"طول المقدمة","Heel length":"طول الكعب","Soil":"التربة","Soil unit weight":"وزن وحدة الحجم للتربة","Friction angle φ":"زاوية الاحتكاك φ","Surcharge":"الحمل الإضافي","Base friction μ":"معامل احتكاك القاعدة μ","Allowable bearing":"جهد التحمل المسموح",
"Rebar weight schedule":"جدول أوزان الحديد","Steel weight from a bar bending schedule, totalled by bar diameter.":"وزن الحديد من جدول تفريد الأسياخ، مجمّعًا حسب القطر.","Wastage":"الهالك","Bar Ø":"قطر السيخ Ø","Length each m":"طول السيخ m","No. of bars":"عدد الأسياخ",
"Soil bearing capacity":"قدرة تحمل التربة","Ultimate and allowable bearing capacity of a shallow footing by the general bearing capacity equation.":"قدرة التحمل القصوى والمسموحة لأساس سطحي بمعادلة قدرة التحمل العامة.","No groundwater correction. If the water table is within B below the footing, use the submerged unit weight.":"لا يوجد تصحيح للمياه الجوفية. إذا كان منسوب المياه ضمن مسافة B أسفل الأساس، استخدم وزن وحدة الحجم المغمور.","Footing width B":"عرض الأساس B","Footing length L":"طول الأساس L","Use a large value for a strip":"استخدم قيمة كبيرة للأساس الشريطي","Founding depth Df":"عمق التأسيس Df","Cohesion c":"التماسك c","Soil unit weight γ":"وزن وحدة الحجم للتربة γ","Factor of safety":"معامل الأمان",
"Consolidation settlement":"هبوط الدمج","Primary consolidation settlement of a clay layer and the time to reach a degree of consolidation, Terzaghi one-dimensional theory.":"هبوط الدمج الابتدائي لطبقة طينية والزمن اللازم للوصول إلى درجة دمج معينة، بنظرية ترزاجي أحادية البعد.","Clay layer thickness":"سمك الطبقة الطينية","Initial void ratio e0":"نسبة الفراغات الابتدائية e0","Compression index Cc":"معامل الانضغاط Cc","Recompression index Cr":"معامل إعادة الانضغاط Cr","Initial effective stress (mid-layer)":"الإجهاد الفعّال الابتدائي (منتصف الطبقة)","Stress increase Δσ":"زيادة الإجهاد Δσ","Preconsolidation pressure":"ضغط ما قبل الدمج","Coefficient cv":"معامل الدمج cv","Drainage":"الصرف","Top and bottom":"من أعلى وأسفل","One side only":"من جهة واحدة","Degree of consolidation":"درجة الدمج",
"Soil phase relations":"علاقات أطوار التربة","Dry unit weight, void ratio, porosity and saturation from specific gravity, water content and bulk unit weight.":"وزن وحدة الحجم الجاف ونسبة الفراغات والمسامية ودرجة التشبع من الوزن النوعي والمحتوى المائي ووزن وحدة الحجم الكلي.","Specific gravity Gs":"الوزن النوعي Gs","Water content w":"المحتوى المائي w","Bulk unit weight γ":"وزن وحدة الحجم الكلي γ","Unit weight of water":"وزن وحدة الحجم للماء",
"Gravity pipe flow (Manning)":"السريان بالجاذبية (Manning)","Flow and velocity in a partly full circular pipe or culvert by the Manning equation.":"التدفق والسرعة في ماسورة دائرية أو بربخ ممتلئ جزئيًا بمعادلة ماننج.","Pipe diameter":"قطر الماسورة","Slope":"الميل","Manning n":"معامل ماننج n","0.011 — PVC / HDPE":"0.011 — PVC / HDPE","0.013 — concrete":"0.013 — خرسانة","0.015 — old concrete":"0.015 — خرسانة قديمة","0.024 — corrugated metal":"0.024 — معدن مموج","Depth of flow y/D":"عمق السريان y/D",
"Section properties":"خواص القطاعات","Area, second moment, elastic and plastic modulus and radius of gyration for common cross-sections.":"المساحة وعزم القصور الذاتي ومعاير المقطع المرن واللدن ونصف قطر القصور للقطاعات الشائعة.","Fillets and root radii are ignored, so rolled sections come out slightly lighter than catalogue values.":"أُهملت أنصاف أقطار التقوس عند الجذر، لذا تظهر القطاعات المدرفلة أخف قليلًا من قيم الكتالوج.","Shape":"الشكل","Rectangle":"مستطيل","Hollow rectangle":"مستطيل مجوف","Solid circle":"دائرة مصمتة","Circular tube":"أنبوب دائري","I-section (symmetric)":"قطاع I (متماثل)","Width / flange width b":"العرض / عرض الشفة b","Depth / diameter h":"العمق / القطر h","Wall / flange thickness t":"سمك الجدار / الشفة t","Web thickness tw":"سمك الجذع tw","Density":"الكثافة",
"Concrete cube test results":"نتائج اختبار مكعبات الخرسانة","Mean, standard deviation and characteristic strength of a set of concrete test results, with conformity checks.":"المتوسط والانحراف المعياري والمقاومة المميزة لمجموعة نتائج اختبار خرسانة، مع فحوص المطابقة.","Specified strength":"المقاومة المحددة","Acceptance rule":"معيار القبول","BS EN 206 (cubes)":"BS EN 206 (مكعبات)","ACI 318 (cylinders)":"ACI 318 (أسطوانات)","Result MPa":"النتيجة MPa",
"Concrete materials":"مواد الخرسانة","Cement, sand, coarse aggregate and water for a volume of concrete from a nominal mix ratio.":"الأسمنت والرمل والركام الكبير والمياه لحجم من الخرسانة بنسبة خلط اسمية.","Concrete volume (wet)":"حجم الخرسانة (رطب)","Cement part":"نسبة الأسمنت","Sand parts":"نسبة الرمل","Aggregate parts":"نسبة الركام","Dry volume factor":"معامل الحجم الجاف","Water / cement ratio":"نسبة الماء إلى الأسمنت","Cement bag":"شكارة الأسمنت",
"Sieve analysis":"التحليل المنخلي","Percent passing, D10 / D30 / D60, uniformity and curvature coefficients from a sieve test.":"النسبة المارة وD10 / D30 / D60 ومعاملا الانتظام والتدرج من اختبار المناخل.","Sieve mm (0 = pan)":"المنخل mm (0 = القاع)","Retained g":"المحجوز g",
"Search calculators…":"ابحث في الحاسبات…","Calculators":"الحاسبات","Built from":"مبنية على","Inputs":"المدخلات","Reset":"إعادة ضبط","Results":"النتائج","Copy":"نسخ","Copied":"تم النسخ","Select and copy manually":"حدّد النص وانسخه يدويًا","+ Add row":"+ إضافة صف","Remove row":"حذف الصف","Table":"الجدول","Notes":"ملاحظات","Example.":"مثال.","No calculator matches.":"لا توجد حاسبة مطابقة.","OK":"مقبول","Check":"راجع","Fail":"غير مقبول","Sources":"المصادر",
"Every calculator lists the BG sheets or code clauses it is based on. Values are for preliminary design; check against the governing code and manufacturer data.":"كل حاسبة تذكر أوراق BG أو بنود الكود التي بُنيت عليها. القيم للتصميم المبدئي؛ راجعها مع الكود المعتمد وبيانات المصنّعين.","Engineer's Calculator · Rev A · Inputs are remembered in this browser only.":"حاسبة المهندس · الإصدار A · تُحفظ المدخلات في هذا المتصفح فقط.","Benchmark Guides":"بنشمارك جايدز","Engineer's Calculator":"حاسبة المهندس",
"Total cooling load":"حمل التبريد الكلي","Cooling capacity":"سعة التبريد","Total":"الإجمالي","Sensible / latent":"محسوس / كامن","Sensible heat ratio":"نسبة الحرارة المحسوسة","Load density":"كثافة الحمل","Area per TR":"المساحة لكل طن تبريد","Load density is in the usual range for a quick estimate.":"كثافة الحمل ضمن المدى المعتاد للتقدير السريع.","Component":"البند","Rule":"القاعدة","Building fabric & solar":"غلاف المبنى والإشعاع الشمسي","{0} W per m³ of volume":"{0} W لكل m³ من الحجم","Fresh air & infiltration":"الهواء النقي والتسرب","{0} W per m³":"{0} W لكل m³","Lighting":"الإنارة","installed W × {0}":"القدرة المركبة × {0}","People — sensible":"الأشخاص — محسوس","People — latent":"الأشخاص — كامن","Equipment":"المعدات","Load density above {0} W/m². Check the inputs or use a full load calculation (HAP / ASHRAE RTS).":"كثافة الحمل أعلى من {0} W/m². راجع المدخلات أو استخدم حساب أحمال كامل (HAP / ASHRAE RTS).",
"Required airflow":"كمية الهواء المطلوبة","Room area":"مساحة الغرفة","Room volume":"حجم الغرفة","Zone outdoor air Voz":"الهواء الخارجي للمنطقة Voz","Zone outdoor air":"الهواء الخارجي للمنطقة","Occupants used":"الشاغلون المستخدمون","People component Rp·Pz":"جزء الأشخاص Rp·Pz","Area component Ra·Az":"جزء المساحة Ra·Az","Per person":"لكل شخص","Category":"الفئة","Default /{0} m²":"الافتراضي لكل {0} m²","Classroom (age {0}+)":"فصل دراسي ({0} سنوات فأكثر)",
"Round duct":"مجرى دائري","Rectangular duct":"مجرى مستطيل","Theoretical diameter":"القطر النظري","Velocity — round":"السرعة — دائري","Friction — round":"الاحتكاك — دائري","Velocity — rectangular":"السرعة — مستطيل","Friction — rectangular":"الاحتكاك — مستطيل","Equivalent diameter (rect.)":"القطر المكافئ (مستطيل)","Velocity pressure":"ضغط السرعة","Aspect ratio {0}:{1}.":"نسبة الأبعاد {0}:{1}.","Velocity within low-velocity range.":"السرعة ضمن نطاق السرعات المنخفضة.","Recommended / maximum velocities, m/s (BG-MEC-CS-{0})":"السرعات الموصى بها / القصوى، m/s (BG-MEC-CS-{0})","Element":"العنصر","Residence":"سكني","Public buildings":"مبانٍ عامة","Industrial":"صناعي","Outside air intakes":"مآخذ الهواء الخارجي","Filters":"الفلاتر","Heating coils":"ملفات التسخين","Fan outlets":"مخارج المراوح","Main ducts":"المجاري الرئيسية","Branch ducts":"المجاري الفرعية","Branch risers":"الصواعد الفرعية","Aspect ratio {0}:{1} is above {2}:{3}. Increase the depth.":"نسبة الأبعاد {0}:{1} أعلى من {2}:{3}. زِد العمق.","Velocity above {0} m/s: expect noise in occupied spaces.":"السرعة أعلى من {0} m/s: توقّع ضوضاء في الأماكن المشغولة.",
"CFM per TR (sensible)":"CFM لكل طن تبريد (محسوس)","ΔT is in the normal {0}–{1} K range or close to it.":"ΔT ضمن المدى المعتاد {0}–{1} K أو قريب منه.","Supply temperature must be below room temperature.":"يجب أن تكون حرارة التغذية أقل من حرارة الغرفة.","ΔT above {0} K risks draughts and condensation at diffusers.":"ΔT أعلى من {0} K يسبب تيارات هواء باردة وتكثفًا عند المخارج.",
"Total heat":"الحرارة الكلية","Sensible":"محسوس","Latent":"كامن","Condensate":"مياه التكثف","Total fan airflow":"كمية هواء المروحة الكلية","Q{0} — doors closed":"Q{0} — الأبواب مغلقة","Q{0} with allowance":"Q{0} مع الإضافة","Leakage area AE":"مساحة التسرب AE","Open door area":"مساحة الأبواب المفتوحة","Q{0} — doors open":"Q{0} — الأبواب مفتوحة",
"Water flow":"تدفق المياه","Selected pipe":"الماسورة المختارة","Friction":"الاحتكاك","Smallest size meeting both limits.":"أصغر مقاس يحقق الحدّين.","Size":"المقاس","Velocity m/s":"السرعة m/s","Friction Pa/m":"الاحتكاك Pa/m","Meets limits":"يحقق الحدود","none":"لا يوجد","No size in the list meets the limits. Raise the limits or split the flow.":"لا يوجد مقاس في القائمة يحقق الحدود. ارفع الحدود أو قسّم التدفق.",
"Pump head":"ضاغط المضخة","Hydraulic power":"القدرة الهيدروليكية","Shaft power":"قدرة العمود","Electrical input":"القدرة الكهربائية الداخلة","Motor rating (shaft + {0} %)":"قدرة المحرك (العمود + {0} %)","Static":"استاتيكي","Pipe + fittings":"المواسير + القطع",
"Diaphragm tank volume":"حجم خزان الغشاء","Expansion volume":"حجم التمدد","Acceptance factor":"معامل الاستيعاب","Plain (air-water) tank":"خزان عادي (هواء-ماء)","Water density at fill / max":"كثافة المياه عند التعبئة / الأقصى","Select the next larger standard tank with an acceptance volume ≥ {0} L.":"اختر الخزان القياسي الأكبر التالي بحجم استيعاب ≥ {0} L.","Max pressure must be above fill pressure.":"يجب أن يكون أقصى ضغط أعلى من ضغط التعبئة.",
"Motor rating":"قدرة المحرك","Air power":"قدرة الهواء","Specific fan power":"القدرة النوعية للمروحة","Intake airflow":"كمية هواء السحب","Heat removal air":"هواء طرد الحرارة","Intake louvre gross area":"المساحة الإجمالية لجلالة السحب","Exhaust air (excl. combustion)":"هواء الطرد (دون الاحتراق)",
"Total fixture units":"مجموع وحدات الأجهزة","Probable demand":"الطلب المحتمل","Demand curve":"منحنى الطلب","flush valve":"فلاش فالف","flush tank":"صندوق طرد","Main pipe size":"قطر الماسورة الرئيسية","No size meets the limits. Raise them or choose a larger pipe range.":"لا يوجد مقاس يحقق الحدود. ارفعها أو اختر نطاق مواسير أكبر.",
"Total drainage fixture units":"مجموع وحدات الصرف","Minimum pipe size":"أقل قطر للماسورة","Capacity of that size":"سعة هذا القطر","Size from IPC Table {0}.":"القطر من جدول IPC رقم {0}.","Max DFU":"أقصى DFU","Raised to {0}\" because water closets discharge into this pipe.":"رُفع إلى {0}\" لأن المراحيض تصب في هذه الماسورة.","Load exceeds the table. Split the system.":"الحمل يتجاوز الجدول. قسّم الشبكة.",
"Number of leaders":"عدد مواسير الأمطار","Area per leader (max)":"المساحة لكل ماسورة (الأقصى)","Total rain flow":"إجمالي تدفق الأمطار","Rainfall":"شدة المطر","Leader":"الماسورة","Max roof area m² at {0} mm/h":"أقصى مساحة سطح m² عند {0} mm/h",
"Head loss":"فقد الضاغط","Pressure loss":"فقد الضغط","Loss per {0} m":"الفقد لكل {0} m","Loss":"الفقد","Velocity within normal limits.":"السرعة ضمن الحدود المعتادة.","Velocity above {0} m/s.":"السرعة أعلى من {0} m/s.",
"Heater rating":"قدرة السخان","Storage tank volume":"حجم خزان التخزين","Possible max demand":"أقصى طلب ممكن","Usable storage":"التخزين المستفاد","Demand factor / storage factor":"معامل الطلب / معامل التخزين","gph each (Hotel)":"gph للوحدة (فندق)","gph each (Apartment)":"gph للوحدة (شقق سكنية)","gph each (Hospital)":"gph للوحدة (مستشفى)","gph each (Office)":"gph للوحدة (مكاتب)","gph each (School)":"gph للوحدة (مدرسة)","gph each (Gymnasium)":"gph للوحدة (صالة رياضية)","gph each (Private residence)":"gph للوحدة (سكن خاص)",
"Storage volume":"حجم التخزين","Daily demand":"الطلب اليومي","Plan area":"المساحة الأفقية","Square tank side":"ضلع الخزان المربع","Overall height":"الارتفاع الكلي","Average flow":"متوسط التدفق",
"Margin over NPSHr":"الهامش فوق NPSHr","Atmospheric head":"الضاغط الجوي","Vapour pressure head":"ضاغط ضغط البخار","Vapour pressure":"ضغط البخار","NPSHa exceeds NPSHr by at least the required margin.":"NPSHa يتجاوز NPSHr بالهامش المطلوب على الأقل.","NPSHa below NPSHr: the pump will cavitate.":"NPSHa أقل من NPSHr: ستحدث ظاهرة التكهف بالمضخة.","Margin below {0} m. Risk of cavitation at high flow.":"الهامش أقل من {0} m. خطر التكهف عند التدفق العالي.",
"Total demand (sprinklers + hose)":"الطلب الكلي (رشاشات + خراطيم)","Fire water storage":"تخزين مياه الحريق","Sprinkler demand":"طلب الرشاشات","Sprinklers in design area":"الرشاشات في مساحة التصميم","Flow per sprinkler":"التدفق لكل رشاش","Pressure at end sprinkler":"الضغط عند آخر رشاش","Density × area":"الكثافة × المساحة","Total demand":"الطلب الكلي","Density governs the sprinkler flow.":"الكثافة هي الحاكمة لتدفق الرشاش.","Area m²":"المساحة m²","Max cov. m²":"أقصى تغطية m²","Hose L/min":"الخراطيم L/min","Duration min":"المدة min","Ordinary hazard group {0}":"خطورة عادية مجموعة {0}","Extra hazard group {0}":"خطورة عالية مجموعة {0}","Flow set by the {0} bar ({1} psi) minimum pressure, not the density.":"التدفق تحكمه أقل ضغط {0} bar ({1} psi) وليس الكثافة.","Coverage capped at the hazard maximum of {0} m².":"تم تحديد التغطية بالحد الأقصى للخطورة {0} m².",
"Sprinklers":"الرشاشات","Layout":"التوزيع","Spacing along length":"التباعد على الطول","Spacing along width":"التباعد على العرض","Distance to wall":"البعد عن الحائط","Max spacing / coverage":"أقصى تباعد / تغطية","Wall distance is half the spacing and below the {0} m limit.":"البعد عن الحائط نصف التباعد وأقل من حد {0} m.",
"Agent quantity":"كمية الغاز","Protected volume":"الحجم المحمي","Specific vapour volume S":"الحجم النوعي للبخار S","Cylinders":"الأسطوانات","Concentration at or below NOAEL ({0} %).":"التركيز عند أو أقل من NOAEL ({0} %).","Concentration above NOAEL ({0} %). Not allowed in normally occupied spaces.":"التركيز أعلى من NOAEL ({0} %). غير مسموح في الأماكن المشغولة عادةً.",
"Design current Ib":"تيار التصميم Ib","Breaker rating In":"قيمة القاطع In","Apparent power":"القدرة الظاهرية","Reactive power":"القدرة غير الفعالة","Breaker In":"القاطع In","Derated capacity Iz":"السعة بعد التخفيض Iz","Voltage drop":"هبوط الجهد","Derating total":"إجمالي معاملات التخفيض","Iz ≥ In and voltage drop ≤ {0} %.":"Iz ≥ In وهبوط الجهد ≤ {0} %.","Size mm²":"المقطع mm²","Iz derated A":"Iz بعد التخفيض A","No single size up to {0} mm² works. Add a parallel run.":"لا يصلح أي مقطع منفرد حتى {0} mm². أضف كابلًا متوازيًا.",
"Fault at transformer LV":"القصر عند جهد المحول المنخفض","Fault at cable end":"القصر عند نهاية الكابل","Full-load current":"تيار الحمل الكامل","Transformer only (infinite source)":"المحول فقط (مصدر لانهائي)","Z source / transformer / cable":"Z المصدر / المحول / الكابل","Choose switchgear with a breaking capacity above {0} kA at the main board.":"اختر لوحات بسعة قطع أعلى من {0} kA عند اللوحة الرئيسية.",
"Capacitor bank":"بنك المكثفات","Standard bank":"البنك القياسي","Multiplier":"المعامل","kVA before / after":"kVA قبل / بعد","Current before / after":"التيار قبل / بعد","Current reduction":"انخفاض التيار",
"Luminaires (minimum)":"وحدات الإنارة (الحد الأدنى)","Suggested layout":"التوزيع المقترح","Average illuminance":"متوسط شدة الإضاءة","Room index K":"دليل الغرفة K","Spacing":"التباعد","Spacing-to-height ratio":"نسبة التباعد إلى الارتفاع","Lighting power density":"كثافة قدرة الإنارة","UF is a generic estimate (reflectances {0}/{1}/{2}). Use the manufacturer UF table for final design.":"معامل الاستفادة تقدير عام (انعكاسية {0}/{1}/{2}). استخدم جدول المصنّع للتصميم النهائي.","Spacing-to-height ratio within {0}.":"نسبة التباعد إلى الارتفاع ضمن {0}.","Spacing-to-height ratio above {0}: check uniformity.":"نسبة التباعد إلى الارتفاع أعلى من {0}: راجع انتظام الإضاءة.","Using your utilisation factor.":"يتم استخدام معامل الاستفادة الذي أدخلته.",
"Maximum demand":"أقصى طلب","Required rating":"القدرة المطلوبة","Loading at max demand":"التحميل عند أقصى طلب","Secondary full-load current":"تيار الحمل الكامل الثانوي",
"Conduit size":"قطر الماسورة","Cables":"الكابلات","Cable area":"مساحة الكابلات","Fill limit":"حد الإشغال","Required diameter":"القطر المطلوب","Actual fill":"الإشغال الفعلي","Conduit mm":"الماسورة mm","Max cable area mm² at {0} %":"أقصى مساحة كابلات mm² عند {0} %",
"Tray width":"عرض الحامل","Required width":"العرض المطلوب","Σ diameters":"مجموع الأقطار","Σ cable area":"مجموع مساحة الكابلات","Fill of chosen tray":"إشغال الحامل المختار",
"Combined resistance":"المقاومة المجمعة","Single rod":"قضيب واحد","Rods":"القضبان","Spacing ≥ rod length":"التباعد ≥ طول القضيب","yes":"نعم","no":"لا","Meets the {0} Ω target.":"يحقق الهدف {0} Ω.","Above the {0} Ω target. Add rods, lengthen them or treat the soil.":"أعلى من الهدف {0} Ω. أضف قضبانًا أو أطِلها أو عالج التربة.","Spacing less than rod length reduces the benefit of extra rods.":"التباعد الأقل من طول القضيب يقلل فائدة القضبان الإضافية.",
"Bars":"الأسياخ","Steel required As":"الحديد المطلوب As","Minimum steel":"الحد الأدنى للحديد","Steel provided":"الحديد المستخدم","Net tensile strain εt":"انفعال الشد الصافي εt","φMn provided":"φMn المتاح","Tension-controlled (εt ≥ {0}), φ = {1}.":"القطاع محكوم بالشد (εt ≥ {0})، φ = {1}.","φMn ≥ Mu.":"φMn ≥ Mu.","εt below {0}: not allowed for beams. Increase depth.":"εt أقل من {0}: غير مسموح للكمرات. زِد العمق.","φMn below Mu with the rounded bars.":"φMn أقل من Mu بعد تقريب الأسياخ.","section too small":"القطاع صغير","Moment exceeds the singly reinforced capacity. Increase depth or add compression steel.":"العزم يتجاوز سعة القطاع المسلح تسليحًا مفردًا. زِد العمق أو أضف حديد ضغط.","Transition zone: φ = {0}. Consider a deeper section.":"منطقة انتقالية: φ = {0}. يُفضّل قطاع أعمق.",
"Stirrups":"الكانات","Vs required":"Vs المطلوب","Spacing for strength":"التباعد للمقاومة","Spacing for Av,min":"التباعد لـ Av,min","Maximum spacing":"أقصى تباعد","Section size is adequate for shear.":"أبعاد القطاع كافية للقص.","not required":"غير مطلوبة","Vu ≤ ½φVc: no stirrups needed by calculation.":"Vu ≤ ½φVc: لا تلزم كانات حسابيًا.","Vs exceeds {0}√f′c b d. Enlarge the section.":"Vs يتجاوز {0}√f′c b d. كبّر القطاع.","Minimum stirrups govern (Vu ≤ φVc).":"الحد الأدنى للكانات هو الحاكم (Vu ≤ φVc).",
"Main bars":"الحديد الرئيسي","Thickness":"السمك","Minimum thickness (no deflection calc)":"الحد الأدنى للسمك (دون حساب الترخيم)","Factored load wu":"الحمل المصعّد wu","Mu per metre":"Mu لكل متر","As required":"As المطلوب","Shrinkage steel {0}bh":"حديد الانكماش {0}bh","Meets the ACI minimum thickness.":"يحقق الحد الأدنى للسمك في ACI.","increase thickness":"زِد السمك","Thinner than the ACI Table {0}.{1} minimum: check deflection.":"أقل من الحد الأدنى في جدول ACI {0}.{1}: راجع الترخيم.",
"Design capacity φPn,max":"السعة التصميمية φPn,max","Utilisation":"نسبة الاستغلال","Square size needed for Pu":"المقاس المربع اللازم لـ Pu","Capacity exceeds Pu.":"السعة أكبر من Pu.","Short column, axial load only. Check slenderness and moments separately.":"عمود قصير بحمل محوري فقط. راجع النحافة والعزوم بشكل منفصل.","Pu exceeds capacity.":"Pu يتجاوز السعة.","Steel ratio must be {0}–{1} %.":"يجب أن تكون نسبة التسليح {0}–{1} %.","Above {0} % steel makes lap splices congested.":"التسليح أعلى من {0} % يجعل وصلات التراكب مزدحمة.",
"Footing size":"مقاس القاعدة","Bars each way":"الأسياخ في كل اتجاه","Factored soil pressure":"جهد التربة المصعّد","Punching Vu / φVc":"الثاقب Vu / φVc","Beam shear Vu / φVc":"قص الكمرة Vu / φVc","Mu at column face":"Mu عند وجه العمود","As each way":"As في كل اتجاه","Service pressure {0} kPa ≤ {1} kPa.":"جهد التشغيل {0} kPa ≤ {1} kPa.","Bar spacing above {0} mm: use smaller bars.":"تباعد الأسياخ أكبر من {0} mm: استخدم أقطارًا أصغر.",
"Capacity φVc":"المقاومة φVc","Critical perimeter b{0}":"المحيط الحرج b{0}","Stress vc":"الإجهاد vc","Column aspect β":"نسبة أبعاد العمود β","Punching shear is adequate.":"القص الثاقب آمن.","Punching fails. Thicken the slab, add a drop panel or shear studs.":"القص الثاقب غير آمن. زِد سمك البلاطة أو أضف سقوطًا (drop panel) أو مسامير قص.",
"Development length ld":"طول التماسك ld","Lap splice (Class B, {0} ld)":"وصلة التراكب (فئة B، {0} ld)","Hooked bar ldh":"السيخ بخطاف ldh","ld ÷ db":"ld ÷ db",
"Maximum moment":"أقصى عزم","Maximum deflection":"أقصى ترخيم","Reaction A":"رد الفعل A","Reaction B":"رد الفعل B","Maximum shear":"أقصى قص","Moment located at":"موقع أقصى عزم","Deflection within L/{0}.":"الترخيم ضمن L/{0}.","Deflection exceeds L/{0}. Increase I.":"الترخيم يتجاوز L/{0}. زِد I.",
"Lightest section":"أخف قطاع","Mass":"الكتلة","Zx required":"Zx المطلوب","Ix required":"Ix المطلوب","φMn of selection":"φMn للقطاع المختار","Assumes a compact section with continuous lateral bracing (Lb ≤ Lp). Check shear and bracing.":"يفترض قطاعًا مدمجًا (compact) مع تقييد جانبي مستمر (Lb ≤ Lp). راجع القص والتقييد.","Section":"القطاع","none in list":"لا يوجد في القائمة",
"Velocity pressure qz":"ضغط السرعة qz","Net wall pressure (windward + leeward)":"صافي الضغط على الحوائط (مواجه + خلفي)","Windward wall (Cp {0})":"الحائط المواجه (Cp {0})","Leeward wall (Cp −{0})":"الحائط الخلفي (Cp −{0})","Internal pressure":"الضغط الداخلي","Leeward Cp −{0} assumes L/B ≤ {1} and qz is used for both faces. Use qh for the leeward and roof pressures in final design.":"قيمة Cp −{0} للحائط الخلفي تفترض L/B ≤ {1}، وتم استخدام qz للوجهين. استخدم qh للحائط الخلفي والسقف في التصميم النهائي.",
"Base shear V":"قص القاعدة V","Seismic coefficient Cs":"المعامل الزلزالي Cs","Approximate period Ta":"الزمن الدوري التقريبي Ta","Cs from SDS":"Cs من SDS","Cs upper limit (SD{0})":"الحد الأعلى لـ Cs (SD{0})","Cs minimum":"الحد الأدنى لـ Cs","Distribution exponent k":"أس التوزيع k","Period-dependent limit governs.":"الحد المعتمد على الزمن الدوري هو الحاكم.","Minimum Cs governs.":"الحد الأدنى لـ Cs هو الحاكم.","SDS plateau governs.":"منطقة SDS الثابتة هي الحاكمة.",
"FS overturning":"معامل الأمان ضد الانقلاب","FS sliding":"معامل الأمان ضد الانزلاق","Max bearing pressure":"أقصى جهد على التربة","Min bearing pressure":"أدنى جهد على التربة","Base width":"عرض القاعدة","Ka":"Ka","Active thrust":"الدفع الإيجابي","Vertical load":"الحمل الرأسي","Eccentricity":"اللامركزية","Overturning FS ≥ {0}.":"معامل الأمان ضد الانقلاب ≥ {0}.","Sliding FS ≥ {0}.":"معامل الأمان ضد الانزلاق ≥ {0}.","Bearing pressure within allowable.":"جهد التربة ضمن المسموح.","Sliding FS below {0}: add a shear key or widen the base.":"معامل الأمان ضد الانزلاق أقل من {0}: أضف سنًّا (shear key) أو وسّع القاعدة.","Bearing pressure exceeds allowable.":"جهد التربة يتجاوز المسموح.","Resultant outside the middle third: part of the base lifts.":"المحصلة خارج الثلث الأوسط: جزء من القاعدة يرتفع عن التربة.","Overturning FS below {0}: lengthen the heel.":"معامل الأمان ضد الانقلاب أقل من {0}: أطِل الكعب.",
"Total steel":"إجمالي الحديد","Net of wastage":"دون الهالك","Diameter":"القطر","Weight kg":"الوزن kg","incl. wastage":"شامل الهالك",
"Net allowable":"الصافي المسموح","Ultimate bearing qu":"قدرة التحمل القصوى qu","Allowable load":"الحمل المسموح","Overburden q":"ضغط الغطاء الترابي q",
"Primary settlement":"الهبوط الابتدائي","Time to {0} %":"الزمن حتى {0} %","Time":"الزمن","Time factor Tv":"معامل الزمن Tv","Drainage path":"مسار الصرف","Clay state":"حالة الطين","normally consolidated":"مدموج عاديًا","overconsolidated":"مفرط الدمج","years":"سنة","days":"يوم",
"Dry unit weight γd":"وزن وحدة الحجم الجاف γd","Void ratio e":"نسبة الفراغات e","Porosity n":"المسامية n","Degree of saturation S":"درجة التشبع S","Saturated unit weight":"وزن وحدة الحجم المشبع","Dry density":"الكثافة الجافة","Zero-air-voids γd at this w":"γd عند انعدام الفراغات الهوائية لهذا w","Inputs are consistent.":"المدخلات متسقة.","Saturation above {0} %: the inputs are inconsistent.":"التشبع أعلى من {0} %: المدخلات غير متسقة.",
"Full-bore flow":"التدفق بامتلاء كامل","Full-bore velocity":"السرعة بامتلاء كامل","Q ÷ Qfull":"Q ÷ Qfull","Hydraulic radius":"نصف القطر الهيدروليكي","Self-cleansing velocity achieved.":"تحققت سرعة التنظيف الذاتي.","Velocity below {0} m/s: not self-cleansing.":"السرعة أقل من {0} m/s: لا تحقق التنظيف الذاتي.","Velocity above {0} m/s: check scour.":"السرعة أعلى من {0} m/s: راجع النحر.",
"Area A":"المساحة A","Elastic modulus Sx":"معاير المقطع المرن Sx","Plastic modulus Zx":"معاير المقطع اللدن Zx","Shape factor Zx/Sx":"معامل الشكل Zx/Sx",
"Mean strength":"متوسط المقاومة","Characteristic (mean − {0} s)":"المقاومة المميزة (المتوسط − {0} s)","Standard deviation":"الانحراف المعياري","Lowest result":"أقل نتيجة","Lowest average of {0} consecutive":"أقل متوسط لـ {0} نتائج متتالية","Coefficient of variation":"معامل الاختلاف","Mean ≥ fck + {0} MPa.":"المتوسط ≥ fck + {0} MPa.","No individual result below {0} MPa.":"لا توجد نتيجة فردية أقل من {0} MPa.","Mean below fck + {0} MPa.":"المتوسط أقل من fck + {0} MPa.","An individual result is below {0} MPa. Investigate (cores).":"توجد نتيجة فردية أقل من {0} MPa. يلزم التحقيق (قلب خرساني).","Every average of {0} consecutive results ≥ f′c.":"كل متوسط لـ {0} نتائج متتالية ≥ f′c.","An average of {0} consecutive results is below f′c.":"يوجد متوسط لـ {0} نتائج متتالية أقل من f′c.",
"Cement":"الأسمنت","Sand":"الرمل","Coarse aggregate":"الركام الكبير","Water":"المياه","Cement per m³":"الأسمنت لكل m³","bags":"شكارة",
"Total mass":"الكتلة الكلية","Grading":"التدرج","poorly graded sand":"رمل رديء التدرج","well graded sand":"رمل جيد التدرج","poorly graded gravel":"زلط رديء التدرج","well graded gravel":"زلط جيد التدرج","Classification per USCS gradation limits.":"التصنيف وفق حدود التدرج في USCS.","Less than {0} % passes the finest sieve, so D{1} cannot be found.":"أقل من {0} % يمر من أنعم منخل، لذا لا يمكن إيجاد D{1}.","Sieve mm":"المنخل mm","Retained %":"المحجوز %","Passing %":"المار %","Pan":"القاع",
"Meets limits":"يحقق الحدود","ID mm":"القطر الداخلي mm","ft/100 ft":"ft/100 ft","Cu XLPE":"نحاس XLPE",
"Flow":"التدفق","Length":"الطول","Power & cooling":"القدرة والتبريد","pers":"شخص","Sheet":"الورقة","Discipline":"التخصص","Revision":"المراجعة","{0} °C DB":"{0} °C جاف","no.":"عدد","% of pipe":"% من المواسير","L/pers·day":"L/شخص·يوم","% of pipe ":"% من المواسير"
};

let LANG='ar';if(STANDALONE){try{LANG=localStorage.getItem('mepcalc.lang')||'ar'}catch(e){}}else{const f=(host.dataset.lang||'').toLowerCase();LANG=(f==='ar'||f==='en')?f:(/^ar/i.test(document.documentElement.lang||'')?'ar':'en')}
function tr(s){
  if(LANG!=='ar'||s===null||s===undefined) return s;
  s=String(s); if(AR[s]!==undefined) return AR[s];
  const nums=[]; const k=s.replace(/\d[\d,]*(?:\.\d+)?/g,m=>{nums.push(m);return '{'+(nums.length-1)+'}'});
  const t=AR[k]; return t===undefined?s:t.replace(/\{(\d+)\}/g,(_,i)=>nums[+i]);
}
const STATIC={appname:"Engineer's Calculator",by:'Benchmark Guides',navbtn:'Calculators',navnote:'Every calculator lists the BG sheets or code clauses it is based on. Values are for preliminary design; check against the governing code and manufacturer data.',foot:"Engineer's Calculator · Rev A · Inputs are remembered in this browser only."};
function applyLang(){
  app.lang=LANG; app.dir=LANG==='ar'?'rtl':'ltr'; if(STANDALONE){const r=document.documentElement; r.lang=LANG; r.dir=app.dir;}
  for(const k in STATIC){const el=root.getElementById(k); if(el) el.textContent=tr(STATIC[k]);}
  root.getElementById('mark').textContent=LANG==='ar'?'ح':'E';
  if(STANDALONE)document.title=tr("Engineer's Calculator");
  $('#q').placeholder=tr('Search calculators…'); $('#q').setAttribute('aria-label',tr('Search calculators…'));
  root.querySelectorAll('#langseg button').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.lang===LANG)));
}
/* ---------- render ---------- */
let cur=null;
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function navRender(q=''){
  q=q.trim().toLowerCase();
  $('#navlist').innerHTML=GROUPS.map(([g,name])=>{
    const items=C.filter(c=>c.g===g&&(!q||(c.t+' '+c.d+' '+tr(c.t)+' '+tr(c.d)+' '+c.code+' '+c.src.map(s=>s.join(' ')).join(' ')).toLowerCase().includes(q)));
    if(!items.length) return '';
    return `<div class="grp"><h2><i style="--disc:var(--k-disc-${GDISC[g]})"></i>${esc(tr(name))}<em>${items.length}</em></h2>${items.map(c=>`<a href="#${c.id}" data-id="${c.id}" aria-current="${cur&&cur.id===c.id}"><span>${esc(tr(c.t))}</span><code>${c.code}</code></a>`).join('')}</div>`;
  }).join('')||`<p class="navnote">${tr('No calculator matches.')}</p>`;
}
function optList(i,s){const o=typeof i.o==='function'?i.o(s):i.o;return o.map(x=>Array.isArray(x)?[String(x[0]),String(x[1])]:[String(x.v),String(x.t)])}
function isSeg(i){return i.type==='sel'&&typeof i.o!=='function'&&i.o.length<=3&&optList(i,{}).every(o=>o[1].length<=24)}
function selOpts(i,s){const o=typeof i.o==='function'?i.o(s):i.o;return o.map(x=>{const [val,t]=Array.isArray(x)?x:[x.v,x.t];return `<option value="${esc(val)}">${esc(tr(t))}</option>`}).join('')}
function open(id,push=true){
  const c=C.find(x=>x.id===id)||C[0];cur=c;const s=st(c);
  root.querySelectorAll('nav a').forEach(a=>a.setAttribute('aria-current',a.dataset.id===c.id));
  const grp=GROUPS.find(g=>g[0]===c.g)[1];
  let f='';
  c.inp.forEach(i=>{
    if(i.h){f+=`<div class="subhead">${esc(tr(i.h))}</div>`;return}
    const fid=`${c.id}-${i.id}`;
    if(i.type==='rows'){
      f+=`<div class="rows" id="${fid}"></div>`;return}
    const hint=i.hint?`<span class="hint">${esc(tr(i.hint))}</span>`:'';
    if(isSeg(i)){const o=optList(i,s);
      f+=`<div class="f${i.wide?' wide':''}"><span class="lab" id="${fid}-l">${esc(tr(i.l))}</span><div class="seg" role="radiogroup" aria-labelledby="${fid}-l" data-k="${i.id}">${o.map(([val,t])=>`<button type="button" role="radio" aria-checked="${String(s[i.id])===val}" data-val="${esc(val)}" title="${esc(tr(t))}">${esc(tr(t))}</button>`).join('')}</div>${hint}</div>`;return}
    const ctl=i.type==='sel'?`<select id="${fid}" data-k="${i.id}">${selOpts(i,s)}</select>`:`<input id="${fid}" data-k="${i.id}" type="number" step="any" inputmode="decimal">`;
    f+=`<div class="f${i.wide?' wide':''}"><label for="${fid}">${esc(tr(i.l))}</label><div class="ctl">${ctl}${i.u?`<span class="u">${esc(tr(i.u))}</span>`:''}</div>${hint}</div>`;
  });
  $('#sheet').innerHTML=`
   <header class="ph" style="--disc:var(--k-disc-${GDISC[c.g]})"><div class="ph-in"><div class="eyebrow"><span class="pill"><i></i>${c.code}</span>${esc(tr(grp))}</div><h2>${esc(tr(c.t))}</h2><p>${esc(tr(c.d))}</p></div>
    <div class="tblock"><div class="tbc"><span class="lbl">${tr('Sheet')}</span><b>${c.code}</b></div><div class="tbc"><span class="lbl">${tr('Discipline')}</span><b>${esc(tr(grp))}</b></div><div class="tbc"><span class="lbl">${tr('Revision')}</span><b>A</b></div>
     <div class="tbc wide"><span class="lbl">${tr(c.ref?'Based on':'Built from')}</span><div class="src">${c.src.map(([k,n])=>`<span class="chip" dir="ltr"><b>${k}</b><span>${esc(n)}</span></span>`).join('')}</div></div></div></header>
   <div class="body">
    <section class="card inputs" aria-label="${tr('Inputs')}"><div class="card-h"><h3 class="sec">${tr('Inputs')}</h3><button class="btn ghost" id="reset">${tr('Reset')}</button></div><div class="fields">${f}</div></section>
    <section class="card outputs" aria-label="${tr('Results')}" aria-live="polite"><div class="card-h"><h3 class="sec">${tr('Results')}</h3><span class="toast" id="toast"></span><button class="btn primary" id="copy">${tr('Copy')}</button></div><div id="out"></div></section>
   </div><div class="lower" id="lower"></div>`;
  c.inp.forEach(i=>{if(i.h||i.type==='rows'||isSeg(i))return;const el=root.getElementById(`${c.id}-${i.id}`);el.value=s[i.id];});
  c.inp.filter(i=>i.type==='rows').forEach(i=>rowsRender(c,i));
  const setK=(k,val)=>{s[k]=val;const i=c.inp.find(x=>x.id===k);if(i.onchange&&c[i.onchange]){c[i.onchange](s);open(c.id,false);return}compute()};
  $('#sheet').querySelectorAll('.fields .ctl select, .fields .ctl input').forEach(el=>el.addEventListener('input',()=>setK(el.dataset.k,el.value)));
  $('#sheet').querySelectorAll('.seg').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-checked',String(x===b)));setK(g.dataset.k,b.dataset.val)}));
  $('#reset').onclick=()=>{S[c.id]=defaults(c);persist();open(c.id,false)};
  $('#copy').onclick=copy;
  compute();
  if(push){try{history.replaceState(null,'','#'+c.id)}catch(e){} scrollToTop();}
  $('#nav').classList.remove('open');$('#navbtn').setAttribute('aria-expanded','false');
}
function rowsRender(c,i){
  const s=st(c),box=root.getElementById(`${c.id}-${i.id}`);
  box.innerHTML=`<table><thead><tr>${i.cols.map(k=>`<th>${esc(tr(k.l))}</th>`).join('')}<th></th></tr></thead><tbody>${s[i.id].map((r,ri)=>`<tr>${i.cols.map(k=>{
     const id=`${c.id}-${i.id}-${ri}-${k.id}`;
     return `<td>${k.type==='sel'?`<select id="${id}" data-r="${ri}" data-c="${k.id}" aria-label="${esc(tr(k.l))}">${selOpts(k,s)}</select>`:`<input id="${id}" data-r="${ri}" data-c="${k.id}" type="number" step="any" inputmode="decimal" aria-label="${esc(tr(k.l))}">`}</td>`}).join('')}
     <td><button class="x" data-del="${ri}" aria-label="${tr('Remove row')}">×</button></td></tr>`).join('')}</tbody></table>
     <button class="addrow">${tr('+ Add row')}</button>`;
  s[i.id].forEach((r,ri)=>i.cols.forEach(k=>{root.getElementById(`${c.id}-${i.id}-${ri}-${k.id}`).value=r[k.id]??''}));
  box.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',()=>{
    const r=s[i.id][+el.dataset.r],k=i.cols.find(x=>x.id===el.dataset.c);r[k.id]=el.value;
    if(k.set){k.set(r,s);rowsRender(c,i);} compute();}));
  box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{s[i.id].splice(+b.dataset.del,1);rowsRender(c,i);compute()});
  box.querySelector('.addrow').onclick=()=>{const r={};i.cols.forEach(k=>r[k.id]=k.type==='sel'?'0':(k.v??0));if(i.cols[0].set)i.cols[0].set(r,s);s[i.id].push(r);rowsRender(c,i);compute()};
}
let last=null;
function compute(){
  const c=cur,s=st(c);persist();
  let o;try{o=c.calc(num(c,s))}catch(e){o={res:[],chk:[{s:'bad',t:'Check the inputs: '+e.message}]}}
  last=o;
  const val=r=>typeof r.v==='string'?esc(tr(r.v)):fmt(r.v,r.d), keys=o.res.filter(r=>r.key), rest=o.res.filter(r=>!r.key);
  $('#out').innerHTML=`${keys.length?`<div class="hero">${keys.map(r=>`<div class="tile"><span class="tl">${esc(tr(r.l))}</span><span class="tv">${val(r)}${r.u?`<small>${esc(tr(r.u))}</small>`:''}</span></div>`).join('')}</div>`:''}
   ${o.chk&&o.chk.length?`<div class="checks">${o.chk.map(k=>`<div class="ck ${k.s==='ok'?'':k.s}"><span class="p" aria-label="${tr(k.s==='ok'?'OK':k.s==='warn'?'Check':'Fail')}">${k.s==='ok'?'✓':k.s==='warn'?'!':'×'}</span><span>${esc(tr(k.t))}</span></div>`).join('')}</div>`:''}
   ${rest.length?`<div class="list">${rest.map(r=>`<div class="r"><span class="l">${esc(tr(r.l))}</span><span class="v">${val(r)}${r.u?`<u>${esc(tr(r.u))}</u>`:''}</span></div>`).join('')}</div>`:''}
   ${c.ex?`<div class="example"><b>${tr('Example.')}</b> ${esc(tr(c.ex))}</div>`:''}`;
  let low='';
  if(o.tbl) low+=`<div><h3 class="sec">${esc(tr(o.tbl.cap||'Table'))}</h3><div class="tbl"><table><thead><tr>${o.tbl.head.map(h=>`<th>${esc(tr(h))}</th>`).join('')}</tr></thead><tbody>${o.tbl.rows.map(r=>`<tr class="${r.hl?'hl':''} ${r.dim?'dim':''}">${r.c.map(x=>`<td>${esc(tr(x))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  if(c.f) low+=`<div><h3 class="sec">${tr('Method')}</h3><div class="formula">${c.f.map(x=>`<div>${esc(x)}</div>`).join('')}</div></div>`;
  if(c.notes) low+=`<div><h3 class="sec">${tr('Notes')}</h3><ul class="notes">${c.notes.map(x=>`<li>${esc(tr(x))}</li>`).join('')}</ul></div>`;
  $('#lower').innerHTML=low;$('#lower').hidden=!low;
}
function copy(){
  const c=cur,s=st(c);
  const lines=[`${c.code} ${tr(c.t)}`,'',tr('Inputs')+':'];
  c.inp.forEach(i=>{if(i.h||i.type==='rows')return;const val=i.type==='sel'?((optList(i,s).find(o=>o[0]===String(s[i.id]))||[,''])[1]):s[i.id];lines.push(`  ${tr(i.l)}: ${tr(val)}${i.u&&i.type!=='sel'?' '+i.u:''}`)});
  c.inp.filter(i=>i.type==='rows').forEach(i=>s[i.id].forEach(r=>lines.push('  '+i.cols.map(k=>{if(k.type==='sel'){const o=(typeof k.o==='function'?k.o(s):k.o).find(x=>(Array.isArray(x)?x[0]:x.v)==r[k.id]);return o?(Array.isArray(o)?o[1]:o.t):''}return k.l+' '+r[k.id]}).join(' · '))));
  lines.push('',tr('Results')+':');last.res.forEach(r=>lines.push(`  ${tr(r.l)}: ${typeof r.v==='string'?tr(r.v):fmt(r.v,r.d)}${r.u?' '+tr(r.u):''}`));
  (last.chk||[]).forEach(k=>lines.push(`  [${k.s==='ok'?'OK':k.s==='warn'?'CHECK':'FAIL'}] ${tr(k.t)}`));
  lines.push('',tr('Sources')+': '+c.src.map(x=>x[0]).join(', '));
  const txt=lines.join('\n'),t=$('#toast');
  const fallback=()=>{const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');t.textContent=tr('Copied')}catch(e){t.textContent=tr('Select and copy manually')}ta.remove()};
  try{navigator.clipboard.writeText(txt).then(()=>t.textContent=tr('Copied'),fallback)}catch(e){fallback()}
  setTimeout(()=>t.textContent='',2200);
}

/* ---------- boot ---------- */
applyLang();
navRender();
$('#langseg').addEventListener('click',e=>{const b=e.target.closest('button[data-lang]');if(!b||b.dataset.lang===LANG)return;LANG=b.dataset.lang;try{localStorage.setItem('mepcalc.lang',LANG)}catch(err){}applyLang();navRender($('#q').value);open(cur.id,false)});
$('#q').addEventListener('input',e=>navRender(e.target.value));
$('#navlist').addEventListener('click',e=>{const a=e.target.closest('a[data-id]');if(!a)return;e.preventDefault();open(a.dataset.id)});
$('#navbtn').onclick=()=>{const o=$('#nav').classList.toggle('open');$('#navbtn').setAttribute('aria-expanded',o)};
let start=(location.hash||'').slice(1);
if(!C.find(c=>c.id===start)){try{start=localStorage.getItem(STORE+'.last')||''}catch(e){}}
open(C.find(c=>c.id===start)?start:'cooling-load',false);
const _open=open;open=function(id,p){_open(id,p);try{localStorage.setItem(STORE+'.last',cur.id)}catch(e){}};
host._bgc={C,GROUPS,num,defaults,optList,fmt,tr,open:(id,p)=>open(id,p),get cur(){return cur}};
}
class BGCalculator extends HTMLElement{connectedCallback(){if(!this.shadowRoot)mount(this)}}
if(!customElements.get('bg-calculator'))customElements.define('bg-calculator',BGCalculator);
})();
