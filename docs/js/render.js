// render.js - All HTML rendering functions

function dueBadge(x){
 var d=dueDays(x);if(d===null)return "";
 if(d<0)return '<span class="badge badge-over">Overdue</span>';
 if(d===0)return '<span class="badge badge-today">Due today</span>';
 if(d===1)return '<span class="badge badge-today">Due tomorrow</span>';
 var p=x.due.split("-");
 return '<span class="badge badge-soon">Due '+new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString(undefined,{day:"numeric",month:"short"})+'</span>';
}

function taskRow(x,isToday){
 var urgent=pr(x)===1&&!x.d;
 var cls='tc'+(isToday?' big':'')+(x.d?' done':'')+(urgent?' urgent':'');
 var meta='<div class="tc-meta">';
 if(isToday){
  meta+='<span class="badge badge-pri">'+esc(PL[pr(x)])+'</span>';
  var blk=x.block||'morning';
  meta+='<span class="tc-block badge" data-id="'+x.id+'" style="background:'+TBC[blk]+'22;color:'+TBC[blk]+';cursor:pointer">'+TBL[blk]+'</span>';
 }
 meta+=dueBadge(x);
 if(x.rec)meta+='<span class="badge badge-rec">🔁 recurring</span>';
 meta+='</div>';
 var acts='<div class="tc-actions">';
 if(!x.d){
  if(isToday){
   if(x.s==='shop')acts+='<button class="ia" data-a="gopen" data-id="'+x.id+'" title="Open grocery list">🛒</button>';
   acts+='<button class="ia" data-a="back" data-id="'+x.id+'" title="Remove from Today">←</button>';
  } else {
   acts+='<button class="ia" data-a="top" data-id="'+x.id+'" title="Move to top">↑</button>';
  }
  acts+='<button class="ia" data-a="edit" data-id="'+x.id+'" title="Edit">✏️</button>';
 }
 acts+='<button class="ia del" data-a="del" data-id="'+x.id+'" title="Delete">🗑</button></div>';
 return '<div class="'+cls+'" data-id="'+x.id+'">'
  +'<div class="tc-inner">'
  +'<button class="tc-chk" data-a="tog" data-id="'+x.id+'">'+(x.d?'✓':'')+'</button>'
  +'<div class="tc-body"><div class="tc-text">'+esc(x.t)+'</div>'+meta+'</div>'
  +acts
  +'</div>'
  +'<div class="swipe-bg">✅</div>'
  +'</div>';
}

function giRow(x){
 var b="";
 if(x.k==="next")b='<button class="gi-act" data-a="gbuy" data-id="'+x.id+'">Buy now</button>';
 else if(x.k==="done"&&x.ts)b='<input type="date" class="gi-date" data-id="'+x.id+'" value="'+isoDate(x.ts)+'" aria-label="Bought on">';
 else if(x.k==="week")b='<button class="gi-act del" data-a="gdel" data-id="'+x.id+'">🗑</button>';
 return '<div class="gi'+(x.d?" done":"")+'">'
  +'<button class="gi-chk" data-a="gtog" data-id="'+x.id+'">'+(x.d?"✓":"")+'</button>'
  +'<div style="flex:1;min-width:0"><div class="gi-name">'+esc(x.t)+'</div></div>'
  +b+'</div>';
}

