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
const GDISC={HV:'mec',PL:'mec',FP:'mec',GS:'mec',MG:'mec',RF:'mec',EL:'ele',LC:'ele',SE:'enr',AR:'arc',SU:'enr',ST:'str',PF:'str',CV:'civ',SW:'hyd',WT:'hyd',IR:'hyd',RD:'civ',SV:'civ',MN:'min',QS:'prc',PM:'prc',GN:'gen',OP:'prc'};
const GROUPS=[['HV','HVAC'],['PL','Plumbing'],['FP','Fire protection'],['GS','Fuel gas'],['MG','Medical gases'],['RF','Refrigeration & steam'],['EL','Electrical'],['LC','ELV & low-current'],['SE','Solar & energy'],['AR','Architecture'],['SU','Sustainability'],['ST','Structural'],['PF','Pile foundations'],['CV','Civil & geotechnical'],['SW','Stormwater & hydrology'],['WT','Water & wastewater'],['IR','Irrigation'],['RD','Roads & transport'],['SV','Surveying'],['MN','Mining'],['QS','Quantity surveying'],['PM','Project management'],['OP','Site & quality control'],['GN','Fundamentals']];
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


/* ===== fuel gas ===== */
const GAS=[['ng','Natural gas'],['lpg','LPG (propane)']];
const GASP={ng:{s:0.6,cv:10.7},lpg:{s:1.52,cv:25.9}}; // relative density, gross CV kWh/m³
const GSTEEL=[['DN15',16.1],['DN20',21.6],['DN25',27.3],['DN32',36.0],['DN40',41.9],['DN50',53.1],['DN65',68.9],['DN80',80.9],['DN100',105.3],['DN150',155.4]];
const GAPP=[['Domestic cooker',10],['Domestic water heater',8],['Combi boiler',28],['Commercial range (6 burners)',36],['Commercial oven',15],['Fryer',20],['Bratt pan',18],['Grill / salamander',10],['Wok burner',25],['Boiler 100 kW',100],['Other',0]];
const LPG_KWH_KG=13.9;
const LPG_TANKS=[0.5,1,2,4,6.5,9,13,20,30,45,60,100];

def({id:'gas-pipe',g:'GS',code:'GS-01',t:'Gas pipe sizing',ref:1,
 d:'Low-pressure natural gas or LPG pipe size for a load and length, by the Pole formula.',
 src:[['IGEM/UP/2','Pipe sizing'],['BS 6891','Low-pressure installations']],
 inp:[{id:'gas',l:'Gas',type:'sel',o:GAS,v:'ng'},{id:'kw',l:'Gas load',u:'kW',v:120},{id:'L',l:'Pipe length',u:'m',v:40},
  {id:'fa',l:'Fittings allowance',u:'%',v:20},{id:'dp',l:'Allowed pressure drop',u:'mbar',v:1,hint:'Natural gas 1 mbar, LPG 2.5 mbar'}],
 calc(v){const P=GASP[v.gas],Q=v.kw/P.cv,Le=v.L*(1+v.fa/100),dreq=Math.pow(Q*Q*P.s*Le/(0.0072*0.0072*v.dp),0.2);
  const rows=GSTEEL.map(x=>{const d=x[1],cap=0.0072*Math.sqrt(v.dp*Math.pow(d,5)/(P.s*Le)),vel=Q/3600/(PI*d*d/4e6);return {n:x[0],d,cap,vel,ok:cap>=Q}});
  const sel=rows.findIndex(r=>r.ok),r=rows[sel];
  return {res:[{l:'Pipe size',v:r?r.n:'—',key:1},{l:'Gas flow',v:Q,u:'m³/h',key:1,d:2},{l:'Minimum bore',v:dreq,u:'mm',d:1},{l:'Capacity of the size chosen',v:r?r.cap:NaN,u:'m³/h',d:2},{l:'Velocity',v:r?r.vel:NaN,u:'m/s',d:2},{l:'Effective length',v:Le,u:'m',d:1}],
   chk:[r?{s:'ok',t:'Pressure drop within '+fmt(v.dp,1)+' mbar.'}:{s:'bad',t:'No size in the table is large enough. Shorten the run or allow a larger drop.'},
    r&&r.vel>6?{s:'warn',t:'Velocity over 6 m/s: expect noise.'}:{s:'ok',t:'Velocity is low.'}],
   tbl:{head:['Size','Bore mm','Capacity m³/h','Velocity m/s'],rows:rows.map((x,i)=>({hl:i===sel,dim:!x.ok,c:[x.n,fmt(x.d,1),fmt(x.cap,2),fmt(x.vel,2)]}))}};},
 f:['Q = load ÷ calorific value','Q = 0.0072 √( h d⁵ ÷ (s L) )   (Q m³/h, h mbar, d mm, L m)','s = 0.6 natural gas, 1.52 propane'],
 notes:['Bores are for medium-weight steel tube. Copper and polyethylene have different bores: check the size against its own table.','Keep the drop from the meter to the furthest appliance within the limit for the supply pressure.']});

def({id:'gas-load',g:'GS',code:'GS-02',t:'Gas appliance load',ref:1,
 d:'Connected and design gas load of a group of appliances, as natural gas flow and LPG mass flow.',
 src:[['IGEM/UP/2','Diversity'],['NFPA 54','Chapter 6']],
 inp:[{id:'rows',type:'rows',cols:[{id:'a',l:'Appliance',type:'sel',o:opt(GAPP.map(x=>x[0])),set:r=>{if(GAPP[+r.a][1])r.kw=GAPP[+r.a][1]}},{id:'q',l:'Qty',v:1},{id:'kw',l:'kW each',v:10}],
   v:[{a:'3',q:2,kw:36},{a:'4',q:2,kw:15},{a:'5',q:2,kw:20},{a:'7',q:1,kw:10}]},
  {id:'div',l:'Diversity factor',u:'%',v:100,hint:'Commercial kitchens 100 %; groups of dwellings much lower'}],
 calc(v){const rows=v.rows.map(x=>({n:(GAPP[+x.a]||GAPP[0])[0],q:+x.q||0,kw:+x.kw||0})),T=rows.reduce((s,x)=>s+x.q*x.kw,0),D=T*v.div/100;
  return {res:[{l:'Design load',v:D,u:'kW',key:1,d:1},{l:'Natural gas flow',v:D/GASP.ng.cv,u:'m³/h',key:1,d:2},{l:'LPG flow',v:D/LPG_KWH_KG,u:'kg/h',key:1,d:2},{l:'Connected load',v:T,u:'kW',d:1},{l:'LPG vapour flow',v:D/GASP.lpg.cv,u:'m³/h',d:2}],
   chk:[v.div<100?{s:'warn',t:'Diversity applied. Make sure it suits how the appliances are used together.'}:{s:'ok',t:'No diversity: all appliances at full rate.'}],
   tbl:{head:['Appliance','Qty','kW each','kW'],rows:rows.map(x=>[x.n,fmt(x.q,0),fmt(x.kw,1),fmt(x.q*x.kw,1)])}};},
 f:['Design load = Σ (qty × kW) × diversity','Natural gas m³/h = kW ÷ 10.7,   LPG kg/h = kW ÷ 13.9'],
 notes:['Ratings are gross heat input. Use the nameplate figure where you have it.']});

def({id:'lpg-tank',g:'GS',code:'GS-03',t:'LPG storage',ref:1,
 d:'LPG tank size for a load and days of storage, and the cylinders needed if a cylinder manifold is used instead.',
 src:[['NFPA 58','Storage'],['UKLPG CoP 1','Bulk tanks']],
 inp:[{id:'kw',l:'Design load',u:'kW',v:100},{id:'h',l:'Hours of use per day',u:'h',v:10},{id:'days',l:'Days of storage',u:'d',v:14},
  {id:'fill',l:'Maximum fill',u:'%',v:85},{h:'Cylinders'},{id:'cyl',l:'Cylinder size',u:'kg',v:45},{id:'off',l:'Off-take per cylinder',u:'kg/h',v:1,hint:'About 1 kg/h at 15 °C; less in cold weather'}],
 calc(v){const peak=v.kw/LPG_KWH_KG,day=peak*v.h,mass=day*v.days,wc=mass/0.51/(v.fill/100)/1000,t=nextStd(wc,LPG_TANKS),n=t?1:Math.ceil(wc/100),on=Math.ceil(peak/v.off);
  return {res:[{l:'Tank water capacity needed',v:wc,u:'m³',key:1,d:2},{l:'Standard tank',v:t?fmt(t,1)+' m³':n+' × 100 m³',key:1},{l:'LPG stored',v:mass,u:'kg',d:0},{l:'Daily use',v:day,u:'kg/d',d:0},{l:'Peak flow',v:peak,u:'kg/h',d:2},
   {l:'Cylinders on line',v:on,d:0},{l:'Cylinders for two banks',v:2*on,d:0},{l:'Cylinder changes per week',v:day*7/v.cyl,d:1}],
   chk:[on>10?{s:'warn',t:'More than 10 cylinders on line: a bulk tank is usually the better choice.'}:{s:'ok',t:'A cylinder manifold is practical for this load.'}]};},
 f:['Peak kg/h = kW ÷ 13.9','Storage kg = kg/h × hours × days','Water capacity = kg ÷ 0.51 kg/L ÷ fill limit'],
 notes:['Check separation distances to buildings, boundaries and openings for the tank size chosen.','A tank\'s natural vaporisation falls in cold weather. Large loads may need a vaporiser.']});

/* ===== medical gases ===== */
const MGAS=[['Oxygen',4.0,1.33,2.0e-5],['Medical air 4 bar',4.0,1.2,1.8e-5],['Surgical air 7 bar',7.0,1.2,1.8e-5],['Nitrous oxide',4.0,1.83,1.46e-5],['Vacuum',-0.6,1.2,1.8e-5]];
const MCU=[['12 × 0.6',10.8],['15 × 0.7',13.6],['22 × 0.9',20.2],['28 × 0.9',26.2],['35 × 1.2',32.6],['42 × 1.2',39.6],['54 × 1.2',51.6],['76.1 × 1.5',73.1],['108 × 1.5',105]];
const VIE=[1000,2000,3000,5000,10000,20000,30000];

def({id:'medgas-flow',g:'MG',code:'MG-01',t:'Medical gas design flow',ref:1,
 d:'Diversified design flow of each medical gas from the outlets in each department.',
 src:[['HTM 02-01','Part A, design flows'],['NFPA 99','Chapter 5']],
 inp:[{id:'rows',type:'rows',cols:[{id:'g',l:'Gas',type:'sel',o:opt(MGAS.map(x=>x[0]))},{id:'n',l:'Outlets',v:10},{id:'q',l:'L/min first outlet',v:10},{id:'d',l:'Diversity %',v:15}],
   v:[{g:'0',n:30,q:10,d:15},{g:'1',n:30,q:20,d:10},{g:'4',n:30,q:40,d:10},{g:'0',n:6,q:100,d:50}]}],
 calc(v){const by={};const rows=v.rows.map(x=>{const n=+x.n||0,Q=n>0?(+x.q)*(1+(n-1)*(+x.d)/100):0,g=(MGAS[+x.g]||MGAS[0])[0];by[g]=(by[g]||0)+Q;return {g,n,q:+x.q,d:+x.d,Q}});
  const res=Object.keys(by).map((g,i)=>({l:g,v:by[g],u:'L/min',key:i<3?1:0,d:0}));
  return {res:res.length?res:[{l:'Design flow',v:0,u:'L/min',key:1}],
   chk:[{s:'ok',t:'Each line: first outlet at full flow plus the others at the diversity given.'}],
   tbl:{head:['Gas','Outlets','L/min first outlet','Diversity %','Design L/min'],rows:rows.map(x=>[x.g,fmt(x.n,0),fmt(x.q,0),fmt(x.d,0),fmt(x.Q,0)])}};},
 f:['Q = q × [ 1 + (n − 1) × diversity ]','Add the departments on the same pipeline for the plant flow.'],
 notes:['Default flows and diversities are typical ward and theatre values. Use the department figures in HTM 02-01 or NFPA 99 for final design.']});

def({id:'medgas-pipe',g:'MG',code:'MG-02',t:'Medical gas pipe sizing',ref:1,
 d:'Copper pipe size for a medical gas or vacuum flow, from the pressure drop over the run.',
 src:[['HTM 02-01','Pipeline sizing'],['EN 13348','Copper tubes for medical gases']],
 inp:[{id:'g',l:'Gas',type:'sel',o:opt(MGAS.map(x=>x[0])),v:'0',wide:1},{id:'Q',l:'Design flow (free air)',u:'L/min',v:400},{id:'L',l:'Pipe length',u:'m',v:80},
  {id:'fa',l:'Fittings allowance',u:'%',v:30},{id:'dp',l:'Allowed pressure drop',u:'bar',v:0.2,hint:'4 bar: 0.2 bar; 7 bar: 0.35 bar; vacuum: 0.13 bar'}],
 calc(v){const G=MGAS[+v.g],Pa=(G[1]+1.01325),rho=G[2]*Pa/1.01325,Qa=v.Q/60000*1.01325/Pa,Le=v.L*(1+v.fa/100);
  const rows=MCU.map(x=>{const d=x[1]/1000,A=PI*d*d/4,vel=Qa/A,Re=rho*vel*d/G[3],f=Re<2300?64/Math.max(Re,1):0.25/Math.pow(Math.log10(1.5e-6/(3.7*d)+5.74/Math.pow(Re,0.9)),2),dp=f*Le/d*rho*vel*vel/2/1e5;return {n:x[0],id:x[1],vel,dp,ok:dp<=v.dp}});
  const sel=rows.findIndex(r=>r.ok),r=rows[sel];
  return {res:[{l:'Copper size (OD × wall)',v:r?r.n:'—',u:'mm',key:1},{l:'Pressure drop',v:r?r.dp:NaN,u:'bar',key:1,d:3},{l:'Velocity',v:r?r.vel:NaN,u:'m/s',d:1},{l:'Absolute pressure',v:Pa,u:'bar',d:2},{l:'Actual flow',v:Qa*1000,u:'L/s',d:2}],
   chk:[r?{s:'ok',t:'Drop within '+fmt(v.dp,2)+' bar.'}:{s:'bad',t:'No copper size in the table meets the drop. Split the load or allow a larger drop.'},
    r&&r.vel>15?{s:'warn',t:'Velocity over 15 m/s.'}:{s:'ok',t:'Velocity acceptable.'}],
   tbl:{head:['Size mm','Bore mm','Velocity m/s','Drop bar'],rows:rows.map((x,i)=>({hl:i===sel,dim:!x.ok,c:[x.n,fmt(x.id,1),fmt(x.vel,1),fmt(x.dp,3)]}))}};},
 f:['Actual flow = free-air flow × 1.013 ÷ absolute pressure','Δp = f (L ÷ d) ρ v² ÷ 2,   f from Swamee–Jain'],
 notes:['Vacuum is sized at 0.4 bar absolute; its flow is free air at atmospheric pressure.','Minimum size is usually 12 mm for terminal drops and 15 mm for branches.']});

def({id:'oxygen-store',g:'MG',code:'MG-03',t:'Oxygen storage',ref:1,
 d:'Liquid oxygen tank (VIE) size for days of storage, and the cylinders for the emergency reserve.',
 src:[['HTM 02-01','Supply systems'],['NFPA 99','§5.1.3.5']],
 inp:[{id:'Q',l:'Oxygen design flow',u:'L/min',v:900},{id:'u',l:'Average use as a share of design flow',u:'%',v:35},{id:'days',l:'Days of storage',u:'d',v:10},
  {id:'res',l:'Emergency reserve',u:'h',v:4},{id:'cyl',l:'Cylinder content',u:'L',v:6800,hint:'J size about 6,800 L'}],
 calc(v){const day=v.Q*v.u/100*1440,liq=day*v.days/861,t=nextStd(liq,VIE),n=Math.ceil(v.Q*v.u/100*60*v.res/v.cyl);
  return {res:[{l:'Liquid oxygen needed',v:liq,u:'L',key:1,d:0},{l:'Standard VIE tank',v:t?fmt(t,0)+' L':'> 30,000 L',key:1},{l:'Reserve cylinders',v:n,key:1,d:0},{l:'Average daily use',v:day/1000,u:'m³/d',d:1},{l:'Days from the tank chosen',v:t?t*861/day:NaN,u:'d',d:1}],
   chk:[{s:'ok',t:'Keep a secondary supply as well as the reserve, so one fault cannot stop oxygen.'}]};},
 f:['Daily use = design flow × average use × 1,440 min','Liquid = gas ÷ 861   (1 L liquid oxygen ≈ 861 L gas)','Reserve cylinders = flow × hours ÷ cylinder content'],
 notes:['Average use is usually 30–50 % of the design flow. Use the hospital\'s records where they exist.']});

/* ===== refrigeration and steam ===== */
const PROD=[['Beef / lamb',3.08,1.62,229,-2.2],['Poultry',3.32,1.77,247,-2.8],['Fish',3.6,1.88,260,-2.2],['Fruit',3.65,1.88,280,-1.5],['Vegetables',3.9,1.95,300,-0.8],['Milk and dairy',3.75,1.85,280,-0.6],['Bakery',2.9,1.42,110,-5]];
const STM=[ // bar abs, Ts °C, hf, hfg, hg kJ/kg, vg m³/kg
 [1,99.6,417,2258,2675,1.694],[2,120.2,505,2202,2706,0.8857],[3,133.5,561,2164,2725,0.6058],[4,143.6,605,2134,2738,0.4624],[5,151.8,640,2108,2748,0.3748],
 [6,158.8,670,2086,2756,0.3156],[7,165.0,697,2066,2762,0.2728],[8,170.4,721,2048,2768,0.2403],[10,179.9,763,2015,2777,0.1944],[12,188.0,798,1986,2784,0.1632],
 [14,195.0,830,1960,2789,0.1408],[16,201.4,859,1935,2793,0.1237],[18,207.1,885,1912,2796,0.1104],[21,214.9,920,1880,2799,0.0949]];
const stm=(pg,k)=>{const p=Math.min(21,Math.max(1,pg+1.01325));let i=1;while(i<STM.length-1&&STM[i][0]<p)i++;const a=STM[i-1],b=STM[i],t=(p-a[0])/(b[0]-a[0]);return a[k]+(b[k]-a[k])*t};
const SCH40=[['DN15',15.8],['DN20',20.9],['DN25',26.6],['DN32',35.1],['DN40',40.9],['DN50',52.5],['DN65',62.7],['DN80',77.9],['DN100',102.3],['DN125',128.2],['DN150',154.1],['DN200',202.7],['DN250',254.5],['DN300',303.2]];
const FUEL=[['Diesel',42.6,'kg/h'],['Natural gas',38.7,'m³/h'],['LPG',46.3,'kg/h']];

def({id:'cold-room',g:'RF',code:'RF-01',t:'Cold room load',ref:1,
 d:'Refrigeration load of a chiller or freezer room from its walls, product, air changes, people, lights and fans.',
 src:[['ASHRAE Refrigeration','Chapter 24'],['ASHRAE Refrigeration','Chapter 19']],
 inp:[{h:'Room'},{id:'L',l:'Length',u:'m',v:6},{id:'W',l:'Width',u:'m',v:4},{id:'H',l:'Height',u:'m',v:3},{id:'Tr',l:'Room temperature',u:'°C',v:2},{id:'Ta',l:'Surrounding temperature',u:'°C',v:35},
  {id:'U',l:'Panel U-value',u:'W/m²K',v:0.22,hint:'100 mm PIR about 0.22'},
  {h:'Product'},{id:'p',l:'Product',type:'sel',o:opt(PROD.map(x=>x[0])),v:'0'},{id:'m',l:'Product brought in per day',u:'kg/d',v:2000},{id:'Ti',l:'Entering temperature',u:'°C',v:20},
  {h:'Other loads'},{id:'np',l:'People working inside',u:'',v:2},{id:'hp',l:'Hours inside per day',u:'h',v:4},{id:'lt',l:'Lighting',u:'W/m²',v:10},{id:'fan',l:'Evaporator fans',u:'W',v:400},
  {id:'sf',l:'Safety factor',u:'%',v:10},{id:'run',l:'Compressor running time',u:'h/d',v:18,hint:'Chillers 16–18 h, freezers 18–20 h'}],
 calc(v){const P=PROD[+v.p],A=2*(v.L*v.W+v.L*v.H+v.W*v.H),V=v.L*v.W*v.H,dT=v.Ta-v.Tr;
  const qT=v.U*A*dT*24/1000,qP=(v.Tr>=P[4]?v.m*P[1]*Math.max(0,v.Ti-v.Tr):v.m*(P[1]*Math.max(0,v.Ti-P[4])+P[3]+P[2]*(P[4]-v.Tr)))/3600;
  const n=Math.max(3,70/Math.sqrt(Math.max(V,1))),qI=n*V*1.2*1.006*dT*1.5/3600,qPe=v.np*(272-6*v.Tr)*v.hp/1000,qL=v.lt*v.L*v.W*v.hp/1000,qF=v.fan*24/1000;
  const sum=qT+qP+qI+qPe+qL+qF,tot=sum*(1+v.sf/100),kW=tot/v.run;
  return {res:[{l:'Refrigeration capacity',v:kW,u:'kW',key:1,d:2},{l:'Daily load with safety factor',v:tot,u:'kWh/d',key:1,d:1},{l:'In tons of refrigeration',v:kW/3.517,u:'TR',d:2},{l:'Room volume',v:V,u:'m³',d:1},{l:'Air changes per day',v:n,d:1}],
   chk:[v.Tr<P[4]?{s:'ok',t:'Room is below the freezing point of the product: freezing load included.'}:{s:'ok',t:'Chilling only: the product does not freeze.'},
    dT>0?{s:'ok',t:'Temperature difference '+fmt(dT,0)+' K.'}:{s:'bad',t:'Room must be colder than its surroundings.'}],
   tbl:{head:['Load','kWh/d','Share %'],rows:[['Walls, roof and floor',qT],['Product',qP],['Air changes',qI],['People',qPe],['Lighting',qL],['Fans',qF]].map(x=>[x[0],fmt(x[1],1),fmt(sum?x[1]/sum*100:0,0)])}};},
 f:['Walls: U A ΔT × 24 h','Product: m [ c₁ (Tᵢ − T_f) + L + c₂ (T_f − T_r) ]','Air changes ≈ 70 ÷ √V per day','Capacity = daily load × (1 + SF) ÷ running hours'],
 notes:['Product data are typical. Use the supplier\'s figures for unusual products.','Freezers need defrost: allow for it in the running time.']});

def({id:'steam-pipe',g:'RF',code:'RF-02',t:'Steam pipe sizing',ref:1,
 d:'Steel pipe size for saturated steam by velocity, with the pressure drop per 100 m.',
 src:[['Spirax Sarco','Steam distribution'],['ASHRAE Fundamentals','Chapter 22']],
 inp:[{id:'m',l:'Steam flow',u:'kg/h',v:2000},{id:'p',l:'Steam pressure',u:'bar g',v:7},{id:'vl',l:'Velocity limit',u:'m/s',v:25,hint:'Mains 25–35 m/s, branches 15–25 m/s'}],
 calc(v){const vg=stm(v.p,5),Ts=stm(v.p,1),rho=1/vg,Qv=v.m/3600*vg;
  const rows=SCH40.map(x=>{const d=x[1]/1000,vel=Qv/(PI*d*d/4),Re=rho*vel*d/1.4e-5,f=0.25/Math.pow(Math.log10(4.5e-5/(3.7*d)+5.74/Math.pow(Re,0.9)),2),dp=f*100/d*rho*vel*vel/2/1e5;return {n:x[0],id:x[1],vel,dp,ok:vel<=v.vl}});
  const sel=rows.findIndex(r=>r.ok),r=rows[sel];
  return {res:[{l:'Pipe size',v:r?r.n:'—',key:1},{l:'Velocity',v:r?r.vel:NaN,u:'m/s',key:1,d:1},{l:'Pressure drop per 100 m',v:r?r.dp:NaN,u:'bar',d:3},{l:'Saturation temperature',v:Ts,u:'°C',d:1},{l:'Specific volume',v:vg,u:'m³/kg',d:4}],
   chk:[r?{s:'ok',t:'Velocity within '+fmt(v.vl,0)+' m/s.'}:{s:'bad',t:'Flow too large for the table.'},r&&r.dp>0.5?{s:'warn',t:'Drop over 0.5 bar per 100 m: check the pressure at the far end.'}:{s:'ok',t:'Pressure drop is moderate.'}],
   tbl:{head:['Size','Bore mm','Velocity m/s','Drop bar/100 m'],rows:rows.map((x,i)=>({hl:i===sel,dim:!x.ok,c:[x.n,fmt(x.id,1),fmt(x.vel,1),fmt(x.dp,3)]}))}};},
 f:['Volume flow = mass flow × specific volume','v = Q ÷ (π d² ÷ 4)','Δp = f (L ÷ d) ρ v² ÷ 2'],
 notes:['Bores are Schedule 40. Steam properties are interpolated from saturated steam tables.']});

def({id:'steam-boiler',g:'RF',code:'RF-03',t:'Steam boiler sizing',ref:1,
 d:'Steam flow, boiler rating and fuel use for a process or heating load.',
 src:[['Spirax Sarco','Steam boilers'],['BS EN 12953','Shell boilers']],
 inp:[{id:'kw',l:'Heat load',u:'kW',v:900},{id:'p',l:'Operating pressure',u:'bar g',v:8},{id:'tf',l:'Feedwater temperature',u:'°C',v:80},
  {id:'mg',l:'Losses and margin',u:'%',v:15},{id:'eta',l:'Boiler efficiency',u:'%',v:85},{id:'fu',l:'Fuel',type:'sel',o:opt(FUEL.map(x=>x[0])),v:'0'}],
 calc(v){const hfg=stm(v.p,3),hg=stm(v.p,4),m=v.kw*3600/hfg*(1+v.mg/100),out=m*(hg-4.19*v.tf)/3600,fa=m*(hg-4.19*v.tf)/2257,F=FUEL[+v.fu],fuel=out/(v.eta/100)*3.6/F[1];
  return {res:[{l:'Steam flow',v:m,u:'kg/h',key:1,d:0},{l:'Boiler output',v:out,u:'kW',key:1,d:0},{l:'From and at 100 °C',v:fa,u:'kg/h',d:0},{l:'Boiler horsepower',v:out/9.81,u:'BHP',d:0},{l:'Fuel use',v:fuel,u:F[2],key:1,d:1},{l:'Saturation temperature',v:stm(v.p,1),u:'°C',d:1}],
   chk:[v.tf<60?{s:'warn',t:'Feedwater below 60 °C raises oxygen corrosion: consider a hotter hotwell or a deaerator.'}:{s:'ok',t:'Feedwater temperature is reasonable.'}]};},
 f:['Steam kg/h = kW × 3,600 ÷ h_fg × (1 + margin)','Output = steam × (h_g − 4.19 T_feed) ÷ 3,600','F&A 100 °C = steam × (h_g − h_feed) ÷ 2,257','Fuel = output ÷ efficiency ÷ calorific value'],
 notes:['Calorific values: diesel 42.6 MJ/kg, natural gas 38.7 MJ/m³, LPG 46.3 MJ/kg.','Use two boilers where the load cannot stop for maintenance.']});

