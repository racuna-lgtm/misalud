// ── MISALUD — FIREBASE HELPER ────────────────────────────────
// Carga Firebase desde CDN y expone funciones simples de lectura/escritura

const FIREBASE_CDN = 'https://www.gstatic.com/firebasejs/10.12.0';

// Cargar Firebase dinámicamente
async function cargarFirebase() {
  if (window._fb) return window._fb;
  const { initializeApp } = await import(FIREBASE_CDN + '/firebase-app.js');
  const { getFirestore, doc, getDoc, setDoc, addDoc, collection,
          getDocs, query, where, orderBy, deleteDoc, updateDoc } =
    await import(FIREBASE_CDN + '/firebase-firestore.js');

  const app = initializeApp({
    apiKey: "AIzaSyAVg-s7rsdoA8c7_3ABFzhb3gokaUcJrYw",
    authDomain: "misalud-f3947.firebaseapp.com",
    projectId: "misalud-f3947",
    storageBucket: "misalud-f3947.firebasestorage.app",
    messagingSenderId: "368434191105",
    appId: "1:368434191105:web:0eadacc668e678af9e5900"
  });

  const db = getFirestore(app);

  window._fb = { db, doc, getDoc, setDoc, addDoc, collection,
                 getDocs, query, where, orderBy, deleteDoc, updateDoc };
  return window._fb;
}

// ── PERFILES ──────────────────────────────────────────────────

async function fbGuardarPerfil(perfil) {
  const { db, doc, setDoc } = await cargarFirebase();
  await setDoc(doc(db, 'perfiles', perfil.id), perfil);
}

async function fbObtenerPerfiles() {
  const { db, collection, getDocs } = await cargarFirebase();
  const snap = await getDocs(collection(db, 'perfiles'));
  return snap.docs.map(d => d.data());
}

async function fbBuscarPorCodigo(codigo) {
  const { db, collection, query, where, getDocs } = await cargarFirebase();
  const q = query(collection(db, 'perfiles'), where('codigo', '==', codigo), where('activo', '==', true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data();
}

async function fbEliminarPerfil(id) {
  const { db, doc, deleteDoc } = await cargarFirebase();
  await deleteDoc(doc(db, 'perfiles', id));
}

// ── REGISTROS ─────────────────────────────────────────────────

async function fbGuardarRegistro(perfilId, registro) {
  const { db, collection, addDoc } = await cargarFirebase();
  await addDoc(collection(db, 'registros'), { ...registro, perfilId });
}

async function fbObtenerRegistros(perfilId) {
  const { db, collection, query, where, orderBy, getDocs } = await cargarFirebase();
  try {
    const q = query(
      collection(db, 'registros'),
      where('perfilId', '==', perfilId),
      orderBy('id', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch(e) {
    // fallback sin orderBy si no hay índice aún
    const q2 = query(collection(db, 'registros'), where('perfilId', '==', perfilId));
    const snap2 = await getDocs(q2);
    return snap2.docs.map(d => d.data()).sort((a,b) => b.id - a.id);
  }
}

async function fbGuardarCheckinDia(perfilId, fecha, color) {
  const { db, doc, setDoc } = await cargarFirebase();
  await setDoc(doc(db, 'dias', perfilId + '_' + fecha), { perfilId, fecha, color });
}

async function fbObtenerDia(perfilId, fecha) {
  const { db, doc, getDoc } = await cargarFirebase();
  const snap = await getDoc(doc(db, 'dias', perfilId + '_' + fecha));
  return snap.exists() ? snap.data().color : null;
}

async function fbGuardarCheckinFlag(perfilId, fecha) {
  const { db, doc, setDoc } = await cargarFirebase();
  await setDoc(doc(db, 'checkins', perfilId + '_' + fecha), { perfilId, fecha, hecho: true });
}

async function fbVerificarCheckin(perfilId, fecha) {
  const { db, doc, getDoc } = await cargarFirebase();
  const snap = await getDoc(doc(db, 'checkins', perfilId + '_' + fecha));
  return snap.exists();
}

// ── EXÁMENES ──────────────────────────────────────────────────

async function fbGuardarExamen(perfilId, examen) {
  const { db, doc, setDoc } = await cargarFirebase();
  await setDoc(doc(db, 'examenes', examen.id), { ...examen, perfilId });
}

async function fbObtenerExamenes(perfilId) {
  const { db, collection, query, where, getDocs } = await cargarFirebase();
  const q = query(collection(db, 'examenes'), where('perfilId', '==', perfilId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data()).sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
}

async function fbEliminarExamen(id) {
  const { db, doc, deleteDoc } = await cargarFirebase();
  await deleteDoc(doc(db, 'examenes', id));
}