function storeEmoji(name){
 var n=name.toLowerCase();
 if(n.indexOf('dmart')>=0||n.indexOf('d-mart')>=0)return '🏬';
 if(n.indexOf('zepto')>=0)return '⚡';
 if(n.indexOf('blinkit')>=0)return '🟡';
 if(n.indexOf('bigbasket')>=0||n.indexOf('big basket')>=0)return '🧺';
 if(n.indexOf('instamart')>=0)return '🛍';
 if(n.indexOf('flipkart')>=0)return '📦';
 if(n.indexOf('swiggy')>=0||n.indexOf('minutes')>=0)return '🟠';
 if(n.indexOf('amazon')>=0)return '📦';
 if(n.indexOf('jiomart')>=0||n.indexOf('jio')>=0)return '🔵';
 if(n.indexOf('meesho')>=0)return '🛒';
 if(n.indexOf('market')>=0||n.indexOf('bazaar')>=0||n.indexOf('bazar')>=0)return '🏪';
 if(n.indexOf('general')>=0||n.indexOf('kirana')>=0||n.indexOf('local')>=0)return '🏘';
 if(n.indexOf('medical')>=0||n.indexOf('pharmacy')>=0||n.indexOf('chemist')>=0)return '💊';
 if(n.indexOf('bakery')>=0)return '🥖';
 if(n.indexOf('dairy')>=0||n.indexOf('milk')>=0)return '🥛';
 if(n.indexOf('meat')>=0||n.indexOf('chicken')>=0||n.indexOf('fish')>=0)return '🥩';
 if(n.indexOf('fruit')>=0||n.indexOf('veg')>=0)return '🥦';
 return '🏪';
}
function storeIcon(x){
 if(!x.store)return {icon:'🏪',label:'Set store',cls:''};
 if(x.store.indexOf('custom:')===0){var nm=x.store.slice(7);return {icon:storeEmoji(nm),label:nm,cls:'store-general'};}
 return {icon:storeEmoji(x.store),label:x.store,cls:'store-general'};
}

function gmRow(x){
 var l=lbOf(x.t);
 var si=storeIcon(x);
 return '<div class="gi">'
  +'<div style="flex:1;min-width:0"><div class="gi-name">'+esc(x.t)+'</div>'+(l?'<span class="gi-meta">Last bought '+fmtShort(l)+'</span>':"")+'</div>'
  +'<input type="text" class="gqty-inp" data-id="'+x.id+'" value="'+esc(x.qty||'')+'" placeholder="qty" maxlength="10" style="width:72px;font:600 12px Nunito,sans-serif;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:8px;padding:4px 6px;text-align:center;flex-shrink:0">'
  +'<button class="gi-act" data-a="setstore" data-id="'+x.id+'" title="'+(x.store?esc(si.label):'Set store')+'" style="font-size:16px;width:36px;text-align:center;padding:4px 2px;flex-shrink:0">'+(x.store?si.icon:'📍')+'</button>'
  +'<button class="gi-act" data-a="gnow" data-id="'+x.id+'">'+(x.n?"✅ In list":"+ Buy now")+'</button>'
  +'<div style="display:flex;gap:6px;flex-shrink:0">'
  +'<button class="gi-act" data-a="gmedit" data-id="'+x.id+'" title="Edit" style="font-size:15px;padding:4px 6px">&#9998;</button>'
  +'<button class="gi-act del" data-a="gdel" data-id="'+x.id+'">🗑</button>'
  +'</div>'
  +'</div>';
}

function gnRow(x){
 var si=storeIcon(x);
 var sb=x.store?'<span class="store-badge '+si.cls+'">'+si.icon+' '+esc(si.label)+'</span>':'';
 return '<div class="gi">'
  +'<button class="gi-chk" data-a="gbought" data-id="'+x.id+'"></button>'
  +'<div style="flex:1;min-width:0"><div class="gi-name">'+esc(x.t)+'</div>'+(sb?'<span style="font-size:11px">'+sb+'</span>':'')+'</div>'
  +'<input type="text" class="gqty-inp" data-id="'+x.id+'" value="'+esc(x.qty||'')+'" placeholder="qty" maxlength="10" style="width:72px;font:600 12px Nunito,sans-serif;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:8px;padding:4px 6px;text-align:center;flex-shrink:0">'
  +'<input type="text" class="gprc-inp" data-id="'+x.id+'" value="'+esc(x.price||'')+'" placeholder="₹" maxlength="8" style="width:60px;font:600 12px Nunito,sans-serif;color:var(--acc);background:var(--bg);border:1.5px solid var(--line);border-radius:8px;padding:4px 6px;text-align:center;flex-shrink:0">'
  +'<div style="display:flex;gap:6px;flex-shrink:0">'
  +'<button class="gi-act" data-a="gmedit" data-id="'+x.id+'" title="Edit" style="font-size:15px;padding:4px 6px">&#9998;</button>'
  +'<button class="gi-act del" data-a="gdel" data-id="'+x.id+'" style="font-size:15px;padding:4px 6px">&#128465;</button>'
  +'</div>'
  +'</div>';
}

