// life-events-emis.js - EMI section event handlers

function handleEmiEvents(la,lid,b){
 if(la==='emiedit'){lmOpenEmi(lid);return;}
 if(la==='emidel'){
  if(!st.emis)return;
  st.emis=st.emis.filter(function(x){return x.id!==lid;});
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;
 }
 if(la==='emitog'){
  emiOpenState[lid]=!emiOpenState[lid];
  var eb=document.getElementById('emibody-'+lid);
  var echev=b.querySelector('span:last-child');
  if(eb)eb.style.display=emiOpenState[lid]?'block':'none';
  if(echev)echev.innerHTML=emiOpenState[lid]?'&#9650;':'&#9660;';
  return;
 }
 if(la==='emiclose'){
  if(!st.emis)return;
  var loan=st.emis.filter(function(x){return x.id===lid;})[0];if(!loan)return;
  loan.status='closed';
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Loan marked closed');return;
 }
 if(la==='emipartadd'){lmOpenEmiPart(lid);return;}
 if(la==='emipartdel'){
  if(!st.emis)return;
  var pid=b.getAttribute('data-pid');
  var loan=st.emis.filter(function(x){return x.id===lid;})[0];if(!loan||!loan.partPayments)return;
  loan.partPayments=loan.partPayments.filter(function(p){return p.id!==pid;});
  save();$('life-page-body').innerHTML=renderLifePage(currentLife);toast('Deleted');return;
 }
}
