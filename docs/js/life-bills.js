// life-bills.js - Bills & sub-bills (portals, rows, render)

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
 if(lastAmt)html+='<div class="lc-meta" style="color:var(--mute)">Last: &#8377;'+lastAmt+'</div>';
 var checkUrl=billCheckUrl(sub,parentId);
 var portal=getBillPortal(parentId);
 var payUrl=sub.payUrl||(portal&&portal.payUrl?portal.payUrl:null);
 if(checkUrl||payUrl){
  html+='<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">';
  if(checkUrl)html+='<a href="'+checkUrl+'" target="_blank" rel="noopener" style="font-size:11px;font-weight:800;color:var(--acc);text-decoration:none;background:var(--soft);border-radius:6px;padding:3px 9px;display:inline-block">&#128279; Check bill</a>';
  if(payUrl)html+='<a href="'+payUrl+'" target="_blank" rel="noopener" style="font-size:11px;font-weight:800;color:#fff;text-decoration:none;background:#f90;border-radius:6px;padding:3px 9px;display:inline-block">&#128179; Pay now</a>';
  html+='</div>';
 }
 html+='</div>';
 html+='<input type="text" inputmode="numeric" placeholder="&#8377; this month" maxlength="8" data-la="lsubamt" data-lid="'+sub.id+'" data-lpid="'+parentId+'" value="'+esc(curAmt)+'" style="width:90px;font:700 13px Nunito,sans-serif;color:var(--acc);background:var(--bg);border:1.5px solid '+(curAmt?'var(--acc)':'var(--line)')+';border-radius:8px;padding:4px 6px;text-align:center;flex-shrink:0">';
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
 var html=lcRow(item,'bills');
 html+='<div class="lc-subs" id="lcsubs-'+item.id+'" style="'+(open?'':'display:none')+'">';
 subs.forEach(function(s){html+=lcSubRow(s,item.id);});
 html+='<button class="lc-act" data-la="lsubadd" data-lid="'+item.id+'" style="margin:6px 0 2px 28px;font-size:12px;color:var(--acc);font-weight:700">+ Add connection</button>';
 html+='</div>';
 return html;
}
billWithSubs.open={};

function renderBillsPage(){
 var body='';
 var mon=new Date().toLocaleDateString(undefined,{month:'long',year:'numeric'});
 if(!st.bills)st.bills=[];
 var monthly=st.bills.filter(function(x){return !x.yearly;});
 var yearly=st.bills.filter(function(x){return x.yearly;});
 var unpaidM=monthly.filter(function(x){return !x.paid;});
 var paidM=monthly.filter(function(x){return x.paid;});
 var totalUnpaid=unpaidM.reduce(function(s,x){var a=parseFloat(x.amt);return s+(isNaN(a)?0:a);},0);
 body+='<div style="background:var(--soft);border-radius:14px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">'
  +'<div><div style="font-size:12px;font-weight:800;color:var(--acc);text-transform:uppercase;letter-spacing:.5px">'+mon+'</div>'
  +'<div style="font-size:13px;color:var(--mute);margin-top:2px">'+unpaidM.length+' unpaid &#8212; '+paidM.length+' paid</div></div>'
  +(totalUnpaid?'<div style="font-size:20px;font-weight:900;color:var(--acc)">&#8377;'+totalUnpaid.toLocaleString('en-IN')+'</div>':'')
  +'</div>';
 if(unpaidM.length){body+='<div class="life-section"><div class="life-sec-hd">&#128197; Monthly &#8212; Pending <span class="lsh-cnt">'+unpaidM.length+'</span></div>'+unpaidM.map(function(x){return billWithSubs(x);}).join('')+'</div>';}
 if(paidM.length){body+='<div class="life-section"><div class="life-sec-hd">&#10003; Paid <span class="lsh-cnt">'+paidM.length+'</span></div>'+paidM.map(function(x){return billWithSubs(x);}).join('')+'</div>';}
 if(yearly.length){body+='<div class="life-section"><div class="life-sec-hd">&#128197; Yearly <span class="lsh-cnt">'+yearly.length+'</span></div>'+yearly.map(function(x){return billWithSubs(x);}).join('')+'</div>';}
 body+='<button class="life-add-btn" data-la="ladd" data-ltype="bills">+ Add bill</button>';
 return body;
}
