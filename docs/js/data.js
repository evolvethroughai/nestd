// data.js - All constants, seed data, migrate()
'use strict';
var M={V:"🥬 Vegetables",C:"🛒 Grocery & Shopping",A:"💻 Work, Business & Finance",B:"🚗 Errands, Family & OLX",D:"🎯 Projects & Focus"};
var MICON={A:"💻",B:"🚗",C:"🛒",V:"🥬",D:"🎯"};
var MCLS={A:"cat-A",B:"cat-B",C:"cat-C",V:"cat-V",D:"cat-D"};
var PL={1:"🔴 Urgent",2:"🟠 Family & essentials",3:"🟡 Work & career",4:"🟢 Primary business",5:"🔵 Personal & errands"};
var SC=[
 {id:"biz",m:"A",n:"🚀 Primary business: DevOps / AI / Cloud",pr:4,o:50},
 {id:"car",m:"A",n:"💼 Career & learning",pr:3,o:40},
 {id:"fin",m:"A",n:"💰 Finance & admin",pr:2,o:25},
 {id:"oth",m:"A",n:"💡 Other business tracks (inactive)",pr:0,o:99},
 {id:"urg",m:"B",n:"🔴 Urgent & time-sensitive",pr:1,o:10},
 {id:"fam",m:"B",n:"👨👩👦🏠 Family & personal errands",pr:2,o:30},
 {id:"err",m:"B",n:"🚗 Errands & outings",pr:5,o:60},
 {id:"home",m:"B",n:"🏠 Home setup & maintenance",pr:5,o:65},
 {id:"olx",m:"B",n:"📦 OLX: sell",pr:5,o:70,note:"Buy on OLX: nothing recorded."},
 {id:"shop",m:"C",n:"🛒 Shopping tasks",pr:2,o:20},
 {id:"lrn",m:"D",n:"💻 Learning & DevOps",pr:3,o:45},
 {id:"med",m:"D",n:"🎬 Content & media",pr:4,o:55}
];
var SEC={};SC.forEach(function(s){SEC[s.id]=s;});
var CORE=["Staples / food","Household / personal","Pooja","Nuts, seeds and snacks","Fruit"];
var GCAT=[["Staples / food","Staples / food"],["Household / personal","Household / personal"],["Pooja","Pooja"],["Fruit","Fruits"],["Nuts, seeds and snacks","Dry fruits, nuts & seeds"],["Vegetables","Vegetables (Fri/Sat)"]];
function gcatAll(){var extra=(st&&st.gExtra)||[];return GCAT.slice(0,5).concat(extra.map(function(e){return [e.id,e.label];}));}
var VEG=["Spinach","Aloo","Tomato","Bhindi (okra)","Carrot","Cucumber","Lemon","Bottle gourd","Brinjal","Green dark chillies","Beetroot","Broccoli","Cabbage","Capsicum","Ridge gourd","Drumstick","Pumpkin","Methi leaves","Coriander leaves"];
var n=0;
function I(s,t,pr){var o={id:"s"+(n++),s:s,t:t,d:false};if(pr!==undefined)o.pr=pr;return o;}
function G(t,k,grp,d){return{id:"g"+(n++),t:t,k:k,grp:grp||"",d:!!d};}
function many(s,a){return a.map(function(t){return I(s,t);});}
function gm(a,k,grp,d){return a.map(function(t){return G(t,k,grp,d);});}
var SEED={items:[].concat(
 many("urg",["Call for Mom's dental appointment / sleep study","Submit Mom's medical bills online / NUID apply"]),
 many("shop",["Order current grocery staples (Kandi pappu, Minapappu, Shanagapappu, Ghee, household items)","Order household and personal items","Buy pooja items (agarbathi, aarti kapoor)"]),
 many("fin",["Bills and time-sensitive payments","Savings and investments planning","Marriage-related financial planning and gold planning"]),
 many("fam",["Marriage-related tasks and follow-ups","Family shopping and responsibilities","Medical / admin requirements"]),
 many("car",["Azure DevOps YAML / Terraform state learning module","Terraform state and private endpoints","GitLab CI/CD and SonarQube quality gates","Kubernetes and Helm setups","Azure DevOps YAML and cloud architecture (interview prep)"]),
 many("lrn",["Kubernetes Gateway API / Kong Gateway configs","Terratest and PyTest automation framework"]),
 many("biz",["Define product concept, naming and target audience","Define course structure (DevOps, AI, Cloud)","Build landing page and website","Set up subscription and payment model","Plan live classes (~2x/week) and recorded session portal","Plan distribution: YouTube, Instagram, website"]),
 [I("med","YouTube / Instagram project planning"),I("med","Telugu song recording / Sangeetham practice",5),I("med","Podcast setup",0)],
 many("err",["Koti nurse inquiry / TS council transfer","Mom sarees for Dussehra","Gold ring check / purchase","Rat mesh for car","Nexgear connector for car","Dashcam for car"]),
 many("home",["Gas stove","Extra CC cameras fitting","Concrete work in front of main gate"]),
 many("olx",["Sell laptop","Sell mouse","Sell exhaust fan"]),
 many("oth",["Faceless AI channel (YouTube / Instagram)","Podcast / educational explanation channel","Small food cart / restaurant","Couple channel"])),
 g:[].concat(
  gm(["Ghee","Kandi pappu (2 kg)","Minapappu (500 g)","Shanagapappu (1 kg)","Upma rava","Idly rava","Semiya","Murmuralu","Soya mini (2 packets)","Otti mirapakaya","Avalu (small)","Nuvvulu","Jeelakarra","Guava","Pomegranate"],"cur","Staples / food"),
  gm(["Santoor","Gillette / shaving blades","Moisturizer","Pillow","Boxers","Loafer socks","Floor cleaner (2)"],"cur","Household / personal"),
  gm(["Agarbathi","Aarti kapoor"],"cur","Pooja"),
  gm(["Pomegranate","Guava","Dragon fruit","Apple","Banana","Papaya","Orange / Mosambi","Kiwi","Pear","Watermelon","Muskmelon","Berries (when available)"],"rec","Fruit"),
  gm(["Almonds / Badam","Walnuts","Cashews / Jeedi pappu","Pistachios","Peanuts / Pallilu","Pumpkin seeds","Watermelon seeds","Sunflower seeds","Chia seeds","Flax seeds","Roasted chana","Dates (fresh and dry)"],"rec","Nuts, seeds and snacks"),
  gm(VEG,"week","Vegetables"),
  gm(["Gas jet-flame / powerful gas lighter"],"next","Next grocery cycle"),
  gm(["Pitamber","Harpic","Sabena","Double-edge blades","Oils","Rock salt","Plain oats","Masala oats","Apron","Highlighter","Molthadu","Oximeter","Gold ring pickup"],"done","",true)),
 day:"",vm:5};

