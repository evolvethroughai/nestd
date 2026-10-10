// app.js - Navigation, click handler, ask, backup, init

var curView="today";
function showView(v){
 ["today","lists","ask"].forEach(function(k){$("v-"+k).hidden=k!==v;});
 Array.prototype.forEach.call($("nav").children,function(c){c.setAttribute("aria-selected",c.getAttribute("data-v")===v);});
 curView=v;
 var vr=$("view-root");if(vr)vr.scrollTop=0;
}
$("nav").addEventListener("click",function(e){var b=e.target.closest("[data-v]");if(b)showView(b.getAttribute("data-v"));});

// -- MAIN CLICK HANDLER --
document.addEventListener("click",function(e){
 var cc=e.target.closest(".cat-card");
 if(cc&&!e.target.closest("[data-a]")){
  if(cc.getAttribute('data-lv'))return;
  openCatPage(cc.getAttribute("data-cat"));return;
 }
 var b=e.target.closest("[data-a]");if(!b)return;
 var a=b.getAttribute("data-a"),id=b.getAttribute("data-id");
 if(a==="vadd"){
  var vt=$("vat");if(!vt||!vt.value.trim())return;
  st.g.push({id:"gm"+Date.now()+Math.floor(Math.random()*99),t:vt.value.trim(),k:"week",grp:"Vegetables",d:false});
  vt.value="";save();renderAll();return;
 }
 if(a==="gadd"){
  var tt=$("gat"),cc2=$("gac");if(!tt||!tt.value.trim())return;
  var tv=tt.value.trim(),cv=cc2?cc2.value:"Staples / food";
  if(cv==="Vegetables")st.g.push({id:"gm"+Date.now(),t:tv,k:"week",grp:cv,d:false});
  else{var ex=st.g.filter(function(x){return x.k==="rec"&&x.t.toLowerCase()===tv.toLowerCase();})[0];
   var gn=$("gn");
   if(ex){if(gn&&gn.checked)ex.n=true;}
   else st.g.push({id:"gm"+Date.now(),t:tv,k:"rec",grp:cv,n:gn?gn.checked:false,d:false});}
  tt.value="";save();renderAll();return;
 }
 if(a==="qadd"){
  var qs=b.getAttribute("data-sec");
  var qi=document.querySelector('.inline-add input[data-sec="'+qs+'"]');
  if(!qi||!qi.value.trim())return;
  st.items.push({id:"u"+Date.now()+Math.floor(Math.random()*999),s:qs,t:qi.value.trim(),d:false});
  qi.value="";if(!tl().length)fill();save();renderAll();
  toast("Added to "+(SEC[qs]?nm("s-"+qs,SEC[qs].n):"list"));return;
 }
 if(a==="setstore"){openStoreSheet(id);return;}
 if(a==="gmedit"){
  var g=st.g.filter(function(x){return x.id===id;})[0];if(!g)return;
  var nv=prompt('Rename:',g.t);if(!nv||!nv.trim())return;
  g.t=nv.trim();save();renderAll();return;
 }
 if(a==="gbk"){showView("ask");setTimeout(function(){$("bk-btn").scrollIntoView();},100);return;}
 if(a==="gveg"){openCatPage("V");showView("lists");return;}
 if(a==="gopen"){openCatPage("C");showView("lists");return;}
 if(a==="gbills"){showView("lists");openLifePage('bills');return;}
 if(a==="gdel"){
  var snap=JSON.stringify(st);var gi=st.g.filter(function(x){return x.id===id;})[0];var gt=gi?gi.t:"item";
  st.g=st.g.filter(function(x){return x.id!==id;});save();renderAll();
  toast("Deleted "+gt,function(){st=JSON.parse(snap);save();renderAll();});return;
 }
 if(a==="vtog"){
  var g=st.g.filter(function(x){return x.id===id;})[0];if(!g)return;
  g.d=!g.d;
  if(g.d){
   var now=new Date();
   g.boughtOn=now.getFullYear()+"-"+("0"+(now.getMonth()+1)).slice(-2)+"-"+("0"+now.getDate()).slice(-2);
   var existing=st.g.filter(function(x){return x.k==="vdone"&&x.ref===g.id;})[0];
   if(existing)existing.ts=Date.now();
   else st.g.push({id:"vd"+Date.now(),k:"vdone",ref:g.id,t:g.t,ts:Date.now()});
   if(navigator.vibrate)navigator.vibrate(30);
  } else {
   g.boughtOn=undefined;
  }
  save();renderAll();return;
 }
 if(a==="gtog"||a==="gbuy"||a==="gnow"||a==="gbought"){
  var g2=st.g.filter(function(x){return x.id===id;})[0];if(!g2)return;
  if(a==="gnow"){g2.n=!g2.n;}
  else if(a==="gbought"){g2.n=false;g2.lb=Date.now();st.g.push({id:"gd"+Date.now()+Math.floor(Math.random()*99),t:g2.t,k:"done",grp:g2.grp,d:true,ts:Date.now(),store:g2.store||undefined,qty:g2.qty||undefined,price:g2.price||undefined});}
  else if(a==="gbuy"||g2.k==="next"){g2.k="rec";g2.n=true;g2.d=false;if(g2.grp==="Next grocery cycle")g2.grp="Household / personal";}
  else if(g2.k==="done"){var mm=st.g.filter(function(x){return x.k==="rec"&&x.t===g2.t;})[0];if(mm)mm.n=true;else st.g.push({id:"gm"+Date.now()+Math.floor(Math.random()*99),t:g2.t,k:"rec",grp:g2.grp||"Staples / food",n:true,d:false});}
  else if(g2.k==="cur"){g2.k="done";g2.d=true;g2.ts=Date.now();}
  else{g2.d=!g2.d;}
  var cut3m=Date.now()-90*24*60*60*1000;
  st.g=st.g.filter(function(x){return !(x.k==="done"&&x.ts&&x.ts<cut3m);});
  save();renderAll();return;
 }
 if(a==="edit"){openModal(id);return;}
 var x=find(id);if(!x)return;
 if(a==="tog"){
  x.d=!x.d;
  if(x.d&&x.rec){setTimeout(function(){st.items.push({id:"u"+Date.now()+Math.floor(Math.random()*999),s:x.s,t:x.t,d:false,pr:x.pr,rec:true,due:x.due});save();renderAll();},700);}
  if(x.d&&navigator.vibrate)navigator.vibrate(30);
 }
 if(a==="back")x.today=false;
 if(a==="top")toTop(x);
 if(a==="del"){
  var snap2=JSON.stringify(st);var xt=x.t;
  st.items=st.items.filter(function(y){return y!==x;});
  save();renderAll();toast("Deleted: "+xt.slice(0,40),function(){st=JSON.parse(snap2);save();renderAll();});return;
 }
 save();renderAll();
});

