import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';

import { auth } from '../../config/firebase';
import { proponerPuntoSeguro } from '../services/puntosService';

// 👇 LISTA DE OPCIONES PREDEFINIDAS 👇
const TIPOS_AYUDA = [
  "Centro de Acopio y Auxilio",
  "Refugio Temporal Comunitario",
  "Bomberos / Centro de Emergencias",
  "Punto de Agua Potable y Víveres",
  "Hospital / Urgencias Médicas",
  "Policía / Seguridad"
];

export default function ProponerPuntoScreen() {
  const router = useRouter();
  
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState(''); // Se llenará con las opciones de TIPOS_AYUDA
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  
  const [latitud, setLatitud] = useState(3.5394); 
  const [longitud, setLongitud] = useState(-76.3036);
  
  const [loading, setLoading] = useState(false);
  const [mapaListo, setMapaListo] = useState(false);
  
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [mostrarTipos, setMostrarTipos] = useState(false); // 👈 Controla el menú desplegable

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setLatitud(location.coords.latitude);
          setLongitud(location.coords.longitude);
        }
      } catch (error) {
        console.log('No se pudo obtener la ubicación exacta, usando predeterminada.');
      } finally {
        setMapaListo(true);
      }
    })();
  }, []);

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${latitud}, ${longitud}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        var marker = L.marker([${latitud}, ${longitud}]).addTo(map);

        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }));
        });
      </script>
    </body>
    </html>
  `;

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.lat && data.lng) {
        setLatitud(data.lat);
        setLongitud(data.lng);
      }
    } catch (error) {
      console.log('Error parseando coordenadas del mapa:', error);
    }
  };

  const handleSubmit = async () => {
    if (!nombre || !tipo || !direccion) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los campos obligatorios (Nombre, Tipo y Dirección).');
      return;
    }

    setLoading(true);
    try {
      await proponerPuntoSeguro({
        nombre: nombre.trim(),
        tipo,
        direccion: direccion.trim(),
        telefono: telefono.trim() || 'No especificado',
        latitud,
        longitud,
        creadoPor: auth.currentUser?.email || 'Usuario desconocido'
      });
      
      setNombre('');
      setTipo('');
      setDireccion('');
      setTelefono('');
      
      Alert.alert(
        '¡Gracias por tu aporte!', 
        'El punto seguro ha sido enviado y está en revisión por un administrador.', 
        [{ 
          text: 'Entendido', 
          onPress: () => router.navigate('/')
        }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la propuesta del punto seguro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Proponer Punto Seguro</Text>
          </View>

          <Text style={styles.description}>
            Ayuda a la comunidad agregando un nuevo lugar de ayuda. Un administrador revisará la propuesta.
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Nombre del lugar *</Text>
            <TextInput style={styles.input} placeholder="Ej. Estación de Bomberos Sur" value={nombre} onChangeText={setNombre} />

            <Text style={styles.label}>Tipo de ayuda *</Text>
            {/* 👇 MENÚ DESPLEGABLE EN LUGAR DEL TEXTINPUT 👇 */}
            <TouchableOpacity 
              style={[styles.input, { justifyContent: 'center' }]} 
              activeOpacity={0.7}
              onPress={() => setMostrarTipos(true)}
            >
              <Text style={{ color: tipo ? '#1E293B' : '#94A3B8', fontSize: 15 }}>
                {tipo || 'Selecciona una opción...'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Dirección *</Text>
            <TextInput style={styles.input} placeholder="Ej. Calle 10 # 5-20" value={direccion} onChangeText={setDireccion} />

            <Text style={styles.label}>Teléfono (Opcional)</Text>
            <TextInput style={styles.input} placeholder="Ej. 602 1234567" keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} />

            <View style={styles.divider} />

            <Text style={styles.label}>Ubicación *</Text>
            
            <TouchableOpacity 
              style={styles.openMapButton} 
              onPress={() => setMostrarMapa(true)}
            >
              <Text style={styles.openMapButtonText}>📍 Ubicar en mapa</Text>
            </TouchableOpacity>
            
            <Text style={styles.coordinatesText}>
              Coordenadas actuales: {latitud.toFixed(4)}, {longitud.toFixed(4)}
            </Text>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Enviar Propuesta</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 👇 MODAL DEL MAPA 👇 */}
      <Modal visible={mostrarMapa} animationType="slide" transparent={false} onRequestClose={() => setMostrarMapa(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Toca para fijar el punto</Text>
          </View>
          <View style={styles.modalMapWrapper}>
            {!mapaListo ? (
              <ActivityIndicator size="large" color="#EF4444" style={{ marginTop: 50 }} />
            ) : (
              <WebView source={{ html: leafletHTML }} style={{ flex: 1 }} onMessage={handleMapMessage} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} />
            )}
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.confirmMapButton} onPress={() => setMostrarMapa(false)}>
              <Text style={styles.confirmMapButtonText}>✅ Confirmar Ubicación</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 👇 MODAL PARA SELECCIONAR EL TIPO DE AYUDA 👇 */}
      <Modal visible={mostrarTipos} animationType="fade" transparent={true} onRequestClose={() => setMostrarTipos(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPressOut={() => setMostrarTipos(false)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Selecciona el tipo de ayuda</Text>
            {TIPOS_AYUDA.map((opcion, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.dropdownOption} 
                onPress={() => {
                  setTipo(opcion);
                  setMostrarTipos(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>{opcion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 15, marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  description: { fontSize: 14, color: '#64748B', marginBottom: 20, lineHeight: 20, textAlign: 'center' },
  formCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 15, height: 48, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  openMapButton: { backgroundColor: '#EFF6FF', paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 8 },
  openMapButtonText: { color: '#2563EB', fontWeight: 'bold', fontSize: 15 },
  coordinatesText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 10 },
  submitButton: { backgroundColor: '#EF4444', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  
  // Estilos del Modal del Mapa
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { padding: 20, backgroundColor: '#FFFFFF', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  modalMapWrapper: { flex: 1 },
  modalFooter: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  confirmMapButton: { backgroundColor: '#10B981', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  confirmMapButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

  // Estilos del Modal de Tipos de Ayuda
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  dropdownContainer: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 16, padding: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 10 },
  dropdownTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 15, textAlign: 'center' },
  dropdownOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownOptionText: { fontSize: 16, color: '#334155', textAlign: 'center' }
});