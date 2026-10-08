import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../screens/mapa/MapaScreen.styles';

interface Props {
    onCrear: () => void;
    onRecargar: () => void;
}

export default function EmptyState({ onCrear, onRecargar }: Props) {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📍</Text>

            <Text style={styles.emptyText}>
                No hay puntos seguros registrados{'\n'}en Firestore.
            </Text>

            <TouchableOpacity style={styles.autoButton} onPress={onCrear}>
                <Text style={styles.autoButtonText}>
                    ⚡ Crear Puntos Automáticamente
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reloadButton} onPress={onRecargar}>
                <Text style={styles.reloadButtonText}>🔄 Recargar</Text>
            </TouchableOpacity>
        </View>
    );
}