$("next-btn").onclick=function(){if(complete()||!tl().length){fill();save();renderAll();}};

// -- KEYBOARD --
document.addEventListener("keydown",function(e){
 if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT")return;
 if(e.key==="1")showView("today");
 if(e.key==="2")showView("lists");
 if(e.key==="3")showView("ask");
 if(e.key==="Escape"&&currentCat)closeCatPage();
});

// -- ASK TIPS --
var TIPS=["What's for today?","What's urgent?","Add pay electricity bill","Done: sell mouse","I'm going to Koti","Pending groceries","What's overdue?"];
$("ask-tips").innerHTML=TIPS.map(function(t){return '<button class="tip" data-tip="'+esc(t)+'">'+esc(t)+'</button>';}).join("");
$("ask-tips").addEventListener("click",function(e){var b=e.target.closest("[data-tip]");if(!b)return;$("q").value=b.getAttribute("data-tip");$("q").focus();});

function act(a){
 if(!a||!a.op)return;
 if(a.op==="add"&&a.title){st.items.push({id:"u"+Date.now()+Math.floor(Math.random()*999),s:SEC[a.sec]?a.sec:"fam",t:String(a.title).slice(0,200),d:false,due:/^\d{4}-\d{2}-\d{2}$/.test(a.due||"")?a.due:undefined});return;}
 var x=find(a.id);if(!x)return;
 if(a.op==="done")x.d=true;
 if(a.op==="due"&&/^\d{4}-\d{2}-\d{2}$/.test(a.date||""))x.due=a.date;
 if(a.op==="top")toTop(x);
}
$("send-btn").onclick=async function(){
 var q=$("q").value.trim();if(!q)return;var out=$("ans");out.hidden=false;
 if(!sample){out.textContent="The assistant is not available here. Today and Lists still work fully.";return;}
 out.textContent="Thinking…";
 var data=st.items.filter(function(x){return !x.d&&pr(x)>0;}).map(function(x){return x.id+"|"+x.s+"|"+(x.today?"TODAY|":"")+(x.due?"due "+x.due+"|":"")+x.t;}).join("\n");
 var pend=st.g.filter(function(x){return (x.k==="cur"&&!x.d)||(x.k==="rec"&&x.n);}).map(function(x){return x.t;}).join(", ");
 var secs=SC.map(function(s){return s.id+"="+s.n;}).join("; ");
 var rules="You manage Jeevan's tasks. Today holds at most 5 items. Priority: urgent, family, work, primary business, personal errands. Reply in at most 6 short lines. Return ONLY JSON: {\"reply\":string,\"actions\":[{\"op\":\"add\",\"title\":string,\"sec\":string}|{\"op\":\"done|top\",\"id\":string}]}.\n\nOpen items:\n"+data+"\n\nPending groceries: "+pend+"\n\nMessage: "+q;
 try{var r=await sample.json(rules,{cache:false});(r.actions||[]).slice(0,12).forEach(act);save();renderAll();out.textContent=String(r.reply||"Done.");$("q").value="";}
 catch(err){out.textContent=err&&err.code==="not_granted"?"Permission not given.":"Could not reach assistant. Try again.";}
};