function vegRow(x){
 var lastTs=0;
 st.g.forEach(function(g){if(g.k==="vdone"&&g.ref===x.id&&g.ts>lastTs)lastTs=g.ts;});
 return '<div class="vi" data-id="'+x.id+'">'
  +'<div class="vi-main">'
  +'<button class="vi-chk" data-a="vtog" data-id="'+x.id+'"></button>'
  +'<div style="flex:1;min-width:0">'
  +'<div class="vi-name">'+esc(x.t)+'</div>'
  +(lastTs?'<span class="vi-last">Last: '+fmt(lastTs)+'</span>':"")
  +'</div>'
  +'<input type="text" class="vqty-inp" data-id="'+x.id+'" value="'+esc(x.qty||'')+'" placeholder="qty" maxlength="10" style="width:72px;font:600 13px Nunito,sans-serif;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:8px;padding:5px 7px;text-align:center;flex-shrink:0">'
  +'<input type="text" class="vprc-inp" data-id="'+x.id+'" value="'+esc(x.price||'')+'" placeholder="₹" maxlength="8" style="width:54px;font:600 13px Nunito,sans-serif;color:var(--acc);background:var(--bg);border:1.5px solid var(--line);border-radius:8px;padding:5px 7px;text-align:center;flex-shrink:0">'
  +'<button class="vi-del" data-a="gdel" data-id="'+x.id+'">🗑</button>'
  +'</div>'
  +'</div>';
}

function macc(id,title,body){
 var open=macc.open&&macc.open[id];
 return '<div class="macc'+(open?" open":"")+'" data-macc="'+id+'">'
  +'<div class="macc-hd"><span>'+title+'</span><span class="arr">▾</span></div>'
  +'<div class="macc-body">'+body+'</div>'
  +'</div>';
}
macc.open={};

function subsec(title,cnt,body,secId){
 return '<div class="subsec">'
  +'<div class="subsec-title"><span>'+title+'</span><span class="cnt">'+cnt+'</span>'
  +(secId?'<button class="cc-edit-btn" data-a="renameSec" data-sec="'+secId+'" title="Rename section" style="margin-left:auto">···</button>':'')
  +'</div>'
  +body
  +'</div>';
}

function inlineAdd(secId,ph){
 return '<div class="inline-add" style="margin-top:10px">'
  +'<input type="text" placeholder="'+(ph||"Quick add…")+'" maxlength="200" data-sec="'+secId+'">'
  +'<button data-a="qadd" data-sec="'+secId+'">Add</button>'
  +'</div>';
}

function renderTodayList(){
 var t=tl();
 var filtered=activeTB==='all'?t:t.filter(function(x){return (x.block||'morning')===activeTB;});
 var el=$('today-list');
 if(!filtered.length){
  el.innerHTML='<div class="empty-state"><div class="ei">'+(activeTB==='all'?'📋':TB_LABELS[activeTB]||'📋')+'</div><p>'+(activeTB==='all'?'Your Today list is empty.':'No tasks for this time block.')+'</p></div>';
  return;
 }
 el.innerHTML=filtered.map(function(x){return taskRow(x,true);}).join('');
 filtered.forEach(function(x){
  var el2=document.querySelector('#today-list [data-id="'+x.id+'"]');
  if(el2)attachSwipe(el2,x.id);
 });
}

