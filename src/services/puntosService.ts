import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";

import { db } from "../../config/firebase";
import { PUNTOS_INICIALES } from "../constants/puntosIniciales";
import { PuntoSeguro } from "../types";

const COLECCION = "puntos_seguros";

export const fetchPuntosSeguros = async (): Promise<PuntoSeguro[]> => {
  const snapshot = await getDocs(collection(db, COLECCION));
  const lista: PuntoSeguro[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data() as PuntoSeguro;
    if (!data.estado || data.estado === 'aprobado') {
      lista.push({ id: doc.id, ...data });
    }
  });
  return lista;
};

export const fetchPuntosPendientes = async (): Promise<PuntoSeguro[]> => {
  const q = query(collection(db, COLECCION), where("estado", "==", "pendiente"));
  const snapshot = await getDocs(q);
  const lista: PuntoSeguro[] = [];
  snapshot.forEach((doc) => {
    lista.push({ id: doc.id, ...doc.data() } as PuntoSeguro);
  });
  return lista;
};

export const fetchMisPuntosPendientes = async (email: string): Promise<PuntoSeguro[]> => {
  const q = query(collection(db, COLECCION), where("creadoPor", "==", email));
  const snapshot = await getDocs(q);
  
  const lista: PuntoSeguro[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data() as PuntoSeguro;
    if (data.estado === 'pendiente') {
      lista.push({ id: doc.id, ...data });
    }
  });
  
  return lista;
};

export const proponerPuntoSeguro = async (punto: Omit<PuntoSeguro, 'id'>): Promise<void> => {
  await addDoc(collection(db, COLECCION), {
    ...punto,
    estado: 'pendiente'
  });
};

export const actualizarEstadoPunto = async (id: string, estado: 'aprobado' | 'rechazado'): Promise<void> => {
  const ref = doc(db, COLECCION, id);
  await updateDoc(ref, { estado });
};

export const eliminarPuntoSeguro = async (id: string): Promise<void> => {
  const ref = doc(db, COLECCION, id);
  await deleteDoc(ref);
};

export const crearPuntosAutomaticos = async (): Promise<void> => {
  for (const punto of PUNTOS_INICIALES) {
    await addDoc(collection(db, COLECCION), { ...punto, estado: 'aprobado' });
  }
};

export const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};