// -- BACKUP --
$("bk-btn").onclick=function(){
 var t=$("bkt");st.bk=Date.now();save();t.value=JSON.stringify(st);t.hidden=false;t.focus();t.select();
 var ok=false;try{ok=document.execCommand&&document.execCommand("copy");}catch(e){}
 $("bkm").textContent=ok?"Copied! Paste it somewhere safe.":"Select all and copy. Paste it somewhere safe.";renderAll();
};
var armed=false;
$("rs-btn").onclick=function(){
 var v=$("rst").value.trim(),m=$("rsm"),s;
 if(!v){m.textContent="Paste your backup first.";return;}
 try{s=JSON.parse(v);}catch(e){m.textContent="That doesn't look like a backup.";return;}
 if(!s||!Array.isArray(s.items)||!Array.isArray(s.g)){m.textContent="That doesn't look like a backup.";return;}
 if(!armed){armed=true;m.textContent="This replaces your current lists. Tap Restore again to confirm.";return;}
 armed=false;st=migrate(s);st.bk=Date.now();save();renderAll();$("rst").value="";m.textContent="Restored successfully.";
};

// -- INIT --
try{
 var s0=JSON.parse(localStorage.getItem("jt-v5")||localStorage.getItem("jt-v4")||localStorage.getItem("jt-v3"));
 if(s0&&s0.items&&s0.g)st=migrate(s0);
}catch(e){}
if(!tl().length&&!st.day)fill();
roll();renderAll();

// -- CLOUD SYNC --
try{
 claude.use("sample").then(function(s){sample=s;}).catch(function(){});
 Promise.all([claude.use("db"),claude.use("user")]).then(async function(r){
  if(!r[0]||!r[1])return;var uid=await r[1].id();if(!uid)return;
  var ref=r[0].collection("data/users/"+uid).doc("state5");
  var snap=await ref.get();
  if(snap.exists){try{var s=JSON.parse(snap.data().json);if(s&&s.items&&s.g){st=migrate(s);roll();}}catch(e){}}
  dbDoc=ref;if(!snap.exists)save();renderAll();
 }).catch(function(){});
}catch(e){}
