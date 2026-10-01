import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import {
  doc,
  setDoc,
} from 'firebase/firestore';

import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebase';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleAuth = async () => {
    // Validar campos
    if (
      !email ||
      !password ||
      (!isLogin && !nombre)
    ) {
      Alert.alert(
        'Error',
        'Por favor completa todos los campos.'
      );
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // =========================
        // INICIAR SESIÓN
        // =========================
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        Alert.alert(
          '¡Bienvenido!',
          'Sesión iniciada correctamente.'
        );

      } else {
        // =========================
        // REGISTRAR USUARIO
        // =========================

        // 1. Crear usuario en Firebase Authentication
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        const user = userCredential.user;

        // 2. Guardar información del usuario en Firestore
        await setDoc(
          doc(db, 'users', user.uid),
          {
            nombre: nombre.trim(),
            email: email.trim(),

            // Información médica
            tipoSangre: 'O+',
            fechaNacimiento: 'No especificada',
            documento: 'No especificado',
            telefono: 'No especificado',

            // Contacto de emergencia
            contactoEmergencia: 'No especificado',
            telefonoEmergencia: 'No especificado',

            // Información médica adicional
            alergias: 'Ninguna reportada',
            condiciones: 'Sin condiciones de riesgo',

            // Fecha de creación
            createdAt: new Date().toISOString(),
          }
        );

        Alert.alert(
          '¡Éxito!',
          'Usuario registrado correctamente.'
        );
      }

      // Ir a la pantalla principal
      router.replace('/');

    } catch (error: any) {
      let message =
        'Ocurrió un error al procesar la solicitud.';

      switch (error.code) {
        case 'auth/invalid-email':
          message =
            'El correo electrónico no es válido.';
          break;

        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message =
            'Correo o contraseña incorrectos.';
          break;

        case 'auth/email-already-in-use':
          message =
            'El correo ya está registrado.';
          break;

        case 'auth/weak-password':
          message =
            'La contraseña debe tener al menos 6 caracteres.';
          break;

        case 'auth/network-request-failed':
          message =
            'No se pudo conectar con Firebase. Revisa tu conexión a Internet.';
          break;
      }

      Alert.alert(
        'Error de Autenticación',
        message
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.card}>

        {/* Título */}
        <Text style={styles.title}>
          Punto Seguro 🛡️
        </Text>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>
          {isLogin
            ? 'Inicia sesión para continuar'
            : 'Crea una cuenta nueva'}
        </Text>

        {/* Campo de nombre */}
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

        {/* Campo de correo */}
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

        {/* Campo de contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Botón principal */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin
                ? 'Iniciar Sesión'
                : 'Registrarse'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Cambiar entre Login y Registro */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },

  input: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },

  button: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },

  switchText: {
    color: '#3B82F6',
    fontSize: 14,
  },
});