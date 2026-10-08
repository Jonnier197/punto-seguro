import { PuntoSeguro } from "../types";

export const PUNTOS_INICIALES: Omit<PuntoSeguro, "id">[] = [
  {
    nombre: "Bomberos / Centro de Emergencias",
    tipo: "Bomberos",
    direccion: "Cali",
    latitud: 3.5394,
    longitud: -76.3036,
    telefono: "119",
    estado: "Disponible 24h",
  },
  {
    nombre: "Punto de Agua Potable y Víveres",
    tipo: "Agua",
    direccion: "Cali",
    latitud: 3.545,
    longitud: -76.298,
    telefono: "",
    estado: "Punto Activo",
  },
  {
    nombre: "Refugio Temporal Comunitario",
    tipo: "Refugio",
    direccion: "Cali",
    latitud: 3.532,
    longitud: -76.31,
    telefono: "",
    estado: "Habilitado",
  },
  {
    nombre: "Hospital / Urgencias Médicas",
    tipo: "Hospital",
    direccion: "Cali",
    latitud: 3.541,
    longitud: -76.289,
    telefono: "125",
    estado: "Atención 24h",
  },
  {
    nombre: "Centro de Acopio y Auxilio",
    tipo: "Refugio",
    direccion: "Cali",
    latitud: 3.65,
    longitud: -76.5,
    telefono: "",
    estado: "Punto Apoyo",
  },
];

export const CENTRO_MAPA: [number, number] = [3.5394, -76.3036];
export const ZOOM_MAPA = 13;
