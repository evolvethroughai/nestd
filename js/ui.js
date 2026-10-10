// ui.js - Theme, toast, modal, swipe, focus mode
var LIFE_TITLES={bills:'💳 Bills',emis:'🏦 EMIs & Chits',invest:'📈 Investments',health:'💊 Health',biz2:'🚀 Business'};
var TBC={morning:'#f59e0b',afternoon:'#0ea5e9',evening:'#8b5cf6'};
var TBL={morning:'Morning',afternoon:'Afternoon',evening:'Evening'};
var TB_LABELS={morning:'☀️ Morning',afternoon:'🌤 Afternoon',evening:'🌆 Evening'};
var activeTB='all';
var focusIdx=0;

// -- THEME --
function applyTheme(t){
 document.documentElement.setAttribute("data-theme",t);
 var ic=t==="dark"?"☀️":"🌙";
 ["theme-btn","theme-btn2","theme-btn3","theme-btn4","theme-btn5"].forEach(function(id){var el=$(id);if(el)el.textContent=ic;});
 try{localStorage.setItem("jt-theme",t);}catch(e){}
}
function toggleTheme(){applyTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark");}
(function(){
 var t=null;try{t=localStorage.getItem("jt-theme");}catch(e){}
 if(t)applyTheme(t);
 else if(window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches)applyTheme("dark");
 else applyTheme("light");
})();
["theme-btn","theme-btn2","theme-btn3","theme-btn4","theme-btn5"].forEach(function(id){
 var el=$(id);if(el)el.onclick=toggleTheme;
});

// -- TOAST --
function toast(msg,undoFn){
 clearTimeout(toastTimer);
 var el=$("toast");
 el.innerHTML=esc(msg)+(undoFn?'<button id="tu">Undo</button>':"");
 el.classList.add("show");
 if(undoFn){$("tu").onclick=function(){undoFn();el.classList.remove("show");};}
 toastTimer=setTimeout(function(){el.classList.remove("show");},3500);
}

// -- MODAL --
function openModal(id){
 var x=find(id);if(!x)return;
 editingId=id;
 $("me-t").value=x.t;$("me-d").value=x.due||"";
 $("me-p").value=x.pr!==undefined?String(x.pr):"";
 $("me-rec").checked=!!x.rec;
 var sel=$("me-s");
 sel.innerHTML=Object.keys(M).filter(function(k){return SC.some(function(s){return s.m===k;});}).map(function(k){
  return '<optgroup label="'+esc(nm("m-"+k,M[k]))+'">'+SC.filter(function(s){return s.m===k;}).map(function(s){
   return '<option value="'+s.id+'">'+esc(nm("s-"+s.id,s.n))+'</option>';
  }).join("")+'</optgroup>';
 }).join("");
 sel.value=x.s;
 $("modal-overlay").hidden=false;
 setTimeout(function(){$("me-t").focus();},60);
}
function closeModal(){$("modal-overlay").hidden=true;editingId=null;}
$("modal-cancel").onclick=closeModal;
$("modal-overlay").addEventListener("click",function(e){if(e.target===$("modal-overlay"))closeModal();});
$("modal-save").onclick=function(){
 if(!editingId)return;var x=find(editingId);if(!x)return;
 var t=$("me-t").value.trim();if(!t)return;
 x.t=t;x.s=$("me-s").value;x.due=$("me-d").value||undefined;
 var pv=$("me-p").value;x.pr=pv?parseInt(pv):undefined;
 x.rec=$("me-rec").checked||undefined;
 closeModal();save();renderAll();toast("Task updated");
};
$("modal-del").onclick=function(){
 if(!editingId)return;var snap=JSON.stringify(st);
 st.items=st.items.filter(function(y){return y.id!==editingId;});
 closeModal();save();renderAll();
 toast("Task deleted",function(){st=JSON.parse(snap);save();renderAll();});
};

// -- SWIPE --
function attachSwipe(el,id){
 var sx=0,sy=0,moved=false;
 el.addEventListener("touchstart",function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY;moved=false;},{passive:true});
 el.addEventListener("touchmove",function(e){
  var dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
  if(Math.abs(dy)>Math.abs(dx))return;moved=true;
  var bg=el.querySelector(".swipe-bg");
  if(dx<-20&&bg)bg.style.opacity=Math.min(1,(-dx-20)/60);
 },{passive:true});
 el.addEventListener("touchend",function(e){
  var dx=e.changedTouches[0].clientX-sx;
  var bg=el.querySelector(".swipe-bg");if(bg)bg.style.opacity=0;
  if(!moved)return;
  if(dx<-80){var x=find(id);if(x&&!x.d){x.d=true;if(navigator.vibrate)navigator.vibrate(40);save();renderAll();toast("Done ✅",function(){x.d=false;save();renderAll();});}}
 },{passive:true});
}

// -- FOCUS MODE --
function openFocus(){
 var tasks=tl().filter(function(x){return !x.d;});
 if(!tasks.length){toast('No pending tasks in Today');return;}
 focusIdx=0;
 renderFocus(tasks);
 $('focus-overlay').hidden=false;
}
function renderFocus(tasks){
 if(!tasks)tasks=tl().filter(function(x){return !x.d;});
 if(focusIdx>=tasks.length){$('focus-overlay').hidden=true;toast('🎉 All done!');return;}
 var x=tasks[focusIdx];
 var prog=$('focus-progress');
 prog.innerHTML=tasks.map(function(_,i){
  return '<span class="'+(i<focusIdx?'fp-done':i===focusIdx?'fp-cur':'')+'"></span>';
 }).join('');
 $('focus-task').textContent=x.t;
 var s=SEC[x.s];var bl=x.block?TB_LABELS[x.block]||'':'';
 $('focus-meta').textContent=(s?s.n:'')+(bl?' · '+bl:'');
}
$('focus-btn').onclick=openFocus;
$('focus-exit').onclick=function(){$('focus-overlay').hidden=true;};
$('focus-done').onclick=function(){
 var tasks=tl().filter(function(x){return !x.d;});
 if(focusIdx<tasks.length){tasks[focusIdx].d=true;if(navigator.vibrate)navigator.vibrate(30);save();renderAll();}
 renderFocus();
};
$('focus-skip').onclick=function(){
 var tasks=tl().filter(function(x){return !x.d;});
 focusIdx++;renderFocus(tasks);
};

// -- TIME BLOCK FILTER --
document.addEventListener('click',function(e){
 var tb=e.target.closest('.tb-tab');if(!tb)return;
 activeTB=tb.getAttribute('data-tb');
 Array.prototype.forEach.call(document.querySelectorAll('.tb-tab'),function(t){t.classList.toggle('active',t===tb);});
 renderTodayList();
});

// -- TIME BLOCK ASSIGN --
document.addEventListener('click',function(e){
 var tb=e.target.closest('.tc-block');if(!tb)return;
 var id=tb.getAttribute('data-id');
 var x=find(id);if(!x)return;
 var cycle=['morning','afternoon','evening'];
 var cur=cycle.indexOf(x.block||'morning');
 x.block=cycle[(cur+1)%3];
 save();renderAll();
});

// -- DAILY NOTE --
(function(){
 var dn=$('daily-note');
 if(!dn)return;
 dn.value=st.dailyNote||'';
 dn.addEventListener('input',function(){
  st.dailyNote=dn.value;
  clearTimeout(dn._t);
  dn._t=setTimeout(function(){save();},600);
 });
})();
