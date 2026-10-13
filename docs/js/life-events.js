// life-events.js - All event handlers for Life OS page

function openLifePage(type){
 currentLife=type;
 $('life-page-title').textContent=nm('l-'+type,LIFE_TITLES[type]||type);
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
 if(la==='lexadd'){
  var leid=b.getAttribute('data-leid');
  var nm2=prompt('Item name:','');if(!nm2||!nm2.trim())return;
  var note2=prompt('Note / amount (optional):','');
  if(!st.lifeItems)st.lifeItems={};
  if(!st.lifeItems[leid])st.lifeItems[leid]=[];
  st.lifeItems[leid].push({id:'lx'+Date.now(),name:nm2.trim(),note:note2&&note2.trim()||undefined});
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);return;
 }
 if(la==='lexedit'){
  var leid=b.getAttribute('data-leid'),lid2=b.getAttribute('data-lid');
  if(!st.lifeItems||!st.lifeItems[leid])return;
  var item=st.lifeItems[leid].filter(function(x){return x.id===lid2;})[0];if(!item)return;
  var nv=prompt('Rename:',item.name);if(!nv||!nv.trim())return;
  item.name=nv.trim();
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);return;
 }
 if(la==='lexdel'){
  var leid=b.getAttribute('data-leid'),lid2=b.getAttribute('data-lid');
  if(!st.lifeItems||!st.lifeItems[leid])return;
  st.lifeItems[leid]=st.lifeItems[leid].filter(function(x){return x.id!==lid2;});
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;
 }
 if(la==='lexdelsec'){
  var leid=b.getAttribute('data-leid');
  if(!confirm('Remove this section and all its items?'))return;
  st.lifeExtra=(st.lifeExtra||[]).filter(function(e){return e.id!==leid;});
  if(st.lifeItems)delete st.lifeItems[leid];
  save();closeLifePage();renderAll();return;
 }
 if(la==='ladd'){lmOpen(ltype,null,b.getAttribute('data-htype'));return;}
 if(la==='ledit'){lmOpen(ltype,lid);return;}
 if(la==='chitclose'){
  if(!st.chits)return;
  var chit=st.chits.filter(function(x){return x.id===lid;})[0];if(!chit)return;
  var now2=new Date();
  var _cdd=('0'+now2.getDate()).slice(-2),_cdm=('0'+(now2.getMonth()+1)).slice(-2),_cdy=String(now2.getFullYear());
  var _cdays='<option value="">DD</option>';for(var _d=1;_d<=31;_d++){var _dv=('0'+_d).slice(-2);_cdays+='<option value="'+_dv+'"'+(_dv===_cdd?' selected':'')+'>'+_dv+'</option>';}
  var _cmonths='<option value="">MM</option>';var _cmn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];for(var _m=1;_m<=12;_m++){var _mv=('0'+_m).slice(-2);_cmonths+='<option value="'+_mv+'"'+(_mv===_cdm?' selected':'')+'>'+_mv+' '+_cmn[_m-1]+'</option>';}
  var _cyears='<option value="">YYYY</option>';var _cy3=now2.getFullYear();for(var _y=_cy3-3;_y<=_cy3+1;_y++){_cyears+='<option value="'+_y+'"'+(_y===_cy3?' selected':'')+'>'+_y+'</option>';}
  $('lm-title').textContent='Mark chit closed \u2014 '+esc(chit.name);
  $('lm-del').hidden=true;
  $('lm-fields').innerHTML='<input type="hidden" id="lm-name" value="'+esc(chit.name)+'">'
   +'<input type="hidden" id="lm-htype" value=""><input type="hidden" id="lm-icon" value=""><input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-note" value="">'
   +'<label>Date of closing</label><div style="display:flex;gap:6px;min-width:0"><select id="lm-close-d" style="flex:1;min-width:0">'+_cdays+'</select><select id="lm-close-m" style="flex:1.4;min-width:0">'+_cmonths+'</select><select id="lm-close-y" style="flex:1.6;min-width:0">'+_cyears+'</select></div>';
  lmType='chitclose';lmEditId=lid;
  $('life-modal-overlay').hidden=false;
  setTimeout(function(){var n=$('lm-close-d');if(n)n.focus();},60);
  return;
 }
 if(la==='chitdel'){if(!st.chits)return;st.chits=st.chits.filter(function(x){return x.id!==lid;});save();$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;}
 if(la==='chitlift'){
  if(!st.chits)return;
  var chit=st.chits.filter(function(x){return x.id===lid;})[0];if(!chit)return;
  var chitPot=parseFloat(chit.pot||0);
  var now2=new Date();
  var _ldd=('0'+now2.getDate()).slice(-2),_ldm=('0'+(now2.getMonth()+1)).slice(-2),_ldy=String(now2.getFullYear());
  var _ldays='<option value="">DD</option>';for(var _d=1;_d<=31;_d++){var _dv=('0'+_d).slice(-2);_ldays+='<option value="'+_dv+'"'+(_dv===_ldd?' selected':'')+'>'+_dv+'</option>';}
  var _lmonths='<option value="">MM</option>';var _lmn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];for(var _m=1;_m<=12;_m++){var _mv=('0'+_m).slice(-2);_lmonths+='<option value="'+_mv+'"'+(_mv===_ldm?' selected':'')+'>'+_mv+' '+_lmn[_m-1]+'</option>';}
  var _lyears='<option value="">YYYY</option>';var _cy2=now2.getFullYear();for(var _y=_cy2-3;_y<=_cy2+1;_y++){_lyears+='<option value="'+_y+'"'+(_y===_cy2?' selected':'')+'>'+_y+'</option>';}
  var f2='<input type="hidden" id="lm-htype" value=""><input type="hidden" id="lm-icon" value=""><input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-note" value="">';
  f2+='<label>Date of lifting</label><div style="display:flex;gap:6px;min-width:0"><select id="lm-lift-d" style="flex:1;min-width:0">'+_ldays+'</select><select id="lm-lift-m" style="flex:1.4;min-width:0">'+_lmonths+'</select><select id="lm-lift-y" style="flex:1.6;min-width:0">'+_lyears+'</select></div>';
  f2+='<label>Commission cut (&#8377;)</label><input id="lm-commission" type="text" inputmode="numeric" maxlength="12" placeholder="e.g. 4500">';
  f2+='<div style="font-size:12px;color:var(--mute);margin-top:4px">Amount received = &#8377;'+chitPot.toLocaleString('en-IN')+' \u2212 commission (auto-calculated)</div>';
  $('lm-title').textContent='Lift chit \u2014 '+esc(chit.name);
  $('lm-del').hidden=true;
  $('lm-fields').innerHTML='<input type="hidden" id="lm-name" value="'+esc(chit.name)+'">'+f2;
  lmType='chitlift';lmEditId=lid;
  $('life-modal-overlay').hidden=false;
  setTimeout(function(){var n=$('lm-lift-d');if(n)n.focus();},60);
  return;
 }
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
  for(var bm=1;bm<=months;bm++){var r2=pot-comm;var net2=r2-(monthly*months);if(net2>=0){beMonth=bm;break;}}
  if(!beMonth){for(var bm=1;bm<=months;bm++){var r2=pot-0;var net2=r2-(monthly*months);if(net2>=0){beMonth=bm;break;}}}
  if(beMonth)html+='<div class="chit-lifted-row" style="margin-top:8px"><span>&#128161; Break-even if lifted at</span><strong>Month '+beMonth+' or later</strong></div>';
  html+='</div>';
  res.innerHTML=html;
  return;
 }
 if(la==='emitog'){
  emiOpenState[lid]=!emiOpenState[lid];
  var eb=document.getElementById('emibody-'+lid);
  var echev=b.querySelector('span:last-child');
  if(eb)eb.style.display=emiOpenState[lid]?'block':'none';
  if(echev)echev.innerHTML=emiOpenState[lid]?'&#9650;':'&#9660;';
  return;
 }
 if(la==='emiedit'){lmOpen('emis',lid);return;}
 if(la==='emidel'){if(st.emis)st.emis=st.emis.filter(function(x){return x.id!==lid;});save();$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;}
 if(la==='emiclose'){
  if(!st.emis)return;
  var loan=st.emis.filter(function(x){return x.id===lid;})[0];if(!loan)return;
  loan.status='closed';
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Loan marked closed');return;
 }
 if(la==='emipartadd'){
  if(!st.emis)return;
  var loan=st.emis.filter(function(x){return x.id===lid;})[0];if(!loan)return;
  var now3=new Date();
  var _pdd=('0'+now3.getDate()).slice(-2),_pdm=('0'+(now3.getMonth()+1)).slice(-2),_pdy=String(now3.getFullYear());
  var _pdays='<option value="">DD</option>';for(var _d=1;_d<=31;_d++){var _dv=('0'+_d).slice(-2);_pdays+='<option value="'+_dv+'"'+(_dv===_pdd?' selected':'')+'>'+_dv+'</option>';}
  var _pmonths='<option value="">MM</option>';var _pmn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];for(var _m=1;_m<=12;_m++){var _mv=('0'+_m).slice(-2);_pmonths+='<option value="'+_mv+'"'+(_mv===_pdm?' selected':'')+'>'+_mv+' '+_pmn[_m-1]+'</option>';}
  var _pyears='<option value="">YYYY</option>';var _pcy=now3.getFullYear();for(var _y=_pcy-3;_y<=_pcy+1;_y++){_pyears+='<option value="'+_y+'"'+(_y===_pcy?' selected':'')+'>'+_y+'</option>';}
  $('lm-title').textContent='Part payment \u2014 '+esc(loan.name);
  $('lm-del').hidden=true;
  $('lm-fields').innerHTML='<input type="hidden" id="lm-name" value="'+esc(loan.name)+'"><input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-note" value=""><input type="hidden" id="lm-icon" value=""><input type="hidden" id="lm-htype" value="">'
   +'<label>Amount paid (&#8377;)</label><input id="lm-partamt" type="text" inputmode="numeric" maxlength="12" placeholder="e.g. 50000">'
   +'<label>Date of payment</label><div style="display:flex;gap:6px;min-width:0"><select id="lm-pp-d" style="flex:1;min-width:0">'+_pdays+'</select><select id="lm-pp-m" style="flex:1.4;min-width:0">'+_pmonths+'</select><select id="lm-pp-y" style="flex:1.6;min-width:0">'+_pyears+'</select></div>';
  lmType='emipart';lmEditId=lid;
  $('life-modal-overlay').hidden=false;
  setTimeout(function(){var n=$('lm-partamt');if(n)n.focus();},60);
  return;
 }
 if(la==='emipartdel'){
  if(!st.emis)return;
  var pid=b.getAttribute('data-pid');
  var loan=st.emis.filter(function(x){return x.id===lid;})[0];if(!loan||!loan.partPayments)return;
  loan.partPayments=loan.partPayments.filter(function(p){return p.id!==pid;});
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
 if(la==='chitliftededit'){
  if(!st.chits)return;
  var chit=st.chits.filter(function(x){return x.id===lid;})[0];if(!chit)return;
  var chitPot=parseFloat(chit.pot||0);
  var ex=chit.liftedDate?chit.liftedDate.split('-'):[];
  var _ldd=ex[2]||('0'+new Date().getDate()).slice(-2);
  var _ldm=ex[1]||('0'+(new Date().getMonth()+1)).slice(-2);
  var _ldy=ex[0]||String(new Date().getFullYear());
  var _ldays='<option value="">DD</option>';for(var _d=1;_d<=31;_d++){var _dv=('0'+_d).slice(-2);_ldays+='<option value="'+_dv+'"'+(_dv===_ldd?' selected':'')+'>'+_dv+'</option>';}
  var _lmonths='<option value="">MM</option>';var _lmn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];for(var _m=1;_m<=12;_m++){var _mv=('0'+_m).slice(-2);_lmonths+='<option value="'+_mv+'"'+(_mv===_ldm?' selected':'')+'>'+_mv+' '+_lmn[_m-1]+'</option>';}
  var _lyears='<option value="">YYYY</option>';var _cy2=new Date().getFullYear();for(var _y=_cy2-5;_y<=_cy2+1;_y++){_lyears+='<option value="'+_y+'"'+(_y===parseInt(_ldy)?' selected':'')+'>'+_y+'</option>';}
  var f2='<input type="hidden" id="lm-htype" value=""><input type="hidden" id="lm-icon" value=""><input type="hidden" id="lm-amt" value=""><input type="hidden" id="lm-due" value=""><input type="hidden" id="lm-note" value="">';
  f2+='<label>Date of lifting</label><div style="display:flex;gap:6px;min-width:0"><select id="lm-lift-d" style="flex:1;min-width:0">'+_ldays+'</select><select id="lm-lift-m" style="flex:1.4;min-width:0">'+_lmonths+'</select><select id="lm-lift-y" style="flex:1.6;min-width:0">'+_lyears+'</select></div>';
  f2+='<label>Commission cut (&#8377;)</label><input id="lm-commission" type="text" inputmode="numeric" maxlength="12" value="'+esc(chit.commission||'')+'" placeholder="e.g. 4500">';
  f2+='<div style="font-size:12px;color:var(--mute);margin-top:4px">Amount received = &#8377;'+chitPot.toLocaleString('en-IN')+' \u2212 commission (auto-calculated)</div>';
  $('lm-title').textContent='Edit lift date \u2014 '+esc(chit.name);
  $('lm-del').hidden=true;
  $('lm-fields').innerHTML='<input type="hidden" id="lm-name" value="'+esc(chit.name)+'">'+f2;
  lmType='chitlift';lmEditId=lid;
  $('life-modal-overlay').hidden=false;
  setTimeout(function(){var n=$('lm-lift-d');if(n)n.focus();},60);
  return;
 }
 if(la==='chitedit'){lmOpen('chits',lid);return;}
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
