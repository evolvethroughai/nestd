// life.js - Life OS: bills, emis, invest, health, business

function lifeDueDays(due){
 if(!due)return null;
 var p=due.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]),t=new Date();t.setHours(0,0,0,0);
 return Math.round((d-t)/864e5);
}
function lifeDueCls(dd){
 if(dd===null)return 'ok';
 if(dd<0)return 'overdue';
 if(dd===0)return 'today';
 if(dd<=5)return 'soon';
 return 'ok';
}
function lifeDueLbl(dd,due){
 if(dd===null)return '';
 if(dd<0)return 'Overdue';
 if(dd===0)return 'Due today';
 if(dd===1)return 'Due tomorrow';
 if(due)return 'Due '+new Date(due+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short'});
 return '';
}

function lcRow(item,type){
 var dd=lifeDueDays(item.due);
 var cls=lifeDueCls(dd);
 var lbl=lifeDueLbl(dd,item.due);
 var icons={bills:'💡',emis:'🚗',invest:'📈',health:'💊'};
 var icon=item.icon||icons[type]||'📌';
 var html='<div class="lc"><div class="lc-row">';
 if(type==='bills'){
  if(!st.subBills)st.subBills=[];
  var subCount=st.subBills.filter(function(s){return s.parentId===item.id;}).length;
  var isOpen=billWithSubs.open&&billWithSubs.open[item.id];
  html+='<button class="lc-toggle" data-la="lsubtoggle" data-lid="'+item.id+'" title="Show connections">'
   +'<span class="lc-toggle-icon">'+icon+'</span>'
   +'<div class="lc-body"><div class="lc-name">'+esc(item.name)+(subCount?'<span class="lc-subcnt">'+subCount+'</span>':'')+'</div>'+(item.note?'<div class="lc-meta">'+esc(item.note)+'</div>':'')+'</div>'
   +'<span class="lc-chev">'+(isOpen?'&#9650;':'&#9660;')+'</span>'
   +'</button>';
 } else {
  html+='<span class="lc-icon">'+icon+'</span>';
  html+='<div class="lc-body"><div class="lc-name">'+esc(item.name)+'</div>';
  if(item.note)html+='<div class="lc-meta">'+esc(item.note)+'</div>';
  html+='</div>';
 }
 if(item.amt)html+='<div class="lc-amt">&#8377;'+esc(item.amt)+'</div>';
 if(lbl)html+='<span class="lc-due '+cls+'">'+lbl+'</span>';
 if(type==='bills'||type==='emis'||type==='invest'){
  html+='<button class="lc-paid'+(item.paid?' done':'')+'" data-la="lpaid" data-lid="'+item.id+'" data-ltype="'+type+'">'+(item.paid?'&#10003;':'')+'</button>';
 }
 html+='<button class="lc-act" data-la="ledit" data-lid="'+item.id+'" data-ltype="'+type+'">&#9998;</button>';
 html+='<button class="lc-act del" data-la="ldel" data-lid="'+item.id+'" data-ltype="'+type+'">&#128465;</button>';
 html+='</div></div>';
 return html;
}

function subDueDate(dueDay){
 if(!dueDay)return null;
 var n=new Date(),y=n.getFullYear(),m=n.getMonth();
 var d=new Date(y,m,dueDay);
 if(d<n&&n.getDate()>dueDay)d=new Date(y,m+1,dueDay);
 var mm=('0'+(d.getMonth()+1)).slice(-2),dd2=('0'+d.getDate()).slice(-2);
 return d.getFullYear()+'-'+mm+'-'+dd2;
}

function lcSubRow(sub,parentId){
 var due=subDueDate(sub.dueDay);
 var dd=lifeDueDays(due);
 var cls=lifeDueCls(dd);
 var lbl=lifeDueLbl(dd,due);
 var curMon=new Date().getFullYear()+'-'+('0'+(new Date().getMonth()+1)).slice(-2);
 var hist=sub.amtHistory||{};
 var curAmt=hist[curMon]||'';
 var months=Object.keys(hist).sort().reverse();
 var lastMon=months.filter(function(m){return m!==curMon;})[0];
 var lastAmt=lastMon?hist[lastMon]:null;
 var html='<div class="lc" style="margin-left:28px;border-left:3px solid var(--acc);padding-left:8px;margin-top:4px"><div class="lc-row" style="flex-wrap:wrap;gap:4px">';
 html+='<span class="lc-icon" style="font-size:14px">↳</span>';
 html+='<div class="lc-body"><div class="lc-name" style="font-size:13px">'+esc(sub.name)+'</div>';
 if(sub.note)html+='<div class="lc-meta">'+esc(sub.note)+'</div>';
 var portal2=getBillPortal(parentId);
 if(sub.consumerNo)html+='<div style="display:flex;align-items:center;gap:6px;margin-top:3px">'
  +'<span style="font-size:11px;font-weight:700;color:var(--ink)">'+(portal2&&portal2.match==='electricity'?'USC':'CA')+': '+esc(sub.consumerNo)+'</span>'
  +'<button data-la="lcopycano" data-consno="'+esc(sub.consumerNo)+'" style="font-size:10px;font-weight:800;background:var(--soft);color:var(--acc);border:0;border-radius:6px;padding:2px 8px;cursor:pointer;line-height:1.6">Copy</button>'
  +'</div>';
 if(lastAmt)html+='<div class="lc-meta" style="color:var(--mute)">Last: ₹'+lastAmt+'</div>';
 var checkUrl=billCheckUrl(sub,parentId);
 var portal=getBillPortal(parentId);
 var payUrl=portal&&portal.payUrl?portal.payUrl:null;
 if(checkUrl||payUrl){
  html+='<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">';
  if(checkUrl)html+='<a href="'+checkUrl+'" target="_blank" rel="noopener" style="font-size:11px;font-weight:800;color:var(--acc);text-decoration:none;background:var(--soft);border-radius:6px;padding:3px 9px;display:inline-block">🔗 Check bill</a>';
  if(payUrl)html+='<a href="'+payUrl+'" target="_blank" rel="noopener" style="font-size:11px;font-weight:800;color:#fff;text-decoration:none;background:#f90;border-radius:6px;padding:3px 9px;display:inline-block">💳 Pay now</a>';
  html+='</div>';
 }
 html+='</div>';
 html+='<input type="text" inputmode="numeric" placeholder="₹ this month" maxlength="8" data-la="lsubamt" data-lid="'+sub.id+'" data-lpid="'+parentId+'" value="'+esc(curAmt)+'" style="width:90px;font:700 13px Nunito,sans-serif;color:var(--acc);background:var(--bg);border:1.5px solid '+(curAmt?'var(--acc)':'var(--line)')+';border-radius:8px;padding:4px 6px;text-align:center;flex-shrink:0">';
 if(lbl)html+='<span class="lc-due '+cls+'" style="font-size:11px">'+lbl+'</span>';
 html+='<button class="lc-paid'+(sub.paid?' done':'')+'" data-la="lsubpaid" data-lid="'+sub.id+'" data-lpid="'+parentId+'">'+(sub.paid?'&#10003;':'')+'</button>';
 html+='<button class="lc-act" data-la="lsubedit" data-lid="'+sub.id+'" data-lpid="'+parentId+'">&#9998;</button>';
 html+='<button class="lc-act del" data-la="lsubdel" data-lid="'+sub.id+'" data-lpid="'+parentId+'">&#128465;</button>';
 html+='</div></div>';
 return html;
}

function billWithSubs(item){
 if(!st.subBills)st.subBills=[];
 var curMon=new Date().getFullYear()+'-'+('0'+(new Date().getMonth()+1)).slice(-2);
 var subs=st.subBills.filter(function(s){return s.parentId===item.id;});
 subs.forEach(function(s){if(s.paid&&s.paidMonth&&s.paidMonth!==curMon){s.paid=false;}});
 var open=billWithSubs.open&&billWithSubs.open[item.id];
 var unpaidSubs=subs.filter(function(s){return !s.paid;}).length;
 var html=lcRow(item,'bills');
 if(subs.length||true){
  html+='<div class="lc-subs" id="lcsubs-'+item.id+'" style="'+(open?'':'display:none')+'">';
  subs.forEach(function(s){html+=lcSubRow(s,item.id);});
  html+='<button class="lc-act" data-la="lsubadd" data-lid="'+item.id+'" style="margin:6px 0 2px 28px;font-size:12px;color:var(--acc);font-weight:700">+ Add connection</button>';
  html+='</div>';
 }
 return html;
}
billWithSubs.open={};

function renderLifePage(type){
 var body='';
 if(type==='bills'){
  var mon=new Date().toLocaleDateString(undefined,{month:'long',year:'numeric'});
  if(!st.bills)st.bills=[];
  var monthly=st.bills.filter(function(x){return !x.yearly;});
  var yearly=st.bills.filter(function(x){return x.yearly;});
  var unpaidM=monthly.filter(function(x){return !x.paid;});
  var paidM=monthly.filter(function(x){return x.paid;});
  var totalUnpaid=unpaidM.reduce(function(s,x){var a=parseFloat(x.amt);return s+(isNaN(a)?0:a);},0);
  body+='<div style="background:var(--soft);border-radius:14px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">'
   +'<div><div style="font-size:12px;font-weight:800;color:var(--acc);text-transform:uppercase;letter-spacing:.5px">'+mon+'</div>'
   +'<div style="font-size:13px;color:var(--mute);margin-top:2px">'+unpaidM.length+' unpaid — '+paidM.length+' paid</div></div>'
   +(totalUnpaid?'<div style="font-size:20px;font-weight:900;color:var(--acc)">&#8377;'+totalUnpaid.toLocaleString('en-IN')+'</div>':'')
   +'</div>';
  if(unpaidM.length){body+='<div class="life-section"><div class="life-sec-hd">&#128197; Monthly — Pending <span class="lsh-cnt">'+unpaidM.length+'</span></div>'+unpaidM.map(function(x){return billWithSubs(x);}).join('')+'</div>';}
  if(paidM.length){body+='<div class="life-section"><div class="life-sec-hd">&#10003; Paid <span class="lsh-cnt">'+paidM.length+'</span></div>'+paidM.map(function(x){return billWithSubs(x);}).join('')+'</div>';}
  if(yearly.length){body+='<div class="life-section"><div class="life-sec-hd">&#128197; Yearly <span class="lsh-cnt">'+yearly.length+'</span></div>'+yearly.map(function(x){return billWithSubs(x);}).join('')+'</div>';}
  body+='<button class="life-add-btn" data-la="ladd" data-ltype="bills">+ Add bill</button>';
 } else if(type==='emis'){
  var unpaid=st.emis.filter(function(x){return !x.paid;});
  var paid=st.emis.filter(function(x){return x.paid;});
  if(!st.emis.length){body+='<div class="empty-state"><div class="ei">🏦</div><p>No EMIs added yet.</p></div>';}
  else{
   if(unpaid.length){body+='<div class="life-section"><div class="life-sec-hd">Pending <span class="lsh-cnt">'+unpaid.length+'</span></div>'+unpaid.map(function(x){return lcRow(x,'emis');}).join('')+'</div>';}
   if(paid.length){body+='<div class="life-section"><div class="life-sec-hd">Paid <span class="lsh-cnt">'+paid.length+'</span></div>'+paid.map(function(x){return lcRow(x,'emis');}).join('')+'</div>';}
  }
  body+='<button class="life-add-btn" data-la="ladd" data-ltype="emis">+ Add EMI / chit</button>';
 } else if(type==='invest'){
  var pending=st.invest.filter(function(x){return !x.paid;});
  var done=st.invest.filter(function(x){return x.paid;});
  if(!st.invest.length){body+='<div class="empty-state"><div class="ei">📈</div><p>No investments added yet.</p></div>';}
  else{
   if(pending.length){body+='<div class="life-section"><div class="life-sec-hd">This month <span class="lsh-cnt">'+pending.length+'</span></div>'+pending.map(function(x){return lcRow(x,'invest');}).join('')+'</div>';}
   if(done.length){body+='<div class="life-section"><div class="life-sec-hd">Done <span class="lsh-cnt">'+done.length+'</span></div>'+done.map(function(x){return lcRow(x,'invest');}).join('')+'</div>';}
  }
  body+='<button class="life-add-btn" data-la="ladd" data-ltype="invest">+ Add investment</button>';
 } else if(type==='health'){
  var meds=st.health.filter(function(x){return x.htype==='med';});
  var appts=st.health.filter(function(x){return x.htype==='appt';});
  if(meds.length){body+='<div class="life-section"><div class="life-sec-hd">💊 Medicines to restock <span class="lsh-cnt">'+meds.length+'</span></div>'+meds.map(function(x){return lcRow(x,'health');}).join('')+'</div>';}
  if(appts.length){body+='<div class="life-section"><div class="life-sec-hd">🏥 Appointments <span class="lsh-cnt">'+appts.length+'</span></div>'+appts.map(function(x){return lcRow(x,'health');}).join('')+'</div>';}
  if(!st.health.length){body+='<div class="empty-state"><div class="ei">💊</div><p>No medicines or appointments yet.</p></div>';}
  body+='<button class="life-add-btn" data-la="ladd" data-ltype="health" data-htype="med">+ Add medicine</button>';
  body+='<button class="life-add-btn" data-la="ladd" data-ltype="health" data-htype="appt" style="margin-top:6px">+ Add appointment</button>';
 } else if(type==='biz2'){
  var b=st.biz2;
  body+='<div class="life-section"><div class="life-sec-hd">💡 Ideas</div>';
  if(!b.ideas.length){body+='<p class="note">No ideas yet.</p>';}
  b.ideas.forEach(function(idea){
   var isActive=b.active===idea.id;
   body+='<div class="lc"><div class="lc-row">';
   body+='<span class="lc-icon">'+(isActive?'🚀':'💡')+'</span>';
   body+='<div class="lc-body"><div class="lc-name">'+esc(idea.name)+'</div>'+(idea.note?'<div class="lc-meta">'+esc(idea.note)+'</div>':'')+'</div>';
   if(!isActive)body+='<button class="lc-act" data-la="lactivate" data-lid="'+idea.id+'" style="font-size:12px;padding:4px 8px;border:1.5px solid var(--acc);border-radius:8px;color:var(--acc);font-weight:700">Activate</button>';
   else body+='<span style="font-size:11px;font-weight:800;color:var(--acc);padding:4px 8px">Active</span>';
   body+='<button class="lc-act" data-la="ledit" data-lid="'+idea.id+'" data-ltype="biz2">&#9998;</button>';
   body+='<button class="lc-act del" data-la="ldel" data-lid="'+idea.id+'" data-ltype="biz2">&#128465;</button>';
   body+='</div></div>';
  });
  body+='<button class="life-add-btn" data-la="ladd" data-ltype="biz2">+ Add idea</button></div>';
  if(b.active){
   var activeIdea=b.ideas.filter(function(x){return x.id===b.active;})[0];
   if(activeIdea){
    body+='<div class="life-section"><div class="life-sec-hd">🚀 Active: '+esc(activeIdea.name)+'</div>';
    if(!b.tasks.length){body+='<p class="note">No tasks yet.</p>';}
    b.tasks.forEach(function(task){
     body+='<div class="lc"><div class="lc-row">';
     body+='<button class="lc-paid'+(task.d?' done':'')+'" data-la="lbiztog" data-lid="'+task.id+'">'+(task.d?'✓':'')+'</button>';
     body+='<div class="lc-body"><div class="lc-name" style="'+(task.d?'text-decoration:line-through;color:var(--mute)':'')+'">'+esc(task.t)+'</div></div>';
     body+='<button class="lc-act del" data-la="lbizdel" data-lid="'+task.id+'">&#128465;</button>';
     body+='</div></div>';
    });
    body+='<div class="inline-add" style="margin-top:8px"><input type="text" id="biz-task-inp" placeholder="Add task…" maxlength="120"><button data-la="lbizadd">Add</button></div>';
    body+='</div>';
   }
  }
 }
 return body;
}

var BILL_PORTALS=[
 {match:'electricity',name:'TGSPDCL',url:'https://tgsouthernpower.org/#consumer-service/online/bill-enquiry',param:null,hint:'Service / USC number',payUrl:'https://www.amazon.in/apay/detail/electricity'},
 {match:'water',name:'HMWS&SB',url:'https://www.hyderabadwater.gov.in/billpayment',param:'consumerNo',hint:'Consumer number',payUrl:'https://pay.amazon.in/water-bill'},
 {match:'mobile',name:'Mobile',url:'https://www.airtel.in/recharge-online',param:'mobile',hint:'10-digit mobile number',payUrl:'https://pay.amazon.in/mobile-recharge'},
 {match:'gas',name:'LPG',url:'https://www.mylpg.in',param:null,hint:'LPG consumer number',payUrl:'https://pay.amazon.in/lpg-cylinder'},
 {match:'fibernet',name:'Jio Fibernet',url:'https://www.jio.com/selfcare/plans/broadband',param:null,hint:'Account / RMN',payUrl:'https://pay.amazon.in/broadband-bill'}
];

function getBillPortal(parentId){
 var parent=st.bills.filter(function(x){return x.id===parentId;})[0];
 if(!parent)return null;
 var nm=parent.name.toLowerCase();
 for(var i=0;i<BILL_PORTALS.length;i++){if(nm.indexOf(BILL_PORTALS[i].match)>=0)return BILL_PORTALS[i];}
 return null;
}

function billCheckUrl(sub,parentId){
 if(sub.billUrl)return sub.billUrl;
 var portal=getBillPortal(parentId);
 if(!portal||!sub.consumerNo)return null;
 if(portal.param)return portal.url+'?'+portal.param+'='+encodeURIComponent(sub.consumerNo);
 return portal.url;
}

function lmOpenSub(parentId,subId){
 lmType='subbill';lmEditId=subId||null;
 var sub=subId&&st.subBills?st.subBills.filter(function(x){return x.id===subId;})[0]:null;
 var parent=st.bills.filter(function(x){return x.id===parentId;})[0];
 var portal=getBillPortal(parentId);
 $('lm-title').textContent=(subId?'Edit':'Add')+' connection'+(parent?' — '+parent.name:'');
 $('lm-del').hidden=!subId;
 var f='<input type="hidden" id="lm-subbill-pid" value="'+parentId+'">';
 f+='<label>Label (e.g. Meter 1, Shop, Flat 2A)</label><input id="lm-name" type="text" maxlength="60" value="'+esc(sub?sub.name:'')+'">';
 f+='<label>Note (optional)</label><input id="lm-note" type="text" maxlength="80" value="'+esc(sub?sub.note||'':'')+'">'
 +'<label>Due day of month</label><input id="lm-dueday" type="number" min="1" max="31" value="'+(sub?sub.dueDay||15:15)+'">';
 if(portal){
  f+='<label>'+portal.name+' Consumer No <span style="font-weight:400;color:var(--mute)">('+portal.hint+')</span></label>'
   +'<input id="lm-consno" type="text" inputmode="numeric" maxlength="40" placeholder="'+esc(portal.hint)+'" value="'+esc(sub?sub.consumerNo||'':'')+'">'
   +'<div style="font-size:11px;color:var(--mute);margin-top:3px">Saved here so you can copy it when the bill site opens.</div>'
   +'<label>Bill portal URL <span style="font-weight:400;color:var(--mute)">(auto-filled, edit if wrong)</span></label>'
   +'<input id="lm-billurl" type="url" maxlength="300" value="'+esc(sub?sub.billUrl||portal.url:portal.url)+'">';
 } else {
  f+='<label>Bill portal URL</label>'
   +'<input id="lm-billurl" type="url" maxlength="300" placeholder="https://..." value="'+esc(sub?sub.billUrl||'':'')+'">'
   +'<div style="font-size:11px;color:var(--mute);margin-top:4px">Paste the bill check URL for this connection.</div>';
 }
 f+='<input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-icon" value=""><input type="hidden" id="lm-amt" value="">';
 $('lm-fields').innerHTML=f;
 $('life-modal-overlay').hidden=false;
 setTimeout(function(){var n=$('lm-name');if(n)n.focus();},60);
}

function openLifePage(type){
 currentLife=type;
 $('life-page-title').textContent=LIFE_TITLES[type]||type;
 $('life-page-body').innerHTML=renderLifePage(type);
 $('life-page-body').scrollTop=0;
 $('life-page').scrollTop=0;
 $('life-page').classList.add('open');
}
function closeLifePage(){
 $('life-page').classList.remove('open');
 setTimeout(function(){currentLife=null;},300);
}
$('life-back-btn').onclick=closeLifePage;
document.addEventListener('click',function(e){
 var lc=e.target.closest('[data-lv]');if(!lc)return;
 openLifePage(lc.getAttribute('data-lv'));
});

function lmClose(){$('life-modal-overlay').hidden=true;lmEditId=null;lmType=null;}
$('lm-cancel').onclick=lmClose;
$('life-modal-overlay').addEventListener('click',function(e){if(e.target===$('life-modal-overlay'))lmClose();});

function lmOpen(type,id,htype){
 lmType=type;lmEditId=id||null;
 var item=null;
 if(id){
  if(type==='bills')item=st.bills.filter(function(x){return x.id===id;})[0];
  else if(type==='emis')item=st.emis.filter(function(x){return x.id===id;})[0];
  else if(type==='invest')item=st.invest.filter(function(x){return x.id===id;})[0];
  else if(type==='health')item=st.health.filter(function(x){return x.id===id;})[0];
  else if(type==='biz2')item=st.biz2.ideas.filter(function(x){return x.id===id;})[0];
 }
 var ht=htype||(item&&item.htype)||'med';
 $('lm-title').textContent=(id?'Edit ':'Add ')+(type==='bills'?'Bill':type==='emis'?'EMI / Chit':type==='invest'?'Investment':type==='health'?(ht==='appt'?'Appointment':'Medicine'):'Business Idea');
 $('lm-del').hidden=!id;
 var f='';
 if(type==='bills'||type==='emis'||type==='invest'){
  f+='<label>Name</label><input id="lm-name" type="text" maxlength="80" value="'+esc(item?item.name:'')+'">';
  f+='<label>Amount (₹)</label><input id="lm-amt" type="text" maxlength="12" value="'+esc(item?item.amt||'':'')+'">';
  f+='<label>Due date</label><input id="lm-due" type="date" value="'+esc(item?item.due||'':'')+'">';
  f+='<label>Note (optional)</label><input id="lm-note" type="text" maxlength="80" value="'+esc(item?item.note||'':'')+'">'
  +(type==='bills'?'<label style="display:flex;align-items:center;gap:8px;margin-top:10px"><input type="checkbox" id="lm-yearly"'+(item&&item.yearly?' checked':'')+'>  Yearly bill (e.g. Property Tax)</label><input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'💡':'💡')+'">':type==='emis'?'<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'🚗':'🚗')+'">':'<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'📈':'📈')+'">');
 } else if(type==='health'){
  f+='<input type="hidden" id="lm-htype" value="'+ht+'">';
  f+='<label>Name</label><input id="lm-name" type="text" maxlength="80" value="'+esc(item?item.name:'')+'">';
  if(ht==='med'){f+='<label>For (e.g. Mom, Dad)</label><input id="lm-note" type="text" maxlength="60" value="'+esc(item?item.note||'':'')+'">'+
   '<label>Restock by</label><input id="lm-due" type="date" value="'+esc(item?item.due||'':'')+'">'+
   '<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'💊':'💊')+'">';}
  else{f+='<label>Doctor / Hospital</label><input id="lm-note" type="text" maxlength="80" value="'+esc(item?item.note||'':'')+'">'+
   '<label>Date</label><input id="lm-due" type="date" value="'+esc(item?item.due||'':'')+'">'+
   '<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'🏥':'🏥')+'">';}
 } else if(type==='biz2'){
  f+='<label>Idea name</label><input id="lm-name" type="text" maxlength="80" value="'+esc(item?item.name:'')+'">';
  f+='<label>Description</label><input id="lm-note" type="text" maxlength="120" value="'+esc(item?item.note||'':'')+'">'
  +'<input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-icon" value="💡">';
 }
 $('lm-fields').innerHTML=f;
 $('life-modal-overlay').hidden=false;
 setTimeout(function(){var n=$('lm-name');if(n)n.focus();},60);
}

$('lm-save').onclick=function(){
 var name=($('lm-name')||{value:''}).value.trim();if(!name)return;
 var amt=($('lm-amt')||{value:''}).value.trim();
 var due=($('lm-due')||{value:''}).value;
 var note=($('lm-note')||{value:''}).value.trim();
 var icon=($('lm-icon')||{value:''}).value;
 var htype=($('lm-htype')||{value:'med'}).value;
 var obj={id:lmEditId||('l'+Date.now()),name:name,amt:amt||undefined,due:due||undefined,note:note||undefined,icon:icon||undefined};
 if(lmType==='health')obj.htype=htype;
 if(lmType==='bills')obj.yearly=!!(document.getElementById('lm-yearly')&&document.getElementById('lm-yearly').checked);
 if(lmType==='subbill'){
  if(!st.subBills)st.subBills=[];
  var pid=($('lm-subbill-pid')||{value:''}).value;
  var dueDay=parseInt(($('lm-dueday')||{value:'15'}).value)||15;
  var existSub=lmEditId?st.subBills.filter(function(x){return x.id===lmEditId;})[0]:null;
  var sobj={id:lmEditId||('sb'+Date.now()),parentId:pid,name:name,note:note||undefined,dueDay:dueDay,consumerNo:($('lm-consno')||{value:''}).value.trim()||undefined,billUrl:($('lm-billurl')||{value:''}).value.trim()||undefined,amtHistory:existSub?existSub.amtHistory||{}:{},paid:existSub?existSub.paid:false,paidMonth:existSub?existSub.paidMonth:undefined};
  if(lmEditId){var si=st.subBills.findIndex(function(x){return x.id===lmEditId;});if(si>=0)st.subBills[si]=sobj;}
  else st.subBills.push(sobj);
  save();lmClose();if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Saved');return;
 }
 if(lmType==='bills'){
  if(lmEditId){var i=st.bills.findIndex(function(x){return x.id===lmEditId;});if(i>=0){obj.paid=st.bills[i].paid;st.bills[i]=obj;}}
  else st.bills.push(obj);
 } else if(lmType==='emis'){
  if(lmEditId){var i=st.emis.findIndex(function(x){return x.id===lmEditId;});if(i>=0){obj.paid=st.emis[i].paid;st.emis[i]=obj;}}
  else st.emis.push(obj);
 } else if(lmType==='invest'){
  if(lmEditId){var i=st.invest.findIndex(function(x){return x.id===lmEditId;});if(i>=0){obj.paid=st.invest[i].paid;st.invest[i]=obj;}}
  else st.invest.push(obj);
 } else if(lmType==='health'){
  if(lmEditId){var i=st.health.findIndex(function(x){return x.id===lmEditId;});if(i>=0)st.health[i]=obj;}
  else st.health.push(obj);
 } else if(lmType==='biz2'){
  var idea={id:lmEditId||('b'+Date.now()),name:name,note:note||undefined};
  if(lmEditId){var i=st.biz2.ideas.findIndex(function(x){return x.id===lmEditId;});if(i>=0)st.biz2.ideas[i]=idea;}
  else st.biz2.ideas.push(idea);
 }
 save();lmClose();
 if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);
 toast('Saved');
};

$('lm-del').onclick=function(){
 if(!lmEditId||!lmType)return;
 if(lmType==='subbill'){if(st.subBills)st.subBills=st.subBills.filter(function(x){return x.id!==lmEditId;});save();lmClose();if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;}
 if(lmType==='bills')st.bills=st.bills.filter(function(x){return x.id!==lmEditId;});
 else if(lmType==='emis')st.emis=st.emis.filter(function(x){return x.id!==lmEditId;});
 else if(lmType==='invest')st.invest=st.invest.filter(function(x){return x.id!==lmEditId;});
 else if(lmType==='health')st.health=st.health.filter(function(x){return x.id!==lmEditId;});
 else if(lmType==='biz2'){st.biz2.ideas=st.biz2.ideas.filter(function(x){return x.id!==lmEditId;});if(st.biz2.active===lmEditId)st.biz2.active=null;}
 save();lmClose();
 if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);
 toast('Deleted');
};