def({id:'flash-steam',g:'RF',code:'RF-04',t:'Flash steam',ref:1,
 d:'Flash steam released when condensate drops to a lower pressure, and the vent or flash line size.',
 src:[['Spirax Sarco','Flash steam'],['ASHRAE Systems','Chapter 11']],
 inp:[{id:'m',l:'Condensate flow',u:'kg/h',v:1500},{id:'p1',l:'Steam trap inlet pressure',u:'bar g',v:8},{id:'p2',l:'Receiver or flash vessel pressure',u:'bar g',v:0.5},{id:'vl',l:'Flash line velocity',u:'m/s',v:15}],
 calc(v){const h1=stm(v.p1,2),h2=stm(v.p2,2),fg2=stm(v.p2,3),x=Math.max(0,(h1-h2)/fg2),mf=v.m*x,Q=mf/3600*stm(v.p2,5),r=SCH40.find(s=>Q/(PI*Math.pow(s[1]/1000,2)/4)<=v.vl);
  return {res:[{l:'Flash steam',v:x*100,u:'%',key:1,d:1},{l:'Flash steam flow',v:mf,u:'kg/h',key:1,d:0},{l:'Condensate left',v:v.m-mf,u:'kg/h',d:0},{l:'Flash line size',v:r?r[0]:'—',key:1},{l:'Heat in the flash steam',v:mf*fg2/3600,u:'kW',d:1}],
   chk:[v.p2>=v.p1?{s:'bad',t:'Receiver pressure must be lower than the trap pressure.'}:{s:'ok',t:'Flash steam can be recovered for low-pressure heating.'}]};},
 f:['Flash fraction = (h_f1 − h_f2) ÷ h_fg2','Flash flow = condensate × fraction'],
 notes:['Size condensate return lines for the flash steam volume, not the water.']});

/* ===== ELV / low-current ===== */
const UPS_STD=[1,2,3,6,10,15,20,30,40,60,80,100,120,160,200,250,300,400,500,600,800];
const CAMRES=[['2 MP (1080p) H.265',2],['2 MP (1080p) H.264',4],['4 MP H.265',4],['4 MP H.264',6],['8 MP (4K) H.265',8],['8 MP (4K) H.264',12]];
const FA_BATT=[7,12,17,24,26,33,38,40,55,65,80,100];

def({id:'ups',g:'LC',code:'LC-01',t:'UPS and battery autonomy',ref:1,
 d:'UPS rating for a set of loads and the battery energy for the backup time.',
 src:[['IEC 62040-3','UPS performance'],['IEEE 1184','Battery sizing']],
 inp:[{id:'rows',type:'rows',cols:[{id:'q',l:'Qty',v:1},{id:'w',l:'W each',v:300}],v:[{q:20,w:250},{q:4,w:600},{q:2,w:1200}]},
  {id:'pf',l:'Load power factor',u:'',v:0.9},{id:'gr',l:'Future growth',u:'%',v:25},{id:'t',l:'Backup time',u:'min',v:15},{id:'eta',l:'Inverter efficiency',u:'%',v:94},
  {id:'vdc',l:'Battery string voltage',u:'V',v:384},{id:'age',l:'Ageing factor',u:'',v:1.25}],
 calc(v){const W=v.rows.reduce((s,x)=>s+(+x.q||0)*(+x.w||0),0),kW=W/1000*(1+v.gr/100),kVA=kW/v.pf,u=nextStd(kVA/0.8,UPS_STD),E=kW*v.t/60/(v.eta/100)*v.age,Ah=E*1000/v.vdc;
  return {res:[{l:'UPS rating',v:u?fmt(u,0)+' kVA':'> 800 kVA',key:1},{l:'Design load',v:kW,u:'kW',key:1,d:2},{l:'Battery energy',v:E,u:'kWh',key:1,d:2},{l:'Battery capacity',v:Ah,u:'Ah',d:0},{l:'Connected load',v:W/1000,u:'kW',d:2},{l:'Apparent power',v:kVA,u:'kVA',d:2}],
   chk:[{s:'ok',t:'UPS loaded to '+fmt(u?kVA/u*100:0,0)+' % at design load (sized for 80 % or less).'}]};},
 f:['kW = Σ W × (1 + growth),   kVA = kW ÷ pf','Battery kWh = kW × time ÷ efficiency × ageing'],
 notes:['Short backup times draw high currents: pick the battery from the maker\'s constant-power discharge table, not from Ah alone.']});

def({id:'cctv',g:'LC',code:'LC-02',t:'CCTV storage',ref:1,
 d:'Recorder storage and network bandwidth for a set of cameras and a retention period.',
 src:[['IEC 62676-4','Video surveillance'],['Manufacturer bit-rate data','']],
 inp:[{id:'rows',type:'rows',cols:[{id:'r',l:'Camera type',type:'sel',o:opt(CAMRES.map(x=>x[0])),set:r=>{r.mb=CAMRES[+r.r][1]}},{id:'n',l:'Cameras',v:10},{id:'mb',l:'Mbps each',v:4}],
   v:[{r:'2',n:24,mb:4},{r:'4',n:6,mb:8}]},
  {id:'h',l:'Recording hours per day',u:'h',v:24},{id:'mo',l:'Recording time with motion',u:'%',v:100,hint:'100 % for continuous recording'},{id:'days',l:'Retention',u:'d',v:30},{id:'raid',l:'RAID and spare overhead',u:'%',v:25}],
 calc(v){const rows=v.rows.map(x=>({t:(CAMRES[+x.r]||CAMRES[0])[0],n:+x.n||0,mb:+x.mb||0})),bw=rows.reduce((s,x)=>s+x.n*x.mb,0),TB=bw*3600*v.h*(v.mo/100)*v.days/8/1e6,raw=TB*(1+v.raid/100);
  return {res:[{l:'Storage needed',v:raw,u:'TB',key:1,d:1},{l:'Video data',v:TB,u:'TB',d:1},{l:'Total bandwidth',v:bw,u:'Mbps',key:1,d:0},{l:'Cameras',v:rows.reduce((s,x)=>s+x.n,0),d:0}],
   chk:[bw>700?{s:'warn',t:'Over 700 Mbps: split the recording across several recorders or a 10 Gb network.'}:{s:'ok',t:'Bandwidth fits a 1 Gb network.'}],
   tbl:{head:['Camera type','Cameras','Mbps each','TB'],rows:rows.map(x=>[x.t,fmt(x.n,0),fmt(x.mb,1),fmt(x.n*x.mb*3600*v.h*(v.mo/100)*v.days/8/1e6,1)])}};},
 f:['TB = Mbps × 3,600 × hours × motion share × days ÷ 8 ÷ 10⁶','Disk = video data × (1 + overhead)'],
 notes:['Bit rates vary with scene, frame rate and compression settings. Use the camera maker\'s calculator for final sizing.']});

def({id:'fa-battery',g:'LC',code:'LC-03',t:'Fire alarm battery',ref:1,
 d:'Standby battery capacity of a fire alarm panel for the standby and alarm periods.',
 src:[['NFPA 72','§10.6.7'],['BS 5839-1','§25.4']],
 inp:[{id:'is',l:'Standby current',u:'A',v:0.8},{id:'ia',l:'Alarm current',u:'A',v:3.5},
  {id:'ts',l:'Standby period',type:'sel',o:[['24','24 h'],['72','72 h']],v:'24'},{id:'ta',l:'Alarm period',type:'sel',o:[['5','5 min (NFPA 72)'],['15','15 min (voice)'],['30','30 min (BS 5839)']],v:'5'},
  {id:'df',l:'Derating factor',u:'',v:1.25}],
 calc(v){const Ah=(v.is*(+v.ts)+v.ia*(+v.ta)/60)*v.df,b=nextStd(Ah,FA_BATT);
  return {res:[{l:'Battery capacity',v:Ah,u:'Ah',key:1,d:1},{l:'Standard battery',v:b?b+' Ah':'> 100 Ah',key:1},{l:'Standby',v:v.is*(+v.ts),u:'Ah',d:1},{l:'Alarm',v:v.ia*(+v.ta)/60,u:'Ah',d:2}],
   chk:[b?{s:'ok',t:'Two 12 V batteries in series of this size give 24 V.'}:{s:'warn',t:'Over 100 Ah: use a separate power supply or split the load.'}]};},
 f:['Ah = [ I_standby × t_standby + I_alarm × t_alarm ] × derating'],
 notes:['Take device currents from the panel and device data sheets, for all loops and outputs.']});

def({id:'nac-drop',g:'LC',code:'LC-04',t:'Fire alarm circuit voltage drop',ref:1,
 d:'Voltage at the last sounder or strobe on a notification circuit, at the end-of-life battery voltage.',
 src:[['NFPA 72','§18.3'],['BS 5839-1','§26']],
 inp:[{id:'I',l:'Circuit alarm current',u:'A',v:1.2},{id:'L',l:'Circuit length (one way)',u:'m',v:150},
  {id:'A',l:'Cable size',type:'sel',o:[['1','1.0 mm²'],['1.5','1.5 mm²'],['2.5','2.5 mm²']],v:'1.5'},{id:'ld',l:'Load layout',type:'sel',o:[['1','At the end'],['0.5','Spread evenly']],v:'0.5'},
  {id:'V',l:'Supply voltage at end of battery life',u:'V',v:20.4},{id:'vmin',l:'Minimum device voltage',u:'V',v:16}],
 calc(v){const R=0.0175*2*v.L/(+v.A),dv=v.I*R*(+v.ld),ve=v.V-dv,Lmax=(v.V-v.vmin)/(v.I*(+v.ld)*0.0175*2/(+v.A));
  return {res:[{l:'Voltage at the last device',v:ve,u:'V',key:1,d:2},{l:'Voltage drop',v:dv,u:'V',key:1,d:2},{l:'Drop',v:dv/v.V*100,u:'%',d:1},{l:'Maximum length',v:Lmax,u:'m',d:0},{l:'Loop resistance',v:R,u:'Ω',d:2}],
   chk:[ve>=v.vmin?{s:'ok',t:'Last device gets at least '+fmt(v.vmin,0)+' V.'}:{s:'bad',t:'Voltage at the last device is too low. Use a larger cable or split the circuit.'}]};},
 f:['R = ρ × 2L ÷ A,   ρ = 0.0175 Ω·mm²/m','ΔV = I × R × layout factor (1 at the end, 0.5 spread evenly)'],
 notes:['Device minimum voltage is on its listing, often 16 V for 24 V devices.']});

def({id:'cabling',g:'LC',code:'LC-05',t:'Structured cabling quantities',ref:1,
 d:'Average cable run, number of 305 m boxes, patch panels and switch ports for a floor.',
 src:[['BICSI TDMM','Cable estimating'],['ISO/IEC 11801','Channel length']],
 inp:[{id:'n',l:'Data outlets',u:'',v:120},{id:'mn',l:'Shortest run',u:'m',v:15},{id:'mx',l:'Longest run',u:'m',v:75},{id:'sl',l:'Slack at both ends',u:'m',v:3},{id:'sp',l:'Spare switch ports',u:'%',v:20}],
 calc(v){const avg=(v.mn+v.mx)/2*1.1+v.sl,per=Math.floor(305/avg),box=per>0?Math.ceil(v.n/per):NaN;
  return {res:[{l:'305 m boxes',v:box,key:1,d:0},{l:'Average run',v:avg,u:'m',key:1,d:1},{l:'Runs per box',v:per,d:0},{l:'Total cable',v:v.n*avg,u:'m',d:0},{l:'24-port patch panels',v:Math.ceil(v.n/24),d:0},{l:'Switch ports',v:Math.ceil(v.n*(1+v.sp/100)),d:0}],
   chk:[v.mx+v.sl<=90?{s:'ok',t:'Longest permanent link within 90 m.'}:{s:'bad',t:'Longest run over 90 m: add a telecom room closer to the outlets.'}]};},
 f:['Average = (shortest + longest) ÷ 2 × 1.1 + slack','Runs per box = ⌊ 305 ÷ average ⌋'],
 notes:['Order whole boxes: offcuts shorter than a run are waste.']});

/* ===== solar and energy ===== */
const LFP=[['0.9','Lithium (LFP), 90 %'],['0.5','Lead-acid, 50 %']];
const EUSE=['Cooling','Lighting','Equipment and plug loads','Fans and pumps','Hot water','Other'];
const EUIB=[['Office',220],['Retail',300],['Hotel',300],['School',150],['Hospital',400],['Residential',150]];

def({id:'pv-grid',g:'SE',code:'SE-01',t:'Grid-tied PV system',ref:1,
 d:'PV array size, number of modules and roof area to offset a share of a building\'s annual energy use.',
 src:[['IEC 61724-1','Performance ratio'],['NREL PVWatts','Yield method']],
 inp:[{id:'E',l:'Annual energy use',u:'kWh/yr',v:120000},{id:'off',l:'Share to offset',u:'%',v:50},{id:'psh',l:'Peak sun hours',u:'h/d',v:6,hint:'Riyadh and Jeddah about 6'},{id:'pr',l:'Performance ratio',u:'',v:0.78},
  {id:'wp',l:'Module rating',u:'Wp',v:550},{id:'am',l:'Module area',u:'m²',v:2.58},{id:'sp',l:'Roof area per module area',u:'',v:1.6,hint:'Tilted rows need gaps to avoid shading'},{id:'roof',l:'Roof area available',u:'m²',v:600}],
 calc(v){const kWp=v.E*v.off/100/(v.psh*365*v.pr),n=Math.ceil(kWp*1000/v.wp),nmax=Math.floor(v.roof/(v.am*v.sp)),nf=Math.min(n,nmax),kf=nf*v.wp/1000,y=kf*v.psh*365*v.pr;
  return {res:[{l:'Array size',v:kf,u:'kWp',key:1,d:1},{l:'Modules',v:nf,key:1,d:0},{l:'Annual yield',v:y,u:'kWh/yr',key:1,d:0},{l:'Share of use offset',v:y/v.E*100,u:'%',d:1},{l:'Roof area used',v:nf*v.am*v.sp,u:'m²',d:0},{l:'Inverter AC rating (DC/AC 1.2)',v:kf/1.2,u:'kW',d:1}],
   chk:[n>nmax?{s:'warn',t:'Roof too small for the target: '+fmt(nmax,0)+' modules fit.'}:{s:'ok',t:'Target fits on the roof.'}]};},
 f:['kWp = annual kWh × share ÷ (PSH × 365 × PR)','Modules = kWp ÷ module Wp','Yield = kWp × PSH × 365 × PR'],
 notes:['Dust is heavy in the Gulf: plan for regular cleaning or reduce the performance ratio.','Check the utility\'s rules on export and system size before design.']});

def({id:'pv-offgrid',g:'SE',code:'SE-02',t:'Off-grid battery and PV',ref:1,
 d:'Battery bank and PV array for an off-grid load with days of autonomy.',
 src:[['IEEE 1013','Lead-acid sizing'],['IEEE 1561','Off-grid PV']],
 inp:[{id:'E',l:'Daily energy use',u:'Wh/d',v:6000},{id:'days',l:'Days of autonomy',u:'d',v:2},{id:'dod',l:'Battery type and depth of discharge',type:'sel',o:LFP,v:'0.9',wide:1},
  {id:'V',l:'System voltage',type:'sel',o:[['12','12 V'],['24','24 V'],['48','48 V']],v:'48'},{id:'eta',l:'Inverter efficiency',u:'%',v:92},{id:'tf',l:'Temperature factor',u:'',v:1.1},
  {id:'psh',l:'Peak sun hours (worst month)',u:'h/d',v:5},{id:'pr',l:'System losses factor',u:'',v:0.7}],
 calc(v){const Ed=v.E/(v.eta/100),Eb=Ed*v.days/(+v.dod)*v.tf,Ah=Eb/(+v.V),Wp=Ed/(v.psh*v.pr),I=Wp/(+v.V)*1.25;
  return {res:[{l:'Battery capacity',v:Ah,u:'Ah',key:1,d:0},{l:'Battery energy',v:Eb/1000,u:'kWh',key:1,d:1},{l:'PV array',v:Wp,u:'Wp',key:1,d:0},{l:'Charge controller current',v:I,u:'A',d:0},{l:'Daily energy from the battery',v:Ed,u:'Wh',d:0}],
   chk:[+v.V<48&&v.E>3000?{s:'warn',t:'Over 3 kWh per day: a 48 V system keeps currents and cable sizes down.'}:{s:'ok',t:'System voltage suits the load.'}]};},
 f:['Battery Wh = daily Wh ÷ η × days ÷ DoD × temperature factor','PV Wp = daily Wh ÷ η ÷ (PSH × losses factor)','Controller A = Wp ÷ V × 1.25'],
 notes:['Lead-acid batteries last longer at 30–50 % depth of discharge; LFP tolerates 80–90 %.']});

def({id:'pv-string',g:'SE',code:'SE-03',t:'PV string sizing',ref:1,
 d:'Minimum and maximum modules per string for an inverter, corrected for the coldest and hottest cell temperatures.',
 src:[['IEC 62548','PV array design'],['NEC 690.7','Maximum voltage']],
 inp:[{h:'Module'},{id:'voc',l:'Open-circuit voltage Voc',u:'V',v:49.6},{id:'vmp',l:'Maximum-power voltage Vmp',u:'V',v:41.6},{id:'isc',l:'Short-circuit current Isc',u:'A',v:14},
  {id:'bv',l:'Voc temperature coefficient',u:'%/°C',v:-0.27},{id:'bp',l:'Vmp temperature coefficient',u:'%/°C',v:-0.35},
  {h:'Site'},{id:'tmin',l:'Lowest cell temperature',u:'°C',v:0},{id:'tmax',l:'Highest cell temperature',u:'°C',v:75},
  {h:'Inverter'},{id:'vmax',l:'Maximum DC voltage',u:'V',v:1100},{id:'m1',l:'MPPT range, low',u:'V',v:200},{id:'m2',l:'MPPT range, high',u:'V',v:1000},{id:'imax',l:'Maximum input current per MPPT',u:'A',v:26},
  {id:'n',l:'Modules per string chosen',u:'',v:20}],
 calc(v){const vocC=v.voc*(1+v.bv/100*(v.tmin-25)),vmpC=v.vmp*(1+v.bp/100*(v.tmin-25)),vmpH=v.vmp*(1+v.bp/100*(v.tmax-25));
  const nmax=Math.min(Math.floor(v.vmax/vocC),Math.floor(v.m2/vmpC)),nmin=Math.ceil(v.m1/vmpH),sp=Math.floor(v.imax/(v.isc*1.25));
  return {res:[{l:'Maximum modules per string',v:nmax,key:1,d:0},{l:'Minimum modules per string',v:nmin,key:1,d:0},{l:'Strings per MPPT',v:sp,key:1,d:0},
   {l:'String Voc when cold',v:v.n*vocC,u:'V',d:0},{l:'String Vmp when hot',v:v.n*vmpH,u:'V',d:0},{l:'String Vmp when cold',v:v.n*vmpC,u:'V',d:0}],
   chk:[v.n*vocC<=v.vmax?{s:'ok',t:'Cold open-circuit voltage within the inverter maximum.'}:{s:'bad',t:'Cold open-circuit voltage exceeds the inverter maximum.'},
    v.n*vmpH>=v.m1?{s:'ok',t:'Hot operating voltage stays above the MPPT minimum.'}:{s:'bad',t:'Hot operating voltage drops below the MPPT range.'},
    v.n*vmpC<=v.m2?{s:'ok',t:'Cold operating voltage within the MPPT range.'}:{s:'warn',t:'Cold operating voltage above the MPPT range.'}]};},
 f:['Voc,cold = Voc [ 1 + β (T_min − 25) ]','Vmp,hot = Vmp [ 1 + γ (T_max − 25) ]','N_max = ⌊ V_max ÷ Voc,cold ⌋,   N_min = ⌈ MPPT_min ÷ Vmp,hot ⌉'],
 notes:['Cell temperature in the Gulf summer often exceeds 70 °C. The lowest cell temperature is about the lowest ambient at dawn.']});

def({id:'pv-payback',g:'SE',code:'SE-04',t:'Solar payback',ref:1,
 d:'Simple payback, lifetime savings and cost of energy of a PV system.',
 src:[['IEC 61724-1','Energy yield'],['NREL','LCOE method']],
 inp:[{id:'kwp',l:'System size',u:'kWp',v:100},{id:'y',l:'Specific yield',u:'kWh/kWp·yr',v:1800},{id:'c',l:'Installed cost per kWp',u:'',v:3000},
  {id:'t',l:'Electricity tariff per kWh',u:'',v:0.32},{id:'om',l:'Operation and maintenance',u:'%/yr',v:1.5},{id:'deg',l:'Yearly degradation',u:'%',v:0.5},{id:'esc',l:'Tariff increase per year',u:'%',v:0},{id:'life',l:'System life',u:'yr',v:25}],
 calc(v){const cap=v.kwp*v.c,om=cap*v.om/100;let cum=-cap,pb=NaN,E=0,S=0;const rows=[];
  for(let k=1;k<=v.life;k++){const e=v.kwp*v.y*Math.pow(1-v.deg/100,k-1),s=e*v.t*Math.pow(1+v.esc/100,k-1)-om;E+=e;S+=s;const prev=cum;cum+=s;if(isNaN(pb)&&cum>=0)pb=k-1+(-prev)/s;if(k%5===0||k===1)rows.push([String(k),fmt(e,0),fmt(s,0),fmt(cum,0)])}
  return {res:[{l:'Simple payback',v:pb,u:'yr',key:1,d:1},{l:'Net savings over life',v:S-cap,key:1,d:0},{l:'Cost of energy',v:(cap+om*v.life)/E,u:'per kWh',key:1,d:3},{l:'Installed cost',v:cap,d:0},{l:'First-year energy',v:v.kwp*v.y,u:'kWh',d:0}],
   chk:[isNaN(pb)?{s:'bad',t:'The system does not pay back within its life.'}:pb<8?{s:'ok',t:'Pays back in under 8 years.'}:{s:'warn',t:'Payback over 8 years.'}],
   tbl:{head:['Year','kWh','Saving','Cumulative'],rows}};},
 f:['Saving = kWh × tariff − O&M','Payback when Σ savings = installed cost','Cost of energy = (capex + O&M × life) ÷ Σ kWh'],
 notes:['Money values are in any one currency. Discounting is not applied.']});

def({id:'eui',g:'SE',code:'SE-05',t:'Building energy use intensity',ref:1,
 d:'Annual energy use per square metre by end use, with carbon and cost, compared with a typical value for the building type.',
 src:[['ASHRAE 100','Energy benchmarks'],['ISO 52000-1','Energy performance']],
 inp:[{id:'ty',l:'Building type',type:'sel',o:opt(EUIB.map(x=>x[0])),v:'0'},{id:'A',l:'Gross floor area',u:'m²',v:5000},
  {id:'rows',type:'rows',cols:[{id:'u',l:'End use',type:'sel',o:opt(EUSE)},{id:'e',l:'kWh/yr',v:100000}],v:[{u:'0',e:620000},{u:'1',e:140000},{u:'2',e:180000},{u:'3',e:90000},{u:'4',e:20000}]},
  {id:'cf',l:'Grid emission factor',u:'kg/kWh',v:0.57},{id:'t',l:'Tariff per kWh',u:'',v:0.32}],
 calc(v){const T=v.rows.reduce((s,x)=>s+(+x.e||0),0),eui=T/v.A,B=EUIB[+v.ty][1];
  return {res:[{l:'Energy use intensity',v:eui,u:'kWh/m²·yr',key:1,d:0},{l:'Typical for the type',v:B,u:'kWh/m²·yr',d:0},{l:'Annual energy',v:T,u:'kWh/yr',d:0},{l:'Carbon',v:T*v.cf/1000,u:'t CO₂/yr',key:1,d:0},{l:'Energy cost',v:T*v.t,u:'per yr',d:0}],
   chk:[eui<=B?{s:'ok',t:'At or below the typical value for this building type.'}:{s:'warn',t:'Above the typical value: review cooling and lighting first.'}],
   tbl:{head:['End use','kWh/yr','kWh/m²·yr','Share %'],rows:v.rows.map(x=>[EUSE[+x.u]||EUSE[0],fmt(+x.e,0),fmt((+x.e)/v.A,1),fmt(T?(+x.e)/T*100:0,0)])}};},
 f:['EUI = annual kWh ÷ gross floor area','Carbon = kWh × grid factor'],
 notes:['Typical values are rough figures for hot-climate buildings. Compare with your own portfolio or local benchmarks.']});

/* ===== sustainability ===== */
const ECF=[ // material (unit), kg CO2e per unit, A1–A3 typical
 ['Concrete C30/37 (m³)',300],['Concrete C40/50 (m³)',360],['Concrete C30/37 with 30 % GGBS or fly ash (m³)',220],['Reinforcing steel (t)',1990],['Structural steel sections (t)',1550],
 ['Aluminium, typical recycled content (t)',6700],['Float glass (t)',1440],['Clay brick (t)',213],['Concrete block (t)',93],['Cement mortar (t)',150],['Gypsum board (t)',390],
 ['EPS insulation (t)',3290],['Mineral wool (t)',1280],['Ceramic tiles (t)',780],['Copper (t)',2710],['PVC pipe (t)',3100],['Aggregates (t)',5]];
const WFIX=[ // fixture, baseline flow, unit, uses per FTE female, male (with urinals), male (without), duration min
 ['WC','L/flush',6.0],['Urinal','L/flush',3.8],['Lavatory tap','L/min',1.9],['Kitchen sink','L/min',8.3],['Shower','L/min',9.5]];
const LEEDW=[[25,1],[30,2],[35,3],[40,4],[45,5],[50,6]];

def({id:'carbon',g:'SU',code:'SU-01',t:'Embodied carbon',ref:1,
 d:'Cradle-to-gate embodied carbon of the main materials, total and per square metre of floor area.',
 src:[['EN 15978','Life cycle stages A1–A3'],['ICE database v3','Typical factors']],
 inp:[{id:'rows',type:'rows',cols:[{id:'m',l:'Material',type:'sel',o:opt(ECF.map(x=>x[0])),set:r=>{r.f=ECF[+r.m][1]}},{id:'q',l:'Quantity',v:100},{id:'f',l:'kg CO₂e per unit',v:300}],
   v:[{m:'0',q:3200,f:300},{m:'3',q:420,f:1990},{m:'8',q:1800,f:93},{m:'6',q:60,f:1440},{m:'5',q:25,f:6700}]},
  {id:'A',l:'Gross floor area',u:'m²',v:10000},{id:'tg',l:'Target',u:'kg CO₂e/m²',v:500}],
 calc(v){const rows=v.rows.map(x=>({n:(ECF[+x.m]||ECF[0])[0],q:+x.q||0,f:+x.f||0})).map(x=>Object.assign(x,{e:x.q*x.f})),T=rows.reduce((s,x)=>s+x.e,0),pm=T/v.A;
  return {res:[{l:'Embodied carbon',v:T/1000,u:'t CO₂e',key:1,d:0},{l:'Per floor area',v:pm,u:'kg CO₂e/m²',key:1,d:0},{l:'Target',v:v.tg,u:'kg CO₂e/m²',d:0}],
   chk:[pm<=v.tg?{s:'ok',t:'Within the target.'}:{s:'warn',t:'Above the target. The largest items in the table give the biggest savings.'}],
   tbl:{head:['Material','Quantity','kg CO₂e per unit','t CO₂e','Share %'],rows:rows.map(x=>[x.n,fmt(x.q,0),fmt(x.f,0),fmt(x.e/1000,1),fmt(T?x.e/T*100:0,0)])}};},
 f:['Embodied carbon = Σ quantity × factor'],
 notes:['Factors are typical A1–A3 values. Use the product EPD where you have it.','Transport, construction, use and end of life (A4–C4) are not included.']});

