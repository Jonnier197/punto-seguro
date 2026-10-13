import Constants, { ExecutionEnvironment } from 'expo-constants';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export interface PreferenciasAlertas {
  notificacionesActivas: boolean;
  magnitudMinima: number;
  paisFiltro: string;
}

const esExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export async function registrarParaNotificacionesPush(): Promise<string | null> {
  if (esExpoGo) {
    console.log('Modo Expo Go: Registro push simulado de forma segura.');
    return null;
  }

  try {
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');
    const { Platform } = await import('react-native');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alertas-desastres', {
        name: 'Alertas de Desastres',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF0000',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return null;

      // MODIFICACIÓN CRÍTICA: Extraemos el projectId para que el APK standalone genere el token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      
      const token = pushTokenData.data;

      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { expoPushToken: token }, { merge: true });
      }

      return token;
    }
  } catch (error) {
    console.log('Notificaciones nativas no disponibles:', error);
  }

  return null;
}

export async function guardarPreferenciasAlertas(preferencias: Partial<PreferenciasAlertas>): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { preferenciasAlertas: preferencias }, { merge: true });
  } catch (error) {
    console.error('Error guardando preferencias:', error);
  }
}

export async function obtenerPreferenciasAlertas(): Promise<PreferenciasAlertas> {
  const user = auth.currentUser;
  const porDefecto: PreferenciasAlertas = {
    notificacionesActivas: true,
    magnitudMinima: 3.0,
    paisFiltro: '',
  };

  if (!user) return porDefecto;

  try {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists() && docSnap.data().preferenciasAlertas) {
      return { ...porDefecto, ...docSnap.data().preferenciasAlertas };
    }
  } catch (error) {
    console.error('Error cargando preferencias:', error);
  }

  return porDefecto;
}

export async function enviarNotificacionPush(expoPushToken: string, title: string, body: string, data: any = {}) {
  const mensaje = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mensaje),
    });
  } catch (error) {
    console.error('Error enviando push:', error);
  }
}

export async function programarRecordatoriosLocales() {
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🏥 Previene y prepárate",
        body: "¿Tus datos están al día? Recuerda actualizar tus contactos de emergencia en el perfil de Punto Seguro.",
        sound: true,
      },
      trigger: {
        seconds: 1296000, // 15 días
        repeats: true,
      },
    });
    console.log("Recordatorios locales de prevención activados.");
  } catch (error) {
    console.log("Error en recordatorios locales:", error);
  }
}