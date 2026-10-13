import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Importamos la persistencia especial para React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

// Configuración de Firebase para Punto Seguro
const firebaseConfig = {
  apiKey: "AIzaSyC1432lChyHbAdiALqGxCqkI2neLZfyyrs",
  authDomain: "punto-seguro1.firebaseapp.com",
  projectId: "punto-seguro1",
  storageBucket: "punto-seguro1.firebasestorage.app",
  messagingSenderId: "159913418409",
  appId: "1:159913418409:web:07b2009da20d6abb9d3b8"
};

const app = initializeApp(firebaseConfig);

// Inicializamos la autenticación forzando a que se guarde en el celular
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
