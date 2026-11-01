import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  LogBox,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

import { auth } from "../../../config/firebase";
import { registrarParaNotificacionesPush } from "../../services/notificationService";
import {
  calcularDistancia,
  eliminarPuntoSeguro,
  fetchPuntosSeguros,
} from "../../services/puntosService";
import { obtenerPerfilUsuario, UserData } from "../../services/userService";
import { styles } from "../../styles/indexStyles";
import { PuntoSeguro } from "../../types";
import { getEmojiTipo } from "../../utils/emojis";

//IMPORTAMOS LA NUEVA CONFIGURACIÓN DE CATEGORÍAS
import { CATEGORIAS_OFICIALES } from "../../utils/categoryIcons";

LogBox.ignoreAllLogs();

type PuntoConDistancia = PuntoSeguro & {
  distanciaVal: number;
  distanciaText: string;
};

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [busqueda, setBusqueda] = useState("");
  const [puntos, setPuntos] = useState<PuntoConDistancia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const [nombreUsuario, setNombreUsuario] = useState("Usuario");
  const [usuarioActual, setUsuarioActual] = useState<UserData | null>(null);

  const cargarDatos = async (esRefresco = false) => {
    if (esRefresco) {
      setRefrescando(true);
    } else {
      setCargando(true);
    }

    try {
      let userLat = 3.5394;
      let userLng = -76.3036;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        userLat = location.coords.latitude;
        userLng = location.coords.longitude;
      }

      const lista = await fetchPuntosSeguros();

      const calculada: PuntoConDistancia[] = lista
        .map((p) => {
          const d = calcularDistancia(userLat, userLng, p.latitud, p.longitud);
          return {
            ...p,
            distanciaVal: d,
            distanciaText: `${d} km`,
          } as PuntoConDistancia;
        })
        .sort((a, b) => a.distanciaVal - b.distanciaVal);

      setPuntos(calculada);
    } catch (error) {
      console.log("Error cargando puntos:", error);
    } finally {
      if (esRefresco) {
        setRefrescando(false);
      } else {
        setCargando(false);
      }
    }
  };

  useEffect(() => {
    cargarDatos();
    registrarParaNotificacionesPush();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const nombre = await AsyncStorage.getItem("nombreUsuario");
        if (nombre) {
          setNombreUsuario(nombre.split(" ")[0]);
        } else {
          setNombreUsuario("Usuario");
        }

        const perfil = await obtenerPerfilUsuario();
        setUsuarioActual(perfil);
      })();
    }, []),
  );

  const puntosFiltrados = puntos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.tipo.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const irAlMapa = (punto: PuntoConDistancia) => {
    router.push({
      pathname: "/mapa",
      params: {
        focusId: punto.id,
        lat: punto.latitud.toString(),
        lng: punto.longitud.toString(),
        ts: Date.now().toString(),
      },
    });
  };

  const confirmarEliminacion = (id: string, nombre: string) => {
    Alert.alert(
      "Eliminar Punto Seguro",
      `¿Estás seguro de que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarPuntoSeguro(id);
              setPuntos((prev) => prev.filter((p) => p.id !== id));
              Alert.alert(
                "Éxito",
                "El punto seguro ha sido borrado exitosamente.",
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "Hubo un problema al intentar eliminar el punto.",
              );
            }
          },
        },
      ],
    );
  };

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : "ca-app-pub-5334815455665872/6664516582";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {nombreUsuario}! 👋</Text>
          <Text style={[styles.appName, { color: "#0B3B70" }]}>
            PUNTO SEGURO
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.profileBadge,
            usuarioActual?.fotoUrl
              ? { padding: 0, backgroundColor: "transparent", borderWidth: 0 }
              : {},
          ]}
          onPress={() => router.push("/perfil")}
        >
          {usuarioActual?.fotoUrl ? (
            <Image
              source={{ uri: usuarioActual.fotoUrl }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
            />
          ) : (
            <Text style={{ fontSize: 20 }}>👤</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* BARRA DE BÚSQUEDA RESTAURADA CON SU ESTILO ORIGINAL Y LA "✕" INTEGRADA */}
      <View
        style={[
          styles.searchContainer,
          { flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
        ]}
      >
        <TextInput
          style={{ flex: 1, height: "100%", fontSize: 15, color: "#0F172A" }}
          placeholder="🔍 Buscar ayuda... (Ej. Agua, Bomberos)"
          placeholderTextColor="#94A3B8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity
            onPress={() => setBusqueda("")}
            style={{ padding: 6 }}
          >
            <Text
              style={{ fontSize: 16, color: "#64748B", fontWeight: "bold" }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ paddingHorizontal: 16, marginVertical: 12 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#0B3B70",
            marginBottom: 12,
          }}
        >
          ¿Qué necesitas?
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {CATEGORIAS_OFICIALES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={{
                width: "30%",
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 10,
                alignItems: "center",
                marginBottom: 12,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => setBusqueda(cat.id)}
            >
              <Image
                source={cat.icon}
                style={{ width: 40, height: 40, resizeMode: "contain" }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: "#0B3B70",
                  textAlign: "center",
                  marginTop: 6,
                }}
                numberOfLines={2}
              >
                {cat.nombreCorto}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Puntos Cercanos a tu Ubicación</Text>

        {cargando ? (
          <ActivityIndicator
            size="small"
            color="#1677D2"
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={puntosFiltrados}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshing={refrescando}
            onRefresh={() => cargarDatos(true)}
            renderItem={({ item }) => {
              const esCreador =
                item.creadoPor === auth.currentUser?.email &&
                item.creadoPor !== undefined;
              const esAdmin = usuarioActual?.rol === "admin";
              const puedeEliminar = esCreador || esAdmin;

              return (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => irAlMapa(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Text style={{ fontSize: 26 }}>
                      {getEmojiTipo(item.tipo)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.nombre}</Text>

                    <Text style={styles.itemSubtitle}>
                      a {item.distanciaText} - {item.estado || item.tipo}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {puedeEliminar && (
                      <TouchableOpacity
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          backgroundColor: "#FEE2E2",
                          borderRadius: 8,
                          marginRight: 8,
                          borderWidth: 1,
                          borderColor: "#FECACA",
                        }}
                        onPress={() =>
                          confirmarEliminacion(item.id, item.nombre)
                        }
                      >
                        <Text style={{ fontSize: 16 }}>🗑️</Text>
                      </TouchableOpacity>
                    )}
                    <View
                      style={[styles.navButton, { backgroundColor: "#1677D2" }]}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        ➔
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      <View
        style={{
          alignItems: "center",
          width: "100%",
          paddingTop: 5,
          paddingBottom: 10,
          backgroundColor: "#F1F5F9",
        }}
      >
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    </View>
  );
}
