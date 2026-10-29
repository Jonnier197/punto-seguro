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
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 👇 IMPORTAMOS ADMOB 👇
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

import { auth } from "../../config/firebase";
import {
  calcularDistancia,
  eliminarPuntoSeguro,
  fetchPuntosSeguros,
} from "../services/puntosService";
import { obtenerPerfilUsuario, UserData } from "../services/userService";

// 👇 IMPORTAMOS EL SERVICIO DE NOTIFICACIONES 👇
import { registrarParaNotificacionesPush } from "../services/notificationService";
import { styles } from "../styles/indexStyles";
import { PuntoSeguro } from "../types";
import { getEmojiTipo } from "../utils/emojis";

LogBox.ignoreAllLogs();

type PuntoConDistancia = PuntoSeguro & {
  distanciaVal: number;
  distanciaText: string;
};

export default function Index() {
  const router = useRouter();

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
          return { ...p, distanciaVal: d, distanciaText: `${d} km` };
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
    // 👇 FORZAMOS EL REGISTRO DEL TOKEN AL ENTRAR A LA PANTALLA PRINCIPAL 👇
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

  const puntosFiltrados = puntos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
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

  // 👇 DECLARAMOS EL ID DEL ANUNCIO AQUÍ, JUSTO ANTES DEL RETURN 👇
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : "ca-app-pub-5334815455665872/6664516582";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {nombreUsuario}! 👋</Text>
          <Text style={styles.appName}>PUNTO SEGURO</Text>
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
          <ActivityIndicator
            size="small"
            color="#007AFF"
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
                    {/* 👇 SE CORRIGIÓ EL SALTO DE LÍNEA EXTRAÑO AQUÍ 👇 */}
                    <Text style={styles.itemSubtitle}>
                      📍 a {item.distanciaText} - {item.estado || item.tipo}
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
                    <View style={styles.navButton}>
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

      {/* 👇 BANNER DE ADMOB FIJADO EN LA PARTE INFERIOR 👇 */}
      <View
        style={{
          alignItems: "center",
          width: "100%",
          paddingTop: 5,
          paddingBottom: 10,
          backgroundColor: "#F8FAFC",
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
    </SafeAreaView>
  );
}