def({id:'water-use',g:'SU',code:'SU-02',t:'Indoor water use reduction',ref:1,
 d:'Annual indoor water use of the design fixtures against the LEED baseline, with the points it earns.',
 src:[['LEED v4.1 BD+C','WE Indoor water use'],['Mostadam','Water efficiency']],
 inp:[{id:'n',l:'Full-time occupants',u:'',v:400},{id:'fp',l:'Women',u:'%',v:40},{id:'d',l:'Working days per year',u:'d',v:260},{id:'ur',l:'Urinals installed',type:'sel',o:[['1','Yes'],['0','No']],v:'1'},
  {h:'Design fixtures'},{id:'wc',l:'WC',u:'L/flush',v:4.8},{id:'u',l:'Urinal',u:'L/flush',v:0.5},{id:'lav',l:'Lavatory tap',u:'L/min',v:1.3},{id:'ks',l:'Kitchen sink',u:'L/min',v:5.7},{id:'sh',l:'Shower',u:'L/min',v:6.6}],
 calc(v){const F=v.n*v.fp/100,M=v.n-F,ur=v.ur==='1';
  const use=(wc,u,lav,ks,sh)=>{const a=wc*(F*3+M*(ur?1:3)),b=ur?u*M*2:0,c=lav*v.n*3*0.5,dd=ks*v.n*0.25,e=sh*v.n*0.1*5;return [a,b,c,dd,e]};
  const B=use(6,3.8,1.9,8.3,9.5),D=use(v.wc,v.u,v.lav,v.ks,v.sh),sb=B.reduce((s,x)=>s+x,0),sd=D.reduce((s,x)=>s+x,0),red=(1-sd/sb)*100;
  let pts=0;LEEDW.forEach(x=>{if(red>=x[0])pts=x[1]});
  return {res:[{l:'Reduction',v:red,u:'%',key:1,d:1},{l:'LEED points',v:pts,key:1,d:0},{l:'Baseline use',v:sb*v.d/1000,u:'m³/yr',d:0},{l:'Design use',v:sd*v.d/1000,u:'m³/yr',d:0}],
   chk:[red>=20?{s:'ok',t:'Meets the 20 % prerequisite.'}:{s:'bad',t:'Below the 20 % prerequisite.'}],
   tbl:{head:['Fixture','Baseline L/d','Design L/d'],rows:WFIX.map((x,i)=>[x[0],fmt(B[i],0),fmt(D[i],0)])}};},
 f:['Daily use = flow × uses × occupants','Uses per day: WC women 3, men 1 with urinals (3 without), urinal men 2, lavatory 3 × 30 s, kitchen sink 15 s, shower 0.1 × 5 min','Reduction = 1 − design ÷ baseline'],
 notes:['Baseline: WC 6.0 L, urinal 3.8 L, public lavatory 1.9 L/min, kitchen sink 8.3 L/min, shower 9.5 L/min.']});

def({id:'recycled',g:'SU',code:'SU-03',t:'Recycled content',ref:1,
 d:'Recycled content value of the materials as a share of their total cost.',
 src:[['ISO 14021','Recycled content'],['LEED v4.1','MR credits']],
 inp:[{id:'rows',type:'rows',cols:[{id:'c',l:'Material cost',v:100000},{id:'po',l:'Post-consumer %',v:0},{id:'pr',l:'Pre-consumer %',v:0}],
   v:[{c:1800000,po:30,pr:60},{c:1200000,po:0,pr:20},{c:400000,po:40,pr:0},{c:900000,po:0,pr:0}]},{id:'tg',l:'Target',u:'%',v:20}],
 calc(v){const rows=v.rows.map(x=>{const c=+x.c||0,val=c*((+x.po||0)+0.5*(+x.pr||0))/100;return {c,po:+x.po,pr:+x.pr,val}}),T=rows.reduce((s,x)=>s+x.c,0),R=rows.reduce((s,x)=>s+x.val,0),p=T?R/T*100:0;
  return {res:[{l:'Recycled content',v:p,u:'%',key:1,d:1},{l:'Recycled content value',v:R,d:0},{l:'Total materials cost',v:T,d:0}],
   chk:[p>=v.tg?{s:'ok',t:'Meets the target.'}:{s:'warn',t:'Below the target.'}],
   tbl:{head:['Cost','Post-consumer %','Pre-consumer %','Value'],rows:rows.map(x=>[fmt(x.c,0),fmt(x.po,0),fmt(x.pr,0),fmt(x.val,0)])}};},
 f:['Value = cost × (post-consumer % + ½ pre-consumer %)','Share = Σ value ÷ Σ cost'],
 notes:['Use the recycled content stated by the manufacturer, by weight.']});

def({id:'rainwater',g:'SU',code:'SU-04',t:'Rainwater harvesting',ref:1,
 d:'Annual rainwater collected from a roof, the share of a non-potable demand it covers, and the tank for a design storm.',
 src:[['BS EN 16941-1','Rainwater systems'],['ASPE','Rainwater catchment']],
 inp:[{id:'A',l:'Roof area',u:'m²',v:2000},{id:'R',l:'Annual rainfall',u:'mm',v:100,hint:'Riyadh about 100 mm, Abha about 300 mm'},{id:'C',l:'Runoff coefficient',u:'',v:0.85},
  {id:'ls',l:'First flush and filter losses',u:'%',v:10},{id:'dem',l:'Non-potable demand',u:'L/d',v:5000},{id:'st',l:'Design storm',u:'mm',v:25}],
 calc(v){const Y=v.A*v.R/1000*v.C*(1-v.ls/100),D=v.dem*365/1000,tank=v.A*v.st/1000*v.C*(1-v.ls/100);
  return {res:[{l:'Annual yield',v:Y,u:'m³/yr',key:1,d:0},{l:'Share of demand met',v:Math.min(100,Y/D*100),u:'%',key:1,d:1},{l:'Tank for the design storm',v:tank,u:'m³',key:1,d:1},{l:'Annual demand',v:D,u:'m³/yr',d:0}],
   chk:[Y<D*0.1?{s:'warn',t:'Rain covers under 10 % of the demand. Condensate or grey water may be a better source.'}:{s:'ok',t:'Rainwater makes a useful contribution.'}]};},
 f:['Yield = area × rainfall × C × (1 − losses)','Tank = area × design storm × C × (1 − losses)'],
 notes:['In dry climates rain falls in a few storms: size the tank on a storm, not on the monthly average.','AC condensate is often a larger and steadier source in the Gulf.']});

/* ===== stormwater and hydrology ===== */
const RUNC=[['Roof',0.95],['Asphalt or concrete',0.9],['Interlocking paving',0.75],['Gravel',0.5],['Desert sand',0.3],['Lawn and planting',0.25]];
const KERBY=[['Smooth pavement',0.02],['Bare packed soil',0.1],['Poor grass or rough bare soil',0.2],['Average grass',0.4],['Dense grass',0.8]];

def({id:'rational',g:'SW',code:'SW-01',t:'Peak runoff (rational method)',ref:1,
 d:'Peak stormwater flow from a site with mixed surfaces for a design rainfall intensity.',
 src:[['ASCE MOP 77','Rational method'],['FHWA HEC-22','Chapter 3']],
 inp:[{id:'rows',type:'rows',cols:[{id:'s',l:'Surface',type:'sel',o:opt(RUNC.map(x=>x[0])),set:r=>{r.c=RUNC[+r.s][1]}},{id:'a',l:'Area m²',v:1000},{id:'c',l:'C',v:0.9}],
   v:[{s:'0',a:4000,c:0.95},{s:'1',a:6000,c:0.9},{s:'5',a:2500,c:0.25}]},
  {id:'i',l:'Rainfall intensity',u:'mm/h',v:60,hint:'From the local IDF curve for the time of concentration'}],
 calc(v){const rows=v.rows.map(x=>({n:(RUNC[+x.s]||RUNC[0])[0],a:+x.a||0,c:+x.c||0})),A=rows.reduce((s,x)=>s+x.a,0),CA=rows.reduce((s,x)=>s+x.a*x.c,0),Q=CA*v.i/3600;
  return {res:[{l:'Peak flow',v:Q,u:'L/s',key:1,d:1},{l:'Composite C',v:A?CA/A:0,key:1,d:2},{l:'Total area',v:A/10000,u:'ha',d:3},{l:'Peak flow',v:Q*3.6,u:'m³/h',d:0}],
   chk:[A>800000?{s:'warn',t:'Over 80 ha: the rational method is less reliable. Use a hydrograph method.'}:{s:'ok',t:'Site size suits the rational method.'}],
   tbl:{head:['Surface','Area m²','C','L/s'],rows:rows.map(x=>[x.n,fmt(x.a,0),fmt(x.c,2),fmt(x.a*x.c*v.i/3600,1)])}};},
 f:['Q (L/s) = C × i (mm/h) × A (m²) ÷ 3,600','Equivalent to Q = C i A ÷ 360 with A in ha and Q in m³/s'],
 notes:['Use the intensity for a storm lasting as long as the time of concentration (SW-02).']});

def({id:'tc',g:'SW',code:'SW-02',t:'Time of concentration',ref:1,
 d:'Time for runoff to travel from the furthest point of a catchment to the outlet: overland flow (Kerby) plus channel flow (Kirpich).',
 src:[['Kirpich (1940)','Channel flow'],['Kerby (1959)','Overland flow']],
 inp:[{h:'Overland flow'},{id:'L1',l:'Length',u:'m',v:80},{id:'S1',l:'Slope',u:'%',v:1},{id:'r',l:'Surface',type:'sel',o:opt(KERBY.map(x=>x[0])),v:'0'},
  {h:'Channel or pipe flow'},{id:'L2',l:'Length',u:'m',v:400},{id:'S2',l:'Slope',u:'%',v:0.5}],
 calc(v){const t1=v.L1>0?1.44*Math.pow(v.L1*KERBY[+v.r][1]/Math.sqrt(v.S1/100),0.467):0,t2=v.L2>0?0.0195*Math.pow(v.L2,0.77)*Math.pow(v.S2/100,-0.385):0,t=Math.max(5,t1+t2);
  return {res:[{l:'Time of concentration',v:t,u:'min',key:1,d:1},{l:'Overland flow',v:t1,u:'min',d:1},{l:'Channel flow',v:t2,u:'min',d:1}],
   chk:[t1+t2<5?{s:'warn',t:'Less than 5 minutes: 5 minutes is used as the minimum.'}:{s:'ok',t:'Use this duration to read the intensity from the IDF curve.'}]};},
 f:['Kerby: t = 1.44 (L r ÷ √S)^0.467   (L m, t min)','Kirpich: t = 0.0195 L^0.77 S^−0.385'],
 notes:['Kerby applies to overland flow up to about 365 m.']});

def({id:'detention',g:'SW',code:'SW-03',t:'Detention tank',ref:1,
 d:'Storage needed to limit a site\'s outflow, by the modified rational method over a range of storm durations.',
 src:[['ASCE MOP 77','Modified rational method'],['CIRIA C753','Storage']],
 inp:[{id:'A',l:'Catchment area',u:'m²',v:12500},{id:'C',l:'Composite C',u:'',v:0.8},{id:'Qo',l:'Allowed outflow',u:'L/s',v:50},
  {id:'rows',type:'rows',cols:[{id:'t',l:'Duration min',v:10},{id:'i',l:'Intensity mm/h',v:60}],v:[{t:5,i:120},{t:10,i:95},{t:15,i:80},{t:30,i:55},{t:60,i:35},{t:120,i:20}]}],
 calc(v){const rows=v.rows.map(x=>{const t=+x.t||0,i=+x.i||0,Qi=v.C*i*v.A/3600,V=Math.max(0,(Qi-v.Qo)*t*60/1000);return {t,i,Qi,V}});let k=0;rows.forEach((x,j)=>{if(x.V>rows[k].V)k=j});const M=rows[k]||{V:0,t:0};
  return {res:[{l:'Storage needed',v:M.V,u:'m³',key:1,d:1},{l:'Critical storm',v:M.t,u:'min',key:1,d:0},{l:'Peak inflow for that storm',v:M.Qi,u:'L/s',d:1}],
   chk:[k===rows.length-1&&rows.length>1?{s:'warn',t:'Largest storage is at the longest duration: add longer durations to the table.'}:{s:'ok',t:'Critical duration is inside the range given.'}],
   tbl:{head:['Duration min','Intensity mm/h','Inflow L/s','Storage m³'],rows:rows.map((x,j)=>({hl:j===k,c:[fmt(x.t,0),fmt(x.i,0),fmt(x.Qi,1),fmt(x.V,1)]}))}};},
 f:['Inflow = C i A','Storage = (inflow − allowed outflow) × duration','Design storage = the largest over all durations'],
 notes:['Default intensities are an example only. Enter the local IDF curve for the return period required.']});

def({id:'soakaway',g:'SW',code:'SW-04',t:'Soakaway',ref:1,
 d:'Check of a rectangular gravel-filled soakaway against a design storm, and its time to half empty.',
 src:[['BRE Digest 365','Soakaway design'],['CIRIA C753','Infiltration']],
 inp:[{id:'A',l:'Area drained',u:'m²',v:300},{id:'R',l:'Storm rainfall',u:'mm',v:25},{id:'D',l:'Storm duration',u:'min',v:60},
  {id:'L',l:'Pit length',u:'m',v:6},{id:'W',l:'Pit width',u:'m',v:3},{id:'H',l:'Effective depth',u:'m',v:2},{id:'n',l:'Fill void ratio',u:'',v:0.3},{id:'f',l:'Soil infiltration rate',u:'m/s',v:1e-5}],
 calc(v){const I=v.A*v.R/1000,a50=(2*(v.L+v.W))*v.H/2,O=a50*v.f*v.D*60,S=v.L*v.W*v.H*v.n,need=Math.max(0,I-O),t50=S*0.5/(a50*v.f)/3600;
  return {res:[{l:'Storage provided',v:S,u:'m³',key:1,d:2},{l:'Storage needed',v:need,u:'m³',key:1,d:2},{l:'Time to half empty',v:t50,u:'h',key:1,d:1},{l:'Inflow',v:I,u:'m³',d:2},{l:'Outflow during the storm',v:O,u:'m³',d:2}],
   chk:[S>=need?{s:'ok',t:'Soakaway holds the storm.'}:{s:'bad',t:'Soakaway too small for the storm.'},t50<=24?{s:'ok',t:'Half empties within 24 h.'}:{s:'bad',t:'Takes over 24 h to half empty.'}]};},
 f:['Inflow = area × rainfall','Outflow = a_s50 × f × duration,   a_s50 = side area to half depth','Storage = L W H × void ratio'],
 notes:['Measure the infiltration rate on site by the BRE 365 test. Repeat for several storm durations.']});

/* ===== water and wastewater ===== */
const GWF=[['6','With dishwasher'],['5','Without dishwasher'],['2','Single-service kitchen']];

def({id:'septic',g:'WT',code:'WT-01',t:'Septic tank',ref:1,
 d:'Septic tank capacity for the number of people served, with suggested internal dimensions.',
 src:[['BS 6297','§6.3'],['EN 12566-1','Septic tanks']],
 inp:[{id:'P',l:'People served',u:'',v:20},{id:'q',l:'Wastewater per person',u:'L/d',v:150},{id:'h',l:'Liquid depth',u:'m',v:1.5}],
 calc(v){const P=Math.max(4,v.P),C=180*P+2000,W=Math.sqrt(C/1000/v.h/3),L=3*W;
  return {res:[{l:'Capacity',v:C/1000,u:'m³',key:1,d:2},{l:'Internal length',v:L,u:'m',key:1,d:2},{l:'Internal width',v:W,u:'m',d:2},{l:'Retention time',v:C/(v.P*v.q),u:'d',d:1}],
   chk:[C/(v.P*v.q)>=1?{s:'ok',t:'At least one day of retention.'}:{s:'warn',t:'Under one day of retention at this flow.'}]};},
 f:['C = 180 P + 2,000 litres  (P ≥ 4)','Length = 3 × width'],
 notes:['Use two compartments, the first about two thirds of the length. Empty the sludge at least once a year.']});

def({id:'grease',g:'WT',code:'WT-02',t:'Grease interceptor',ref:1,
 d:'Grease interceptor volume for a commercial kitchen from meals served in the peak hour.',
 src:[['UPC','§1014.3'],['IPC','§1003.3']],
 inp:[{id:'m',l:'Meals in the peak hour',u:'',v:200},{id:'w',l:'Kitchen type',type:'sel',o:GWF,v:'6',wide:1},{id:'rt',l:'Retention time',u:'h',v:2.5,hint:'Commercial kitchen 2.5 h, single service 1.5 h'},
  {id:'sf',l:'Hours of operation',type:'sel',o:[['1','8 h'],['1.5','12 h'],['2','16 h'],['3','24 h']],v:'1.5'}],
 calc(v){const gal=v.m*(+v.w)*v.rt*(+v.sf),L=gal*3.785;
  return {res:[{l:'Interceptor volume',v:L,u:'L',key:1,d:0},{l:'In gallons',v:gal,u:'gal',d:0}],
   chk:[L<1000?{s:'warn',t:'Under 1,000 L: many authorities set this as the minimum for a kitchen.'}:{s:'ok',t:'Size meets the usual minimum.'}]};},
 f:['Volume (gal) = meals × waste flow × retention × storage factor','Waste flow: with dishwasher 6 gal, without 5, single service 2'],
 notes:['Check the local authority\'s rules: many set their own minimum size.']});

def({id:'wet-well',g:'WT',code:'WT-03',t:'Pumping station wet well',ref:1,
 d:'Wet well working volume to limit pump starts, the level band, and the pump power.',
 src:[['Hydraulic Institute','Pump intake design'],['EN 752','Pumping stations']],
 inp:[{id:'Q',l:'Pump flow (peak inflow)',u:'L/s',v:30},{id:'N',l:'Maximum starts per hour',u:'',v:10},{id:'D',l:'Wet well diameter',u:'m',v:2.5},
  {id:'H',l:'Total head',u:'m',v:18},{id:'eta',l:'Pump efficiency',u:'%',v:65}],
 calc(v){const V=0.9*v.Q/v.N,A=PI*v.D*v.D/4,kw=1000*G*v.Q/1000*v.H/(v.eta/100)/1000;
  return {res:[{l:'Working volume',v:V,u:'m³',key:1,d:2},{l:'Level band, start to stop',v:V/A,u:'m',key:1,d:2},{l:'Pump input power',v:kw,u:'kW',key:1,d:1},{l:'Minimum cycle time',v:60/v.N,u:'min',d:1}],
   chk:[V/A<0.5?{s:'warn',t:'Level band under 0.5 m: hard to control. Use a smaller well or alternate the pumps.'}:{s:'ok',t:'Level band is workable.'}]};},
 f:['V = Q × T ÷ 4,   T = 60 ÷ starts per hour','V (m³) = 0.9 × Q (L/s) ÷ starts','Power = ρ g Q H ÷ η'],
 notes:['Alternating two duty pumps halves the volume needed for the same starts per pump.']});

def({id:'clarifier',g:'WT',code:'WT-04',t:'Settling tank',ref:1,
 d:'Surface area, diameter and detention time of a circular settling tank from the surface overflow rate.',
 src:[['Metcalf & Eddy','Sedimentation'],['Ten States Standards','Clarifiers']],
 inp:[{id:'Q',l:'Average flow',u:'m³/d',v:3000},{id:'sor',l:'Surface overflow rate',u:'m³/m²·d',v:35,hint:'Primary 30–50, secondary 16–28'},{id:'h',l:'Side water depth',u:'m',v:3.5},
  {id:'n',l:'Number of tanks',u:'',v:2},{id:'wl',l:'Weir loading limit',u:'m³/m·d',v:125}],
 calc(v){const A=v.Q/v.sor/v.n,D=Math.sqrt(4*A/PI),Vt=A*v.h,hrt=Vt/(v.Q/v.n)*24,wl=v.Q/v.n/(PI*D);
  return {res:[{l:'Diameter of each tank',v:D,u:'m',key:1,d:1},{l:'Surface area of each tank',v:A,u:'m²',d:0},{l:'Detention time',v:hrt,u:'h',key:1,d:1},{l:'Weir loading',v:wl,u:'m³/m·d',d:0},{l:'Volume of each tank',v:Vt,u:'m³',d:0}],
   chk:[hrt>=1.5&&hrt<=4?{s:'ok',t:'Detention time within 1.5–4 h.'}:{s:'warn',t:'Detention time outside 1.5–4 h. Adjust the depth.'},wl<=v.wl?{s:'ok',t:'Weir loading within the limit.'}:{s:'warn',t:'Weir loading above the limit.'}]};},
 f:['A = Q ÷ SOR,   D = √(4A ÷ π)','Detention = A h ÷ Q','Weir loading = Q ÷ (π D)'],
 notes:['Check the peak flow against the peak overflow rate as well.']});

/* ===== irrigation ===== */
const KC=[['Turf grass',0.8,0.7],['Shrubs',0.5,0.9],['Trees',0.5,0.9],['Date palms',0.7,0.9],['Ground cover',0.5,0.9],['Desert planting',0.2,0.9]];

def({id:'irr-demand',g:'IR',code:'IR-01',t:'Landscape water demand',ref:1,
 d:'Peak-day irrigation water need from the reference evapotranspiration and the plant types.',
 src:[['FAO 56','Crop coefficients'],['WUCOLS','Landscape coefficients']],
 inp:[{id:'et',l:'Reference evapotranspiration',u:'mm/d',v:12,hint:'Riyadh summer about 11–13 mm/d'},
  {id:'rows',type:'rows',cols:[{id:'p',l:'Plant type',type:'sel',o:opt(KC.map(x=>x[0])),set:r=>{r.kc=KC[+r.p][1];r.e=KC[+r.p][2]*100}},{id:'a',l:'Area m²',v:500},{id:'kc',l:'Kc',v:0.5},{id:'e',l:'Efficiency %',v:90}],
   v:[{p:'0',a:2000,kc:0.8,e:70},{p:'1',a:1500,kc:0.5,e:90},{p:'3',a:800,kc:0.7,e:90}]}],
 calc(v){const rows=v.rows.map(x=>{const a=+x.a||0,kc=+x.kc||0,e=(+x.e||100)/100;return {n:(KC[+x.p]||KC[0])[0],a,kc,e,q:v.et*kc*a/e}}),T=rows.reduce((s,x)=>s+x.q,0);
  return {res:[{l:'Peak-day water',v:T/1000,u:'m³/d',key:1,d:1},{l:'Average depth',v:T/rows.reduce((s,x)=>s+x.a,0),u:'mm/d',d:1},{l:'Peak month',v:T*30/1000,u:'m³',d:0}],
   chk:[{s:'ok',t:'Turf uses the most water per square metre: limit it where possible.'}],
   tbl:{head:['Plant type','Area m²','Kc','Efficiency %','L/d'],rows:rows.map(x=>[x.n,fmt(x.a,0),fmt(x.kc,2),fmt(x.e*100,0),fmt(x.q,0)])}};},
 f:['L/d = ET₀ (mm/d) × Kc × area ÷ efficiency'],
 notes:['Spray irrigation is about 70 % efficient, drip about 90 %.']});

def({id:'drip',g:'IR',code:'IR-02',t:'Drip irrigation zones',ref:1,
 d:'Run time of a drip zone, its flow and how many zones the pump can serve in the watering window.',
 src:[['ASABE EP405','Drip design'],['FAO 56','Water need']],
 inp:[{id:'n',l:'Plants in the area',u:'',v:400},{id:'need',l:'Water per plant',u:'L/d',v:40},{id:'e',l:'Emitters per plant',u:'',v:4},{id:'q',l:'Emitter flow',u:'L/h',v:4},
  {id:'P',l:'Pump flow',u:'L/s',v:3},{id:'win',l:'Watering window',u:'h',v:8}],
 calc(v){const rt=v.need/(v.e*v.q)*60,zq=v.n*v.e*v.q/3600,zones=Math.ceil(zq/v.P),plantsPerZone=Math.floor(v.P*3600/(v.e*v.q)),total=zones*rt/60;
  return {res:[{l:'Run time',v:rt,u:'min',key:1,d:0},{l:'Zones needed',v:zones,key:1,d:0},{l:'Plants per zone',v:plantsPerZone,d:0},{l:'Total watering time',v:total,u:'h',key:1,d:1},{l:'Flow if all on at once',v:zq,u:'L/s',d:2}],
   chk:[total<=v.win?{s:'ok',t:'All zones fit in the watering window.'}:{s:'bad',t:'Zones do not fit in the window. Use a larger pump or more emitters.'}]};},
 f:['Run time = need ÷ (emitters × flow)','Plants per zone = pump flow ÷ (emitters × emitter flow)'],
 notes:['Water at night in summer to cut evaporation.']});

def({id:'irr-tank',g:'IR',code:'IR-03',t:'Irrigation tank and pump',ref:1,
 d:'Storage tank volume and pump motor for an irrigation demand.',
 src:[['FAO 56','Water need'],['Hydraulic Institute','Pump power']],
 inp:[{id:'Qd',l:'Daily demand',u:'m³/d',v:60},{id:'days',l:'Storage',u:'d',v:2},{id:'win',l:'Watering window',u:'h',v:8},{id:'H',l:'Total head',u:'m',v:45},{id:'eta',l:'Pump efficiency',u:'%',v:65}],
 calc(v){const V=v.Qd*v.days,Q=v.Qd/v.win/3.6,kw=1000*G*Q/1000*v.H/(v.eta/100)/1000,mot=nextStd(kw*1.15,[0.75,1.1,1.5,2.2,3,4,5.5,7.5,11,15,18.5,22,30,37,45,55,75]);
  return {res:[{l:'Tank volume',v:V,u:'m³',key:1,d:0},{l:'Pump flow',v:Q,u:'L/s',key:1,d:2},{l:'Pump input power',v:kw,u:'kW',d:2},{l:'Motor',v:mot?mot+' kW':'> 75 kW',key:1}],
   chk:[{s:'ok',t:'Allow for a dead volume below the suction and a freeboard above the top level.'}]};},
 f:['Tank = daily demand × days','Pump flow = daily demand ÷ window','Power = ρ g Q H ÷ η,   motor ≥ 1.15 × power'],
 notes:['Treated sewage effluent needs a filter and a separate, marked pipework system.']});

/* ===== roads and transport ===== */
const SIDEF=[[30,0.2],[40,0.18],[50,0.16],[60,0.15],[70,0.14],[80,0.14],[90,0.13],[100,0.12],[110,0.11],[120,0.09],[130,0.08]];
const sideF=V=>{if(V<=30)return 0.2;if(V>=130)return 0.08;for(let i=1;i<SIDEF.length;i++)if(V<=SIDEF[i][0]){const a=SIDEF[i-1],b=SIDEF[i];return a[1]+(b[1]-a[1])*(V-a[0])/(b[0]-a[0])}return 0.08};
const ssdOf=(V,t,a,g)=>0.278*V*t+V*V/(254*(a/9.81+g/100));
const ZR=[['50','50 %',0],['75','75 %',-0.674],['80','80 %',-0.841],['85','85 %',-1.037],['90','90 %',-1.282],['95','95 %',-1.645],['99','99 %',-2.327]];

def({id:'ssd',g:'RD',code:'RD-01',t:'Stopping sight distance',ref:1,
 d:'Distance a driver needs to see ahead to stop, for a design speed and grade.',
 src:[['AASHTO Green Book','§3.2.2'],['AASHTO Green Book','Table 3-2']],
 inp:[{id:'V',l:'Design speed',u:'km/h',v:80},{id:'t',l:'Brake reaction time',u:'s',v:2.5},{id:'a',l:'Deceleration',u:'m/s²',v:3.4},{id:'g',l:'Grade (+ up, − down)',u:'%',v:0}],
 calc(v){const d1=0.278*v.V*v.t,d2=v.V*v.V/(254*(v.a/9.81+v.g/100));
  return {res:[{l:'Stopping sight distance',v:d1+d2,u:'m',key:1,d:0},{l:'Reaction distance',v:d1,u:'m',d:1},{l:'Braking distance',v:d2,u:'m',d:1}],
   chk:[v.g<-3?{s:'warn',t:'Steep downgrade: braking distance grows quickly.'}:{s:'ok',t:'Provide this distance along the whole road, including curves and crests.'}]};},
 f:['SSD = 0.278 V t + V² ÷ [ 254 (a ÷ 9.81 ± G) ]'],
 notes:['On level roads AASHTO rounds up, for example 130 m at 80 km/h.']});

