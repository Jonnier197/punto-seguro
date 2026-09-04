import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, LogBox } from 'react-native';
import * as Location from 'expo-location';

// Ignorar advertencias flotantes
LogBox.ignoreAllLogs();

// Base de datos de puntos de auxilio con coordenadas reales de la región
const PUNTOS_BASE = [
  { id: '1', nombre: 'Bomberos / Centro de Emergencias', lat: 3.5394, lng: -76.3036, tipo: '🚨', estado: 'Disponible 24h' },
  { id: '2', nombre: 'Punto de Agua Potable y Víveres', lat: 3.5450, lng: -76.2980, tipo: '💧', estado: 'Punto Activo' },
  { id: '3', nombre: 'Refugio Temporal Comunitario', lat: 3.5320, lng: -76.3100, tipo: '🏠', estado: 'Habilitado' },
  { id: '4', nombre: 'Hospital / Urgencias Médicas', lat: 3.5410, lng: -76.2890, tipo: '🏥', estado: 'Atención 24h' },
  { id: '5', nombre: 'Centro de Acopio y Auxilio', lat: 3.6500, lng: -76.5000, tipo: '📦', estado: 'Punto Apoyo' },
];

// Función para calcular la distancia en km entre dos coordenadas (Fórmula Haversine)
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // Retorna la distancia con 1 decimal
}

export default function Index() {
  const [busqueda, setBusqueda] = useState('');
  const [puntosProcesados, setPuntosProcesados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        let userLat = 3.5394;
        let userLng = -76.3036;

        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          userLat = location.coords.latitude;
          userLng = location.coords.longitude;
        }

        // Calcular la distancia de cada punto con respecto a tu ubicación actual
        const listaCalculada = PUNTOS_BASE.map(punto => {
          const dist = calcularDistancia(userLat, userLng, punto.lat, punto.lng);
          return { ...punto, distanciaVal: parseFloat(dist), distanciaText: `${dist} km` };
        });

        // Ordenar de menor a mayor distancia
        listaCalculada.sort((a, b) => a.distanciaVal - b.distanciaVal);

        setPuntosProcesados(listaCalculada);
      } catch (error) {
        console.log('Error calculando distancias:', error);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const puntosFiltrados = puntosProcesados.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ENCABEZADO Y USUARIO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, Joni! 👋</Text>
          <Text style={styles.appName}>PUNTO SEGURO</Text>
        </View>
        <TouchableOpacity style={styles.profileBadge}>
          <Text style={{ fontSize: 20 }}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="🔍 Buscar ayuda... (Ej. Agua, Bomberos)" 
          placeholderTextColor="#94A3B8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* CATEGORÍAS RÁPIDAS */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categorías de Emergencia</Text>
        <View style={styles.categoriesRow}>
          <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={{ fontSize: 22 }}>🚨</Text>
            <Text style={[styles.categoryText, { color: '#991B1B' }]}>Auxilio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#E0F2FE' }]}>
            <Text style={{ fontSize: 22 }}>💧</Text>
            <Text style={[styles.categoryText, { color: '#075985' }]}>Agua</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ fontSize: 22 }}>🏠</Text>
            <Text style={[styles.categoryText, { color: '#92400E' }]}>Refugio</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA DE PUNTOS CERCANOS EN TIEMPO REAL */}
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
              <View style={styles.listItem}>
                <View style={styles.iconContainer}>
                  <Text style={{ fontSize: 26 }}>{item.tipo}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.nombre}</Text>
                  <Text style={styles.itemSubtitle}>📍 a {item.distanciaText} • {item.estado}</Text>
                </View>
                <TouchableOpacity style={styles.navButton}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>➔</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  greeting: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  profileBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchInput: { backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 14, elevation: 1 },
  categoriesContainer: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  categoriesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryCard: { width: '31%', paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  categoryText: { fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 16, marginBottom: 10, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  itemSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  navButton: { backgroundColor: '#007AFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});