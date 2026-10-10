// store.js - State management: save, load, fill, roll
var st=migrate(JSON.parse(JSON.stringify(SEED)));
var dbDoc=null,timer=null,sample=null,toastTimer=null,editingId=null;
var currentCat=null;
var currentLife=null;
var lmEditId=null,lmType=null;

var $=function(i){return document.getElementById(i);};
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML;}
function todayKey(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();}
function isoDate(ts){var d=new Date(ts);return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);}
function fmt(ts){return new Date(ts).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});}
function fmtShort(ts){return new Date(ts).toLocaleDateString(undefined,{day:"numeric",month:"short"});}
function find(id){return st.items.filter(function(x){return x.id===id;})[0];}
function tl(){return st.items.filter(function(x){return x.today;});}
function complete(){return tl().length>0&&tl().every(function(x){return x.d;});}
function nm(k,d){return (st.nm&&st.nm[k])||d;}
function dueDays(x){if(!x.due)return null;var p=x.due.split("-"),d=new Date(+p[0],+p[1]-1,+p[2]),t=new Date();t.setHours(0,0,0,0);return Math.round((d-t)/864e5);}
function pr(x){var dd=dueDays(x);if(dd!==null&&dd<=3&&!x.d)return 1;var s=SEC[x.s];return x.pr!==undefined?x.pr:(s?s.pr:0);}
function queue(p){return st.items.filter(function(x){return !x.d&&!x.today&&pr(x)===p&&SEC[x.s];}).sort(function(a,b){var da=dueDays(a),db=dueDays(b);if(da!==null||db!==null){if(da===null)return 1;if(db===null)return -1;if(da!==db)return da-db;}return SEC[a.s].o-SEC[b.s].o;});}
function canFill(){return [1,2,3,4,5].some(function(p){return queue(p).length>0;});}
function toTop(x){st.items=st.items.filter(function(y){return y!==x;});var i=0;for(;i<st.items.length;i++)if(st.items[i].s===x.s)break;st.items.splice(i,0,x);}
function wkKey(){var d=new Date(),t=new Date(d);t.setDate(d.getDate()-((d.getDay()+3)%7));return t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate();}
function lbOf(t){var m=0;st.g.forEach(function(x){if(x.k==="done"&&x.ts&&x.t===t&&x.ts>m)m=x.ts;});return m;}

function save(){
 try{localStorage.setItem("jt-v5",JSON.stringify(st));}catch(e){}
 if(dbDoc){clearTimeout(timer);timer=setTimeout(function(){dbDoc.set({json:JSON.stringify(st)}).catch(function(){});},500);}
}
function fill(){
 st.items.forEach(function(x){if(x.today&&x.d)x.today=false;});
 var need=5-tl().length,q={},P=[1,2,3,4,5];
 P.forEach(function(p){q[p]=queue(p);});
 P.forEach(function(p){if(need>0&&q[p].length){q[p].shift().today=true;need--;}});
 P.forEach(function(p){while(need>0&&q[p].length){q[p].shift().today=true;need--;}});
}
function roll(){
 var k=todayKey(),w=wkKey(),ch=false;
 if(!st.bk){st.bk=Date.now();ch=true;}
 if(st.wk!==w){st.g.forEach(function(x){if(x.k==="week"){x.d=false;x.boughtOn=undefined;}});st.wk=w;ch=true;}
 if(st.day!==k){
  if(complete()){
   if(!st.streak)st.streak={count:0,last:""};
   var yest=new Date();yest.setDate(yest.getDate()-1);
   var yk=yest.getFullYear()+"-"+(yest.getMonth()+1)+"-"+yest.getDate();
   st.streak.count=(st.day===yk||st.day===k)?(st.streak.count||0)+1:1;
   st.streak.last=k;
   fill();
  }
  st.day=k;ch=true;
 }
 if(ch)save();
}
