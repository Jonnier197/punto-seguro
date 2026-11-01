import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { CampoConfig } from '../config/perfilSections';
import { COLORS } from '../theme/colors';
import DateField from './DateField';

interface Props {
  campo: CampoConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  mostrarObligatorio?: boolean;
}

// Renderiza un campo del perfil según su tipo: texto, fecha o selección.
export default function CampoPerfil({
  campo,
  value,
  onChange,
  disabled,
  mostrarObligatorio,
}: Props) {
  const label =
    mostrarObligatorio && campo.obligatorio ? `${campo.label} *` : campo.label;

  if (campo.type === 'date') {
    return (
      <DateField
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  if (campo.type === 'select') {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.chipRow}>
          {(campo.opciones || []).map((opcion) => {
            const activo = value === opcion;
            return (
              <TouchableOpacity
                key={opcion}
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => onChange(opcion)}
                disabled={disabled}
              >
                <Text style={[styles.chipText, activo && styles.chipTextActivo]}>
                  {opcion}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={campo.placeholder || ''}
        placeholderTextColor={COLORS.textLight}
        keyboardType={campo.keyboardType || 'default'}
        autoCapitalize={campo.autoCapitalize || 'sentences'}
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: { marginBottom: 14 },
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minWidth: 56,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  chipActivo: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerDark,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  chipTextActivo: { color: COLORS.dangerDark },
});
