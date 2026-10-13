// life-modal-chits.js - Chit modal form + save logic

function lmOpenChit(id){
 var item=id?(st.chits||[]).filter(function(x){return x.id===id;})[0]:null;
 var cs=item?item.status:'paying';
 var f='';
 f+='<label>Chit name / group</label><input id="lm-name" type="text" maxlength="80" placeholder="e.g. Shriram 15K" value="'+esc(item?item.name:'')+'">';
 f+='<label>Monthly amount (&#8377;)</label><input id="lm-monthlyamt" type="text" inputmode="numeric" maxlength="12" value="'+esc(item?item.monthlyAmt||'':'')+'">';
 f+='<label>Total pot (&#8377;)</label><input id="lm-pot" type="text" inputmode="numeric" maxlength="12" placeholder="e.g. 450000" value="'+esc(item?item.pot||'':'')+'">';
 f+='<label>Total months</label><input id="lm-totalmonths" type="number" min="1" max="120" placeholder="e.g. 30" value="'+esc(item?item.totalMonths||'':'')+'">';
 f+='<label>Start date</label>'+dateSelects('lm-sd',item?item.startDate:null,new Date().getFullYear()-5,new Date().getFullYear()+2);
 f+='<label>Monthly due day</label><input id="lm-dueday" type="number" min="1" max="31" placeholder="e.g. 5" value="'+esc(item?item.dueDay||'':'')+'">';
 f+='<label>Status</label><select id="lm-cstatus"><option value="paying"'+(cs==='paying'?' selected':'')+'>&#128176; Paying (active)</option><option value="done"'+(cs==='done'?' selected':'')+'>&#10003; Completed</option></select>';
 if(cs==='done')f+='<label>Closed at month</label><input id="lm-closedmonth" type="number" min="1" max="120" placeholder="Leave blank if full term" value="'+esc(item?item.closedMonth||'':'')+'">';
 f+='<label>Note (optional)</label><input id="lm-note" type="text" maxlength="80" value="'+esc(item?item.note||'':'')+'">';
 f+='<input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-icon" value="&#129309;"><input type="hidden" id="lm-htype" value="">';
 lmShow((id?'Edit ':'Add ')+'Chit',f,id,'chits');
}

function lmOpenChitLift(id,isEdit){
 var chit=(st.chits||[]).filter(function(x){return x.id===id;})[0];if(!chit)return;
 var pot=parseFloat(chit.pot||0);
 var f='<input type="hidden" id="lm-name" value="'+esc(chit.name)+'">';
 f+='<input type="hidden" id="lm-htype" value=""><input type="hidden" id="lm-icon" value=""><input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-note" value="">';
 f+='<label>Date of lifting</label>'+dateSelects('lm-lift',isEdit?chit.liftedDate:null,new Date().getFullYear()-3,new Date().getFullYear()+1);
 f+='<label>Commission cut (&#8377;)</label><input id="lm-commission" type="text" inputmode="numeric" maxlength="12" value="'+esc(chit.commission||'')+'" placeholder="e.g. 4500">';
 f+='<div style="font-size:12px;color:var(--mute);margin-top:4px">Amount received = &#8377;'+pot.toLocaleString('en-IN')+' \u2212 commission</div>';
 lmShow((isEdit?'Edit lift date':'Lift chit')+' \u2014 '+esc(chit.name),f,null,'chitlift');
 lmEditId=id;
}

function lmOpenChitClose(id){
 var chit=(st.chits||[]).filter(function(x){return x.id===id;})[0];if(!chit)return;
 var f='<input type="hidden" id="lm-name" value="'+esc(chit.name)+'">';
 f+='<input type="hidden" id="lm-htype" value=""><input type="hidden" id="lm-icon" value=""><input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-note" value="">';
 f+='<label>Date of closing</label>'+dateSelects('lm-close',null,new Date().getFullYear()-3,new Date().getFullYear()+1);
 lmShow('Mark chit closed \u2014 '+esc(chit.name),f,null,'chitclose');
 lmEditId=id;
}

function lmSaveChit(){
 if(!st.chits)st.chits=[];
 var name=($('lm-name')||{value:''}).value.trim();if(!name)return;
 var existing=lmEditId?(st.chits.filter(function(x){return x.id===lmEditId;})[0]):null;
 var obj={
  id:lmEditId||('ch'+Date.now()),name:name,
  monthlyAmt:($('lm-monthlyamt')||{value:''}).value.trim()||undefined,
  pot:($('lm-pot')||{value:''}).value.trim()||undefined,
  totalMonths:($('lm-totalmonths')||{value:''}).value.trim()||undefined,
  startDate:readDateSelects('lm-sd'),
  dueDay:($('lm-dueday')||{value:''}).value.trim()||undefined,
  status:($('lm-cstatus')||{value:'paying'}).value,
  closedMonth:($('lm-closedmonth')||{value:''}).value.trim()||undefined,
  note:($('lm-note')||{value:''}).value.trim()||undefined,
  lifted:existing?existing.lifted:false,
  liftedMonth:existing?existing.liftedMonth:undefined,
  liftedDate:existing?existing.liftedDate:undefined,
  commission:existing?existing.commission:undefined,
  amtReceived:existing?existing.amtReceived:undefined
 };
 if(lmEditId){var i=st.chits.findIndex(function(x){return x.id===lmEditId;});if(i>=0)st.chits[i]=obj;}
 else st.chits.push(obj);
 save();lmClose();lmRefresh();toast('Saved');
}

function lmSaveChitLift(){
 if(!st.chits)return;
 var chit=st.chits.filter(function(x){return x.id===lmEditId;})[0];if(!chit)return;
 chit.lifted=true;
 chit.liftedDate=readDateSelects('lm-lift');
 if(chit.liftedDate&&chit.startDate){
  var s=new Date(chit.startDate+'T12:00:00'),l=new Date(chit.liftedDate+'T12:00:00');
  chit.liftedMonth=String((l.getFullYear()-s.getFullYear())*12+(l.getMonth()-s.getMonth())+1);
 }
 chit.commission=($('lm-commission')||{value:''}).value.trim()||undefined;
 chit.amtReceived=String(parseFloat(chit.pot||0)-parseFloat(chit.commission||0));
 save();lmClose();lmRefresh();toast('Chit lifted');
}

function lmSaveChitClose(){
 if(!st.chits)return;
 var chit=st.chits.filter(function(x){return x.id===lmEditId;})[0];if(!chit)return;
 chit.status='done';
 chit.closedDate=readDateSelects('lm-close');
 if(chit.closedDate&&chit.startDate){
  var s=new Date(chit.startDate+'T12:00:00'),c=new Date(chit.closedDate+'T12:00:00');
  chit.closedMonth=String((c.getFullYear()-s.getFullYear())*12+(c.getMonth()-s.getMonth())+1);
 }
 save();lmClose();lmRefresh();toast('Chit marked closed');
}
