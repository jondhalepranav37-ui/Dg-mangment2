const KEY="dg_work_manager_v1";
let tasks=JSON.parse(localStorage.getItem(KEY)||"[]");

function save(){localStorage.setItem(KEY,JSON.stringify(tasks));render();}
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function addTask(){
 const customer=document.getElementById("customer").value.trim();
 const dgno=document.getElementById("dgno").value.trim();
 const type=document.getElementById("type").value;
 const title=document.getElementById("title").value.trim();
 const due=document.getElementById("due").value;
 const priority=document.getElementById("priority").value;
 const notes=document.getElementById("notes").value.trim();
 if(!title){alert("Please enter work details.");return;}
 tasks.unshift({id:Date.now(),customer,dgno,type,title,due,priority,notes,done:false,created:new Date().toISOString()});
 ["customer","dgno","title","due","notes"].forEach(id=>document.getElementById(id).value="");
 save(); show("dashboard",document.getElementById("nav-dashboard"));
}
function complete(id){const t=tasks.find(x=>x.id===id);if(t){t.done=true;t.completed=new Date().toISOString();save();}}
function restore(id){const t=tasks.find(x=>x.id===id);if(t){t.done=false;delete t.completed;save();}}
function removeTask(id){if(confirm("Delete this work?")){tasks=tasks.filter(x=>x.id!==id);save();}}
function fmtDate(d){if(!d)return "No due date";let x=new Date(d+"T00:00:00");return x.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}
function isToday(d){if(!d)return false;return d===new Date().toISOString().slice(0,10);}
function isPast(d){if(!d)return false;return d<new Date().toISOString().slice(0,10);}
function card(t,history=false){
 return `<div class="task">
 <div class="task-top"><div class="task-title">${esc(t.title)}</div><span class="badge">${esc(t.type)}</span></div>
 <div class="meta"><b>${esc(t.customer||"No customer")}</b> ${t.dgno?"• DG: "+esc(t.dgno):""}<br>
 Due: ${fmtDate(t.due)} ${t.priority==="Urgent"?"• 🔴 Urgent":""}<br>${t.notes?esc(t.notes):""}</div>
 <div class="actions">${history?`<button class="secondary small" onclick="restore(${t.id})">Restore</button>`:`<button class="small" onclick="complete(${t.id})">✓ Complete</button>`}<button class="danger small" onclick="removeTask(${t.id})">Delete</button></div>
 </div>`;
}
function render(){
 const active=tasks.filter(t=>!t.done), done=tasks.filter(t=>t.done);
 document.getElementById("activeCount").textContent=active.length;
 document.getElementById("pendingCount").textContent=active.filter(t=>isPast(t.due)||isToday(t.due)).length;
 document.getElementById("completedCount").textContent=done.length;
 document.getElementById("paymentCount").textContent=active.filter(t=>t.type==="Payment / Outstanding").length;
 const urgent=active.filter(t=>t.priority==="Urgent"||isToday(t.due)||isPast(t.due));
 document.getElementById("urgentList").innerHTML=urgent.length?urgent.map(t=>card(t)).join(""):'<div class="empty">No urgent / due work.</div>';
 document.getElementById("taskList").innerHTML=active.length?active.map(t=>card(t)).join(""):'<div class="empty">No active work. Add your first job.</div>';
 document.getElementById("historyList").innerHTML=done.length?done.map(t=>card(t,true)).join(""):'<div class="empty">No completed work yet.</div>';
}
function show(id,btn){
 document.querySelectorAll(".screen").forEach(x=>x.classList.add("hidden"));
 document.getElementById(id).classList.remove("hidden");
 document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));
 if(btn)btn.classList.add("active");
 render();
}
function exportData(){
 const blob=new Blob([JSON.stringify(tasks,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="DG-Work-Backup-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(a.href);
}
function importData(e){
 const f=e.target.files[0];if(!f)return;
 const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);if(!Array.isArray(data))throw 0;tasks=data;save();alert("Backup restored.");}catch{alert("Invalid backup file.");}};r.readAsText(f);
}
function clearCompleted(){if(confirm("Clear completed history?")){tasks=tasks.filter(t=>!t.done);save();}}
function resetAll(){if(confirm("Delete ALL work data? This cannot be undone unless you have a backup.")){tasks=[];save();}}
render();
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
