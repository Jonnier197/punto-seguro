import { CategoriaOficial } from "../types";

export const CATEGORIAS_OFICIALES: {
  id: CategoriaOficial;
  nombreCorto: string;
  icon: any;
  color: string;
}[] = [
  {
    id: "Centro de Acopio y Auxilio",
    nombreCorto: "Acopio y Auxilio",
    icon: require("../../assets/icons/categories/01_centro_acopio_auxilio.png"),
    color: "#1677D2",
  },
  {
    id: "Refugio Temporal Comunitario",
    nombreCorto: "Refugio",
    icon: require("../../assets/icons/categories/02_refugio_temporal.png"),
    color: "#10B981",
  },
  {
    id: "Bomberos / Centro de Emergencias",
    nombreCorto: "Bomberos / Emergencias",
    icon: require("../../assets/icons/categories/03_bomberos_emergencias.png"),
    color: "#EF4444",
  },
  {
    id: "Punto de Agua Potable y Víveres",
    nombreCorto: "Agua y Víveres",
    icon: require("../../assets/icons/categories/04_agua_potable_viveres.png"),
    color: "#0EA5E9",
  },
  {
    id: "Hospital / Urgencias Médicas",
    nombreCorto: "Atención Médica",
    icon: require("../../assets/icons/categories/05_hospital_urgencias.png"),
    color: "#DC2626",
  },
  {
    id: "Policía / Seguridad",
    nombreCorto: "Policía / Seguridad",
    icon: require("../../assets/icons/categories/06_policia_seguridad.png"),
    color: "#1E40AF",
  },
];

/**
 * Retorna la imagen oficial del kit gráfico según el nombre de la categoría.
 * Soporta coincidencias exactas, versiones cortas y datos antiguos de Firebase.
 */
export const getIconoCategoria = (tipo?: string) => {
  if (!tipo) return CATEGORIAS_OFICIALES[0].icon;

  const tipoNorm = tipo.toLowerCase().trim();

  // 1. Busca coincidencia exacta o contenida en los nombres oficiales
  const encontrada = CATEGORIAS_OFICIALES.find((cat) => {
    const idLower = cat.id.toLowerCase();
    const cortoLower = cat.nombreCorto.toLowerCase();
    return (
      idLower === tipoNorm ||
      cortoLower === tipoNorm ||
      tipoNorm.includes(cortoLower) ||
      idLower.includes(tipoNorm)
    );
  });

  if (encontrada) return encontrada.icon;

  // 2. Mapeo defensivo para palabras clave comunes de registros antiguos
  if (tipoNorm.includes("acopio") || tipoNorm.includes("auxilio")) {
    return CATEGORIAS_OFICIALES[0].icon;
  }
  if (tipoNorm.includes("refugio")) {
    return CATEGORIAS_OFICIALES[1].icon;
  }
  if (tipoNorm.includes("bombero") || tipoNorm.includes("emergencia")) {
    return CATEGORIAS_OFICIALES[2].icon;
  }
  if (
    tipoNorm.includes("agua") ||
    tipoNorm.includes("viveres") ||
    tipoNorm.includes("comida")
  ) {
    return CATEGORIAS_OFICIALES[3].icon;
  }
  if (
    tipoNorm.includes("hospital") ||
    tipoNorm.includes("medica") ||
    tipoNorm.includes("salud")
  ) {
    return CATEGORIAS_OFICIALES[4].icon;
  }
  if (tipoNorm.includes("policia") || tipoNorm.includes("seguridad")) {
    return CATEGORIAS_OFICIALES[5].icon;
  }

  // Fallback por defecto si no coincide ninguna
  return CATEGORIAS_OFICIALES[0].icon;
};
