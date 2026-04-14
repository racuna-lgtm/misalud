// ── MISALUD — FIREBASE (compat CDN para GitHub Pages) ────────

function _cargarScript(src) {
  return new Promise(function(resolve, reject) {
    if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
    var s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

var _FB_VER = '10.12.0';
var _fbListo = false;
var _db = null;

async function inicializarFirebase() {
  if (_fbListo) return _db;
  await _cargarScript('https://www.gstatic.com/firebasejs/' + _FB_VER + '/firebase-app-compat.js');
  await _cargarScript('https://www.gstatic.com/firebasejs/' + _FB_VER + '/firebase-firestore-compat.js');
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyAVg-s7rsdoA8c7_3ABFzhb3gokaUcJrYw",
      authDomain: "misalud-f3947.firebaseapp.com",
      projectId: "misalud-f3947",
      storageBucket: "misalud-f3947.firebasestorage.app",
      messagingSenderId: "368434191105",
      appId: "1:368434191105:web:0eadacc668e678af9e5900"
    });
  }
  _db = firebase.firestore();
  _fbListo = true;
  return _db;
}

async function fbGuardarPerfil(perfil) {
  var db = await inicializarFirebase();
  await db.collection('perfiles').doc(String(perfil.id)).set(perfil);
}
async function fbObtenerPerfiles() {
  var db = await inicializarFirebase();
  var snap = await db.collection('perfiles').get();
  return snap.docs.map(function(d){ return d.data(); });
}
async function fbBuscarPorCodigo(codigo) {
  var db = await inicializarFirebase();
  var snap = await db.collection('perfiles').where('codigo','==',codigo).where('activo','==',true).get();
  if (snap.empty) return null;
  return snap.docs[0].data();
}
async function fbEliminarPerfil(id) {
  var db = await inicializarFirebase();
  await db.collection('perfiles').doc(String(id)).delete();
}
async function fbGuardarRegistro(perfilId, registro) {
  var db = await inicializarFirebase();
  await db.collection('registros').add(Object.assign({}, registro, {perfilId: String(perfilId)}));
}
async function fbObtenerRegistros(perfilId) {
  var db = await inicializarFirebase();
  var snap = await db.collection('registros').where('perfilId','==',String(perfilId)).get();
  return snap.docs.map(function(d){ return d.data(); }).sort(function(a,b){ return b.id - a.id; });
}
async function fbGuardarCheckinDia(perfilId, fecha, color) {
  var db = await inicializarFirebase();
  await db.collection('dias').doc(perfilId+'_'+fecha).set({perfilId:perfilId,fecha:fecha,color:color});
}
async function fbObtenerDia(perfilId, fecha) {
  var db = await inicializarFirebase();
  var snap = await db.collection('dias').doc(perfilId+'_'+fecha).get();
  return snap.exists ? snap.data().color : null;
}
async function fbGuardarCheckinFlag(perfilId, fecha) {
  var db = await inicializarFirebase();
  await db.collection('checkins').doc(perfilId+'_'+fecha).set({perfilId:perfilId,fecha:fecha,hecho:true});
}
async function fbVerificarCheckin(perfilId, fecha) {
  var db = await inicializarFirebase();
  var snap = await db.collection('checkins').doc(perfilId+'_'+fecha).get();
  return snap.exists;
}
async function fbGuardarExamen(perfilId, examen) {
  var db = await inicializarFirebase();
  await db.collection('examenes').doc(String(examen.id)).set(Object.assign({},examen,{perfilId:String(perfilId)}));
}
async function fbObtenerExamenes(perfilId) {
  var db = await inicializarFirebase();
  var snap = await db.collection('examenes').where('perfilId','==',String(perfilId)).get();
  return snap.docs.map(function(d){ return d.data(); }).sort(function(a,b){ return new Date(b.fecha)-new Date(a.fecha); });
}
async function fbEliminarExamen(id) {
  var db = await inicializarFirebase();
  await db.collection('examenes').doc(String(id)).delete();
}
