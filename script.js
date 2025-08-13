// Lógica con localStorage para usuarios, sesión y citas
// Keys: users, appointments, session

function getUsers(){ return JSON.parse(localStorage.getItem('users') || '[]'); }
function saveUsers(u){ localStorage.setItem('users', JSON.stringify(u)); }

function getAppointments(){ return JSON.parse(localStorage.getItem('appointments') || '[]'); }
function saveAppointments(a){ localStorage.setItem('appointments', JSON.stringify(a)); }

function showMsg(text, type='success'){
  // find or create #msg element
  let el = document.getElementById('msg');
  if(!el){
    el = document.createElement('div');
    el.id = 'msg';
    document.body.appendChild(el);
  }
  el.className = 'alert alert-' + type;
  el.style.display = 'block';
  el.textContent = text;
  setTimeout(()=> el.style.display = 'none', 3500);
}

function logout(){
  localStorage.removeItem('session');
  // optional: redirect to login
  window.location.href = 'index.html';
}

// Registro
const registerForm = document.getElementById('registerForm');
if(registerForm){
  registerForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if(!name || !email || !password){ alert('Completa todos los campos'); return; }
    const users = getUsers();
    if(users.find(u=>u.email===email)){
      alert('Ya existe un usuario con ese email');
      return;
    }
    users.push({name, email, password});
    saveUsers(users);
    alert('Registrado con éxito. Ahora inicia sesión.');
    window.location.href = 'login.html';
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPass').value;
    const users = getUsers();
    const u = users.find(x=> x.email === email && x.password === password);
    if(!u){ alert('Credenciales inválidas'); return; }
    localStorage.setItem('session', JSON.stringify({email: u.email, name: u.name}));
    alert('Ingreso correcto. Serás redirigido a especialidades.');
    window.location.href = 'especialidades.html';
  });
}

// Reserva
const reserveForm = document.getElementById('reserveForm');
if(reserveForm){
  const params = new URLSearchParams(window.location.search);
  const esp = params.get('esp') ? decodeURIComponent(params.get('esp')) : '';
  document.getElementById('especialidad').value = esp || '';
  const session = JSON.parse(localStorage.getItem('session') || 'null');
  if(session){
    document.getElementById('paciente').value = session.name;
  }
  reserveForm.addEventListener('submit', function(e){
    e.preventDefault();
    const especialidad = document.getElementById('especialidad').value || 'No especificada';
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const paciente = document.getElementById('paciente').value.trim();
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    const ownerEmail = session ? session.email : 'anonimo';
    if(!fecha || !hora || !paciente){ alert('Completa todos los campos'); return; }
    const appointments = getAppointments();
    const id = Date.now();
    appointments.push({id, especialidad, fecha, hora, paciente, ownerEmail});
    saveAppointments(appointments);
    showMsg('Cita registrada con éxito', 'success');
    setTimeout(()=> window.location.href = 'mis-citas.html', 900);
  });
}

// Mis citas
const citasTableBody = document.getElementById('citasTableBody');
if(citasTableBody){
  function renderCitas(){
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    const email = session ? session.email : null;
    const appointments = getAppointments();
    const visibles = email ? appointments.filter(a=>a.ownerEmail===email) : appointments;
    citasTableBody.innerHTML = '';
    if(visibles.length===0){
      document.getElementById('noCitas').style.display = 'block';
      return;
    } else {
      document.getElementById('noCitas').style.display = 'none';
    }
    visibles.forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.especialidad}</td>
        <td>${a.fecha}</td>
        <td>${a.hora}</td>
        <td>${a.paciente}</td>
        <td><button class="btn btn-sm btn-danger" onclick="cancelar(${a.id})">Cancelar</button></td>`;
      citasTableBody.appendChild(tr);
    });
  }
  renderCitas();
  window.cancelar = function(id){
    if(!confirm('¿Deseas cancelar esta cita?')) return;
    let list = getAppointments();
    list = list.filter(x=> x.id !== id);
    saveAppointments(list);
    renderCitas();
  }
}

