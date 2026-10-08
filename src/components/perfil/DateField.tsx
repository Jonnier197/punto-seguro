import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { COLORS } from '../theme/colors';

interface Props {
    label: string;
    value: string;               // formateado: "DD/MM/AAAA"
    onChange: (value: string) => void;
    disabled?: boolean;
}

// Convierte "DD/MM/AAAA" → Date
function parseFecha(str: string): Date {
    if (!str) return new Date(2000, 0, 1);
    const [d, m, y] = str.split('/').map(Number);
    if (!d || !m || !y) return new Date(2000, 0, 1);
    return new Date(y, m - 1, d);
}

// Convierte Date → "DD/MM/AAAA"
function formatFecha(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

export default function DateField({ label, value, onChange, disabled }: Props) {
    const [show, setShow] = useState(false);

    const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
        if (Platform.OS === 'android') setShow(false);
        if (event.type === 'dismissed') return;
        if (selected) onChange(formatFecha(selected));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity
                style={[styles.input, disabled && { opacity: 0.6 }]}
                onPress={() => !disabled && setShow(true)}
                activeOpacity={0.7}
            >
                <Text style={[styles.inputText, !value && { color: COLORS.textLight }]}>
                    {value || 'Seleccionar fecha'}
                </Text>
                <Text style={styles.icon}>📅</Text>
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={parseFecha(value)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleChange}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 12 },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputText: { fontSize: 14, color: COLORS.textPrimary },
    icon: { fontSize: 16 },
});
