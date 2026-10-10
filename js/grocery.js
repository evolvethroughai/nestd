// grocery.js - Grocery, vegetable, store logic

var storeSheetId=null;

function renderCustomStoreList(){
 var g=st.g.filter(function(x){return x.id===storeSheetId;})[0];
 var html='';
 if(!st.gStores||!st.gStores.length){
  html='<p style="font-size:13px;color:var(--mute);text-align:center;padding:12px 0">No stores yet. Add one below.</p>';
 } else {
  st.gStores.forEach(function(cs,idx){
   var sel=g&&g.store==='custom:'+cs;
   html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">'
    +'<button class="store-opt'+(sel?' selected':'')+' store-opt-custom" data-store="custom:'+esc(cs)+'" style="flex:1">'+storeEmoji(cs)+' '+esc(cs)+'</button>'
    +'<button data-editstore="'+idx+'" style="background:none;border:1.5px solid var(--line);border-radius:10px;padding:8px;cursor:pointer;font-size:15px;line-height:1;color:var(--mute)">✏️</button>'
    +'<button data-delstore="'+idx+'" style="background:none;border:1.5px solid var(--line);border-radius:10px;padding:8px;cursor:pointer;font-size:15px;line-height:1;color:var(--red)">🗑</button>'
    +'</div>';
  });
 }
 $('store-custom-list').innerHTML=html;
}

function openStoreSheet(gid){
 storeSheetId=gid;
 $('store-sheet').hidden=false;
 renderCustomStoreList();
 $('store-add-inp').value='';
}

$('store-sheet-cancel').onclick=function(){$('store-sheet').hidden=true;storeSheetId=null;};
$('store-add-save').onclick=function(e){
 e.stopPropagation();
 var v=$('store-add-inp').value.trim();if(!v)return;
 if(!st.gStores)st.gStores=[];
 if(!st.gStores.some(function(s){return s.toLowerCase()===v.toLowerCase();})){st.gStores.push(v);save();}
 $('store-add-inp').value='';renderCustomStoreList();
};
$('store-sheet').addEventListener('click',function(e){
 if(e.target===$('store-sheet')){$('store-sheet').hidden=true;storeSheetId=null;return;}
 var del=e.target.closest('[data-delstore]');
 if(del){
  var idx=parseInt(del.getAttribute('data-delstore'),10),cs=st.gStores[idx];
  st.gStores.splice(idx,1);
  st.g.forEach(function(x){if(x.store==='custom:'+cs)delete x.store;});
  save();renderCustomStoreList();return;
 }
 var edit=e.target.closest('[data-editstore]');
 if(edit){
  var idx=parseInt(edit.getAttribute('data-editstore'),10),old=st.gStores[idx];
  var nv=prompt('Rename:',old);if(!nv||!nv.trim()||nv.trim()===old)return;
  nv=nv.trim();st.gStores[idx]=nv;
  st.g.forEach(function(x){if(x.store==='custom:'+old)x.store='custom:'+nv;});
  save();renderCustomStoreList();return;
 }
 var btn=e.target.closest('.store-opt');if(!btn||!storeSheetId)return;
 var g=st.g.filter(function(x){return x.id===storeSheetId;})[0];
 if(g){
  g.store=btn.getAttribute('data-store');
  var rec=st.g.filter(function(x){return x.k==='rec'&&x.t===g.t;})[0];
  if(rec)rec.store=g.store;
  save();renderAll();
 }
 $('store-sheet').hidden=true;storeSheetId=null;
});

