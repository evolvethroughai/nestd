// life-modal-emis.js - EMI modal form + save logic

function lmOpenEmi(id){
 var item=id?(st.emis||[]).filter(function(x){return x.id===id;})[0]:null;
 var f='<label>Name</label><input id="lm-name" type="text" maxlength="80" value="'+esc(item?item.name:'')+'">';
 f+='<label>Loan amount (&#8377;)</label><input id="lm-loanamt" type="text" inputmode="numeric" maxlength="12" placeholder="e.g. 500000" value="'+esc(item?item.loanAmt||'':'')+'">';
 f+='<label>Interest rate (% p.a.)</label><input id="lm-intrate" type="text" inputmode="decimal" maxlength="6" placeholder="e.g. 9.5" value="'+esc(item?item.interestRate||'':'')+'">';
 f+='<label>Tenure (months)</label><input id="lm-tenure" type="number" min="1" max="360" placeholder="e.g. 60" value="'+esc(item?item.tenureMonths||'':'')+'">';
 f+='<label>EMI amount (&#8377;) <span style="font-weight:400;color:var(--mute)">leave blank to auto-calculate</span></label><input id="lm-emiamt" type="text" inputmode="numeric" maxlength="12" placeholder="auto" value="'+esc(item?item.emiAmt||'':'')+'">';
 f+='<label>Start date</label>'+dateSelects('lm-ed',item?item.startDate:null,new Date().getFullYear()-10,new Date().getFullYear()+1);
 f+='<label>Monthly due day</label><input id="lm-dueday" type="number" min="1" max="31" placeholder="e.g. 5" value="'+esc(item?item.dueDay||'':'')+'">';
 f+='<label>Note (optional)</label><input id="lm-note" type="text" maxlength="80" value="'+esc(item?item.note||'':'')+'">';
 f+='<input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-icon" value="&#127950;"><input type="hidden" id="lm-htype" value="">';
 lmShow((id?'Edit ':'Add ')+'Loan / EMI',f,id,'emis');
}

function lmOpenEmiPart(id){
 var loan=(st.emis||[]).filter(function(x){return x.id===id;})[0];if(!loan)return;
 var f='<input type="hidden" id="lm-name" value="'+esc(loan.name)+'">';
 f+='<input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-note" value=""><input type="hidden" id="lm-icon" value=""><input type="hidden" id="lm-htype" value="">';
 f+='<label>Amount paid (&#8377;)</label><input id="lm-partamt" type="text" inputmode="numeric" maxlength="12" placeholder="e.g. 50000">';
 f+='<label>Date of payment</label>'+dateSelects('lm-pp',null,new Date().getFullYear()-3,new Date().getFullYear()+1);
 lmShow('Part payment \u2014 '+esc(loan.name),f,null,'emipart');
 lmEditId=id;
}

function lmSaveEmi(){
 if(!st.emis)st.emis=[];
 var name=($('lm-name')||{value:''}).value.trim();if(!name)return;
 var existing=lmEditId?(st.emis.filter(function(x){return x.id===lmEditId;})[0]):null;
 var obj={
  id:lmEditId||('em'+Date.now()),name:name,
  loanAmt:($('lm-loanamt')||{value:''}).value.trim()||undefined,
  interestRate:($('lm-intrate')||{value:''}).value.trim()||undefined,
  tenureMonths:($('lm-tenure')||{value:''}).value.trim()||undefined,
  emiAmt:($('lm-emiamt')||{value:''}).value.trim()||undefined,
  startDate:readDateSelects('lm-ed'),
  dueDay:($('lm-dueday')||{value:''}).value.trim()||undefined,
  note:($('lm-note')||{value:''}).value.trim()||undefined,
  status:existing?existing.status||'active':'active',
  partPayments:existing?existing.partPayments||[]:[]
 };
 if(lmEditId){var i=st.emis.findIndex(function(x){return x.id===lmEditId;});if(i>=0)st.emis[i]=obj;}
 else st.emis.push(obj);
 save();lmClose();lmRefresh();toast('Saved');
}

function lmSaveEmiPart(){
 if(!st.emis)return;
 var loan=st.emis.filter(function(x){return x.id===lmEditId;})[0];if(!loan)return;
 var amt=($('lm-partamt')||{value:''}).value.trim();if(!amt)return;
 if(!loan.partPayments)loan.partPayments=[];
 loan.partPayments.push({id:'pp'+Date.now(),amt:amt,date:readDateSelects('lm-pp')});
 save();lmClose();lmRefresh();toast('Part payment added');
}