def({id:'h-curve',g:'RD',code:'RD-02',t:'Horizontal curve',ref:1,
 d:'Minimum radius for a design speed, and the setting-out elements of a circular curve.',
 src:[['AASHTO Green Book','§3.3'],['AASHTO Green Book','Table 3-7']],
 inp:[{id:'V',l:'Design speed',u:'km/h',v:80},{id:'e',l:'Maximum superelevation',u:'%',v:6},{id:'R',l:'Radius used',u:'m',v:300},{id:'D',l:'Deflection angle',u:'°',v:35}],
 calc(v){const f=sideF(v.V),Rmin=v.V*v.V/(127*(v.e/100+f)),th=v.D*PI/180,T=v.R*Math.tan(th/2),Lc=v.R*th,E=v.R*(1/Math.cos(th/2)-1),M=v.R*(1-Math.cos(th/2)),C=2*v.R*Math.sin(th/2),eReq=(v.V*v.V/(127*v.R)-f)*100;
  return {res:[{l:'Minimum radius',v:Rmin,u:'m',key:1,d:0},{l:'Curve length',v:Lc,u:'m',key:1,d:1},{l:'Tangent length',v:T,u:'m',d:2},{l:'External distance',v:E,u:'m',d:2},{l:'Middle ordinate',v:M,u:'m',d:2},{l:'Long chord',v:C,u:'m',d:2},{l:'Side friction factor',v:f,d:2}],
   chk:[v.R>=Rmin?{s:'ok',t:'Radius meets the minimum for the speed.'}:{s:'bad',t:'Radius below the minimum for the speed.'},eReq>v.e?{s:'bad',t:'Needs more superelevation than allowed.'}:{s:'ok',t:'Superelevation within the maximum.'}]};},
 f:['R_min = V² ÷ [ 127 (e + f) ]','T = R tan(Δ/2),   L = R Δ,   E = R [ sec(Δ/2) − 1 ],   M = R [ 1 − cos(Δ/2) ]'],
 notes:['Side friction factors are the AASHTO values for high-speed roads.']});

def({id:'v-curve',g:'RD',code:'RD-03',t:'Vertical curve',ref:1,
 d:'Minimum length of a crest or sag curve for stopping sight distance, and the high or low point of the curve used.',
 src:[['AASHTO Green Book','§3.4.6'],['AASHTO Green Book','Eq. 3-41 to 3-50']],
 inp:[{id:'g1',l:'Grade in',u:'%',v:3},{id:'g2',l:'Grade out',u:'%',v:-2},{id:'V',l:'Design speed',u:'km/h',v:80},{id:'L',l:'Curve length used',u:'m',v:250},
  {id:'ch',l:'PVI chainage',u:'m',v:1000},{id:'z',l:'PVI level',u:'m',v:100}],
 calc(v){const A=Math.abs(v.g2-v.g1),crest=v.g1>v.g2,S=ssdOf(v.V,2.5,3.4,0);let Lm;
  if(crest){Lm=A*S*S/658;if(Lm<S)Lm=Math.max(0,2*S-658/A)}else{Lm=A*S*S/(120+3.5*S);if(Lm<S)Lm=Math.max(0,2*S-(120+3.5*S)/A)}
  const bvc=v.ch-v.L/2,zb=v.z-v.g1/100*v.L/2,x=v.g1/(v.g1-v.g2)*v.L,inside=x>0&&x<v.L,zx=zb+v.g1/100*x+(v.g2-v.g1)/100/(2*v.L)*x*x;
  return {res:[{l:'Minimum length',v:Lm,u:'m',key:1,d:0},{l:'K value used',v:A?v.L/A:NaN,key:1,d:1},{l:'Stopping sight distance',v:S,u:'m',d:0},{l:crest?'High point chainage':'Low point chainage',v:inside?bvc+x:NaN,u:'m',d:2},{l:crest?'High point level':'Low point level',v:inside?zx:NaN,u:'m',d:3},{l:'Curve start chainage',v:bvc,u:'m',d:2},{l:'Curve start level',v:zb,u:'m',d:3}],
   chk:[v.L>=Lm?{s:'ok',t:'Length meets the sight distance.'}:{s:'bad',t:'Curve too short for the sight distance.'},{s:'ok',t:crest?'Crest curve.':'Sag curve (headlight sight distance).'}]};},
 f:['Crest, S < L: L = A S² ÷ 658','Sag, S < L: L = A S² ÷ (120 + 3.5 S)','x to high or low point = g₁ L ÷ (g₁ − g₂)'],
 notes:['SSD uses 2.5 s reaction and 3.4 m/s² on a level road.']});

def({id:'pavement',g:'RD',code:'RD-04',t:'Flexible pavement thickness',ref:1,
 d:'Structural number for the design traffic by the AASHTO 1993 method, and the asphalt thickness over the base and subbase given.',
 src:[['AASHTO 1993','Part II, Eq. 3.1'],['AASHTO 1993','Layer coefficients']],
 inp:[{id:'W',l:'Design traffic',u:'million ESAL',v:5},{id:'R',l:'Reliability',type:'sel',o:ZR.map(x=>[x[0],x[1]]),v:'90'},{id:'S0',l:'Standard deviation',u:'',v:0.45},
  {id:'dpsi',l:'Serviceability loss ΔPSI',u:'',v:1.9},{id:'Mr',l:'Subgrade resilient modulus',u:'MPa',v:60,hint:'Roughly 10 × CBR'},
  {h:'Layers'},{id:'a1',l:'Asphalt coefficient',u:'per inch',v:0.44},{id:'D2',l:'Base thickness',u:'mm',v:200},{id:'a2',l:'Base coefficient',u:'',v:0.14},
  {id:'D3',l:'Subbase thickness',u:'mm',v:150},{id:'a3',l:'Subbase coefficient',u:'',v:0.11},{id:'m',l:'Drainage coefficient',u:'',v:1}],
 calc(v){const z=(ZR.find(x=>x[0]===String(v.R))||ZR[4])[2],Mpsi=v.Mr*145.04,lw=Math.log10(v.W*1e6);
  const F=SN=>z*v.S0+9.36*Math.log10(SN+1)-0.2+Math.log10(v.dpsi/2.7)/(0.4+1094/Math.pow(SN+1,5.19))+2.32*Math.log10(Mpsi)-8.07-lw;
  const SN=F(0.1)>0?0.1:F(20)<0?NaN:bisect(F,0.1,20),D1=(SN-v.a2*v.D2/25.4*v.m-v.a3*v.D3/25.4*v.m)/v.a1*25.4;
  return {res:[{l:'Structural number',v:SN,key:1,d:2},{l:'Asphalt thickness',v:Math.max(D1,0),u:'mm',key:1,d:0},{l:'Contribution of base and subbase',v:(v.a2*v.D2+v.a3*v.D3)/25.4*v.m,d:2},{l:'Reliability factor ZR',v:z,d:3}],
   chk:[D1<50?{s:'warn',t:'Asphalt under 50 mm: use the practical minimum for the traffic (typically 50–100 mm).'}:{s:'ok',t:'Asphalt thickness found.'}]};},
 f:['log W₁₈ = Z_R S₀ + 9.36 log(SN+1) − 0.20 + log(ΔPSI ÷ 2.7) ÷ [0.40 + 1094 ÷ (SN+1)^5.19] + 2.32 log M_R − 8.07','SN = a₁ D₁ + a₂ D₂ m₂ + a₃ D₃ m₃   (D in inches)'],
 notes:['M_R is converted to psi inside the formula.','Check each layer also protects the layer below (layered design).']});

def({id:'esal',g:'RD',code:'RD-05',t:'Design traffic (ESAL)',ref:1,
 d:'Equivalent single axle loads over the design life from the daily truck traffic.',
 src:[['AASHTO 1993','Appendix D'],['AASHTO 1993','Traffic']],
 inp:[{id:'adt',l:'Average daily traffic',u:'veh/d',v:12000},{id:'tr',l:'Trucks',u:'%',v:15},{id:'tf',l:'Truck factor',u:'ESAL/truck',v:1.2},
  {id:'dd',l:'Directional split',u:'%',v:50},{id:'ld',l:'Design lane share',u:'%',v:80},{id:'g',l:'Annual growth',u:'%',v:3},{id:'n',l:'Design life',u:'yr',v:20}],
 calc(v){const GF=v.g>0?(Math.pow(1+v.g/100,v.n)-1)/(v.g/100):v.n,W=v.adt*v.tr/100*v.tf*365*GF*v.dd/100*v.ld/100;
  return {res:[{l:'Design ESAL',v:W/1e6,u:'million',key:1,d:2},{l:'Growth factor',v:GF,d:2},{l:'First-year ESAL',v:v.adt*v.tr/100*v.tf*365*v.dd/100*v.ld/100,d:0}],
   chk:[{s:'ok',t:'Use this as the design traffic in RD-04.'}]};},
 f:['ESAL = ADT × truck % × truck factor × 365 × growth factor × D × L','Growth factor = [ (1 + g)ⁿ − 1 ] ÷ g'],
 notes:['Lane share: 100 % for one lane each way, about 80–100 % for two lanes, 60–80 % for three.']});

/* ===== surveying ===== */
def({id:'coord-area',g:'SV',code:'SV-01',t:'Area from coordinates',ref:1,
 d:'Area and perimeter of a plot from the coordinates of its corners, by the shoelace formula.',
 src:[['Ghilani','Elementary Surveying, area by coordinates'],['RICS','Measured surveys']],
 inp:[{id:'rows',type:'rows',cols:[{id:'e',l:'Easting',v:0},{id:'n',l:'Northing',v:0}],v:[{e:1000,n:2000},{e:1040,n:2005},{e:1045,n:2060},{e:1002,n:2052}]}],
 calc(v){const p=v.rows.map(x=>[+x.e||0,+x.n||0]),k=p.length;let s=0,P=0;for(let i=0;i<k;i++){const a=p[i],b=p[(i+1)%k];s+=a[0]*b[1]-b[0]*a[1];P+=Math.hypot(b[0]-a[0],b[1]-a[1])}const A=Math.abs(s)/2;
  return {res:[{l:'Area',v:A,u:'m²',key:1,d:2},{l:'Area',v:A/10000,u:'ha',d:4},{l:'Perimeter',v:P,u:'m',key:1,d:2},{l:'Corners',v:k,d:0}],
   chk:[k<3?{s:'bad',t:'At least three corners are needed.'}:{s:'ok',t:'Enter the corners in order around the boundary.'}],
   tbl:{head:['Corner','Easting','Northing','Side to next m'],rows:p.map((a,i)=>{const b=p[(i+1)%k];return [String(i+1),fmt(a[0],3),fmt(a[1],3),fmt(Math.hypot(b[0]-a[0],b[1]-a[1]),3)]})}};},
 f:['A = ½ | Σ (Eᵢ Nᵢ₊₁ − Eᵢ₊₁ Nᵢ) |'],
 notes:['Coordinates must be on a plane grid such as UTM, in metres.']});

def({id:'traverse',g:'SV',code:'SV-02',t:'Traverse closure (Bowditch)',ref:1,
 d:'Misclosure and precision of a closed traverse, and corrected coordinates by the Bowditch rule.',
 src:[['Ghilani','Traverse computations'],['RICS','Control surveys']],
 inp:[{id:'e0',l:'Start easting',u:'m',v:1000},{id:'n0',l:'Start northing',u:'m',v:1000},
  {id:'rows',type:'rows',cols:[{id:'b',l:'Bearing °',v:0},{id:'d',l:'Distance m',v:100}],v:[{b:63.4369,d:111.807},{b:147.9936,d:94.334},{b:240.9469,d:102.959},{b:323.1281,d:100.005}]}],
 calc(v){const L=v.rows.map(x=>{const b=(+x.b||0)*PI/180,d=+x.d||0;return {b:+x.b,d,de:d*Math.sin(b),dn:d*Math.cos(b)}}),P=L.reduce((s,x)=>s+x.d,0),ce=L.reduce((s,x)=>s+x.de,0),cn=L.reduce((s,x)=>s+x.dn,0),m=Math.hypot(ce,cn);
  let E=v.e0,N=v.n0;const rows=L.map((x,i)=>{E+=x.de-ce*x.d/P;N+=x.dn-cn*x.d/P;return [String(i+1),fmt(x.b,4),fmt(x.d,3),fmt(E,3),fmt(N,3)]});
  return {res:[{l:'Linear misclosure',v:m,u:'m',key:1,d:3},{l:'Precision 1 in',v:m>0?P/m:Infinity,key:1,d:0},{l:'Misclosure in easting',v:ce,u:'m',d:3},{l:'Misclosure in northing',v:cn,u:'m',d:3},{l:'Perimeter',v:P,u:'m',d:2}],
   chk:[m>0&&P/m<5000?{s:'warn',t:'Precision worse than 1 in 5,000: check the field readings.'}:{s:'ok',t:'Precision acceptable for most engineering surveys.'}],
   tbl:{head:['Leg','Bearing °','Distance m','Corrected E','Corrected N'],rows}};},
 f:['ΔE = d sin θ,   ΔN = d cos θ','Correction to each leg = − misclosure × leg ÷ perimeter','Precision = perimeter ÷ linear misclosure'],
 notes:['Bearings are whole-circle bearings in decimal degrees, already corrected for angular misclosure.']});

def({id:'levelling',g:'SV',code:'SV-03',t:'Level book (rise and fall)',ref:1,
 d:'Reduced levels from backsight, intermediate and foresight readings, with the arithmetic check.',
 src:[['Uren & Price','Levelling'],['BS 7334','Surveying instruments']],
 inp:[{id:'rl',l:'Starting level (benchmark)',u:'m',v:100},
  {id:'rows',type:'rows',cols:[{id:'bs',l:'BS',v:0},{id:'is',l:'IS',v:0},{id:'fs',l:'FS',v:0}],v:[{bs:1.525,is:0,fs:0},{bs:0,is:2.105,fs:0},{bs:0,is:1.86,fs:0},{bs:1.42,is:0,fs:2.64},{bs:0,is:1.105,fs:0},{bs:0,is:0,fs:1.875}]}],
 calc(v){let prev=null,rl=v.rl,sb=0,sf=0,R=0,F=0;const rows=v.rows.map((x,i)=>{const bs=+x.bs||0,is=+x.is||0,fs=+x.fs||0;let rise='',fall='';
   const cur=fs||is;if(prev!==null&&cur){const d=prev-cur;if(d>=0){rise=fmt(d,3);R+=d}else{fall=fmt(-d,3);F-=d}rl+=d}
   sb+=bs;sf+=fs;prev=bs||cur||prev;return [String(i+1),bs?fmt(bs,3):'',is?fmt(is,3):'',fs?fmt(fs,3):'',rise,fall,fmt(rl,3)]});
  return {res:[{l:'Last reduced level',v:rl,u:'m',key:1,d:3},{l:'Σ BS − Σ FS',v:sb-sf,u:'m',d:3},{l:'Σ rise − Σ fall',v:R-F,u:'m',d:3},{l:'Last − first level',v:rl-v.rl,u:'m',d:3}],
   chk:[Math.abs((sb-sf)-(R-F))<0.0005&&Math.abs((sb-sf)-(rl-v.rl))<0.0005?{s:'ok',t:'Arithmetic check agrees.'}:{s:'bad',t:'Arithmetic check fails: a reading is missing or in the wrong column.'}],
   tbl:{head:['Point','BS','IS','FS','Rise','Fall','RL'],rows}};},
 f:['Rise or fall = previous reading − this reading','Check: Σ BS − Σ FS = Σ rise − Σ fall = last RL − first RL'],
 notes:['Leave a cell at 0 when there is no reading. A change point has both a FS and a BS on the same row.']});

def({id:'earthworks',g:'SV',code:'SV-04',t:'Cut and fill volumes',ref:1,
 d:'Cut and fill between cross-sections by the average end area method, with bulking of cut material.',
 src:[['Uren & Price','Earthwork volumes'],['AASHTO','Earthwork']],
 inp:[{id:'rows',type:'rows',cols:[{id:'ch',l:'Chainage m',v:0},{id:'c',l:'Cut m²',v:0},{id:'f',l:'Fill m²',v:0}],v:[{ch:0,c:12.5,f:0},{ch:20,c:8.4,f:1.2},{ch:40,c:3.1,f:4.8},{ch:60,c:0,f:9.6},{ch:80,c:0,f:12.2}]},
  {id:'bk',l:'Bulking factor of cut',u:'',v:1.25},{id:'sh',l:'Compaction factor of fill',u:'',v:0.9}],
 calc(v){let C=0,F=0;const r=v.rows,rows=[];for(let i=1;i<r.length;i++){const L=(+r[i].ch)-(+r[i-1].ch),c=L*((+r[i].c)+(+r[i-1].c))/2,f=L*((+r[i].f)+(+r[i-1].f))/2;C+=c;F+=f;rows.push([fmt(+r[i-1].ch,0)+'–'+fmt(+r[i].ch,0),fmt(c,1),fmt(f,1)])}
  const usable=C*v.sh,bal=usable-F;
  return {res:[{l:'Cut',v:C,u:'m³',key:1,d:0},{l:'Fill',v:F,u:'m³',key:1,d:0},{l:bal>=0?'Surplus (compacted)':'Import needed (compacted)',v:Math.abs(bal),u:'m³',key:1,d:0},{l:'Cut as loose volume for haulage',v:C*v.bk,u:'m³',d:0}],
   chk:[{s:bal>=0?'ok':'warn',t:bal>=0?'Cut is enough to make the fill.':'Not enough cut: material must be imported.'}],
   tbl:{head:['Between chainages','Cut m³','Fill m³'],rows}};},
 f:['V = L × (A₁ + A₂) ÷ 2','Balance = cut × compaction factor − fill'],
 notes:['The prismoidal formula gives slightly smaller volumes where areas change quickly.']});

/* ===== mining ===== */
const MGRADE=[['gt','g/t (gold, silver)'],['pct','% (copper, zinc, iron)']];

def({id:'blast',g:'MN',code:'MN-01',t:'Bench blast design',ref:1,
 d:'Burden, spacing, stemming, subdrill and powder factor of a bench blast from the hole diameter.',
 src:[['Konya & Walter','Surface blast design'],['ISEE Blasters\' Handbook','Bench blasting']],
 inp:[{id:'d',l:'Hole diameter',u:'mm',v:115},{id:'H',l:'Bench height',u:'m',v:10},{id:'re',l:'Explosive density',u:'g/cm³',v:0.85,hint:'ANFO 0.85, emulsion 1.15'},
  {id:'rr',l:'Rock density',u:'g/cm³',v:2.6},{id:'ks',l:'Spacing ÷ burden',u:'',v:1.15}],
 calc(v){const B=0.012*(2*v.re/v.rr+1.5)*v.d,S=v.ks*B,T=0.7*B,J=0.3*B,Lc=Math.max(0,v.H+J-T),q=PI*Math.pow(v.d/1000,2)/4*v.re*1000*Lc,Vh=B*S*v.H;
  return {res:[{l:'Burden',v:B,u:'m',key:1,d:2},{l:'Spacing',v:S,u:'m',key:1,d:2},{l:'Powder factor',v:q/Vh,u:'kg/m³',key:1,d:2},{l:'Stemming',v:T,u:'m',d:2},{l:'Subdrill',v:J,u:'m',d:2},{l:'Charge per hole',v:q,u:'kg',d:1},{l:'Rock volume per hole',v:Vh,u:'m³',d:0},{l:'Rock mass per hole',v:Vh*v.rr,u:'t',d:0}],
   chk:[v.H/B<2?{s:'warn',t:'Bench height under twice the burden: expect poor fragmentation. Use a smaller hole.'}:{s:'ok',t:'Bench height suits the burden.'}]};},
 f:['B = 0.012 (2 ρₑ ÷ ρᵣ + 1.5) D   (B m, D mm)','S = 1.15 B,   T = 0.7 B,   J = 0.3 B','Powder factor = charge ÷ (B S H)'],
 notes:['Adjust after trial blasts and keep within the site\'s vibration and flyrock limits.']});

def({id:'haul',g:'MN',code:'MN-02',t:'Haul truck fleet',ref:1,
 d:'Truck cycle time, trucks needed for a production target and the match with the loading unit.',
 src:[['Caterpillar Performance Handbook','Production estimating'],['SME Mining Engineering Handbook','Haulage']],
 inp:[{id:'P',l:'Production target',u:'t/h',v:1200},{id:'cap',l:'Truck payload',u:'t',v:90},{id:'lt',l:'Loading time',u:'min',v:3},{id:'dist',l:'Haul distance (one way)',u:'km',v:3},
  {id:'vl',l:'Loaded speed',u:'km/h',v:20},{id:'ve',l:'Empty speed',u:'km/h',v:35},{id:'dt',l:'Dump and spot time',u:'min',v:2},{id:'eff',l:'Working minutes per hour',u:'min',v:50}],
 calc(v){const cyc=v.lt+v.dist/v.vl*60+v.dist/v.ve*60+v.dt,pt=v.cap*v.eff/cyc,n=Math.ceil(v.P/pt),mf=n*v.lt/cyc;
  return {res:[{l:'Trucks needed',v:n,key:1,d:0},{l:'Cycle time',v:cyc,u:'min',key:1,d:1},{l:'Output per truck',v:pt,u:'t/h',d:0},{l:'Fleet output',v:n*pt,u:'t/h',d:0},{l:'Match factor',v:mf,key:1,d:2}],
   chk:[mf<0.9?{s:'warn',t:'Match factor under 0.9: the loader waits for trucks.'}:mf>1.1?{s:'warn',t:'Match factor over 1.1: trucks queue at the loader.'}:{s:'ok',t:'Trucks and loader are well matched.'}]};},
 f:['Cycle = load + haul + return + dump','Trucks = target ÷ (payload × working min ÷ cycle)','Match factor = trucks × load time ÷ cycle'],
 notes:['Speeds should come from rimpull curves for the grade and rolling resistance of the haul road.']});

def({id:'mine-vent',g:'MN',code:'MN-03',t:'Underground mine ventilation',ref:1,
 d:'Airflow needed for diesel equipment and people, airway velocity, Atkinson pressure loss and fan power.',
 src:[['McPherson','Subsurface Ventilation Engineering'],['MSHA / provincial rules','Diesel dilution']],
 inp:[{id:'kw',l:'Diesel engine power in use',u:'kW',v:800},{id:'qk',l:'Air per kW of diesel',u:'m³/s per kW',v:0.06},{id:'np',l:'People underground',u:'',v:40},{id:'qp',l:'Air per person',u:'m³/s',v:0.1},
  {h:'Airway'},{id:'A',l:'Cross-section area',u:'m²',v:25},{id:'Pm',l:'Perimeter',u:'m',v:20},{id:'L',l:'Length',u:'m',v:2500},{id:'k',l:'Friction factor',u:'kg/m³',v:0.012,hint:'Smooth lined 0.004, rough rock 0.012–0.015'},{id:'eta',l:'Fan efficiency',u:'%',v:70}],
 calc(v){const Q=Math.max(v.kw*v.qk,0)+v.np*v.qp,vel=Q/v.A,R=v.k*v.Pm*v.L/Math.pow(v.A,3),p=R*Q*Q,P=p*Q/(v.eta/100)/1000;
  return {res:[{l:'Airflow needed',v:Q,u:'m³/s',key:1,d:1},{l:'Airway velocity',v:vel,u:'m/s',key:1,d:2},{l:'Pressure loss',v:p,u:'Pa',key:1,d:0},{l:'Fan input power',v:P,u:'kW',d:1},{l:'Airway resistance',v:R,u:'Ns²/m⁸',d:4}],
   chk:[vel<0.25?{s:'bad',t:'Velocity under 0.25 m/s: air will not be well mixed.'}:vel>6?{s:'warn',t:'Velocity over 6 m/s: dust and discomfort in travelways.'}:{s:'ok',t:'Velocity within 0.25–6 m/s.'}]};},
 f:['Q = kW × air per kW + people × air per person','R = k P L ÷ A³,   p = R Q²','Fan power = p Q ÷ η'],
 notes:['Air per kW varies by jurisdiction, commonly 0.05–0.08 m³/s. Use the rule that applies to the mine.']});

def({id:'reserve',g:'MN',code:'MN-04',t:'Tonnage, grade and strip ratio',ref:1,
 d:'Ore tonnage, average grade and contained metal of blocks above a cut-off grade, with the strip ratio.',
 src:[['JORC Code','Reporting'],['SME Mining Engineering Handbook','Resource estimation']],
 inp:[{id:'gu',l:'Grade unit',type:'sel',o:MGRADE,v:'gt',wide:1},{id:'co',l:'Cut-off grade',u:'',v:0.5},
  {id:'rows',type:'rows',cols:[{id:'v',l:'Volume m³',v:10000},{id:'r',l:'Density t/m³',v:2.7},{id:'g',l:'Grade',v:1}],v:[{v:40000,r:2.7,g:1.8},{v:55000,r:2.7,g:1.1},{v:60000,r:2.65,g:0.7},{v:80000,r:2.6,g:0.3},{v:120000,r:2.5,g:0.05}]}],
 calc(v){let ot=0,wt=0,m=0;const rows=v.rows.map(x=>{const t=(+x.v||0)*(+x.r||0),g=+x.g||0,ore=g>=v.co;if(ore){ot+=t;m+=t*g}else wt+=t;return [fmt(+x.v,0),fmt(+x.r,2),fmt(g,2),fmt(t,0),ore?'Ore':'Waste']});
  const ag=ot?m/ot:0,gt=v.gu==='gt',metal=gt?m/31.1035:m/100;
  return {res:[{l:'Ore tonnage',v:ot,u:'t',key:1,d:0},{l:'Average grade',v:ag,u:gt?'g/t':'%',key:1,d:2},{l:'Contained metal',v:metal,u:gt?'oz':'t',key:1,d:0},{l:'Waste tonnage',v:wt,u:'t',d:0},{l:'Strip ratio (waste ÷ ore)',v:ot?wt/ot:NaN,d:2}],
   chk:[ot?{s:'ok',t:'Blocks at or above the cut-off are counted as ore.'}:{s:'warn',t:'No block reaches the cut-off grade.'}],
   tbl:{head:['Volume m³','Density','Grade','Tonnes','Class'],rows}};},
 f:['Tonnes = volume × density','Average grade = Σ (t × g) ÷ Σ t','Gold: oz = Σ (t × g/t) ÷ 31.1035;   base metal: t = Σ (t × %) ÷ 100'],
 notes:['Public reporting of resources and reserves must be signed off by a Competent Person.']});

def({id:'cutoff',g:'MN',code:'MN-05',t:'Cut-off grade',ref:1,
 d:'Break-even and marginal cut-off grades from the metal price, recovery and costs.',
 src:[['Lane (1988)','Cut-off grade theory'],['SME Mining Engineering Handbook','Cut-off grade']],
 inp:[{id:'gu',l:'Grade unit',type:'sel',o:MGRADE,v:'gt',wide:1},{id:'p',l:'Metal price',u:'per oz or per t',v:2400},{id:'sc',l:'Selling and refining cost',u:'per oz or per t',v:10},
  {id:'rec',l:'Process recovery',u:'%',v:90},{id:'mc',l:'Mining cost',u:'per t',v:3.5},{id:'pc',l:'Processing cost',u:'per t',v:18},{id:'ga',l:'General and admin cost',u:'per t',v:4}],
 calc(v){const gt=v.gu==='gt',net=(v.p-v.sc)*v.rec/100,unit=gt?net/31.1035:net/100,be=(v.mc+v.pc+v.ga)/unit,mg=(v.pc+v.ga)/unit;
  return {res:[{l:'Break-even cut-off',v:be,u:gt?'g/t':'%',key:1,d:gt?2:3},{l:'Marginal cut-off',v:mg,u:gt?'g/t':'%',key:1,d:gt?2:3},{l:'Value of one grade unit per tonne',v:unit,d:2}],
   chk:[{s:'ok',t:'Marginal cut-off applies to rock that must be mined anyway; break-even to rock mined only for its value.'}]};},
 f:['Value per grade unit = (price − selling cost) × recovery ÷ 31.1035 (g/t) or ÷ 100 (%)','Break-even = (mining + processing + G&A) ÷ value per unit','Marginal = (processing + G&A) ÷ value per unit'],
 notes:['Prices and costs in any one currency.']});

