// components/perfil/EditProfileModal.tsx
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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { UserData } from '../../services/userService';
import { COLORS } from '../theme/colors';
import DateField from './DateField';

interface Props {
    visible: boolean;
    initialData: UserData | null;
    onClose: () => void;
    onSave: (cambios: Partial<UserData>) => Promise<void>;
}

const CAMPOS: {
    key: keyof UserData;
    label: string;
    placeholder?: string;
    keyboardType?: 'default' | 'numeric' | 'phone-pad';
    type?: 'text' | 'date';              // 👈 NUEVO
}[] = [
        { key: 'nombre', label: 'Nombre completo' },
        { key: 'tipoSangre', label: 'Tipo de sangre', placeholder: 'Ej. O+' },
        { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
        { key: 'documento', label: 'Documento', keyboardType: 'numeric' },
        { key: 'telefono', label: 'Teléfono', keyboardType: 'phone-pad' },
        { key: 'contactoEmergencia', label: 'Contacto de emergencia' },
        { key: 'telefonoEmergencia', label: 'Teléfono de emergencia', keyboardType: 'phone-pad' },
        { key: 'alergias', label: 'Alergias' },
        { key: 'condiciones', label: 'Condiciones / Medicamentos' },
    ];

export default function EditProfileModal({
    visible,
    initialData,
    onClose,
    onSave,
}: Props) {
    const [form, setForm] = useState<Partial<UserData>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (visible && initialData) setForm({ ...initialData });
    }, [visible, initialData]);

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
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Editar Perfil</Text>
                        <TouchableOpacity onPress={onClose} disabled={saving}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {CAMPOS.map((campo) => {
                            // 👇 Si es tipo date, usamos el DateField
                            if (campo.type === 'date') {
                                return (
                                    <DateField
                                        key={campo.key}
                                        label={campo.label}
                                        value={(form[campo.key] as string) || ''}
                                        onChange={(v) => handleChange(campo.key, v)}
                                        disabled={saving}
                                    />
                                );
                            }

                            // Texto normal
                            return (
                                <View key={campo.key} style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>{campo.label}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={(form[campo.key] as string) || ''}
                                        onChangeText={(t) => handleChange(campo.key, t)}
                                        placeholder={campo.placeholder || ''}
                                        placeholderTextColor={COLORS.textLight}
                                        keyboardType={campo.keyboardType || 'default'}
                                        editable={!saving}
                                    />
                                </View>
                            );
                        })}
                    </ScrollView>

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
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    closeIcon: { fontSize: 20, color: COLORS.textSecondary, padding: 4 },
    fieldContainer: { marginBottom: 12 },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});