export const getEmojiTipo = (tipo: string): string => {
  const t = (tipo || "").toLowerCase();
  if (t.includes("policía") || t.includes("policia")) return "👮‍♂️";
  if (t.includes("hospital") || t.includes("salud") || t.includes("clínica"))
    return "🏥";
  if (t.includes("bombero")) return "👨‍🚒";
  if (t.includes("agua")) return "💧";
  if (t.includes("refugio") || t.includes("albergue")) return "🏠";
  if (t.includes("acopio")) return "📦";
  return "🛡️";
};
