import { Tabs, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';

import { auth } from '../../config/firebase';

export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  // Verificar el estado de autenticación
  useEffect(() => {
    const subscriber = onAuthStateChanged(
      auth,
      (userState) => {
        setUser(userState);
        setInitializing(false);
      }
    );

    // Cancelar el listener cuando se desmonte
    return subscriber;
  }, []);

  // Proteger las rutas
  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Si no está autenticado, enviarlo al login
      router.replace('/auth');
    } else if (user && inAuthGroup) {
      // Si ya está autenticado, enviarlo al inicio
      router.replace('/');
    }
  }, [user, initializing, segments]);

  // Pantalla de carga mientras Firebase verifica la sesión
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
        <ActivityIndicator
          size="large"
          color="#EF4444"
        />

        <Text
          style={{
            marginTop: 15,
            color: '#FFFFFF',
            fontSize: 16,
          }}
        >
          Cargando...
        </Text>
      </View>
    );
  }

  // Navegación principal
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
      {/* Inicio */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: () => (
            <Text style={{ fontSize: 20 }}>
              🏠
            </Text>
          ),
        }}
      />

      {/* Mapa */}
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: () => (
            <Text style={{ fontSize: 20 }}>
              🗺️
            </Text>
          ),
        }}
      />

      {/* Perfil */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: () => (
            <Text style={{ fontSize: 20 }}>
              👤
            </Text>
          ),
        }}
      />

      {/* Ruta de autenticación */}
      <Tabs.Screen
        name="auth"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
