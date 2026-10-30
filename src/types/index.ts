export type CategoriaOficial =
  | "Centro de Acopio y Auxilio"
  | "Refugio Temporal Comunitario"
  | "Bomberos / Centro de Emergencias"
  | "Punto de Agua Potable y Víveres"
  | "Hospital / Urgencias Médicas"
  | "Policía / Seguridad";

export interface PuntoSeguro {
  id: string;
  nombre: string;
  tipo: CategoriaOficial | string; // Actualizado para incluir las 6 categorías oficiales
  direccion: string;
  latitud: number;
  longitud: number;
  telefono: string;
  estado?: "aprobado" | "pendiente" | "rechazado" | string; // Mejorado
  creadoPor?: string; // Para saber quién lo propuso
}

export interface Sismo {
  id: string;
  magnitud: number;
  lugar: string;
  latitud: number;
  longitud: number;
  profundidad?: number;
  fecha?: string;
}