function renderAll(){
 var h=new Date().getHours();
 var greet=h<12?"Good morning":h<18?"Good afternoon":h<21?"Good evening":"Good night";
 $("hi").textContent=greet+(typeof _getFirstName==='function'&&_getFirstName()?', '+_getFirstName():'');
 $("hero-greeting").textContent=greet+" ☀️";
 $("hero-date").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"});
 var t=tl(),dn=t.filter(function(x){return x.d;}).length;
 var dots="";for(var i=0;i<5;i++)dots+='<span class="'+(i<dn?"on":"")+'"></span>';
 $("hero-dots").innerHTML=dots;
 $("hero-prog").textContent=t.length?(dn+" of "+t.length+" done today"):"Nothing in Today yet";
 var sc=st.streak&&st.streak.count||0;
 $("hero-streak").innerHTML=sc>1?'<div class="hero-streak">🔥 '+sc+' day streak</div>':"";
 var total=st.items.filter(function(x){return !x.d;}).length;
 var urgent=st.items.filter(function(x){return pr(x)===1&&!x.d;}).length;
 var overdue=st.items.filter(function(x){var d=dueDays(x);return d!==null&&d<0&&!x.d;}).length;
 $("stats-row").innerHTML=
  '<div class="stat-card"><div class="sv sv-green">'+total+'</div><div class="sl">Open tasks</div></div>'+
  '<div class="stat-card"><div class="sv sv-red">'+urgent+'</div><div class="sl">Urgent</div></div>'+
  '<div class="stat-card"><div class="sv sv-amber">'+overdue+'</div><div class="sl">Overdue</div></div>';
 var bhtml="";
 var dow=new Date().getDay(),vleft=st.g.filter(function(x){return x.k==="week"&&!x.d;}).length;
 if((dow===5||dow===6)&&vleft>0){
  bhtml+='<div class="banner banner-veg"><div class="bi">🥬</div><div class="bt"><b>Vegetable day!</b><span>'+vleft+' items left this week</span></div><button class="bact" data-a="gveg">Open</button></div>';
 }
 if(complete()&&canFill()){
  var _fn=typeof _getFirstName==='function'&&_getFirstName()?', '+_getFirstName():'';
  bhtml+='<div class="banner banner-fin" id="fin-banner"><div class="bi">🎉</div><div class="bt"><b>Today complete!</b><span>Well done'+_fn+'.</span></div><button class="bact" id="next-btn2">Next items</button></div>';
 }
 if(st.bk&&Date.now()-st.bk>14*864e5){
  bhtml+='<div class="banner banner-bk"><div class="bi">💾</div><div class="bt"><b>Time for a backup</b><span>It\'s been a while</span></div><button class="bact" data-a="gbk">Back up</button></div>';
 }
 // Bill amounts nudge — sub-bills missing amount this month
 var curMon=new Date().getFullYear()+'-'+('0'+(new Date().getMonth()+1)).slice(-2);
 if(st.subBills&&st.subBills.length){
  var needAmt=st.subBills.filter(function(s){return !s.paid&&!(s.amtHistory&&s.amtHistory[curMon]);}).length;
  if(needAmt>0)bhtml+='<div class="banner banner-bk"><div class="bi">📋</div><div class="bt"><b>'+needAmt+' bill'+(needAmt>1?'s':'')+' need amounts</b><span>Add ₹ for '+new Date().toLocaleDateString(undefined,{month:'long'})+'</span></div><button class="bact" data-a="gbills">Update</button></div>';
 }
 var allDueBills=[];
 if(st.bills)st.bills.forEach(function(b){
  if(!b.paid){var d=lifeDueDays(b.due);if(d!==null&&d<=2)allDueBills.push({name:b.name,due:b.due,dd:d,amt:b.amt,payUrl:b.payUrl});}
 });
 if(st.subBills)st.subBills.forEach(function(s){
  if(!s.paid){
   var d=lifeDueDays(subDueDate(s.dueDay));
   if(d!==null&&d<=2){
    var parent=st.bills?st.bills.filter(function(b){return b.id===s.parentId;})[0]:null;
    var portal=typeof getBillPortal==='function'?getBillPortal(s.parentId):null;
    var payUrl=s.payUrl||(portal&&portal.payUrl)||null;
    allDueBills.push({name:(parent?parent.name+' — ':'')+s.name,due:subDueDate(s.dueDay),dd:d,amt:s.amt,payUrl:payUrl});
   }
  }
 });
 allDueBills.sort(function(a,b){return a.dd-b.dd;});
 allDueBills.forEach(function(b){
  var lbl=b.dd<0?'Overdue':b.dd===0?'Due today':b.dd===1?'Due tomorrow':'Due in 2 days';
  var cls=b.dd<0?'banner-over':b.dd<=1?'banner-fin':'banner-bk';
  bhtml+='<div class="banner '+cls+'"><div class="bi">💳</div><div class="bt"><b>'+esc(b.name)+'</b><span>'+lbl+(b.amt?' — ₹'+b.amt:'')+'</span></div>'+(b.payUrl?'<a href="'+b.payUrl+'" target="_blank" rel="noopener" class="bact" style="text-decoration:none">Pay now</a>':'<button class="bact" data-a="gbills">View</button>')+'</div>';
 });
 $("banners").innerHTML=bhtml;
 if($("next-btn2"))$("next-btn2").onclick=function(){fill();save();renderAll();};
 renderTodayList();
 $("fin-wrap").hidden=true;
 var nbt=$("nb-today");nbt.textContent=dn+"/"+t.length;nbt.hidden=!t.length;
 var urgCnt=st.items.filter(function(x){return pr(x)===1&&!x.d&&!x.today;}).length;
 var nbl=$("nb-lists");nbl.textContent=urgCnt;nbl.hidden=!urgCnt;
 var grid=$("cat-grid");
 if(grid){
  grid.innerHTML=Object.keys(M).filter(function(k){return k!=='C'&&k!=='V';}).map(function(k){
   var cnt=st.items.filter(function(x){return !x.d&&!x.today&&SEC[x.s]&&SEC[x.s].m===k;}).length;
   var urgK=st.items.filter(function(x){return !x.d&&!x.today&&SEC[x.s]&&SEC[x.s].m===k&&pr(x)===1;}).length;
   return '<div class="cat-card '+MCLS[k]+'" data-cat="'+k+'">'
    +(urgK?'<span class="cc-badge">'+urgK+' urgent</span>':'')
    +'<button class="cc-edit-btn" data-a="dotmenu" data-dtype="cat" data-dkey="'+k+'">···</button>'
    +'<span class="cc-icon">'+MICON[k]+'</span>'
    +'<div class="cc-name">'+esc(nm('m-'+k,M[k]))+'</div>'
    +'<div class="cc-cnt">'+cnt+' items</div>'
    +'</div>';
  }).join('')
  +(st.catExtra||[]).map(function(e){
   var cnt=st.items.filter(function(x){return x.s===e.id&&!x.d&&!x.today;}).length;
   return '<div class="cat-card cat-D" data-catextra="'+e.id+'">'
    +'<button class="cc-edit-btn" data-a="dotmenu" data-dtype="catextra" data-dkey="'+e.id+'">···</button>'
    +'<span class="cc-icon">'+esc(e.icon||'📌')+'</span>'
    +'<div class="cc-name">'+esc(e.label)+'</div>'
    +'<div class="cc-cnt">'+cnt+' items</div>'
    +'</div>';
  }).join('')
  +(st.secExtra||[]).map(function(e){
   var cnt=st.items.filter(function(x){return x.s===e.id&&!x.d&&!x.today;}).length;
   return '<div class="cat-card '+(MCLS[e.m]||'cat-D')+'" data-cat="'+e.m+'" data-secextra="'+e.id+'">'
    +'<button class="cc-edit-btn" data-a="dotmenu" data-dtype="secextra" data-dkey="'+e.id+'">···</button>'
    +'<span class="cc-icon">'+esc(e.icon||'📌')+'</span>'
    +'<div class="cc-name">'+esc(e.label)+'</div>'
    +'<div class="cc-cnt">'+cnt+' items</div>'
    +'</div>';
  }).join('');
 }
 var gg=$('groc-grid');
 if(gg){
  gg.innerHTML=['C','V'].map(function(k){
   var cnt=0;
   if(k==='C'){var nowM=st.g.filter(function(x){return x.k==='rec'&&x.n;}).length;cnt=st.g.filter(function(x){return x.k==='cur'&&!x.d;}).length+nowM;}
   else cnt=st.g.filter(function(x){return x.k==='week'&&!x.d;}).length;
   return '<div class="cat-card '+MCLS[k]+'" data-cat="'+k+'">'
    +'<button class="cc-edit-btn" data-a="dotmenu" data-dtype="cat" data-dkey="'+k+'">···</button>'
    +'<span class="cc-icon">'+MICON[k]+'</span>'
    +'<div class="cc-name">'+esc(nm('m-'+k,M[k]))+'</div>'
    +'<div class="cc-cnt">'+cnt+' items</div>'
    +'</div>';
  }).join('')
  +(st.gExtra||[]).map(function(e){
   var cnt=st.g.filter(function(x){return x.grp===e.id&&!x.d;}).length;
   return '<div class="cat-card cat-C" data-cat="C" data-gextra="'+e.id+'">'
    +'<button class="cc-edit-btn" data-a="dotmenu" data-dtype="gextra" data-dkey="'+e.id+'">···</button>'
    +'<span class="cc-icon">'+esc(e.icon||'🛋')+'</span>'
    +'<div class="cc-name">'+esc(e.label)+'</div>'
    +'<div class="cc-cnt">'+cnt+' items</div>'
    +'</div>';
  }).join('');
 }
 var lg=$('life-grid');
 if(lg){
  var LDEF=[
   {k:'bills',icon:'💳',label:'Bills',cls:'cat-bills',cnt:function(){return st.bills.filter(function(x){return !x.paid;}).length;},badge:function(){return st.bills.filter(function(x){var d=lifeDueDays(x.due);return !x.paid&&d!==null&&d<=3;}).length;}},
   {k:'emis',icon:'🏦',label:'EMIs & Chits',cls:'cat-emis',cnt:function(){return st.emis.filter(function(x){return !x.paid;}).length;},badge:function(){return st.emis.filter(function(x){var d=lifeDueDays(x.due);return !x.paid&&d!==null&&d<=3;}).length;}},
   {k:'invest',icon:'📈',label:'Investments',cls:'cat-invest',cnt:function(){return st.invest.filter(function(x){return !x.paid;}).length;},badge:function(){return 0;}},
   {k:'health',icon:'💊',label:'Health',cls:'cat-health',cnt:function(){return st.health.length;},badge:function(){return st.health.filter(function(x){var d=lifeDueDays(x.due);return d!==null&&d<=3;}).length;}},
   {k:'biz2',icon:'🚀',label:'Business',cls:'cat-biz2',cnt:function(){return st.biz2.ideas.length;},badge:function(){return 0;}}
  ];
  lg.innerHTML=LDEF.map(function(d){
   var c=d.cnt(),b=d.badge();
   return '<div class="cat-card '+d.cls+'" data-lv="'+d.k+'">'
    +(b?'<span class="cc-badge">'+b+' due</span>':'')
    +'<button class="cc-edit-btn" data-a="dotmenu" data-dtype="life" data-dkey="'+d.k+'">···</button>'
    +'<button class="cc-add-btn" data-a="quickAddLife" data-lk="'+d.k+'">+</button>'
    +'<span class="cc-icon">'+d.icon+'</span>'
    +'<div class="cc-name">'+esc(nm('l-'+d.k,d.label))+'</div>'
    +'<div class="cc-cnt">'+c+' item'+(c!==1?'s':'')+'</div>'
    +'</div>';
  }).join('')
  +(st.lifeExtra||[]).map(function(e){
   var c=(st.lifeItems&&st.lifeItems[e.id]||[]).length;
   return '<div class="cat-card cat-biz2" data-lv="x-'+e.id+'">'
    +'<button class="cc-edit-btn" data-a="dotmenu" data-dtype="lifeextra" data-dkey="'+e.id+'">···</button>'
    +'<button class="cc-add-btn" data-a="quickAddLifeExtra" data-leid="'+e.id+'">+</button>'
    +'<span class="cc-icon">'+esc(e.icon||'📌')+'</span>'
    +'<div class="cc-name">'+esc(e.label)+'</div>'
    +'<div class="cc-cnt">'+c+' item'+(c!==1?'s':'')+'</div>'
    +'</div>';
  }).join('');
 }
 if(currentLife){$('life-page-body').innerHTML=renderLifePage(currentLife);}
 if(currentCat){
  if(currentCat.indexOf('ce-')===0){$("cat-page-body").innerHTML=renderCatExtraPage(currentCat.slice(3));attachCatPageEvents();}
  else{$("cat-page-body").innerHTML=renderCatPage(currentCat);attachCatPageEvents();}
 }
 // Update list section headers
 var lshg=$('lsh-groc');if(lshg)lshg.textContent=nm('lsec-groc','🛒 Groceries');
 var lshl=$('lsh-life');if(lshl)lshl.textContent=nm('lsec-life','🌱 Life OS');
 var lsht=$('lsh-tasks');if(lsht)lsht.textContent=nm('lsec-tasks','✅ Quick Tasks');
}
