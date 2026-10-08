export interface PuntoSeguro {
  id: string;
  nombre: string;
  tipo: string;
  direccion: string;
  latitud: number;
  longitud: number;
  telefono: string;
  estado?: string;
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
