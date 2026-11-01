import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { UserData } from '../../services/userService';
import { CampoConfig } from '../config/perfilSections';
import { COLORS } from '../theme/colors';
import CampoPerfil from './CampoPerfil';

interface Props {
  visible: boolean;
  titulo: string;
  campos: CampoConfig[];
  initialData: UserData | null;
  onClose: () => void;
  onSave: (cambios: Partial<UserData>) => Promise<void>;
}

export default function EditSectionModal({
  visible,
  titulo,
  campos,
  initialData,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<Partial<UserData>>({});
  const [saving, setSaving] = useState(false);

  // Rellenar el formulario al abrir omitiendo valores por defecto molesto
  useEffect(() => {
    if (visible && initialData) {
      const inicial: Partial<UserData> = {};
      campos.forEach((c) => {
        const val = (initialData[c.key] as string) || '';
        // Si el valor es "No especificado" o "Ninguna reportada", dejamos el input totalmente vacío
        if (
          val === 'No especificado' ||
          val === 'No especificada' ||
          val === 'Ninguna reportada' ||
          val === 'Sin condiciones de riesgo'
        ) {
          inicial[c.key] = '';
        } else {
          inicial[c.key] = val;
        }
      });
      setForm(inicial);
    }
  }, [visible, initialData, campos]);

  const handleChange = (key: keyof UserData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.dragIndicator} />
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>{titulo}</Text>
              <TouchableOpacity onPress={onClose} disabled={saving}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Campos */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {campos.map((campo) => (
              <CampoPerfil
                key={campo.key}
                campo={campo}
                value={(form[campo.key] as string) || ''}
                onChange={(value) => handleChange(campo.key, value)}
                disabled={saving}
              />
            ))}
          </ScrollView>

          {/* Botón guardar */}
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={handleGuardar}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: { marginBottom: 16 },
  dragIndicator: { display: 'none' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeIcon: { fontSize: 20, color: COLORS.textSecondary, padding: 4 },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});