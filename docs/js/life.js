// life.js - Router only. Render logic is in life-bills.js, life-chits.js etc.

function renderLifePage(type){
 var body='';
 if(type&&type.indexOf('x-')===0){
  var eid=type.slice(2);
  var ex=(st.lifeExtra||[]).filter(function(e){return e.id===eid;})[0];
  if(!ex)return '<p class="note">Section not found.</p>';
  if(!st.lifeItems)st.lifeItems={};
  if(!st.lifeItems[eid])st.lifeItems[eid]=[];
  var items=st.lifeItems[eid];
  if(!items.length)body+='<div class="empty-state"><div class="ei">'+esc(ex.icon||'📌')+'</div><p>Nothing here yet.</p></div>';
  else items.forEach(function(item){
   body+='<div class="lc"><div class="lc-row">';
   body+='<span class="lc-icon">'+esc(ex.icon||'📌')+'</span>';
   body+='<div class="lc-body"><div class="lc-name">'+esc(item.name)+'</div>'+(item.note?'<div class="lc-meta">'+esc(item.note)+'</div>':'')+'</div>';
   if(item.amt)body+='<div class="lc-amt">&#8377;'+esc(item.amt)+'</div>';
   body+='<button class="lc-act" data-la="lexedit" data-lid="'+item.id+'" data-leid="'+eid+'">&#9998;</button>';
   body+='<button class="lc-act del" data-la="lexdel" data-lid="'+item.id+'" data-leid="'+eid+'">&#128465;</button>';
   body+='</div></div>';
  });
  body+='<button class="life-add-btn" data-la="lexadd" data-leid="'+eid+'">+ Add item</button>';
  body+='<div style="margin-top:16px;text-align:center"><button style="font-size:12px;color:var(--red);background:none;border:0;cursor:pointer" data-la="lexdelsec" data-leid="'+eid+'">Remove this section</button></div>';
  return body;
 }
 if(type==='bills')  return renderBillsPage();
 if(type==='chits')  return renderChitsPage();
 if(type==='emis')   return renderEmisPage();
 if(type==='invest'){
  var pending=st.invest.filter(function(x){return !x.paid;});
  var done=st.invest.filter(function(x){return x.paid;});
  if(!st.invest.length){body+='<div class="empty-state"><div class="ei">&#128200;</div><p>No investments added yet.</p></div>';}
  else{
   if(pending.length){body+='<div class="life-section"><div class="life-sec-hd">This month <span class="lsh-cnt">'+pending.length+'</span></div>'+pending.map(function(x){return lcRow(x,'invest');}).join('')+'</div>';}
   if(done.length){body+='<div class="life-section"><div class="life-sec-hd">Done <span class="lsh-cnt">'+done.length+'</span></div>'+done.map(function(x){return lcRow(x,'invest');}).join('')+'</div>';}
  }
  body+='<button class="life-add-btn" data-la="ladd" data-ltype="invest">+ Add investment</button>';
  return body;
 }
 if(type==='health'){
  var meds=st.health.filter(function(x){return x.htype==='med';});
  var appts=st.health.filter(function(x){return x.htype==='appt';});
  if(meds.length){body+='<div class="life-section"><div class="life-sec-hd">💊 Medicines to restock <span class="lsh-cnt">'+meds.length+'</span></div>'+meds.map(function(x){return lcRow(x,'health');}).join('')+'</div>';}
  if(appts.length){body+='<div class="life-section"><div class="life-sec-hd">🏥 Appointments <span class="lsh-cnt">'+appts.length+'</span></div>'+appts.map(function(x){return lcRow(x,'health');}).join('')+'</div>';}
  if(!st.health.length){body+='<div class="empty-state"><div class="ei">💊</div><p>No medicines or appointments yet.</p></div>';}
  body+='<button class="life-add-btn" data-la="ladd" data-ltype="health" data-htype="med">+ Add medicine</button>';
  body+='<button class="life-add-btn" data-la="ladd" data-ltype="health" data-htype="appt" style="margin-top:6px">+ Add appointment</button>';
  return body;
 }
 if(type==='biz2'){
  var b=st.biz2;
  body+='<div class="life-section"><div class="life-sec-hd">💡 Ideas</div>';
  if(!b.ideas.length){body+='<p class="note">No ideas yet.</p>';}
  b.ideas.forEach(function(idea){
   var isActive=b.active===idea.id;
   body+='<div class="lc"><div class="lc-row">';
   body+='<span class="lc-icon">'+(isActive?'🚀':'💡')+'</span>';
   body+='<div class="lc-body"><div class="lc-name">'+esc(idea.name)+'</div>'+(idea.note?'<div class="lc-meta">'+esc(idea.note)+'</div>':'')+'</div>';
   if(!isActive)body+='<button class="lc-act" data-la="lactivate" data-lid="'+idea.id+'" style="font-size:12px;padding:4px 8px;border:1.5px solid var(--acc);border-radius:8px;color:var(--acc);font-weight:700">Activate</button>';
   else body+='<span style="font-size:11px;font-weight:800;color:var(--acc);padding:4px 8px">Active</span>';
   body+='<button class="lc-act" data-la="ledit" data-lid="'+idea.id+'" data-ltype="biz2">&#9998;</button>';
   body+='<button class="lc-act del" data-la="ldel" data-lid="'+idea.id+'" data-ltype="biz2">&#128465;</button>';
   body+='</div></div>';
  });
  body+='<button class="life-add-btn" data-la="ladd" data-ltype="biz2">+ Add idea</button></div>';
  if(b.active){
   var activeIdea=b.ideas.filter(function(x){return x.id===b.active;})[0];
   if(activeIdea){
    body+='<div class="life-section"><div class="life-sec-hd">🚀 Active: '+esc(activeIdea.name)+'</div>';
    if(!b.tasks.length){body+='<p class="note">No tasks yet.</p>';}
    b.tasks.forEach(function(task){
     body+='<div class="lc"><div class="lc-row">';
     body+='<button class="lc-paid'+(task.d?' done':'')+'" data-la="lbiztog" data-lid="'+task.id+'">'+(task.d?'✓':'')+'</button>';
     body+='<div class="lc-body"><div class="lc-name" style="'+(task.d?'text-decoration:line-through;color:var(--mute)':'')+'">'+esc(task.t)+'</div></div>';
     body+='<button class="lc-act del" data-la="lbizdel" data-lid="'+task.id+'">&#128465;</button>';
     body+='</div></div>';
    });
    body+='<div class="inline-add" style="margin-top:8px"><input type="text" id="biz-task-inp" placeholder="Add task\u2026" maxlength="120"><button data-la="lbizadd">Add</button></div>';
    body+='</div>';
   }
  }
  return body;
 }
 return body;
}
