import { Tabs, useRouter, useSegments } from "expo-router";
import { User, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { auth } from "../../config/firebase";

export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (userState) => {
      setUser(userState);
      setInitializing(false);
    });
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "auth";

    if (!user && !inAuthGroup) {
      router.replace("/auth");
    } else if (user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, initializing, segments]);

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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1677D2",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: "Mapa",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="proponer"
        options={{
          title: "Proponer",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>➕</Text>,
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: "Alertas",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚠️</Text>,
        }}
      />

      {/* PANTALLAS OCULTAS LIMPIAS (Cero funciones vacías que maten la app) */}
      <Tabs.Screen
        name="perfil"
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="auth"
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="admin"
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="mis-puntos"
        options={{ tabBarItemStyle: { display: "none" } }}
      />
    </Tabs>
  );
}
