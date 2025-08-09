const apiBase = '/api';
const app = document.getElementById('app');
function setHTML(html){ app.innerHTML = html; }
function saveToken(t){ localStorage.setItem('token', t); }
function getToken(){ return localStorage.getItem('token'); }
function authFetch(url, opts={}){
  opts.headers = opts.headers || {};
  const token = getToken();
  if(token) opts.headers['Authorization'] = 'Bearer ' + token;
  opts.headers['Content-Type'] = 'application/json';
  return fetch(url, opts).then(r => r.json());
}
function showLogin(){
  setHTML(`
    <div class="card"><h2>Login</h2>
      <div class="row"><input id="email" placeholder="Email" class="small"/><input id="password" type="password" placeholder="Password" class="small"/><button id="loginBtn">Login</button></div>
      <p>Or <a href="#" id="toSignup">create account</a></p>
    </div>`);
  document.getElementById('toSignup').onclick = (e)=>{ e.preventDefault(); showSignup(); };
  document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(apiBase + '/auth/login', { method:'POST', body: JSON.stringify({email,password}), headers:{'Content-Type':'application/json'} });
    if(res.ok || res.status===200){ const data = await res.json(); saveToken(data.token); showHome(); }
    else { const err = await res.json(); alert(err.message || err.error || 'Login failed'); }
  };
}
function showSignup(){
  setHTML(`
    <div class="card"><h2>Signup</h2>
      <div class="row"><input id="name" placeholder="Name" class="small"/><input id="email" placeholder="Email" class="small"/><input id="password" type="password" placeholder="Password" class="small"/><button id="signupBtn">Create</button></div>
      <p>Already have account? <a href="#" id="toLogin">login</a></p>
    </div>`);
  document.getElementById('toLogin').onclick = (e)=>{ e.preventDefault(); showLogin(); };
  document.getElementById('signupBtn').onclick = async () => {
    const name=document.getElementById('name').value, email=document.getElementById('email').value, password=document.getElementById('password').value;
    const res = await fetch(apiBase + '/auth/signup', { method:'POST', body: JSON.stringify({name,email,password}), headers:{'Content-Type':'application/json'} });
    const data = await res.json();
    if(res.ok){ saveToken(data.token); showHome(); } else { alert(data.message || data.error || 'Signup failed'); }
  };
}
async function showHome(){
  setHTML('<div class="card"><h2>Loading...</h2></div>');
  const meRes = await authFetch(apiBase + '/user/me');
  if(!meRes.user) { showLogin(); return; }
  const user = meRes.user;
  const contactsRes = await authFetch(apiBase + '/contacts');
  const callsRes = await authFetch(apiBase + '/calls');
  const contacts = contactsRes.contacts || [];
  const calls = callsRes.calls || [];
  setHTML(`
    <div class="card"><h2>Welcome, ${user.name}</h2>
      <div class="row">
        <input id="roomId" placeholder="room id (or leave blank to create random)"/>
        <button id="createBtn">Create Room</button>
        <button id="joinBtn">Join Room</button>
        <button id="logoutBtn">Logout</button>
      </div>
    </div>
    <div class="card">
      <h3>Contacts</h3>
      <div class="row"><input id="contactEmail" placeholder="Contact email" class="small"/><button id="addContact">Add</button></div>
      <ul id="contactList">${contacts.map(c => `<li>${c} <button class="remove" data-email="${c}">Remove</button> <button class="call" data-email="${c}">Call</button></li>`).join('')}</ul>
    </div>
    <div class="card">
      <h3>Call History</h3>
      <ul>${(calls || []).map(c => `<li>${new Date(c.startTime).toLocaleString()} — ${c.caller} → ${c.receiver} (room: ${c.roomId}) duration: ${c.endTime ? ((new Date(c.endTime)-new Date(c.startTime))/1000).toFixed(0)+'s' : 'ongoing'}</li>`).join('')}</ul>
    </div>
  `);
  document.getElementById('logoutBtn').onclick = ()=>{ localStorage.removeItem('token'); showLogin(); };
  document.getElementById('createBtn').onclick = ()=>{ const room = 'room_' + Math.random().toString(36).slice(2,9); startCall(room); };
  document.getElementById('joinBtn').onclick = ()=>{ const room = document.getElementById('roomId').value.trim(); if(!room) return alert('Enter room id or create one'); startCall(room); };
  document.getElementById('addContact').onclick = async ()=>{
    const email = document.getElementById('contactEmail').value.trim();
    if(!email) return alert('enter email');
    const res = await authFetch(apiBase + '/contacts', { method:'POST', body: JSON.stringify({email}) });
    if(res.contacts) showHome();
    else alert(res.message || 'error');
  };
  document.querySelectorAll('.remove').forEach(b=>b.onclick=async (e)=>{ const email=e.target.dataset.email; await authFetch(apiBase + '/contacts', { method:'DELETE', body: JSON.stringify({email}) }); showHome(); });
  document.querySelectorAll('.call').forEach(b=>b.onclick=(e)=>{ const email=e.target.dataset.email; const room = 'room_' + Math.random().toString(36).slice(2,9); startCall(room, email); });
}
function startCall(roomId, targetEmail){
  localStorage.setItem('currentRoom', roomId);
  localStorage.setItem('callTarget', targetEmail || '');
  window.location.href = '/call.html';
}
if(location.pathname === '/' || location.pathname === '/index.html'){
  if(getToken()) showHome(); else showLogin();
}
