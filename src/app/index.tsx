import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LogBox,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import { calcularDistancia, fetchPuntosSeguros } from '../services/puntosService';
import { styles } from '../styles/indexStyles';
import { PuntoSeguro } from '../types';
import { getEmojiTipo } from '../utils/emojis';

LogBox.ignoreAllLogs();

type PuntoConDistancia = PuntoSeguro & {
  distanciaVal: number;
  distanciaText: string;
};

export default function Index() {
  const router = useRouter();

  const [busqueda, setBusqueda] = useState('');
  const [puntos, setPuntos] = useState<PuntoConDistancia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');

  // Cargar puntos + ubicación (una vez)
  useEffect(() => {
    (async () => {
      try {
        let userLat = 3.5394;
        let userLng = -76.3036;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          userLat = location.coords.latitude;
          userLng = location.coords.longitude;
        }

        const lista = await fetchPuntosSeguros();

        const calculada: PuntoConDistancia[] = lista
          .map((p) => {
            const d = calcularDistancia(userLat, userLng, p.latitud, p.longitud);
            return { ...p, distanciaVal: d, distanciaText: `${d} km` };
          })
          .sort((a, b) => a.distanciaVal - b.distanciaVal);

        setPuntos(calculada);
      } catch (error) {
        console.log('Error cargando puntos:', error);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  // Cargar el nombre cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const nombre = await AsyncStorage.getItem('nombreUsuario');
        if (nombre) {
          // Solo el primer nombre (opcional)
          setNombreUsuario(nombre.split(' ')[0]);
        } else {
          setNombreUsuario('Usuario');
        }
      })();
    }, [])
  );

  const puntosFiltrados = puntos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const irAlMapa = (punto: PuntoConDistancia) => {
    router.push({
      pathname: '/mapa',
      params: {
        focusId: punto.id,
        lat: punto.latitud.toString(),
        lng: punto.longitud.toString(),
        ts: Date.now().toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {nombreUsuario}! 👋</Text>
          <Text style={styles.appName}>PUNTO SEGURO</Text>
        </View>
        <TouchableOpacity style={styles.profileBadge}>
          <Text style={{ fontSize: 20 }}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar ayuda... (Ej. Agua, Bomberos)"
          placeholderTextColor="#94A3B8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Puntos Cercanos a tu Ubicación</Text>

        {cargando ? (
          <ActivityIndicator size="small" color="#007AFF" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={puntosFiltrados}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => irAlMapa(item)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Text style={{ fontSize: 26 }}>{getEmojiTipo(item.tipo)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.nombre}</Text>
                  <Text style={styles.itemSubtitle}>
                    📍 a {item.distanciaText} • {item.estado || item.tipo}
                  </Text>
                </View>
                <View style={styles.navButton}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>➔</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

