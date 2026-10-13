// life-emis.js - EMI loan tracker render

var emiOpenState={};

function calcEmi(principal,annualRate,months){
 if(!principal||!annualRate||!months)return 0;
 var r=annualRate/(12*100);
 return Math.round(principal*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1));
}

function emiLoanSummary(item){
 var principal=parseFloat(item.loanAmt)||0;
 var rate=parseFloat(item.interestRate)||0;
 var tenure=parseInt(item.tenureMonths)||0;
 var emiAmt=parseFloat(item.emiAmt)||calcEmi(principal,rate,tenure);
 var totalPayable=emiAmt*tenure;
 var totalInterest=totalPayable-principal;
 return {principal:principal,rate:rate,tenure:tenure,emiAmt:emiAmt,totalPayable:totalPayable,totalInterest:totalInterest};
}

function renderEmisPage(){
 var body='';
 if(!st.emis)st.emis=[];
 var now=new Date();

 // split new-style (has loanAmt) vs old-style
 var loans=st.emis.filter(function(x){return x.loanAmt;});
 var oldEmis=st.emis.filter(function(x){return !x.loanAmt;});

 // summary bar
 var activeLoans=loans.filter(function(x){return x.status!=='closed';});
 var totalEmi=activeLoans.reduce(function(s,x){
  var r=emiLoanSummary(x);return s+r.emiAmt;
 },0);
 if(loans.length){
  body+='<div class=\"chit-summary\">';
  body+='<div class=\"chit-sum-row\">';
  body+='<div><div class=\"chit-sum-label\">Monthly EMI</div><div class=\"chit-sum-val\">&#8377;'+totalEmi.toLocaleString('en-IN')+'</div></div>';
  body+='<div><div class=\"chit-sum-label\">Active loans</div><div class=\"chit-sum-val\">'+activeLoans.length+'</div></div>';
  body+='<div><div class=\"chit-sum-label\">Total loans</div><div class=\"chit-sum-val\">'+loans.length+'</div></div>';
  body+='</div></div>';
 }

 function emiCard(item){
  var s=emiLoanSummary(item);
  var startDate=item.startDate?new Date(item.startDate+'T12:00:00'):null;
  var fmtDate=function(d){return d?d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'-';};

  // months done
  var monthsDone=0;
  if(startDate){
   var diff=(now.getFullYear()-startDate.getFullYear())*12+(now.getMonth()-startDate.getMonth());
   if(now.getDate()<startDate.getDate())diff--;
   monthsDone=Math.max(0,Math.min(diff+1,s.tenure));
  }

  // part payments effect
  var partPayments=item.partPayments||[];
  var totalPartPaid=partPayments.reduce(function(a,p){return a+parseFloat(p.amt||0);},0);

  // remaining principal after monthsDone EMIs (amortisation approximation)
  var r=s.rate/(12*100);
  var remainingPrincipal=s.principal;
  if(r>0){
   remainingPrincipal=s.principal*Math.pow(1+r,monthsDone)-s.emiAmt*(Math.pow(1+r,monthsDone)-1)/r;
  } else {
   remainingPrincipal=s.principal-(s.principal/s.tenure)*monthsDone;
  }
  remainingPrincipal=Math.max(0,Math.round(remainingPrincipal));

  // after part payments
  var remainingAfterPart=Math.max(0,remainingPrincipal-totalPartPaid);

  // revised tenure after part payments (keep same EMI)
  var revisedMonthsLeft=0;
  if(s.emiAmt>0&&remainingAfterPart>0){
   if(r>0){
    revisedMonthsLeft=Math.ceil(Math.log(s.emiAmt/(s.emiAmt-remainingAfterPart*r))/Math.log(1+r));
   } else {
    revisedMonthsLeft=Math.ceil(remainingAfterPart/s.emiAmt);
   }
  }
  var monthsSaved=Math.max(0,(s.tenure-monthsDone)-revisedMonthsLeft);

  // closure date
  var closureDate=null;
  if(startDate&&s.tenure){
   closureDate=new Date(startDate);
   closureDate.setMonth(closureDate.getMonth()+s.tenure-1);
  }
  var revisedClosureDate=null;
  if(startDate&&revisedMonthsLeft){
   revisedClosureDate=new Date(now);
   revisedClosureDate.setMonth(revisedClosureDate.getMonth()+revisedMonthsLeft);
  }

  // interest breakdown
  var principalPaid=Math.min(s.principal,s.principal-remainingPrincipal);
  var interestPaid=Math.max(0,monthsDone*s.emiAmt-principalPaid);
  var progressPct=s.tenure?Math.round((monthsDone/s.tenure)*100):0;

  // extra interest = total interest over full tenure
  var extraInterest=s.totalInterest;

  // due badge
  var dueDay=parseInt(item.dueDay)||0;
  var dueBadgeHtml='';
  if(dueDay&&item.status!=='closed'){
   var dueThisMonth=new Date(now.getFullYear(),now.getMonth(),dueDay);
   var daysLeft=Math.round((dueThisMonth-now)/864e5);
   if(daysLeft<0){dueThisMonth=new Date(now.getFullYear(),now.getMonth()+1,dueDay);daysLeft=Math.round((dueThisMonth-now)/864e5);}
   var dueCls=daysLeft===0?'today':daysLeft<=3?'soon':'ok';
   var dueTxt=daysLeft===0?'Due today':daysLeft===1?'Due tomorrow':'Due '+dueThisMonth.toLocaleDateString(undefined,{day:'numeric',month:'short'});
   dueBadgeHtml='<span class=\"lc-due '+dueCls+'\">'+dueTxt+'</span>';
  }

  var statusCls=item.status==='closed'?'chit-status-done':'chit-status-paying';
  var statusTxt=item.status==='closed'?'&#10003; Closed':'&#128176; Active';
  var isOpen=!!emiOpenState[item.id];

  var html='<div class=\"chit-card\">';
  // header
  html+='<div class=\"chit-card-hd\" data-la=\"emitog\" data-lid=\"'+item.id+'\" style=\"cursor:pointer\">';
  html+='<div style=\"min-width:0;flex:1\"><div class=\"chit-card-title\">&#127950; '+esc(item.name)+'</div>'+(dueBadgeHtml?'<div style=\"margin-top:3px\">'+dueBadgeHtml+'</div>':'')+'</div>';
  html+='<div style=\"display:flex;align-items:center;gap:5px;flex-shrink:0\"><span class=\"chit-status '+statusCls+'\">'+statusTxt+'</span><span style=\"font-size:11px;color:var(--mute)\">'+(isOpen?'&#9650;':'&#9660;')+'</span></div>';
  html+='</div>';

  // collapsible body
  html+='<div id=\"emibody-'+item.id+'\" style=\"display:'+(isOpen?'block':'none')+'\">';

  // nums row
  html+='<div class=\"chit-nums\">';
  html+='<div class=\"chit-num\"><div class=\"chit-num-val\">&#8377;'+s.emiAmt.toLocaleString('en-IN')+'</div><div class=\"chit-num-lbl\">EMI/month</div></div>';
  html+='<div class=\"chit-num\"><div class=\"chit-num-val\">'+monthsDone+'/'+s.tenure+'</div><div class=\"chit-num-lbl\">Months done</div></div>';
  html+='<div class=\"chit-num\"><div class=\"chit-num-val\">'+(s.tenure-monthsDone)+'</div><div class=\"chit-num-lbl\">Months left</div></div>';
  html+='</div>';

  // progress bar
  html+='<div class=\"chit-prog-wrap\">';
  html+='<div class=\"chit-prog-bar\"><div class=\"chit-prog-fill\" style=\"width:'+progressPct+'%\"></div></div>';
  html+='<div class=\"chit-prog-meta\"><span>'+progressPct+'% paid</span><span>'+(closureDate?'Closes '+fmtDate(closureDate):'')+'</span></div>';
  if(startDate)html+='<div style=\"font-size:11px;color:var(--mute);margin-top:4px;display:flex;flex-direction:column;gap:1px\"><span>&#128197; Start: '+fmtDate(startDate)+'</span>'+(closureDate?'<span>&#8987; End: &nbsp;'+fmtDate(closureDate)+'</span>':'')+'</div>';
  html+='</div>';

  // loan breakdown box
  html+='<div class=\"chit-lifted-box\">';
  html+='<div class=\"chit-lifted-row\"><span>Loan amount</span><strong>&#8377;'+s.principal.toLocaleString('en-IN')+'</strong></div>';
  html+='<div class=\"chit-lifted-row\"><span>Interest rate</span><strong>'+s.rate+'% p.a.</strong></div>';
  html+='<div class=\"chit-lifted-row\"><span>Principal paid so far</span><strong style=\"color:var(--acc)\">&#8377;'+principalPaid.toLocaleString('en-IN')+'</strong></div>';
  html+='<div class=\"chit-lifted-row\"><span>Interest paid so far</span><strong style=\"color:var(--red)\">&#8377;'+Math.round(interestPaid).toLocaleString('en-IN')+'</strong></div>';
  html+='<div class=\"chit-lifted-row\"><span>Remaining principal</span><strong>&#8377;'+remainingPrincipal.toLocaleString('en-IN')+'</strong></div>';
  html+='</div>';

  // extra interest box
  html+='<div class=\"chit-lifted-box\" style=\"background:var(--reds);margin-top:0\">';
  html+='<div class=\"chit-lifted-row\"><span>Total payable ('+s.tenure+' months)</span><strong>&#8377;'+s.totalPayable.toLocaleString('en-IN')+'</strong></div>';
  html+='<div class=\"chit-lifted-row\"><span>Extra interest over loan life</span><strong style=\"color:var(--red)\">&#8377;'+Math.round(extraInterest).toLocaleString('en-IN')+'</strong></div>';
  html+='</div>';

  // part payments
  if(partPayments.length){
   html+='<div class=\"chit-lifted-box\" style=\"background:var(--soft);margin-top:0\">';
   html+='<div style=\"font-size:11px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px\">Part payments</div>';
   partPayments.forEach(function(p){
    html+='<div class=\"chit-lifted-row\"><span>'+fmtDate(p.date?new Date(p.date+'T12:00:00'):null)+'</span><strong style=\"color:var(--acc)\">&#8377;'+parseFloat(p.amt||0).toLocaleString('en-IN')+'</strong><button class=\"lc-act del\" style=\"margin-left:4px\" data-la=\"emipartdel\" data-lid=\"'+item.id+'\" data-pid=\"'+p.id+'\">&#128465;</button></div>';
   });
   html+='<div class=\"chit-lifted-row\" style=\"border-top:1px solid var(--line);margin-top:4px;padding-top:6px\"><span>Total part paid</span><strong style=\"color:var(--acc)\">&#8377;'+totalPartPaid.toLocaleString('en-IN')+'</strong></div>';
   if(monthsSaved>0)html+='<div class=\"chit-lifted-row\"><span>&#9989; Months saved</span><strong style=\"color:var(--acc)\">'+monthsSaved+' months</strong></div>';
   if(revisedClosureDate)html+='<div class=\"chit-lifted-row\"><span>Revised closure</span><strong>'+fmtDate(revisedClosureDate)+'</strong></div>';
   html+='</div>';
  }

  // footer
  html+='<div class=\"chit-card-ft\">';
  if(item.note)html+='<div style=\"width:100%;font-size:12px;color:var(--mute);font-style:italic;margin-bottom:6px\">'+esc(item.note)+'</div>';
  html+='<div style=\"display:flex;gap:6px;flex-wrap:wrap;width:100%\">';
  if(item.status!=='closed')html+='<button class=\"chit-lift-btn\" data-la=\"emipartadd\" data-lid=\"'+item.id+'\">&#43; Part payment</button>';
  if(item.status!=='closed')html+='<button class=\"chit-lift-btn\" style=\"background:var(--mute)\" data-la=\"emiclose\" data-lid=\"'+item.id+'\">&#128274; Close loan</button>';
  html+='<button class=\"lc-act\" data-la=\"emiedit\" data-lid=\"'+item.id+'\">&#9998;</button>';
  html+='<button class=\"lc-act del\" data-la=\"emidel\" data-lid=\"'+item.id+'\">&#128465;</button>';
  html+='</div></div>';

  html+='</div></div>';
  return html;
 }

 var active=loans.filter(function(x){return x.status!=='closed';});
 var closed=loans.filter(function(x){return x.status==='closed';});

 if(!loans.length&&!oldEmis.length){
  body+='<div class=\"empty-state\"><div class=\"ei\">&#127950;</div><p>No loans added yet.<br><span style=\"font-size:12px\">Track your bike, car, home or personal loans.</span></p></div>';
 }
 if(active.length)body+=active.map(emiCard).join('');
 if(closed.length){body+='<div class=\"life-sec-hd\" style=\"margin-top:16px\">&#10003; Closed loans <span class=\"lsh-cnt\">'+closed.length+'</span></div>'+closed.map(emiCard).join('');}

 // old-style simple EMIs
 if(oldEmis.length){
  body+='<div class=\"life-sec-hd\" style=\"margin-top:16px\">Simple EMIs <span class=\"lsh-cnt\">'+oldEmis.length+'</span></div>';
  body+=oldEmis.map(function(x){return lcRow(x,'emis');}).join('');
 }

 body+='<button class=\"life-add-btn\" data-la=\"ladd\" data-ltype=\"emis\">+ Add loan / EMI</button>';
 return body;
}
