import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 30,
  },

  header: {
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  // ==========================================
  // MAPA
  // ==========================================

  mapContainer: {
    height: 260,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  // ==========================================
  // CARGANDO
  // ==========================================

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 14,
  },

  // ==========================================
  // TARJETA
  // ==========================================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  typeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },

  cardTitleContainer: {
    flex: 1,
  },

  pointName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },

  pointType: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },

  // ==========================================
  // INFORMACIÓN
  // ==========================================

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 4,
    gap: 10,
  },

  infoLabel: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "right",
  },

  phoneText: {
    color: "#007AFF",
    fontWeight: "bold",
  },

  // ==========================================
  // COORDENADAS
  // ==========================================

  coordsBadge: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  coordsText: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  // ==========================================
  // SIN RESULTADOS
  // ==========================================

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },

  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },

  // ==========================================
  // BOTONES
  // ==========================================

  autoButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },

  autoButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },

  reloadButton: {
    backgroundColor: "#0F172A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  reloadButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
