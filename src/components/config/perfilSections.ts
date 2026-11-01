import { UserData } from "../../services/userService";

export interface CampoConfig {
  key: keyof UserData;
  label: string;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  autoCapitalize?: "none" | "words" | "sentences";
  type?: "text" | "date" | "select";
  opciones?: string[]; // solo para type "select"
  obligatorio?: boolean;
}

export const TIPOS_SANGRE = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

export interface SeccionConfig {
  id: string;
  titulo: string;
  campos: CampoConfig[];
}

export const SECCIONES_PERFIL: SeccionConfig[] = [
  {
    id: "personal",
    titulo: "📋 Información Personal",
    campos: [
      { key: "nombre", label: "Nombre completo", autoCapitalize: "words" },
      {
        key: "fechaNacimiento",
        label: "Fecha de nacimiento",
        type: "date",
        placeholder: "Seleccionar fecha",
        obligatorio: true,
      },
      {
        key: "documento",
        label: "Documento",
        keyboardType: "numeric",
        obligatorio: true,
      },
      {
        key: "telefono",
        label: "Teléfono",
        keyboardType: "phone-pad",
        obligatorio: true,
      },
    ],
  },
  {
    id: "emergencia",
    titulo: "📞 Contacto de Emergencia",
    campos: [
      {
        key: "contactoEmergencia",
        label: "Familiar de contacto",
        autoCapitalize: "words",
        obligatorio: true,
      },
      {
        key: "telefonoEmergencia",
        label: "Línea directa",
        keyboardType: "phone-pad",
        obligatorio: true,
      },
    ],
  },
  {
    id: "medica",
    titulo: "⚠️ Información Médica Clave",
    campos: [
      {
        key: "tipoSangre",
        label: "Tipo de sangre",
        type: "select",
        opciones: TIPOS_SANGRE,
        obligatorio: true,
      },
      { key: "alergias", label: "Alergias", placeholder: "Ej. Penicilina" },
      {
        key: "condiciones",
        label: "Condiciones / Medicamentos",
        placeholder: "Ej. Asma",
      },
    ],
  },
];
