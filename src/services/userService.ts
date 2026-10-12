import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

export interface UserData {
  nombre?: string;
  email?: string;
  tipoSangre?: string;
  fechaNacimiento?: string;
  documento?: string;
  telefono?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  alergias?: string;
  condiciones?: string;
  fotoUrl?: string;          // 👈 Agregado para la foto de perfil
  rol?: 'admin' | 'usuario'; // 👈 Agregado para los roles
}

export async function getNombreUsuario(): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) return "Usuario";

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Si guardas "nombre" completo, puedes tomar solo el primer nombre:
      const nombreCompleto = data.nombre || "Usuario";
      return nombreCompleto.split(" ")[0]; // Solo el primer nombre
    }
    return "Usuario";
  } catch (error) {
    console.log("Error obteniendo nombre:", error);
    return "Usuario";
  }
}

/**
 * Actualiza los datos del usuario actual en Firestore.
 * Solo actualiza los campos enviados (merge).
 */
export async function actualizarPerfilUsuario(
  cambios: Partial<UserData>,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado");

  const ref = doc(db, "users", user.uid);
  await updateDoc(ref, cambios);
}

/**
 * Obtiene los datos del usuario actual desde Firestore.
 */
export async function obtenerPerfilUsuario(): Promise<UserData | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const { getDoc, doc: d } = await import("firebase/firestore");
  const snap = await getDoc(d(db, "users", user.uid));
  return snap.exists() ? (snap.data() as UserData) : null;
}