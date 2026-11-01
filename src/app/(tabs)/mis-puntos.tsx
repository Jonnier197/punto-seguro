import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { auth } from '../../../config/firebase';
import { eliminarPuntoSeguro, fetchMisPuntosPendientes } from '../../services/puntosService';
import { PuntoSeguro } from '../../types';

export default function MisPuntosScreen() {
  const router = useRouter();
  const [misPuntos, setMisPuntos] = useState<PuntoSeguro[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarMisPuntos = async () => {
    setLoading(true);
    try {
      const email = auth.currentUser?.email;
      if (email) {
        const data = await fetchMisPuntosPendientes(email);
        setMisPuntos(data);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar tus puntos propuestos.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarMisPuntos();
    }, [])
  );

  const confirmarCancelacion = (id: string, nombre: string) => {
    Alert.alert(
      'Cancelar Propuesta',
      `¿Deseas cancelar y borrar tu propuesta de "${nombre}"?`,
      [
        { text: 'No, mantener', style: 'cancel' },
        {
          text: 'Sí, borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarPuntoSeguro(id);
              setMisPuntos((prev) => prev.filter((p) => p.id !== id));
              Alert.alert('Éxito', 'Tu propuesta fue eliminada.');
            } catch (error) {
              Alert.alert('Error', 'Hubo un problema al intentar borrar la propuesta.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: PuntoSeguro }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={styles.title}>{item.nombre}</Text>
        <View style={styles.badgePendiente}>
          <Text style={styles.badgeText}>⏳ En Revisión</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.text}>📌 <Text style={{ fontWeight: 'bold' }}>Tipo:</Text> {item.tipo}</Text>
        <Text style={styles.text}>📍 <Text style={{ fontWeight: 'bold' }}>Dirección:</Text> {item.direccion}</Text>
      </View>
      
      <TouchableOpacity style={styles.deleteButton} onPress={() => confirmarCancelacion(item.id, item.nombre)}>
        <Text style={styles.deleteButtonText}>🗑️ Cancelar Propuesta</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
          <Text style={{ fontSize: 24, color: '#1E293B' }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Mis Propuestas</Text>
          <Text style={styles.headerSubtitle}>Puntos en estado de revisión</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#EF4444" style={{ marginTop: 50 }} />
      ) : misPuntos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes propuestas</Text>
          <Text style={styles.emptySubtext}>Cuando propongas un punto seguro y esté pendiente de revisión, aparecerá aquí.</Text>
        </View>
      ) : (
        <FlatList
          data={misPuntos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onRefresh={cargarMisPuntos}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, paddingBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, marginBottom: 15, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, flex: 1 },
  badgePendiente: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginLeft: 10 },
  badgeText: { color: '#D97706', fontSize: 12, fontWeight: 'bold' },
  infoContainer: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, marginBottom: 15 },
  text: { fontSize: 14, color: '#475569', marginBottom: 6 },
  deleteButton: { backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  deleteButtonText: { color: '#DC2626', fontWeight: 'bold', fontSize: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#334155', marginBottom: 10 },
  emptySubtext: { fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 22 }
});