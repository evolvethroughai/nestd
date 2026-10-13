// life-modal-generic.js - Bills, invest, health, biz2, subbill modal forms + save

function lmOpen(type,id,htype){
 if(type==='chits'){lmOpenChit(id);return;}
 if(type==='emis'){lmOpenEmi(id);return;}
 var item=null;
 if(id){
  if(type==='bills')item=st.bills.filter(function(x){return x.id===id;})[0];
  else if(type==='invest')item=st.invest.filter(function(x){return x.id===id;})[0];
  else if(type==='health')item=st.health.filter(function(x){return x.id===id;})[0];
  else if(type==='biz2')item=st.biz2.ideas.filter(function(x){return x.id===id;})[0];
 }
 var ht=htype||(item&&item.htype)||'med';
 var title=(id?'Edit ':'Add ')+(type==='bills'?'Bill':type==='invest'?'Investment':type==='health'?(ht==='appt'?'Appointment':'Medicine'):'Business Idea');
 var f='';
 if(type==='bills'||type==='invest'){
  f+='<label>Name</label><input id="lm-name" type="text" maxlength="80" value="'+esc(item?item.name:'')+'">';
  f+='<label>Amount (&#8377;)</label><input id="lm-amt" type="text" maxlength="12" value="'+esc(item?item.amt||'':'')+'">';
  f+='<label>Due date</label><input id="lm-due" type="date" value="'+esc(item?item.due||'':'')+'">';
  f+='<label>Note (optional)</label><input id="lm-note" type="text" maxlength="80" value="'+esc(item?item.note||'':'')+'">';
  if(type==='bills'){
   f+='<label style="display:flex;align-items:center;gap:8px;margin-top:10px"><input type="checkbox" id="lm-yearly"'+(item&&item.yearly?' checked':'')+'>  Yearly bill (e.g. Property Tax)</label>';
   f+='<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'&#128161;':'&#128161;')+'">';
  } else {
   f+='<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'&#128200;':'&#128200;')+'">';
  }
  f+='<input type="hidden" id="lm-htype" value="">';
 } else if(type==='health'){
  f+='<input type="hidden" id="lm-htype" value="'+ht+'">';
  f+='<label>Name</label><input id="lm-name" type="text" maxlength="80" value="'+esc(item?item.name:'')+'">';
  if(ht==='med'){
   f+='<label>For (e.g. Mom, Dad)</label><input id="lm-note" type="text" maxlength="60" value="'+esc(item?item.note||'':'')+'">';
   f+='<label>Restock by</label><input id="lm-due" type="date" value="'+esc(item?item.due||'':'')+'">';
   f+='<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'💊':'💊')+'">';
  } else {
   f+='<label>Doctor / Hospital</label><input id="lm-note" type="text" maxlength="80" value="'+esc(item?item.note||'':'')+'">';
   f+='<label>Date</label><input id="lm-due" type="date" value="'+esc(item?item.due||'':'')+'">';
   f+='<input type="hidden" id="lm-icon" value="'+esc(item?item.icon||'🏥':'🏥')+'">';
  }
  f+='<input type="hidden" id="lm-amt" value="">';
 } else if(type==='biz2'){
  f+='<label>Idea name</label><input id="lm-name" type="text" maxlength="80" value="'+esc(item?item.name:'')+'">';
  f+='<label>Description</label><input id="lm-note" type="text" maxlength="120" value="'+esc(item?item.note||'':'')+'">';
  f+='<input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-icon" value="💡"><input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-htype" value="">';
 }
 lmShow(title,f,id,type);
}

