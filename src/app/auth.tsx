import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../../config/firebase";

// Web Client ID (tipo 3) del proyecto de Firebase punto-seguro1
const WEB_CLIENT_ID =
  "159913418409-hdhi9deulrjto8f4f5bgarc4bpq651es.apps.googleusercontent.com";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const response = await GoogleSignin.signIn();

      // El usuario cerró el selector de cuentas
      if (!isSuccessResponse(response)) return;

      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error("Google no devolvió un token de identificación.");
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      // _layout.tsx detecta la sesión y abre "Inicio" automáticamente
      await signInWithCredential(auth, googleCredential);
    } catch (error: any) {
      console.log("Error Google Sign-In:", error);

      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.IN_PROGRESS) return;
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert(
            "Error",
            "Google Play Services no está disponible en este dispositivo.",
          );
          return;
        }
      }

      Alert.alert(
        "Error",
        `No se pudo iniciar sesión con Google.\n(${error?.code ?? error?.message ?? "desconocido"})`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Punto Seguro 🛡️</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <View style={styles.formCard}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0B3B70" />
            ) : (
              <Text style={styles.googleButtonText}>
                🌐 Iniciar sesión con Google
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 24, justifyContent: "center", flexGrow: 1 },
  headerContainer: { alignItems: "center", marginBottom: 30 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0B3B70",
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, color: "#64748B" },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  googleButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  googleButtonText: { color: "#0F172A", fontWeight: "600", fontSize: 15 },
});