function migrate(s){
 if(!s.vm){s.g=s.g.filter(function(x){return x.k!=="week";});s.g.forEach(function(x){if(x.k==="cur"&&x.r){x.k="rec";x.n=true;x.r=0;}});s.vm=1;}
 if(s.vm<2){s.g.forEach(function(x){if(x.k==="week"&&x.t==="Elephant egg")x.t="Brinjal";});VEG.forEach(function(t,i){if(!s.g.some(function(x){return x.k==="week"&&x.t===t;}))s.g.push({id:"gv"+i+"b",t:t,k:"week",grp:"Vegetables",d:false});});s.vm=2;}
 if(s.vm<3){s.g.forEach(function(x){if(x.k==="cur"&&x.d)x.k="done";});s.vm=3;}
 if(s.vm<4){
  var has=function(t){return s.g.filter(function(x){return x.k==="rec"&&x.t.toLowerCase()===t.toLowerCase();})[0];};
  s.g=s.g.filter(function(x){if(x.k==="cur"&&!x.d){var m=has(x.t);if(m){m.n=true;return false;}x.k="rec";x.n=true;}return true;});
  [["Oils","Staples / food"],["Rock salt","Staples / food"],["Plain oats","Staples / food"],["Masala oats","Staples / food"],["Harpic","Household / personal"],["Pitamber","Household / personal"],["Sabena","Household / personal"]].forEach(function(a,i){if(!has(a[0]))s.g.push({id:"gr"+i+"x",t:a[0],k:"rec",grp:a[1],n:false,d:false});});
  s.vm=4;
 }
 if(!s.gExtra)s.gExtra=[];
 if(!s.lifeExtra)s.lifeExtra=[];
 if(!s.secExtra)s.secExtra=[];
 if(!s.catExtra)s.catExtra=[];
 if(!s.streak)s.streak={count:0,last:''};
 if(!s.history)s.history=[];
 if(!s.gStores)s.gStores=[];
 if(!s.subBills)s.subBills=[];
 if(!s.bills||s.bills.length<6){s.bills=[
  {id:"bill1",name:"Electricity",icon:"💡",amt:"",due:"",note:"TSSPDCL",paid:false,yearly:false},
  {id:"bill2",name:"Water",icon:"💧",amt:"",due:"",note:"",paid:false,yearly:false},
  {id:"bill3",name:"Jio Fibernet",icon:"📡",amt:"",due:"",note:"",paid:false,yearly:false},
  {id:"bill4",name:"Mobile Recharge",icon:"📱",amt:"",due:"",note:"",paid:false,yearly:false},
  {id:"bill5",name:"Property Tax",icon:"🏠",amt:"",due:"",note:"",paid:false,yearly:true},
  {id:"bill6",name:"Gas (LPG)",icon:"🔥",amt:"",due:"",note:"",paid:false,yearly:false}
 ];}
 if(s.vm<5){
  var hasSub=function(pid,name){return s.subBills.some(function(x){return x.parentId===pid&&x.name===name;});};
  [
   {pid:"bill1",name:"Meter 1",dueDay:15},{pid:"bill1",name:"Meter 2",dueDay:15},
   {pid:"bill1",name:"Meter 3",dueDay:15},{pid:"bill1",name:"Meter 4",dueDay:15},
   {pid:"bill1",name:"Meter 5",dueDay:15},{pid:"bill1",name:"Meter 6",dueDay:15},
   {pid:"bill1",name:"Meter 7",dueDay:15},{pid:"bill1",name:"Meter 8",dueDay:15},
   {pid:"bill1",name:"Meter 9",dueDay:15},
   {pid:"bill2",name:"Water – Connection 1",dueDay:15},
   {pid:"bill2",name:"Water – Connection 2",dueDay:15},
   {pid:"bill4",name:"Number 1",dueDay:15},{pid:"bill4",name:"Number 2",dueDay:15},
   {pid:"bill4",name:"Number 3",dueDay:15},{pid:"bill4",name:"Number 4",dueDay:15},
   {pid:"bill6",name:"Gas – Cylinder 1",dueDay:15},
   {pid:"bill6",name:"Gas – Cylinder 2",dueDay:15}
  ].forEach(function(x,i){
   if(!hasSub(x.pid,x.name))s.subBills.push({id:'sb0'+(i+1),parentId:x.pid,name:x.name,dueDay:x.dueDay,paid:false});
  });
  s.vm=5;
 }
 if(!s.emis)s.emis=[];
 if(!s.invest)s.invest=[];
 if(!s.health)s.health=[];
 if(!s.biz2)s.biz2={ideas:[],active:null,tasks:[]};
 var builtinStores=['dmart','zepto','blinkit','bigbasket','instamart','flipkart','minutes','general','other'];
 s.g.forEach(function(x){if(x.store&&builtinStores.indexOf(x.store)>=0)delete x.store;});
 return s;
}
