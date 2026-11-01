import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1677D2",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
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

      {/* PANTALLAS OCULTAS: se navega a ellas con router.push, pero no
          aparecen en la barra. No usar href: null, porque eso las vuelve
          inaccesibles. */}
      <Tabs.Screen
        name="perfil"
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
