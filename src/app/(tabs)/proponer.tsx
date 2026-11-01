import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { auth, db } from "../../../config/firebase";
import { enviarNotificacionPush } from "../../services/notificationService";
import { proponerPuntoSeguro } from "../../services/puntosService";

const TIPOS_AYUDA = [
  "Centro de Acopio y Auxilio",
  "Refugio Temporal Comunitario",
  "Bomberos / Centro de Emergencias",
  "Punto de Agua Potable y Víveres",
  "Hospital / Urgencias Médicas",
  "Policía / Seguridad",
];

export default function ProponerPuntoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  const [latitud, setLatitud] = useState(3.5394);
  const [longitud, setLongitud] = useState(-76.3036);

  const [loading, setLoading] = useState(false);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [mapaListo, setMapaListo] = useState(false);

  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [mostrarTipos, setMostrarTipos] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          setLatitud(location.coords.latitude);
          setLongitud(location.coords.longitude);
        }
      } catch (error) {
        console.log(
          "No se pudo obtener la ubicación exacta, usando predeterminada.",
        );
      } finally {
        setMapaListo(true);
      }
    })();
  }, []);

  const buscarDireccionEnMapa = async () => {
    if (!direccion.trim()) {
      Alert.alert("Atención", "Por favor, escribe una dirección primero.");
      return;
    }

    try {
      setBuscandoUbicacion(true);
      const resultados = await Location.geocodeAsync(direccion);

      if (resultados.length > 0) {
        const { latitude, longitude } = resultados[0];
        setLatitud(latitude);
        setLongitud(longitude);

        // Abre automáticamente el mapa para confirmar el pin
        setMostrarMapa(true);
      } else {
        Alert.alert(
          "Sin resultados",
          "No pudimos encontrar esa dirección exacta.",
        );
      }
    } catch (error) {
      console.log("Error de geocodificación:", error);
      Alert.alert("Error", "Hubo un problema procesando la dirección.");
    } finally {
      setBuscandoUbicacion(false);
    }
  };

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
        var map = L.map('map').setView([${latitud}, ${longitud}], 16);
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
      console.log("Error parseando coordenadas del mapa:", error);
    }
  };

  const notificarAdministradores = async (nombreLugar: string) => {
    try {
      const adminsQuery = query(
        collection(db, "users"),
        where("rol", "==", "admin"),
      );
      const querySnapshot = await getDocs(adminsQuery);

      const envios = querySnapshot.docs.map(async (documento) => {
        const adminData = documento.data();
        if (adminData.expoPushToken) {
          await enviarNotificacionPush(
            adminData.expoPushToken,
            "🔔 Nueva Propuesta Pendiente",
            `El usuario ha sugerido el punto "${nombreLugar}". Entra al panel para revisarlo.`,
          );
        }
      });

      await Promise.all(envios);
    } catch (error) {
      console.error("Error notificando a admins:", error);
    }
  };

  const handleSubmit = async () => {
    if (!nombre || !tipo || !direccion) {
      Alert.alert(
        "Campos incompletos",
        "Por favor llena todos los campos obligatorios (Nombre, Tipo y Dirección).",
      );
      return;
    }

    setLoading(true);
    try {
      const uidActual = auth.currentUser?.uid;
      const emailActual = auth.currentUser?.email || "Usuario desconocido";

      await proponerPuntoSeguro({
        nombre: nombre.trim(),
        tipo,
        direccion: direccion.trim(),
        telefono: telefono.trim() || "No especificado",
        latitud,
        longitud,
        creadoPor: emailActual,
        idUsuarioCreador: uidActual || emailActual,
      });

      await notificarAdministradores(nombre.trim());

      setNombre("");
      setTipo("");
      setDireccion("");
      setTelefono("");

      Alert.alert(
        "¡Gracias por tu aporte!",
        "El punto seguro ha sido enviado y está en revisión por un administrador.",
        [
          {
            text: "Entendido",
            onPress: () => router.navigate("/"),
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la propuesta del punto seguro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled={true}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Proponer Punto Seguro</Text>
          </View>

          <Text style={styles.description}>
            Ayuda a la comunidad agregando un nuevo lugar. Un administrador
            revisará la propuesta.
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Nombre del lugar *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Estación de Bomberos Sur"
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.label}>Tipo de ayuda *</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: "center" }]}
              activeOpacity={0.7}
              onPress={() => setMostrarTipos(true)}
            >
              <Text
                style={{ color: tipo ? "#0F172A" : "#94A3B8", fontSize: 15 }}
              >
                {tipo || "Selecciona una opción..."}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Dirección *</Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ej. Carrera 19 #18-68"
                value={direccion}
                onChangeText={setDireccion}
              />
              <TouchableOpacity
                style={styles.searchLocationButton}
                onPress={buscarDireccionEnMapa}
                disabled={buscandoUbicacion}
              >
                {buscandoUbicacion ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                    🔍 Ubicar
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Teléfono (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 602 1234567"
              keyboardType="phone-pad"
              value={telefono}
              onChangeText={setTelefono}
            />

            <View style={styles.divider} />

            <Text style={styles.coordinatesText}>
              Coordenadas seleccionadas: {latitud.toFixed(4)},{" "}
              {longitud.toFixed(4)}
            </Text>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar Propuesta</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={mostrarMapa}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setMostrarMapa(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Toca el mapa para ajustar el pin
            </Text>
          </View>
          <View style={styles.modalMapWrapper}>
            {!mapaListo ? (
              <ActivityIndicator
                size="large"
                color="#1677D2"
                style={{ marginTop: 50 }}
              />
            ) : (
              <WebView
                key={`${latitud}-${longitud}`}
                source={{ html: leafletHTML }}
                style={{ flex: 1 }}
                onMessage={handleMapMessage}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.confirmMapButton}
              onPress={() => setMostrarMapa(false)}
            >
              <Text style={styles.confirmMapButtonText}>
                ✅ Confirmar Ubicación
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={mostrarTipos}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMostrarTipos(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPressOut={() => setMostrarTipos(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>
              Selecciona el tipo de ayuda
            </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 15, marginTop: 10 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0B3B70",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    lineHeight: 20,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0B3B70",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 48,
    fontSize: 15,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 20 },

  searchLocationButton: {
    backgroundColor: "#1677D2",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  coordinatesText: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "500",
  },

  submitButton: {
    backgroundColor: "#1677D2",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },
  submitButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },

  modalContainer: { flex: 1, backgroundColor: "#F1F5F9" },
  modalHeader: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0B3B70" },
  modalMapWrapper: { flex: 1 },
  modalFooter: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  confirmMapButton: {
    backgroundColor: "#1677D2",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmMapButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 59, 112, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0B3B70",
    marginBottom: 15,
    textAlign: "center",
  },
  dropdownOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownOptionText: { fontSize: 16, color: "#0F172A", textAlign: "center" },
});
