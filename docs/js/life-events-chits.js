// life-events-chits.js - Chit section event handlers

function handleChitEvents(la,lid,b){
 if(la==='chitedit'){lmOpenChit(lid);return;}
 if(la==='chitdel'){
  if(!st.chits)return;
  st.chits=st.chits.filter(function(x){return x.id!==lid;});
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;
 }
 if(la==='chittog'){
  chitOpenState[lid]=!chitOpenState[lid];
  var body=document.getElementById('chitbody-'+lid);
  var chev=b.querySelector('span:last-child');
  if(body)body.style.display=chitOpenState[lid]?'block':'none';
  if(chev)chev.innerHTML=chitOpenState[lid]?'&#9650;':'&#9660;';
  return;
 }
 if(la==='chitlift'){lmOpenChitLift(lid,false);return;}
 if(la==='chitliftededit'){lmOpenChitLift(lid,true);return;}
 if(la==='chitclose'){lmOpenChitClose(lid);return;}
 if(la==='chitcalctog'){
  var cb=document.getElementById('chit-calc-body');
  var chev=document.getElementById('chit-calc-chev');
  if(!cb)return;
  var open=cb.style.display==='block';
  cb.style.display=open?'none':'block';
  if(chev)chev.innerHTML=open?'&#9660;':'&#9650;';
  return;
 }
 if(la==='chitcalcrun'){
  var pot=parseFloat((document.getElementById('cc-pot')||{value:''}).value)||0;
  var monthly=parseFloat((document.getElementById('cc-monthly')||{value:''}).value)||0;
  var months=parseInt((document.getElementById('cc-months')||{value:''}).value)||0;
  var liftAt=parseInt((document.getElementById('cc-liftmonth')||{value:''}).value)||0;
  var comm=parseFloat((document.getElementById('cc-comm')||{value:''}).value)||0;
  var res=document.getElementById('chit-calc-result');
  if(!res)return;
  if(!pot||!monthly||!months){res.innerHTML='<div style="color:var(--red);font-size:13px;padding:8px 0">Enter pot, monthly amount and total months.</div>';return;}
  var totalPaid=monthly*months;
  var noLiftNet=pot-totalPaid;
  var html='<div class="chit-calc-res">';
  html+='<div class="chit-calc-res-hd">&#128200; Without lifting</div>';
  html+='<div class="chit-lifted-row"><span>Total paid ('+months+' months)</span><strong>&#8377;'+totalPaid.toLocaleString('en-IN')+'</strong></div>';
  html+='<div class="chit-lifted-row"><span>Pot received</span><strong>&#8377;'+pot.toLocaleString('en-IN')+'</strong></div>';
  html+='<div class="chit-lifted-row"><span>'+(noLiftNet>=0?'&#9989; Profit':'&#128308; Loss')+'</span><strong style="color:'+(noLiftNet>=0?'var(--acc)':'var(--red)')+'">'+(noLiftNet>=0?'+':'\u2212')+'&#8377;'+Math.abs(noLiftNet).toLocaleString('en-IN')+'</strong></div>';
  if(liftAt&&liftAt<=months){
   var paidTillLift=monthly*liftAt;
   var remaining=monthly*(months-liftAt);
   var received=pot-comm;
   var netLift=received-totalPaid;
   html+='<div class="chit-calc-res-hd" style="margin-top:12px">&#9989; If lifted at month '+liftAt+'</div>';
   html+='<div class="chit-lifted-row"><span>Paid till lift ('+liftAt+' months)</span><strong>&#8377;'+paidTillLift.toLocaleString('en-IN')+'</strong></div>';
   html+='<div class="chit-lifted-row"><span>Still to pay ('+(months-liftAt)+' months)</span><strong>&#8377;'+remaining.toLocaleString('en-IN')+'</strong></div>';
   if(comm)html+='<div class="chit-lifted-row"><span>Commission</span><strong style="color:var(--red)">&#8722;&#8377;'+comm.toLocaleString('en-IN')+'</strong></div>';
   html+='<div class="chit-lifted-row"><span>Amount received</span><strong>&#8377;'+received.toLocaleString('en-IN')+'</strong></div>';
   html+='<div class="chit-lifted-row"><span>'+(netLift>=0?'&#9989; Net profit':'&#128308; Net loss')+' (after all payments)</span><strong style="color:'+(netLift>=0?'var(--acc)':'var(--red)')+'">'+(netLift>=0?'+':'\u2212')+'&#8377;'+Math.abs(netLift).toLocaleString('en-IN')+'</strong></div>';
  }
  var beMonth=0;
  for(var bm=1;bm<=months;bm++){if((pot-comm)-(monthly*months)>=0){beMonth=bm;break;}}
  if(!beMonth){for(var bm=1;bm<=months;bm++){if(pot-(monthly*months)>=0){beMonth=bm;break;}}}
  if(beMonth)html+='<div class="chit-lifted-row" style="margin-top:8px"><span>&#128161; Break-even if lifted at</span><strong>Month '+beMonth+' or later</strong></div>';
  html+='</div>';
  res.innerHTML=html;
  return;
 }
}
