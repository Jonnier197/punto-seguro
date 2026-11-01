import { Stack } from "expo-router";
import { User, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { auth } from "../../config/firebase";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (userState) => {
      setUser(userState);
      setInitializing(false);
    });
    return subscriber;
  }, []);

  if (initializing) {
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

  // Rutas protegidas: sin sesión solo existe "auth"; con sesión solo existen
  // las pestañas. expo-router redirige solo, sin router.replace manual
  // (eso causaba el bucle "Maximum update depth exceeded").
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="auth" />
      </Stack.Protected>
    </Stack>
  );
}
