import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

import { SeccionConfig, SECCIONES_PERFIL } from '../components/config/perfilSections';
import EditSectionModal from '../components/perfil/EditSectionModal';
import SectionCard, { Divider, InfoRow } from '../components/perfil/SectionCard';
import { COLORS } from '../components/theme/colors';
import {
  actualizarPerfilUsuario,
  obtenerPerfilUsuario,
  UserData,
} from '../services/userService';
import { styles } from '../styles/perfilStyles';

export default function PerfilScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState<SeccionConfig | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    (async () => {
      try {
        const data = await obtenerPerfilUsuario();
        setUserData(
          data || {
            nombre: auth.currentUser?.email?.split('@')[0] || 'Usuario',
            email: auth.currentUser?.email || '',
            tipoSangre: 'O+',
          }
        );
      } catch {
        Alert.alert('Error', 'No se pudo cargar el perfil.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Guardar cambios de la sección activa
  const handleSave = async (cambios: Partial<UserData>) => {
    await actualizarPerfilUsuario(cambios);
    setUserData((prev) => ({ ...prev, ...cambios }));
    Alert.alert('¡Listo!', 'Tus datos fueron actualizados.');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.danger} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil del Usuario</Text>
          <Text style={styles.headerSubtitle}>Información para emergencias</Text>
        </View>

        <View style={styles.content}>
          {/* TARJETA PRINCIPAL */}
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <Text style={styles.userName}>{userData?.nombre || 'Usuario'}</Text>
            <Text style={styles.userRole}>
              {userData?.email || auth.currentUser?.email || 'Correo no disponible'}
            </Text>

            <View style={styles.bloodBadge}>
              <Text style={styles.bloodTitle}>🩸 TIPO DE SANGRE</Text>
              <Text style={styles.bloodType}>{userData?.tipoSangre || 'O+'}</Text>
            </View>
          </View>

          {/* SECCIONES DINÁMICAS */}
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

          {/* BOTONES */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setSeccionActiva(SECCIONES_PERFIL[0])}
          >
            <Text style={styles.editButtonText}>⚙️ Actualizar Mis Datos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL GENÉRICA */}
      <EditSectionModal
        visible={seccionActiva !== null}
        titulo={seccionActiva?.titulo || ''}
        campos={seccionActiva?.campos || []}
        initialData={userData}
        onClose={() => setSeccionActiva(null)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}
