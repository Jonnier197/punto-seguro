import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

export default function PerfilScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil del Usuario</Text>
        <Text style={styles.headerSubtitle}>Información para emergencias</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* TARJETA PRINCIPAL DE USUARIO Y TIPO DE SANGRE */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
          <Text style={styles.userName}>Jonnier Alexis Cadena Loaiza</Text>
          <Text style={styles.userRole}>Usuario Registrado • ID: 1997-1119</Text>

          {/* Destacado de Tipo de Sangre */}
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodTitle}>🩸 TIPO DE SANGRE</Text>
            <Text style={styles.bloodType}>O+</Text>
          </View>
        </View>

        {/* SECCIÓN 1: DATOS PERSONALES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Información Personal</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de Nacimiento:</Text>
            <Text style={styles.infoValue}>19 de Noviembre, 1997</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Documento:</Text>
            <Text style={styles.infoValue}>C.C. 1.000.xxx.xxx</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>+57 300 123 4567</Text>
          </View>
        </View>

        {/* SECCIÓN 2: CONTACTO DE EMERGENCIA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contacto de Emergencia</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Familiar de Contacto:</Text>
            <Text style={styles.infoValue}>Esposa</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Línea Directa:</Text>
            <Text style={[styles.infoValue, { color: '#007AFF', fontWeight: 'bold' }]}>+57 315 987 6543</Text>
          </View>
        </View>

        {/* SECCIÓN 3: INFORMACIÓN MÉDICA Y ALERGIAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Información Médica Clave</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alergias:</Text>
            <Text style={styles.infoValue}>Ninguna reportada</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Condiciones / Medicamentos:</Text>
            <Text style={styles.infoValue}>Sin condiciones de riesgo</Text>
          </View>
        </View>

        {/* BOTÓN EDITAR PERFIL */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>⚙️ Actualizar Datos Médicos</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: 30 },
  header: { alignItems: 'center', paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  headerSubtitle: { fontSize: 12, color: '#64748B' },
  content: { padding: 20 },
  userCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  userRole: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 15 },
  bloodBadge: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 15, alignItems: 'center', width: '100%' },
  bloodTitle: { fontSize: 11, fontWeight: 'bold', color: '#991B1B' },
  bloodType: { fontSize: 28, fontWeight: 'black', color: '#DC2626', marginTop: 2 },
  section: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 15, elevation: 1, borderWidth: 1, borderColor: '#F1F5F9' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { fontSize: 13, color: '#64748B' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
  editButton: { backgroundColor: '#0F172A', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  editButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});