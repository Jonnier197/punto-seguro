import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  addDoc,
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from '../../config/firebase';

interface PuntoSeguro {
  id: string;
  nombre: string;
  tipo: string;
  direccion: string;
  latitud: number;
  longitud: number;
  telefono: string;
}

// ============================================
// DATOS INICIALES
// ============================================

const puntosIniciales = [
  {
    nombre: 'Estación de Policía Principal',
    tipo: 'Policía',
    direccion: 'Calle 10 # 4-20',
    latitud: 3.4516,
    longitud: -76.5320,
    telefono: '123',
  },
  {
    nombre: 'Hospital Universitario del Valle',
    tipo: 'Hospital',
    direccion: 'Calle 5 # 36-08',
    latitud: 3.4285,
    longitud: -76.5442,
    telefono: '125',
  },
  {
    nombre: 'Estación de Bomberos Central',
    tipo: 'Bomberos',
    direccion: 'Carrera 1 # 18-29',
    latitud: 3.4550,
    longitud: -76.5270,
    telefono: '119',
  },
];

// ============================================
// PANTALLA MAPA
// ============================================

export default function MapaScreen() {
  const [puntos, setPuntos] = useState<PuntoSeguro[]>([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // CARGAR PUNTOS DESDE FIRESTORE
  // ==========================================

  const fetchPuntosSeguros = async () => {
    setLoading(true);

    try {
      const querySnapshot = await getDocs(
        collection(db, 'puntos_seguros')
      );

      const listaPuntos: PuntoSeguro[] = [];

      querySnapshot.forEach((documento) => {
        listaPuntos.push({
          id: documento.id,
          ...documento.data(),
        } as PuntoSeguro);
      });

      setPuntos(listaPuntos);

    } catch (error) {
      console.error(
        'Error cargando puntos seguros:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudieron cargar los puntos seguros.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREAR PUNTOS AUTOMÁTICAMENTE
  // ==========================================

  const crearPuntosAutomaticos = async () => {
    setLoading(true);

    try {
      for (const punto of puntosIniciales) {
        await addDoc(
          collection(db, 'puntos_seguros'),
          punto
        );
      }

      Alert.alert(
        '¡Éxito!',
        'Se han creado los puntos seguros automáticamente en Firestore.'
      );

      await fetchPuntosSeguros();

    } catch (error) {
      console.error(
        'Error creando puntos:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudieron crear los puntos automáticamente.'
      );

      setLoading(false);
    }
  };

  // ==========================================
  // CARGAR AL INICIAR
  // ==========================================

  useEffect(() => {
    fetchPuntosSeguros();
  }, []);

  // ==========================================
  // EMOJI SEGÚN TIPO
  // ==========================================

  const getEmojiTipo = (tipo: string) => {
    const t = tipo.toLowerCase();

    if (
      t.includes('policía') ||
      t.includes('policia')
    ) {
      return '👮‍♂️';
    }

    if (
      t.includes('hospital') ||
      t.includes('salud') ||
      t.includes('clínica') ||
      t.includes('clinica')
    ) {
      return '🏥';
    }

    if (t.includes('bombero')) {
      return '👨‍🚒';
    }

    return '🛡️';
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
          Cargando Puntos Seguros...
        </Text>

      </View>
    );
  }

  // ==========================================
  // PANTALLA PRINCIPAL
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>

      {/* ENCABEZADO */}

      <View style={styles.header}>

        <Text style={styles.headerTitle}>
          Puntos Seguros Cercanos 🗺️
        </Text>

        <Text style={styles.headerSubtitle}>
          Ubicaciones de asistencia inmediata
        </Text>

      </View>

      <View style={styles.content}>

        {/* SIN PUNTOS */}

        {puntos.length === 0 ? (

          <View style={styles.emptyContainer}>

            <Text style={styles.emptyEmoji}>
              📍
            </Text>

            <Text style={styles.emptyText}>
              No hay puntos seguros registrados
              {'\n'}
              en Firestore.
            </Text>

            {/* CREAR PUNTOS */}

            <TouchableOpacity
              style={styles.autoButton}
              onPress={crearPuntosAutomaticos}
            >
              <Text style={styles.autoButtonText}>
                ⚡ Crear Puntos Automáticamente
              </Text>
            </TouchableOpacity>

            {/* RECARGAR */}

            <TouchableOpacity
              style={styles.reloadButton}
              onPress={fetchPuntosSeguros}
            >
              <Text style={styles.reloadButtonText}>
                🔄 Recargar
              </Text>
            </TouchableOpacity>

          </View>

        ) : (

          /* LISTA DE PUNTOS */

          <FlatList
            data={puntos}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}

            renderItem={({ item }) => (

              <View style={styles.card}>

                {/* ENCABEZADO DE LA TARJETA */}

                <View style={styles.cardHeader}>

                  <Text style={styles.typeEmoji}>
                    {getEmojiTipo(item.tipo)}
                  </Text>

                  <View style={styles.cardTitleContainer}>

                    <Text style={styles.pointName}>
                      {item.nombre}
                    </Text>

                    <Text style={styles.pointType}>
                      {item.tipo}
                    </Text>

                  </View>

                </View>

                <View style={styles.divider} />

                {/* DIRECCIÓN */}

                <View style={styles.infoRow}>

                  <Text style={styles.infoLabel}>
                    📍 Dirección:
                  </Text>

                  <Text style={styles.infoValue}>
                    {item.direccion}
                  </Text>

                </View>

                {/* TELÉFONO */}

                <View style={styles.infoRow}>

                  <Text style={styles.infoLabel}>
                    📞 Contacto:
                  </Text>

                  <Text
                    style={[
                      styles.infoValue,
                      styles.phoneText,
                    ]}
                  >
                    {item.telefono ||
                      'Sin teléfono'}
                  </Text>

                </View>

                {/* COORDENADAS */}

                <View style={styles.coordsBadge}>

                  <Text style={styles.coordsText}>
                    Lat: {item.latitud} | Lon:{' '}
                    {item.longitud}
                  </Text>

                </View>

              </View>

            )}
          />

        )}

      </View>

    </SafeAreaView>
  );
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 30,
  },

  header: {
    alignItems: 'center',
    paddingVertical: 14,
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
    flex: 1,
    padding: 16,
  },

  // ==========================================
  // CARGANDO
  // ==========================================

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 14,
  },

  // ==========================================
  // TARJETA
  // ==========================================

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  typeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },

  cardTitleContainer: {
    flex: 1,
  },

  pointName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  pointType: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },

  // ==========================================
  // INFORMACIÓN
  // ==========================================

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 4,
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

  phoneText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },

  // ==========================================
  // COORDENADAS
  // ==========================================

  coordsBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  coordsText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily:
      Platform.OS === 'ios'
        ? 'Courier'
        : 'monospace',
  },

  // ==========================================
  // SIN RESULTADOS
  // ==========================================

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },

  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },

  // ==========================================
  // BOTÓN AUTOMÁTICO
  // ==========================================

  autoButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },

  autoButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // ==========================================
  // BOTÓN RECARGAR
  // ==========================================

  reloadButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  reloadButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

});