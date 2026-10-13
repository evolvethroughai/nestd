// life-chits.js - Chits render only

var chitOpenState={};

function renderChitsPage(){
 var body='';
 if(!st.chits)st.chits=[];
 var now=new Date();
 var activeChits=st.chits.filter(function(x){return x.status!=='done';});
 var totalMonthly=activeChits.reduce(function(s,x){return s+(parseFloat(x.monthlyAmt)||0);},0);
 var liftedCount=st.chits.filter(function(x){return x.lifted;}).length;
 body+='<div class="chit-summary">';
 body+='<div class="chit-sum-row"><div><div class="chit-sum-label">Monthly outflow</div><div class="chit-sum-val">&#8377;'+totalMonthly.toLocaleString('en-IN')+'</div></div>';
 body+='<div><div class="chit-sum-label">Active chits</div><div class="chit-sum-val">'+activeChits.length+'</div></div>';
 body+='<div><div class="chit-sum-label">Lifted</div><div class="chit-sum-val">'+liftedCount+'</div></div></div>';
 body+='</div>';
 body+='<div class="chit-calc-box" id="chit-calc-box">';
 body+='<div class="chit-calc-hd" data-la="chitcalctog" style="cursor:pointer"><span>&#129518; Chit Calculator</span><span id="chit-calc-chev">&#9660;</span></div>';
 body+='<div class="chit-calc-inner" id="chit-calc-body" style="display:none">';
 body+='<div class="chit-calc-grid">';
 body+='<div class="chit-calc-row"><label>Pot amount (&#8377;)</label><input id="cc-pot" type="text" inputmode="numeric" placeholder="e.g. 500000"></div>';
 body+='<div class="chit-calc-row"><label>Monthly (&#8377;)</label><input id="cc-monthly" type="text" inputmode="numeric" placeholder="e.g. 10000"></div>';
 body+='<div class="chit-calc-row"><label>Total months</label><input id="cc-months" type="number" min="1" max="120" placeholder="e.g. 50"></div>';
 body+='<div class="chit-calc-row"><label>Lift at month</label><input id="cc-liftmonth" type="number" min="1" max="120" placeholder="optional"></div>';
 body+='</div>';
 body+='<div class="chit-calc-row"><label>Commission (&#8377;) — optional</label><input id="cc-comm" type="text" inputmode="numeric" placeholder="e.g. 5000"></div>';
 body+='<button class="chit-calc-btn" data-la="chitcalcrun">&#128200; Calculate</button>';
 body+='<div id="chit-calc-result"></div>';
 body+='</div></div>';

 function chitCard(item){
  var startDate=item.startDate?new Date(item.startDate+'T12:00:00'):null;
  var totalMonths=parseInt(item.totalMonths)||0;
  var monthlyAmt=parseFloat(item.monthlyAmt)||0;
  var pot=parseFloat(item.pot)||0;
  var monthsDone=0;
  if(startDate&&totalMonths){
   var diff=(now.getFullYear()-startDate.getFullYear())*12+(now.getMonth()-startDate.getMonth());
   if(now.getDate()<startDate.getDate())diff--;
   monthsDone=Math.max(0,Math.min(diff+1,totalMonths));
  }
  var paidSoFar=monthsDone*monthlyAmt;
  var progressPct=totalMonths?Math.round((monthsDone/totalMonths)*100):0;
  var endDate=item.endDate?new Date(item.endDate+'T12:00:00'):null;
  if(!endDate&&startDate&&totalMonths){endDate=new Date(startDate);endDate.setMonth(endDate.getMonth()+totalMonths-1);}
  var fmtDate=function(d){return d?d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'';};
  var startDateStr=fmtDate(startDate);
  var endDateStr=fmtDate(endDate);
  var dueDay=parseInt(item.dueDay)||0;
  var dueBadgeHtml='';
  if(dueDay&&item.status!=='done'){
   var dueThisMonth=new Date(now.getFullYear(),now.getMonth(),dueDay);
   var daysLeft=Math.round((dueThisMonth-now)/864e5);
   if(daysLeft<0){dueThisMonth=new Date(now.getFullYear(),now.getMonth()+1,dueDay);daysLeft=Math.round((dueThisMonth-now)/864e5);}
   var dueCls=daysLeft===0?'today':daysLeft<=3?'soon':'ok';
   var dueTxt=daysLeft===0?'Due today':daysLeft===1?'Due tomorrow':'Due '+dueThisMonth.toLocaleDateString(undefined,{day:'numeric',month:'short'});
   dueBadgeHtml='<span class="lc-due '+dueCls+'">'+dueTxt+'</span>';
  }
  var statusMap={paying:'&#128176; Paying',lifted:'&#9989; Lifted on '+(item.liftedDate?new Date(item.liftedDate+'T12:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'month '+(item.liftedMonth||'')),done:'&#10003; Completed'};
  var statusCls={paying:'chit-status-paying',lifted:'chit-status-lifted',done:'chit-status-done'};
  var cstatus=item.lifted?'lifted':(item.status==='done'?'done':'paying');
  var isOpen=!!chitOpenState[item.id];
  var html='<div class="chit-card">';
  var shortStatus={paying:'&#128176; Paying',lifted:'&#9989; Lifted',done:'&#10003; Done'};
  html+='<div class="chit-card-hd" data-la="chittog" data-lid="'+item.id+'" style="cursor:pointer">';
  html+='<div style="min-width:0;flex:1"><div class="chit-card-title">&#129309; '+esc(item.name)+'</div>'+(dueBadgeHtml?'<div style="margin-top:3px">'+dueBadgeHtml+'</div>':'')+'</div>';
  html+='<div style="display:flex;align-items:center;gap:5px;flex-shrink:0"><span class="chit-status '+statusCls[cstatus]+'">'+shortStatus[cstatus]+'</span><span style="font-size:11px;color:var(--mute)">'+( isOpen?'&#9650;':'&#9660;')+'</span></div>';
  html+='</div>';
  html+='<div class="chit-body" id="chitbody-'+item.id+'" style="display:'+(isOpen?'block':'none')+'">';
  html+='<div class="chit-nums">';
  html+='<div class="chit-num"><div class="chit-num-val">&#8377;'+monthlyAmt.toLocaleString('en-IN')+'</div><div class="chit-num-lbl">Monthly</div></div>';
  html+='<div class="chit-num"><div class="chit-num-val">&#8377;'+pot.toLocaleString('en-IN')+'</div><div class="chit-num-lbl">Total pot</div></div>';
  html+='<div class="chit-num"><div class="chit-num-val">'+monthsDone+'/'+totalMonths+'</div><div class="chit-num-lbl">Months</div></div>';
  html+='</div>';
  if(totalMonths){
   html+='<div class="chit-prog-wrap">';
   html+='<div class="chit-prog-bar"><div class="chit-prog-fill" style="width:'+progressPct+'%"></div></div>';
   html+='<div class="chit-prog-meta"><span>&#8377;'+Math.round(paidSoFar).toLocaleString('en-IN')+' paid</span><span>'+(endDateStr?'Ends '+endDateStr:'')+'</span></div>';
  if(startDateStr||endDateStr)html+='<div style="font-size:11px;color:var(--mute);margin-top:4px;display:flex;flex-direction:column;gap:1px">'+(startDateStr?'<span>&#128197; Start: '+startDateStr+'</span>':'')+(endDateStr?'<span>&#8987; End: &nbsp;'+endDateStr+'</span>':'')+'</div>';
   html+='</div>';
  }
  if(item.lifted){
   var amtRecShow=parseFloat(item.amtReceived||0);
   html+='<div class="chit-lifted-box">';
   html+='<div class="chit-lifted-row" data-la="chitliftededit" data-lid="'+item.id+'" style="cursor:pointer"><span>Lifted on</span><strong>'+(item.liftedDate?new Date(item.liftedDate+'T12:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'Month '+(item.liftedMonth||''))+'&nbsp;&#9998;</strong></div>';
   html+='<div class="chit-lifted-row"><span>Commission cut</span><strong style="color:var(--red)">&#8722;&#8377;'+parseFloat(item.commission||0).toLocaleString('en-IN')+'</strong></div>';
   html+='<div class="chit-lifted-row"><span>Amount received</span><strong class="chit-got">&#8377;'+amtRecShow.toLocaleString('en-IN')+'</strong></div>';
   html+='</div>';
  }
  var effectiveMonths=parseInt(item.closedMonth)||totalMonths;
  var remainingTillClose=Math.max(0,effectiveMonths-monthsDone);
  var totalCost=effectiveMonths*monthlyAmt;
  var profitBox='';
  if(item.lifted){
   var amtRec=parseFloat(item.amtReceived||0);
   var netLifted=amtRec-totalCost;
   var isProfit=netLifted>=0;
   var stillPayingNote=remainingTillClose>0?' <span style="font-size:11px;color:var(--mute)">('+remainingTillClose+' months still to pay)</span>':' <span style="font-size:11px;color:var(--acc)">Fully paid &#10003;</span>';
   profitBox='<div class="chit-lifted-box" style="background:'+(isProfit?'var(--soft)':'var(--reds)')+';margin-top:0">';
   profitBox+='<div class="chit-lifted-row" style="flex-wrap:wrap;gap:2px"><span>Total to pay ('+effectiveMonths+' mo)</span><strong>&#8377;'+totalCost.toLocaleString('en-IN')+stillPayingNote+'</strong></div>';
   profitBox+='<div class="chit-lifted-row"><span>Amount received</span><strong>&#8377;'+amtRec.toLocaleString('en-IN')+'</strong></div>';
   profitBox+='<div class="chit-lifted-row"><span>'+(isProfit?'&#9989; Net profit':'&#128308; Net loss')+' (after all payments)</span><strong style="color:'+(isProfit?'var(--acc)':'var(--red)')+'\">'+(isProfit?'+':'\u2212')+'&#8377;'+Math.abs(netLifted).toLocaleString('en-IN')+'</strong></div>';
   profitBox+='</div>';
  } else if(item.status==='done'){
   var netDone=pot-totalCost;
   var isDoneProfit=netDone>=0;
   var closedDateStr=item.closedDate?new Date(item.closedDate+'T12:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'';
   profitBox='<div class="chit-lifted-box" style="background:'+(isDoneProfit?'var(--soft)':'var(--reds)')+';margin-top:0">';
   if(closedDateStr)profitBox+='<div class="chit-lifted-row"><span>Closed on</span><strong>'+closedDateStr+'</strong></div>';
   profitBox+='<div class="chit-lifted-row"><span>Total paid ('+effectiveMonths+' months)</span><strong>&#8377;'+totalCost.toLocaleString('en-IN')+'</strong></div>';
   profitBox+='<div class="chit-lifted-row"><span>Pot received</span><strong>&#8377;'+pot.toLocaleString('en-IN')+'</strong></div>';
   profitBox+='<div class="chit-lifted-row"><span>'+(isDoneProfit?'&#9989; Profit':'&#128308; Loss')+'</span><strong style="color:'+(isDoneProfit?'var(--acc)':'var(--red)')+'\">'+(isDoneProfit?'+':'\u2212')+'&#8377;'+Math.abs(netDone).toLocaleString('en-IN')+'</strong></div>';
   profitBox+='</div>';
  } else if(totalMonths&&monthlyAmt&&pot){
   var projectedCost=totalMonths*monthlyAmt;
   var projected=pot-projectedCost;
   var isProjProfit=projected>=0;
   profitBox='<div class="chit-lifted-box" style="background:var(--line);margin-top:0">';
   profitBox+='<div class="chit-lifted-row"><span>Projected '+(isProjProfit?'profit':'loss')+' if not lifted</span><strong style="color:'+(isProjProfit?'var(--acc)':'var(--red)')+'\">'+(isProjProfit?'+':'\u2212')+'&#8377;'+Math.abs(projected).toLocaleString('en-IN')+'</strong></div>';
   profitBox+='</div>';
  }
  html+=profitBox;
  html+='<div class="chit-card-ft">';
  if(item.note)html+='<div style="width:100%;font-size:12px;color:var(--mute);font-style:italic;margin-bottom:6px">'+esc(item.note)+'</div>';
  html+='<div style="display:flex;gap:6px;flex-wrap:wrap;width:100%">';
  if(!item.lifted&&item.status!=='done')html+='<button class="chit-lift-btn" style="flex:1" data-la="chitlift" data-lid="'+item.id+'">&#9989; Lift</button>';
  if(item.status!=='done')html+='<button class="chit-lift-btn" style="flex:1;background:var(--mute)" data-la="chitclose" data-lid="'+item.id+'">&#128274; Close</button>';
  html+='<button class="lc-act" data-la="chitedit" data-lid="'+item.id+'">&#9998;</button>';
  html+='<button class="lc-act del" data-la="chitdel" data-lid="'+item.id+'">&#128465;</button>';
  html+='</div></div>';
  html+='</div>';
  html+='</div>';
  return html;
 }

 var active=st.chits.filter(function(x){return x.status!=='done';});
 var done2=st.chits.filter(function(x){return x.status==='done';});
 if(!st.chits.length){body+='<div class="empty-state"><div class="ei">&#129309;</div><p>No chits added yet.<br><span style="font-size:12px">Track your chit fund payments, lifting &amp; profit.</span></p></div>';}
 if(active.length)body+=active.map(chitCard).join('');
 if(done2.length){body+='<div class="life-sec-hd" style="margin-top:16px">&#10003; Completed <span class="lsh-cnt">'+done2.length+'</span></div>'+done2.map(chitCard).join('');}
 body+='<button class="life-add-btn" data-la="ladd" data-ltype="chits">+ Add chit</button>';
 return body;
}
