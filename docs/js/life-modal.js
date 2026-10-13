// life-modal.js - All modal open/save/delete logic

function lmClose(){$('life-modal-overlay').hidden=true;lmEditId=null;lmType=null;}
$('lm-cancel').onclick=lmClose;
$('life-modal-overlay').addEventListener('click',function(e){if(e.target===$('life-modal-overlay'))lmClose();});

function lmOpenSub(parentId,subId){
 lmType='subbill';lmEditId=subId||null;
 var sub=subId&&st.subBills?st.subBills.filter(function(x){return x.id===subId;})[0]:null;
 var parent=st.bills.filter(function(x){return x.id===parentId;})[0];
 var portal=getBillPortal(parentId);
 $('lm-title').textContent=(subId?'Edit':'Add')+' connection'+(parent?' \u2014 '+parent.name:'');
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
  f+='<label>Bill portal URL (for checking bill)</label>'
   +'<input id="lm-billurl" type="url" maxlength="300" placeholder="https://..." value="'+esc(sub?sub.billUrl||'':'')+'">'
   +'<div style="font-size:11px;color:var(--mute);margin-top:4px">Paste the bill check URL for this connection.</div>';
 }
 f+='<label>Pay now URL <span style="font-weight:400;color:var(--mute)">(optional)</span></label>'
  +'<input id="lm-payurl" type="url" maxlength="300" placeholder="https://..." value="'+esc(sub?sub.payUrl||'':'')+'">'
  +'<input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-icon" value=""><input type="hidden" id="lm-amt" value="">';
 $('lm-fields').innerHTML=f;
 $('life-modal-overlay').hidden=false;
 setTimeout(function(){var n=$('lm-name');if(n)n.focus();},60);
}