/* ===== pile foundations ===== */
const SOILT=[['c','Clay'],['s','Sand']];
const PGRID=[[1,2],[2,2],[2,3],[3,3],[3,4],[4,4],[4,5],[5,5]];

def({id:'pile-cap',g:'PF',code:'PF-01',t:'Bored pile capacity',ref:1,
 d:'Shaft and base resistance of a single bored pile in layered clay and sand, and its allowable load.',
 src:[['FHWA-NHI-10-016','Drilled shafts, Chapter 13'],['AASHTO LRFD','§10.8.3']],
 inp:[{id:'D',l:'Pile diameter',u:'mm',v:800},{id:'fs',l:'Factor of safety',u:'',v:2.5},
  {id:'rows',type:'rows',cols:[{id:'t',l:'Soil',type:'sel',o:SOILT},{id:'h',l:'Thickness m',v:5},{id:'cu',l:'cu kPa (clay)',v:0},{id:'n',l:'N60 (sand)',v:0},{id:'g',l:'γ′ kN/m³',v:9}],
   v:[{t:'c',h:4,cu:40,n:0,g:8},{t:'s',h:8,cu:0,n:20,g:10},{t:'c',h:6,cu:120,n:0,g:9},{t:'s',h:4,cu:0,n:45,g:11}]}],
 calc(v){const d=v.D/1000,per=PI*d,Ab=PI*d*d/4;let z=0,sv=0,Qs=0;const rows=v.rows.map(x=>{const h=+x.h||0,g=+x.g||0,zm=z+h/2,svm=sv+g*h/2;let f;
   if(x.t==='c'){const cu=+x.cu||0;f=0.55*cu}else{const N=+x.n||0;let b=1.5-0.245*Math.sqrt(Math.max(zm,0));if(N<15)b*=N/15;b=Math.min(1.2,Math.max(0.25,b));f=b*svm}
   const q=f*per*h;Qs+=q;z+=h;sv+=g*h;return {t:x.t,h,f,q}});
  const last=v.rows[v.rows.length-1]||{t:'c',cu:0,n:0},qb=last.t==='c'?Math.min(9*(+last.cu||0),3800):Math.min(57.5*(+last.n||0),2900),Qb=qb*Ab,Qu=Qs+Qb;
  return {res:[{l:'Allowable load',v:Qu/v.fs,u:'kN',key:1,d:0},{l:'Ultimate capacity',v:Qu,u:'kN',key:1,d:0},{l:'Shaft resistance',v:Qs,u:'kN',d:0},{l:'Base resistance',v:Qb,u:'kN',d:0},{l:'Pile length',v:z,u:'m',d:1}],
   chk:[Qb>Qs?{s:'warn',t:'Base carries more than the shaft: base resistance needs larger settlement to mobilise.'}:{s:'ok',t:'Shaft carries most of the load.'}],
   tbl:{head:['Soil','Thickness m','Unit shaft kPa','Shaft kN'],rows:rows.map(x=>[x.t==='c'?'Clay':'Sand',fmt(x.h,1),fmt(x.f,0),fmt(x.q,0)])}};},
 f:['Clay: f = 0.55 cu,   base q = 9 cu ≤ 3,800 kPa','Sand: f = β σ′v,   β = 1.5 − 0.245 √z (× N60 ÷ 15 when N60 < 15), 0.25 ≤ β ≤ 1.2','Sand base: q = 57.5 N60 ≤ 2,900 kPa'],
 notes:['Layers run from the ground surface down; the pile toe is at the bottom of the last layer.','Confirm the design capacity by a pile load test.']});

def({id:'pile-group',g:'PF',code:'PF-02',t:'Pile group capacity',ref:1,
 d:'Capacity of a rectangular pile group by the Converse–Labarre efficiency, and the block failure check in clay.',
 src:[['Das','Principles of Foundation Engineering, §12'],['Tomlinson','Pile Design and Construction']],
 inp:[{id:'m',l:'Piles in each row',u:'',v:3},{id:'n',l:'Rows',u:'',v:3},{id:'d',l:'Pile diameter',u:'mm',v:600},{id:'s',l:'Pile spacing',u:'mm',v:1800},
  {id:'Q',l:'Ultimate capacity of one pile',u:'kN',v:2500},{id:'L',l:'Pile length',u:'m',v:18},{id:'cu',l:'Average cu along the piles',u:'kPa',v:60},{id:'cb',l:'cu at the pile toe',u:'kPa',v:100},{id:'fs',l:'Factor of safety',u:'',v:2.5}],
 calc(v){const th=Math.atan(v.d/v.s)*180/PI,E=1-th*(v.n*(v.m-1)+v.m*(v.n-1))/(90*v.m*v.n),Qg=E*v.m*v.n*v.Q,B=((v.m-1)*v.s+v.d)/1000,Lb=((v.n-1)*v.s+v.d)/1000,Qbl=2*(B+Lb)*v.L*v.cu+9*v.cb*B*Lb,Qu=Math.min(Qg,Qbl);
  return {res:[{l:'Allowable group load',v:Qu/v.fs,u:'kN',key:1,d:0},{l:'Group efficiency',v:E*100,u:'%',key:1,d:1},{l:'Group capacity by efficiency',v:Qg,u:'kN',d:0},{l:'Block failure capacity',v:Qbl,u:'kN',d:0},{l:'Spacing ÷ diameter',v:v.s/v.d,d:2}],
   chk:[v.s/v.d<2.5?{s:'warn',t:'Spacing under 2.5 diameters.'}:{s:'ok',t:'Spacing at least 2.5 diameters.'},Qbl<Qg?{s:'warn',t:'Block failure governs.'}:{s:'ok',t:'Individual pile failure governs.'}]};},
 f:['E = 1 − θ [ n(m − 1) + m(n − 1) ] ÷ (90 m n),   θ = atan(d ÷ s) in degrees','Block = 2 (B + L) D cu + 9 cu,b B L'],
 notes:['In sand the group efficiency is usually taken as 1 for driven piles.']});

def({id:'pile-loads',g:'PF',code:'PF-03',t:'Pile cap layout and pile loads',ref:1,
 d:'Number of piles under a column, a rectangular layout and the load on each pile with moments.',
 src:[['Tomlinson','Pile groups'],['ACI 318','§13.4']],
 inp:[{id:'P',l:'Column load (service)',u:'kN',v:6000},{id:'Mx',l:'Moment about x',u:'kN·m',v:300},{id:'My',l:'Moment about y',u:'kN·m',v:150},
  {id:'Qa',l:'Allowable load per pile',u:'kN',v:1200},{id:'d',l:'Pile diameter',u:'mm',v:600},{id:'sf',l:'Spacing ÷ diameter',u:'',v:3},{id:'cw',l:'Cap self-weight allowance',u:'%',v:10}],
 calc(v){const Pt=v.P*(1+v.cw/100),need=Math.ceil(Pt/v.Qa),grid=PGRID.find(g=>g[0]*g[1]>=need)||PGRID[PGRID.length-1],nx=grid[1],ny=grid[0],n=nx*ny,s=v.sf*v.d/1000;
  let sx=0,sy=0,xs=[],ys=[];for(let i=0;i<nx;i++)xs.push((i-(nx-1)/2)*s);for(let j=0;j<ny;j++)ys.push((j-(ny-1)/2)*s);xs.forEach(x=>sx+=x*x*ny);ys.forEach(y=>sy+=y*y*nx);
  const xm=Math.max(...xs),ym=Math.max(...ys),Rmax=Pt/n+(sy?v.Mx*ym/sy:0)+(sx?v.My*xm/sx:0),Rmin=Pt/n-(sy?v.Mx*ym/sy:0)-(sx?v.My*xm/sx:0),edge=v.d/1000*1.5;
  return {res:[{l:'Piles',v:n,key:1,d:0},{l:'Layout',v:nx+' × '+ny,key:1},{l:'Maximum pile load',v:Rmax,u:'kN',key:1,d:0},{l:'Minimum pile load',v:Rmin,u:'kN',d:0},{l:'Cap length',v:(nx-1)*s+2*edge,u:'m',d:2},{l:'Cap width',v:(ny-1)*s+2*edge,u:'m',d:2},{l:'Pile spacing',v:s,u:'m',d:2}],
   chk:[Rmax<=v.Qa?{s:'ok',t:'Most loaded pile within the allowable load.'}:{s:'bad',t:'Most loaded pile exceeds the allowable load. Add piles or increase spacing.'},Rmin<0?{s:'warn',t:'A pile is in tension: check uplift capacity and reinforcement.'}:{s:'ok',t:'No pile in tension.'}]};},
 f:['n ≥ P (1 + cap allowance) ÷ Q_a','R = P ÷ n ± Mx y ÷ Σy² ± My x ÷ Σx²','Cap edge = 1.5 d beyond the pile centre lines'],
 notes:['Design the cap for bending, shear and punching under the factored loads.']});

/* ===== quantity surveying ===== */
const BLK=[['400 × 200 × 200',0.4,0.2,0.2],['400 × 200 × 150',0.4,0.2,0.15],['400 × 200 × 100',0.4,0.2,0.1],['Clay brick 215 × 65 × 102.5',0.215,0.065,0.1025]];
const MIX=[['4','1 : 4'],['5','1 : 5'],['6','1 : 6']];
const QFORM=[['Column',1],['Beam',2],['Slab',3],['Footing',4],['Wall',5]];

const mortarMat=(V,r)=>({cem:1.33*V/(1+r)*1440/50,sand:1.33*V*r/(1+r)});

def({id:'blockwork',g:'QS',code:'QS-01',t:'Blockwork and mortar',ref:1,
 d:'Number of blocks, mortar volume, cement bags and sand for a wall.',
 src:[['BS EN 1996','Masonry'],['Standard method of measurement','Masonry']],
 inp:[{id:'L',l:'Wall length',u:'m',v:40},{id:'H',l:'Wall height',u:'m',v:3},{id:'op',l:'Openings',u:'m²',v:12},{id:'b',l:'Unit',type:'sel',o:opt(BLK.map(x=>x[0])),v:'0',wide:1},
  {id:'j',l:'Joint thickness',u:'mm',v:10},{id:'mix',l:'Mortar mix (cement : sand)',type:'sel',o:MIX,v:'4'},{id:'w',l:'Wastage',u:'%',v:5}],
 calc(v){const B=BLK[+v.b],j=v.j/1000,A=Math.max(0,v.L*v.H-v.op),per=1/((B[1]+j)*(B[2]+j)),n=A*per*(1+v.w/100),Vm=A*B[3]-A*per*B[1]*B[2]*B[3],M=mortarMat(Vm*(1+v.w/100),+v.mix);
  return {res:[{l:'Units',v:Math.ceil(n),key:1,d:0},{l:'Mortar',v:Vm*(1+v.w/100),u:'m³',key:1,d:2},{l:'Cement',v:Math.ceil(M.cem),u:'bags of 50 kg',key:1,d:0},{l:'Sand',v:M.sand,u:'m³',d:2},{l:'Net wall area',v:A,u:'m²',d:1},{l:'Units per m²',v:per,d:1}],
   chk:[{s:'ok',t:'Hollow blocks take mortar in the bed and head joints only; the figure assumes solid joints.'}]};},
 f:['Units per m² = 1 ÷ [ (L + j)(H + j) ]','Mortar = wall volume − unit volume','Dry volume = 1.33 × wet;  cement = dry ÷ (1 + r) × 1,440 kg/m³'],
 notes:['Add separately for lintels, bond beams and cutting at corners.']});

def({id:'plaster-paint',g:'QS',code:'QS-02',t:'Plaster and paint',ref:1,
 d:'Cement, sand and paint quantities for plastering and painting an area.',
 src:[['BS EN 13914','Rendering and plastering'],['Paint manufacturer data','Coverage']],
 inp:[{id:'A',l:'Area',u:'m²',v:500},{id:'t',l:'Plaster thickness',u:'mm',v:15},{id:'mix',l:'Plaster mix (cement : sand)',type:'sel',o:MIX,v:'4'},{id:'w',l:'Wastage',u:'%',v:10},
  {h:'Paint'},{id:'c',l:'Coats',u:'',v:2},{id:'cov',l:'Coverage per coat',u:'m²/L',v:10},{id:'pr',l:'Primer coverage',u:'m²/L',v:12}],
 calc(v){const Vm=v.A*v.t/1000*(1+v.w/100),M=mortarMat(Vm,+v.mix),paint=v.A*v.c/v.cov*(1+v.w/100),prim=v.A/v.pr*(1+v.w/100);
  return {res:[{l:'Cement',v:Math.ceil(M.cem),u:'bags of 50 kg',key:1,d:0},{l:'Sand',v:M.sand,u:'m³',key:1,d:2},{l:'Paint',v:paint,u:'L',key:1,d:0},{l:'Primer',v:prim,u:'L',d:0},{l:'Wet plaster volume',v:Vm,u:'m³',d:2}],
   chk:[v.t>20?{s:'warn',t:'Plaster over 20 mm should be applied in two coats.'}:{s:'ok',t:'Thickness suits a single coat.'}]};},
 f:['Plaster volume = area × thickness × (1 + wastage)','Paint litres = area × coats ÷ coverage'],
 notes:['Rough or absorbent walls take more paint than the label coverage.']});

def({id:'tiles',g:'QS',code:'QS-03',t:'Tiling quantities',ref:1,
 d:'Tiles, boxes, adhesive and grout for a floor or wall.',
 src:[['BS 5385','Tiling'],['ANSI A108','Tile installation']],
 inp:[{id:'L',l:'Length',u:'m',v:6},{id:'W',l:'Width',u:'m',v:5},{id:'tl',l:'Tile length',u:'mm',v:600},{id:'tw',l:'Tile width',u:'mm',v:600},{id:'j',l:'Joint width',u:'mm',v:3},
  {id:'bx',l:'Area per box',u:'m²',v:1.44},{id:'w',l:'Wastage',u:'%',v:10},{id:'ad',l:'Adhesive',u:'kg/m²',v:5}],
 calc(v){const A=v.L*v.W,per=1/((v.tl+v.j)*(v.tw+v.j)/1e6),n=Math.ceil(A*per*(1+v.w/100)),gr=(v.tl+v.tw)/(v.tl*v.tw)*v.j*10*1.6*A;
  return {res:[{l:'Tiles',v:n,key:1,d:0},{l:'Boxes',v:Math.ceil(A*(1+v.w/100)/v.bx),key:1,d:0},{l:'Adhesive',v:A*v.ad,u:'kg',key:1,d:0},{l:'Grout',v:gr,u:'kg',d:1},{l:'Area',v:A,u:'m²',d:2}],
   chk:[v.w<10&&v.tl>=600?{s:'warn',t:'Large tiles cut with more waste: allow at least 10 %.'}:{s:'ok',t:'Wastage allowance is reasonable.'}]};},
 f:['Tiles = area ÷ [(l + j)(w + j)] × (1 + wastage)','Grout kg ≈ (l + w) ÷ (l w) × joint width × joint depth × 1.6 × area'],
 notes:['Grout assumes a 10 mm deep joint and 1.6 kg/L density.']});

def({id:'excavation',g:'QS',code:'QS-04',t:'Excavation and backfill',ref:1,
 d:'Excavation, haulage and backfill volumes for foundation pits with working space and side slopes.',
 src:[['Standard method of measurement','Excavation'],['OSHA 1926 Subpart P','Sloping']],
 inp:[{id:'rows',type:'rows',cols:[{id:'L',l:'Length m',v:2},{id:'W',l:'Width m',v:2},{id:'D',l:'Depth m',v:1.5},{id:'q',l:'Qty',v:1}],v:[{L:2.4,W:2.4,D:1.8,q:12},{L:3,W:3,D:2,q:6},{L:30,W:0.8,D:1,q:1}]},
  {id:'ws',l:'Working space each side',u:'m',v:0.5},{id:'sl',l:'Side slope (horizontal per 1 vertical)',u:'',v:0.5},{id:'Vs',l:'Volume of structure below ground',u:'m³',v:90},
  {id:'bk',l:'Bulking factor',u:'',v:1.25},{id:'tr',l:'Truck capacity',u:'m³',v:16}],
 calc(v){let V=0;const rows=v.rows.map(x=>{const a=(+x.L||0)+2*v.ws,b=(+x.W||0)+2*v.ws,d=+x.D||0,k=v.sl*d,A1=a*b,A2=(a+2*k)*(b+2*k),Am=(a+k)*(b+k),vol=d/6*(A1+4*Am+A2)*(+x.q||0);V+=vol;return [fmt(+x.L,2)+' × '+fmt(+x.W,2)+' × '+fmt(d,2),fmt(+x.q,0),fmt(vol,1)]});
  const bf=Math.max(0,V-v.Vs),sp=V*v.bk;
  return {res:[{l:'Excavation (bank)',v:V,u:'m³',key:1,d:0},{l:'Backfill (compacted)',v:bf,u:'m³',key:1,d:0},{l:'Loose volume',v:sp,u:'m³',d:0},{l:'Truckloads to remove the surplus',v:Math.ceil((V-bf/0.9)*v.bk/v.tr),key:1,d:0}],
   chk:[v.sl===0&&v.rows.some(x=>+x.D>1.5)?{s:'warn',t:'Vertical sides deeper than 1.5 m need shoring.'}:{s:'ok',t:'Side slopes included.'}],
   tbl:{head:['Pit L × W × D m','Qty','m³'],rows}};},
 f:['Pit with working space and slope by the prismoidal formula: V = d ÷ 6 (A₁ + 4A_m + A₂)','Backfill = excavation − structure','Surplus = excavation − backfill ÷ 0.9, loose × bulking'],
 notes:['Backfill is reused from the excavation at a compaction factor of 0.9.']});

def({id:'formwork',g:'QS',code:'QS-05',t:'Formwork and concrete',ref:1,
 d:'Formwork contact area and concrete volume for columns, beams, slabs, footings and walls.',
 src:[['ACI 347','Formwork'],['Standard method of measurement','Concrete work']],
 inp:[{id:'rows',type:'rows',cols:[{id:'t',l:'Element',type:'sel',o:opt(QFORM.map(x=>x[0]))},{id:'a',l:'L or width m',v:0.4},{id:'b',l:'Width or depth m',v:0.4},{id:'h',l:'Height or length m',v:3},{id:'q',l:'Qty',v:1}],
   v:[{t:'0',a:0.5,b:0.5,h:3.2,q:24},{t:'1',a:0.3,b:0.6,h:6,q:30},{t:'2',a:20,b:0.2,h:30,q:1},{t:'3',a:2.4,b:0.7,h:2.4,q:24}]}],
 calc(v){let FA=0,VC=0;const rows=v.rows.map(x=>{const t=+x.t,a=+x.a||0,b=+x.b||0,h=+x.h||0,q=+x.q||0;let f,c;
   if(t===0){f=2*(a+b)*h;c=a*b*h}else if(t===1){f=(a+2*b)*h;c=a*b*h}else if(t===2){f=a*h+2*(a+h)*b;c=a*b*h}else if(t===3){f=2*(a+h)*b;c=a*b*h}else{f=2*a*h;c=a*b*h}
   FA+=f*q;VC+=c*q;return [(QFORM[t]||QFORM[0])[0],fmt(q,0),fmt(f*q,1),fmt(c*q,2)]});
  return {res:[{l:'Formwork area',v:FA,u:'m²',key:1,d:0},{l:'Concrete',v:VC,u:'m³',key:1,d:1},{l:'Formwork per m³',v:VC?FA/VC:NaN,u:'m²/m³',d:1}],
   chk:[{s:'ok',t:'Beam forms include the soffit and both sides; slab forms include the soffit and edges.'}],
   tbl:{head:['Element','Qty','Formwork m²','Concrete m³'],rows}};},
 f:['Column: 2(a + b) h','Beam: (width + 2 depth) × length','Slab: area + edges,   footing: sides only,   wall: both faces'],
 notes:['For a slab enter length, thickness and width; for a wall enter length, thickness and height.']});

def({id:'cost-est',g:'QS',code:'QS-06',t:'Cost estimate',ref:1,
 d:'Total project cost from trade costs, with contingency, overheads and profit, VAT and the cost per square metre.',
 src:[['RICS NRM 1','Order of cost estimating'],['ZATCA','VAT 15 %']],
 inp:[{id:'rows',type:'rows',cols:[{id:'c',l:'Trade cost',v:100000}],v:[{c:2400000},{c:3100000},{c:1650000},{c:2200000},{c:900000},{c:600000}]},
  {id:'A',l:'Gross floor area',u:'m²',v:5000},{id:'ct',l:'Contingency',u:'%',v:7.5},{id:'oh',l:'Overheads and profit',u:'%',v:12},{id:'vat',l:'VAT',u:'%',v:15}],
 calc(v){const S=v.rows.reduce((s,x)=>s+(+x.c||0),0),C=S*v.ct/100,O=(S+C)*v.oh/100,N=S+C+O,V=N*v.vat/100,T=N+V;
  return {res:[{l:'Total including VAT',v:T,key:1,d:0},{l:'Cost per m²',v:T/v.A,key:1,d:0},{l:'Trade costs',v:S,d:0},{l:'Contingency',v:C,d:0},{l:'Overheads and profit',v:O,d:0},{l:'VAT',v:V,d:0}],
   chk:[v.ct<5?{s:'warn',t:'Contingency under 5 % is low at early design stages.'}:{s:'ok',t:'Contingency is reasonable for this stage.'}],
   tbl:{head:['Item','Amount','Share %'],rows:[['Trade costs',S],['Contingency',C],['Overheads and profit',O],['VAT',V]].map(x=>[x[0],fmt(x[1],0),fmt(T?x[1]/T*100:0,1)])}};},
 f:['Net = trades + contingency + OH&P on (trades + contingency)','Total = net × (1 + VAT)'],
 notes:['Money values are in any one currency.']});

/* ===== project management ===== */
const PRED=[['0','—']].concat(Array.from({length:20},(_,i)=>[String(i+1),String(i+1)]));

def({id:'cpm',g:'PM',code:'PM-01',t:'Critical path',ref:1,
 d:'Early and late start and finish, float and the critical path of up to 20 activities with finish-to-start links.',
 src:[['PMI PMBOK','Schedule management'],['AACE 24R-03','CPM scheduling']],
 inp:[{id:'rows',type:'rows',cols:[{id:'d',l:'Duration d',v:5},{id:'p1',l:'After',type:'sel',o:PRED},{id:'p2',l:'And after',type:'sel',o:PRED},{id:'p3',l:'And after',type:'sel',o:PRED}],
   v:[{d:5,p1:'0',p2:'0',p3:'0'},{d:10,p1:'1',p2:'0',p3:'0'},{d:8,p1:'1',p2:'0',p3:'0'},{d:12,p1:'2',p2:'0',p3:'0'},{d:6,p1:'2',p2:'3',p3:'0'},{d:4,p1:'4',p2:'5',p3:'0'}]}],
 calc(v){const A=v.rows.map((x,i)=>({i,d:+x.d||0,p:[x.p1,x.p2,x.p3].map(Number).filter(k=>k>0&&k<=v.rows.length&&k!==i+1).map(k=>k-1)})),n=A.length;
  const ES=Array(n).fill(0),EF=Array(n).fill(0);let ok=true;
  for(let pass=0;pass<=n;pass++){let ch=false;A.forEach(a=>{const es=a.p.reduce((m,k)=>Math.max(m,EF[k]),0);if(es!==ES[a.i]||ES[a.i]+a.d!==EF[a.i]){ES[a.i]=es;EF[a.i]=es+a.d;ch=true}});if(!ch)break;if(pass===n)ok=false}
  const T=Math.max(0,...EF),LF=Array(n).fill(T),LS=Array(n).fill(0);
  for(let pass=0;pass<=n;pass++){let ch=false;A.forEach(a=>{const succ=A.filter(b=>b.p.includes(a.i)),lf=succ.length?Math.min(...succ.map(b=>LF[b.i]-b.d)):T;if(lf!==LF[a.i]){LF[a.i]=lf;ch=true}LS[a.i]=LF[a.i]-a.d});if(!ch)break}
  const crit=A.filter(a=>Math.abs(LS[a.i]-ES[a.i])<1e-9).map(a=>a.i+1);
  return {res:[{l:'Project duration',v:T,u:'d',key:1,d:0},{l:'Critical path',v:ok?crit.join(' → '):'—',key:1},{l:'Activities',v:n,d:0}],
   chk:[ok?{s:'ok',t:'Network is valid.'}:{s:'bad',t:'The links form a loop. Check the predecessors.'}],
   tbl:{head:['Activity','Duration','ES','EF','LS','LF','Float'],rows:A.map(a=>({hl:crit.includes(a.i+1),c:[String(a.i+1),fmt(a.d,0),fmt(ES[a.i],0),fmt(EF[a.i],0),fmt(LS[a.i],0),fmt(LF[a.i],0),fmt(LS[a.i]-ES[a.i],0)]}))}};},
 f:['ES = max EF of predecessors,   EF = ES + duration','LF = min LS of successors,   LS = LF − duration','Float = LS − ES; critical when float = 0'],
 notes:['Activities are numbered by row. Durations are in working days.']});

def({id:'evm',g:'PM',code:'PM-02',t:'Earned value',ref:1,
 d:'Cost and schedule performance of a project from planned value, earned value and actual cost, with the forecast at completion.',
 src:[['PMI PMBOK','Cost management'],['ANSI/EIA-748','Earned value']],
 inp:[{id:'BAC',l:'Budget at completion',u:'',v:10000000},{id:'PV',l:'Planned value to date',u:'',v:4000000},{id:'EV',l:'Earned value to date',u:'',v:3600000},{id:'AC',l:'Actual cost to date',u:'',v:3500000}],
 calc(v){const CPI=v.EV/v.AC,SPI=v.EV/v.PV,EAC=v.BAC/CPI,TCPI=(v.BAC-v.EV)/(v.BAC-v.AC);
  return {res:[{l:'Cost performance index CPI',v:CPI,key:1,d:2},{l:'Schedule performance index SPI',v:SPI,key:1,d:2},{l:'Estimate at completion',v:EAC,key:1,d:0},{l:'Cost variance',v:v.EV-v.AC,d:0},{l:'Schedule variance',v:v.EV-v.PV,d:0},
   {l:'Estimate to complete',v:EAC-v.AC,d:0},{l:'Variance at completion',v:v.BAC-EAC,d:0},{l:'TCPI to finish on budget',v:TCPI,d:2},{l:'Percent complete',v:v.EV/v.BAC*100,u:'%',d:1}],
   chk:[CPI>=1?{s:'ok',t:'Under budget for the work done.'}:{s:'bad',t:'Over budget for the work done.'},SPI>=1?{s:'ok',t:'On or ahead of schedule.'}:{s:'warn',t:'Behind schedule.'}]};},
 f:['CPI = EV ÷ AC,   SPI = EV ÷ PV','EAC = BAC ÷ CPI,   ETC = EAC − AC','TCPI = (BAC − EV) ÷ (BAC − AC)'],
 notes:['EAC by CPI assumes the cost performance so far will continue.']});

