import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import {
  AlertaDesastre,
  fetchAlertasGlobales,
} from "../services/alertasService";
import {
  PreferenciasAlertas,
  guardarPreferenciasAlertas,
  obtenerPreferenciasAlertas,
  registrarParaNotificacionesPush,
} from "../services/notificationService";

export default function AlertasScreen() {
  const [alertas, setAlertas] = useState<AlertaDesastre[]>([]);
  const [loading, setLoading] = useState(true);

  const [alertaSeleccionada, setAlertaSeleccionada] =
    useState<AlertaDesastre | null>(null);
  const [mostrarConfig, setMostrarConfig] = useState(false);

  const [preferencias, setPreferencias] = useState<PreferenciasAlertas>({
    notificacionesActivas: true,
    magnitudMinima: 3.0,
    paisFiltro: "",
  });

  const [inputMagnitud, setInputMagnitud] = useState("3.0");
  const [inputPais, setInputPais] = useState("");

  const cargarAlertas = async () => {
    setLoading(true);
    const data = await fetchAlertasGlobales();
    setAlertas(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const prefs = await obtenerPreferenciasAlertas();
        setPreferencias(prefs);
        setInputMagnitud(
          prefs.magnitudMinima ? prefs.magnitudMinima.toString() : "3.0",
        );
        setInputPais(prefs.paisFiltro || "");
        await registrarParaNotificacionesPush();
        await cargarAlertas();
      })();
    }, []),
  );

  const handleGuardarConfiguracion = async () => {
    const mag = parseFloat(inputMagnitud.replace(",", ".")) || 0;
    const pais = inputPais.trim();

    const nuevas: PreferenciasAlertas = {
      ...preferencias,
      magnitudMinima: mag,
      paisFiltro: pais,
    };

    setPreferencias(nuevas);
    await guardarPreferenciasAlertas(nuevas);
    setMostrarConfig(false);
  };

  const handleRestablecerFiltros = async () => {
    setInputMagnitud("3.0");
    setInputPais(""); // Al restablecer, borramos el filtro para que se vea TODO EL MUNDO

    const restablecido: PreferenciasAlertas = {
      ...preferencias,
      magnitudMinima: 3.0,
      paisFiltro: "",
    };

    setPreferencias(restablecido);
    await guardarPreferenciasAlertas(restablecido);
    setMostrarConfig(false);
  };

  // FILTRO ESTRICTO DE TEXTO (Nada de coordenadas)
  const alertasFiltradas = alertas.filter((item) => {
    const cumpleMagnitud = item.magnitud >= preferencias.magnitudMinima;
    const filtroNormalizado = preferencias.paisFiltro.toLowerCase().trim();

    // Si el filtro está vacío, es VERDADERO para todos (Muestra el mundo entero).
    // Si el usuario escribe algo, busca estrictamente que la palabra exista en el título.
    const cumplePais =
      filtroNormalizado === "" ||
      item.titulo.toLowerCase().includes(filtroNormalizado);

    return cumpleMagnitud && cumplePais;
  });

  const tiempoTranscurrido = (fecha: Date) => {
    const ahora = new Date();
    const difMinutos = Math.floor((ahora.getTime() - fecha.getTime()) / 60000);
    if (difMinutos < 60) return `Hace ${difMinutos} min`;
    const difHoras = Math.floor(difMinutos / 60);
    if (difHoras < 24) return `Hace ${difHoras} horas`;
    return `Hace ${Math.floor(difHoras / 24)} días`;
  };

  const getColorMagnitud = (mag: number, tipo: string) => {
    if (tipo === "Huracán/Ciclón") return "#3B82F6";
    if (tipo === "Inundación") return "#0EA5E9";
    if (tipo === "Volcán") return "#D97706";

    if (mag >= 6.0) return "#B91C1C";
    if (mag >= 5.0) return "#EF4444";
    if (mag >= 4.0) return "#F97316";
    if (mag >= 3.0) return "#EAB308";
    return "#10B981"; // Verde para sismos muy leves
  };

  const getEmojiTipo = (tipo: string) => {
    if (tipo === "Huracán/Ciclón") return "🌀";
    if (tipo === "Inundación") return "🌊";
    if (tipo === "Volcán") return "🌋";
    return "⚠️";
  };

  const renderItem = ({ item }: { item: AlertaDesastre }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => setAlertaSeleccionada(item)}
    >
      <View style={styles.cardContent}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.title} numberOfLines={2}>
            {getEmojiTipo(item.tipo)} {item.titulo}
          </Text>
          <Text style={styles.subtitle}>
            📍 {item.latitud.toFixed(2)}, {item.longitud.toFixed(2)}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.timeText}>{tiempoTranscurrido(item.fecha)}</Text>
          <View
            style={[
              styles.magCircle,
              { backgroundColor: getColorMagnitud(item.magnitud, item.tipo) },
            ]}
          >
            <Text style={styles.magText}>{item.magnitud.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getLeafletHTML = (
    lat: number,
    lng: number,
    mag: number,
    tipo: string,
  ) => {
    const radioMult = tipo === "Sismo" ? 15000 : 30000;
    const color = tipo === "Huracán/Ciclón" ? "#3B82F6" : "#f03";
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>body { padding: 0; margin: 0; } html, body, #map { height: 100%; width: 100vw; }</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat}, ${lng}], 6);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          L.circle([${lat}, ${lng}], { color: '${color}', fillColor: '${color}', fillOpacity: 0.5, radius: ${mag * radioMult} }).addTo(map);
          L.marker([${lat}, ${lng}]).addTo(map);
        </script>
      </body>
      </html>
    `;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Alertas Globales</Text>
          <Text style={styles.headerSubtitle}>
            Filtro: {preferencias.paisFiltro || "Mundial"} • ≥{" "}
            {preferencias.magnitudMinima.toFixed(1)} M
          </Text>
        </View>
        <TouchableOpacity
          style={styles.configButton}
          onPress={() => setMostrarConfig(true)}
        >
          <Text style={{ fontSize: 22 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#EF4444"
          style={{ marginTop: 50 }}
        />
      ) : alertasFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sin alertas registradas</Text>
          <Text style={styles.emptySubtext}>
            No hay eventos recientes que coincidan con tus filtros (
            {preferencias.paisFiltro || "Todos"}, ≥{" "}
            {preferencias.magnitudMinima}).
          </Text>
        </View>
      ) : (
        <FlatList
          data={alertasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onRefresh={cargarAlertas}
          refreshing={loading}
        />
      )}

      <Modal visible={mostrarConfig} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.configCard}>
            <Text style={styles.configTitle}>⚙️ Configuración de Alertas</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Notificaciones Push</Text>
                  <Text style={styles.settingSublabel}>
                    Recibir alertas en tiempo real
                  </Text>
                </View>
                <Switch
                  value={preferencias.notificacionesActivas}
                  onValueChange={async (val) => {
                    const actual = {
                      ...preferencias,
                      notificacionesActivas: val,
                    };
                    setPreferencias(actual);
                    await guardarPreferenciasAlertas(actual);
                  }}
                  trackColor={{ false: "#CBD5E1", true: "#FCA5A5" }}
                  thumbColor={
                    preferencias.notificacionesActivas ? "#EF4444" : "#94A3B8"
                  }
                />
              </View>

              <Text style={styles.sectionHeader}>
                Magnitud o Severidad Mínima
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 3.0, 4.5, 6.0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={inputMagnitud}
                onChangeText={setInputMagnitud}
              />

              <Text style={styles.sectionHeader}>País o Lugar de Interés</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Colombia, Chile, Japón (Vacío para Mundial)"
                placeholderTextColor="#94A3B8"
                value={inputPais}
                onChangeText={setInputPais}
              />
            </ScrollView>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleRestablecerFiltros}
              >
                <Text style={styles.resetButtonText}>Restablecer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleGuardarConfiguracion}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {alertaSeleccionada && (
        <Modal visible={true} animationType="slide" transparent={false}>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: getColorMagnitud(
                alertaSeleccionada.magnitud,
                alertaSeleccionada.tipo,
              ),
            }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setAlertaSeleccionada(null)}
                style={{ padding: 5 }}
              >
                <Text style={{ fontSize: 28, color: "#FFF" }}>←</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: "center", paddingRight: 30 }}>
                <Text
                  style={{ fontSize: 18, color: "#FFF", fontWeight: "bold" }}
                >
                  {alertaSeleccionada.tipo}
                </Text>
              </View>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.mapContainer}>
                <WebView
                  source={{
                    html: getLeafletHTML(
                      alertaSeleccionada.latitud,
                      alertaSeleccionada.longitud,
                      alertaSeleccionada.magnitud,
                      alertaSeleccionada.tipo,
                    ),
                  }}
                  style={{ flex: 1 }}
                  scrollEnabled={false}
                />
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>
                  {alertaSeleccionada.titulo}
                </Text>

                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.magCircleBig,
                      {
                        backgroundColor: getColorMagnitud(
                          alertaSeleccionada.magnitud,
                          alertaSeleccionada.tipo,
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.magTextBig}>
                      {alertaSeleccionada.magnitud.toFixed(1)}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 15 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#1E293B",
                      }}
                    >
                      {alertaSeleccionada.tipo === "Sismo"
                        ? "Escala de Richter"
                        : "Severidad"}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#64748B" }}>
                      {alertaSeleccionada.tipo === "Sismo"
                        ? "Magnitud del sismo"
                        : "Índice de alerta"}
                    </Text>
                  </View>
                </View>

                <View style={styles.gridInfo}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>🕒 Hora local</Text>
                    <Text style={styles.gridValue}>
                      {alertaSeleccionada.fecha.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>📅 Fecha</Text>
                    <Text style={styles.gridValue}>
                      {alertaSeleccionada.fecha.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>🌍 Profundidad</Text>
                    <Text style={styles.gridValue}>
                      {alertaSeleccionada.profundidad > 0
                        ? `${alertaSeleccionada.profundidad.toFixed(1)} km`
                        : "N/A"}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>📍 Coordenadas</Text>
                    <Text style={styles.gridValue}>
                      {alertaSeleccionada.latitud.toFixed(2)},{" "}
                      {alertaSeleccionada.longitud.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#1677D2",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "#FEE2E2", marginTop: 4 },
  configButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 5,
  },
  subtitle: { fontSize: 13, color: "#64748B" },

  timeText: { fontSize: 12, color: "#94A3B8", marginBottom: 8 },
  magCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  magText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  configCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  configTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 20,
    textAlign: "center",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingLabel: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  settingSublabel: { fontSize: 12, color: "#64748B", marginTop: 2 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#475569",
    marginTop: 10,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 15,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 10,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  resetButtonText: { color: "#475569", fontWeight: "bold", fontSize: 16 },
  saveButton: {
    flex: 1,
    backgroundColor: "#1677D2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
  },
  modalBody: { flex: 1, backgroundColor: "#F8FAFC" },
  mapContainer: { height: "50%", width: "100%" },
  detailCard: {
    backgroundColor: "#FFF",
    margin: 20,
    marginTop: -40,
    padding: 20,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  magCircleBig: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  magTextBig: { color: "#FFF", fontWeight: "bold", fontSize: 24 },
  gridInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: { width: "48%", marginBottom: 20 },
  gridLabel: { fontSize: 13, color: "#64748B", marginBottom: 4 },
  gridValue: { fontSize: 15, fontWeight: "bold", color: "#1E293B" },
});
