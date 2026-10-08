import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
    title: string;
    onEdit?: () => void;
    children: ReactNode;
}

export default function SectionCard({ title, onEdit, children }: Props) {
    return (
        <View style={styles.section}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {onEdit && (
                    <TouchableOpacity onPress={onEdit} style={styles.editIcon}>
                        <Text style={styles.editIconText}>✏️</Text>
                    </TouchableOpacity>
                )}
            </View>
            {children}
        </View>
    );
}

export function InfoRow({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || 'No especificado'}</Text>
        </View>
    );
}

export function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    section: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        elevation: 1,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textTitle,
    },
    editIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconText: { fontSize: 14 },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 6,
        gap: 10,
    },
    infoLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
    infoValue: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 4,
    },
});