def({id:'productivity',g:'PM',code:'PM-03',t:'Crew productivity and duration',ref:1,
 d:'Duration of an activity from its quantity and crew output, and the crews needed to finish by a target date.',
 src:[['RSMeans','Crew productivity'],['AACE 25R-03','Productivity loss']],
 inp:[{id:'Q',l:'Quantity',u:'',v:2400},{id:'p',l:'Output per crew per day',u:'',v:60},{id:'c',l:'Crews',u:'',v:2},{id:'e',l:'Efficiency',u:'%',v:85,hint:'Heat, access and overtime lower productivity'},{id:'t',l:'Target duration',u:'d',v:15}],
 calc(v){const out=v.p*v.c*v.e/100,D=v.Q/out,need=Math.ceil(v.Q/(v.t*v.p*v.e/100));
  return {res:[{l:'Duration',v:D,u:'d',key:1,d:1},{l:'Crews for the target',v:need,key:1,d:0},{l:'Daily output',v:out,d:1}],
   chk:[D<=v.t?{s:'ok',t:'Finishes within the target.'}:{s:'warn',t:'Misses the target with '+v.c+' crews.'}]};},
 f:['Duration = quantity ÷ (output × crews × efficiency)'],
 notes:['Summer work in the Gulf has restricted midday hours: reduce the efficiency to suit.']});

