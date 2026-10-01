import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { auth, db } from '../../config/firebase';

interface UserData {
  nombre?: string;
  email?: string;
  tipoSangre?: string;
  fechaNacimiento?: string;
  documento?: string;
  telefono?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  alergias?: string;
  condiciones?: string;
}

export default function PerfilScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // OBTENER DATOS DEL USUARIO
  // ==========================================

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(
          db,
          'users',
          currentUser.uid
        );

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(
            docSnap.data() as UserData
          );
        } else {
          // Si el documento no existe,
          // mostramos información básica.
          setUserData({
            nombre:
              currentUser.email?.split('@')[0] ||
              'Usuario Registrado',

            email: currentUser.email || '',

            tipoSangre: 'O+',
            fechaNacimiento: 'No especificada',
            documento: 'No especificado',
            telefono: 'No especificado',

            contactoEmergencia:
              'No especificado',

            telefonoEmergencia:
              'No especificado',

            alergias:
              'Ninguna reportada',

            condiciones:
              'Sin condiciones de riesgo',
          });
        }
      } catch (error) {
        console.error(
          'Error al obtener perfil:',
          error
        );

        Alert.alert(
          'Error',
          'No se pudo cargar la información del perfil.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      // El _layout.tsx detectará automáticamente
      // que el usuario cerró sesión y lo enviará
      // a la pantalla de autenticación.
    } catch (error) {
      Alert.alert(
        'Error',
        'Hubo un problema al cerrar sesión.'
      );
    }
  };

  // ==========================================
  // PANTALLA DE CARGA
  // ==========================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#EF4444"
        />

        <Text style={styles.loadingText}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  // ==========================================
  // PERFIL
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* =====================================
            ENCABEZADO
        ===================================== */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Perfil del Usuario
          </Text>

          <Text style={styles.headerSubtitle}>
            Información para emergencias
          </Text>
        </View>

        <View style={styles.content}>

          {/* ===================================
              TARJETA PRINCIPAL
          =================================== */}

          <View style={styles.userCard}>

            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                👤
              </Text>
            </View>

            {/* Nombre */}
            <Text style={styles.userName}>
              {userData?.nombre ||
                'Usuario Registrado'}
            </Text>

            {/* Correo */}
            <Text style={styles.userRole}>
              {userData?.email ||
                auth.currentUser?.email ||
                'Correo no disponible'}
            </Text>

            {/* Tipo de sangre */}
            <View style={styles.bloodBadge}>

              <Text style={styles.bloodTitle}>
                🩸 TIPO DE SANGRE
              </Text>

              <Text style={styles.bloodType}>
                {userData?.tipoSangre || 'O+'}
              </Text>

            </View>

          </View>

          {/* ===================================
              INFORMACIÓN PERSONAL
          =================================== */}

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              📋 Información Personal
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Fecha de Nacimiento:
              </Text>

              <Text style={styles.infoValue}>
                {userData?.fechaNacimiento ||
                  'No especificada'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Documento:
              </Text>

              <Text style={styles.infoValue}>
                {userData?.documento ||
                  'No especificado'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Teléfono:
              </Text>

              <Text style={styles.infoValue}>
                {userData?.telefono ||
                  'No especificado'}
              </Text>
            </View>

          </View>

          {/* ===================================
              CONTACTO DE EMERGENCIA
          =================================== */}

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              📞 Contacto de Emergencia
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Familiar de Contacto:
              </Text>

              <Text style={styles.infoValue}>
                {userData?.contactoEmergencia ||
                  'No especificado'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Línea Directa:
              </Text>

              <Text style={styles.infoValue}>
                {userData?.telefonoEmergencia ||
                  'No especificado'}
              </Text>
            </View>

          </View>

          {/* ===================================
              INFORMACIÓN MÉDICA
          =================================== */}

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              ⚠️ Información Médica Clave
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Alergias:
              </Text>

              <Text style={styles.infoValue}>
                {userData?.alergias ||
                  'Ninguna reportada'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Condiciones / Medicamentos:
              </Text>

              <Text style={styles.infoValue}>
                {userData?.condiciones ||
                  'Sin condiciones de riesgo'}
              </Text>
            </View>

          </View>

          {/* ===================================
              ACTUALIZAR PERFIL
          =================================== */}

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              Alert.alert(
                'Próximamente',
                'Aquí podrás actualizar tus datos médicos.'
              )
            }
          >
            <Text style={styles.editButtonText}>
              ⚙️ Actualizar Datos Médicos
            </Text>
          </TouchableOpacity>

          {/* ===================================
              CERRAR SESIÓN
          =================================== */}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 30,
  },

  header: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  content: {
    padding: 20,
  },

  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,

    elevation: 2,

    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  avatarText: {
    fontSize: 32,
  },

  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },

  userRole: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 15,
    textAlign: 'center',
  },

  bloodBadge: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
  },

  bloodTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#991B1B',
  },

  bloodType: {
    fontSize: 28,
    fontWeight: '900',
    color: '#DC2626',
    marginTop: 2,
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,

    elevation: 1,

    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 10,
  },

  infoLabel: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'right',
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  editButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 30,
  },

  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

});