function lmOpenSub(parentId,subId){
 var sub=subId&&st.subBills?st.subBills.filter(function(x){return x.id===subId;})[0]:null;
 var parent=st.bills.filter(function(x){return x.id===parentId;})[0];
 var portal=getBillPortal(parentId);
 var f='<input type="hidden" id="lm-subbill-pid" value="'+parentId+'">';
 f+='<label>Label (e.g. Meter 1, Shop, Flat 2A)</label><input id="lm-name" type="text" maxlength="60" value="'+esc(sub?sub.name:'')+'">';
 f+='<label>Note (optional)</label><input id="lm-note" type="text" maxlength="80" value="'+esc(sub?sub.note||'':'')+'">';
 f+='<label>Due day of month</label><input id="lm-dueday" type="number" min="1" max="31" value="'+(sub?sub.dueDay||15:15)+'">';
 if(portal){
  f+='<label>'+portal.name+' Consumer No <span style="font-weight:400;color:var(--mute)">('+portal.hint+')</span></label>';
  f+='<input id="lm-consno" type="text" inputmode="numeric" maxlength="40" placeholder="'+esc(portal.hint)+'" value="'+esc(sub?sub.consumerNo||'':'')+'">';
  f+='<div style="font-size:11px;color:var(--mute);margin-top:3px">Saved here so you can copy it when the bill site opens.</div>';
  f+='<label>Bill portal URL <span style="font-weight:400;color:var(--mute)">(auto-filled, edit if wrong)</span></label>';
  f+='<input id="lm-billurl" type="url" maxlength="300" value="'+esc(sub?sub.billUrl||portal.url:portal.url)+'">';
 } else {
  f+='<label>Bill portal URL (for checking bill)</label>';
  f+='<input id="lm-billurl" type="url" maxlength="300" placeholder="https://..." value="'+esc(sub?sub.billUrl||'':'')+'">';
  f+='<div style="font-size:11px;color:var(--mute);margin-top:4px">Paste the bill check URL for this connection.</div>';
 }
 f+='<label>Pay now URL <span style="font-weight:400;color:var(--mute)">(optional)</span></label>';
 f+='<input id="lm-payurl" type="url" maxlength="300" placeholder="https://..." value="'+esc(sub?sub.payUrl||'':'')+'">';
 f+='<input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-icon" value=""><input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-htype" value="">';
 lmShow((subId?'Edit':'Add')+' connection'+(parent?' \u2014 '+parent.name:''),f,subId,'subbill');
}

function lmSaveGeneric(){
 var name=($('lm-name')||{value:''}).value.trim();if(!name)return;
 var obj={
  id:lmEditId||('l'+Date.now()),name:name,
  amt:($('lm-amt')||{value:''}).value.trim()||undefined,
  due:($('lm-due')||{value:''}).value||undefined,
  note:($('lm-note')||{value:''}).value.trim()||undefined,
  icon:($('lm-icon')||{value:''}).value||undefined
 };
 if(lmType==='health')obj.htype=($('lm-htype')||{value:'med'}).value;
 if(lmType==='bills')obj.yearly=!!(document.getElementById('lm-yearly')&&document.getElementById('lm-yearly').checked);
 if(lmType==='bills'){
  if(lmEditId){var i=st.bills.findIndex(function(x){return x.id===lmEditId;});if(i>=0){obj.paid=st.bills[i].paid;st.bills[i]=obj;}}else st.bills.push(obj);
 } else if(lmType==='invest'){
  if(lmEditId){var i=st.invest.findIndex(function(x){return x.id===lmEditId;});if(i>=0){obj.paid=st.invest[i].paid;st.invest[i]=obj;}}else st.invest.push(obj);
 } else if(lmType==='health'){
  if(lmEditId){var i=st.health.findIndex(function(x){return x.id===lmEditId;});if(i>=0)st.health[i]=obj;}else st.health.push(obj);
 } else if(lmType==='biz2'){
  var idea={id:lmEditId||('b'+Date.now()),name:name,note:obj.note};
  if(lmEditId){var i=st.biz2.ideas.findIndex(function(x){return x.id===lmEditId;});if(i>=0)st.biz2.ideas[i]=idea;}else st.biz2.ideas.push(idea);
 }
 save();lmClose();lmRefresh();toast('Saved');
}

function lmSaveSubbill(){
 if(!st.subBills)st.subBills=[];
 var name=($('lm-name')||{value:''}).value.trim();if(!name)return;
 var pid=($('lm-subbill-pid')||{value:''}).value;
 var existSub=lmEditId?st.subBills.filter(function(x){return x.id===lmEditId;})[0]:null;
 var obj={
  id:lmEditId||('sb'+Date.now()),parentId:pid,name:name,
  note:($('lm-note')||{value:''}).value.trim()||undefined,
  dueDay:parseInt(($('lm-dueday')||{value:'15'}).value)||15,
  consumerNo:($('lm-consno')||{value:''}).value.trim()||undefined,
  billUrl:($('lm-billurl')||{value:''}).value.trim()||undefined,
  payUrl:($('lm-payurl')||{value:''}).value.trim()||undefined,
  amtHistory:existSub?existSub.amtHistory||{}:{},
  paid:existSub?existSub.paid:false,
  paidMonth:existSub?existSub.paidMonth:undefined
 };
 if(lmEditId){var i=st.subBills.findIndex(function(x){return x.id===lmEditId;});if(i>=0)st.subBills[i]=obj;}
 else st.subBills.push(obj);
 save();lmClose();lmRefresh();toast('Saved');
}
