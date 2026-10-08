import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, Text, View } from 'react-native';

import {
    crearPuntosAutomaticos,
    fetchPuntosSeguros,
} from '../../services/puntosService';
import { PuntoSeguro } from '../../types';

import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import MapaLeaflet from '../../components/mapa/MapaLeaflet';
import PuntoCard from '../../components/PuntoCard';

import { styles } from './MapaScreen.styles';

export default function MapaScreen() {
    const [puntos, setPuntos] = useState<PuntoSeguro[]>([]);
    const [loading, setLoading] = useState(true);

    // Params que llegan desde Inicio
    const params = useLocalSearchParams<{
        focusId?: string;
        lat?: string;
        lng?: string;
        ts?: string;
    }>();

    const focusId = params.focusId;
    const focusLat = params.lat ? parseFloat(params.lat) : undefined;
    const focusLng = params.lng ? parseFloat(params.lng) : undefined;
    // key único: cambia cuando cambian los params
    const mapaKey = `${focusId ?? 'all'}-${params.ts ?? '0'}`;

    const cargarPuntos = useCallback(async () => {
        setLoading(true);
        try {
            const lista = await fetchPuntosSeguros();
            setPuntos(lista);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'No se pudieron cargar los puntos seguros.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar al montar
    useEffect(() => {
        cargarPuntos();
    }, [cargarPuntos]);

    // Recargar cada vez que la pantalla recibe foco (por si se crean puntos nuevos)
    useFocusEffect(
        useCallback(() => {
            cargarPuntos();
        }, [cargarPuntos])
    );

    const handleCrearPuntos = async () => {
        setLoading(true);
        try {
            await crearPuntosAutomaticos();
            await cargarPuntos();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'No se pudieron crear los puntos automáticamente.');
            setLoading(false);
        }
    };

    if (loading) return <LoadingView />;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Puntos Seguros Cercanos 🗺️</Text>
                <Text style={styles.headerSubtitle}>
                    Ubicaciones de asistencia inmediata
                </Text>
            </View>

            <View style={styles.content}>
                {puntos.length === 0 ? (
                    <EmptyState onCrear={handleCrearPuntos} onRecargar={cargarPuntos} />
                ) : (
                    <View style={{ flex: 1 }}>
                        <View style={styles.mapContainer}>
                            {/* key fuerza remount cuando cambia el foco */}
                            <MapaLeaflet
                                key={mapaKey}
                                puntos={puntos}
                                focusId={focusId}
                                focusLat={focusLat}
                                focusLng={focusLng}
                            />
                        </View>

                        <FlatList
                            data={puntos}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => <PuntoCard item={item} />}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}