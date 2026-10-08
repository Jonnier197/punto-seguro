import { Tabs, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../config/firebase'; // ajusta si tu config está en otra ruta

export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  // Evita que el efecto de redirección se dispare más de una vez
  const yaRedirigio = useRef(false);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (userState) => {
      setUser(userState);
      setInitializing(false);
    });
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup && !yaRedirigio.current) {
      yaRedirigio.current = true;
      router.replace('/auth');
    } else if (user && inAuthGroup && !yaRedirigio.current) {
      yaRedirigio.current = true;
      router.replace('/');
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0F172A',
        }}
      >
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={{ marginTop: 15, color: '#FFFFFF', fontSize: 16 }}>
          Cargando...
        </Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />

      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗺️</Text>,
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />

      <Tabs.Screen name="auth" options={{ href: null }} />
    </Tabs>
  );
}