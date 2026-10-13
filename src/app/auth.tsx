import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../../config/firebase';
import { styles } from '../styles/authStyles';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // Estado para controlar la visibilidad de la contraseña
  const [verPassword, setVerPassword] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !nombre)) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (docSnap.exists()) {
          const nombreGuardado = docSnap.data().nombre || 'Usuario';
          await AsyncStorage.setItem('nombreUsuario', nombreGuardado);
        } else {
          await AsyncStorage.setItem('nombreUsuario', 'Usuario');
        }

        Alert.alert('¡Bienvenido!', 'Sesión iniciada correctamente.');

      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          nombre: nombre.trim(),
          email: email.trim(),
          tipoSangre: 'O+',
          fechaNacimiento: 'No especificada',
          documento: 'No especificado',
          telefono: 'No especificado',
          contactoEmergencia: 'No especificado',
          telefonoEmergencia: 'No especificado',
          alergias: 'Ninguna reportada',
          condiciones: 'Sin condiciones de riesgo',
          rol: 'usuario',
          createdAt: new Date().toISOString(),
        });

        await AsyncStorage.setItem('nombreUsuario', nombre.trim());

        Alert.alert('¡Éxito!', 'Usuario registrado correctamente.');
      }

      router.replace('/');

    } catch (error: any) {
      let message = 'Ocurrió un error al procesar la solicitud.';
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'El correo electrónico no es válido.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Correo o contraseña incorrectos.';
          break;
        case 'auth/email-already-in-use':
          message = 'El correo ya está registrado.';
          break;
        case 'auth/weak-password':
          message = 'La contraseña debe tener al menos 6 caracteres.';
          break;
        case 'auth/network-request-failed':
          message = 'No se pudo conectar con Firebase. Revisa tu conexión.';
          break;
      }
      Alert.alert('Error de Autenticación', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Punto Seguro 🛡️</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Inicia sesión para continuar' : 'Crea una cuenta nueva'}
        </Text>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor="#94A3B8"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* CONTENEDOR MODIFICADO PARA LA CONTRASEÑA */}
        <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingRight: 10 }]}>
          <TextInput
            style={{ flex: 1, padding: 0, margin: 0, color: '#FFFFFF', fontSize: 16 }} // Le quitamos el padding interno para que no engorde la caja
            placeholder="Contraseña"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!verPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPressIn={() => setVerPassword(true)}
            onPressOut={() => setVerPassword(false)}
            style={{ paddingHorizontal: 5 }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20 }}>{verPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            {isLogin
              ? '¿No tienes cuenta? Regístrate aquí'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}