def({id:'pour',g:'PM',code:'PM-04',t:'Concrete pour planning',ref:1,
 d:'Pour duration, number of truck mixers and truckloads for a concrete pour by pump.',
 src:[['ACI 304R','Placing concrete'],['ACI 304.2R','Pumping']],
 inp:[{id:'V',l:'Pour volume',u:'m³',v:450},{id:'pr',l:'Pump output',u:'m³/h',v:60},{id:'e',l:'Pump efficiency',u:'%',v:70},{id:'tc',l:'Truck capacity',u:'m³',v:9},
  {id:'rt',l:'Truck round trip',u:'min',v:75},{id:'set',l:'Initial set time of the mix',u:'h',v:3}],
 calc(v){const rate=v.pr*v.e/100,T=v.V/rate,per=v.tc/rate*60,n=Math.ceil(v.rt/per)+1,loads=Math.ceil(v.V/v.tc);
  return {res:[{l:'Pour duration',v:T,u:'h',key:1,d:1},{l:'Truck mixers needed',v:n,key:1,d:0},{l:'Truckloads',v:loads,key:1,d:0},{l:'Effective placing rate',v:rate,u:'m³/h',d:1},{l:'Interval between trucks',v:per,u:'min',d:1}],
   chk:[per>v.set*60/4?{s:'warn',t:'Long gaps between trucks: risk of cold joints.'}:{s:'ok',t:'Truck interval is short enough for a continuous pour.'},T>12?{s:'warn',t:'Pour over 12 h: plan crew shifts and a second pump.'}:{s:'ok',t:'Pour fits in one shift.'}]};},
 f:['Duration = volume ÷ (pump output × efficiency)','Trucks = ⌈ round trip ÷ unloading interval ⌉ + 1 standby'],
 notes:['In hot weather use retarders and pour at night to keep the concrete below its maximum temperature.']});

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
"L/flush":"L/دفقة","Fuel gas":"الغاز","Medical gases":"الغازات الطبية","Refrigeration & steam":"التبريد والبخار","ELV & low-current":"التيار الخفيف","Solar & energy":"الطاقة الشمسية والطاقة","Sustainability":"الاستدامة","Stormwater & hydrology":"مياه الأمطار والهيدرولوجيا","Water & wastewater":"المياه والصرف","Irrigation":"الري","Roads & transport":"الطرق والنقل","Surveying":"المساحة","Mining":"التعدين","Pile foundations":"الأساسات الخازوقية","Quantity surveying":"حساب الكميات","Project management":"إدارة المشاريع","per kWh":"لكل kWh","per yr":"سنويًا","million ESAL":"مليون ESAL","million":"مليون","per inch":"لكل بوصة","per oz or per t":"لكل أونصة أو طن","per t":"لكل طن","m³/s per kW":"m³/s لكل kW","bags of 50 kg":"كيس 50 kg","veh/d":"مركبة/يوم","ESAL/truck":"ESAL/شاحنة","oz":"أونصة","Gas pipe sizing":"تحجيم مواسير الغاز","Low-pressure natural gas or LPG pipe size for a load and length, by the Pole formula.":"قطر ماسورة الغاز الطبيعي أو الغاز المسال منخفض الضغط لحمل وطول معينين، بمعادلة Pole.","Bores are for medium-weight steel tube. Copper and polyethylene have different bores: check the size against its own table.":"الأقطار الداخلية لمواسير الحديد متوسطة الوزن. النحاس والبولي إيثيلين لهما أقطار مختلفة: راجع المقاس في جدوله الخاص.","Keep the drop from the meter to the furthest appliance within the limit for the supply pressure.":"حافظ على هبوط الضغط من العداد حتى أبعد جهاز ضمن الحد المسموح لضغط التغذية.","Gas":"الغاز","Natural gas":"غاز طبيعي","LPG (propane)":"غاز مسال (بروبان)","Gas load":"حمل الغاز","Pipe length":"طول الماسورة","Allowed pressure drop":"هبوط الضغط المسموح","Natural gas 1 mbar, LPG 2.5 mbar":"الغاز الطبيعي 1 mbar، الغاز المسال 2.5 mbar","Pipe size":"مقاس الماسورة","Gas flow":"تدفق الغاز","Minimum bore":"أقل قطر داخلي","Capacity of the size chosen":"سعة المقاس المختار","Effective length":"الطول المكافئ","Pressure drop within {0} mbar.":"هبوط الضغط ضمن {0} mbar.","No size in the table is large enough. Shorten the run or allow a larger drop.":"لا يوجد مقاس كافٍ في الجدول. قصّر المسار أو اسمح بهبوط أكبر.","Velocity over 6 m/s: expect noise.":"السرعة أكثر من 6 m/s: توقّع ضوضاء.","Velocity is low.":"السرعة منخفضة.","Bore mm":"القطر الداخلي mm","Capacity m³/h":"السعة m³/h","Gas appliance load":"حمل أجهزة الغاز","Connected and design gas load of a group of appliances, as natural gas flow and LPG mass flow.":"حمل الغاز الموصول والتصميمي لمجموعة أجهزة، كتدفق غاز طبيعي وتدفق كتلي للغاز المسال.","Ratings are gross heat input. Use the nameplate figure where you have it.":"القدرات هي مدخل الحرارة الإجمالي. استخدم قيمة لوحة الجهاز إن توفرت.","Appliance":"الجهاز","Domestic cooker":"طباخ منزلي","Domestic water heater":"سخان مياه منزلي","Combi boiler":"غلاية مدمجة","Commercial range (6 burners)":"موقد تجاري (6 شعلات)","Commercial oven":"فرن تجاري","Fryer":"قلاية","Bratt pan":"مقلاة كبيرة","Grill / salamander":"شواية / سلمندر","Wok burner":"موقد ووك","Boiler 100 kW":"غلاية 100 kW","kW each":"kW لكل جهاز","Diversity factor":"معامل التباين","Commercial kitchens 100 %; groups of dwellings much lower":"المطابخ التجارية 100 %؛ مجموعات المساكن أقل بكثير","Design load":"الحمل التصميمي","Natural gas flow":"تدفق الغاز الطبيعي","LPG flow":"تدفق الغاز المسال","LPG vapour flow":"تدفق بخار الغاز المسال","Diversity applied. Make sure it suits how the appliances are used together.":"تم تطبيق معامل التباين. تأكد أنه يناسب طريقة تشغيل الأجهزة معًا.","No diversity: all appliances at full rate.":"بدون تباين: كل الأجهزة بكامل قدرتها.","kW":"kW","LPG storage":"تخزين الغاز المسال","LPG tank size for a load and days of storage, and the cylinders needed if a cylinder manifold is used instead.":"حجم خزان الغاز المسال لحمل وعدد أيام تخزين، وعدد الأسطوانات اللازمة عند استخدام مجمّع أسطوانات بدلًا منه.","Check separation distances to buildings, boundaries and openings for the tank size chosen.":"راجع مسافات الفصل عن المباني والحدود والفتحات لحجم الخزان المختار.","A tank's natural vaporisation falls in cold weather. Large loads may need a vaporiser.":"يقل التبخر الطبيعي للخزان في الطقس البارد. قد تحتاج الأحمال الكبيرة إلى مبخّر.","Hours of use per day":"ساعات الاستخدام يوميًا","Days of storage":"أيام التخزين","Maximum fill":"أقصى نسبة تعبئة","Cylinder size":"حجم الأسطوانة","Off-take per cylinder":"معدل السحب لكل أسطوانة","About 1 kg/h at 15 °C; less in cold weather":"حوالي 1 kg/h عند 15 °C؛ أقل في الطقس البارد","Tank water capacity needed":"السعة المائية المطلوبة للخزان","Standard tank":"الخزان القياسي","LPG stored":"الغاز المسال المخزّن","Daily use":"الاستهلاك اليومي","Peak flow":"التدفق الأقصى","Cylinders on line":"الأسطوانات العاملة","Cylinders for two banks":"أسطوانات لمجموعتين","Cylinder changes per week":"مرات تبديل الأسطوانات أسبوعيًا","More than 10 cylinders on line: a bulk tank is usually the better choice.":"أكثر من 10 أسطوانات عاملة: الخزان الكبير عادةً الخيار الأفضل.","A cylinder manifold is practical for this load.":"مجمّع الأسطوانات عملي لهذا الحمل.","Medical gas design flow":"التدفق التصميمي للغازات الطبية","Diversified design flow of each medical gas from the outlets in each department.":"التدفق التصميمي بعد التباين لكل غاز طبي من مخارج كل قسم.","Default flows and diversities are typical ward and theatre values. Use the department figures in HTM 02-01 or NFPA 99 for final design.":"التدفقات ومعاملات التباين الافتراضية قيم نموذجية للأجنحة وغرف العمليات. استخدم قيم الأقسام في HTM 02-01 أو NFPA 99 للتصميم النهائي.","Oxygen":"أكسجين","Medical air 4 bar":"هواء طبي 4 bar","Surgical air 7 bar":"هواء جراحي 7 bar","Nitrous oxide":"أكسيد النيتروز","Vacuum":"شفط (فاكيوم)","Outlets":"المخارج","L/min first outlet":"L/min للمخرج الأول","Diversity %":"التباين %","Design flow":"التدفق التصميمي","Each line: first outlet at full flow plus the others at the diversity given.":"كل سطر: المخرج الأول بكامل التدفق والباقي بمعامل التباين المعطى.","Design L/min":"التصميمي L/min","Medical gas pipe sizing":"تحجيم مواسير الغازات الطبية","Copper pipe size for a medical gas or vacuum flow, from the pressure drop over the run.":"مقاس ماسورة النحاس لتدفق غاز طبي أو شفط، من هبوط الضغط على طول المسار.","Vacuum is sized at 0.4 bar absolute; its flow is free air at atmospheric pressure.":"يُحجَّم الشفط عند 0.4 bar مطلق؛ وتدفقه هواء حر عند الضغط الجوي.","Minimum size is usually 12 mm for terminal drops and 15 mm for branches.":"أقل مقاس عادةً 12 mm لنزلات المخارج و15 mm للفروع.","Design flow (free air)":"التدفق التصميمي (هواء حر)","4 bar: 0.2 bar; 7 bar: 0.35 bar; vacuum: 0.13 bar":"4 bar: 0.2 bar؛ 7 bar: 0.35 bar؛ الشفط: 0.13 bar","Copper size (OD × wall)":"مقاس النحاس (القطر الخارجي × السماكة)","Pressure drop":"هبوط الضغط","Absolute pressure":"الضغط المطلق","Actual flow":"التدفق الفعلي","Drop within {0} bar.":"الهبوط ضمن {0} bar.","No copper size in the table meets the drop. Split the load or allow a larger drop.":"لا يحقق أي مقاس نحاس في الجدول الهبوط المسموح. قسّم الحمل أو اسمح بهبوط أكبر.","Velocity over 15 m/s.":"السرعة أكثر من 15 m/s.","Velocity acceptable.":"السرعة مقبولة.","Size mm":"المقاس mm","Drop bar":"الهبوط bar","Oxygen storage":"تخزين الأكسجين","Liquid oxygen tank (VIE) size for days of storage, and the cylinders for the emergency reserve.":"حجم خزان الأكسجين السائل (VIE) لعدد أيام التخزين، والأسطوانات للاحتياطي الطارئ.","Average use is usually 30–50 % of the design flow. Use the hospital's records where they exist.":"متوسط الاستهلاك عادةً 30–50 % من التدفق التصميمي. استخدم سجلات المستشفى إن وُجدت.","Oxygen design flow":"التدفق التصميمي للأكسجين","Average use as a share of design flow":"متوسط الاستهلاك كنسبة من التدفق التصميمي","Emergency reserve":"الاحتياطي الطارئ","Cylinder content":"محتوى الأسطوانة","J size about 6,800 L":"مقاس J حوالي 6,800 L","Liquid oxygen needed":"الأكسجين السائل المطلوب","Standard VIE tank":"خزان VIE قياسي","Reserve cylinders":"أسطوانات الاحتياطي","Average daily use":"متوسط الاستهلاك اليومي","Days from the tank chosen":"أيام يكفيها الخزان المختار","Keep a secondary supply as well as the reserve, so one fault cannot stop oxygen.":"احتفظ بمصدر ثانوي إضافة إلى الاحتياطي، حتى لا يوقف عطل واحد الأكسجين.","Cold room load":"حمل غرفة التبريد","Refrigeration load of a chiller or freezer room from its walls, product, air changes, people, lights and fans.":"حمل التبريد لغرفة تبريد أو تجميد من الجدران والمنتج وتغيير الهواء والأشخاص والإنارة والمراوح.","Product data are typical. Use the supplier's figures for unusual products.":"بيانات المنتجات نموذجية. استخدم أرقام المورّد للمنتجات غير المعتادة.","Freezers need defrost: allow for it in the running time.":"غرف التجميد تحتاج إذابة الصقيع: احسب ذلك في زمن التشغيل.","Surrounding temperature":"درجة الحرارة المحيطة","Panel U-value":"معامل U للألواح","100 mm PIR about 0.22":"ألواح PIR بسماكة 100 mm حوالي 0.22","Product":"المنتج","Beef / lamb":"لحم بقري / ضأن","Poultry":"دواجن","Fish":"أسماك","Fruit":"فواكه","Vegetables":"خضروات","Milk and dairy":"حليب ومنتجات ألبان","Bakery":"مخبوزات","Product brought in per day":"المنتج الداخل يوميًا","Entering temperature":"درجة حرارة الدخول","Other loads":"أحمال أخرى","People working inside":"العاملون بالداخل","Hours inside per day":"ساعات البقاء بالداخل يوميًا","Evaporator fans":"مراوح المبخّر","Compressor running time":"زمن تشغيل الضاغط","Chillers 16–18 h, freezers 18–20 h":"التبريد 16–18 h، التجميد 18–20 h","Refrigeration capacity":"قدرة التبريد","Daily load with safety factor":"الحمل اليومي مع معامل الأمان","In tons of refrigeration":"بأطنان التبريد","Air changes per day":"تغييرات الهواء يوميًا","Room is below the freezing point of the product: freezing load included.":"الغرفة أبرد من نقطة تجمد المنتج: حمل التجميد محسوب.","Chilling only: the product does not freeze.":"تبريد فقط: المنتج لا يتجمد.","Temperature difference {0} K.":"فرق درجات الحرارة {0} K.","Room must be colder than its surroundings.":"يجب أن تكون الغرفة أبرد من محيطها.","kWh/d":"kWh/d","Share %":"النسبة %","Walls, roof and floor":"الجدران والسقف والأرضية","Fans":"المراوح","Steam pipe sizing":"تحجيم مواسير البخار","Steel pipe size for saturated steam by velocity, with the pressure drop per 100 m.":"مقاس ماسورة الحديد للبخار المشبع حسب السرعة، مع هبوط الضغط لكل 100 m.","Bores are Schedule 40. Steam properties are interpolated from saturated steam tables.":"الأقطار الداخلية Schedule 40. خواص البخار مستنبطة من جداول البخار المشبع.","Steam flow":"تدفق البخار","Steam pressure":"ضغط البخار","Velocity limit":"حد السرعة","Mains 25–35 m/s, branches 15–25 m/s":"الخطوط الرئيسية 25–35 m/s، الفروع 15–25 m/s","Pressure drop per 100 m":"هبوط الضغط لكل 100 m","Saturation temperature":"درجة حرارة التشبع","Specific volume":"الحجم النوعي","Velocity within {0} m/s.":"السرعة ضمن {0} m/s.","Flow too large for the table.":"التدفق أكبر من الجدول.","Drop over 0.5 bar per 100 m: check the pressure at the far end.":"الهبوط أكثر من 0.5 bar لكل 100 m: راجع الضغط عند الطرف البعيد.","Pressure drop is moderate.":"هبوط الضغط معتدل.","Drop bar/100 m":"الهبوط bar/100 m","Steam boiler sizing":"تحجيم غلاية البخار","Steam flow, boiler rating and fuel use for a process or heating load.":"تدفق البخار وقدرة الغلاية واستهلاك الوقود لحمل تصنيعي أو تدفئة.","Calorific values: diesel 42.6 MJ/kg, natural gas 38.7 MJ/m³, LPG 46.3 MJ/kg.":"القيم الحرارية: الديزل 42.6 MJ/kg، الغاز الطبيعي 38.7 MJ/m³، الغاز المسال 46.3 MJ/kg.","Use two boilers where the load cannot stop for maintenance.":"استخدم غلايتين حيث لا يمكن إيقاف الحمل للصيانة.","Heat load":"الحمل الحراري","Operating pressure":"ضغط التشغيل","Feedwater temperature":"درجة حرارة مياه التغذية","Losses and margin":"الفواقد والهامش","Boiler efficiency":"كفاءة الغلاية","Fuel":"الوقود","Diesel":"ديزل","LPG":"غاز مسال","Boiler output":"قدرة الغلاية","From and at 100 °C":"من وعند 100 °C","Boiler horsepower":"قدرة الغلاية بالحصان","Fuel use":"استهلاك الوقود","Feedwater below 60 °C raises oxygen corrosion: consider a hotter hotwell or a deaerator.":"مياه التغذية أقل من 60 °C تزيد تآكل الأكسجين: فكّر في خزان تغذية أسخن أو جهاز نزع الهواء.","Feedwater temperature is reasonable.":"درجة حرارة مياه التغذية مناسبة.","Flash steam":"بخار الوميض","Flash steam released when condensate drops to a lower pressure, and the vent or flash line size.":"بخار الوميض المتحرر عند انخفاض ضغط المتكثف، ومقاس خط التنفيس أو الوميض.","Size condensate return lines for the flash steam volume, not the water.":"حجّم خطوط رجوع المتكثف لحجم بخار الوميض، لا للماء.","Condensate flow":"تدفق المتكثف","Steam trap inlet pressure":"ضغط مدخل مصيدة البخار","Receiver or flash vessel pressure":"ضغط خزان الاستقبال أو وعاء الوميض","Flash line velocity":"سرعة خط الوميض","Flash steam flow":"تدفق بخار الوميض","Condensate left":"المتكثف المتبقي","Flash line size":"مقاس خط الوميض","Heat in the flash steam":"الحرارة في بخار الوميض","Receiver pressure must be lower than the trap pressure.":"يجب أن يكون ضغط خزان الاستقبال أقل من ضغط المصيدة.","Flash steam can be recovered for low-pressure heating.":"يمكن استرجاع بخار الوميض للتسخين بالضغط المنخفض.","UPS and battery autonomy":"UPS وزمن البطاريات","UPS rating for a set of loads and the battery energy for the backup time.":"قدرة UPS لمجموعة أحمال وطاقة البطاريات لزمن الدعم.","Short backup times draw high currents: pick the battery from the maker's constant-power discharge table, not from Ah alone.":"أزمنة الدعم القصيرة تسحب تيارات عالية: اختر البطارية من جدول التفريغ بالقدرة الثابتة للمصنّع، لا من Ah وحدها.","W each":"W لكل حمل","Load power factor":"معامل قدرة الحمل","Future growth":"التوسع المستقبلي","Backup time":"زمن الدعم","Inverter efficiency":"كفاءة العاكس","Battery string voltage":"جهد سلسلة البطاريات","Ageing factor":"معامل التقادم","UPS rating":"قدرة UPS","Battery energy":"طاقة البطاريات","Battery capacity":"سعة البطاريات","UPS loaded to {0} % at design load (sized for {1} % or less).":"تحميل UPS {0} % عند الحمل التصميمي (محجّم لتحميل {1} % أو أقل).","CCTV storage":"تخزين كاميرات المراقبة","Recorder storage and network bandwidth for a set of cameras and a retention period.":"سعة تخزين المسجّل وعرض نطاق الشبكة لمجموعة كاميرات ومدة احتفاظ.","Bit rates vary with scene, frame rate and compression settings. Use the camera maker's calculator for final sizing.":"معدلات البت تختلف حسب المشهد ومعدل الإطارات وإعدادات الضغط. استخدم حاسبة مصنّع الكاميرا للتحجيم النهائي.","Camera type":"نوع الكاميرا","Cameras":"الكاميرات","Mbps each":"Mbps لكل كاميرا","Recording hours per day":"ساعات التسجيل يوميًا","Recording time with motion":"زمن التسجيل مع الحركة","100 % for continuous recording":"100 % للتسجيل المستمر","Retention":"مدة الاحتفاظ","RAID and spare overhead":"إضافة RAID والاحتياطي","Storage needed":"التخزين المطلوب","Video data":"بيانات الفيديو","Total bandwidth":"إجمالي عرض النطاق","Over 700 Mbps: split the recording across several recorders or a 10 Gb network.":"أكثر من 700 Mbps: وزّع التسجيل على عدة مسجّلات أو شبكة 10 Gb.","Bandwidth fits a 1 Gb network.":"عرض النطاق يناسب شبكة 1 Gb.","TB":"TB","Fire alarm battery":"بطاريات إنذار الحريق","Standby battery capacity of a fire alarm panel for the standby and alarm periods.":"سعة بطاريات الاحتياط للوحة إنذار الحريق لفترتي الاستعداد والإنذار.","Take device currents from the panel and device data sheets, for all loops and outputs.":"خذ تيارات الأجهزة من نشرات اللوحة والأجهزة، لكل الدوائر والمخارج.","Standby current":"تيار الاستعداد","Alarm current":"تيار الإنذار","Standby period":"فترة الاستعداد","Alarm period":"فترة الإنذار","5 min (NFPA 72)":"5 min (NFPA 72)","15 min (voice)":"15 min (إخلاء صوتي)","30 min (BS 5839)":"30 min (BS 5839)","Derating factor":"معامل التخفيض","Standard battery":"البطارية القياسية","Standby":"الاستعداد","Alarm":"الإنذار","Two 12 V batteries in series of this size give 24 V.":"بطاريتان 12 V على التوالي بهذا المقاس تعطيان 24 V.","Over 100 Ah: use a separate power supply or split the load.":"أكثر من 100 Ah: استخدم مصدر تغذية منفصلًا أو قسّم الحمل.","Fire alarm circuit voltage drop":"هبوط الجهد في دائرة الإنذار","Voltage at the last sounder or strobe on a notification circuit, at the end-of-life battery voltage.":"الجهد عند آخر جرس أو فلاش في دائرة التنبيه، عند جهد البطارية في نهاية عمرها.","Device minimum voltage is on its listing, often 16 V for 24 V devices.":"أقل جهد للجهاز مذكور في اعتماده، غالبًا 16 V لأجهزة 24 V.","Circuit alarm current":"تيار الدائرة عند الإنذار","Circuit length (one way)":"طول الدائرة (اتجاه واحد)","Load layout":"توزيع الحمل","At the end":"في النهاية","Spread evenly":"موزع بالتساوي","Supply voltage at end of battery life":"جهد التغذية في نهاية عمر البطارية","Minimum device voltage":"أقل جهد للجهاز","Voltage at the last device":"الجهد عند آخر جهاز","Drop":"الهبوط","Maximum length":"أقصى طول","Loop resistance":"مقاومة الدائرة","Last device gets at least {0} V.":"آخر جهاز يحصل على {0} V على الأقل.","Voltage at the last device is too low. Use a larger cable or split the circuit.":"الجهد عند آخر جهاز منخفض جدًا. استخدم كابلًا أكبر أو قسّم الدائرة.","Structured cabling quantities":"كميات الكابلات الهيكلية","Average cable run, number of 305 m boxes, patch panels and switch ports for a floor.":"متوسط طول الكابل وعدد صناديق 305 m ولوحات التوصيل ومنافذ المحوّلات لطابق.","Order whole boxes: offcuts shorter than a run are waste.":"اطلب صناديق كاملة: البواقي الأقصر من مسار واحد هدر.","Data outlets":"مخارج البيانات","Shortest run":"أقصر مسار","Longest run":"أطول مسار","Slack at both ends":"الزيادة عند الطرفين","Spare switch ports":"منافذ محوّل احتياطية","305 m boxes":"صناديق 305 m","Average run":"متوسط المسار","Runs per box":"مسارات لكل صندوق","Total cable":"إجمالي الكابل","24-port patch panels":"لوحات توصيل 24 منفذًا","Switch ports":"منافذ المحوّل","Longest permanent link within 90 m.":"أطول وصلة دائمة ضمن 90 m.","Longest run over 90 m: add a telecom room closer to the outlets.":"أطول مسار أكثر من 90 m: أضف غرفة اتصالات أقرب إلى المخارج.","Grid-tied PV system":"نظام شمسي متصل بالشبكة","PV array size, number of modules and roof area to offset a share of a building's annual energy use.":"حجم المصفوفة الشمسية وعدد الألواح ومساحة السطح لتغطية نسبة من الاستهلاك السنوي للمبنى.","Dust is heavy in the Gulf: plan for regular cleaning or reduce the performance ratio.":"الغبار كثيف في الخليج: خطط لتنظيف منتظم أو خفّض نسبة الأداء.","Check the utility's rules on export and system size before design.":"راجع أنظمة شركة الكهرباء بشأن التصدير وحجم النظام قبل التصميم.","Annual energy use":"الاستهلاك السنوي للطاقة","Share to offset":"النسبة المراد تغطيتها","Peak sun hours":"ساعات الذروة الشمسية","Riyadh and Jeddah about 6":"الرياض وجدة حوالي 6","Performance ratio":"نسبة الأداء","Module rating":"قدرة اللوح","Module area":"مساحة اللوح","Roof area per module area":"مساحة السطح لكل مساحة لوح","Tilted rows need gaps to avoid shading":"الصفوف المائلة تحتاج مسافات لتجنب التظليل","Roof area available":"مساحة السطح المتاحة","Array size":"حجم المصفوفة","Modules":"الألواح","Annual yield":"الإنتاج السنوي","Share of use offset":"نسبة الاستهلاك المغطاة","Roof area used":"مساحة السطح المستخدمة","Inverter AC rating (DC/AC 1.2)":"قدرة العاكس AC (DC/AC 1.2)","Roof too small for the target: {0} modules fit.":"السطح أصغر من الهدف: يتسع لـ {0} لوحًا.","Target fits on the roof.":"الهدف يتسع على السطح.","Off-grid battery and PV":"بطاريات وألواح نظام منفصل","Battery bank and PV array for an off-grid load with days of autonomy.":"بنك البطاريات والمصفوفة الشمسية لحمل منفصل عن الشبكة مع أيام اكتفاء.","Lead-acid batteries last longer at 30–50 % depth of discharge; LFP tolerates 80–90 %.":"بطاريات الرصاص الحمضية تعيش أطول عند عمق تفريغ 30–50 %؛ وتتحمل LFP نسبة 80–90 %.","Daily energy use":"الاستهلاك اليومي للطاقة","Days of autonomy":"أيام الاكتفاء","Battery type and depth of discharge":"نوع البطارية وعمق التفريغ","Lithium (LFP), 90 %":"ليثيوم (LFP)، 90 %","Lead-acid, 50 %":"رصاص حمضي، 50 %","System voltage":"جهد النظام","Temperature factor":"معامل الحرارة","Peak sun hours (worst month)":"ساعات الذروة الشمسية (أسوأ شهر)","System losses factor":"معامل فواقد النظام","PV array":"المصفوفة الشمسية","Charge controller current":"تيار منظم الشحن","Daily energy from the battery":"الطاقة اليومية من البطاريات","Over 3 kWh per day: a 48 V system keeps currents and cable sizes down.":"أكثر من 3 kWh يوميًا: نظام 48 V يخفض التيارات ومقاطع الكابلات.","System voltage suits the load.":"جهد النظام يناسب الحمل.","PV string sizing":"تحجيم سلاسل الألواح","Minimum and maximum modules per string for an inverter, corrected for the coldest and hottest cell temperatures.":"أقل وأكثر عدد ألواح في السلسلة للعاكس، مصححًا لأبرد وأسخن درجة حرارة للخلايا.","Cell temperature in the Gulf summer often exceeds 70 °C. The lowest cell temperature is about the lowest ambient at dawn.":"حرارة الخلايا في صيف الخليج تتجاوز غالبًا 70 °C. أقل حرارة للخلايا تقارب أقل حرارة جو عند الفجر.","Module":"اللوح","Open-circuit voltage Voc":"جهد الدائرة المفتوحة Voc","Maximum-power voltage Vmp":"جهد القدرة القصوى Vmp","Short-circuit current Isc":"تيار القصر Isc","Voc temperature coefficient":"معامل حرارة Voc","Vmp temperature coefficient":"معامل حرارة Vmp","Site":"الموقع","Lowest cell temperature":"أقل حرارة للخلايا","Highest cell temperature":"أعلى حرارة للخلايا","Inverter":"العاكس","Maximum DC voltage":"أقصى جهد DC","MPPT range, low":"نطاق MPPT، الأدنى","MPPT range, high":"نطاق MPPT، الأعلى","Maximum input current per MPPT":"أقصى تيار دخل لكل MPPT","Modules per string chosen":"عدد الألواح المختار في السلسلة","Maximum modules per string":"أقصى عدد ألواح في السلسلة","Minimum modules per string":"أقل عدد ألواح في السلسلة","Strings per MPPT":"السلاسل لكل MPPT","String Voc when cold":"Voc للسلسلة في البرد","String Vmp when hot":"Vmp للسلسلة في الحر","String Vmp when cold":"Vmp للسلسلة في البرد","Cold open-circuit voltage within the inverter maximum.":"جهد الدائرة المفتوحة في البرد ضمن حد العاكس.","Cold open-circuit voltage exceeds the inverter maximum.":"جهد الدائرة المفتوحة في البرد يتجاوز حد العاكس.","Hot operating voltage stays above the MPPT minimum.":"جهد التشغيل في الحر يبقى فوق أدنى MPPT.","Hot operating voltage drops below the MPPT range.":"جهد التشغيل في الحر ينخفض تحت نطاق MPPT.","Cold operating voltage within the MPPT range.":"جهد التشغيل في البرد ضمن نطاق MPPT.","Cold operating voltage above the MPPT range.":"جهد التشغيل في البرد فوق نطاق MPPT.","Solar payback":"استرداد تكلفة النظام الشمسي","Simple payback, lifetime savings and cost of energy of a PV system.":"فترة الاسترداد البسيطة والوفر خلال العمر وتكلفة الطاقة لنظام شمسي.","Money values are in any one currency. Discounting is not applied.":"القيم المالية بأي عملة واحدة. لا يُطبَّق الخصم.","System size":"حجم النظام","Specific yield":"الإنتاج النوعي","Installed cost per kWp":"تكلفة التركيب لكل kWp","Electricity tariff per kWh":"تعرفة الكهرباء لكل kWh","Operation and maintenance":"التشغيل والصيانة","Yearly degradation":"التدهور السنوي","Tariff increase per year":"زيادة التعرفة سنويًا","System life":"عمر النظام","Simple payback":"فترة الاسترداد البسيطة","Net savings over life":"صافي الوفر خلال العمر","Cost of energy":"تكلفة الطاقة","Installed cost":"تكلفة التركيب","First-year energy":"طاقة السنة الأولى","The system does not pay back within its life.":"النظام لا يسترد تكلفته خلال عمره.","Pays back in under 8 years.":"يسترد تكلفته في أقل من 8 سنوات.","Payback over 8 years.":"فترة الاسترداد أكثر من 8 سنوات.","Year":"السنة","Saving":"الوفر","Cumulative":"التراكمي","Building energy use intensity":"كثافة استهلاك الطاقة في المبنى","Annual energy use per square metre by end use, with carbon and cost, compared with a typical value for the building type.":"الاستهلاك السنوي للطاقة لكل متر مربع حسب الاستخدام، مع الكربون والتكلفة، مقارنة بقيمة نموذجية لنوع المبنى.","Typical values are rough figures for hot-climate buildings. Compare with your own portfolio or local benchmarks.":"القيم النموذجية تقريبية لمباني المناخ الحار. قارن بمبانيك أو بالمرجعيات المحلية.","Retail":"تجاري","Gross floor area":"المساحة الإجمالية للطوابق","End use":"الاستخدام النهائي","Cooling":"التبريد","Equipment and plug loads":"المعدات والمقابس","Fans and pumps":"المراوح والمضخات","Hot water":"المياه الساخنة","Grid emission factor":"معامل انبعاثات الشبكة","Tariff per kWh":"التعرفة لكل kWh","Energy use intensity":"كثافة استهلاك الطاقة","Typical for the type":"النموذجي لهذا النوع","Annual energy":"الطاقة السنوية","Carbon":"الكربون","Energy cost":"تكلفة الطاقة","At or below the typical value for this building type.":"عند القيمة النموذجية لهذا النوع أو أقل.","Above the typical value: review cooling and lighting first.":"أعلى من القيمة النموذجية: راجع التبريد والإنارة أولًا.","Embodied carbon":"الكربون المتجسد","Cradle-to-gate embodied carbon of the main materials, total and per square metre of floor area.":"الكربون المتجسد من المهد إلى بوابة المصنع للمواد الرئيسية، الإجمالي ولكل متر مربع من المساحة.","Factors are typical A1–A3 values. Use the product EPD where you have it.":"المعاملات قيم نموذجية للمراحل A1–A3. استخدم إعلان المنتج البيئي EPD إن توفر.","Transport, construction, use and end of life (A4–C4) are not included.":"النقل والتنفيذ والاستخدام ونهاية العمر (A4–C4) غير مشمولة.","Concrete C30/37 (m³)":"خرسانة C30/37 (m³)","Concrete C40/50 (m³)":"خرسانة C40/50 (m³)","Concrete C30/37 with 30 % GGBS or fly ash (m³)":"خرسانة C30/37 مع 30 % خبث أو رماد متطاير (m³)","Reinforcing steel (t)":"حديد تسليح (t)","Structural steel sections (t)":"قطاعات حديد إنشائي (t)","Aluminium, typical recycled content (t)":"ألمنيوم بمحتوى معاد تدويره نموذجي (t)","Float glass (t)":"زجاج مسطح (t)","Clay brick (t)":"طوب طيني (t)","Concrete block (t)":"بلوك خرساني (t)","Cement mortar (t)":"مونة إسمنتية (t)","Gypsum board (t)":"ألواح جبسية (t)","EPS insulation (t)":"عزل EPS (t)","Mineral wool (t)":"صوف معدني (t)","Ceramic tiles (t)":"بلاط سيراميك (t)","Copper (t)":"نحاس (t)","PVC pipe (t)":"مواسير PVC (t)","Aggregates (t)":"ركام (t)","kg CO₂e per unit":"kg CO₂e لكل وحدة","Per floor area":"لكل متر مربع","Within the target.":"ضمن الهدف.","Above the target. The largest items in the table give the biggest savings.":"أعلى من الهدف. أكبر البنود في الجدول تعطي أكبر وفر.","Indoor water use reduction":"خفض استهلاك المياه الداخلي","Annual indoor water use of the design fixtures against the LEED baseline, with the points it earns.":"الاستهلاك السنوي للمياه الداخلية للأجهزة التصميمية مقارنة بخط الأساس في LEED، مع النقاط المستحقة.","Baseline: WC 6.0 L, urinal 3.8 L, public lavatory 1.9 L/min, kitchen sink 8.3 L/min, shower 9.5 L/min.":"خط الأساس: المرحاض 6.0 L، المبولة 3.8 L، مغسلة عامة 1.9 L/min، حوض المطبخ 8.3 L/min، الدش 9.5 L/min.","Full-time occupants":"شاغلو الدوام الكامل","Working days per year":"أيام العمل سنويًا","Urinals installed":"توجد مباول","Yes":"نعم","Design fixtures":"الأجهزة التصميمية","Lavatory tap":"صنبور المغسلة","Reduction":"نسبة الخفض","LEED points":"نقاط LEED","Baseline use":"استهلاك خط الأساس","Design use":"الاستهلاك التصميمي","Meets the 20 % prerequisite.":"يحقق المتطلب الأساسي 20 %.","Below the 20 % prerequisite.":"أقل من المتطلب الأساسي 20 %.","Baseline L/d":"خط الأساس L/d","Design L/d":"التصميمي L/d","Recycled content":"المحتوى المعاد تدويره","Recycled content value of the materials as a share of their total cost.":"قيمة المحتوى المعاد تدويره في المواد كنسبة من تكلفتها الإجمالية.","Use the recycled content stated by the manufacturer, by weight.":"استخدم المحتوى المعاد تدويره الذي يعلنه المصنّع، بالوزن.","Material cost":"تكلفة المادة","Post-consumer %":"بعد الاستهلاك %","Pre-consumer %":"قبل الاستهلاك %","Recycled content value":"قيمة المحتوى المعاد تدويره","Total materials cost":"إجمالي تكلفة المواد","Meets the target.":"يحقق الهدف.","Below the target.":"أقل من الهدف.","Cost":"التكلفة","Rainwater harvesting":"حصاد مياه الأمطار","Annual rainwater collected from a roof, the share of a non-potable demand it covers, and the tank for a design storm.":"مياه الأمطار السنوية المجمعة من سطح، ونسبة ما تغطيه من طلب غير صالح للشرب، والخزان لعاصفة تصميمية.","In dry climates rain falls in a few storms: size the tank on a storm, not on the monthly average.":"في المناخ الجاف تهطل الأمطار في عواصف قليلة: حجّم الخزان على عاصفة، لا على المتوسط الشهري.","AC condensate is often a larger and steadier source in the Gulf.":"مياه تكثيف المكيفات غالبًا مصدر أكبر وأثبت في الخليج.","Annual rainfall":"الهطول السنوي","Riyadh about 100 mm, Abha about 300 mm":"الرياض حوالي 100 mm، أبها حوالي 300 mm","Runoff coefficient":"معامل الجريان","First flush and filter losses":"فواقد الغسيل الأول والفلتر","Non-potable demand":"الطلب غير الصالح للشرب","Design storm":"العاصفة التصميمية","Share of demand met":"نسبة الطلب المغطاة","Tank for the design storm":"الخزان للعاصفة التصميمية","Annual demand":"الطلب السنوي","Rain covers under 10 % of the demand. Condensate or grey water may be a better source.":"الأمطار تغطي أقل من 10 % من الطلب. قد تكون مياه التكثيف أو المياه الرمادية مصدرًا أفضل.","Rainwater makes a useful contribution.":"مياه الأمطار تساهم مساهمة مفيدة.","Peak runoff (rational method)":"الجريان الأقصى (الطريقة المنطقية)","Peak stormwater flow from a site with mixed surfaces for a design rainfall intensity.":"أقصى تدفق لمياه الأمطار من موقع بأسطح مختلفة لشدة مطر تصميمية.","Use the intensity for a storm lasting as long as the time of concentration (SW-02).":"استخدم شدة عاصفة تساوي مدتها زمن التركيز (SW-02).","Surface":"السطح","Asphalt or concrete":"أسفلت أو خرسانة","Interlocking paving":"بلاط متداخل","Gravel":"حصى","Desert sand":"رمل صحراوي","Lawn and planting":"عشب ونباتات","From the local IDF curve for the time of concentration":"من منحنى IDF المحلي لزمن التركيز","Composite C":"C المركب","Over 80 ha: the rational method is less reliable. Use a hydrograph method.":"أكثر من 80 ha: الطريقة المنطقية أقل دقة. استخدم طريقة الهيدروجراف.","Site size suits the rational method.":"حجم الموقع يناسب الطريقة المنطقية.","Time of concentration":"زمن التركيز","Time for runoff to travel from the furthest point of a catchment to the outlet: overland flow (Kerby) plus channel flow (Kirpich).":"زمن انتقال الجريان من أبعد نقطة في الحوض إلى المخرج: الجريان السطحي (Kerby) والجريان في القنوات (Kirpich).","Kerby applies to overland flow up to about 365 m.":"معادلة Kerby للجريان السطحي حتى حوالي 365 m.","Overland flow":"الجريان السطحي","Smooth pavement":"رصف أملس","Bare packed soil":"تربة عارية مدموكة","Poor grass or rough bare soil":"عشب خفيف أو تربة عارية خشنة","Average grass":"عشب متوسط","Dense grass":"عشب كثيف","Channel or pipe flow":"الجريان في القناة أو الماسورة","Channel flow":"الجريان في القناة","Less than 5 minutes: 5 minutes is used as the minimum.":"أقل من 5 دقائق: تُستخدم 5 دقائق كحد أدنى.","Use this duration to read the intensity from the IDF curve.":"استخدم هذه المدة لقراءة الشدة من منحنى IDF.","Detention tank":"خزان الاحتجاز","Storage needed to limit a site's outflow, by the modified rational method over a range of storm durations.":"التخزين اللازم لتحديد التدفق الخارج من الموقع، بالطريقة المنطقية المعدلة لعدة مدد عواصف.","Default intensities are an example only. Enter the local IDF curve for the return period required.":"الشدات الافتراضية مثال فقط. أدخل منحنى IDF المحلي لفترة التكرار المطلوبة.","Catchment area":"مساحة الحوض","Allowed outflow":"التدفق الخارج المسموح","Intensity mm/h":"الشدة mm/h","Critical storm":"العاصفة الحرجة","Peak inflow for that storm":"أقصى تدفق داخل لهذه العاصفة","Largest storage is at the longest duration: add longer durations to the table.":"أكبر تخزين عند أطول مدة: أضف مددًا أطول إلى الجدول.","Critical duration is inside the range given.":"المدة الحرجة داخل النطاق المعطى.","Inflow L/s":"التدفق الداخل L/s","Storage m³":"التخزين m³","Soakaway":"بئر الامتصاص","Check of a rectangular gravel-filled soakaway against a design storm, and its time to half empty.":"فحص بئر امتصاص مستطيل مملوء بالحصى لعاصفة تصميمية، وزمن تفريغ نصفه.","Measure the infiltration rate on site by the BRE 365 test. Repeat for several storm durations.":"قس معدل التسرب في الموقع باختبار BRE 365. كرر الحساب لعدة مدد عواصف.","Area drained":"المساحة المصرّفة","Storm rainfall":"مطر العاصفة","Storm duration":"مدة العاصفة","Pit length":"طول الحفرة","Pit width":"عرض الحفرة","Effective depth":"العمق الفعال","Fill void ratio":"نسبة الفراغات في الحشو","Soil infiltration rate":"معدل تسرب التربة","Storage provided":"التخزين المتوفر","Time to half empty":"زمن تفريغ النصف","Inflow":"التدفق الداخل","Outflow during the storm":"التدفق الخارج أثناء العاصفة","Soakaway holds the storm.":"بئر الامتصاص يستوعب العاصفة.","Soakaway too small for the storm.":"بئر الامتصاص صغير على العاصفة.","Half empties within 24 h.":"يفرغ نصفه خلال 24 h.","Takes over 24 h to half empty.":"يحتاج أكثر من 24 h لتفريغ نصفه.","Septic tank":"خزان التحليل (سبتك)","Septic tank capacity for the number of people served, with suggested internal dimensions.":"سعة خزان التحليل لعدد الأشخاص المخدومين، مع أبعاد داخلية مقترحة.","Use two compartments, the first about two thirds of the length. Empty the sludge at least once a year.":"استخدم حجرتين، الأولى حوالي ثلثي الطول. أفرغ الحمأة مرة سنويًا على الأقل.","People served":"الأشخاص المخدومون","Wastewater per person":"الصرف لكل شخص","Liquid depth":"عمق السائل","Capacity":"السعة","Internal length":"الطول الداخلي","Internal width":"العرض الداخلي","Retention time":"زمن البقاء","At least one day of retention.":"زمن بقاء يوم واحد على الأقل.","Under one day of retention at this flow.":"زمن البقاء أقل من يوم عند هذا التدفق.","Grease interceptor":"مصيدة الشحوم","Grease interceptor volume for a commercial kitchen from meals served in the peak hour.":"حجم مصيدة الشحوم لمطبخ تجاري من عدد الوجبات في ساعة الذروة.","Check the local authority's rules: many set their own minimum size.":"راجع أنظمة الجهة المحلية: كثير منها يحدد حدًا أدنى خاصًا.","Meals in the peak hour":"الوجبات في ساعة الذروة","Kitchen type":"نوع المطبخ","With dishwasher":"مع غسالة أطباق","Without dishwasher":"بدون غسالة أطباق","Single-service kitchen":"مطبخ وجبات أحادية الاستخدام","Commercial kitchen 2.5 h, single service 1.5 h":"المطبخ التجاري 2.5 h، الأحادي 1.5 h","Hours of operation":"ساعات التشغيل","Interceptor volume":"حجم المصيدة","In gallons":"بالجالون","Under 1,000 L: many authorities set this as the minimum for a kitchen.":"أقل من 1,000 L: كثير من الجهات تجعل هذا الحد الأدنى للمطبخ.","Size meets the usual minimum.":"الحجم يحقق الحد الأدنى المعتاد.","Pumping station wet well":"البئر الرطبة لمحطة الضخ","Wet well working volume to limit pump starts, the level band, and the pump power.":"الحجم الفعال للبئر الرطبة لتحديد عدد مرات تشغيل المضخة، ومدى المنسوب، وقدرة المضخة.","Alternating two duty pumps halves the volume needed for the same starts per pump.":"تبديل مضختين عاملتين يخفض الحجم اللازم للنصف لنفس عدد مرات التشغيل لكل مضخة.","Pump flow (peak inflow)":"تدفق المضخة (أقصى تدفق داخل)","Maximum starts per hour":"أقصى عدد تشغيل في الساعة","Wet well diameter":"قطر البئر الرطبة","Total head":"الرفع الكلي","Working volume":"الحجم الفعال","Level band, start to stop":"مدى المنسوب من التشغيل إلى الإيقاف","Pump input power":"قدرة دخل المضخة","Minimum cycle time":"أقل زمن دورة","Level band under 0.5 m: hard to control. Use a smaller well or alternate the pumps.":"مدى المنسوب أقل من 0.5 m: يصعب التحكم. استخدم بئرًا أصغر أو بدّل المضخات.","Level band is workable.":"مدى المنسوب عملي.","Settling tank":"حوض الترسيب","Surface area, diameter and detention time of a circular settling tank from the surface overflow rate.":"المساحة السطحية والقطر وزمن الاحتجاز لحوض ترسيب دائري من معدل الفيضان السطحي.","Check the peak flow against the peak overflow rate as well.":"افحص أيضًا التدفق الأقصى مقابل معدل الفيضان الأقصى.","Surface overflow rate":"معدل الفيضان السطحي","Primary 30–50, secondary 16–28":"ابتدائي 30–50، ثانوي 16–28","Side water depth":"عمق الماء الجانبي","Number of tanks":"عدد الأحواض","Weir loading limit":"حد تحميل الهدار","Diameter of each tank":"قطر كل حوض","Surface area of each tank":"مساحة سطح كل حوض","Detention time":"زمن الاحتجاز","Weir loading":"تحميل الهدار","Volume of each tank":"حجم كل حوض","Detention time within 1.5–4 h.":"زمن الاحتجاز ضمن 1.5–4 h.","Detention time outside 1.5–4 h. Adjust the depth.":"زمن الاحتجاز خارج 1.5–4 h. عدّل العمق.","Weir loading within the limit.":"تحميل الهدار ضمن الحد.","Weir loading above the limit.":"تحميل الهدار أعلى من الحد.","Landscape water demand":"احتياج الري للمسطحات","Peak-day irrigation water need from the reference evapotranspiration and the plant types.":"احتياج مياه الري في يوم الذروة من البخر-نتح المرجعي وأنواع النباتات.","Spray irrigation is about 70 % efficient, drip about 90 %.":"كفاءة الري بالرش حوالي 70 %، والتنقيط حوالي 90 %.","Reference evapotranspiration":"البخر-نتح المرجعي","Riyadh summer about 11–13 mm/d":"صيف الرياض حوالي 11–13 mm/d","Plant type":"نوع النبات","Turf grass":"نجيل","Shrubs":"شجيرات","Trees":"أشجار","Date palms":"نخيل","Ground cover":"مغطيات تربة","Desert planting":"نباتات صحراوية","Kc":"Kc","Efficiency %":"الكفاءة %","Peak-day water":"مياه يوم الذروة","Average depth":"متوسط العمق","Peak month":"شهر الذروة","Turf uses the most water per square metre: limit it where possible.":"النجيل يستهلك أكثر مياه لكل متر مربع: قلّله قدر الإمكان.","L/d":"L/d","Drip irrigation zones":"مناطق الري بالتنقيط","Run time of a drip zone, its flow and how many zones the pump can serve in the watering window.":"زمن تشغيل منطقة التنقيط وتدفقها وعدد المناطق التي تخدمها المضخة في فترة الري.","Water at night in summer to cut evaporation.":"اسقِ ليلًا في الصيف لتقليل التبخر.","Plants in the area":"عدد النباتات","Water per plant":"المياه لكل نبتة","Emitters per plant":"النقاطات لكل نبتة","Emitter flow":"تدفق النقاط","Pump flow":"تدفق المضخة","Watering window":"فترة الري","Run time":"زمن التشغيل","Zones needed":"المناطق اللازمة","Plants per zone":"النباتات لكل منطقة","Total watering time":"إجمالي زمن الري","Flow if all on at once":"التدفق لو شُغّلت كلها معًا","All zones fit in the watering window.":"كل المناطق تتسع في فترة الري.","Zones do not fit in the window. Use a larger pump or more emitters.":"المناطق لا تتسع في الفترة. استخدم مضخة أكبر أو نقاطات أكثر.","Irrigation tank and pump":"خزان ومضخة الري","Storage tank volume and pump motor for an irrigation demand.":"حجم خزان التخزين ومحرك المضخة لاحتياج ري.","Treated sewage effluent needs a filter and a separate, marked pipework system.":"مياه الصرف المعالجة تحتاج فلترًا وشبكة مواسير منفصلة ومميزة.","Tank volume":"حجم الخزان","Motor":"المحرك","Allow for a dead volume below the suction and a freeboard above the top level.":"اترك حجمًا ميتًا تحت السحب وارتفاعًا حرًا فوق أعلى منسوب.","Stopping sight distance":"مسافة الرؤية للتوقف","Distance a driver needs to see ahead to stop, for a design speed and grade.":"المسافة التي يحتاج السائق رؤيتها أمامه ليتوقف، لسرعة تصميمية وميل معينين.","On level roads AASHTO rounds up, for example 130 m at 80 km/h.":"على الطرق المستوية تقرّب AASHTO للأعلى، مثلًا 130 m عند 80 km/h.","Design speed":"السرعة التصميمية","Brake reaction time":"زمن رد الفعل للفرملة","Deceleration":"التباطؤ","Grade (+ up, − down)":"الميل (+ صعود، − نزول)","Reaction distance":"مسافة رد الفعل","Braking distance":"مسافة الفرملة","Steep downgrade: braking distance grows quickly.":"نزول حاد: مسافة الفرملة تزيد بسرعة.","Provide this distance along the whole road, including curves and crests.":"وفّر هذه المسافة على طول الطريق، بما فيه المنحنيات والقمم.","Horizontal curve":"المنحنى الأفقي","Minimum radius for a design speed, and the setting-out elements of a circular curve.":"أقل نصف قطر لسرعة تصميمية، وعناصر توقيع المنحنى الدائري.","Side friction factors are the AASHTO values for high-speed roads.":"معاملات الاحتكاك الجانبي هي قيم AASHTO للطرق السريعة.","Maximum superelevation":"أقصى ميل عرضي","Radius used":"نصف القطر المستخدم","Deflection angle":"زاوية الانحراف","Minimum radius":"أقل نصف قطر","Curve length":"طول المنحنى","Tangent length":"طول المماس","External distance":"المسافة الخارجية","Middle ordinate":"الإحداثي الأوسط","Long chord":"الوتر الطويل","Side friction factor":"معامل الاحتكاك الجانبي","Radius meets the minimum for the speed.":"نصف القطر يحقق الحد الأدنى للسرعة.","Radius below the minimum for the speed.":"نصف القطر أقل من الحد الأدنى للسرعة.","Needs more superelevation than allowed.":"يحتاج ميلًا عرضيًا أكبر من المسموح.","Superelevation within the maximum.":"الميل العرضي ضمن الحد الأقصى.","Vertical curve":"المنحنى الرأسي","Minimum length of a crest or sag curve for stopping sight distance, and the high or low point of the curve used.":"أقل طول لمنحنى قمة أو قاع لمسافة الرؤية للتوقف، وأعلى أو أدنى نقطة في المنحنى المستخدم.","SSD uses 2.5 s reaction and 3.4 m/s² on a level road.":"مسافة التوقف بزمن رد فعل 2.5 s وتباطؤ 3.4 m/s² على طريق مستوٍ.","Grade in":"الميل الداخل","Grade out":"الميل الخارج","Curve length used":"طول المنحنى المستخدم","PVI chainage":"محطة نقطة التقاطع PVI","PVI level":"منسوب نقطة التقاطع PVI","Minimum length":"أقل طول","K value used":"قيمة K المستخدمة","High point chainage":"محطة أعلى نقطة","High point level":"منسوب أعلى نقطة","Low point chainage":"محطة أدنى نقطة","Low point level":"منسوب أدنى نقطة","Curve start chainage":"محطة بداية المنحنى","Curve start level":"منسوب بداية المنحنى","Length meets the sight distance.":"الطول يحقق مسافة الرؤية.","Curve too short for the sight distance.":"المنحنى أقصر من اللازم لمسافة الرؤية.","Crest curve.":"منحنى قمة.","Sag curve (headlight sight distance).":"منحنى قاع (مسافة رؤية المصابيح).","Flexible pavement thickness":"سماكة الرصف المرن","Structural number for the design traffic by the AASHTO 1993 method, and the asphalt thickness over the base and subbase given.":"الرقم الإنشائي لحركة المرور التصميمية بطريقة AASHTO 1993، وسماكة الأسفلت فوق طبقتي الأساس والأساس المساعد المعطاتين.","M_R is converted to psi inside the formula.":"يُحوَّل M_R إلى psi داخل المعادلة.","Check each layer also protects the layer below (layered design).":"تأكد أن كل طبقة تحمي الطبقة التي تحتها (التصميم الطبقي).","Design traffic":"حركة المرور التصميمية","Reliability":"الاعتمادية","Serviceability loss ΔPSI":"فقد الصلاحية ΔPSI","Subgrade resilient modulus":"معامل المرونة لتربة القاعدة","Roughly 10 × CBR":"تقريبًا 10 × CBR","Layers":"الطبقات","Asphalt coefficient":"معامل الأسفلت","Base coefficient":"معامل الأساس","Subbase thickness":"سماكة الأساس المساعد","Subbase coefficient":"معامل الأساس المساعد","Drainage coefficient":"معامل التصريف","Structural number":"الرقم الإنشائي","Asphalt thickness":"سماكة الأسفلت","Contribution of base and subbase":"مساهمة الأساس والأساس المساعد","Reliability factor ZR":"معامل الاعتمادية ZR","Asphalt under 50 mm: use the practical minimum for the traffic (typically 50–100 mm).":"الأسفلت أقل من 50 mm: استخدم الحد الأدنى العملي للمرور (عادة 50–100 mm).","Asphalt thickness found.":"تم إيجاد سماكة الأسفلت.","Design traffic (ESAL)":"حركة المرور التصميمية (ESAL)","Equivalent single axle loads over the design life from the daily truck traffic.":"أحمال المحور المفرد المكافئة خلال العمر التصميمي من حركة الشاحنات اليومية.","Lane share: 100 % for one lane each way, about 80–100 % for two lanes, 60–80 % for three.":"نسبة الحارة: 100 % لحارة واحدة في كل اتجاه، حوالي 80–100 % لحارتين، 60–80 % لثلاث.","Average daily traffic":"متوسط المرور اليومي","Trucks":"الشاحنات","Truck factor":"معامل الشاحنة","Directional split":"التوزيع الاتجاهي","Design lane share":"نسبة حارة التصميم","Annual growth":"النمو السنوي","Design life":"العمر التصميمي","Design ESAL":"ESAL التصميمي","Growth factor":"معامل النمو","First-year ESAL":"ESAL للسنة الأولى","Use this as the design traffic in RD-04.":"استخدم هذا كحركة المرور التصميمية في RD-04.","Area from coordinates":"المساحة من الإحداثيات","Area and perimeter of a plot from the coordinates of its corners, by the shoelace formula.":"مساحة ومحيط قطعة أرض من إحداثيات أركانها، بطريقة رباط الحذاء.","Coordinates must be on a plane grid such as UTM, in metres.":"يجب أن تكون الإحداثيات على شبكة مستوية مثل UTM، بالمتر.","Easting":"الشرقيات","Northing":"الشماليات","Perimeter":"المحيط","Corners":"الأركان","At least three corners are needed.":"يلزم ثلاثة أركان على الأقل.","Enter the corners in order around the boundary.":"أدخل الأركان بالترتيب حول الحدود.","Side to next m":"الضلع إلى التالي m","Traverse closure (Bowditch)":"قفل المضلع (Bowditch)","Misclosure and precision of a closed traverse, and corrected coordinates by the Bowditch rule.":"خطأ القفل ودقة مضلع مغلق، والإحداثيات المصححة بقاعدة Bowditch.","Bearings are whole-circle bearings in decimal degrees, already corrected for angular misclosure.":"الانحرافات دائرية كاملة بالدرجات العشرية، ومصححة مسبقًا من خطأ القفل الزاوي.","Start easting":"شرقيات البداية","Start northing":"شماليات البداية","Bearing °":"الانحراف °","Distance m":"المسافة m","Linear misclosure":"خطأ القفل الطولي","Precision 1 in":"الدقة 1 إلى","Misclosure in easting":"خطأ القفل في الشرقيات","Misclosure in northing":"خطأ القفل في الشماليات","Precision worse than 1 in 5,000: check the field readings.":"الدقة أسوأ من 1 إلى 5,000: راجع القراءات الحقلية.","Precision acceptable for most engineering surveys.":"الدقة مقبولة لمعظم أعمال المساحة الهندسية.","Leg":"الضلع","Corrected E":"E المصحح","Corrected N":"N المصحح","Level book (rise and fall)":"دفتر الميزانية (الارتفاع والانخفاض)","Reduced levels from backsight, intermediate and foresight readings, with the arithmetic check.":"المناسيب المختزلة من القراءات الخلفية والمتوسطة والأمامية، مع التحقق الحسابي.","Leave a cell at 0 when there is no reading. A change point has both a FS and a BS on the same row.":"اترك الخانة 0 عند عدم وجود قراءة. نقطة الدوران لها قراءة أمامية وخلفية في نفس السطر.","Starting level (benchmark)":"منسوب البداية (الروبير)","Last reduced level":"آخر منسوب مختزل","Σ BS − Σ FS":"Σ BS − Σ FS","Σ rise − Σ fall":"Σ الارتفاع − Σ الانخفاض","Last − first level":"آخر منسوب − أول منسوب","Arithmetic check agrees.":"التحقق الحسابي متطابق.","Arithmetic check fails: a reading is missing or in the wrong column.":"التحقق الحسابي غير متطابق: قراءة ناقصة أو في عمود خاطئ.","Point":"النقطة","Rise":"ارتفاع","Fall":"انخفاض","RL":"المنسوب","Cut and fill volumes":"كميات الحفر والردم","Cut and fill between cross-sections by the average end area method, with bulking of cut material.":"الحفر والردم بين القطاعات العرضية بطريقة متوسط المساحتين، مع انتفاش مواد الحفر.","The prismoidal formula gives slightly smaller volumes where areas change quickly.":"معادلة المنشور تعطي كميات أقل قليلًا حيث تتغير المساحات بسرعة.","Chainage m":"المحطة m","Cut m²":"الحفر m²","Fill m²":"الردم m²","Bulking factor of cut":"معامل انتفاش الحفر","Compaction factor of fill":"معامل دمك الردم","Cut":"الحفر","Fill":"الردم","Surplus (compacted)":"الفائض (مدموك)","Import needed (compacted)":"المطلوب توريده (مدموك)","Cut as loose volume for haulage":"الحفر كحجم منفوش للنقل","Cut is enough to make the fill.":"الحفر يكفي لعمل الردم.","Not enough cut: material must be imported.":"الحفر غير كافٍ: يجب توريد مواد.","Between chainages":"بين المحطات","Cut m³":"الحفر m³","Fill m³":"الردم m³","Bench blast design":"تصميم تفجير المدرجات","Burden, spacing, stemming, subdrill and powder factor of a bench blast from the hole diameter.":"الحمل والتباعد والحشو والحفر الإضافي ومعامل المتفجرات لتفجير مدرج من قطر الثقب.","Adjust after trial blasts and keep within the site's vibration and flyrock limits.":"عدّل بعد تفجيرات تجريبية والتزم بحدود الاهتزاز والحجارة المتطايرة في الموقع.","Hole diameter":"قطر الثقب","Bench height":"ارتفاع المدرج","Explosive density":"كثافة المتفجر","ANFO 0.85, emulsion 1.15":"ANFO 0.85، المستحلب 1.15","Rock density":"كثافة الصخر","Spacing ÷ burden":"التباعد ÷ الحمل","Burden":"الحمل","Powder factor":"معامل المتفجرات","Stemming":"الحشو","Subdrill":"الحفر الإضافي","Charge per hole":"الشحنة لكل ثقب","Rock volume per hole":"حجم الصخر لكل ثقب","Rock mass per hole":"كتلة الصخر لكل ثقب","Bench height under twice the burden: expect poor fragmentation. Use a smaller hole.":"ارتفاع المدرج أقل من ضعف الحمل: توقّع تفتيتًا ضعيفًا. استخدم ثقبًا أصغر.","Bench height suits the burden.":"ارتفاع المدرج يناسب الحمل.","Haul truck fleet":"أسطول شاحنات النقل","Truck cycle time, trucks needed for a production target and the match with the loading unit.":"زمن دورة الشاحنة، والشاحنات اللازمة لهدف إنتاج، والتوافق مع وحدة التحميل.","Speeds should come from rimpull curves for the grade and rolling resistance of the haul road.":"يجب أخذ السرعات من منحنيات قوة الجر لميل طريق النقل ومقاومة الدحرجة.","Production target":"هدف الإنتاج","Truck payload":"حمولة الشاحنة","Loading time":"زمن التحميل","Haul distance (one way)":"مسافة النقل (اتجاه واحد)","Loaded speed":"السرعة محمّلة","Empty speed":"السرعة فارغة","Dump and spot time":"زمن التفريغ والتموضع","Working minutes per hour":"دقائق العمل في الساعة","Trucks needed":"الشاحنات اللازمة","Cycle time":"زمن الدورة","Output per truck":"إنتاج الشاحنة","Fleet output":"إنتاج الأسطول","Match factor":"معامل التوافق","Match factor under 0.9: the loader waits for trucks.":"معامل التوافق أقل من 0.9: المحمّل ينتظر الشاحنات.","Match factor over 1.1: trucks queue at the loader.":"معامل التوافق أكثر من 1.1: الشاحنات تصطف عند المحمّل.","Trucks and loader are well matched.":"الشاحنات والمحمّل متوافقان.","Underground mine ventilation":"تهوية المناجم تحت الأرض","Airflow needed for diesel equipment and people, airway velocity, Atkinson pressure loss and fan power.":"تدفق الهواء اللازم لمعدات الديزل والأشخاص، وسرعة الممر الهوائي، وفقد الضغط بمعادلة Atkinson، وقدرة المروحة.","Air per kW varies by jurisdiction, commonly 0.05–0.08 m³/s. Use the rule that applies to the mine.":"الهواء لكل kW يختلف حسب الجهة، غالبًا 0.05–0.08 m³/s. استخدم النظام المطبق على المنجم.","Diesel engine power in use":"قدرة محركات الديزل العاملة","Air per kW of diesel":"الهواء لكل kW ديزل","People underground":"الأشخاص تحت الأرض","Air per person":"الهواء لكل شخص","Airway":"الممر الهوائي","Cross-section area":"مساحة المقطع","Friction factor":"معامل الاحتكاك","Smooth lined 0.004, rough rock 0.012–0.015":"مبطّن أملس 0.004، صخر خشن 0.012–0.015","Airflow needed":"تدفق الهواء اللازم","Airway velocity":"سرعة الممر الهوائي","Fan input power":"قدرة دخل المروحة","Airway resistance":"مقاومة الممر الهوائي","Velocity under 0.25 m/s: air will not be well mixed.":"السرعة أقل من 0.25 m/s: لن يختلط الهواء جيدًا.","Velocity over 6 m/s: dust and discomfort in travelways.":"السرعة أكثر من 6 m/s: غبار وانزعاج في ممرات المشي.","Velocity within 0.25–6 m/s.":"السرعة ضمن 0.25–6 m/s.","Tonnage, grade and strip ratio":"الحمولة والتركيز ونسبة الإزالة","Ore tonnage, average grade and contained metal of blocks above a cut-off grade, with the strip ratio.":"حمولة الخام ومتوسط التركيز والمعدن المحتوى للبلوكات فوق تركيز الحد، مع نسبة الإزالة.","Public reporting of resources and reserves must be signed off by a Competent Person.":"الإفصاح العام عن الموارد والاحتياطيات يجب أن يعتمده شخص مؤهل.","Grade unit":"وحدة التركيز","g/t (gold, silver)":"g/t (ذهب، فضة)","% (copper, zinc, iron)":"% (نحاس، زنك، حديد)","Cut-off grade":"تركيز الحد","Volume m³":"الحجم m³","Density t/m³":"الكثافة t/m³","Grade":"التركيز","Ore tonnage":"حمولة الخام","Average grade":"متوسط التركيز","Contained metal":"المعدن المحتوى","Waste tonnage":"حمولة النفايات الصخرية","Strip ratio (waste ÷ ore)":"نسبة الإزالة (نفايات ÷ خام)","Blocks at or above the cut-off are counted as ore.":"البلوكات عند تركيز الحد أو أعلى تُحسب خامًا.","No block reaches the cut-off grade.":"لا يصل أي بلوك إلى تركيز الحد.","Tonnes":"الأطنان","Class":"التصنيف","Ore":"خام","Waste":"نفايات","Break-even and marginal cut-off grades from the metal price, recovery and costs.":"تركيز الحد عند التعادل والحدّي من سعر المعدن والاستخلاص والتكاليف.","Prices and costs in any one currency.":"الأسعار والتكاليف بأي عملة واحدة.","Metal price":"سعر المعدن","Selling and refining cost":"تكلفة البيع والتكرير","Process recovery":"نسبة الاستخلاص","Mining cost":"تكلفة التعدين","Processing cost":"تكلفة المعالجة","General and admin cost":"التكاليف العامة والإدارية","Break-even cut-off":"تركيز الحد عند التعادل","Marginal cut-off":"تركيز الحد الحدّي","Value of one grade unit per tonne":"قيمة وحدة تركيز واحدة لكل طن","Marginal cut-off applies to rock that must be mined anyway; break-even to rock mined only for its value.":"تركيز الحد الحدّي للصخر الذي سيُعدَّن على أي حال؛ وتركيز التعادل للصخر الذي يُعدَّن لقيمته فقط.","Bored pile capacity":"قدرة تحمل الخازوق المحفور","Shaft and base resistance of a single bored pile in layered clay and sand, and its allowable load.":"مقاومة الجذع والقاعدة لخازوق محفور منفرد في طبقات طين ورمل، وحمله المسموح.","Layers run from the ground surface down; the pile toe is at the bottom of the last layer.":"الطبقات من سطح الأرض للأسفل؛ وقاعدة الخازوق في أسفل آخر طبقة.","Confirm the design capacity by a pile load test.":"أكّد القدرة التصميمية باختبار تحميل للخازوق.","Pile diameter":"قطر الخازوق","Clay":"طين","Thickness m":"السماكة m","cu kPa (clay)":"cu kPa (طين)","N60 (sand)":"N60 (رمل)","γ′ kN/m³":"γ′ kN/m³","Ultimate capacity":"القدرة القصوى","Shaft resistance":"مقاومة الجذع","Base resistance":"مقاومة القاعدة","Pile length":"طول الخازوق","Base carries more than the shaft: base resistance needs larger settlement to mobilise.":"القاعدة تحمل أكثر من الجذع: مقاومة القاعدة تحتاج هبوطًا أكبر لتتفعل.","Shaft carries most of the load.":"الجذع يحمل معظم الحمل.","Unit shaft kPa":"مقاومة الجذع kPa","Shaft kN":"الجذع kN","Pile group capacity":"قدرة مجموعة الخوازيق","Capacity of a rectangular pile group by the Converse–Labarre efficiency, and the block failure check in clay.":"قدرة مجموعة خوازيق مستطيلة بكفاءة Converse–Labarre، وفحص انهيار الكتلة في الطين.","In sand the group efficiency is usually taken as 1 for driven piles.":"في الرمل تؤخذ كفاءة المجموعة عادةً 1 للخوازيق المدقوقة.","Piles in each row":"الخوازيق في كل صف","Rows":"الصفوف","Pile spacing":"تباعد الخوازيق","Ultimate capacity of one pile":"القدرة القصوى لخازوق واحد","Average cu along the piles":"متوسط cu على طول الخوازيق","cu at the pile toe":"cu عند قاعدة الخازوق","Allowable group load":"الحمل المسموح للمجموعة","Group efficiency":"كفاءة المجموعة","Group capacity by efficiency":"قدرة المجموعة بالكفاءة","Block failure capacity":"قدرة انهيار الكتلة","Spacing ÷ diameter":"التباعد ÷ القطر","Spacing under 2.5 diameters.":"التباعد أقل من 2.5 قطر.","Spacing at least 2.5 diameters.":"التباعد 2.5 قطر على الأقل.","Block failure governs.":"انهيار الكتلة هو الحاكم.","Individual pile failure governs.":"انهيار الخازوق المنفرد هو الحاكم.","Pile cap layout and pile loads":"توزيع الخوازيق تحت الهامة وأحمالها","Number of piles under a column, a rectangular layout and the load on each pile with moments.":"عدد الخوازيق تحت عمود، وتوزيع مستطيل، والحمل على كل خازوق مع العزوم.","Design the cap for bending, shear and punching under the factored loads.":"صمم الهامة للانحناء والقص والقص الثاقب تحت الأحمال المصعّدة.","Column load (service)":"حمل العمود (التشغيلي)","Moment about x":"العزم حول x","Moment about y":"العزم حول y","Allowable load per pile":"الحمل المسموح لكل خازوق","Cap self-weight allowance":"إضافة الوزن الذاتي للهامة","Piles":"الخوازيق","Maximum pile load":"أقصى حمل على خازوق","Minimum pile load":"أقل حمل على خازوق","Cap length":"طول الهامة","Cap width":"عرض الهامة","Most loaded pile within the allowable load.":"أكثر الخوازيق تحميلًا ضمن الحمل المسموح.","Most loaded pile exceeds the allowable load. Add piles or increase spacing.":"أكثر الخوازيق تحميلًا يتجاوز الحمل المسموح. أضف خوازيق أو زد التباعد.","A pile is in tension: check uplift capacity and reinforcement.":"يوجد خازوق في شد: افحص مقاومة الاقتلاع والتسليح.","No pile in tension.":"لا يوجد خازوق في شد.","Blockwork and mortar":"البلوك والمونة","Number of blocks, mortar volume, cement bags and sand for a wall.":"عدد البلوكات وحجم المونة وأكياس الإسمنت والرمل لجدار.","Add separately for lintels, bond beams and cutting at corners.":"أضف بشكل منفصل للأعتاب والميد والقص عند الأركان.","Wall length":"طول الجدار","Wall height":"ارتفاع الجدار","Openings":"الفتحات","Unit":"الوحدة","Clay brick 215 × 65 × 102.5":"طوب طيني 215 × 65 × 102.5","Joint thickness":"سماكة العراميس","Mortar mix (cement : sand)":"خلطة المونة (إسمنت : رمل)","Units":"الوحدات","Mortar":"المونة","Net wall area":"صافي مساحة الجدار","Units per m²":"الوحدات لكل m²","Hollow blocks take mortar in the bed and head joints only; the figure assumes solid joints.":"البلوك المفرغ يأخذ المونة في العراميس الأفقية والرأسية فقط؛ والرقم يفترض عراميس مصمتة.","Plaster and paint":"اللياسة والدهان","Cement, sand and paint quantities for plastering and painting an area.":"كميات الإسمنت والرمل والدهان للياسة ودهان مساحة.","Rough or absorbent walls take more paint than the label coverage.":"الجدران الخشنة أو الماصة تأخذ دهانًا أكثر من التغطية المكتوبة.","Plaster thickness":"سماكة اللياسة","Plaster mix (cement : sand)":"خلطة اللياسة (إسمنت : رمل)","Paint":"الدهان","Coats":"الطبقات","Coverage per coat":"التغطية لكل طبقة","Primer coverage":"تغطية البرايمر","Primer":"البرايمر","Wet plaster volume":"حجم اللياسة الرطبة","Plaster over 20 mm should be applied in two coats.":"اللياسة أكثر من 20 mm تُنفذ على طبقتين.","Thickness suits a single coat.":"السماكة تناسب طبقة واحدة.","Tiling quantities":"كميات البلاط","Tiles, boxes, adhesive and grout for a floor or wall.":"البلاط والكراتين واللاصق والترويب لأرضية أو جدار.","Grout assumes a 10 mm deep joint and 1.6 kg/L density.":"الترويب بافتراض عمق فاصل 10 mm وكثافة 1.6 kg/L.","Tile length":"طول البلاطة","Tile width":"عرض البلاطة","Joint width":"عرض الفاصل","Area per box":"المساحة لكل كرتون","Adhesive":"اللاصق","Tiles":"البلاط","Boxes":"الكراتين","Grout":"الترويب","Large tiles cut with more waste: allow at least 10 %.":"البلاط الكبير هالك قصه أكثر: اسمح بـ 10 % على الأقل.","Wastage allowance is reasonable.":"نسبة الهالك مناسبة.","Excavation and backfill":"الحفر والردم","Excavation, haulage and backfill volumes for foundation pits with working space and side slopes.":"كميات الحفر والنقل والردم لحفر الأساسات مع مسافة العمل وميول الجوانب.","Backfill is reused from the excavation at a compaction factor of 0.9.":"يُعاد استخدام ناتج الحفر في الردم بمعامل دمك 0.9.","Length m":"الطول m","Width m":"العرض m","Depth m":"العمق m","Working space each side":"مسافة العمل من كل جانب","Side slope (horizontal per 1 vertical)":"ميل الجانب (أفقي لكل 1 رأسي)","Volume of structure below ground":"حجم المنشأ تحت الأرض","Bulking factor":"معامل الانتفاش","Truck capacity":"سعة الشاحنة","Excavation (bank)":"الحفر (طبيعي)","Backfill (compacted)":"الردم (مدموك)","Loose volume":"الحجم المنفوش","Truckloads to remove the surplus":"نقلات الشاحنات لإزالة الفائض","Vertical sides deeper than 1.5 m need shoring.":"الجوانب الرأسية الأعمق من 1.5 m تحتاج سندًا.","Side slopes included.":"ميول الجوانب محسوبة.","Pit L × W × D m":"الحفرة ط × ع × عمق m","Formwork and concrete":"الشدات والخرسانة","Formwork contact area and concrete volume for columns, beams, slabs, footings and walls.":"مساحة تلامس الشدات وحجم الخرسانة للأعمدة والكمرات والبلاطات والقواعد والجدران.","For a slab enter length, thickness and width; for a wall enter length, thickness and height.":"للبلاطة أدخل الطول والسماكة والعرض؛ وللجدار أدخل الطول والسماكة والارتفاع.","Column":"عمود","Beam":"كمرة","Slab":"بلاطة","Footing":"قاعدة","L or width m":"الطول أو العرض m","Width or depth m":"العرض أو العمق m","Height or length m":"الارتفاع أو الطول m","Formwork area":"مساحة الشدات","Formwork per m³":"الشدات لكل m³","Beam forms include the soffit and both sides; slab forms include the soffit and edges.":"شدات الكمرات تشمل البطنية والجانبين؛ وشدات البلاطات تشمل البطنية والحواف.","Formwork m²":"الشدات m²","Concrete m³":"الخرسانة m³","Cost estimate":"تقدير التكلفة","Total project cost from trade costs, with contingency, overheads and profit, VAT and the cost per square metre.":"التكلفة الإجمالية للمشروع من تكاليف البنود، مع الاحتياطي والمصاريف العامة والربح وضريبة القيمة المضافة والتكلفة لكل متر مربع.","Trade cost":"تكلفة البند","Contingency":"الاحتياطي","Overheads and profit":"المصاريف العامة والربح","VAT":"ضريبة القيمة المضافة","Total including VAT":"الإجمالي شامل الضريبة","Cost per m²":"التكلفة لكل m²","Trade costs":"تكاليف البنود","Contingency under 5 % is low at early design stages.":"احتياطي أقل من 5 % منخفض في مراحل التصميم المبكرة.","Contingency is reasonable for this stage.":"الاحتياطي مناسب لهذه المرحلة.","Item":"البند","Amount":"المبلغ","Critical path":"المسار الحرج","Early and late start and finish, float and the critical path of up to 20 activities with finish-to-start links.":"البداية والنهاية المبكرة والمتأخرة والفائض والمسار الحرج لحتى 20 نشاطًا بعلاقات نهاية-بداية.","Activities are numbered by row. Durations are in working days.":"الأنشطة مرقمة حسب السطر. المدد بأيام العمل.","Duration d":"المدة d","After":"بعد","And after":"وبعد","Project duration":"مدة المشروع","Activities":"الأنشطة","Network is valid.":"الشبكة سليمة.","The links form a loop. Check the predecessors.":"العلاقات تشكل حلقة. راجع الأنشطة السابقة.","Float":"الفائض","Earned value":"القيمة المكتسبة","Cost and schedule performance of a project from planned value, earned value and actual cost, with the forecast at completion.":"أداء التكلفة والجدول الزمني لمشروع من القيمة المخططة والمكتسبة والتكلفة الفعلية، مع التوقع عند الإنجاز.","EAC by CPI assumes the cost performance so far will continue.":"EAC بمؤشر CPI يفترض استمرار أداء التكلفة الحالي.","Budget at completion":"الميزانية عند الإنجاز","Planned value to date":"القيمة المخططة حتى تاريخه","Earned value to date":"القيمة المكتسبة حتى تاريخه","Actual cost to date":"التكلفة الفعلية حتى تاريخه","Cost performance index CPI":"مؤشر أداء التكلفة CPI","Schedule performance index SPI":"مؤشر أداء الجدول SPI","Estimate at completion":"التقدير عند الإنجاز","Cost variance":"انحراف التكلفة","Schedule variance":"انحراف الجدول","Estimate to complete":"التقدير للإنجاز","Variance at completion":"الانحراف عند الإنجاز","TCPI to finish on budget":"TCPI للإنجاز ضمن الميزانية","Percent complete":"نسبة الإنجاز","Under budget for the work done.":"أقل من الميزانية للعمل المنجز.","Over budget for the work done.":"أعلى من الميزانية للعمل المنجز.","On or ahead of schedule.":"ضمن الجدول أو متقدم عليه.","Behind schedule.":"متأخر عن الجدول.","Crew productivity and duration":"إنتاجية الطاقم والمدة","Duration of an activity from its quantity and crew output, and the crews needed to finish by a target date.":"مدة نشاط من كميته وإنتاجية الطاقم، والأطقم اللازمة للإنجاز في الموعد المستهدف.","Summer work in the Gulf has restricted midday hours: reduce the efficiency to suit.":"العمل الصيفي في الخليج له ساعات ظهيرة محظورة: خفّض الكفاءة بما يناسب.","Output per crew per day":"إنتاج الطاقم يوميًا","Crews":"الأطقم","Efficiency":"الكفاءة","Heat, access and overtime lower productivity":"الحرارة وصعوبة الوصول والعمل الإضافي تخفض الإنتاجية","Target duration":"المدة المستهدفة","Crews for the target":"الأطقم اللازمة للهدف","Daily output":"الإنتاج اليومي","Finishes within the target.":"ينتهي ضمن المدة المستهدفة.","Misses the target with {0} crews.":"لا يحقق الهدف بعدد {0} أطقم.","Concrete pour planning":"تخطيط صب الخرسانة","Pour duration, number of truck mixers and truckloads for a concrete pour by pump.":"مدة الصب وعدد الخلاطات ونقلات الشاحنات لصب خرسانة بالمضخة.","In hot weather use retarders and pour at night to keep the concrete below its maximum temperature.":"في الطقس الحار استخدم المؤخرات واصبب ليلًا لإبقاء حرارة الخرسانة تحت حدها الأقصى.","Pour volume":"حجم الصبة","Pump output":"إنتاج المضخة","Truck round trip":"زمن رحلة الشاحنة ذهابًا وإيابًا","Initial set time of the mix":"زمن الشك الابتدائي للخلطة","Pour duration":"مدة الصب","Truck mixers needed":"الخلاطات اللازمة","Truckloads":"النقلات","Effective placing rate":"معدل الصب الفعلي","Interval between trucks":"الفاصل بين الشاحنات","Long gaps between trucks: risk of cold joints.":"فواصل طويلة بين الشاحنات: خطر فواصل باردة.","Truck interval is short enough for a continuous pour.":"الفاصل بين الشاحنات قصير بما يكفي لصب مستمر.","Pour over 12 h: plan crew shifts and a second pump.":"الصب أكثر من 12 h: خطط لورديات الطاقم ومضخة ثانية.","Pour fits in one shift.":"الصب يتسع في وردية واحدة.","Money values are in any one currency.":"القيم المالية بأي عملة واحدة.","yr":"سنة","gal":"جالون",
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
  if(o.tbl) low+=`<div><h3 class="sec">${esc(tr(o.tbl.cap||'Table'))}</h3><div class="tbl"><table><thead><tr>${o.tbl.head.map(h=>`<th>${esc(tr(h))}</th>`).join('')}</tr></thead><tbody>${o.tbl.rows.map(r=>`<tr class="${r.hl?'hl':''} ${r.dim?'dim':''}">${(r.c||r).map(x=>`<td>${esc(tr(x))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
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
