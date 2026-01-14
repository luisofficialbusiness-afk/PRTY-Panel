// ------------------- Login -------------------
const loginModal = document.getElementById('loginModal');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const userDisplay = document.getElementById('userDisplay');

let currentUser = null;
let cooldown = false;
let catastrophicMode = false;

const USERS = {
  "rveprty.": "Shaw2425", // Owner
  "admin1": "adminpass" // Admin
};

// ------------------- Login -------------------
loginBtn.addEventListener('click', () => {
  const user = usernameInput.value.trim();
  const pass = passwordInput.value.trim();
  if(USERS[user] && USERS[user] === pass){
    currentUser = user;
    userDisplay.textContent = user;
    loginModal.classList.add('hidden');
    dashboard.classList.remove('hidden');
    addSystemMessage(`Welcome ${user}!`);
    renderInbox();
  } else {
    loginError.textContent = "Invalid credentials!";
  }
});

// ------------------- Clock -------------------
function updateClock(){
  const now = new Date();
  const clockEl = document.getElementById('clock');
  clockEl.textContent = now.toLocaleString();
}
setInterval(updateClock,1000);
updateClock();

// ------------------- Bugs -------------------
const addBugBtn = document.getElementById('addBugBtn');
const bugForm = document.getElementById('bugForm');
const cancelBug = document.getElementById('cancelBug');
const submitBug = document.getElementById('submitBug');
const bugContainer = document.getElementById('bugContainer');
const bugCooldown = document.getElementById('bugCooldown');
const inboxList = document.getElementById('inboxList');
const catastrophicBtn = document.getElementById('catastrophicBtn');
const catastrophicNotice = document.getElementById('catastrophicNotice');

let bugs = [];
let deleteRequests = [];

// ------------------- Add / Cancel Bug -------------------
addBugBtn.addEventListener('click', () => bugForm.classList.remove('hidden'));
cancelBug.addEventListener('click', () => { bugForm.classList.add('hidden'); bugCooldown.textContent = ""; });

submitBug.addEventListener('click', () => {
  if(cooldown){ bugCooldown.textContent="Wait 15 seconds."; return; }
  const title = document.getElementById('bugTitle').value.trim();
  const desc = document.getElementById('bugDesc').value.trim();
  const severity = document.getElementById('bugSeverity').value;
  const type = document.getElementById('bugType').value;
  if(!title||!desc){ bugCooldown.textContent="Title & Description required!"; return; }

  const bug = {title, desc, severity, type, ownerMade: currentUser==="rveprty."};
  bugs.push(bug);
  renderBugs();

  cooldown=true;
  bugCooldown.textContent="Submitted! Wait 15s.";
  setTimeout(()=>{ cooldown=false; bugCooldown.textContent=""; },15000);

  bugForm.classList.add('hidden');
  document.getElementById('bugTitle').value="";
  document.getElementById('bugDesc').value="";
  addSystemMessage(`${currentUser} submitted a ${type}`);
});

// ------------------- Render Bugs -------------------
const totalBugs = document.getElementById('totalBugs');
const totalSuggestions = document.getElementById('totalSuggestions');
const criticalCount = document.getElementById('criticalCount');
const severeCount = document.getElementById('severeCount');
const mildCount = document.getElementById('mildCount');
const easyCount = document.getElementById('easyCount');

function renderBugs(){
  bugContainer.innerHTML="";
  bugs.forEach((b,i)=>{
    const card=document.createElement('div');
    card.classList.add('bugCard');
    if(b.ownerMade) card.classList.add('ownerMade');

    let actionButton = '';
    if(currentUser==="rveprty."){
      actionButton = `<button onclick="permaDelete(${i})">Perma Delete</button>`;
    } else {
      actionButton = `<button onclick="requestDelete(${i})">Request Delete</button>`;
    }

    card.innerHTML=`
      <h3>${b.title} (${b.type})</h3>
      <p>${b.desc}</p>
      <p>Severity: ${b.severity}</p>
      <p>Creator: ${b.ownerMade?"Owner":"Admin"}</p>
      ${actionButton}
    `;
    bugContainer.appendChild(card);
  });
  updateStats();
}

// ------------------- Delete / Request -------------------
function permaDelete(i){
  if(confirm("Perma-delete this bug?")){
    addSystemMessage("Owner perma-deleted a bug.");
    bugs.splice(i,1);
    renderBugs();
  }
}

function requestDelete(i){
  deleteRequests.push({index:i, requester:currentUser});
  addSystemMessage(`${currentUser} requested perma-delete. Owner review required.`);
  renderInbox();
}

// ------------------- Stats -------------------
function updateStats(){
  totalBugs.textContent = bugs.filter(b=>b.type==="Bug").length;
  totalSuggestions.textContent = bugs.filter(b=>b.type==="Suggestion").length;
  criticalCount.textContent = bugs.filter(b=>b.severity==="Critical").length;
  severeCount.textContent = bugs.filter(b=>b.severity==="Severe").length;
  mildCount.textContent = bugs.filter(b=>b.severity==="Mild").length;
  easyCount.textContent = bugs.filter(b=>b.severity==="Easy").length;
  if(catatastrophicMode && criticalCount.textContent>3){
    catastrophicNotice.classList.remove('hidden');
  } else { catastrophicNotice.classList.add('hidden'); }
}

// ------------------- Inbox / System -------------------
function addSystemMessage(msg){
  const li=document.createElement('li');
  li.textContent=`[System] ${msg}`;
  inboxList.prepend(li);
}

function renderInbox(){
  inboxList.innerHTML="";
  deleteRequests.forEach((req,i)=>{
    const li=document.createElement('li');
    li.innerHTML = `<strong>${req.requester}</strong> requested delete of bug #${req.index} 
      ${currentUser==="rveprty." ? `<button onclick="approveDelete(${i})">Approve</button> <button onclick="denyDelete(${i})">Deny</button>` : ""}`;
    inboxList.appendChild(li);
  });
}

// ------------------- Owner Approval -------------------
function approveDelete(i){
  const req = deleteRequests[i];
  addSystemMessage(`Owner approved deletion of bug #${req.index} requested by ${req.requester}`);
  bugs.splice(req.index,1);
  deleteRequests.splice(i,1);
  renderBugs();
  renderInbox();
}

function denyDelete(i){
  const req = deleteRequests[i];
  addSystemMessage(`Owner denied deletion of bug #${req.index}. Note sent to ${req.requester}`);
  deleteRequests.splice(i,1);
  renderInbox();
}

// ------------------- Catastrophic Mode -------------------
catastrophicBtn.addEventListener('click', ()=>{
  catastrophicMode = !catastrophicMode;
  catastrophicNotice.classList.toggle('hidden', !catastrophicMode);
  addSystemMessage(`Catastrophic Mode ${catastrophicMode ? "Activated" : "Deactivated"}`);
});
