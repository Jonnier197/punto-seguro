import { UserData } from "../../services/userService";

export interface CampoConfig {
  key: keyof UserData;
  label: string;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  autoCapitalize?: "none" | "words" | "sentences";
  type?: "text" | "date";
}

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
      },
      { key: "documento", label: "Documento", keyboardType: "numeric" },
      { key: "telefono", label: "Teléfono", keyboardType: "phone-pad" },
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
      },
      {
        key: "telefonoEmergencia",
        label: "Línea directa",
        keyboardType: "phone-pad",
      },
    ],
  },
  {
    id: "medica",
    titulo: "⚠️ Información Médica Clave",
    campos: [
      { key: "tipoSangre", label: "Tipo de sangre", placeholder: "Ej. O+" },
      { key: "alergias", label: "Alergias", placeholder: "Ej. Penicilina" },
      {
        key: "condiciones",
        label: "Condiciones / Medicamentos",
        placeholder: "Ej. Asma",
      },
    ],
  },
];
