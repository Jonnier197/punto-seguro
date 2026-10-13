import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../config/firebase';
import { enviarNotificacionPush } from '../services/notificationService';

export default function AdminScreen() {
  const [propuestas, setPropuestas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Nuevo estado para el scroll

  const cargarPropuestasPendientes = async (isRefresh = false) => {
    // Si no es un refresh (como al iniciar la app), mostramos la carga completa
    if (!isRefresh) setLoading(true); 
    
    try {
      const q = query(collection(db, 'puntos_seguros'), where('estado', '==', 'pendiente'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPropuestas(data);
    } catch (error) {
      console.error("Error cargando propuestas:", error);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    cargarPropuestasPendientes();
  }, []);

  // 👈 Función que se ejecuta al jalar hacia abajo
  const onRefresh = async () => {
    setRefreshing(true);
    await cargarPropuestasPendientes(true);
    setRefreshing(false);
  };

  const procesarPropuesta = async (idPropuesta: string, idUsuarioCreador: string, nombrePunto: string, accion: 'aprobado' | 'rechazado') => {
    try {
      const propuestaRef = doc(db, 'puntos_seguros', idPropuesta);
      await updateDoc(propuestaRef, { estado: accion });

      // 1. Notificar al creador de la propuesta
      if (idUsuarioCreador) {
        const usuarioRef = doc(db, 'users', idUsuarioCreador);
        const usuarioSnap = await getDoc(usuarioRef);
        
        if (usuarioSnap.exists() && usuarioSnap.data().expoPushToken) {
          const tokenCreador = usuarioSnap.data().expoPushToken;
          const titulo = accion === 'aprobado' ? "✅ ¡Propuesta Aprobada!" : "❌ Propuesta Rechazada";
          const mensaje = accion === 'aprobado' 
            ? `Tu punto seguro "${nombrePunto}" ha sido validado.`
            : `Lo sentimos, tu propuesta "${nombrePunto}" no cumple con las normas.`;
            
          await enviarNotificacionPush(tokenCreador, titulo, mensaje);
        }
      }

      // 2. Broadcast a la Comunidad (Si fue aprobado)
      if (accion === 'aprobado') {
        const todosUsuariosSnap = await getDocs(collection(db, 'users'));
        
        const enviosBroadcast = todosUsuariosSnap.docs.map(async (usuarioDoc) => {
          const uData = usuarioDoc.data();
          if (usuarioDoc.id !== idUsuarioCreador && uData.expoPushToken) {
            await enviarNotificacionPush(
              uData.expoPushToken,
              "📍 Nuevo Refugio Cercano",
              `Se ha habilitado "${nombrePunto}" en el mapa. Échale un vistazo para estar preparado.`
            );
          }
        });

        await Promise.all(enviosBroadcast);
      }

      Alert.alert('Éxito', `La propuesta ha sido ${accion}.`);
      cargarPropuestasPendientes();

    } catch (error) {
      console.error(`Error procesando propuesta:`, error);
      Alert.alert('Error', 'Hubo un problema procesando la propuesta.');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.nombre}</Text>
      <Text style={styles.cardDesc}>{item.descripcion || item.direccion}</Text>
      
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={[styles.button, styles.btnReject]} 
          onPress={() => procesarPropuesta(item.id, item.idUsuarioCreador, item.nombre, 'rechazado')}
        >
          <Text style={styles.btnText}>Rechazar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.btnApprove]} 
          onPress={() => procesarPropuesta(item.id, item.idUsuarioCreador, item.nombre, 'aprobado')}
        >
          <Text style={styles.btnText}>Aprobar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#EF4444" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={propuestas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15, flexGrow: 1 }} // 👈 flexGrow: 1 es vital para que el pull-to-refresh funcione vacío
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1E293B']} // Color del spinner en Android
              tintColor={'#1E293B'} // Color del spinner en iOS
            />
          }
          ListEmptyComponent={ // 👈 Movemos la pantalla vacía aquí para no perder el scroll
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay propuestas pendientes</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1E293B', padding: 20, paddingTop: 40, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 5 },
  cardDesc: { fontSize: 14, color: '#64748B', marginBottom: 15 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  btnReject: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  btnApprove: { backgroundColor: '#10B981' },
  btnText: { fontWeight: 'bold', color: '#1E293B' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#94A3B8' }
});