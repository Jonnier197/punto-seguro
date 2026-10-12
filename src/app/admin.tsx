import { useFocusEffect } from 'expo-router';
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

import { actualizarEstadoPunto, fetchPuntosPendientes } from '../services/puntosService';
import { PuntoSeguro } from '../types';

export default function AdminScreen() {
  const [pendientes, setPendientes] = useState<PuntoSeguro[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarPendientes = async () => {
    setLoading(true);
    try {
      const data = await fetchPuntosPendientes();
      setPendientes(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los puntos pendientes.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarPendientes();
    }, [])
  );

  const handleAccion = async (id: string, accion: 'aprobado' | 'rechazado') => {
    try {
      await actualizarEstadoPunto(id, accion);
      setPendientes((prev) => prev.filter((p) => p.id !== id));
      Alert.alert('Éxito', `El punto ha sido ${accion}.`);
    } catch (error) {
      Alert.alert('Error', `No se pudo cambiar el estado a ${accion}.`);
    }
  };

  const renderItem = ({ item }: { item: PuntoSeguro }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.text}>📌 <Text style={{ fontWeight: 'bold' }}>Tipo:</Text> {item.tipo}</Text>
        <Text style={styles.text}>📍 <Text style={{ fontWeight: 'bold' }}>Dirección:</Text> {item.direccion}</Text>
        <Text style={styles.text}>📞 <Text style={{ fontWeight: 'bold' }}>Teléfono:</Text> {item.telefono}</Text>
        <View style={styles.divider} />
        <Text style={styles.textPropuesto}>👤 Propuesto por: {item.creadoPor || 'Desconocido'}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={() => handleAccion(item.id, 'rechazado')}>
          <Text style={styles.buttonText}>❌ Rechazar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={() => handleAccion(item.id, 'aprobado')}>
          <Text style={styles.buttonText}>✅ Aprobar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <Text style={styles.headerSubtitle}>Revisión de Puntos Seguros</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#EF4444" style={{ marginTop: 50 }} />
      ) : pendientes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🎉 ¡Todo al día!</Text>
          <Text style={styles.emptySubtext}>No hay puntos pendientes por revisar.</Text>
        </View>
      ) : (
        <FlatList
          data={pendientes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onRefresh={cargarPendientes}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, paddingBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, marginBottom: 15, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  infoContainer: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, marginBottom: 15 },
  text: { fontSize: 14, color: '#475569', marginBottom: 6 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  textPropuesto: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rejectButton: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  approveButton: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  buttonText: { fontWeight: 'bold', fontSize: 15, color: '#1E293B' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 24, fontWeight: 'bold', color: '#334155', marginBottom: 10 },
  emptySubtext: { fontSize: 15, color: '#94A3B8', textAlign: 'center' }
});