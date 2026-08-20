/* --------------------------------------------------
   MONZINI MECHANICS PLATFORM - CORE ENGINE
   State Management, Camera Scanner, Excel Exporter, SPA Router
-------------------------------------------------- */

// --- CONFIGURACIÓN DE BASE DE DATOS EN LA NUBE (Firebase Realtime Database) ---
// Para conectar múltiples dispositivos, crea una base de datos Realtime en Firebase
// y pega la URL aquí abajo (ejemplo: "https://mi-proyecto-rtdb.firebaseio.com").
// Si se deja vacío, la aplicación funcionará de forma local (Modo Local).
const CONFIG_DATABASE_URL = "https://monzini-mecanica-default-rtdb.firebaseio.com"; 

// --- CONFIGURACIÓN DE FIREBASE AUTH (login anónimo automático) ---
// Necesario porque las reglas de la base de datos ahora exigen "auth != null".
// No pide usuario/contraseña a los técnicos: el navegador inicia sesión anónima
// automáticamente y usa ese token para leer/escribir en Realtime Database.
const FIREBASE_PROJECT_ID = "monzini-mecanica";
const FIREBASE_API_KEY = "AIzaSyD1a7s4tZq9baS_aXVgsoNeq26r7XULO-I";
let firebaseIdToken = null;
let firebaseAuthReady = null;

function initFirebaseAuth() {
    if (!CONFIG_DATABASE_URL || !FIREBASE_API_KEY) {
        firebaseAuthReady = Promise.resolve(null);
        return firebaseAuthReady;
    }
    if (window.firebase && !window.firebase.apps.length) {
        window.firebase.initializeApp({
            apiKey: FIREBASE_API_KEY,
            authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
            databaseURL: CONFIG_DATABASE_URL
        });
    }
    firebaseAuthReady = new Promise((resolve) => {
        if (!window.firebase) { resolve(null); return; }
        window.firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    firebaseIdToken = await user.getIdToken();
                    resolve(firebaseIdToken);
                } catch (e) {
                    console.error("Error obteniendo token de Firebase Auth:", e);
                    resolve(null);
                }
            } else {
                window.firebase.auth().signInAnonymously().catch((err) => {
                    console.error("Error iniciando sesión anónima en Firebase:", err);
                    resolve(null);
                });
            }
        });
    });
    return firebaseAuthReady;
}

