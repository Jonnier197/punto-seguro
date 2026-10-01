import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase para Punto Seguro
const firebaseConfig = {
  apiKey: "AIzaSyC1432lChyHbAdiALqGxCqkI2neLZfyyrs",
  authDomain: "punto-seguro1.firebaseapp.com",
  projectId: "punto-seguro1",
  storageBucket: "punto-seguro1.firebasestorage.app",
  messagingSenderId: "159913418409",
  appId: "1:159913418409:web:07b2009da20d6abb9d3b8"
};

// Inicializar la App de Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar los servicios que usaremos en la app
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;