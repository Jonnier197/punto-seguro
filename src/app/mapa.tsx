import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

export default function MapaScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('Obteniendo tu ubicación...');

  const obtenerUbicacion = async () => {
    setCargando(true);
    try {
      // 1. Verificar/Solicitar permisos de manera explícita
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Por favor concede permisos de ubicación en los ajustes de tu teléfono para ver tu posición en el mapa.'
        );
        setMensaje('Ubicación predeterminada (Sin GPS)');
        // Coordenadas de respaldo (Palmira / Cali)
        setLocation({ latitude: 3.5394, longitude: -76.3036 });
        setCargando(false);
        return;
      }

      // 2. Obtener posición GPS con alta precisión
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setMensaje('Ubicación en tiempo real activa');
    } catch (error) {
      console.log('Error obteniendo ubicación:', error);
      setMensaje('Ubicación predeterminada (Error GPS)');
      setLocation({ latitude: 3.5394, longitude: -76.3036 });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  if (cargando || !location) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Conectando con el GPS...</Text>
      </SafeAreaView>
    );
  }

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
          #map { height: 100%; width: 100%; }
          .user-marker {
            background-color: #EF4444;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var userLat = ${location.latitude};
          var userLng = ${location.longitude};

          var map = L.map('map', { zoomControl: false }).setView([userLat, userLng], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // Marcador de Ubicación del Usuario
          var userIcon = L.divIcon({
            className: 'user-marker',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
            .bindPopup('<b>¡Tú estás aquí!</b><br>Ubicación actual')
            .openPopup();

          // Puntos de auxilio simulados alrededor de tu posición GPS
          L.marker([userLat + 0.003, userLng + 0.002]).addTo(map).bindPopup('<b>💧 Punto Agua Potable</b>');
          L.marker([userLat - 0.002, userLng - 0.003]).addTo(map).bindPopup('<b>🚨 Primeros Auxilios</b>');
          L.marker([userLat + 0.001, userLng - 0.004]).addTo(map).bindPopup('<b>🏠 Refugio Temporal</b>');
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Navegación de Mapa</Text>
        <Text style={styles.subtitle}>{mensaje}</Text>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <WebView 
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.map}
        />

        {/* Botón de Recargar Ubicación */}
        <TouchableOpacity style={styles.recenterButton} onPress={obtenerUbicacion}>
          <Text style={{ fontSize: 20 }}>🎯</Text>
        </TouchableOpacity>

        {/* Filtros flotantes */}
        <View style={styles.floatingFilters}>
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.chipText}>🚨 Auxilio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.chipText}>💧 Agua</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.chipText}>🏠 Refugio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 30 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B', fontSize: 14 },
  header: { alignItems: 'center', paddingVertical: 10, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  recenterButton: { position: 'absolute', bottom: 25, right: 15, backgroundColor: '#FFF', width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  floatingFilters: { position: 'absolute', top: 15, left: 10, right: 10, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, elevation: 3 },
  chipText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});