function renderCatPage(k){
 var body="";
 if(k==="C"){
  var G2=function(kk,grp){return st.g.filter(function(x){return x.k===kk&&(!grp||x.grp===grp);});};
  var cur=G2('cur'),dn=G2('done');
  var nowM=G2('rec').filter(function(x){return x.n;});
  var nowAll=cur.concat(nowM);
  var pending=nowAll.filter(function(x){return !x.d;});
  body+='<div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.06)">'
   +'<div style="font-size:12px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">&#43; Add item to master list</div>'
   +'<input type="text" id="gat" placeholder="Item name…" maxlength="80" style="margin-bottom:8px;width:100%">'
   +'<select id="gac" style="margin-bottom:10px;width:100%">'+GCAT.filter(function(c){return c[0]!=="Vegetables";}).map(function(c){return '<option value="'+c[0]+'">'+c[1]+'</option>';}).join('')+'</select>'
   +'<div style="display:flex;align-items:center;gap:10px">'
   +'<label style="flex:1;font-size:13px;color:var(--mute);display:flex;align-items:center;gap:6px"><input type="checkbox" id="gn" checked> Also add to Buy now</label>'
   +'<button data-a="gadd" style="font:800 14px Nunito,sans-serif;background:var(--acc);color:#fff;border:0;border-radius:10px;padding:10px 20px;cursor:pointer;white-space:nowrap">Add</button>'
   +'</div>'
   +'</div>';
  var core=G2('rec').filter(function(x){return CORE.indexOf(x.grp)>=0;});
  var masterHtml=GCAT.slice(0,5).map(function(c){
   var it=core.filter(function(x){return x.grp===c[0];});
   var nb=it.filter(function(x){return x.n;}).length;
   var hdr=it.length?'<div style="display:flex;align-items:center;padding:0 8px 8px;gap:14px"><span style="flex:1"></span><span style="width:72px;text-align:center;font-size:10px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.5px">Qty</span><span style="width:36px;text-align:center;font-size:10px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.5px">Store</span><span style="width:72px;text-align:center;font-size:10px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.5px">Status</span><span style="width:64px;text-align:center;font-size:10px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.5px">Actions</span></div>':'';
   return macc('gm-'+c[0],c[1]+' ('+it.length+(nb?', '+nb+' in Buy now':'')+')' ,it.length?hdr+it.map(gmRow).join(''):'<p class="note">Nothing here.</p>');
  }).join('');
  body+=subsec('📒 Master grocery list',core.length,masterHtml);
  var nowHtml='';
  if(!pending.length){nowHtml='<p class="note">Nothing to buy right now.</p>';}
  else{
   nowHtml='<div style="display:flex;align-items:center;padding:0 8px 8px;gap:14px"><span style="flex:1"></span><span style="width:72px;text-align:center;font-size:10px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.5px">Qty</span><span style="width:60px;text-align:center;font-size:10px;font-weight:800;color:var(--acc);text-transform:uppercase;letter-spacing:.5px">Price</span><span style="width:64px;text-align:center;font-size:10px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.5px">Actions</span></div>';
   nowHtml+=pending.map(gnRow).join('');
  }
  body+=macc('buy-now','🛒 Buy now — '+pending.length+' items',nowHtml);
  var boughtHtml='';
  var cutoff=Date.now()-90*24*60*60*1000;
  var dnRecent=dn.filter(function(x){return x.ts&&x.ts>=cutoff;});
  if(!dn.length){boughtHtml='<p class="note">Nothing bought yet.</p>';}
  else if(!dnRecent.length){boughtHtml='<p class="note">No purchases in the last 3 months.</p>';}
  else{
   var byDate={};
   dnRecent.sort(function(a,b){return b.ts-a.ts;}).forEach(function(x){
    var d=new Date(x.ts);
    var dk=d.getFullYear()+'-'+(('0'+(d.getMonth()+1)).slice(-2))+'-'+(('0'+d.getDate()).slice(-2));
    (byDate[dk]=byDate[dk]||[]).push(x);
   });
   Object.keys(byDate).sort().reverse().forEach(function(dk){
    var items=byDate[dk];
    var label='Bought '+new Date(dk+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short',year:'numeric'});
    var total=items.reduce(function(s,x){var p=parseFloat(x.price);return s+(isNaN(p)?0:p);},0);
    boughtHtml+='<div style="font-size:12px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.5px;margin:14px 0 6px">&#128722; '+esc(label)+(total?'<span style="font-weight:700;color:var(--acc);text-transform:none;letter-spacing:0"> &nbsp;&middot;&nbsp; &#8377;'+total.toLocaleString("en-IN")+' overall</span>':'')+'</div>';
    items.forEach(function(x){
     var si=storeIcon(x);
     boughtHtml+='<div class="gi done">'
      +'<div style="flex:1;min-width:0">'
      +'<div class="gi-name" style="text-decoration:line-through;color:var(--mute)">'+esc(x.t)+'</div>'
      +(x.qty||x.price?'<span style="font-size:12px;color:var(--mute)">'+(x.qty?esc(x.qty):'')+(x.qty&&x.price?' &middot; ':'')+( x.price?'&#8377;'+esc(x.price):'')+'</span>':'')
      +(x.store?'<span class="store-badge store-general" style="margin-left:0;margin-top:2px;display:inline-flex">'+si.icon+' '+esc(si.label)+'</span>':'')
      +'</div>'
      +'<button class="gi-act" data-a="gtog" data-id="'+x.id+'" title="Buy again" style="font-size:13px;padding:4px 8px;border:1.5px solid var(--line);border-radius:8px;color:var(--acc);font-weight:700">+ Again</button>'
      +'</div>';
    });
   });
  }
  body+=macc('bought','&#9989; Already bought &#8212; last 3 months ('+dnRecent.length+')',boughtHtml);
 } else if(k==="V"){
  var vg=st.g.filter(function(x){return x.k==="week";});
  var pending=vg.filter(function(x){return !x.d;});
  var bought=vg.filter(function(x){return x.d;});
  body+='<div style="background:var(--soft);border-radius:14px;padding:12px 14px;margin-bottom:14px;font-size:14px">'
   +'<b>Buy on Friday or Saturday</b> · Budget: ₹600–₹800 · '+pending.length+' remaining this week</div>';
  body+=pending.length?'<div style="display:flex;align-items:center;padding:0 12px 4px;gap:10px"><span style="flex:1"></span><span style="width:72px;text-align:center;font-size:10px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.5px">Qty</span><span style="width:54px;text-align:center;font-size:10px;font-weight:800;color:var(--acc);text-transform:uppercase;letter-spacing:.5px">Price</span><span style="width:28px"></span></div>'+pending.map(vegRow).join(''):'<div class="empty-state"><div class="ei">🥦</div><p>All vegetables bought!</p></div>';
  body+='<div style="margin-top:14px"><div class="inline-add"><input type="text" id="vat" placeholder="Add vegetable…" maxlength="60"><button data-a="vadd">Add</button></div></div>';
  if(bought.length){
   var byDate={};
   bought.forEach(function(x){var dk=x.boughtOn||"unknown";(byDate[dk]=byDate[dk]||[]).push(x);});
   var dateKeys=Object.keys(byDate).sort().reverse();
   body+='<div style="margin-top:20px">';
   dateKeys.forEach(function(dk){
    var label=dk==="unknown"?"Earlier":"Bought "+new Date(dk+"T12:00:00").toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric"});
    var total=byDate[dk].reduce(function(s,x){var p=parseFloat(x.price);return s+(isNaN(p)?0:p);},0);
    body+='<div style="font-size:12px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.5px;margin:14px 0 6px">🛒 '+esc(label)+(total?'<span style="font-weight:700;color:var(--acc);text-transform:none;letter-spacing:0"> &nbsp;·&nbsp; ₹'+total.toLocaleString("en-IN")+' overall</span>':'')+'</div>';
    byDate[dk].forEach(function(x){
     body+='<div class="vi done">'
      +'<div class="vi-main">'
      +'<button class="vi-chk" data-a="vtog" data-id="'+x.id+'" style="background:#16a34a">✓</button>'
      +'<div style="flex:1;min-width:0"><div class="vi-name" style="text-decoration:line-through;color:var(--mute)">'+esc(x.t)+'</div>'+(x.qty||x.price?'<span style="font-size:12px;color:var(--mute)">'+(x.qty?esc(x.qty):'')+(x.qty&&x.price?' · ':'')+( x.price?'₹'+esc(x.price):'')+'</span>':'')+'</div>'
      +'<button class="vi-del" data-a="gdel" data-id="'+x.id+'">🗑</button>'
      +'</div></div>';
    });
   });
   body+='</div>';
  }
 } else {
  SC.filter(function(s){return s.m===k;}).forEach(function(s){
   var a=st.items.filter(function(x){return x.s===s.id&&!x.d&&!x.today;});
   var html=a.length?a.map(function(x){return taskRow(x,false);}).join(""):'<div class="empty-state"><div class="ei">📋</div><p>Nothing waiting here</p></div>';
   html+=inlineAdd(s.id);
   if(s.note)html+='<p class="note" style="margin-top:6px">'+esc(s.note)+'</p>';
   body+=subsec(nm("s-"+s.id,s.n),a.length,html);
  });
 }
 return body;
}

function openCatPage(k){
 currentCat=k;
 $("cat-page-title").textContent=nm("m-"+k,M[k]);
 $("cat-page-body").innerHTML=renderCatPage(k);
 $("cat-page").scrollTop=0;
 $("cat-page").classList.add("open");
 attachCatPageEvents();
}
function closeCatPage(){
 $("cat-page").classList.remove("open");
 setTimeout(function(){currentCat=null;},300);
}
$("back-btn").onclick=closeCatPage;

function attachCatPageEvents(){
 Array.prototype.forEach.call(document.querySelectorAll(".macc-hd"),function(hd){
  hd.onclick=function(){
   var m=hd.parentElement;var id=m.getAttribute("data-macc");
   m.classList.toggle("open");macc.open[id]=m.classList.contains("open");
  };
 });
 Array.prototype.forEach.call(document.querySelectorAll(".gi-date"),function(inp){
  inp.onchange=function(){
   var g=st.g.filter(function(x){return x.id===inp.getAttribute("data-id");})[0];if(!g)return;
   var q=inp.value.split("-");g.ts=new Date(+q[0],+q[1]-1,+q[2],12).getTime();save();renderAll();
  };
 });
 Array.prototype.forEach.call(document.querySelectorAll(".gqty-inp"),function(inp){
  inp.onchange=function(){var g=st.g.filter(function(x){return x.id===inp.getAttribute("data-id");})[0];if(!g)return;g.qty=inp.value.trim();save();};
  inp.addEventListener("click",function(e){e.stopPropagation();});
 });
 Array.prototype.forEach.call(document.querySelectorAll(".gprc-inp"),function(inp){
  inp.onchange=function(){var g=st.g.filter(function(x){return x.id===inp.getAttribute("data-id");})[0];if(!g)return;g.price=inp.value.trim();save();};
  inp.addEventListener("click",function(e){e.stopPropagation();});
 });
 Array.prototype.forEach.call(document.querySelectorAll(".vqty-inp"),function(inp){
  inp.onchange=function(){var g=st.g.filter(function(x){return x.id===inp.getAttribute("data-id");})[0];if(!g)return;g.qty=inp.value.trim();save();};
  inp.addEventListener("click",function(e){e.stopPropagation();});
 });
 Array.prototype.forEach.call(document.querySelectorAll(".vprc-inp"),function(inp){
  inp.onchange=function(){var g=st.g.filter(function(x){return x.id===inp.getAttribute("data-id");})[0];if(!g)return;g.price=inp.value.trim();save();};
  inp.addEventListener("click",function(e){e.stopPropagation();});
 });
}