function lmOpen(type,id,htype){
 lmType=type;lmEditId=id||null;
 var item=null;
 if(id){
  if(type==='bills')item=st.bills.filter(function(x){return x.id===id;})[0];
  else if(type==='emis')item=st.emis.filter(function(x){return x.id===id;})[0];
  else if(type==='chits')item=(st.chits||[]).filter(function(x){return x.id===id;})[0];
  else if(type==='invest')item=st.invest.filter(function(x){return x.id===id;})[0];
  else if(type==='health')item=st.health.filter(function(x){return x.id===id;})[0];
  else if(type==='biz2')item=st.biz2.ideas.filter(function(x){return x.id===id;})[0];
 }
 var ht=htype||(item&&item.htype)||'med';
 $('lm-title').textContent=(id?'Edit ':'Add ')+(type==='bills'?'Bill':type==='emis'?'EMI':type==='chits'?'Chit':type==='invest'?'Investment':type==='health'?(ht==='appt'?'Appointment':'Medicine'):'Business Idea');
 $('lm-del').hidden=!id;
 var f='';
 if(type==='chits'){
  var cs=item?item.status:'paying';
  f+='<label>Chit name / group</label><input id="lm-name" type="text" maxlength="80" placeholder="e.g. Shriram 15K" value="'+esc(item?item.name:'')+'">';
  f+='<label>Monthly amount (&#8377;)</label><input id="lm-monthlyamt" type="text" inputmode="numeric" maxlength="12" value="'+esc(item?item.monthlyAmt||'':'')+'">';
  f+='<label>Total pot (&#8377;)</label><input id="lm-pot" type="text" inputmode="numeric" maxlength="12" placeholder="e.g. 450000" value="'+esc(item?item.pot||'':'')+'">';
  f+='<label>Total months</label><input id="lm-totalmonths" type="number" min="1" max="120" placeholder="e.g. 30" value="'+esc(item?item.totalMonths||'':'')+'">';
  var _sdd='',_sdm='',_sdy='';
  if(item&&item.startDate){var _sdp=item.startDate.split('-');_sdy=_sdp[0]||'';_sdm=_sdp[1]||'';_sdd=_sdp[2]||'';}
  var _days='<option value="">DD</option>';for(var _d=1;_d<=31;_d++){var _dv=('0'+_d).slice(-2);_days+='<option value="'+_dv+'"'+(_dv===_sdd?' selected':'')+'>'+_dv+'</option>';}
  var _months='<option value="">MM</option>';var _mnames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];for(var _m=1;_m<=12;_m++){var _mv=('0'+_m).slice(-2);_months+='<option value="'+_mv+'"'+(_mv===_sdm?' selected':'')+'>'+_mv+' '+_mnames[_m-1]+'</option>';}
  var _years='<option value="">YYYY</option>';var _cy=new Date().getFullYear();for(var _y=_cy-5;_y<=_cy+2;_y++){_years+='<option value="'+_y+'"'+(_y===parseInt(_sdy)?' selected':'')+'>'+_y+'</option>';}
  f+='<label>Start date</label><div style="display:flex;gap:6px;min-width:0"><select id="lm-sd-d" style="flex:1;min-width:0">'+_days+'</select><select id="lm-sd-m" style="flex:1.4;min-width:0">'+_months+'</select><select id="lm-sd-y" style="flex:1.6;min-width:0">'+_years+'</select></div>';
  f+='<label>Monthly due day</label><input id="lm-dueday" type="number" min="1" max="31" placeholder="e.g. 5" value="'+esc(item?item.dueDay||'':'')+'">';
  f+='<label>Status</label><select id="lm-cstatus"><option value="paying"'+(cs==='paying'?' selected':'')+'>&#128176; Paying (active)</option><option value="done"'+(cs==='done'?' selected':'')+'>&#10003; Completed</option></select>';
  if(cs==='done')f+='<label>Closed at month</label><input id="lm-closedmonth" type="number" min="1" max="120" placeholder="Leave blank if full term" value="'+esc(item?item.closedMonth||'':'')+'">';
  f+='<label>Note (optional)</label><input id="lm-note" type="text" maxlength="80" value="'+esc(item?item.note||'':'')+'">'
   +'<input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-icon" value="&#129309;"><input type="hidden" id="lm-htype" value="">';
 } else if(type==='bills'||type==='emis'||type==='invest'){
  f+='<label>Name</label><input id="lm-name" type="text" maxlength="80" value="'+esc(item?item.name:'')+'">';
  if(type==='emis'){
   f+='<label>Loan amount (&#8377;)</label><input id="lm-loanamt" type="text" inputmode="numeric" maxlength="12" placeholder="e.g. 500000" value="'+esc(item?item.loanAmt||'':'')+'">';
   f+='<label>Interest rate (% p.a.)</label><input id="lm-intrate" type="text" inputmode="decimal" maxlength="6" placeholder="e.g. 9.5" value="'+esc(item?item.interestRate||'':'')+'">';
   f+='<label>Tenure (months)</label><input id="lm-tenure" type="number" min="1" max="360" placeholder="e.g. 60" value="'+esc(item?item.tenureMonths||'':'')+'">';
   f+='<label>EMI amount (&#8377;) <span style="font-weight:400;color:var(--mute)">leave blank to auto-calculate</span></label><input id="lm-emiamt" type="text" inputmode="numeric" maxlength="12" placeholder="auto" value="'+esc(item?item.emiAmt||'':'')+'">';
   var _sdd2='',_sdm2='',_sdy2='';
   if(item&&item.startDate){var _sdp2=item.startDate.split('-');_sdy2=_sdp2[0]||'';_sdm2=_sdp2[1]||'';_sdd2=_sdp2[2]||'';}
   var _days2='<option value="">DD</option>';for(var _d2=1;_d2<=31;_d2++){var _dv2=('0'+_d2).slice(-2);_days2+='<option value="'+_dv2+'"'+(_dv2===_sdd2?' selected':'')+'>'+_dv2+'</option>';}
   var _months2='<option value="">MM</option>';var _mn2=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];for(var _m2=1;_m2<=12;_m2++){var _mv2=('0'+_m2).slice(-2);_months2+='<option value="'+_mv2+'"'+(_mv2===_sdm2?' selected':'')+'>'+_mv2+' '+_mn2[_m2-1]+'</option>';}
   var _years2='<option value="">YYYY</option>';var _cy2e=new Date().getFullYear();for(var _y2=_cy2e-10;_y2<=_cy2e+1;_y2++){_years2+='<option value="'+_y2+'"'+(_y2===parseInt(_sdy2)?' selected':'')+'>'+_y2+'</option>';}
   f+='<label>Start date</label><div style="display:flex;gap:6px;min-width:0"><select id="lm-ed-d" style="flex:1;min-width:0">'+_days2+'</select><select id="lm-ed-m" style="flex:1.4;min-width:0">'+_months2+'</select><select id="lm-ed-y" style="flex:1.6;min-width:0">'+_years2+'</select></div>';
   f+='<label>Monthly due day</label><input id="lm-dueday" type="number" min="1" max="31" placeholder="e.g. 5" value="'+esc(item?item.dueDay||'':'')+'">';
   f+='<label>Note (optional)</label><input id="lm-note" type="text" maxlength="80" value="'+esc(item?item.note||'':'')+'">'
    +'<input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-icon" value="&#127950;"><input type="hidden" id="lm-htype" value="">';
  } else {
   f+='<label>Amount (&#8377;)</label><input id="lm-amt" type="text" maxlength="12" value="'+esc(item?item.amt||'':'')+'">';
   f+='<label>Due date</label><input id="lm-due" type="date" value="'+esc(item?item.due||'':'')+'">';
   f+='<label>Note (optional)</label><input id="lm-note" type="text" maxlength="80" value="'+esc(item?item.note||'':'')+'">'
   +(type==='bills'?'<label style="display:flex;align-items:center;gap:8px;margin-top:10px"><input type="checkbox" id="lm-yearly"'+(item&&item.yearly?' checked':'')+'>  Yearly bill (e.g. Property Tax)</label><input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'&#128161;':'&#128161;')+'">':'<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'&#128200;':'&#128200;')+'">');
   f+='<input type="hidden" id="lm-htype" value="">';
  }
 } else if(type==='health'){
  f+='<input type="hidden" id="lm-htype" value="'+ht+'">';
  f+='<label>Name</label><input id="lm-name" type="text" maxlength="80" value="'+esc(item?item.name:'')+'">';
  if(ht==='med'){f+='<label>For (e.g. Mom, Dad)</label><input id="lm-note" type="text" maxlength="60" value="'+esc(item?item.note||'':'')+'">'
   +'<label>Restock by</label><input id="lm-due" type="date" value="'+esc(item?item.due||'':'')+'">'
   +'<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'💊':'💊')+'">';}
  else{f+='<label>Doctor / Hospital</label><input id="lm-note" type="text" maxlength="80" value="'+esc(item?item.note||'':'')+'">'
   +'<label>Date</label><input id="lm-due" type="date" value="'+esc(item?item.due||'':'')+'">'
   +'<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'🏥':'🏥')+'">';}
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
  var sobj={id:lmEditId||('sb'+Date.now()),parentId:pid,name:name,note:note||undefined,dueDay:dueDay,consumerNo:($('lm-consno')||{value:''}).value.trim()||undefined,billUrl:($('lm-billurl')||{value:''}).value.trim()||undefined,payUrl:($('lm-payurl')||{value:''}).value.trim()||undefined,amtHistory:existSub?existSub.amtHistory||{}:{},paid:existSub?existSub.paid:false,paidMonth:existSub?existSub.paidMonth:undefined};
  if(lmEditId){var si=st.subBills.findIndex(function(x){return x.id===lmEditId;});if(si>=0)st.subBills[si]=sobj;}
  else st.subBills.push(sobj);
  save();lmClose();if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Saved');return;
 }
 if(lmType==='chitclose'){
  if(!st.chits)return;
  var chit3=st.chits.filter(function(x){return x.id===lmEditId;})[0];if(!chit3)return;
  chit3.status='done';
  var _cd=($('lm-close-d')||{value:''}).value,_cm=($('lm-close-m')||{value:''}).value,_cy=($('lm-close-y')||{value:''}).value;
  chit3.closedDate=(_cy&&_cm&&_cd)?_cy+'-'+_cm+'-'+_cd:undefined;
  if(chit3.closedDate&&chit3.startDate){
   var _cs=new Date(chit3.startDate+'T12:00:00'),_cl=new Date(chit3.closedDate+'T12:00:00');
   chit3.closedMonth=String((_cl.getFullYear()-_cs.getFullYear())*12+(_cl.getMonth()-_cs.getMonth())+1);
  }
  save();lmClose();if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Chit marked closed');return;
 }
 if(lmType==='chitlift'){
  if(!st.chits)return;
  var chit2=st.chits.filter(function(x){return x.id===lmEditId;})[0];if(!chit2)return;
  chit2.lifted=true;
  var _ld=($('lm-lift-d')||{value:''}).value,_lm=($('lm-lift-m')||{value:''}).value,_ly=($('lm-lift-y')||{value:''}).value;
  chit2.liftedDate=(_ly&&_lm&&_ld)?_ly+'-'+_lm+'-'+_ld:undefined;
  if(chit2.liftedDate&&chit2.startDate){
   var _ls=new Date(chit2.startDate+'T12:00:00'),_ll=new Date(chit2.liftedDate+'T12:00:00');
   chit2.liftedMonth=String((_ll.getFullYear()-_ls.getFullYear())*12+(_ll.getMonth()-_ls.getMonth())+1);
  }
  chit2.commission=($('lm-commission')||{value:''}).value.trim()||undefined;
  var pot2=parseFloat(chit2.pot||0);
  var comm2=parseFloat(chit2.commission||0);
  chit2.amtReceived=String(pot2-comm2);
  save();lmClose();if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Chit lifted');return;
 }
 if(lmType==='chits'){
  if(!st.chits)st.chits=[];
  var existing=lmEditId?st.chits.filter(function(x){return x.id===lmEditId;})[0]:null;
  var cobj={
   id:lmEditId||('ch'+Date.now()),name:name,
   monthlyAmt:($('lm-monthlyamt')||{value:''}).value.trim()||undefined,
   pot:($('lm-pot')||{value:''}).value.trim()||undefined,
   totalMonths:($('lm-totalmonths')||{value:''}).value.trim()||undefined,
   startDate:(function(){var d=($('lm-sd-d')||{value:''}).value,m=($('lm-sd-m')||{value:''}).value,y=($('lm-sd-y')||{value:''}).value;return(y&&m&&d)?y+'-'+m+'-'+d:undefined;})(),
   dueDay:($('lm-dueday')||{value:''}).value.trim()||undefined,
   status:($('lm-cstatus')||{value:'paying'}).value,
   closedMonth:($('lm-closedmonth')||{value:''}).value.trim()||undefined,
   note:note||undefined,
   lifted:existing?existing.lifted:false,
   liftedMonth:existing?existing.liftedMonth:undefined,
   commission:existing?existing.commission:undefined,
   amtReceived:existing?existing.amtReceived:undefined
  };
  if(lmEditId){var i=st.chits.findIndex(function(x){return x.id===lmEditId;});if(i>=0)st.chits[i]=cobj;}
  else st.chits.push(cobj);
  save();lmClose();if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Saved');return;
 }
 if(lmType==='emipart'){
  if(!st.emis)return;
  var loan=st.emis.filter(function(x){return x.id===lmEditId;})[0];if(!loan)return;
  if(!loan.partPayments)loan.partPayments=[];
  var _pd=($('lm-pp-d')||{value:''}).value,_pm=($('lm-pp-m')||{value:''}).value,_py=($('lm-pp-y')||{value:''}).value;
  var pdate=(_py&&_pm&&_pd)?_py+'-'+_pm+'-'+_pd:undefined;
  var pamt=($('lm-partamt')||{value:''}).value.trim();
  if(!pamt)return;
  loan.partPayments.push({id:'pp'+Date.now(),amt:pamt,date:pdate});
  save();lmClose();if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Part payment added');return;
 }
 if(lmType==='emis'){
  if(!st.emis)st.emis=[];
  var eobj={
   id:lmEditId||('em'+Date.now()),name:name,
   loanAmt:($('lm-loanamt')||{value:''}).value.trim()||undefined,
   interestRate:($('lm-intrate')||{value:''}).value.trim()||undefined,
   tenureMonths:($('lm-tenure')||{value:''}).value.trim()||undefined,
   emiAmt:($('lm-emiamt')||{value:''}).value.trim()||undefined,
   startDate:(function(){var d=($('lm-ed-d')||{value:''}).value,m=($('lm-ed-m')||{value:''}).value,y=($('lm-ed-y')||{value:''}).value;return(y&&m&&d)?y+'-'+m+'-'+d:undefined;})(),
   dueDay:($('lm-dueday')||{value:''}).value.trim()||undefined,
   note:note||undefined,
   status:'active',
   partPayments:lmEditId?(st.emis.filter(function(x){return x.id===lmEditId;})[0]||{}).partPayments||[]:[] 
  };
  if(lmEditId){var ei=st.emis.findIndex(function(x){return x.id===lmEditId;});if(ei>=0){eobj.status=st.emis[ei].status||'active';st.emis[ei]=eobj;}}
  else st.emis.push(eobj);
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
 if(lmType==='chits'){if(st.chits)st.chits=st.chits.filter(function(x){return x.id!==lmEditId;});save();lmClose();if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;}
 if(lmType==='emis'){st.emis=st.emis.filter(function(x){return x.id!==lmEditId;});save();lmClose();if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;}
 else if(lmType==='invest')st.invest=st.invest.filter(function(x){return x.id!==lmEditId;});
 else if(lmType==='health')st.health=st.health.filter(function(x){return x.id!==lmEditId;});
 else if(lmType==='biz2'){st.biz2.ideas=st.biz2.ideas.filter(function(x){return x.id!==lmEditId;});if(st.biz2.active===lmEditId)st.biz2.active=null;}
 save();lmClose();
 if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);
 toast('Deleted');
};
