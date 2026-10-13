// life-modal-core.js - Modal open/close + shared save/delete dispatcher

var lmType=null,lmEditId=null;

function lmClose(){
 $('life-modal-overlay').hidden=true;
 lmEditId=null;lmType=null;
}
$('lm-cancel').onclick=lmClose;
$('life-modal-overlay').addEventListener('click',function(e){
 if(e.target===$('life-modal-overlay'))lmClose();
});

function lmShow(title,fields,editId,type){
 $('lm-title').textContent=title;
 $('lm-fields').innerHTML=fields;
 $('lm-del').hidden=!editId;
 lmEditId=editId||null;
 lmType=type;
 $('life-modal-overlay').hidden=false;
 setTimeout(function(){var n=$('lm-name')||$('lm-partamt')||$('lm-close-d');if(n)n.focus();},60);
}

function lmRefresh(){
 if(currentLife)$('life-page-body').innerHTML=renderLifePage(currentLife);
}

// date select helpers
function makeDayOpts(sel){
 var h='<option value="">DD</option>';
 for(var d=1;d<=31;d++){var v=('0'+d).slice(-2);h+='<option value="'+v+'"'+(v===sel?' selected':'')+'>'+v+'</option>';}
 return h;
}
function makeMonthOpts(sel){
 var mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 var h='<option value="">MM</option>';
 for(var m=1;m<=12;m++){var v=('0'+m).slice(-2);h+='<option value="'+v+'"'+(v===sel?' selected':'')+'>'+v+' '+mn[m-1]+'</option>';}
 return h;
}
function makeYearOpts(sel,from,to){
 var h='<option value="">YYYY</option>';
 for(var y=from;y<=to;y++){h+='<option value="'+y+'"'+(String(y)===String(sel)?' selected':'')+'>'+y+'</option>';}
 return h;
}
function dateSelects(idPrefix,stored,fromYr,toYr){
 var p=stored?stored.split('-'):[];
 var dy=p[0]||'',dm=p[1]||'',dd=p[2]||'';
 var cy=new Date().getFullYear();
 return '<div style="display:flex;gap:6px;min-width:0">'
  +'<select id="'+idPrefix+'-d" style="flex:1;min-width:0">'+makeDayOpts(dd)+'</select>'
  +'<select id="'+idPrefix+'-m" style="flex:1.4;min-width:0">'+makeMonthOpts(dm)+'</select>'
  +'<select id="'+idPrefix+'-y" style="flex:1.6;min-width:0">'+makeYearOpts(dy,fromYr||cy-10,toYr||cy+2)+'</select>'
  +'</div>';
}
function readDateSelects(idPrefix){
 var d=(document.getElementById(idPrefix+'-d')||{value:''}).value;
 var m=(document.getElementById(idPrefix+'-m')||{value:''}).value;
 var y=(document.getElementById(idPrefix+'-y')||{value:''}).value;
 return (y&&m&&d)?y+'-'+m+'-'+d:undefined;
}

$('lm-save').onclick=function(){
 try{
  if(lmType==='subbill'){lmSaveSubbill();return;}
  if(lmType==='chitclose'){lmSaveChitClose();return;}
  if(lmType==='chitlift'){lmSaveChitLift();return;}
  if(lmType==='chits'){lmSaveChit();return;}
  if(lmType==='emipart'){lmSaveEmiPart();return;}
  if(lmType==='emis'){lmSaveEmi();return;}
  lmSaveGeneric();
 }catch(e){console.error('lm-save error',e);}
};

$('lm-del').onclick=function(){
 if(!lmEditId||!lmType)return;
 try{
  if(lmType==='subbill'){if(st.subBills)st.subBills=st.subBills.filter(function(x){return x.id!==lmEditId;});save();lmClose();lmRefresh();toast('Deleted');return;}
  if(lmType==='chits'){if(st.chits)st.chits=st.chits.filter(function(x){return x.id!==lmEditId;});save();lmClose();lmRefresh();toast('Deleted');return;}
  if(lmType==='emis'){if(st.emis)st.emis=st.emis.filter(function(x){return x.id!==lmEditId;});save();lmClose();lmRefresh();toast('Deleted');return;}
  if(lmType==='invest'){st.invest=st.invest.filter(function(x){return x.id!==lmEditId;});}
  else if(lmType==='health'){st.health=st.health.filter(function(x){return x.id!==lmEditId;});}
  else if(lmType==='biz2'){st.biz2.ideas=st.biz2.ideas.filter(function(x){return x.id!==lmEditId;});if(st.biz2.active===lmEditId)st.biz2.active=null;}
  else if(lmType==='bills'){st.bills=st.bills.filter(function(x){return x.id!==lmEditId;});}
  save();lmClose();lmRefresh();toast('Deleted');
 }catch(e){console.error('lm-del error',e);}
};
