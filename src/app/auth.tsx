import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../config/firebase";

// Importamos Google Sign-In
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Configura tu Web Client ID de Google Cloud Console (lo sacaremos de tu proyecto de Firebase)
GoogleSignin.configure({
  webClientId:
    "159913418409-hdhi9deulrjto8f4f5bgarc4bpq651es.apps.googleusercontent.com",
});

export default function AuthScreen() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("¡Éxito!", "Cuenta creada correctamente.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error de autenticación", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión con Google
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        throw new Error("No se pudo obtener el token de Google.");
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);

      router.replace("/");
    } catch (error: any) {
      console.log("Error Google Sign-In:", error);
      Alert.alert("Error", "No se pudo iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Punto Seguro 🛡️</Text>
            <Text style={styles.subtitle}>
              {isRegistering
                ? "Crea una cuenta nueva"
                : "Inicia sesión para continuar"}
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tucorreo@email.com"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="********"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.mainButtonText}>
                  {isRegistering ? "Registrarse" : "Iniciar Sesión"}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>O continúa con</Text>
              <View style={styles.line} />
            </View>

            {/* BOTÓN DE GOOGLE */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Text style={styles.googleButtonText}>
                🌐 Iniciar sesión con Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsRegistering(!isRegistering)}
            >
              <Text style={styles.switchButtonText}>
                {isRegistering
                  ? "¿Ya tienes cuenta? Inicia sesión"
                  : "¿No tienes cuenta? Regístrate aquí"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  scrollContent: { padding: 24, justifyContent: "center", flexGrow: 1 },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0B3B70",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 48,
    fontSize: 15,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  mainButton: {
    backgroundColor: "#1677D2",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  mainButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  dividerText: { marginHorizontal: 10, color: "#94A3B8", fontSize: 13 },
  googleButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1 انع",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  googleButtonText: { color: "#0F172A", fontWeight: "600", fontSize: 15 },
  switchButton: { alignItems: "center", marginTop: 10 },
  switchButtonText: { color: "#1677D2", fontWeight: "600", fontSize: 14 },
});