// Construye la URL de Realtime Database agregando el token de auth cuando exista
function buildAuthedDbUrl(baseUrl) {
    if (!firebaseIdToken) return baseUrl;
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}auth=${firebaseIdToken}`;
}

// --- PIN DE JEFE DE ÁREA ---
// Se usa tanto para desbloquear "Reportes (Jefe)" como para confirmar cambios de
// maquinaria (agregar / editar / eliminar). Cambia el valor aquí y se actualiza en
// ambos lugares automáticamente.
const BOSS_PIN = "1234";

// --- INITIAL DATA & LOCALSTORAGE SEEDING ---
const DEFAULT_MACHINERY = [
    {
        "id": "92Y006450",
        "name": "Siruba DL7200-BMI-16",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-BMI-16",
        "station": "Frente izquierdo",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFJ21739",
        "name": "Juki DDL-9000B-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-55",
        "station": "Frente izquierdo",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOFJOO308",
        "name": "Juki LBH-19905",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-19905",
        "station": "Frente izquierdo",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOEG00622",
        "name": "Juki LBH-17905",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-17905",
        "station": "Frente izquierdo",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GF00059",
        "name": "juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "Frente izquierdo",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "22054519172",
        "name": "Jack AGF-E",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Jack",
        "model": "AGF-E",
        "station": "Frente izquierdo",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "U914510036",
        "name": "Singer 591",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Singer",
        "model": "591",
        "station": "Frente Derecho",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HK9981",
        "name": "Juki LK-1903B-5",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-1903B-5",
        "station": "Frente Derecho",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3HE00346",
        "name": "juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "Frente Derecho",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "22054519169",
        "name": "Jack AGF-E",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Jack",
        "model": "AGF-E",
        "station": "Frente Derecho",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MA00105",
        "name": "Juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Frente Derecho",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUH12539",
        "name": "Juki DLN-5410-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Frente Derecho",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "LHOVD03110",
        "name": "Juki LH-1152-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "LH-1152-6",
        "station": "Frente Derecho",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "261568392",
        "name": "Durkooppader 261",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Durkooppader",
        "model": "261",
        "station": "Cuello",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y024962",
        "name": "Siruba DL7200-NMI-16",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-NMI-16",
        "station": "Cuello",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MA00102",
        "name": "Juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Cuello",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOHLO2174",
        "name": "Juki DDL-9000B-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-55",
        "station": "Cuello",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE",
        "name": "Juki DLN-5410-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Cuello",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505849",
        "name": "Juki DLN-5410-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Cuello",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MA00103",
        "name": "Juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Cuello",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "7678866",
        "name": "Willcoy Gibbs 515-E32-430",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Willcoy Gibbs",
        "model": "515-E32-430",
        "station": "Cuello",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFM21206",
        "name": "Juki DDL-9000B-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-55",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFM21190",
        "name": "Juki DLL-9000B-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLL-9000B-55",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "R01431",
        "name": "Juki DLN-5410-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUJ0693",
        "name": "Juki DLN-5410-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNA36438",
        "name": "Juki DLN-5410-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOGE12276",
        "name": "Juki DDL-9000B-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-55",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "Q17319",
        "name": "Juki DDL-5550-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-5550-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "696",
        "name": "Epa 203",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Epa",
        "model": "203",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "373-Q52131",
        "name": "Juki MB-373",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "MB-373",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOMB00717",
        "name": "JUKI LBH-1790AN",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LBH-1790AN",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3JH00038",
        "name": "Juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505744",
        "name": "Juki DLN-5410-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505743",
        "name": "Juki DLN-5410-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021203",
        "name": "siruba DL7200NMI-16",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "siruba",
        "model": "DL7200NMI-16",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3HA00108",
        "name": "Juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MB00089",
        "name": "Juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "V89015037",
        "name": "siruba DL7200BMI-16",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "siruba",
        "model": "DL7200BMI-16",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "219LOOO422",
        "name": "siruba 7470-514M-3-24",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "siruba",
        "model": "7470-514M-3-24",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOKJ01676",
        "name": "Juki DDL-9000C",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000C",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920Y016110",
        "name": "siruba DL7200BMI-16",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "siruba",
        "model": "DL7200BMI-16",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MA00100",
        "name": "Juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GF00094",
        "name": "Juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00067",
        "name": "Juki DLN-9010A-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "504223",
        "name": "Juki DLN-5410-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DKNUH06482",
        "name": "Juki DLN-5410-6",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1A00354",
        "name": "Juki LK-1900B-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-1900B-55",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HJ02000",
        "name": "Juki LK-1900B-55",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-1900B-55",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOEB00835",
        "name": "Juki LBH-17905",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-17905",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "M9569076",
        "name": "Juki 371U-2",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Juki",
        "model": "371U-2",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1H502005",
        "name": "juki LK-1903B",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "juki",
        "model": "LK-1903B",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "811393",
        "name": "Jack DDL-8700B-7",
        "area": "Linea del Sid",
        "status": "Operando",
        "brand": "Jack",
        "model": "DDL-8700B-7",
        "station": "Ensamble",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "BG1833615",
        "name": "U. SPECIAL 56500",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56500",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1289582",
        "name": "U. SPECIAL 56300",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1184351",
        "name": "U. SPECIAL 56300",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "120288",
        "name": "U. SPECIAL 56300",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1169578",
        "name": "U. SPECIAL 56300",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1267625",
        "name": "U. SPECIAL 56300",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1742855",
        "name": "U. SPECIAL 56300",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1771040",
        "name": "U. SPECIAL 56300",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "586961",
        "name": "juki DDL-5550-6",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL-5550-6",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "T11311",
        "name": "juki DDL-5550-6",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL-5550-6",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "80BMF02066",
        "name": "Juki DDL9000C",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000C",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DDMF01948",
        "name": "Juki DDL9000C",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000C",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DDMF02063",
        "name": "Juki DDL9000C",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000C",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DDLTM11230",
        "name": "juki DDL-5550-6",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL-5550-6",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DDLTM11216",
        "name": "juki DDL-5550-6",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL-5550-6",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DDLUH15992",
        "name": "Juki DDL-5550-6",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-5550-6",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DDGG12294",
        "name": "Juki DDL9000C",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000C",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3EH00353",
        "name": "Juki DDL9000A",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000A",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUHOG483",
        "name": "Juki DDLN-5410-6",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDLN-5410-6",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00135",
        "name": "Juki DLN-9010A-55",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89015176",
        "name": "SIRUBA DL7200",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNTHO1158",
        "name": "juki DLN5410-6",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN5410-6",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "D26158495",
        "name": "DURKOPP 261",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "DURKOPP",
        "model": "261",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2615681399",
        "name": "DURKOPP 261",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "DURKOPP",
        "model": "261",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920406454",
        "name": "SIRUBA DL7200BMI-16",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200BMI-16",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "9204016154",
        "name": "SIRUBA DL7200BMI-16",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200BMI-16",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5410-6",
        "name": "Juki 585104",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "Juki",
        "model": "585104",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "261568414",
        "name": "DURKOPP 261",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "DURKOPP",
        "model": "261",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D0409183",
        "name": "juki DDL900BB",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL900BB",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "92YDO6434",
        "name": "Juki DL7200",
        "area": "Derson Flores",
        "status": "Operando",
        "brand": "Juki",
        "model": "DL7200",
        "station": "ESPALDA L.R",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00066",
        "name": "juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "PUÑO HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "261568411",
        "name": "DURKOPP ADLER 261",
        "area": "Hugo",
        "status": "Operando",
        "brand": "DURKOPP ADLER",
        "model": "261",
        "station": "PUÑO HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GF00068",
        "name": "juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "PUÑO HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GC000302",
        "name": "juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "PUÑO HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00129",
        "name": "juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5410-6-2",
        "name": "juki DLNVH12563",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLNVH12563",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3DD00226",
        "name": "juki DLN901055",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN901055",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "3MITD00090",
        "name": "juki MH380",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "MH380",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2181006852",
        "name": "SIRUBA 747LD-514M",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747LD-514M",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "219L000381",
        "name": "SIRUBA 747LD-514M",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747LD-514M",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D36C00294",
        "name": "juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L18007821",
        "name": "SIRUBA 747LD-514M",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747LD-514M",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018131",
        "name": "SIRUBA DL7200-NMI-16",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NMI-16",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018136",
        "name": "SIRUBA DL7200-NMI-16",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NMI-16",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3JL00110",
        "name": "juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "3MITD00091",
        "name": "Juki MLT380",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "MLT380",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3JL21761",
        "name": "Juki DDL9000B-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000B-55",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "950159",
        "name": "SINGER 261",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SINGER",
        "model": "261",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "BBWBPD4SE00090",
        "name": "Juki DLN5490N-7",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN5490N-7",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00132",
        "name": "Juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "210MG00581",
        "name": "juki LHB1790AN",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "LHB1790AN",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LMF00080",
        "name": "juki LKI903BN",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "LKI903BN",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "6",
        "name": "ASCOLITE B55-15TWINHEAD",
        "area": "Hugo",
        "status": "Operando",
        "brand": "ASCOLITE",
        "model": "B55-15TWINHEAD",
        "station": "EMSAMBLE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "PTX-CT1-00028",
        "name": "TAJINA TEHX-C1218",
        "area": "Hugo",
        "status": "Operando",
        "brand": "TAJINA",
        "model": "TEHX-C1218",
        "station": "BORDADO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MZN-PL9-001033",
        "name": "BARUDAM BEXT-5150ICB11",
        "area": "Hugo",
        "status": "Operando",
        "brand": "BARUDAM",
        "model": "BEXT-5150ICB11",
        "station": "BORDADO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MZN-PL9-00833",
        "name": "BARUDAM BEXT-5150ICB11",
        "area": "Hugo",
        "status": "Operando",
        "brand": "BARUDAM",
        "model": "BEXT-5150ICB11",
        "station": "BORDADO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2205458982",
        "name": "JACK AGF-E",
        "area": "Hugo",
        "status": "Operando",
        "brand": "JACK",
        "model": "AGF-E",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "22054519315",
        "name": "JACK AGF-E",
        "area": "Hugo",
        "status": "Operando",
        "brand": "JACK",
        "model": "AGF-E",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DL-7200-NMI-16",
        "name": "SIRUBA 919Y024961",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "919Y024961",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFJ21750",
        "name": "juki DDL9000B-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000B-55",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3JH00055",
        "name": "juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89017203",
        "name": "SIRUBA DLN-7200-NMI-16",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DLN-7200-NMI-16",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "504244",
        "name": "juki DLN-540-6",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-540-6",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1MDO2297",
        "name": "juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "240933504952",
        "name": "SIRUBA DL7200-NMI-16",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NMI-16",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00060",
        "name": "juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "J715928",
        "name": "BROTHER MA4-U92-65",
        "area": "Hugo",
        "status": "Operando",
        "brand": "BROTHER",
        "model": "MA4-U92-65",
        "station": "CUELLOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1MD02297",
        "name": "JUKI LK1903BN",
        "area": "Hugo",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK1903BN",
        "station": "FRENTES",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "24094504952",
        "name": "JACK JK-T179065-1-D",
        "area": "Hugo",
        "status": "Operando",
        "brand": "JACK",
        "model": "JK-T179065-1-D",
        "station": "FRENTES",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOMF02060",
        "name": "JUKI DDL9000C",
        "area": "Hugo",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL9000C",
        "station": "FRENTES",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y024967",
        "name": "SIRUBA DL7200-NMI-16",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NMI-16",
        "station": "CAMBIO DE MAQ.",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2DDYA07984",
        "name": "juki DDL9000B-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000B-55",
        "station": "CAMBIO DE MAQ.",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DO6F12280",
        "name": "juki DDL9000B-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000B-55",
        "station": "ESPALDAS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DDLTH11216",
        "name": "juki DDL5550-6",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL5550-6",
        "station": "ESPALDAS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018133",
        "name": "SIRUBA DL7200-NMI-16",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NMI-16",
        "station": "ESPALDAS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "218K004511",
        "name": "SIRUBA 757KT-516M",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "757KT-516M",
        "station": "ESPALDAS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DO6E12266",
        "name": "juki DDL-9000B-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL-9000B-55",
        "station": "ESPALDAS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DDLAE25313",
        "name": "juki DDL-5550N-7",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL-5550N-7",
        "station": "ESPALDAS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MZNPL9-000269",
        "name": "juki DDL9000B-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000B-55",
        "station": "MANGAS DE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3EH00345",
        "name": "juki DLN9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN9010A-55",
        "station": "MANGAS DE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "PTX-PL1-001067",
        "name": "SIRUBA DL7200B-BM-I",
        "area": "Hugo",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200B-BM-I",
        "station": "MANGAS DE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFM21209",
        "name": "juki DDL9000B-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000B-55",
        "station": "MANGAS DE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFM21209-2",
        "name": "juki DDL9000B-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000B-55",
        "station": "MANGAS DE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "211HJ02001",
        "name": "juki LK1903B-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "LK1903B-55",
        "station": "MANGAS DE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "21DFG00615",
        "name": "juki LBH1790-5",
        "area": "Hugo",
        "status": "Operando",
        "brand": "juki",
        "model": "LBH1790-5",
        "station": "MANGAS DE HUGO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L0EBOO833",
        "name": "Juki LBH-17905",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-17905",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOEM00515",
        "name": "Juki LBH-17905",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-17905",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505418",
        "name": "N/D N/D",
        "area": "Hugo",
        "status": "Operando",
        "brand": "N/D",
        "model": "N/D",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "M2NPL1-000202",
        "name": "Juki 5410-6",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3EH00352",
        "name": "N/D N/D",
        "area": "Hugo",
        "status": "Operando",
        "brand": "N/D",
        "model": "N/D",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "515-E32-4030",
        "name": "JUKI DLN-9010",
        "area": "Hugo",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-9010",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505418-2",
        "name": "Willcox & Gibbs 355-5XS",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Willcox & Gibbs",
        "model": "355-5XS",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNXA20771",
        "name": "JUKI DLN-52110-6",
        "area": "Hugo",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-52110-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "506180",
        "name": "JUKI DLN-5410-7",
        "area": "Hugo",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-5410-7",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505740",
        "name": "Juki DLN-5410-6",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GCOO297",
        "name": "Juki DNL-5410-6",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DNL-5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUH06481",
        "name": "Juki DLN-9010A",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "502225",
        "name": "Juki MA4-9265-5",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "MA4-9265-5",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3EH00348",
        "name": "Juki DLN-5410-6",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "PTX-PL2-000115",
        "name": "Juki DLN-5410-6",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUH06479",
        "name": "Brother DLN-9010-ASS",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Brother",
        "model": "DLN-9010-ASS",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505054",
        "name": "Juki CP-311",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "CP-311",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00063",
        "name": "Juki DL7200-BM1",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DL7200-BM1",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "HG-074",
        "name": "Juki DLN-9010-ASS",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010-ASS",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X40024468",
        "name": "LUNA PRESS CP-311",
        "area": "Hugo",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-311",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNVKL3075",
        "name": "Siruba DL-7200-BMI",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL-7200-BMI",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3EH00347",
        "name": "JUKI DLN5410-6",
        "area": "Hugo",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "HG-078",
        "name": "Juki DLN-9010A-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOF521632",
        "name": "LUNA PRESS T323",
        "area": "Hugo",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "T323",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "261568514",
        "name": "JUKI DDL-9000B-SS",
        "area": "Hugo",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "335-5X5",
        "name": "ADLER 261",
        "area": "Hugo",
        "status": "Operando",
        "brand": "ADLER",
        "model": "261",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "211HJ02638",
        "name": "Willcox & Gibbs 515-E32-450",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Willcox & Gibbs",
        "model": "515-E32-450",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "230772053",
        "name": "Juki LK-1903B-55",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-1903B-55",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y024968",
        "name": "Siruba LBH5-17905",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Siruba",
        "model": "LBH5-17905",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOEG11921",
        "name": "Siruba DL7200",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3JH00042",
        "name": "Juki DDL-9000",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOFK00200",
        "name": "Juki DLN-9010",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HJO1996",
        "name": "Juki LBH-17905",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-17905",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "HG-089",
        "name": "Juki LK-19031B",
        "area": "Hugo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-19031B",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8L3NE00713",
        "name": "juki LH358A-7",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "LH358A-7",
        "station": "CUELLOS Y PUÑOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505418-3",
        "name": "juki DLN5410-6",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN5410-6",
        "station": "CUELLOS Y PUÑOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505150",
        "name": "juki DLN5410-6",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN5410-6",
        "station": "CUELLOS Y PUÑOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00061",
        "name": "juki DLN-9010A-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "CUELLOS Y PUÑOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505385",
        "name": "juki DLN5410-6",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN5410-6",
        "station": "CUELLOS Y PUÑOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNTJ01534",
        "name": "juki DLN5410-6",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN5410-6",
        "station": "CUELLOS Y PUÑOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1EG01994",
        "name": "juki LK-1903A-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "LK-1903A-55",
        "station": "CUELLOS Y PUÑOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LDFK00201",
        "name": "juki LBH-17905",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "LBH-17905",
        "station": "CUELLOS Y PUÑOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "179095240",
        "name": "JACK T1790BK-IM",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "JACK",
        "model": "T1790BK-IM",
        "station": "CUELLOS Y PUÑOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "7607117",
        "name": "WILCOX 515-E32-420",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "WILCOX",
        "model": "515-E32-420",
        "station": "CUELLOS Y PUÑOS",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919YO21297",
        "name": "SIRUBA DL7200-NMI-16",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NMI-16",
        "station": "ESPALDA",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1782907",
        "name": "U. SPECIAL 56300",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "ESPALDA",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFJ21717",
        "name": "Juki DDL9000B-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000B-55",
        "station": "ESPALDA",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1842000016",
        "name": "SIRUBA A5001",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "A5001",
        "station": "FRENTE DERECHO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "128361667",
        "name": "SIRUBA DL7000-NMI-13",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7000-NMI-13",
        "station": "FRENTE DERECHO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1064843",
        "name": "U. SPECIAL 56300",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "FRENTE DERECHO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1075770",
        "name": "U. SPECIAL 56300",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "FRENTE DERECHO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2192000327",
        "name": "SIRUBA 747LD-514",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747LD-514",
        "station": "FRENTE IZQUIERO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "9194024966",
        "name": "SIRUBA DL7200",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200",
        "station": "FRENTE IZQUIERO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1299960",
        "name": "U. SPECIAL 54400",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "54400",
        "station": "FRENTE IZQUIERO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MZN-PL1-000510",
        "name": "U. SPECIAL 54400",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "54400",
        "station": "FRENTE IZQUIERO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOEG00610",
        "name": "juki LBH17905",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "LBH17905",
        "station": "FRENTE IZQUIERO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D3JH00036",
        "name": "juki DLN-9010A-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "FRENTE IZQUIERO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNWJL13010",
        "name": "juki DLN5410-6",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN5410-6",
        "station": "FRENTE IZQUIERO",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOFM00513",
        "name": "juki 2BH1790-5",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "2BH1790-5",
        "station": "MANGA",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1MF00185",
        "name": "juki LK-1903BN",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "LK-1903BN",
        "station": "MANGA",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GF00051",
        "name": "juki DLN-9010A-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-9010A-55",
        "station": "MANGA",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505377",
        "name": "Juki LN5410-6",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "Juki",
        "model": "LN5410-6",
        "station": "MANGA",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DDLVL67713",
        "name": "juki DDL-5550-6",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL-5550-6",
        "station": "MANGA",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "K4518380",
        "name": "BROTHER MA4-V92",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "BROTHER",
        "model": "MA4-V92",
        "station": "ENSAMBLE",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "22054558118",
        "name": "JAK A6F-E",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "JAK",
        "model": "A6F-E",
        "station": "ENSAMBLE",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00126",
        "name": "juki DLN9010A-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN9010A-55",
        "station": "ENSAMBLE 1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF-00059",
        "name": "juki DLN9010A-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN9010A-55",
        "station": "ENSAMBLE 1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF-00121",
        "name": "juki DLN9010A-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN9010A-55",
        "station": "ENSAMBLE 1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1389775",
        "name": "U. SPECIAL 56400",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56400",
        "station": "ENSAMBLE 1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1491104",
        "name": "U. SPECIAL 56400",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56400",
        "station": "ENSAMBLE 1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "219L000392",
        "name": "SIRUBA 747514M-3",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747514M-3",
        "station": "ENSAMBLE 1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1502967290",
        "name": "JACK JK-T1900BJK",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "JACK",
        "model": "JK-T1900BJK",
        "station": "ENSAMBLE 1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1298434",
        "name": "U. SPECIAL 56300",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "ENSAMBLE 1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8643023",
        "name": "WILLCOX 515-E32",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "WILLCOX",
        "model": "515-E32",
        "station": "ENSAMBLE 1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8MOKA02803",
        "name": "juki M06716",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "M06716",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00124",
        "name": "juki DLN9010A-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN9010A-55",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MA00107",
        "name": "juki DLN9010A-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN9010A-55",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-2",
        "name": "juki MS-1190",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "MS-1190",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "3M8MF00043",
        "name": "juki MS-1190",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "MS-1190",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-3",
        "name": "juki DDL9000C",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000C",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOMDO5245",
        "name": "juki DDL9000C",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000C",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1MD0086",
        "name": "juki LK1903BN",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "LK1903BN",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOFJ00030",
        "name": "juki LBH17905",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "LBH17905",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1EH00026",
        "name": "juki LK1903-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "LK1903-55",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L3MF001023",
        "name": "juki DLN9010A-55",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN9010A-55",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOMDO5262",
        "name": "juki DDL9000C",
        "area": "M.T.M",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000C",
        "station": "ENSAMBLE 2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-4",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5406L5879",
        "name": "DURKOPP 540-100",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "DURKOPP",
        "model": "540-100",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-5",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-6",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "219KOO2955",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-7",
        "name": "DURKOPP 540-100",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "DURKOPP",
        "model": "540-100",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-8",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-9",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-10",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-11",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-12",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5540606702",
        "name": "DURKOPP 546-100",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "DURKOPP",
        "model": "546-100",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-13",
        "name": "SIRUBA LBH-1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH-1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "540613508",
        "name": "DURKOPP 546-100",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "DURKOPP",
        "model": "546-100",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-14",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-15",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L0E600620",
        "name": "Juki LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "219KOO2716",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOF100159",
        "name": "Juki LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "170490450",
        "name": "JACK JKT1790BK",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "JACK",
        "model": "JKT1790BK",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "LBH-1790",
        "name": "JACK JK.140996620",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "JACK",
        "model": "JK.140996620",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOL000148",
        "name": "JACK JKT1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "JACK",
        "model": "JKT1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOM600502",
        "name": "Juki LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "219KOO2681",
        "name": "SIRUBA LBH1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LBH1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1460195362",
        "name": "JACK JKT1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "JACK",
        "model": "JKT1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "176390516",
        "name": "JACK JKT1790",
        "area": "Jose Navarro",
        "status": "Operando",
        "brand": "JACK",
        "model": "JKT1790",
        "station": "Delantero",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUL06513",
        "name": "juki DLN-5410-6",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-5410-6",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNAB36570",
        "name": "juki DLN-5410-7",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN-5410-7",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018139",
        "name": "siruba DL7200",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "siruba",
        "model": "DL7200",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021308",
        "name": "siruba DL7200",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "siruba",
        "model": "DL7200",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUJ07127",
        "name": "juki DLN5410-6",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN5410-6",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505749",
        "name": "juki DLN5410-6",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN5410-6",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNWC16144",
        "name": "juki DLN5410-6",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN5410-6",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920Y003814",
        "name": "siruba DL7200",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "siruba",
        "model": "DL7200",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MHOWB03708",
        "name": "juki MH380",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "MH380",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1589794",
        "name": "u. special 56400",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "u. special",
        "model": "56400",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1769336",
        "name": "u. special 56400",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "u. special",
        "model": "56400",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFJ21531",
        "name": "Juki DDL9000",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DONF02456",
        "name": "Juki DDL8000A",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL8000A",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3JL00106",
        "name": "juki 9010",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "9010",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOHH061221",
        "name": "juki DDL9000",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X890150921",
        "name": "siruba DL7200",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "siruba",
        "model": "DL7200",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOF52696",
        "name": "juki DDL9000",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DL7200",
        "name": "siruba 92070161156",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "siruba",
        "model": "92070161156",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018117",
        "name": "siruba DL7200",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "siruba",
        "model": "DL7200",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1761",
        "name": "juki 2207451653",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "2207451653",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L4EH00350",
        "name": "juki 9010",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "9010",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00065",
        "name": "juki 9010",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "juki",
        "model": "9010",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "C8561106",
        "name": "Brother DB2-B791",
        "area": "Jose Montes T. P.",
        "status": "Operando",
        "brand": "Brother",
        "model": "DB2-B791",
        "station": "Tomas pink",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "T06572",
        "name": "juki 5410-6",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "5410-6",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505394",
        "name": "juki 5410-6",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "5410-6",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505766",
        "name": "juki 5410-6",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "5410-6",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5410-6-3",
        "name": "juki DNWT20212",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "DNWT20212",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "502249",
        "name": "juki 5410-6",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "5410-6",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505411",
        "name": "juki 5410-6",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "5410-6",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505376",
        "name": "juki 5410-6",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "5410-6",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUJ06944",
        "name": "juki 5410-6",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "5410-6",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "904246",
        "name": "juki 5410-6",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "5410-6",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MTP-010",
        "name": "juki 5410-6",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "5410-6",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "SINSERIE-16",
        "name": "Juki DDL9000C",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000C",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOH202171",
        "name": "Juki DDL9000C",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000C",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFJ21557",
        "name": "Juki DDL9000C",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000C",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "XDJ21552",
        "name": "juki DDL9000",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOOJ21607",
        "name": "juki DDL9000",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "DDL9000",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOOOG31633",
        "name": "siruba DL7200",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "siruba",
        "model": "DL7200",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920Y003805",
        "name": "Juki DDL9000C",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000C",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DO0611929",
        "name": "Juki DDL9000A",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000A",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DO0531013",
        "name": "Juki DDL9000",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89015099",
        "name": "Juki DDL9000",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL9000",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5972956",
        "name": "singer 261",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "singer",
        "model": "261",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5921729",
        "name": "singer 261",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "singer",
        "model": "261",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5992808",
        "name": "singer 261",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "singer",
        "model": "261",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5950251",
        "name": "singer 261",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "singer",
        "model": "261",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5972208",
        "name": "singer 261",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "singer",
        "model": "261",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5972204",
        "name": "singer 261",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "singer",
        "model": "261",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5992825",
        "name": "singer 261",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "singer",
        "model": "261",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "3M8M100044",
        "name": "jki M51190",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "jki",
        "model": "M51190",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5924440",
        "name": "singer 592 761",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "singer",
        "model": "592 761",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5001619",
        "name": "singer 261",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "singer",
        "model": "261",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "5924914",
        "name": "singer 261",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "singer",
        "model": "261",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "3M8R00032",
        "name": "juki M51190",
        "area": "Mangas Tomas Pink",
        "status": "Operando",
        "brand": "juki",
        "model": "M51190",
        "station": "Ensamble #2",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L0FK00202",
        "name": "Juki LBH-1790S",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-1790S",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HJ02636",
        "name": "Juki LK-1903B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-1903B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "230772178",
        "name": "Siruba LBH5-1790S",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "LBH5-1790S",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1DG00794",
        "name": "Juki LK-1903A-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-1903A-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L0FM00510",
        "name": "Juki LBH-1790S",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-1790S",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HK01241",
        "name": "Juki LK-1903B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-1903B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "502176",
        "name": "Juki DLN-5410-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D0XE02668",
        "name": "Juki DDL-9000SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D0XF01360",
        "name": "Juki DDL-9000SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNTH01107",
        "name": "Juki DLN-5410-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "502246",
        "name": "Juki DLN-5410-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018122",
        "name": "Siruba DL7200-NM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-NM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNVG12194",
        "name": "Juki DLN-5410-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89017202",
        "name": "Siruba DL7200-NM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-NM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505298",
        "name": "Juki DLN-5410-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "TLNXA20794",
        "name": "Juki DLN-5410N-7",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410N-7",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNAB36468",
        "name": "Juki DLN-5410N-7",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410N-7",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021310",
        "name": "Siruba DL7200-NM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-NM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "504707",
        "name": "Juki DLN-5410-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "504773",
        "name": "Juki DLN-5410-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y024964",
        "name": "Siruba DL7200-NM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-NM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021296",
        "name": "Siruba DL7200-NM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-NM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUM08745",
        "name": "Juki DLN-5410-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00131",
        "name": "Juki DLN-9010A-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920Y003869",
        "name": "Siruba DL7200-BM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-BM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D0FJ21770",
        "name": "Juki DDL-9000B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D0HL02173",
        "name": "Juki DDL-9000B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D0FM21205",
        "name": "Juki DDL-9000B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DDLUH15973",
        "name": "Juki DDL-5550-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-5550-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D0HH06117",
        "name": "Juki DDL-9000B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00068",
        "name": "Juki DLN-9010A-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "800FJ21704",
        "name": "Juki DDL-9000B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568405",
        "name": "Durkopp Adler 261",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Durkopp Adler",
        "model": "261",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920Y006443",
        "name": "Siruba DL7200-BM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-BM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568489",
        "name": "Durkopp Adler 261",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Durkopp Adler",
        "model": "261",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920Y006444",
        "name": "Siruba DL7200-BM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-BM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568515",
        "name": "Durkopp Adler 261",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Durkopp Adler",
        "model": "261",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D0HL02172",
        "name": "Juki DDL-9000B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920Y006425",
        "name": "Siruba DL7200-BM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-BM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2A3AB00092",
        "name": "Juki AMS-210E",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "AMS-210E",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2A3AB00091",
        "name": "Juki AMS-210E",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "AMS-210E",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2A3AB00097",
        "name": "Juki AMS-210E",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "AMS-210E",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2A3DD00403",
        "name": "Juki AMS-210E",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "AMS-210E",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DDLTM11150",
        "name": "Juki DDL-5550-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-5550-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920Y003796",
        "name": "Siruba DL7200-BM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-BM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568412",
        "name": "Durkopp Adler 261",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Durkopp Adler",
        "model": "261",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D0JA00218",
        "name": "Juki DDL-9000A-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000A-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "F2555672",
        "name": "Brother DB2-B791-413A",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Brother",
        "model": "DB2-B791-413A",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "150696145.P",
        "name": "Jack T1900BSK",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Jack",
        "model": "T1900BSK",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "150696149.P",
        "name": "Jack T1900BSK",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Jack",
        "model": "T1900BSK",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "150696163.P",
        "name": "Jack T1900BSK",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Jack",
        "model": "T1900BSK",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "M12073",
        "name": "Taking 808",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Taking",
        "model": "808",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "M12072",
        "name": "Taking 808",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Taking",
        "model": "808",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2191000399",
        "name": "Siruba 747 LD",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "747 LD",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "L8526965",
        "name": "Brother LT2-B842-905",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Brother",
        "model": "LT2-B842-905",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D0FM21192",
        "name": "Juki DDL-9000B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D0EC11163",
        "name": "Juki DDL-9000B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GF00052",
        "name": "Juki DLN-9010A-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8D0FM21188",
        "name": "Juki DDL-9000B-SS",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920Y006431",
        "name": "Siruba DL7200-BM1-16",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200-BM1-16",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568408",
        "name": "Durkopp Adler 261",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Durkopp Adler",
        "model": "261",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505383",
        "name": "Juki 5410-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505159",
        "name": "Juki 5410-6",
        "area": "Mangas",
        "status": "Operando",
        "brand": "Juki",
        "model": "5410-6",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D36600303",
        "name": "juki 9010",
        "area": "Mangas",
        "status": "Operando",
        "brand": "juki",
        "model": "9010",
        "station": "Mangas",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "535-329",
        "name": "Adler 971",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Adler",
        "model": "971",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "494",
        "name": "Adler 971",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Adler",
        "model": "971",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "410875",
        "name": "Adler 991",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Adler",
        "model": "991",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "3459",
        "name": "Adler 971",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Adler",
        "model": "971",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568494",
        "name": "Adler 261",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Adler",
        "model": "261",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GC00311",
        "name": "Juki DLN 9010A",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN 9010A",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568401",
        "name": "Adler 261",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Adler",
        "model": "261",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFM21193",
        "name": "Juki DDL-9000 B",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000 B",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MZN-PL1-000425",
        "name": "Lunapress CP 21.5 A",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Lunapress",
        "model": "CP 21.5 A",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "98002",
        "name": "Lunapress CP 21.5 A",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Lunapress",
        "model": "CP 21.5 A",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "99609",
        "name": "Mimi Industries CP 21.5 A",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Mimi Industries",
        "model": "CP 21.5 A",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "XS9018120",
        "name": "Siruba DL 7200-NM1",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL 7200-NM1",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L0M600579",
        "name": "Juki LBH 1790 AN",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH 1790 AN",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1MF01515",
        "name": "Juki LK1903BN",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK1903BN",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1MF00882",
        "name": "Juki LK-1903 BN",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-1903 BN",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L0M600584",
        "name": "Juki LBH 1790 AN",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH 1790 AN",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "140995055",
        "name": "Jack T190BK",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Jack",
        "model": "T190BK",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "140995956",
        "name": "Jack T190BK",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Jack",
        "model": "T190BK",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HC01999",
        "name": "Juki LK 1903",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK 1903",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L0FJ00314",
        "name": "Juki LBH 1790 S",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH 1790 S",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L0FM00204",
        "name": "Juki LBH 1790 S",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH 1790 S",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1FE00622",
        "name": "Juki LK 1903 AN",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK 1903 AN",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNTH01166",
        "name": "Juki DLN-5410-6",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOHL02177",
        "name": "Juki DDL-9000 B-SS",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000 B-SS",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "823NA00429",
        "name": "Juki LH-3528 A-7",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "LH-3528 A-7",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "JK584501-40",
        "name": "Jack 58450 I",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Jack",
        "model": "58450 I",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0225407",
        "name": "Pegasus EX2241-02",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Pegasus",
        "model": "EX2241-02",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "039678-7",
        "name": "Pegasus EX2241-02",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Pegasus",
        "model": "EX2241-02",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "152445",
        "name": "Pfaff 5616-96/99",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Pfaff",
        "model": "5616-96/99",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOEE31673",
        "name": "Juki DDL-9000 B-SS",
        "area": "Hector Fajardo",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000 B-SS",
        "station": "Puños",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "219L000409",
        "name": "Siruba 747LD-514M",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "747LD-514M",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "ENS1-002",
        "name": "Willcox & Gibbs 515-E32-430",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Willcox & Gibbs",
        "model": "515-E32-430",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "000646",
        "name": "Brother MH4-V92-92-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Brother",
        "model": "MH4-V92-92-6",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8746218",
        "name": "Pegasus E32-434",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Pegasus",
        "model": "E32-434",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "208K004517",
        "name": "Siruba 757KI-516M",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "757KI-516M",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "ENS1-006",
        "name": "Willcox & Gibbs 515-E32-430",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Willcox & Gibbs",
        "model": "515-E32-430",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1427192",
        "name": "Union Special 56300",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56300",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1622356",
        "name": "Union Special 56400",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56400",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1742833",
        "name": "Union Special 56300",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56300",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1088368",
        "name": "Union Special 56300",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56300",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1160779",
        "name": "Union Special 56300",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56300",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1756251",
        "name": "Union Special 56300",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56300",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1572795",
        "name": "Union Special 56300",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56300",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1111231",
        "name": "Union Special 56300",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56300",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MHOWM06452",
        "name": "Juki MH380",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "MH380",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MHOYL03378",
        "name": "Juki MH380",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "MH380",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1748164",
        "name": "Union Special 56400",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56400",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "150496327",
        "name": "Jack 8558W-1",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Jack",
        "model": "8558W-1",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1596864",
        "name": "Union Special 56400",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56400",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1262803",
        "name": "Union Special 56400",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56400",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "985592",
        "name": "Union Special 56400",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56400",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1854965",
        "name": "Union Special 56400",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56400",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1595609",
        "name": "Union Special 56400",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56400",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1742835",
        "name": "Union Special 56400",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Union Special",
        "model": "56400",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021309",
        "name": "Siruba DL7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "506206",
        "name": "Juki 5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "5410-6",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021295",
        "name": "Siruba DL7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GF00048",
        "name": "Juki DLN 9010",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN 9010",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GF00046",
        "name": "Juki DLN 9010",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN 9010",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "504767",
        "name": "Juki DLN5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN5410-6",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018144",
        "name": "Siruba DL7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNAB36586",
        "name": "Juki DLN 5410-7",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN 5410-7",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021292",
        "name": "Siruba DL 7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL 7200",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GC00309",
        "name": "Juki DLN 9010",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN 9010",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00123",
        "name": "Juki DLN 9010",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN 9010",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021299",
        "name": "Siruba DL 7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL 7200",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018141",
        "name": "Siruba DL 7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL 7200",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "F2555680",
        "name": "Brother B 791",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Brother",
        "model": "B 791",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y024963",
        "name": "Siruba DL 7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL 7200",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021294",
        "name": "Siruba DL 7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL 7200",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505149",
        "name": "Juki DLN 5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN 5410-6",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505400",
        "name": "Juki DLN 5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN 5410-6",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y024967-2",
        "name": "Siruba DL 7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL 7200",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNTL02079",
        "name": "Juki DLN 5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN 5410-6",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018161",
        "name": "Siruba DL 7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL 7200",
        "station": "Ens-1",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUMC01046",
        "name": "JUKI DLN-5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021306",
        "name": "SIRUBA DL7200-NM1-10",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NM1-10",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "380-T14155",
        "name": "JUKI MH-380",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "MH-380",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MHOUE02961",
        "name": "JUKI MH-380",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "MH-380",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MHOUE02987",
        "name": "JUKI MH-380",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "MH-380",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MHOWK06122",
        "name": "JUKI MH-380",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "MH-380",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "504545",
        "name": "ADLER 973",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "ADLER",
        "model": "973",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "503043",
        "name": "ADLER 973",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "ADLER",
        "model": "973",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "458476",
        "name": "ADLER 973",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "ADLER",
        "model": "973",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "418257",
        "name": "ADLER 973",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "ADLER",
        "model": "973",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "519097",
        "name": "ADLER 973",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "ADLER",
        "model": "973",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "ENS1-057",
        "name": "LUNA PRESS CP-323-T",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-323-T",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "534945",
        "name": "ADLER 396",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "ADLER",
        "model": "396",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "444277",
        "name": "ADLER 396",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "ADLER",
        "model": "396",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "3139/3",
        "name": "LUNA PRESS CP-323T",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-323T",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "526376",
        "name": "ADLER 396",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "ADLER",
        "model": "396",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "ENS1-062",
        "name": "LUNA PRESS CP-323T",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-323T",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "533921",
        "name": "ADLER 396",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "ADLER",
        "model": "396",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "ENS1-064",
        "name": "LUNA PRESS CP-323T",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-323T",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "313597",
        "name": "LUNA PRESS CP-323S",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-323S",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2027",
        "name": "LUNA PRESS CP-311",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-311",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021307",
        "name": "SIRUBA DL7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFJ21611",
        "name": "JUKI DDL-9000B-SS",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3CF00054",
        "name": "JUKI DLN 9010",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN 9010",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021304",
        "name": "SIRUBA DL-7200-16",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL-7200-16",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3SF00057",
        "name": "JUKI DLN-9010",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-9010",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "800FJ21742",
        "name": "JUKI DDL-9000B-SS",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021300",
        "name": "SIRUBA DL 7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL 7200",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505306",
        "name": "JUKI DLN 5410",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN 5410",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3FC00291",
        "name": "JUKI DLN 9010",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN 9010",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNWC16159",
        "name": "JUKI DLN 5410",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN 5410",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L0EBOO833-2",
        "name": "Juki LBH-17905",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-17905",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOEM00515-2",
        "name": "Juki LBH-17905",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-17905",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505418-4",
        "name": "N/D N/D",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "N/D",
        "model": "N/D",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "M2NPL1-000202-2",
        "name": "Juki 5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3EH00352-2",
        "name": "N/D N/D",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "N/D",
        "model": "N/D",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "515-E32-4030-2",
        "name": "JUKI DLN-9010",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-9010",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505418-5",
        "name": "Willcox & Gibbs 355-5XS",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Willcox & Gibbs",
        "model": "355-5XS",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNXA20771-2",
        "name": "JUKI DLN-52110-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-52110-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "506180-2",
        "name": "JUKI DLN-5410-7",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-5410-7",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505740-2",
        "name": "Juki DLN-5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3GCOO297-2",
        "name": "Juki DNL-5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DNL-5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUH06481-2",
        "name": "Juki DLN-9010A",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "502225-2",
        "name": "Juki MA4-9265-5",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "MA4-9265-5",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3EH00348-2",
        "name": "Juki DLN-5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "PTX-PL2-000115-2",
        "name": "Juki DLN-5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNUH06479-2",
        "name": "Brother DLN-9010-ASS",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Brother",
        "model": "DLN-9010-ASS",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505054-2",
        "name": "Juki CP-311",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "CP-311",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3MF00063-2",
        "name": "Juki DL7200-BM1",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DL7200-BM1",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "ENS1-095",
        "name": "Juki DLN-9010-ASS",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010-ASS",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X40024468-2",
        "name": "LUNA PRESS CP-311",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-311",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNVKL3075-2",
        "name": "Siruba DL-7200-BMI",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL-7200-BMI",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3EH00347-2",
        "name": "JUKI DLN5410-6",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN5410-6",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "ENS1-099",
        "name": "Juki DLN-9010A-55",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-55",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOF521632-2",
        "name": "LUNA PRESS T323",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "T323",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "261568514-2",
        "name": "JUKI DDL-9000B-SS",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "335-5X5-2",
        "name": "ADLER 261",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "ADLER",
        "model": "261",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "211HJ02638-2",
        "name": "Willcox & Gibbs 515-E32-450",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Willcox & Gibbs",
        "model": "515-E32-450",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "230772053-2",
        "name": "Juki LK-1903B-55",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-1903B-55",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y024968-2",
        "name": "Siruba LBH5-17905",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "LBH5-17905",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOEG11921-2",
        "name": "Siruba DL7200",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Siruba",
        "model": "DL7200",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3JH00042-2",
        "name": "Juki DDL-9000",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOFK00200-2",
        "name": "Juki DLN-9010",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HJO1996-2",
        "name": "Juki LBH-17905",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "LBH-17905",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "ENS1-110",
        "name": "Juki LK-19031B",
        "area": "ENS-1",
        "status": "Operando",
        "brand": "Juki",
        "model": "LK-19031B",
        "station": "Cuellos",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOHL02184",
        "name": "JUKI DDL-9000-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568488",
        "name": "DURKOPP ADLER 261",
        "area": "Emerson",
        "status": "Operando",
        "brand": "DURKOPP ADLER",
        "model": "261",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "22074515627",
        "name": "JACK A6F-E",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JACK",
        "model": "A6F-E",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "22054519192",
        "name": "JACK A6F-E",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JACK",
        "model": "A6F-E",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "22054518090",
        "name": "JACK A6F-E",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JACK",
        "model": "A6F-E",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOHH06132",
        "name": "JUKI DDL-9000B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNAG38213",
        "name": "JUKI 5410",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "5410",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2204450126523",
        "name": "JACK A6F-E",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JACK",
        "model": "A6F-E",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018107",
        "name": "SIRUBA DL7200-NM1-16",
        "area": "Emerson",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NM1-16",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89018127",
        "name": "SIRUBA DL7200-NM1-16",
        "area": "Emerson",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NM1-16",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOEG11902",
        "name": "JUKI DDL-9000B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "951939",
        "name": "UNION SPECIAL 54400",
        "area": "Emerson",
        "status": "Operando",
        "brand": "UNION SPECIAL",
        "model": "54400",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1749360",
        "name": "UNION SPECIAL 54400",
        "area": "Emerson",
        "status": "Operando",
        "brand": "UNION SPECIAL",
        "model": "54400",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1763526",
        "name": "UNION SPECIAL 54400",
        "area": "Emerson",
        "status": "Operando",
        "brand": "UNION SPECIAL",
        "model": "54400",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1708994",
        "name": "UNION SPECIAL 54400",
        "area": "Emerson",
        "status": "Operando",
        "brand": "UNION SPECIAL",
        "model": "54400",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1319091",
        "name": "KANSAI DFB-1412 PTV-1",
        "area": "Emerson",
        "status": "Operando",
        "brand": "KANSAI",
        "model": "DFB-1412 PTV-1",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOEE31679",
        "name": "JUKI DDL-9000B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568402",
        "name": "DURKOPP ADLER 261",
        "area": "Emerson",
        "status": "Operando",
        "brand": "DURKOPP ADLER",
        "model": "261",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568491",
        "name": "DURKOPP ADLER 261",
        "area": "Emerson",
        "status": "Operando",
        "brand": "DURKOPP ADLER",
        "model": "261",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOFM21196",
        "name": "JUKI DDL-9000B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "218L007776",
        "name": "SIRUBA 747 LD-514M",
        "area": "Emerson",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747 LD-514M",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8DOEC11154",
        "name": "JUKI DDL-9000B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "0261568407",
        "name": "DURKOPP ADLER 261",
        "area": "Emerson",
        "status": "Operando",
        "brand": "DURKOPP ADLER",
        "model": "261",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89015017",
        "name": "SIRUBA DL7200-BM1-16",
        "area": "Emerson",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-BM1-16",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "7036",
        "name": "AC. XL-75",
        "area": "Emerson",
        "status": "Operando",
        "brand": "AC.",
        "model": "XL-75",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "6806",
        "name": "AC. XL-75",
        "area": "Emerson",
        "status": "Operando",
        "brand": "AC.",
        "model": "XL-75",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "EM-027",
        "name": "LUNA PRESS CP-323T",
        "area": "Emerson",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-323T",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "18101023217",
        "name": "JACK 58450J",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JACK",
        "model": "58450J",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "PL1-000432",
        "name": "BROTHER N/A",
        "area": "Emerson",
        "status": "Operando",
        "brand": "BROTHER",
        "model": "N/A",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1GG00380",
        "name": "JUKI LK-1900",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1900",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1GD00242",
        "name": "JUKI LK-1900",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1900",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "141295036",
        "name": "JACK T1900BSK",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JACK",
        "model": "T1900BSK",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HK01140",
        "name": "JUKI LK-1903B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HK00480",
        "name": "JUKI LK-1903B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HK01138",
        "name": "JUKI LK-1903B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HK00479",
        "name": "JUKI LK-1903B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HK00476",
        "name": "JUKI LK-1903B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HJ01998",
        "name": "JUKI LK-1903B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HK00477",
        "name": "JUKI LK-1903B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HK00471",
        "name": "JUKI LK-1903B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HJ02642",
        "name": "JUKI LK-1903B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1HK01139",
        "name": "JUKI LK-1903B-SS",
        "area": "Emerson",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Delanteros",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MHOWK06119",
        "name": "juki MH380",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "juki",
        "model": "MH380",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1735330",
        "name": "U. SPECIAL 56400",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56400",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MHOVL02852",
        "name": "juki MH380",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "juki",
        "model": "MH380",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8MOKA027285",
        "name": "juki M06716",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "juki",
        "model": "M06716",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1113662",
        "name": "U. SPECIAL 56300",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1389794",
        "name": "U. SPECIAL 56400",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56400",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MHOVA02173",
        "name": "juki MH380",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "juki",
        "model": "MH380",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1606916",
        "name": "U. SPECIAL 56300",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "U. SPECIAL",
        "model": "56300",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1DH02003",
        "name": "juki LK1903A",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "juki",
        "model": "LK1903A",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1DF01193",
        "name": "juki LK1903A",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "juki",
        "model": "LK1903A",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "19083000699",
        "name": "jack JKI9270D",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "jack",
        "model": "JKI9270D",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "504773-2",
        "name": "juki DLN9410-6",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN9410-6",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "17042011775",
        "name": "jack 58450-G",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "jack",
        "model": "58450-G",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2A3ZF00142",
        "name": "juki AMS-210E",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "juki",
        "model": "AMS-210E",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "18101027927",
        "name": "jack 58450-J",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "jack",
        "model": "58450-J",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNWC16158",
        "name": "juki DLN5410-6",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "juki",
        "model": "DLN5410-6",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X8915159",
        "name": "siruba DL7200BM1",
        "area": "Fuera de uso",
        "status": "Operando",
        "brand": "siruba",
        "model": "DL7200BM1",
        "station": "Fuera de uso",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2LOFK00203",
        "name": "JUKI LBH-1790 S",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LBH-1790 S",
        "station": "Desarrollo Producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2L1EB01520",
        "name": "JUKI LK-1903ASS",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903ASS",
        "station": "Desarrollo Producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "261568396",
        "name": "Dürkopp 261",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "Dürkopp",
        "model": "261",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "186147",
        "name": "Union Especial 54400 K",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "Union Especial",
        "model": "54400 K",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DDLUH15966",
        "name": "JUKI DDL-5550-6",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-5550-6",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "150696156.P",
        "name": "Jack T1900BSK",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "Jack",
        "model": "T1900BSK",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "501176",
        "name": "JUKI DLN-5410N-6",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-5410N-6",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "92QY006453",
        "name": "SIRUBA DL7200-BM1-16",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-BM1-16",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1111255",
        "name": "Union Especial 56200",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "Union Especial",
        "model": "56200",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNAB36460",
        "name": "JUKI DLN-5410-6",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-5410-6",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1169552",
        "name": "Union Especial 56300",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "Union Especial",
        "model": "56300",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "8MOKA02752",
        "name": "JUKI MO-6716S",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "MO-6716S",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "505395",
        "name": "JUKI DLN-5410-6",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-5410-6",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3JH00056",
        "name": "JUKI DLN-9010A-SS",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-9010A-SS",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1742816",
        "name": "Union Especial 56400",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "Union Especial",
        "model": "56400",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "1467554",
        "name": "Union Especial 56400",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "Union Especial",
        "model": "56400",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "MHOBF03159",
        "name": "JUKI MH-380",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "MH-380",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNTJ01540",
        "name": "JUKI DLN-5410-6",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-5410-6",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "920Y003830",
        "name": "SIRUBA DL7200-BM1-16",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-BM1-16",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "919Y021303",
        "name": "SIRUBA DL7200-BM1",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-BM1",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "P67492",
        "name": "JUKI DDL-5550-6",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-5550-6",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "038RC00347",
        "name": "JUKI MS-1190M",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "MS-1190M",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "2D3JH00031",
        "name": "JUKI DLN-9010A-SS",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-9010A-SS",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "DLNAB36469",
        "name": "JUKI DLN-5410-7",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-5410-7",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "X89015008",
        "name": "SIRUBA DL7200-BM1-16",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-BM1-16",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "219L000317",
        "name": "SIRUBA 747L-514M",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747L-514M",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "118K073603",
        "name": "SIRUBA C007KD-W322",
        "area": "Desarrollo de producto",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "C007KD-W322",
        "station": "Desarrollo de producto",
        "createdAt": "2026-07-06T20:57:42.033735Z"
    },
    {
        "id": "S04246",
        "name": "Juki DLN-5410-6",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410-6",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2D3GC00303",
        "name": "Juki DLN-9010A-SS",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-9010A-SS",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8L3NA00429",
        "name": "Juki LH-3528A-7",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "LH-3528A-7",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "DLNWL20212",
        "name": "Juki DLN-5410N-7",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DLN-5410N-7",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "141305",
        "name": "HOFFMAN P.R",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "HOFFMAN",
        "model": "P.R",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOHH06129",
        "name": "Juki DDL-9000B-SS",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOEG11929",
        "name": "Juki DDL-9000B-SS",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2DCXFC1351",
        "name": "Juki DDL-9000B-SS",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOEE31633",
        "name": "Juki DDL-9000B-SS",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOFJ21607",
        "name": "Juki DDL-9000B-SS",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOEC11196",
        "name": "Juki DDL-9000B-SS",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOFJ21552",
        "name": "Juki DDL-9000B-SS",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOHL02171",
        "name": "Juki DDL-9000B-SS",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "S992805",
        "name": "SINGER 261",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "SINGER",
        "model": "261",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "5972864",
        "name": "SINGER 261",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "SINGER",
        "model": "261",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOEE31013",
        "name": "Juki DDL-9000B-SS",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "DDL-9000B-SS",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "3M8K00032",
        "name": "Juki MS1190",
        "area": "ENS-2",
        "status": "Operando",
        "brand": "Juki",
        "model": "MS1190",
        "station": "ENS-2",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "228755422",
        "name": "SIRUBA LKS-1903AN-SS302",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "LKS-1903AN-SS302",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "919Y024965",
        "name": "SIRUBA DL7200-NM1-16",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NM1-16",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "MZN-PL1-000349",
        "name": "LUNA PRESS CP-323T",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-323T",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "MZN-PL1-000563",
        "name": "LUNA PRESS CP-323T",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "LUNA PRESS",
        "model": "CP-323T",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "65563",
        "name": "NEW YORKER Oxford Industries, inc.",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "NEW YORKER",
        "model": "Oxford Industries, inc.",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "MZN-PL1-000352",
        "name": "NEW YORKER Oxford Industries, inc.",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "NEW YORKER",
        "model": "Oxford Industries, inc.",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "1262881",
        "name": "UNION SPECIAL 56300",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "UNION SPECIAL",
        "model": "56300",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "919Y021356",
        "name": "SIRUBA DL7200B-BM1-17Q",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200B-BM1-17Q",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "X89018120",
        "name": "SIRUBA DL7200-NM1-16",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NM1-16",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOFJ21528",
        "name": "JUKI DDL-9000B-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "219L000397",
        "name": "SIRUBA 747LD 747LD-514M-3-24/VTE/DKLT1-1",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA 747LD",
        "model": "747LD-514M-3-24/VTE/DKLT1-1",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOFM21187",
        "name": "JUKI DDL-9000B-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "218K004510",
        "name": "SIRUBA 757KT-516M-3-35/CT",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "757KT-516M-3-35/CT",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "919Y021346",
        "name": "SIRUBA DL7200B-BM1-17Q",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200B-BM1-17Q",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "PTX-PL3-000345",
        "name": "TRANSFER",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "TRANSFER",
        "model": "",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "19083000851",
        "name": "JACK JK-T9270D-12-2PL-Q-(1/4)",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JACK",
        "model": "JK-T9270D-12-2PL-Q-(1/4)",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "140197699",
        "name": "JACK JK-8558W-1",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JACK",
        "model": "JK-8558W-1",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "S914478",
        "name": "SINGER 261",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SINGER",
        "model": "261",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "KS322857A",
        "name": "KANSAI SPECIAL FX4413PK-UTC",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "KANSAI SPECIAL",
        "model": "FX4413PK-UTC",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2L1FM00677",
        "name": "JUKI LK-1900AN-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1900AN-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "DLNAB36592",
        "name": "JUKI DLN-5410N-7",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-5410N-7",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "92OY003865",
        "name": "SIRUBA DL7200-BM1-16",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-BM1-16",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2MOVL00243",
        "name": "JUKI MO-6900",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "MO-6900",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "218L000798",
        "name": "SIRUBA 747LD-514M-3-24/VTE/DKLT1-1",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747LD-514M-3-24/VTE/DKLT1-1",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "923OY006463",
        "name": "SIRUBA DL7200-BM1-16",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-BM1-16",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "219L000320",
        "name": "SIRUBA 747DL-514M-3-24/VTE/DKLT1-1",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747DL-514M-3-24/VTE/DKLT1-1",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOGE12258",
        "name": "JUKI DDL-9000B-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2DLOFM00512",
        "name": "JUKI LBH-1790S",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LBH-1790S",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "22054518118",
        "name": "JACK A6F",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JACK",
        "model": "A6F",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2D3MF00059",
        "name": "JUKI DLN-9010A-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-9010A-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2D3MF00121",
        "name": "JUKI DLN-9010A-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-9010A-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "1494104",
        "name": "UNION SPECIAL 53600",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "UNION SPECIAL",
        "model": "53600",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "3M1D00090",
        "name": "JUKI MH-380",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "MH-380",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "218L007092",
        "name": "SIRUBA 747LD-514M-3-24/VTE/DKLT1-1",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747LD-514M-3-24/VTE/DKLT1-1",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "219L000372",
        "name": "SIRUBA 747LD-514M-3-24/VTE/DKLT1-1",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747LD-514M-3-24/VTE/DKLT1-1",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "92OY003824",
        "name": "SIRUBA DL7200-BM1-16",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-BM1-16",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "211244",
        "name": "US L-7039-13",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "US",
        "model": "L-7039-13",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "911399",
        "name": "JUKI DDL-8700B-7",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-8700B-7",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8L3NA01239",
        "name": "JUKI LH-3528A-7",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LH-3528A-7",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "219L000402",
        "name": "SIRUBA 747DL-514M-3-24/VTE/DKLT1-1",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "747DL-514M-3-24/VTE/DKLT1-1",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "128361674",
        "name": "SIRUBA DL7200-NM1-13",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NM1-13",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "919Y021293",
        "name": "SIRUBA DL7200-NM1-16",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-NM1-16",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "0261568493",
        "name": "DURKOPP ADLER 261",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "DURKOPP ADLER",
        "model": "261",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "92OY003815",
        "name": "SIRUBA DL7200-BM1-16",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "SIRUBA",
        "model": "DL7200-BM1-16",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "DLNVK13075",
        "name": "JUKI DLN-5410-6",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-5410-6",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "8DOFJ21632",
        "name": "JUKI DDL-9000B-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DDL-9000B-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "MZN-PL1-000463",
        "name": "WILLCOX & GIBBS 515-E32-450",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "WILLCOX & GIBBS",
        "model": "515-E32-450",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "G557876",
        "name": "BROTHER MA4-V92-92-6",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "BROTHER",
        "model": "MA4-V92-92-6",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2D3EH000348",
        "name": "JUKI DLN-9010A-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-9010A-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2D3GC00297",
        "name": "JUKI DLN-9010A-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "DLN-9010A-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2L1HJ02638",
        "name": "JUKI LK-1903B-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    },
    {
        "id": "2L1HJ01996",
        "name": "JUKI LK-1903B-SS",
        "area": "Miselaneos",
        "status": "Operando",
        "brand": "JUKI",
        "model": "LK-1903B-SS",
        "station": "Miselaneos",
        "createdAt": "2026-08-10T00:00:00.000000Z"
    }
];

const DEFAULT_ORDERS = [];

// --- CATÁLOGO DE PIEZAS (datos importados desde Excel "Catalogo de piezas.xlsx") ---
const DEFAULT_PARTS = [
    { id: "part-001", name: "KNIFE", partNumber: "B2424-280-000", price: 105.49, stock: 0, description: "", createdAt: "2026-07-20T00:00:00.000Z" },
    { id: "part-002", name: "Espaciador de costura", partNumber: "0317-150010", price: 1308.23, stock: 0, description: "", createdAt: "2026-07-20T00:00:00.000Z" },
    { id: "part-003", name: "Hook", partNumber: "110-38650", price: 827.90, stock: 0, description: "", createdAt: "2026-07-20T00:00:00.000Z" },
    { id: "part-004", name: "Spring Thread Take-Up", partNumber: "229-21605", price: 15.43, stock: 0, description: "", createdAt: "2026-07-20T00:00:00.000Z" },
    { id: "part-005", name: "Plate", partNumber: "113-00308", price: 376.22, stock: 0, description: "", createdAt: "2026-07-20T00:00:00.000Z" },
    { id: "part-006", name: "Feed Dog", partNumber: "D1609-415-B00", price: 256.28, stock: 0, description: "", createdAt: "2026-07-20T00:00:00.000Z" },
    { id: "part-007", name: "Correa Dentada", partNumber: "0396-341880", price: 964.05, stock: 0, description: "", createdAt: "2026-07-20T00:00:00.000Z" },
    { id: "part-008", name: "Upper KNIFE", partNumber: "0971-440860", price: 2617.54, stock: 0, description: "", createdAt: "2026-07-20T00:00:00.000Z" },
    { id: "part-009", name: "Lower KNIFE", partNumber: "0971-440870", price: 1090.69, stock: 0, description: "", createdAt: "2026-07-20T00:00:00.000Z" }
];

// Load or Seed localState (Caché local inicial)
let state = {
    machinery: JSON.parse(localStorage.getItem("monzini_machinery")) || DEFAULT_MACHINERY,
    orders: JSON.parse(localStorage.getItem("monzini_orders")) || DEFAULT_ORDERS,
    parts: JSON.parse(localStorage.getItem("monzini_parts")) || DEFAULT_PARTS,
    unlockedReports: false
};

// Si la caché local tiene pocos elementos (ej. solo datos de prueba antiguos)
// y la base de datos de Excel tiene toda la maquinaria, forzar la carga de la base de datos.
if (state.machinery.length < 10 && DEFAULT_MACHINERY.length > 500) {
    state.machinery = DEFAULT_MACHINERY;
    localStorage.setItem("monzini_machinery", JSON.stringify(state.machinery));
} else if (state.machinery.length === 0) {
    state.machinery = DEFAULT_MACHINERY;
    localStorage.setItem("monzini_machinery", JSON.stringify(state.machinery));
}
if (state.orders.length === 0) {
    state.orders = DEFAULT_ORDERS;
    localStorage.setItem("monzini_orders", JSON.stringify(state.orders));
}
if (!state.parts || state.parts.length === 0) {
    state.parts = DEFAULT_PARTS;
    localStorage.setItem("monzini_parts", JSON.stringify(state.parts));
}

// --- STATE MANAGEMENT HELPERS & SYNC ENGINE ---
function saveMachinery() {
    localStorage.setItem("monzini_machinery", JSON.stringify(state.machinery));
    syncStateToCloud();
}

function saveOrders() {
    localStorage.setItem("monzini_orders", JSON.stringify(state.orders));
    syncStateToCloud();
}

function saveParts() {
    localStorage.setItem("monzini_parts", JSON.stringify(state.parts));
    syncStateToCloud();
}

// Actualiza el indicador visual de la barra superior
function updateSyncBadge(status, text) {
    const badge = document.getElementById("sync-status-badge");
    if (!badge) return;

    badge.className = "sync-badge";
    let iconHTML = "";
    
    if (status === "loading") {
        badge.classList.add("sync-loading");
        iconHTML = `<i data-lucide="refresh-cw" class="animate-spin" style="width:16px;height:16px;"></i>`;
    } else if (status === "success") {
        badge.classList.add("sync-success");
        iconHTML = `<i data-lucide="cloud-lightning" style="width:16px;height:16px;"></i>`;
    } else {
        badge.classList.add("sync-warning");
        iconHTML = `<i data-lucide="cloud-off" style="width:16px;height:16px;"></i>`;
    }

    badge.innerHTML = `${iconHTML}<span id="sync-status-text">${text}</span>`;
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Carga el estado desde Firebase
async function loadStateFromCloud() {
    if (!CONFIG_DATABASE_URL) {
        updateSyncBadge("warning", "Modo Local");
        return;
    }

    updateSyncBadge("loading", "Conectando...");
    try {
        if (firebaseAuthReady) { await firebaseAuthReady; }
        const cleanUrl = CONFIG_DATABASE_URL.replace(/\/$/, "");
        const response = await fetch(buildAuthedDbUrl(`${cleanUrl}/monzini.json`));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data) {
            state.machinery = data.machinery || [];
            state.orders = data.orders || [];
            state.parts = data.parts || DEFAULT_PARTS;
            
            // Sincronizar respaldo en local storage
            localStorage.setItem("monzini_machinery", JSON.stringify(state.machinery));
            localStorage.setItem("monzini_orders", JSON.stringify(state.orders));
            localStorage.setItem("monzini_parts", JSON.stringify(state.parts));
            updateSyncBadge("success", "Sincronizado");
        } else {
            // Si la base de datos de la nube está vacía, subir el estado local actual solo si hay datos,
            // de lo contrario, inicializar con los valores por defecto
            if (state.machinery.length > 0 || state.orders.length > 0 || state.parts.length > 0) {
                await syncStateToCloud();
            } else {
                state.machinery = DEFAULT_MACHINERY;
                state.orders = DEFAULT_ORDERS;
                state.parts = DEFAULT_PARTS;
                await syncStateToCloud();
            }
        }
    } catch (err) {
        console.error("Error cargando de la base de datos cloud, usando local storage:", err);
        updateSyncBadge("warning", "Local (Offline)");
    }
}

// Guarda el estado en Firebase
async function syncStateToCloud() {
    if (!CONFIG_DATABASE_URL) {
        updateSyncBadge("warning", "Modo Local");
        return { ok: false, reason: "Sin CONFIG_DATABASE_URL configurado" };
    }

    updateSyncBadge("loading", "Guardando...");
    try {
        if (firebaseAuthReady) { await firebaseAuthReady; }
        const cleanUrl = CONFIG_DATABASE_URL.replace(/\/$/, "");
        const response = await fetch(buildAuthedDbUrl(`${cleanUrl}/monzini.json`), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                machinery: state.machinery,
                orders: state.orders,
                parts: state.parts
            })
        });

        if (!response.ok) {
            let bodyText = "";
            try { bodyText = await response.text(); } catch (e) {}
            throw new Error(`HTTP ${response.status} ${response.statusText}${bodyText ? " - " + bodyText : ""}`);
        }
        updateSyncBadge("success", "Sincronizado");
        return { ok: true };
    } catch (err) {
        console.error("Error guardando en la base de datos cloud:", err);
        updateSyncBadge("warning", "Local (Error subida)");
        return { ok: false, reason: err.message || String(err) };
    }
}

// Forzar una sincronización manual al hacer clic en el botón
async function forceSync() {
    await loadStateFromCloud();
    const activeNavItem = document.querySelector(".nav-item.active");
    if (activeNavItem) {
        const currentPage = activeNavItem.getAttribute("data-page");
        navigateToPage(currentPage);
    } else {
        navigateToPage("dashboard");
    }
}

// --- SOUND EFFECTS (Web Audio API Synthesizer) ---
function playScannerBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // High pitch beep
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
        console.warn("Navegador bloqueó el sintetizador de audio preliminar.", e);
    }
}

// --- UI UTILITIES ---
function formatDate(isoString) {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function calculateDiffHours(startIso, endIso) {
    if (!startIso || !endIso) return "--";
    const start = new Date(startIso);
    const end = new Date(endIso);
    const diffMs = end - start;
    const diffHrs = diffMs / (1000 * 60 * 60);
    return diffHrs.toFixed(1);
}

// --- CHART GENERATION (Chart.js) ---
let priorityChart = null;

function renderDashboardCharts() {
    const canvas = document.getElementById("chart-priority");
    if (!canvas) return;

    // Count priorities of active orders
    const activeOrders = state.orders.filter(o => o.status !== "Resuelto");
    const counts = { Baja: 0, Media: 0, Alta: 0, Crítica: 0 };
    activeOrders.forEach(o => {
        if (counts[o.priority] !== undefined) {
            counts[o.priority]++;
        }
    });

    if (priorityChart) {
        priorityChart.destroy();
    }

    const ctx = canvas.getContext("2d");
    priorityChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Baja", "Media", "Alta", "Crítica"],
            datasets: [{
                data: [counts.Baja, counts.Media, counts.Alta, counts.Crítica],
                backgroundColor: [
                    "rgba(6, 182, 212, 0.75)",  // Cyan
                    "rgba(251, 191, 36, 0.75)",  // Yellow
                    "rgba(249, 115, 22, 0.75)",  // Orange
                    "rgba(244, 63, 94, 0.75)"    // Red
                ],
                borderColor: [
                    "#080c14",
                    "#080c14",
                    "#080c14",
                    "#080c14"
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#94a3b8",
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        },
                        padding: 15
                    }
                }
            },
            cutout: "70%"
        }
    });
}
// --- SISTEMA DE CÁMARA CORREGIDO CON IDS REALES ---
let html5QrcodeScanner = null;
let isScanning = false;

function initCameraScanner() {
    // Usamos el ID real de tu HTML: "camera-source-select"
    const cameraSelect = document.getElementById("camera-source-select");
    if (!cameraSelect) return;

    cameraSelect.innerHTML = '<option value="">Cargando dispositivos...</option>';

    const errorBox = document.getElementById("scanner-camera-error");
    if (errorBox) errorBox.style.display = "none";

    // Comprobación temprana: getUserMedia requiere un contexto seguro (https o localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        cameraSelect.innerHTML = '<option value="">No disponible en este contexto</option>';
        if (errorBox) {
            errorBox.style.display = "flex";
            const msgEl = errorBox.querySelector("p");
            if (msgEl) msgEl.textContent = "Tu navegador no permite el acceso a la cámara aquí. Esto pasa si la página no se sirve por https:// o http://localhost. Usa la simulación abajo mientras tanto.";
        }
        return;
    }

    // Pedimos permisos al navegador
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            // Apagamos el stream de prueba inmediato para liberar el lente
            stream.getTracks().forEach(track => track.stop());

            // Listamos las cámaras con la librería
            Html5Qrcode.getCameras()
                .then((devices) => {
                    cameraSelect.innerHTML = ""; 

                    if (devices && devices.length > 0) {
                        devices.forEach((device, index) => {
                            const opt = document.createElement("option");
                            opt.value = device.id;
                            opt.text = device.label || `Cámara ${index + 1}`;
                            cameraSelect.appendChild(opt);
                        });

                        cameraSelect.onchange = (e) => {
                            const selectedId = e.target.value;
                            if (selectedId) {
                                stopScanning().then(() => startScanning(selectedId));
                            } else {
                                stopScanning();
                            }
                        };

                        // Retraso seguro antes de encender la primera cámara
                        setTimeout(() => {
                            cameraSelect.value = devices[0].id;
                            startScanning(devices[0].id);
                        }, 400);

                    } else {
                        cameraSelect.innerHTML = '<option value="">No se detectaron cámaras</option>';
                        if (errorBox) {
                            errorBox.style.display = "flex";
                            const msgEl = errorBox.querySelector("p");
                            if (msgEl) msgEl.textContent = "No se detectó ninguna cámara conectada a este dispositivo. Verifica que esté conectada y que el sistema operativo le dé permiso al navegador.";
                        }
                    }
                })
                .catch((err) => {
                    console.error("Error al listar cámaras:", err);
                    cameraSelect.innerHTML = '<option value="">Error de hardware</option>';
                    if (errorBox) {
                        errorBox.style.display = "flex";
                        const msgEl = errorBox.querySelector("p");
                        if (msgEl) msgEl.textContent = `Error al listar cámaras: ${err.message || err}. Usa la simulación abajo mientras tanto.`;
                    }
                });
        })
        .catch((err) => {
            console.error("Permiso denegado:", err);
            cameraSelect.innerHTML = '<option value="">Sin permiso de cámara</option>';
            if (errorBox) {
                errorBox.style.display = "flex";
                const msgEl = errorBox.querySelector("p");
                if (msgEl) {
                    let hint = "Otorga permiso de cámara al navegador para este sitio (icono de candado en la barra de direcciones).";
                    if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                        hint = "No se encontró ninguna cámara en este dispositivo/navegador.";
                    } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                        hint = "La cámara ya está siendo usada por otra aplicación (Zoom, Teams, otra pestaña, etc.). Ciérrala e inténtalo de nuevo.";
                    } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                        hint = "Bloqueaste el permiso de cámara para este sitio. Actívalo desde el icono de candado en la barra de direcciones.";
                    }
                    msgEl.textContent = `${err.name || 'Error'}: ${hint}`;
                }
            }
        });
}

function startScanning(cameraId) {
    // Usamos el contenedor real de tu HTML: "scanner-reader"
    const container = document.getElementById("scanner-reader");
    if (!container) return;

    if (isScanning) return;

    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("scanner-reader");
    }

    const config = {
        fps: 10,
        qrbox: (width, height) => {
            const minElem = Math.min(width, height);
            const boxSize = Math.floor(minElem * 0.65);
            return { width: boxSize, height: boxSize };
        }
    };

    isScanning = true;
    
    setTimeout(() => {
        html5QrcodeScanner.start(
            cameraId,
            config,
            (decodedText) => {
                handleBarcodeFound(decodedText);
            },
            (errorMessage) => {
                // Captura silenciosa de cuadros
            }
        ).then(() => {
            // Cámara encendida correctamente: ocultar mensaje de error y ajustar botones
            const errorBox = document.getElementById("scanner-camera-error");
            if (errorBox) errorBox.style.display = "none";
            const startBtn = document.getElementById("start-camera-btn");
            const stopBtn = document.getElementById("stop-camera-btn");
            if (startBtn) startBtn.style.display = "none";
            if (stopBtn) stopBtn.style.display = "flex";
        }).catch((err) => {
            console.warn("Fallo al levantar transmisión:", err);
            isScanning = false;
            const errorBox = document.getElementById("scanner-camera-error");
            if (errorBox) {
                errorBox.style.display = "flex";
                const msgEl = errorBox.querySelector("p");
                if (msgEl) {
                    msgEl.textContent = `No se pudo encender la cámara (${err.name || 'Error'}: ${err.message || err}). Verifica que ninguna otra aplicación la esté usando, o usa la simulación abajo.`;
                }
            }
        });
    }, 200);
}

function stopScanning() {
    return new Promise((resolve) => {
        const startBtn = document.getElementById("start-camera-btn");
        const stopBtn = document.getElementById("stop-camera-btn");
        if (startBtn) startBtn.style.display = "flex";
        if (stopBtn) stopBtn.style.display = "none";

        if (html5QrcodeScanner && isScanning) {
            html5QrcodeScanner.stop()
                .then(() => {
                    isScanning = false;
                    const container = document.getElementById("scanner-reader");
                    if (container) container.innerHTML = ""; 
                    resolve(true);
                })
                .catch((err) => {
                    console.error("Error al apagar hardware:", err);
                    isScanning = false;
                    resolve(false);
                });
        } else {
            resolve(true);
        }
    });
}
function handleBarcodeFound(barcodeText) {
    playScannerBeep();
    stopScanning();
    showMachineInfo(barcodeText.trim());
}

// Construye y abre el modal de información de la máquina (usado tanto al escanear un QR
// como desde el botón "Información de la Máquina" en el catálogo de Maquinaria).
function showMachineInfo(machineId) {
    // Check if machine exists
    const machine = state.machinery.find(m => m.id.toLowerCase() === machineId.toLowerCase());

    const codeDisplay = document.getElementById("scanned-code-text");
    const nameDisplay = document.getElementById("scanned-machine-name");
    const areaDisplay = document.getElementById("scanned-machine-area");
    const specsDisplay = document.getElementById("scanned-machine-specs");
    const statusDisplay = document.getElementById("scanned-machine-status");

    codeDisplay.textContent = machineId;

    if (machine) {
        nameDisplay.textContent = machine.name;
        areaDisplay.textContent = machine.area;
        specsDisplay.textContent = `${machine.brand || 'Genérica'} / ${machine.model || 'N/A'}`;
        
        statusDisplay.textContent = machine.status;
        statusDisplay.className = `badge badge-status-${machine.status.split(' ')[0]}`; // Safe classing

        // Hook shortcut button
        const orderBtn = document.getElementById("btn-scanner-create-order");
        orderBtn.onclick = () => {
            // Select in orders form and go there
            document.getElementById("order-machine-id").value = machine.id;
            closeModal("scanner-success-modal");
            navigateToPage("orders");
        };
        orderBtn.style.display = "inline-flex";

        renderMachineHistory(machine.id);
    } else {
        nameDisplay.textContent = "CÓDIGO NO REGISTRADO";
        areaDisplay.textContent = "N/A";
        specsDisplay.textContent = "N/A";
        statusDisplay.textContent = "Inexistente";
        statusDisplay.className = "badge badge-status-Fuera";
        
        document.getElementById("btn-scanner-create-order").style.display = "none";

        renderMachineHistory(null);
    }

    openModal("scanner-success-modal");
}

// Construye el historial de operaciones (órdenes de trabajo) de una maquinaria específica
// y lo pinta dentro del modal de escaneo, más reciente primero.
function renderMachineHistory(machineId) {
    const container = document.getElementById("scanned-machine-history");
    if (!container) return;

    if (!machineId) {
        container.innerHTML = `<div class="history-empty-state">Escanea una maquinaria registrada para ver su historial.</div>`;
        return;
    }

    const history = state.orders
        .filter(o => o.machineId === machineId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (history.length === 0) {
        container.innerHTML = `<div class="history-empty-state">Esta maquinaria aún no tiene órdenes de trabajo registradas.</div>`;
        return;
    }

    container.innerHTML = history.map(o => {
        const priorityClass = o.priority === "Crítica" ? "is-critical" : (o.priority === "Alta" ? "is-high" : "");

        const dateLabel = o.status === "Resuelto" && o.resolvedAt
            ? `Resuelto: ${new Date(o.resolvedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}`
            : `Abierto: ${new Date(o.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}`;

        const statusLabel = o.status === "Resuelto"
            ? `<span class="badge badge-status-Operando" style="font-size:9px;">Resuelto</span>`
            : `<span class="badge badge-status-Mantenimiento" style="font-size:9px;">${o.status}</span>`;

        return `
            <div class="history-item ${priorityClass}">
                <div class="history-item-header">
                    <span class="history-item-date">${dateLabel}</span>
                    ${statusLabel}
                </div>
                <div class="history-item-desc">${o.description || 'Sin descripción'}</div>
                <div class="history-item-mechanic">Mecánico: ${o.mechanic || 'No asignado'} · Prioridad: ${o.priority || 'N/A'}</div>
                ${o.observations ? `<div class="history-item-obs">"${o.observations}"</div>` : ''}
            </div>
        `;
    }).join('');
}

// --- DYNAMIC RENDERING ENGINES ---

// Update navigation titles
function updateHeaderTitle(pageId) {
    const titleEl = document.getElementById("current-section-title");
    const subtitleEl = document.getElementById("current-section-subtitle");

    switch(pageId) {
        case "dashboard":
            titleEl.textContent = "Dashboard General";
            subtitleEl.textContent = "Resumen del estado operativo de maquinaria y alertas abiertas.";
            break;
        case "machinery":
            titleEl.textContent = "Catálogo de Maquinaria";
            subtitleEl.textContent = "Visualiza y administra el inventario de maquinaria y códigos QR.";
            break;
        case "parts":
            titleEl.textContent = "Catálogo de Piezas";
            subtitleEl.textContent = "Inventario de repuestos y piezas disponibles para mantenimiento.";
            break;
        case "scanner":
            titleEl.textContent = "Lector de Código QR";
            subtitleEl.textContent = "Escanea la placa física de la maquinaria para gestionar incidentes.";
            break;
        case "orders":
            titleEl.textContent = "Panel de Órdenes de Trabajo";
            subtitleEl.textContent = "Administra las tareas de reparación y actualiza sus observaciones.";
            break;
        case "reports":
            titleEl.textContent = "Módulo de Reportes de Calidad";
            subtitleEl.textContent = "Área reservada para el Jefe de Departamento. Bitácora de casos cerrados.";
            break;
    }
}

// Render Dashboard
function populateDashboard() {
    // Stats Calculations
    const totalMac = state.machinery.length;
    const activeAlerts = state.orders.filter(o => o.status === "Pendiente").length;
    const progressOrders = state.orders.filter(o => o.status === "En Proceso").length;
    const closedCount = state.orders.filter(o => o.status === "Resuelto").length;
    const totalOrders = state.orders.length;
    
    // Compliance Rate
    const compliance = totalOrders > 0 ? Math.round((closedCount / totalOrders) * 100) : 100;

    document.getElementById("stat-total-machinery").textContent = totalMac;
    document.getElementById("stat-active-alerts").textContent = activeAlerts;
    document.getElementById("stat-pending-orders").textContent = progressOrders;
    document.getElementById("stat-compliance-rate").textContent = `${compliance}%`;
    document.getElementById("stat-resolved-count").textContent = `${closedCount} cerrados`;

    // Machine Status Breakdown
    const operandoCount = state.machinery.filter(m => m.status === "Operando").length;
    const mantenimientoCount = state.machinery.filter(m => m.status === "Mantenimiento").length;
    const fueraCount = state.machinery.filter(m => m.status === "Fuera de Servicio" || (m.status || "").toLowerCase().includes("fuera")).length;
    document.getElementById("stat-status-operando").textContent = operandoCount;
    document.getElementById("stat-status-mantenimiento").textContent = mantenimientoCount;
    document.getElementById("stat-status-fuera").textContent = fueraCount;

    // Sidebar indicator update
    document.getElementById("orders-badge-count").textContent = activeAlerts + progressOrders;

    // Alert Feed (Dashboard Log)
    const feedContainer = document.getElementById("dashboard-alert-feed");
    feedContainer.innerHTML = "";

    const activeList = state.orders
        .filter(o => o.status !== "Resuelto")
        .sort((a,b) => {
            // Sort by priority rank
            const ranks = { "Crítica": 4, "Alta": 3, "Media": 2, "Baja": 1 };
            return (ranks[b.priority] || 0) - (ranks[a.priority] || 0);
        });

    if (activeList.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="check-circle" class="text-success"></i>
                <p>¡Todo en orden! No hay alertas activas en este momento.</p>
            </div>
        `;
    } else {
        activeList.forEach(o => {
            const machine = state.machinery.find(m => m.id === o.machineId) || { name: "Maquinaria Desconocida", id: o.machineId };
            
            const div = document.createElement("div");
            div.className = `feed-item priority-${o.priority}`;
            
            let obsHtml = "";
            if (o.observations && o.observations.trim() !== "") {
                obsHtml = `<div class="feed-observations"><strong>Obs:</strong> ${o.observations}</div>`;
            }

            div.innerHTML = `
                <div class="feed-item-left">
                    <div class="feed-title">
                        <span class="feed-machine-name">${machine.name}</span>
                        <span class="feed-machine-id">${machine.id}</span>
                        <span class="feed-badge badge-priority-${o.priority}">${o.priority}</span>
                    </div>
                    <p class="feed-description">${o.description}</p>
                    ${obsHtml}
                    <div class="feed-meta">
                        <span class="feed-time"><i data-lucide="clock" style="width:12px;height:12px"></i> ${formatDate(o.createdAt)}</span>
                        <span class="feed-mechanic"><i data-lucide="wrench" style="width:12px;height:12px"></i> Asignado: ${o.mechanic}</span>
                    </div>
                </div>
                <div class="feed-item-right">
                    <button class="btn btn-warning btn-sm" onclick="openOrderActions('${o.id}')">Gestionar</button>
                    <span class="badge badge-status-${o.status.split(' ')[0]}">${o.status}</span>
                </div>
            `;
            feedContainer.appendChild(div);
        });
    }

    renderDashboardCharts();
    lucide.createIcons();
}

