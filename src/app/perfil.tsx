import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../config/firebase";

import {
  SECCIONES_PERFIL,
  SeccionConfig,
} from "../components/config/perfilSections";
import EditSectionModal from "../components/perfil/EditSectionModal";
import SectionCard, {
  Divider,
  InfoRow,
} from "../components/perfil/SectionCard";
import {
  UserData,
  actualizarPerfilUsuario,
  obtenerPerfilUsuario,
} from "../services/userService";

export default function PerfilScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState<SeccionConfig | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const data = await obtenerPerfilUsuario();
          if (isActive) {
            setUserData(
              data || {
                nombre: auth.currentUser?.email?.split("@")[0] || "Usuario",
                email: auth.currentUser?.email || "",
                tipoSangre: "O+",
              },
            );
          }
        } catch {
          if (isActive) Alert.alert("Error", "No se pudo cargar el perfil.");
        } finally {
          if (isActive) setLoading(false);
        }
      })();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permiso requerido",
        "Se necesita acceso a la galería para cambiar la foto.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      const nuevaFoto = result.assets[0].uri;
      handleSave({ fotoUrl: nuevaFoto });
    }
  };

  const handleSave = async (cambios: Partial<UserData>) => {
    await actualizarPerfilUsuario(cambios);
    setUserData((prev) => ({ ...prev, ...cambios }));
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("nombreUsuario");
      setUserData(null);
      await signOut(auth);
      router.replace("/auth");
    } catch {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F1F5F9",
        }}
      >
        <ActivityIndicator size="large" color="#1677D2" />
        <Text style={{ marginTop: 12, color: "#0B3B70", fontWeight: "bold" }}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 20,
          paddingBottom: 10,
          backgroundColor: "#FFFFFF",
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={{ marginRight: 15 }}
        >
          <Text style={{ fontSize: 24, color: "#0B3B70", fontWeight: "bold" }}>
            ←
          </Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Perfil del Usuario</Text>
          <Text style={styles.headerSubtitle}>
            Información para emergencias
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.userCard}>
            <TouchableOpacity
              style={[
                styles.avatarContainer,
                {
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  marginBottom: 10,
                },
              ]}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              {userData?.fotoUrl ? (
                <Image
                  source={{ uri: userData.fotoUrl }}
                  style={{ width: 90, height: 90, borderRadius: 45 }}
                />
              ) : (
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    backgroundColor: "#E2E8F0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 40 }}>👤</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.userName}>{userData?.nombre || "Usuario"}</Text>
            <Text style={styles.userRole}>
              {userData?.email ||
                auth.currentUser?.email ||
                "Correo no disponible"}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <View style={[styles.bloodBadge, { flex: 1 }]}>
                <Text style={styles.bloodTitle}>🩸 TIPO DE SANGRE</Text>
                <Text style={styles.bloodType}>
                  {userData?.tipoSangre || "O+"}
                </Text>
              </View>
              <View
                style={[
                  styles.bloodBadge,
                  { flex: 1, backgroundColor: "#FEF2F2" },
                ]}
              >
                <Text style={[styles.bloodTitle, { color: "#DC2626" }]}>
                  ⚠️ ALERGIAS
                </Text>
                <Text
                  style={[styles.bloodType, { fontSize: 13, color: "#991B1B" }]}
                >
                  {userData?.alergias && userData.alergias !== "No especificado"
                    ? userData.alergias
                    : "Ninguna"}
                </Text>
              </View>
            </View>
          </View>

          {SECCIONES_PERFIL.map((seccion) => (
            <SectionCard
              key={seccion.id}
              title={seccion.titulo}
              onEdit={() => setSeccionActiva(seccion)}
            >
              {seccion.campos.map((campo, idx) => (
                <View key={campo.key}>
                  <InfoRow
                    label={`${campo.label}:`}
                    value={userData?.[campo.key] as string}
                  />
                  {idx < seccion.campos.length - 1 && <Divider />}
                </View>
              ))}
            </SectionCard>
          ))}

          <TouchableOpacity
            style={{
              backgroundColor: "#1677D2",
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: "center",
              marginBottom: userData?.rol === "admin" ? 15 : 25,
              shadowColor: "#1677D2",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 4,
            }}
            onPress={() => router.push("/mis-puntos")}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>
              ⏳ Mis Puntos Propuestos
            </Text>
          </TouchableOpacity>

          {userData?.rol === "admin" && (
            <TouchableOpacity
              style={{
                backgroundColor: "#0B3B70",
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: "center",
                marginBottom: 25,
                shadowColor: "#0B3B70",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 4,
              }}
              onPress={() => router.push("/admin")}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>
                🛡️ Panel de Administración
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <EditSectionModal
        visible={seccionActiva !== null}
        titulo={seccionActiva?.titulo || ""}
        campos={seccionActiva?.campos || []}
        initialData={userData}
        onClose={() => setSeccionActiva(null)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarContainer: { position: "relative" },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 8,
  },
  userRole: { fontSize: 14, color: "#64748B", marginTop: 2 },
  bloodBadge: {
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bloodTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0B3B70",
    marginBottom: 4,
  },
  bloodType: { fontSize: 18, fontWeight: "bold", color: "#0F172A" },
  logoutButton: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 30,
  },
  logoutButtonText: { color: "#DC2626", fontWeight: "bold", fontSize: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
  headerSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
});
