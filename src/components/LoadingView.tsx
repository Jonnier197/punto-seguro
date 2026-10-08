import { ActivityIndicator, Text, View } from 'react-native';
import { styles } from '../screens/mapa/MapaScreen.styles';

export default function LoadingView() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={styles.loadingText}>Cargando Puntos Seguros...</Text>
        </View>
    );
}