// Render Catalog Maquinaria
// Llena dinámicamente el filtro de departamentos con las áreas que realmente existen
// en la maquinaria cargada (state.machinery), en vez de una lista fija en el HTML.
// Así el filtro nunca se desincroniza aunque cambien o se agreguen departamentos.
function populateAreaFilterOptions() {
    const select = document.getElementById("machine-filter-area");
    if (!select) return;

    const currentValue = select.value || "all";
    const uniqueAreas = [...new Set(state.machinery.map(m => m.area).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'es'));

    select.innerHTML = `<option value="all">Todos los departamentos</option>` +
        uniqueAreas.map(area => `<option value="${area}">${area}</option>`).join('');

    // Conservar la selección previa si sigue existiendo
    if ([...select.options].some(o => o.value === currentValue)) {
        select.value = currentValue;
    }
}

// Genera un PNG (data URL) del QR de un código, usando la misma librería QRCode.js
// que ya usa el sistema para renderizar los QR en las tarjetas de maquinaria.
function generateQrDataUrl(text) {
    return new Promise((resolve) => {
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "fixed";
        tempDiv.style.left = "-9999px";
        document.body.appendChild(tempDiv);

        new QRCode(tempDiv, {
            text: text,
            width: 200,
            height: 200,
            colorDark: "#0b111e",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });

        // QRCode.js dibuja en un <canvas> (o en un <img> como respaldo); esperamos
        // un instante a que termine de renderizar antes de leer el resultado.
        setTimeout(() => {
            const canvas = tempDiv.querySelector("canvas");
            const img = tempDiv.querySelector("img");
            let dataUrl = null;
            if (canvas) {
                dataUrl = canvas.toDataURL("image/png");
            } else if (img && img.src) {
                dataUrl = img.src;
            }
            document.body.removeChild(tempDiv);
            resolve(dataUrl);
        }, 20);
    });
}

