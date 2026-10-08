import { Text, View } from 'react-native';
import { styles } from '../screens/mapa/MapaScreen.styles';
import { PuntoSeguro } from '../types';
import { getEmojiTipo } from '../utils/emojis';

interface Props {
    item: PuntoSeguro;
}

export default function PuntoCard({ item }: Props) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.typeEmoji}>{getEmojiTipo(item.tipo)}</Text>

                <View style={styles.cardTitleContainer}>
                    <Text style={styles.pointName}>{item.nombre}</Text>
                    <Text style={styles.pointType}>{item.tipo}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Dirección:</Text>
                <Text style={styles.infoValue}>{item.direccion}</Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📞 Contacto:</Text>
                <Text style={[styles.infoValue, styles.phoneText]}>
                    {item.telefono || 'Sin teléfono'}
                </Text>
            </View>

            <View style={styles.coordsBadge}>
                <Text style={styles.coordsText}>
                    Lat: {item.latitud} | Lon: {item.longitud}
                </Text>
            </View>
        </View>
    );
}
