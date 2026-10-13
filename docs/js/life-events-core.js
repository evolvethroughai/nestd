// life-events-core.js - Page navigation + generic item event handlers

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

// bill sub-amount inline input
$('life-page-body').addEventListener('input',function(e){
 var inp=e.target.closest('[data-la="lsubamt"]');if(!inp)return;
 if(!st.subBills)return;
 var sub=st.subBills.filter(function(x){return x.id===inp.getAttribute('data-lid');})[0];if(!sub)return;
 var curMon=new Date().getFullYear()+'-'+('0'+(new Date().getMonth()+1)).slice(-2);
 if(!sub.amtHistory)sub.amtHistory={};
 var v=inp.value.trim();
 if(v)sub.amtHistory[curMon]=v;else delete sub.amtHistory[curMon];
 inp.style.borderColor=v?'var(--acc)':'var(--line)';
 save();
});

$('life-page-body').addEventListener('click',function(e){
 var b=e.target.closest('[data-la]');if(!b)return;
 var la=b.getAttribute('data-la'),lid=b.getAttribute('data-lid'),ltype=b.getAttribute('data-ltype');
 try{
  // extra sections
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
   item.name=nv.trim();save();$('life-page-body').innerHTML=renderLifePage(currentLife);return;
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
  // bills sub-items
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
  // biz2
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
  // delegate to section handlers
  handleChitEvents(la,lid,b);
  handleEmiEvents(la,lid,b);
 }catch(err){console.error('life-events error:',la,err);}
});
