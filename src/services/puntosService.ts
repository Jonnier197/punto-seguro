import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { enviarNotificacionPush } from './notificationService';

export interface PuntoSeguro {
  id?: string;
  nombre: string;
  tipo: string;
  direccion: string;
  telefono?: string;
  latitud: number;
  longitud: number;
  creadoPor: string;
  idUsuarioCreador?: string;
  estado?: 'pendiente' | 'aprobado';
  fechaCreacion?: Date;
}

// 🌍 TRAER TODOS LOS PUNTOS APROBADOS (PARA EL MAPA)
export const fetchPuntosSeguros = async (): Promise<PuntoSeguro[]> => {
  try {
    const q = query(collection(db, 'puntos_seguros'), where('estado', '==', 'aprobado'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PuntoSeguro));
  } catch (error) {
    console.error("Error obteniendo puntos seguros:", error);
    return [];
  }
};

// 👤 TRAER MIS PUNTOS PENDIENTES (PARA LA PANTALLA "MIS PUNTOS")
export const fetchMisPuntosPendientes = async (email: string): Promise<PuntoSeguro[]> => {
  try {
    const q = query(
      collection(db, 'puntos_seguros'), 
      where('creadoPor', '==', email),
      where('estado', '==', 'pendiente')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PuntoSeguro));
  } catch (error) {
    console.error("Error obteniendo mis puntos:", error);
    return [];
  }
};

// 📏 CALCULAR DISTANCIA ENTRE DOS COORDENADAS (EN KM)
export const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

// 🔔 NOTIFICAR A TODOS LOS ADMINISTRADORES
export const notificarAdministradores = async (titulo: string, mensaje: string) => {
  try {
    const adminsQuery = query(collection(db, 'users'), where('rol', '==', 'admin'));
    const querySnapshot = await getDocs(adminsQuery);

    const envios = querySnapshot.docs.map(async (documento) => {
      const adminData = documento.data();
      if (adminData.expoPushToken) {
        await enviarNotificacionPush(adminData.expoPushToken, titulo, mensaje);
      }
    });

    await Promise.all(envios);
  } catch (error) {
    console.error('Error notificando a administradores:', error);
  }
};

// 🔔 NOTIFICAR A UN USUARIO ESPECÍFICO (POR UID O EMAIL)
export const notificarUsuario = async (identificador: string, titulo: string, mensaje: string) => {
  try {
    let tokenTarget: string | null = null;

    // Buscar primero por UID
    const userDocRef = doc(db, 'users', identificador);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists() && userSnap.data().expoPushToken) {
      tokenTarget = userSnap.data().expoPushToken;
    } else {
      // Buscar por email si no lo encuentra por ID
      const userQuery = query(collection(db, 'users'), where('email', '==', identificador));
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.expoPushToken) {
          tokenTarget = userData.expoPushToken;
        }
      }
    }

    if (tokenTarget) {
      await enviarNotificacionPush(tokenTarget, titulo, mensaje);
    }
  } catch (error) {
    console.error('Error notificando a usuario:', error);
  }
};

// 📌 PROPONER NUEVO PUNTO SEGURO (USUARIO)
export const proponerPuntoSeguro = async (punto: PuntoSeguro) => {
  const uidActual = auth.currentUser?.uid;
  const emailActual = auth.currentUser?.email || 'Usuario desconocido';

  const nuevoPunto = {
    ...punto,
    estado: 'pendiente',
    creadoPor: emailActual,
    idUsuarioCreador: uidActual || emailActual,
    fechaCreacion: new Date()
  };

  const docRef = await addDoc(collection(db, 'puntos_seguros'), nuevoPunto);
  return docRef.id;
};

// ✅ APROBAR PUNTO SEGURO (ADMINISTRADOR)
export const aprobarPuntoSeguro = async (idPunto: string) => {
  const puntoRef = doc(db, 'puntos_seguros', idPunto);
  const puntoSnap = await getDoc(puntoRef);

  if (!puntoSnap.exists()) return;

  const puntoData = puntoSnap.data();
  const nombrePunto = puntoData.nombre || 'Punto Seguro';
  const idCreador = puntoData.idUsuarioCreador || puntoData.creadoPor;

  await updateDoc(puntoRef, { estado: 'aprobado' });

  if (idCreador) {
    await notificarUsuario(
      idCreador,
      '🎉 ¡Tu propuesta fue aprobada!',
      `Tu punto seguro "${nombrePunto}" ya es visible para toda la comunidad.`
    );
  }
};

// 🗑️ ELIMINAR PUNTO SEGURO (ADMIN O USUARIO)
export const eliminarPuntoSeguro = async (idPunto: string, esAdmin: boolean = false) => {
  const puntoRef = doc(db, 'puntos_seguros', idPunto);
  const puntoSnap = await getDoc(puntoRef);

  if (!puntoSnap.exists()) return;

  const puntoData = puntoSnap.data();
  const nombrePunto = puntoData.nombre || 'Punto Seguro';
  const idCreador = puntoData.idUsuarioCreador || puntoData.creadoPor;

  await deleteDoc(puntoRef);

  if (esAdmin) {
    if (idCreador) {
      await notificarUsuario(
        idCreador,
        '🗑️ Punto Seguro Removido',
        `Un administrador ha eliminado el punto seguro "${nombrePunto}".`
      );
    }
  } else {
    await notificarAdministradores(
      '🗑️ Propuesta Retirada',
      `Un usuario ha retirado la propuesta del punto seguro "${nombrePunto}".`
    );
  }
};