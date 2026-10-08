import { addDoc, collection, getDocs } from "firebase/firestore";

import { db } from "../../config/firebase";
import { PUNTOS_INICIALES } from "../constants/puntosIniciales";
import { PuntoSeguro } from "../types";

const COLECCION = "puntos_seguros";

export const fetchPuntosSeguros = async (): Promise<PuntoSeguro[]> => {
  const snapshot = await getDocs(collection(db, COLECCION));

  const lista: PuntoSeguro[] = [];
  snapshot.forEach((doc) => {
    lista.push({ id: doc.id, ...doc.data() } as PuntoSeguro);
  });

  return lista;
};

export const crearPuntosAutomaticos = async (): Promise<void> => {
  for (const punto of PUNTOS_INICIALES) {
    await addDoc(collection(db, COLECCION), punto);
  }
};

export const calcularDistancia = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};
