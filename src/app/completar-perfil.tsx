import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../../config/firebase";

import {
  CampoConfig,
  SECCIONES_PERFIL,
} from "../components/config/perfilSections";
import CampoPerfil from "../components/perfil/CampoPerfil";
import { COLORS } from "../components/theme/colors";
import {
  UserData,
  actualizarPerfilUsuario,
  obtenerPerfilUsuario,
  tieneValor,
} from "../services/userService";

export default function CompletarPerfilScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<Partial<UserData>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Precarga lo que ya exista en Firestore y, si no hay nombre, el de Google
  useEffect(() => {
    (async () => {
      try {
        const perfil = await obtenerPerfilUsuario();
        const inicial: Partial<UserData> = {};
        SECCIONES_PERFIL.forEach((seccion) =>
          seccion.campos.forEach((campo) => {
            const valor = perfil?.[campo.key];
            if (tieneValor(valor)) inicial[campo.key] = valor as any;
          }),
        );
        if (!inicial.nombre && auth.currentUser?.displayName) {
          inicial.nombre = auth.currentUser.displayName;
        }
        setForm(inicial);
      } catch (e) {
        console.log("Error cargando perfil:", e);
        setForm({ nombre: auth.currentUser?.displayName || "" });
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const handleChange = (key: keyof UserData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGuardar = async () => {
    const faltantes: CampoConfig[] = SECCIONES_PERFIL.flatMap((s) =>
      s.campos.filter((c) => c.obligatorio && !tieneValor(form[c.key])),
    );
    if (faltantes.length > 0) {
      Alert.alert(
        "Faltan datos",
        `Completa: ${faltantes.map((c) => c.label).join(", ")}.`,
      );
      return;
    }

    setGuardando(true);
    try {
      const user = auth.currentUser;
      const datos: Partial<UserData> = { ...form };
      Object.keys(datos).forEach((k) => {
        const key = k as keyof UserData;
        if (typeof datos[key] === "string") {
          (datos as any)[key] = (datos[key] as string).trim();
        }
      });
      if (user?.email) datos.email = user.email;

      const perfilActual = await obtenerPerfilUsuario();
      if (!perfilActual?.fotoUrl && user?.photoURL) {
        datos.fotoUrl = user.photoURL;
      }

      // Al guardar, _layout.tsx detecta el perfil completo y abre "Inicio"
      await actualizarPerfilUsuario(datos);
    } catch (e) {
      console.log("Error guardando perfil:", e);
      Alert.alert("Error", "No se pudo guardar tu información. Intenta de nuevo.");
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Completa tu perfil 🛡️</Text>
            <Text style={styles.subtitle}>
              Esta información puede salvar tu vida en una emergencia. Los
              campos con * son obligatorios.
            </Text>
          </View>

          {SECCIONES_PERFIL.map((seccion) => (
            <View key={seccion.id} style={styles.card}>
              <Text style={styles.cardTitle}>{seccion.titulo}</Text>
              {seccion.campos.map((campo) => (
                <CampoPerfil
                  key={campo.key}
                  campo={campo}
                  value={(form[campo.key] as string) || ""}
                  onChange={(value) => handleChange(campo.key, value)}
                  disabled={guardando}
                  mostrarObligatorio
                />
              ))}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, guardando && { opacity: 0.6 }]}
            onPress={handleGuardar}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar y continuar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centrado: { justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20, marginTop: 10 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textTitle,
    marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textTitle,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 5,
  },
  saveButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
