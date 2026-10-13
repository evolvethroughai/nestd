// life-utils.js - Shared date/due helpers

function lifeDueDays(due){
 if(!due)return null;
 var p=due.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]),t=new Date();t.setHours(0,0,0,0);
 return Math.round((d-t)/864e5);
}
function lifeDueCls(dd){
 if(dd===null)return 'ok';
 if(dd<0)return 'overdue';
 if(dd===0)return 'today';
 if(dd<=5)return 'soon';
 return 'ok';
}
function lifeDueLbl(dd,due){
 if(dd===null)return '';
 if(dd<0)return 'Overdue';
 if(dd===0)return 'Due today';
 if(dd===1)return 'Due tomorrow';
 if(due)return 'Due '+new Date(due+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short'});
 return '';
}
function subDueDate(dueDay){
 if(!dueDay)return null;
 var n=new Date(),y=n.getFullYear(),m=n.getMonth();
 var d=new Date(y,m,dueDay);
 if(d<n&&n.getDate()>dueDay)d=new Date(y,m+1,dueDay);
 var mm=('0'+(d.getMonth()+1)).slice(-2),dd2=('0'+d.getDate()).slice(-2);
 return d.getFullYear()+'-'+mm+'-'+dd2;
}