$('life-page-body').addEventListener('input',function(e){
 var inp=e.target.closest('[data-la="lsubamt"]');if(!inp)return;
 if(!st.subBills)return;
 var sub=st.subBills.filter(function(x){return x.id===inp.getAttribute('data-lid');})[0];if(!sub)return;
 var curMon=new Date().getFullYear()+'-'+('0'+(new Date().getMonth()+1)).slice(-2);
 if(!sub.amtHistory)sub.amtHistory={};
 var v=inp.value.trim();
 if(v)sub.amtHistory[curMon]=v;
 else delete sub.amtHistory[curMon];
 inp.style.borderColor=v?'var(--acc)':'var(--line)';
 save();
});

$('life-page-body').addEventListener('click',function(e){
 var b=e.target.closest('[data-la]');if(!b)return;
 var la=b.getAttribute('data-la'),lid=b.getAttribute('data-lid'),ltype=b.getAttribute('data-ltype');
 if(la==='ladd'){lmOpen(ltype,null,b.getAttribute('data-htype'));return;}
 if(la==='ledit'){lmOpen(ltype,lid);return;}
 if(la==='lsubtoggle'){
  if(!billWithSubs.open)billWithSubs.open={};
  billWithSubs.open[lid]=!billWithSubs.open[lid];
  var subsEl=document.getElementById('lcsubs-'+lid);
  if(subsEl)subsEl.style.display=billWithSubs.open[lid]?'':'none';
  var chev=b.querySelector('.lc-chev');
  if(chev)chev.innerHTML=billWithSubs.open[lid]?'&#9650;':'&#9660;';
  return;
 }
 if(la==='lcopycano'){
  var cn=b.getAttribute('data-consno');
  if(navigator.clipboard){navigator.clipboard.writeText(cn).then(function(){toast('Copied: '+cn);});}
  else{var ta=document.createElement('textarea');ta.value=cn;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Copied: '+cn);}
  return;
 }
 if(la==='lsubadd'){lmOpenSub(lid,null);return;}
 if(la==='lsubedit'){lmOpenSub(b.getAttribute('data-lpid'),lid);return;}
 if(la==='lsubdel'){
  if(st.subBills)st.subBills=st.subBills.filter(function(x){return x.id!==lid;});
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;
 }
 if(la==='lsubpaid'){
  if(!st.subBills)return;
  var sub=st.subBills.filter(function(x){return x.id===lid;})[0];if(!sub)return;
  var curMon=new Date().getFullYear()+'-'+('0'+(new Date().getMonth()+1)).slice(-2);
  sub.paid=!sub.paid;sub.paidMonth=sub.paid?curMon:undefined;
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);return;
 }
 if(la==='ldel'){
  if(ltype==='bills')st.bills=st.bills.filter(function(x){return x.id!==lid;});
  else if(ltype==='emis')st.emis=st.emis.filter(function(x){return x.id!==lid;});
  else if(ltype==='invest')st.invest=st.invest.filter(function(x){return x.id!==lid;});
  else if(ltype==='health')st.health=st.health.filter(function(x){return x.id!==lid;});
  else if(ltype==='biz2'){st.biz2.ideas=st.biz2.ideas.filter(function(x){return x.id!==lid;});if(st.biz2.active===lid)st.biz2.active=null;}
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;
 }
 if(la==='lpaid'){
  var arr=ltype==='bills'?st.bills:ltype==='emis'?st.emis:st.invest;
  var item=arr.filter(function(x){return x.id===lid;})[0];if(!item)return;
  item.paid=!item.paid;save();$('life-page-body').innerHTML=renderLifePage(currentLife);return;
 }
 if(la==='lactivate'){st.biz2.active=lid;save();$('life-page-body').innerHTML=renderLifePage(currentLife);return;}
 if(la==='lbiztog'){
  var t=st.biz2.tasks.filter(function(x){return x.id===lid;})[0];if(!t)return;
  t.d=!t.d;save();$('life-page-body').innerHTML=renderLifePage(currentLife);return;
 }
 if(la==='lbizdel'){
  st.biz2.tasks=st.biz2.tasks.filter(function(x){return x.id!==lid;});
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);return;
 }
 if(la==='lbizadd'){
  var inp=$('biz-task-inp');if(!inp||!inp.value.trim())return;
  st.biz2.tasks.push({id:'bt'+Date.now(),t:inp.value.trim(),d:false});
  inp.value='';save();$('life-page-body').innerHTML=renderLifePage(currentLife);return;
 }
});
