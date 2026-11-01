import { Stack } from "expo-router";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { auth, db } from "../../config/firebase";
import { UserData, esPerfilCompleto } from "../services/userService";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  // null = todavía no sabemos si el perfil está completo
  const [perfilCompleto, setPerfilCompleto] = useState<boolean | null>(null);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (userState) => {
      setUser(userState);
      setInitializing(false);
    });
    return subscriber;
  }, []);

  // Escucha el documento del usuario: cuando guarda "Completar perfil",
  // esto se actualiza solo y la app pasa a las pestañas.
  const uid = user?.uid;
  useEffect(() => {
    setPerfilCompleto(null);
    if (!uid) return;

    return onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        const data = snap.exists() ? (snap.data() as UserData) : null;
        setPerfilCompleto(esPerfilCompleto(data));
      },
      (error) => {
        // Si Firestore falla no bloqueamos la app
        console.log("Error leyendo perfil:", error);
        setPerfilCompleto(true);
      },
    );
  }, [uid]);

  if (initializing || (user && perfilCompleto === null)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F1F5F9",
        }}
      >
        <ActivityIndicator size="large" color="#1677D2" />
        <Text
          style={{
            marginTop: 15,
            color: "#0B3B70",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          Cargando Punto Seguro...
        </Text>
      </View>
    );
  }

  const isLoggedIn = !!user;

  // Rutas protegidas: sin sesión solo existe "auth"; con sesión pero perfil
  // incompleto solo existe "completar-perfil"; con perfil completo, las
  // pestañas. expo-router redirige solo, sin router.replace manual
  // (eso causaba el bucle "Maximum update depth exceeded").
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn && perfilCompleto === true}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn && perfilCompleto === false}>
        <Stack.Screen name="completar-perfil" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="auth" />
      </Stack.Protected>
    </Stack>
  );
}
