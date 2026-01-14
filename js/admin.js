let role = "";
let cooldown = 0;

function login(){
  const u = user.value;
  const p = pass.value;

  if(u==="rveprty." && p==="Shaw2425"){ role="Owner"; }
  else if(u==="admin" && p==="prtyadmin"){ role="Admin"; }
  else { alert("Wrong login"); return; }

  loginDiv = document.getElementById("login");
  panel = document.getElementById("panel");
  loginDiv.style.display="none";
  panel.style.display="block";

  welcome.innerText = `Welcome ${u} (${role})`;
  load();
}

function openForm(){
  if(cooldown>0){ alert("Wait 15s"); return; }
  form.style.display="block";
}

function closeForm(){ form.style.display="none"; }

function submitTicket(){
  let tickets = JSON.parse(localStorage.getItem("tickets")||"[]");

  tickets.push({
    id:Date.now(),
    title:title.value,
    type:type.value,
    severity:severity.value,
    desc:desc.value,
    owner: role==="Owner",
    deleted:false
  });

  localStorage.setItem("tickets",JSON.stringify(tickets));
  cooldown=15;
  setInterval(()=>{if(cooldown>0) cooldown--;},1000);
  closeForm();
  load();
}

function load(){
  let t = JSON.parse(localStorage.getItem("tickets")||"[]");
  ticketsDiv.innerHTML="";
  let stats={Bug:0,Suggestion:0,Critical:0,Severe:0,Mild:0,Easy:0};

  t.forEach(x=>{
    if(!x.deleted){
      stats[x.type]++;
      stats[x.severity]++;
    }

    let d=document.createElement("div");
    d.className="ticket"+(x.owner?" owner":"")+(x.deleted?" deleted":"");
    d.innerHTML=`<b>${x.title}</b> (${x.type})<br>${x.severity}<br>${x.desc}`;

    if(role==="Admin" && !x.deleted)
      d.innerHTML+=`<br><button onclick="softDelete(${x.id})">Remove</button>`;

    if(role==="Owner")
      d.innerHTML+=`<br><button onclick="permaDelete(${x.id})">Perma Delete</button>`;

    ticketsDiv.appendChild(d);
  });

  statsBox.innerText = JSON.stringify(stats,null,2);
}

function softDelete(id){
  let t=JSON.parse(localStorage.getItem("tickets"));
  t.find(x=>x.id==id).deleted=true;
  localStorage.setItem("tickets",JSON.stringify(t));
  load();
}

function permaDelete(id){
  let t=JSON.parse(localStorage.getItem("tickets"));
  t=t.filter(x=>x.id!=id);
  localStorage.setItem("tickets",JSON.stringify(t));
  load();
}

setInterval(()=>{
  let d=new Date();
  clock.innerText=d.toLocaleTimeString();
},1000);

function toggleCatastrophic(){
  alert("Catastrophic Mode: "+JSON.parse(localStorage.getItem("tickets")||"[]").length+" active issues");
}