// Genera e imprime las etiquetas QR de la maquinaria, usando exactamente los mismos
// códigos (m.id) que tu sistema ya usa para identificar cada máquina al escanear.
// Respeta el filtro de búsqueda/área que tengas activo en la pantalla de Maquinaria,
// así puedes imprimir todo el catálogo o solo un departamento a la vez.
async function printMachineryQRLabels() {
    const searchQuery = document.getElementById("machine-search-input")?.value || "";
    const areaFilter = document.getElementById("machine-filter-area")?.value || "all";
    const q = searchQuery.toLowerCase();

    const filtered = state.machinery.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(q) ||
                              m.id.toLowerCase().includes(q) ||
                              (m.brand && m.brand.toLowerCase().includes(q)) ||
                              (m.model && m.model.toLowerCase().includes(q));
        const matchesArea = areaFilter === "all" || m.area === areaFilter;
        return matchesSearch && matchesArea;
    });

    if (filtered.length === 0) {
        alert("No hay máquinas que coincidan con el filtro/búsqueda actual para imprimir.");
        return;
    }

    // Abrimos la ventana INMEDIATAMENTE (de forma síncrona, en el mismo clic) para que
    // el navegador no la trate como un pop-up no solicitado. Si esperamos a generar los
    // QR primero y recién ahí abrimos la ventana, Chrome/Firefox la bloquean.
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        alert("Tu navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio (ícono en la barra de direcciones) e inténtalo de nuevo.");
        return;
    }
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><title>Etiquetas QR - Monzini Mecánica</title></head>
        <body style="font-family:Arial,sans-serif;padding:40px;color:#555;">
            <p>Generando ${filtered.length} etiquetas QR, un momento...</p>
        </body>
        </html>
    `);

    const btn = document.getElementById("print-qr-labels-btn");
    const originalHtml = btn ? btn.innerHTML : null;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>Generando ${filtered.length} etiquetas...</span>`;
    }

    const labels = [];
    for (const m of filtered) {
        const dataUrl = await generateQrDataUrl(m.id);
        labels.push({ id: m.id, name: m.name || "", area: m.area || "" });
        labels[labels.length - 1].dataUrl = dataUrl;
    }

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }

    if (printWindow.closed) {
        alert("La ventana de impresión se cerró antes de terminar. Intenta de nuevo.");
        return;
    }

    const labelsHtml = labels.map(l => `
        <div class="qr-label">
            <img src="${l.dataUrl}" alt="QR ${l.id}">
            <div class="qr-label-text">
                <div class="qr-label-id">${l.id}</div>
                ${l.name ? `<div class="qr-label-name">${l.name}</div>` : ""}
                ${l.area ? `<div class="qr-label-area">${l.area}</div>` : ""}
            </div>
        </div>
    `).join("");

    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
        <meta charset="UTF-8">
        <title>Etiquetas QR - Monzini Mecánica</title>
        <style>
            @page { margin: 12mm; }
            * { box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 18px; color: #1c2024; }
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
            .toolbar button { padding: 10px 18px; font-size: 13.5px; font-weight: 700; border: none; border-radius: 6px; background: #d98e2c; color: #1c2024; cursor: pointer; }
            .toolbar select { padding: 8px; font-size: 13px; border-radius: 6px; border: 1px solid #ccc; }
            .count { font-size: 13px; color: #555; }
            .sheet { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .qr-label { border: 1.4px dashed #999; border-radius: 6px; padding: 8px; display: flex; align-items: center; gap: 8px; break-inside: avoid; page-break-inside: avoid; }
            .qr-label img { width: 62px; height: 62px; flex: none; }
            .qr-label-text { min-width: 0; }
            .qr-label-id { font-family: 'Consolas', monospace; font-weight: 800; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .qr-label-name { font-size: 10.5px; color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .qr-label-area { font-size: 9px; color: #a8681a; text-transform: uppercase; font-weight: 700; margin-top: 1px; }
            @media print { .toolbar { display: none; } }
        </style>
        </head>
        <body>
            <div class="toolbar">
                <div class="count">${labels.length} etiquetas — códigos QR tomados en vivo de tu sistema</div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <select id="colSelect" onchange="document.querySelector('.sheet').style.gridTemplateColumns = 'repeat(' + this.value + ', 1fr)'">
                        <option value="2">2 columnas</option>
                        <option value="3" selected>3 columnas</option>
                        <option value="4">4 columnas</option>
                        <option value="5">5 columnas</option>
                    </select>
                    <button onclick="window.print()">🖨️ Imprimir</button>
                </div>
            </div>
            <div class="sheet">${labelsHtml}</div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function populateMachinery(filterSearch = "", filterArea = "all") {
    const container = document.getElementById("machinery-cards-container");
    container.innerHTML = "";

    const filtered = state.machinery.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(filterSearch.toLowerCase()) || 
                              m.id.toLowerCase().includes(filterSearch.toLowerCase()) || 
                              (m.brand && m.brand.toLowerCase().includes(filterSearch.toLowerCase())) ||
                              (m.model && m.model.toLowerCase().includes(filterSearch.toLowerCase()));
        const matchesArea = filterArea === "all" || m.area === filterArea;
        return matchesSearch && matchesArea;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1">
                <i data-lucide="info"></i>
                <p>No se encontraron máquinas que coincidan con la búsqueda.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    filtered.forEach(m => {
        const card = document.createElement("div");
        card.className = "machine-card";
        
        card.innerHTML = `
            <div class="machine-card-header">
                <div>
                    <h3>${m.name}</h3>
                    <span class="machine-id-tag">${m.id}</span>
                </div>
                <span class="machine-status-badge badge-status-${m.status.split(' ')[0]}">${m.status}</span>
            </div>
            <div class="machine-card-body">
                <div class="machine-info-specs">
                    <div class="spec-item">
                        <span>Área</span>
                        <span>${m.area}</span>
                    </div>
                    <div class="spec-item">
                        <span>Marca</span>
                        <span>${m.brand || 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span>Modelo</span>
                        <span>${m.model || 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span>Registro</span>
                        <span>${new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div class="machine-barcode-area">
                    <div id="qr-canvas-${m.id}" class="qr-render-box"></div>
                    <span class="machine-barcode-label">${m.id}</span>
                </div>
            </div>
            <div class="machine-card-footer" style="display: flex; flex-direction: column; gap: 8px;">
                <button class="btn btn-secondary" style="width: 100%;" onclick="showMachineInfo('${m.id}')">
                    <i data-lucide="info"></i>
                    <span>Información de la Máquina</span>
                </button>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-warning" style="flex: 1;" onclick="createOrderShortcut('${m.id}')">
                        <i data-lucide="alert-triangle"></i>
                        <span>Levantar Alerta</span>
                    </button>
                    <button class="btn btn-secondary" style="padding: 0 12px;" onclick="openEditMachineModal('${m.id}')" title="Editar Máquina">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="btn btn-danger" style="padding: 0 12px; background-color: #dc2626; border-color: #dc2626; color: #fff;" onclick="deleteMachine('${m.id}')" title="Eliminar Máquina">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);

        // Render QR Code
        const qrContainer = document.getElementById(`qr-canvas-${m.id}`);
        if (qrContainer && typeof QRCode !== "undefined") {
            qrContainer.innerHTML = "";
            new QRCode(qrContainer, {
                text: m.id,
                width: 90,
                height: 90,
                colorDark: "#0b111e",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        } else if (qrContainer) {
            console.warn("La librería QRCode no está disponible. Verifica tu conexión a internet.");
        }
    });

    lucide.createIcons();
}

// --- CATÁLOGO DE PIEZAS ---

function populateParts(filterSearch = "") {
    const container = document.getElementById("parts-cards-container");
    if (!container) return;
    container.innerHTML = "";

    const filtered = (state.parts || []).filter(p => {
        const q = filterSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) ||
               p.partNumber.toLowerCase().includes(q) ||
               (p.description && p.description.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1">
                <i data-lucide="package-x"></i>
                <p>No se encontraron piezas que coincidan con la búsqueda.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "machine-card part-card";

        const priceFormatted = p.price != null
            ? `L ${Number(p.price).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : 'N/A';

        const stockVal = p.stock != null ? p.stock : 0;
        const stockClass = stockVal <= 0 ? 'text-danger' : (stockVal <= 3 ? 'text-warning' : 'text-success');
        const stockLabel = stockVal <= 0 ? 'Sin Stock' : (stockVal <= 3 ? 'Stock Bajo' : 'En Stock');

        card.innerHTML = `
            <div class="machine-card-header">
                <div>
                    <h3>${p.name}</h3>
                    <span class="machine-id-tag">${p.partNumber}</span>
                </div>
                <span class="machine-status-badge ${stockClass === 'text-danger' ? 'badge-status-Fuera' : (stockClass === 'text-warning' ? 'badge-status-Mantenimiento' : 'badge-status-Operando')}">${stockLabel}</span>
            </div>
            <div class="machine-card-body">
                <div class="machine-info-specs">
                    <div class="spec-item">
                        <span>N° de Parte</span>
                        <span>${p.partNumber}</span>
                    </div>
                    <div class="spec-item">
                        <span>Precio Unitario</span>
                        <span class="part-price-value">${priceFormatted}</span>
                    </div>
                    <div class="spec-item">
                        <span>Cantidad en Stock</span>
                        <span class="${stockClass}" style="font-weight:700; font-size:1.1em;">${stockVal} unidades</span>
                    </div>
                    <div class="spec-item">
                        <span>Registrado</span>
                        <span>${new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                ${p.description ? `<div class="part-description-box">${p.description}</div>` : ''}
            </div>
            <div class="machine-card-footer" style="display: flex; gap: 8px;">
                <button class="btn btn-warning" style="flex: 1;" onclick="openEditPartModal('${p.id}')">
                    <i data-lucide="pencil"></i>
                    <span>Editar</span>
                </button>
                <button class="btn btn-danger" style="padding: 0 14px; background-color: #dc2626; border-color: #dc2626; color: #fff;" onclick="deletePart('${p.id}')" title="Eliminar Pieza">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    lucide.createIcons();
}

function resetPartModalToAddMode() {
    document.getElementById("part-modal-title").textContent = "Registrar Nueva Pieza";
    document.getElementById("btn-submit-part-modal").textContent = "Registrar Pieza";
    document.getElementById("edit-part-original-id").value = "";
}

function openEditPartModal(partId) {
    const part = (state.parts || []).find(p => p.id === partId);
    if (!part) return;

    document.getElementById("part-modal-title").textContent = "Editar Pieza";
    document.getElementById("btn-submit-part-modal").textContent = "Guardar Cambios";
    document.getElementById("edit-part-original-id").value = part.id;
    document.getElementById("new-part-name").value = part.name || "";
    document.getElementById("new-part-number").value = part.partNumber || "";
    document.getElementById("new-part-price").value = part.price != null ? part.price : "";
    document.getElementById("new-part-stock").value = part.stock != null ? part.stock : "";
    document.getElementById("new-part-description").value = part.description || "";

    openModal("add-part-modal");
}

// Abre el modal de maquinaria en modo edición, precargando los datos actuales.
// Útil especialmente para corregir el departamento de máquinas que se
// agregaron manualmente con las opciones viejas (Corte/Costura/etc.)
// Regresa el modal de maquinaria a su estado normal de "Agregar Nueva" después
// de editar o cancelar, para que no quede atascado en modo edición.
function resetMachineModalToAddMode() {
    document.getElementById("machine-modal-title").textContent = "Registrar Nueva Maquinaria";
    document.getElementById("btn-submit-machine-modal").textContent = "Registrar Máquina";
    document.getElementById("edit-machine-original-id").value = "";
    const idInput = document.getElementById("new-machine-id");
    idInput.readOnly = false;

    // Quitar cualquier opción temporal de área inválida que se haya agregado durante una edición
    const areaSelect = document.getElementById("new-machine-area");
    [...areaSelect.options].forEach(o => {
        if (o.textContent.includes("departamento no válido")) {
            o.remove();
        }
    });
}

function openEditMachineModal(machineId) {
    const machine = state.machinery.find(m => m.id === machineId);
    if (!machine) return;

    document.getElementById("machine-modal-title").textContent = "Editar Maquinaria";
    document.getElementById("btn-submit-machine-modal").textContent = "Guardar Cambios";
    document.getElementById("edit-machine-original-id").value = machine.id;

    const idInput = document.getElementById("new-machine-id");
    idInput.value = machine.id;
    idInput.readOnly = true; // El ID es la llave única usada en órdenes; no se cambia al editar

    document.getElementById("new-machine-name").value = machine.name || "";
    document.getElementById("new-machine-brand").value = machine.brand || "";
    document.getElementById("new-machine-model").value = machine.model || "";
    document.getElementById("new-machine-status").value = machine.status || "Operando";

    const areaSelect = document.getElementById("new-machine-area");
    // Si el área actual no está en la lista (ej. "Corte" viejo), la agregamos temporalmente
    // para que se vea reflejada y el usuario la pueda corregir conscientemente.
    if (machine.area && ![...areaSelect.options].some(o => o.value === machine.area)) {
        const opt = document.createElement("option");
        opt.value = machine.area;
        opt.textContent = `${machine.area} (departamento no válido, corrígelo)`;
        areaSelect.appendChild(opt);
    }
    areaSelect.value = machine.area || "";

    openModal("add-machine-modal");
}

function createOrderShortcut(machineId) {
    document.getElementById("order-machine-id").value = machineId;
    navigateToPage("orders");
}

// Render Work Orders Board
function populateWorkOrders() {
    const listPending = document.getElementById("list-pending-orders");
    const listProgress = document.getElementById("list-progress-orders");

    listPending.innerHTML = "";
    listProgress.innerHTML = "";

    let countPending = 0;
    let countProgress = 0;

    state.orders.forEach(o => {
        if (o.status === "Resuelto") return;

        const machine = state.machinery.find(m => m.id === o.machineId) || { name: "Maquinaria Desconocida" };
        
        const card = document.createElement("div");
        card.className = "board-card";
        card.onclick = () => openOrderActions(o.id);

        let obsHtml = "";
        if (o.observations && o.observations.trim() !== "") {
            obsHtml = `<div class="board-card-obs"><strong>Obs:</strong> ${o.observations}</div>`;
        }

        card.innerHTML = `
            <div class="board-card-header">
                <span class="board-card-title">${machine.name}</span>
                <span class="feed-badge badge-priority-${o.priority}">${o.priority}</span>
            </div>
            <p class="board-card-desc">${o.description}</p>
            ${obsHtml}
            <div class="board-card-footer">
                <span class="board-card-meta"><i data-lucide="user" style="width:11px;height:11px"></i> ${o.mechanic}</span>
                <span class="board-card-meta"><i data-lucide="clock" style="width:11px;height:11px"></i> ${new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
        `;

        if (o.status === "Pendiente") {
            listPending.appendChild(card);
            countPending++;
        } else if (o.status === "En Proceso") {
            listProgress.appendChild(card);
            countProgress++;
        }
    });

    document.getElementById("count-pending-list").textContent = countPending;
    document.getElementById("count-progress-list").textContent = countProgress;

    // Seeding Dropdowns
    const selectMachine = document.getElementById("order-machine-id");
    const selectedVal = selectMachine.value;
    selectMachine.innerHTML = '<option value="" disabled selected>Seleccione la maquinaria...</option>';
    
    state.machinery.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = `${m.name} [${m.id}] - ${m.area}`;
        selectMachine.appendChild(opt);
    });

    if (selectedVal) selectMachine.value = selectedVal;

    lucide.createIcons();
}

// --- CIERRE DE ORDEN CON CAMBIO DE REPUESTO ---
let pendingCloseOrderId = null;   // Orden que está en proceso de cierre
let selectedChangedParts = [];    // [{ partId, name, partNumber, qty }]

function openPartSelectionModal() {
    selectedChangedParts = [];
    document.getElementById("part-change-search-input").value = "";
    renderPartSearchResults("");
    renderSelectedChangedParts();
    openModal("select-changed-parts-modal");
}

function renderPartSearchResults(query) {
    const container = document.getElementById("part-change-search-results");
    if (!container) return;

    const q = query.toLowerCase();
    const results = (state.parts || []).filter(p => {
        if (q === "") return false; // No mostrar el catálogo completo hasta que se busque algo
        return p.name.toLowerCase().includes(q) || p.partNumber.toLowerCase().includes(q);
    }).slice(0, 15);

    if (q === "") {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9em; padding: 4px 0;">Escribe el nombre o número de pieza para buscar en el catálogo...</p>`;
        return;
    }

    if (results.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9em; padding: 4px 0;">No se encontraron piezas que coincidan con "${query}".</p>`;
        return;
    }

    container.innerHTML = results.map(p => {
        const stockVal = p.stock != null ? p.stock : 0;
        const outOfStock = stockVal <= 0;
        const stockColor = outOfStock ? "var(--color-danger)" : (stockVal <= 3 ? "var(--color-warning)" : "var(--color-success)");
        const priceFormatted = p.price != null
            ? `L ${Number(p.price).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : 'N/A';
        return `
            <div class="part-search-result-item">
                <div class="part-result-info">
                    <strong>${p.name}</strong>
                    <small>${p.partNumber} · ${priceFormatted}</small>
                </div>
                <span class="part-result-stock" style="color:${stockColor};">${stockVal} en stock</span>
                <button type="button" class="btn btn-primary" style="padding: 6px 12px;" ${outOfStock ? "disabled title='Sin stock disponible'" : ""} onclick="addChangedPart('${p.id}')">
                    <i data-lucide="plus"></i>
                    <span>Agregar</span>
                </button>
            </div>
        `;
    }).join("");

    lucide.createIcons();
}

function addChangedPart(partId) {
    const part = state.parts.find(p => p.id === partId);
    if (!part) return;

    const existing = selectedChangedParts.find(sp => sp.partId === partId);
    if (existing) {
        if (existing.qty < (part.stock || 0)) {
            existing.qty += 1;
        }
    } else {
        selectedChangedParts.push({
            partId: part.id,
            name: part.name,
            partNumber: part.partNumber,
            qty: 1,
            unitPrice: part.price != null ? Number(part.price) : 0
        });
    }
    renderSelectedChangedParts();
}

function updateChangedPartQty(partId, qty) {
    const sp = selectedChangedParts.find(sp => sp.partId === partId);
    const part = state.parts.find(p => p.id === partId);
    if (!sp || !part) return;

    let newQty = parseInt(qty, 10);
    if (isNaN(newQty) || newQty < 1) newQty = 1;
    if (newQty > (part.stock || 0)) newQty = part.stock || 0;
    sp.qty = newQty;
    renderSelectedChangedParts();
}

function removeChangedPart(partId) {
    selectedChangedParts = selectedChangedParts.filter(sp => sp.partId !== partId);
    renderSelectedChangedParts();
}

function renderSelectedChangedParts() {
    const container = document.getElementById("part-change-selected-list");
    if (!container) return;

    if (selectedChangedParts.length === 0) {
        container.innerHTML = `<p class="empty-selected-parts-msg" style="color: var(--text-muted); font-size: 0.9em;">Aún no has agregado ninguna pieza.</p>`;
        return;
    }

    container.innerHTML = selectedChangedParts.map(sp => {
        const subtotal = (sp.unitPrice || 0) * sp.qty;
        const subtotalFormatted = `L ${subtotal.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return `
        <div class="part-selected-item">
            <div class="part-result-info">
                <strong>${sp.name}</strong>
                <small>${sp.partNumber} · Subtotal: ${subtotalFormatted}</small>
            </div>
            <input type="number" min="1" class="form-control input-dark part-selected-qty-input" value="${sp.qty}" onchange="updateChangedPartQty('${sp.partId}', this.value)">
            <button type="button" class="btn btn-danger" style="padding: 6px 10px;" onclick="removeChangedPart('${sp.partId}')" title="Quitar pieza">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `;
    }).join("");

    lucide.createIcons();
}

// Cierra definitivamente la orden de trabajo, ya con la decisión de repuestos resuelta
function finalizeCloseOrder(orderId, usedParts) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = "Resuelto";
    order.resolvedAt = new Date().toISOString();
    order.usedParts = (usedParts || []).map(p => ({
        partId: p.partId, name: p.name, partNumber: p.partNumber, qty: p.qty,
        unitPrice: p.unitPrice != null ? Number(p.unitPrice) : 0
    }));

    // Re-evaluate machinery status
    // If there are no other active warnings or outages on this machine, return status to "Operando"
    const otherActiveOnMachine = state.orders.some(o => o.machineId === order.machineId && o.status !== "Resuelto" && o.id !== orderId);
    if (!otherActiveOnMachine) {
        const machine = state.machinery.find(m => m.id === order.machineId);
        if (machine) {
            machine.status = "Operando";
            saveMachinery();
        }
    }

    saveOrders();
    populateWorkOrders();
    populateDashboard();
    if (document.getElementById("parts-cards-container")) {
        populateParts();
    }
}

// --- ORDER ACTION ACTIONS AND MODALS ---
function openOrderActions(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const machine = state.machinery.find(m => m.id === order.machineId) || { name: "Desconocida" };

    document.getElementById("modal-order-id").value = order.id;
    document.getElementById("modal-machine-name").textContent = machine.name;
    document.getElementById("modal-machine-id-text").textContent = order.machineId;
    document.getElementById("modal-defect-desc").textContent = order.description;
    document.getElementById("modal-assigned-mechanic").textContent = order.mechanic;
    
    const statusBadge = document.getElementById("modal-status-badge");
    statusBadge.textContent = order.status;
    statusBadge.className = `badge badge-status-${order.status.split(' ')[0]}`;

    document.getElementById("modal-observations-input").value = order.observations || "";

    // Mostrar piezas cambiadas, si las hubo
    const usedPartsLine = document.getElementById("modal-used-parts-line");
    const usedPartsText = document.getElementById("modal-used-parts-text");
    if (order.usedParts && order.usedParts.length > 0) {
        usedPartsText.textContent = order.usedParts.map(p => {
            const cost = (p.unitPrice || 0) * p.qty;
            return `${p.name} (${p.partNumber}) x${p.qty} - L ${cost.toLocaleString('es-HN', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        }).join(", ");
        usedPartsLine.style.display = "block";
    } else {
        usedPartsLine.style.display = "none";
    }

    // Toggle button views depending on status
    const btnProgress = document.getElementById("btn-modal-progress");
    const btnResolve = document.getElementById("btn-modal-resolve");

    if (order.status === "Pendiente") {
        btnProgress.style.display = "inline-flex";
        btnResolve.style.display = "none";
    } else if (order.status === "En Proceso") {
        btnProgress.style.display = "none";
        btnResolve.style.display = "inline-flex";
    } else {
        btnProgress.style.display = "none";
        btnResolve.style.display = "none";
    }

    openModal("observations-modal");
}

// --- MODAL UTILS ---
function openModal(id) {
    document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// --- CONFIRMACIÓN CON PIN DE JEFE (usada para agregar/editar/eliminar maquinaria) ---
// Muestra el mismo teclado de PIN que la sección de Reportes y, si el PIN ingresado
// coincide con BOSS_PIN, ejecuta la función `onConfirm` que se le pase.
let pendingPinConfirmCallback = null;

function requestBossPinConfirmation(message, onConfirm) {
    pendingPinConfirmCallback = onConfirm;
    document.getElementById("confirm-pin-message").textContent =
        message || "Ingresa el PIN de jefe de área para confirmar este cambio.";
    document.getElementById("confirm-pin-digit-input").value = "";
    document.getElementById("confirm-pin-error-msg").style.display = "none";
    openModal("confirm-pin-modal");
    document.getElementById("confirm-pin-digit-input").focus();
}

function closeConfirmPinModal() {
    closeModal("confirm-pin-modal");
    pendingPinConfirmCallback = null;
}

// --- REPORTS VIEW & EXPORT ENGINE ---

// Los inputs <input type="date"> devuelven "YYYY-MM-DD". new Date("YYYY-MM-DD") lo
// interpreta como medianoche UTC, no como medianoche local. En zonas horarias detrás
// de UTC (como Honduras, UTC-6) eso corre el día hacia atrás y excluye casos resueltos
// "hoy" del reporte. Estas funciones arman/leen la fecha usando componentes locales.
function parseLocalDate(dateStr, endOfDay) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return endOfDay
        ? new Date(y, m - 1, d, 23, 59, 59, 999)
        : new Date(y, m - 1, d, 0, 0, 0, 0);
}

function toLocalDateInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function generateReportTable() {
    const startDateVal = document.getElementById("report-start-date").value;
    const endDateVal = document.getElementById("report-end-date").value;
    const tbody = document.getElementById("report-table-body");
    
    tbody.innerHTML = "";

    // Filter only CLOSED (Resolved) cases in the report
    let filtered = state.orders.filter(o => o.status === "Resuelto");

    if (startDateVal) {
        const start = parseLocalDate(startDateVal, false);
        filtered = filtered.filter(o => new Date(o.resolvedAt) >= start);
    }
    if (endDateVal) {
        const end = parseLocalDate(endDateVal, true);
        filtered = filtered.filter(o => new Date(o.resolvedAt) <= end);
    }

    // Sort by resolution date descending
    filtered.sort((a,b) => new Date(b.resolvedAt) - new Date(a.resolvedAt));

    // Stats calculations for filter period
    const totalCount = filtered.length;
    let totalHrs = 0;
    let resolvedCount = 0;

    filtered.forEach(o => {
        if (o.resolvedAt && o.createdAt) {
            const diff = (new Date(o.resolvedAt) - new Date(o.createdAt)) / (1000 * 60 * 60);
            totalHrs += diff;
            resolvedCount++;
        }
    });

    const avgHrs = resolvedCount > 0 ? (totalHrs / resolvedCount).toFixed(1) : "--";

    document.getElementById("rep-stat-total").textContent = totalCount;
    document.getElementById("rep-stat-closed").textContent = resolvedCount;
    document.getElementById("rep-stat-open").textContent = state.orders.filter(o => o.status !== "Resuelto").length;
    document.getElementById("rep-stat-time").textContent = avgHrs !== "--" ? `${avgHrs} hrs` : "--";

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; color: var(--text-muted);">
                    No se encontraron casos resueltos en el rango de fechas seleccionado.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(o => {
        const machine = state.machinery.find(m => m.id === o.machineId) || { name: "Desconocida", area: "N/A" };
        const tr = document.createElement("tr");
        
        tr.innerHTML = `
            <td><strong>${o.id}</strong></td>
            <td>${machine.name} <br><small style="color:var(--text-muted)">${o.machineId}</small></td>
            <td>${machine.area}</td>
            <td><span class="badge badge-priority-${o.priority}">${o.priority}</span></td>
            <td>${o.description}</td>
            <td>${o.mechanic}</td>
            <td>${formatDate(o.createdAt)}</td>
            <td>${formatDate(o.resolvedAt)}</td>
            <td><div style="max-width:250px; white-space:normal;">${o.observations || 'Sin observaciones'}</div></td>
            <td><div style="max-width:200px; white-space:normal;">${o.usedParts && o.usedParts.length > 0 ? o.usedParts.map(p => `${p.name} x${p.qty}`).join(", ") : 'Ninguna'}</div></td>
            <td>${o.usedParts && o.usedParts.length > 0 ? 'L ' + o.usedParts.reduce((sum, p) => sum + ((p.unitPrice || 0) * p.qty), 0).toLocaleString('es-HN', {minimumFractionDigits:2, maximumFractionDigits:2}) : 'L 0.00'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Prepara el buscador de máquina del reporte de gastos (limpia resultados previos)
function populateMachineReportSelect() {
    const searchInput = document.getElementById("report-machine-search-input");
    const resultsBox = document.getElementById("report-machine-search-results");
    if (!searchInput || !resultsBox) return;
    resultsBox.innerHTML = "";
}

// Filtra y muestra las máquinas que coinciden con la búsqueda (nombre, código o área)
function renderMachineReportSearchResults(query) {
    const container = document.getElementById("report-machine-search-results");
    if (!container) return;

    const q = query.trim().toLowerCase();
    if (q === "") {
        container.innerHTML = "";
        return;
    }

    const results = state.machinery.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m.area && m.area.toLowerCase().includes(q))
    ).slice(0, 20);

    if (results.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9em; padding: 4px 0;">No se encontraron máquinas que coincidan con "${query}".</p>`;
        return;
    }

    container.innerHTML = results.map(m => `
        <div class="part-search-result-item" style="cursor:pointer;" onclick="selectReportMachine('${m.id}')">
            <div class="part-result-info">
                <strong>${m.name}</strong>
                <small>${m.id} · ${m.area}</small>
            </div>
        </div>
    `).join("");
}

// Guarda la máquina elegida y limpia el listado de resultados
function selectReportMachine(machineId) {
    const machine = state.machinery.find(m => m.id === machineId);
    if (!machine) return;

    document.getElementById("report-machine-select-id").value = machine.id;
    document.getElementById("report-machine-search-input").value = `${machine.name} [${machine.id}]`;
    document.getElementById("report-machine-search-results").innerHTML = "";
    document.getElementById("report-machine-selected-label").textContent = `Seleccionada: ${machine.name} (${machine.area})`;
}

// Genera el reporte Excel de gastos en piezas cambiadas para una máquina específica
function exportMachinePartsReport() {
    const machineId = document.getElementById("report-machine-select-id").value;
    if (!machineId) {
        alert("Por favor busca y selecciona una máquina de la lista antes de descargar el reporte.");
        return;
    }

    const machine = state.machinery.find(m => m.id === machineId);
    if (!machine) {
        alert("No se encontró la máquina seleccionada.");
        return;
    }

    // Recolectar cada cambio de pieza (gasto) registrado en órdenes cerradas de esta máquina
    const expenseRows = [];
    state.orders
        .filter(o => o.machineId === machineId && o.status === "Resuelto" && o.usedParts && o.usedParts.length > 0)
        .sort((a, b) => new Date(a.resolvedAt) - new Date(b.resolvedAt))
        .forEach(o => {
            o.usedParts.forEach(p => {
                const unitPrice = p.unitPrice || 0;
                const subtotal = unitPrice * p.qty;
                expenseRows.push([
                    formatDate(o.resolvedAt),
                    o.id,
                    p.name,
                    p.partNumber,
                    p.qty,
                    unitPrice,
                    subtotal
                ]);
            });
        });

    if (expenseRows.length === 0) {
        alert(`No hay piezas cambiadas registradas para "${machine.name}" todavía.`);
        return;
    }

    const grandTotal = expenseRows.reduce((sum, row) => sum + row[6], 0);

    // Construir la hoja de cálculo manualmente para poder incluir el encabezado y el total al final
    const sheetData = [
        ["Reporte de Gastos en Piezas por Máquina"],
        ["Máquina:", machine.name, "Código:", machine.id, "Área:", machine.area],
        [],
        ["Fecha", "Orden ID", "Pieza", "Número de Parte", "Cantidad", "Precio Unitario (LPS)", "Subtotal (LPS)"],
        ...expenseRows,
        [],
        ["", "", "", "", "", "TOTAL GASTADO:", grandTotal]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    worksheet["!cols"] = [
        {wch: 14}, // Fecha
        {wch: 12}, // Orden ID
        {wch: 28}, // Pieza
        {wch: 20}, // Número de Parte
        {wch: 10}, // Cantidad
        {wch: 20}, // Precio Unitario
        {wch: 16}  // Subtotal
    ];

    const workbook = XLSX.utils.book_new();
    // El nombre de la hoja no puede exceder 31 caracteres ni tener ciertos caracteres especiales
    const safeSheetName = machine.name.replace(/[\\/*?:\[\]]/g, "").substring(0, 31) || "Gastos Maquina";
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

    const safeFileName = machine.name.replace(/[^a-zA-Z0-9_\-]/g, "_");
    XLSX.writeFile(workbook, `Reporte_Gastos_${safeFileName}_${machine.id}.xlsx`);
}

// Calcula las estadísticas y arma la tabla detallada del mecánico seleccionado
function generateMechanicReport() {
    const mechanic = document.getElementById("report-mechanic-select").value;
    const statsBox = document.getElementById("mechanic-report-stats");
    const tableWrapper = document.getElementById("mechanic-report-table-wrapper");

    if (!mechanic) {
        alert("Por favor selecciona un mecánico antes de generar el reporte.");
        return;
    }

    const mechanicOrders = state.orders.filter(o => o.mechanic === mechanic);
    const resolvedOrders = mechanicOrders.filter(o => o.status === "Resuelto");
    const activeOrders = mechanicOrders.filter(o => o.status !== "Resuelto");

    // Tiempo promedio de resolución (en horas), solo sobre órdenes ya cerradas
    let avgHoursLabel = "-- hrs";
    if (resolvedOrders.length > 0) {
        const totalHours = resolvedOrders.reduce((sum, o) => sum + parseFloat(calculateDiffHours(o.createdAt, o.resolvedAt) || 0), 0);
        avgHoursLabel = `${(totalHours / resolvedOrders.length).toFixed(1)} hrs`;
    }

    // Costo total de piezas utilizadas en las órdenes que este mecánico ha cerrado
    const totalPartsCost = resolvedOrders.reduce((sum, o) => {
        if (!o.usedParts || o.usedParts.length === 0) return sum;
        return sum + o.usedParts.reduce((s, p) => s + ((p.unitPrice || 0) * p.qty), 0);
    }, 0);

    document.getElementById("mech-stat-total").textContent = mechanicOrders.length;
    document.getElementById("mech-stat-resolved").textContent = resolvedOrders.length;
    document.getElementById("mech-stat-active").textContent = activeOrders.length;
    document.getElementById("mech-stat-time").textContent = avgHoursLabel;
    document.getElementById("mech-stat-cost").textContent = "L " + totalPartsCost.toLocaleString('es-HN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    // Tabla detallada, de la orden más reciente a la más antigua
    const tbody = document.getElementById("mechanic-report-table-body");
    tbody.innerHTML = "";

    const sortedOrders = [...mechanicOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sortedOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color: var(--text-muted);">Este mecánico no tiene órdenes registradas todavía.</td></tr>`;
    } else {
        sortedOrders.forEach(o => {
            const machine = state.machinery.find(m => m.id === o.machineId) || { name: "Maquinaria Desconocida", area: "N/A" };
            const partsCost = o.usedParts && o.usedParts.length > 0
                ? o.usedParts.reduce((sum, p) => sum + ((p.unitPrice || 0) * p.qty), 0)
                : 0;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${o.id}</td>
                <td>${machine.name}</td>
                <td>${machine.area}</td>
                <td>${o.priority || 'N/A'}</td>
                <td>${o.status}</td>
                <td><div style="max-width:220px; white-space:normal;">${o.description || ''}</div></td>
                <td>${formatDate(o.createdAt)}</td>
                <td>${o.status === "Resuelto" ? formatDate(o.resolvedAt) : '--'}</td>
                <td><div style="max-width:200px; white-space:normal;">${o.usedParts && o.usedParts.length > 0 ? o.usedParts.map(p => `${p.name} x${p.qty}`).join(", ") : 'Ninguna'}</div></td>
                <td>${'L ' + partsCost.toLocaleString('es-HN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    statsBox.style.display = "grid";
    tableWrapper.style.display = "block";
}

// Genera y descarga el reporte Excel con todas las órdenes del mecánico seleccionado
function exportMechanicReport() {
    const mechanic = document.getElementById("report-mechanic-select").value;
    if (!mechanic) {
        alert("Por favor selecciona un mecánico de la lista antes de descargar el reporte.");
        return;
    }

    const mechanicOrders = state.orders.filter(o => o.mechanic === mechanic);
    if (mechanicOrders.length === 0) {
        alert(`No hay órdenes registradas para "${mechanic}" todavía.`);
        return;
    }

    const sortedOrders = [...mechanicOrders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const dataForExcel = sortedOrders.map(o => {
        const machine = state.machinery.find(m => m.id === o.machineId) || { name: "Maquinaria Desconocida", area: "N/A" };
        const partsCost = o.usedParts && o.usedParts.length > 0
            ? o.usedParts.reduce((sum, p) => sum + ((p.unitPrice || 0) * p.qty), 0)
            : 0;
        return {
            "ID Orden": o.id,
            "Nombre Máquina": machine.name,
            "Área Planta": machine.area,
            "Criticidad": o.priority,
            "Estado": o.status,
            "Falla / Tarea": o.description,
            "Fecha Creación": new Date(o.createdAt).toLocaleString("es-MX"),
            "Fecha Resolución": o.status === "Resuelto" ? new Date(o.resolvedAt).toLocaleString("es-MX") : "--",
            "Horas de Inactividad": o.status === "Resuelto" ? calculateDiffHours(o.createdAt, o.resolvedAt) : "--",
            "Observaciones Finales": o.observations || "",
            "Piezas Cambiadas": o.usedParts && o.usedParts.length > 0 ? o.usedParts.map(p => `${p.name} (${p.partNumber}) x${p.qty}`).join(", ") : "Ninguna",
            "Costo Piezas (LPS)": partsCost
        };
    });

    const resolvedOrders = mechanicOrders.filter(o => o.status === "Resuelto");
    const totalPartsCost = resolvedOrders.reduce((sum, o) => {
        if (!o.usedParts || o.usedParts.length === 0) return sum;
        return sum + o.usedParts.reduce((s, p) => s + ((p.unitPrice || 0) * p.qty), 0);
    }, 0);

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    worksheet["!cols"] = [
        {wch: 12}, // ID Orden
        {wch: 28}, // Nombre Máquina
        {wch: 14}, // Área
        {wch: 12}, // Criticidad
        {wch: 12}, // Estado
        {wch: 40}, // Falla
        {wch: 22}, // Fecha Creación
        {wch: 22}, // Fecha Resolución
        {wch: 18}, // Horas Inactividad
        {wch: 40}, // Observaciones
        {wch: 40}, // Piezas Cambiadas
        {wch: 18}  // Costo Piezas
    ];

    // Añadir un resumen al final de la hoja
    XLSX.utils.sheet_add_aoa(worksheet, [
        [],
        ["", "", "", "", "", "", "", "", "", "", "TOTAL ÓRDENES:", mechanicOrders.length],
        ["", "", "", "", "", "", "", "", "", "", "ÓRDENES RESUELTAS:", resolvedOrders.length],
        ["", "", "", "", "", "", "", "", "", "", "COSTO TOTAL PIEZAS (LPS):", totalPartsCost]
    ], { origin: -1 });

    const workbook = XLSX.utils.book_new();
    // El nombre de la hoja no puede exceder 31 caracteres ni tener ciertos caracteres especiales
    const safeSheetName = mechanic.replace(/[\\/*?:\[\]]/g, "").substring(0, 31) || "Reporte Mecanico";
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

    const safeFileName = mechanic.replace(/[^a-zA-Z0-9_\-]/g, "_");
    XLSX.writeFile(workbook, `Reporte_Mecanico_${safeFileName}.xlsx`);
}

function exportReportToExcel() {
    const startDateVal = document.getElementById("report-start-date").value;
    const endDateVal = document.getElementById("report-end-date").value;

    let filtered = state.orders.filter(o => o.status === "Resuelto");

    if (startDateVal) {
        const start = parseLocalDate(startDateVal, false);
        filtered = filtered.filter(o => new Date(o.resolvedAt) >= start);
    }
    if (endDateVal) {
        const end = parseLocalDate(endDateVal, true);
        filtered = filtered.filter(o => new Date(o.resolvedAt) <= end);
    }

    // Map data to clean excel format JSON
    const dataForExcel = filtered.map(o => {
        const machine = state.machinery.find(m => m.id === o.machineId) || { name: "Maquinaria Desconocida", area: "N/A" };
        return {
            "ID Orden": o.id,
            "Código Máquina": o.machineId,
            "Nombre Máquina": machine.name,
            "Área Planta": machine.area,
            "Criticidad": o.priority,
            "Defecto Reportado": o.description,
            "Mecánico Asignado": o.mechanic,
            "Fecha Creación": new Date(o.createdAt).toLocaleString("es-MX"),
            "Fecha Resolución": new Date(o.resolvedAt).toLocaleString("es-MX"),
            "Horas de Inactividad": calculateDiffHours(o.createdAt, o.resolvedAt),
            "Observaciones Finales": o.observations || "",
            "Piezas Cambiadas": o.usedParts && o.usedParts.length > 0 ? o.usedParts.map(p => `${p.name} (${p.partNumber}) x${p.qty}`).join(", ") : "Ninguna",
            "Costo Total Piezas (LPS)": o.usedParts && o.usedParts.length > 0 ? o.usedParts.reduce((sum, p) => sum + ((p.unitPrice || 0) * p.qty), 0) : 0
        };
    });

    if (dataForExcel.length === 0) {
        alert("No hay registros en el rango actual para exportar.");
        return;
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    
    // Style column widths for clean export
    const wscols = [
        {wch: 12}, // ID
        {wch: 16}, // Codigo
        {wch: 28}, // Nombre
        {wch: 14}, // Area
        {wch: 12}, // Criticidad
        {wch: 45}, // Defecto
        {wch: 20}, // Mecánico
        {wch: 22}, // Creación
        {wch: 22}, // Resolución
        {wch: 18}, // Horas
        {wch: 45}, // Observaciones
        {wch: 45}, // Piezas Cambiadas
        {wch: 20}  // Costo Total Piezas
    ];
    worksheet["!cols"] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Casos Cerrados Mecánica");

    // File name format with dates
    let filename = "Reporte_Monzini_Mecanica";
    if (startDateVal) filename += `_Desde_${startDateVal}`;
    if (endDateVal) filename += `_Hasta_${endDateVal}`;
    filename += ".xlsx";

    XLSX.writeFile(workbook, filename);
}

// --- SPA NAVIGATION SYSTEM ---
function navigateToPage(pageId) {
    // Stop camera if leaving scanner page
    if (pageId !== "scanner") {
        stopScanning();
    }

    // Render imediato con datos locales
    renderPageContent(pageId);

    // Si estamos en la nube, actualizar en segundo plano para ver cambios de otros dispositivos
    if (CONFIG_DATABASE_URL) {
        loadStateFromCloud().then(() => {
            if (pageId === "scanner") {
                populateWorkOrders(); // Solo actualizar el selector simulado, sin recargar cámara
            } else {
                renderPageContent(pageId); // Re-renderizar de forma segura
            }
        });
    }
}

function renderPageContent(pageId) {
    // Remove active state from all navs
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        if (item.getAttribute("data-page") === pageId) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Hide/show page sections
    const sections = document.querySelectorAll(".page-section");
    sections.forEach(sec => {
        if (sec.id === `page-${pageId}`) {
            sec.classList.add("active");
        } else {
            sec.classList.remove("active");
        }
    });

    // Run view hooks
    updateHeaderTitle(pageId);

    if (pageId === "dashboard") {
        populateDashboard();
    } else if (pageId === "machinery") {
        populateAreaFilterOptions();
        populateMachinery();
    } else if (pageId === "parts") {
        populateParts();
    } else if (pageId === "orders") {
        populateWorkOrders();
    } else if (pageId === "scanner") {
        initCameraScanner();
        populateWorkOrders();
    } else if (pageId === "reports") {
        checkReportsLock();
    }
}

function checkReportsLock() {
    const lockScreen = document.getElementById("reports-lock-screen");
    const reportsDashboard = document.getElementById("reports-dashboard");

    if (state.unlockedReports) {
        lockScreen.style.display = "none";
        reportsDashboard.style.display = "block";
        generateReportTable();
        populateMachineReportSelect();
    } else {
        lockScreen.style.display = "flex";
        reportsDashboard.style.display = "none";
        document.getElementById("pin-digit-input").value = "";
        document.getElementById("pin-error-msg").style.display = "none";
    }

    // Reinicia el panel del reporte por mecánico cada vez que se entra a la sección
    document.getElementById("report-mechanic-select").value = "";
    document.getElementById("mechanic-report-stats").style.display = "none";
    document.getElementById("mechanic-report-table-wrapper").style.display = "none";
}

// --- EVENT LISTENERS & INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 0. Iniciar sesión anónima en Firebase (necesario para que las reglas
    //    "auth != null" permitan leer/escribir en Realtime Database).
    initFirebaseAuth();

    // 0. Mobile menu (hamburger) toggle
    const sidebarEl = document.getElementById("app-sidebar");
    const sidebarOverlayEl = document.getElementById("sidebar-overlay");
    const mobileMenuBtn = document.getElementById("btn-mobile-menu");

    function openMobileMenu() {
        sidebarEl.classList.add("is-open");
        sidebarOverlayEl.classList.add("is-visible");
    }
    function closeMobileMenu() {
        sidebarEl.classList.remove("is-open");
        sidebarOverlayEl.classList.remove("is-visible");
    }
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", () => {
            if (sidebarEl.classList.contains("is-open")) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    if (sidebarOverlayEl) {
        sidebarOverlayEl.addEventListener("click", closeMobileMenu);
    }

    // 1. Sidebar Nav click handlers
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const page = item.getAttribute("data-page");
            navigateToPage(page);
            closeMobileMenu(); // Cerrar el menú al elegir una sección (en móvil)
        });
    });

    // 2. Global Actions
    document.getElementById("quick-alert-btn").addEventListener("click", () => {
        navigateToPage("orders");
    });

    // Set header date
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    document.getElementById("header-date").textContent = new Date().toLocaleDateString('es-MX', options);

    // 3. Machinery catalog search / filter
    document.getElementById("machine-search-input").addEventListener("input", (e) => {
        const area = document.getElementById("machine-filter-area").value;
        populateMachinery(e.target.value, area);
    });

    document.getElementById("machine-filter-area").addEventListener("change", (e) => {
        const query = document.getElementById("machine-search-input").value;
        populateMachinery(query, e.target.value);
    });

    // 4. Modal machine catalog open/close
    document.getElementById("open-add-machine-btn").addEventListener("click", () => {
        resetMachineModalToAddMode();
        openModal("add-machine-modal");
    });
    
    const closeMachineModal = () => {
        closeModal("add-machine-modal");
        resetMachineModalToAddMode();
    };
    document.getElementById("btn-close-machine-modal").addEventListener("click", closeMachineModal);
    document.getElementById("btn-cancel-machine-modal").addEventListener("click", closeMachineModal);

    // 4b. Parts catalog modal open/close
    document.getElementById("open-add-part-btn").addEventListener("click", () => {
        resetPartModalToAddMode();
        document.getElementById("add-part-form").reset();
        openModal("add-part-modal");
    });

    const closePartModal = () => {
        closeModal("add-part-modal");
        resetPartModalToAddMode();
    };
    document.getElementById("btn-close-part-modal").addEventListener("click", closePartModal);
    document.getElementById("btn-cancel-part-modal").addEventListener("click", closePartModal);

    // Parts search
    document.getElementById("parts-search-input").addEventListener("input", (e) => {
        populateParts(e.target.value);
    });

    // Add / Edit part form
    document.getElementById("add-part-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const originalId = document.getElementById("edit-part-original-id").value;
        const nameVal = document.getElementById("new-part-name").value.trim();
        const partNumVal = document.getElementById("new-part-number").value.trim().toUpperCase();
        const priceVal = parseFloat(document.getElementById("new-part-price").value) || 0;
        const stockVal = parseInt(document.getElementById("new-part-stock").value, 10) || 0;
        const descVal = document.getElementById("new-part-description").value.trim();

        if (!state.parts) state.parts = [];

        if (originalId) {
            // --- MODO EDICIÓN ---
            const part = state.parts.find(p => p.id === originalId);
            if (!part) { alert("Error: no se encontró la pieza a editar."); return; }
            part.name = nameVal;
            part.partNumber = partNumVal;
            part.price = priceVal;
            part.stock = stockVal;
            part.description = descVal;
            saveParts();
            closeModal("add-part-modal");
            resetPartModalToAddMode();
            e.target.reset();
            populateParts(document.getElementById("parts-search-input").value);
            return;
        }

        // --- MODO AGREGAR ---
        const newPart = {
            id: `part-${Date.now()}`,
            name: nameVal,
            partNumber: partNumVal,
            price: priceVal,
            stock: stockVal,
            description: descVal,
            createdAt: new Date().toISOString()
        };
        state.parts.push(newPart);
        saveParts();
        closeModal("add-part-modal");
        e.target.reset();
        populateParts();
    });

    // Add / Edit machinery form (modo determinado por edit-machine-original-id)
    document.getElementById("add-machine-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const originalId = document.getElementById("edit-machine-original-id").value;
        const idVal = document.getElementById("new-machine-id").value.trim().toUpperCase();

        if (originalId) {
            // --- MODO EDICIÓN ---
            const machine = state.machinery.find(m => m.id === originalId);
            if (!machine) {
                alert("Error: no se encontró la máquina a editar.");
                return;
            }
            const updatedName = document.getElementById("new-machine-name").value.trim();
            const updatedArea = document.getElementById("new-machine-area").value;
            const updatedStatus = document.getElementById("new-machine-status").value;
            const updatedBrand = document.getElementById("new-machine-brand").value.trim() || "Genérica";
            const updatedModel = document.getElementById("new-machine-model").value.trim() || "N/A";

            requestBossPinConfirmation(
                `Ingresa el PIN de jefe para guardar los cambios de "${machine.name}" (${machine.id}).`,
                () => {
                    machine.name = updatedName;
                    machine.area = updatedArea;
                    machine.status = updatedStatus;
                    machine.brand = updatedBrand;
                    machine.model = updatedModel;

                    saveMachinery();
                    closeModal("add-machine-modal");
                    resetMachineModalToAddMode();
                    e.target.reset();
                    populateAreaFilterOptions();
                    populateMachinery();
                }
            );
            return;
        }

        // --- MODO AGREGAR ---
        // Validate duplication
        if (state.machinery.some(m => m.id === idVal)) {
            alert("Error: Ya existe una maquinaria registrada con ese código QR.");
            return;
        }

        const newMachine = {
            id: idVal,
            name: document.getElementById("new-machine-name").value.trim(),
            area: document.getElementById("new-machine-area").value,
            status: document.getElementById("new-machine-status").value,
            brand: document.getElementById("new-machine-brand").value.trim() || "Genérica",
            model: document.getElementById("new-machine-model").value.trim() || "N/A",
            createdAt: new Date().toISOString()
        };

        requestBossPinConfirmation(
            `Ingresa el PIN de jefe para registrar la máquina "${newMachine.name || newMachine.id}".`,
            () => {
                state.machinery.push(newMachine);
                saveMachinery();
                closeModal("add-machine-modal");
                e.target.reset();

                // Refresh and display machinery
                populateAreaFilterOptions();
                populateMachinery();
            }
        );
    });

    // 5. Work Order creation
    document.getElementById("create-order-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const machineId = document.getElementById("order-machine-id").value;
        const newOrder = {
            id: `WO-${String(state.orders.length + 1).padStart(4, '0')}`,
            machineId: machineId,
            priority: document.getElementById("order-priority").value,
            description: document.getElementById("order-description").value.trim(),
            observations: document.getElementById("order-observations").value.trim(),
            mechanic: document.getElementById("order-mechanic").value,
            status: "Pendiente",
            createdAt: new Date().toISOString(),
            resolvedAt: null,
            usedParts: []
        };

        // Automatically set the machine status to "Fuera de Servicio" if priority is Crítica, or "Mantenimiento" if Alta/Media
        const machine = state.machinery.find(m => m.id === machineId);
        if (machine) {
            if (newOrder.priority === "Crítica") {
                machine.status = "Fuera de Servicio";
            } else if (newOrder.priority === "Alta" || newOrder.priority === "Media") {
                machine.status = "Mantenimiento";
            }
            saveMachinery();
        }

        state.orders.push(newOrder);
        saveOrders();
        e.target.reset();

        alert(`Orden ${newOrder.id} levantada exitosamente.`);
        navigateToPage("dashboard");
    });

    // 6. Camera scanner control
    document.getElementById("start-camera-btn").addEventListener("click", () => {
        const cameraSelect = document.getElementById("camera-source-select");
        const selectedId = cameraSelect ? cameraSelect.value : "";
        if (selectedId) {
            startScanning(selectedId);
        } else {
            // No hay cámara seleccionada todavía: reintentar la detección de dispositivos
            initCameraScanner();
        }
    });
    document.getElementById("stop-camera-btn").addEventListener("click", stopScanning);
    document.getElementById("btn-close-scanner-modal").addEventListener("click", () => closeModal("scanner-success-modal"));
    document.getElementById("btn-scanner-cancel").addEventListener("click", () => closeModal("scanner-success-modal"));

    // 7. Order Action Modal Actions
    document.getElementById("btn-close-modal").addEventListener("click", () => closeModal("observations-modal"));
    document.getElementById("btn-modal-cancel").addEventListener("click", () => closeModal("observations-modal"));
    
    document.getElementById("btn-modal-progress").addEventListener("click", () => {
        const orderId = document.getElementById("modal-order-id").value;
        const obs = document.getElementById("modal-observations-input").value.trim();
        
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            order.status = "En Proceso";
            order.observations = obs;
            saveOrders();
            closeModal("observations-modal");
            populateWorkOrders();
            populateDashboard();
        }
    });

    document.getElementById("btn-modal-resolve").addEventListener("click", () => {
        const orderId = document.getElementById("modal-order-id").value;
        const obs = document.getElementById("modal-observations-input").value.trim();
        
        if (obs === "") {
            alert("Por favor detalle las observaciones finales sobre cómo se resolvió la avería antes de cerrar el caso.");
            return;
        }

        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        // Guardamos las observaciones acumuladas antes de preguntar por el repuesto
        order.observations = obs;
        saveOrders();

        // Preguntamos si se cambió algún repuesto antes de cerrar el caso
        pendingCloseOrderId = orderId;
        closeModal("observations-modal");
        openModal("confirm-part-change-modal");
    });

    // --- FLUJO: ¿CAMBIÓ REPUESTO AL CERRAR ORDEN? ---
    document.getElementById("btn-close-confirm-part-modal").addEventListener("click", () => {
        closeModal("confirm-part-change-modal");
        pendingCloseOrderId = null;
    });

    // No cambió repuesto: se cierra la orden de forma normal
    document.getElementById("btn-part-change-no").addEventListener("click", () => {
        const orderId = pendingCloseOrderId;
        closeModal("confirm-part-change-modal");
        if (orderId) {
            finalizeCloseOrder(orderId, []);
        }
        pendingCloseOrderId = null;
    });

    // Sí cambió repuesto: abrimos el buscador de piezas
    document.getElementById("btn-part-change-yes").addEventListener("click", () => {
        closeModal("confirm-part-change-modal");
        openPartSelectionModal();
    });

    // Cancelar la selección de piezas: regresamos a la orden sin cerrarla
    document.getElementById("btn-cancel-select-parts").addEventListener("click", () => {
        closeModal("select-changed-parts-modal");
        const orderId = pendingCloseOrderId;
        pendingCloseOrderId = null;
        if (orderId) {
            openOrderActions(orderId);
        }
    });
    document.getElementById("btn-close-select-parts-modal").addEventListener("click", () => {
        document.getElementById("btn-cancel-select-parts").click();
    });

    // Buscador de piezas dentro del modal de cierre de orden
    document.getElementById("part-change-search-input").addEventListener("input", (e) => {
        renderPartSearchResults(e.target.value.trim());
    });

    // Confirmar piezas seleccionadas y cerrar la orden descontando inventario
    document.getElementById("btn-accept-select-parts").addEventListener("click", () => {
        const orderId = pendingCloseOrderId;
        if (!orderId) return;

        if (selectedChangedParts.length === 0) {
            alert("Agrega al menos una pieza, o presiona 'Cancelar' y selecciona 'No' si finalmente no hubo cambio de repuesto.");
            return;
        }

        // Validar que ninguna cantidad exceda el stock disponible
        for (const sp of selectedChangedParts) {
            const part = state.parts.find(p => p.id === sp.partId);
            if (!part) continue;
            if (sp.qty > (part.stock || 0)) {
                alert(`La cantidad seleccionada de "${part.name}" (${sp.qty}) excede el stock disponible (${part.stock || 0}).`);
                return;
            }
        }

        // Descontar del inventario del catálogo de piezas
        selectedChangedParts.forEach(sp => {
            const part = state.parts.find(p => p.id === sp.partId);
            if (part) {
                part.stock = Math.max(0, (part.stock || 0) - sp.qty);
            }
        });
        saveParts();

        closeModal("select-changed-parts-modal");
        finalizeCloseOrder(orderId, selectedChangedParts);
        pendingCloseOrderId = null;
    });

    // Save observations without changing status
    document.getElementById("modal-observations-input").addEventListener("change", (e) => {
        const orderId = document.getElementById("modal-order-id").value;
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            order.observations = e.target.value.trim();
            saveOrders();
        }
    });

    // 8. PIN Security Keyboard handlers
    const pinDigitsInput = document.getElementById("pin-digit-input");
    const pinError = document.getElementById("pin-error-msg");

    document.querySelectorAll(".pin-keyboard .btn-kbd[data-val]").forEach(btn => {
        btn.addEventListener("click", () => {
            if (pinDigitsInput.value.length < 4) {
                pinDigitsInput.value += btn.getAttribute("data-val");
            }
        });
    });

    document.getElementById("btn-pin-clear").addEventListener("click", () => {
        pinDigitsInput.value = "";
        pinError.style.display = "none";
    });

    document.getElementById("pin-login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const pin = pinDigitsInput.value;
        if (pin === BOSS_PIN) {
            state.unlockedReports = true;
            pinError.style.display = "none";
            checkReportsLock();
        } else {
            pinError.style.display = "block";
            pinDigitsInput.value = "";
            playScannerBeep(); // Audio feedback of error
        }
    });

    // 8b. PIN de confirmación para cambios de maquinaria (agregar/editar/eliminar)
    const confirmPinInput = document.getElementById("confirm-pin-digit-input");
    const confirmPinError = document.getElementById("confirm-pin-error-msg");

    document.querySelectorAll("#confirm-pin-modal .btn-kbd[data-cval]").forEach(btn => {
        btn.addEventListener("click", () => {
            if (confirmPinInput.value.length < 4) {
                confirmPinInput.value += btn.getAttribute("data-cval");
            }
        });
    });

    document.getElementById("btn-confirm-pin-clear").addEventListener("click", () => {
        confirmPinInput.value = "";
        confirmPinError.style.display = "none";
    });

    document.getElementById("btn-confirm-pin-cancel").addEventListener("click", () => {
        closeConfirmPinModal();
    });

    document.getElementById("confirm-pin-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const pin = confirmPinInput.value;
        if (pin === BOSS_PIN) {
            const callback = pendingPinConfirmCallback;
            closeConfirmPinModal();
            if (typeof callback === "function") callback();
        } else {
            confirmPinError.style.display = "block";
            confirmPinInput.value = "";
            playScannerBeep();
        }
    });

    // Report Actions
    document.getElementById("btn-lock-reports").addEventListener("click", () => {
        state.unlockedReports = false;
        checkReportsLock();
    });

    // Default dates in report: last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById("report-start-date").value = toLocalDateInputValue(thirtyDaysAgo);
    document.getElementById("report-end-date").value = toLocalDateInputValue(today);

    document.getElementById("btn-apply-report-filters").addEventListener("click", generateReportTable);
    document.getElementById("btn-export-excel").addEventListener("click", exportReportToExcel);
    document.getElementById("btn-export-machine-report").addEventListener("click", exportMachinePartsReport);
    document.getElementById("btn-generate-mechanic-report").addEventListener("click", generateMechanicReport);
    document.getElementById("btn-export-mechanic-report").addEventListener("click", exportMechanicReport);
    document.getElementById("report-machine-search-input").addEventListener("input", (e) => {
        // Si el usuario edita el texto después de haber seleccionado una máquina, invalidamos la selección
        document.getElementById("report-machine-select-id").value = "";
        document.getElementById("report-machine-selected-label").textContent = "Ningún equipo seleccionado todavía.";
        renderMachineReportSearchResults(e.target.value);
    });
    document.getElementById("btn-print-report").addEventListener("click", () => {
        window.print();
    });

    // Admin: forzar la sobreescritura de la maquinaria en la nube con el catálogo del Excel
    document.getElementById("btn-resync-machinery-excel").addEventListener("click", async () => {
        const confirmed = confirm(
            "Esto va a REEMPLAZAR la lista de maquinaria guardada en la nube (Firebase) por el catálogo " +
            "completo de 594 máquinas importado del Excel de departamentos.\n\n" +
            "Las órdenes de trabajo existentes NO se borran.\n\n" +
            "¿Deseas continuar?"
        );
        if (!confirmed) return;

        const btn = document.getElementById("btn-resync-machinery-excel");
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="loader" class="animate-spin"></i><span>Sincronizando...</span>`;
        if (window.lucide) window.lucide.createIcons();

        try {
            // Copia fresca del catálogo correcto embebido en el código (proviene del Excel)
            state.machinery = JSON.parse(JSON.stringify(DEFAULT_MACHINERY));
            localStorage.setItem("monzini_machinery", JSON.stringify(state.machinery));
            const result = await syncStateToCloud();

            if (!result || !result.ok) {
                alert(
                    `⚠️ La maquinaria se actualizó SOLO en este navegador, pero NO se pudo subir a la nube.\n\n` +
                    `Motivo: ${result ? result.reason : "desconocido"}\n\n` +
                    `Es probable que las reglas de seguridad de tu Firebase Realtime Database estén bloqueando ` +
                    `la escritura (necesitan permitir "write" público, o requieren autenticación). ` +
                    `Revisa la consola del navegador (F12) para más detalle, o dime el error exacto.`
                );
            } else {
                alert(`✅ Listo: se sincronizaron ${state.machinery.length} máquinas a la nube correctamente.`);
            }
            populateAreaFilterOptions();
            populateMachinery();
            populateDashboard();
        } catch (err) {
            console.error("Error al resincronizar maquinaria:", err);
            alert("Ocurrió un error inesperado al sincronizar. Revisa la consola del navegador (F12) y compárteme el mensaje de error.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            if (window.lucide) window.lucide.createIcons();
        }
    });

    // Hook click on sync status badge for force manual sync
    const syncBadge = document.getElementById("sync-status-badge");
    if (syncBadge) {
        syncBadge.addEventListener("click", forceSync);
    }

    // Initialize Page
    loadStateFromCloud().then(() => {
        navigateToPage("dashboard");
    });
});

// --- FUNCIÓN PARA ELIMINAR MAQUINARIA (ÁMBITO GLOBAL) ---
function deleteMachine(machineId) {
    const machine = state.machinery.find(m => m.id === machineId);
    if (!machine) return;

    requestBossPinConfirmation(
        `Vas a eliminar la máquina "${machine.name}" (${machine.id}). Esta acción no se puede deshacer. Ingresa el PIN de jefe para confirmar.`,
        () => {
            state.machinery = state.machinery.filter(m => m.id !== machineId);
            saveMachinery();

            const currentSearch = document.getElementById("machine-search-input")?.value || "";
            const currentArea = document.getElementById("machine-filter-area")?.value || "all";
            populateMachinery(currentSearch, currentArea);

            if (typeof populateDashboard === "function") {
                populateDashboard();
            }

            // Refresh the dropdown lists in other views too
            populateWorkOrders();
        }
    );
}
// --- FUNCIÓN PARA ELIMINAR PIEZAS (ÁMBITO GLOBAL) ---
function deletePart(partId) {
    if (confirm(`¿Está seguro de que desea eliminar esta pieza del catálogo? Esta acción no se puede deshacer.`)) {
        state.parts = (state.parts || []).filter(p => p.id !== partId);
        saveParts();
        populateParts(document.getElementById("parts-search-input")?.value || "");
    }
}

// --- SCRIPT CORRECTOR DE ARRANQUE IMPREVISTO (MAQUINARIA Y ÓRDENES) ---
(function() {
    // Restaurar caché de localStorage al cargar el archivo de manera síncrona inmediata
    const savedMac = localStorage.getItem("monzini_machinery");
    if (savedMac !== null) {
        state.machinery = JSON.parse(savedMac);
    }
    const savedOrd = localStorage.getItem("monzini_orders");
    if (savedOrd !== null) {
        state.orders = JSON.parse(savedOrd);
    }
})();