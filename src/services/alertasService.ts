export interface AlertaDesastre {
  id: string;
  tipo: string;
  titulo: string;
  magnitud: number;
  fecha: Date;
  latitud: number;
  longitud: number;
  profundidad: number;
  url: string;
}

export const fetchAlertasGlobales = async (): Promise<AlertaDesastre[]> => {
  let alertasCombinadas: AlertaDesastre[] = [];

  // 1. OBTENER SISMOS GLOBALES (USGS API)
  // USGS es excelente porque siempre incluye el nombre del país en el "place"
  try {
    const responseUSGS = await fetch(
      'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&limit=300&orderby=time'
    );
    const dataUSGS = await responseUSGS.json();
    
    const sismos = dataUSGS.features.map((feature: any) => ({
      id: feature.id,
      tipo: 'Sismo',
      titulo: feature.properties.place || 'Ubicación desconocida', 
      magnitud: feature.properties.mag,
      fecha: new Date(feature.properties.time),
      latitud: feature.geometry.coordinates[1],
      longitud: feature.geometry.coordinates[0],
      profundidad: feature.geometry.coordinates[2],
      url: feature.properties.url
    }));
    
    alertasCombinadas = [...alertasCombinadas, ...sismos];
  } catch (error) {
    console.error("Error obteniendo sismos del USGS:", error);
  }

  // 2. OBTENER HURACANES, VOLCANES E INUNDACIONES (GDACS API - ONU)
  try {
    const responseGDACS = await fetch('https://www.gdacs.org/xml/rss_7d.geojson');
    const dataGDACS = await responseGDACS.json();
    
    const otrosDesastres = dataGDACS.features
      .filter((f: any) => f.properties.eventtype !== 'EQ') // Ignoramos sismos globales aquí
      .map((f: any) => {
        let tipoDesastre = 'Alerta';
        if (f.properties.eventtype === 'TC') tipoDesastre = 'Huracán/Ciclón';
        if (f.properties.eventtype === 'FL') tipoDesastre = 'Inundación';
        if (f.properties.eventtype === 'VO') tipoDesastre = 'Volcán';

        return {
          id: `gdacs-${f.properties.eventid}`,
          tipo: tipoDesastre,
          titulo: `${f.properties.eventname || f.properties.country}`,
          magnitud: f.properties.severity || 1, 
          fecha: new Date(f.properties.fromdate),
          latitud: f.geometry.coordinates[1],
          longitud: f.geometry.coordinates[0],
          profundidad: 0,
          url: f.properties.url || ''
        };
      });
      
    alertasCombinadas = [...alertasCombinadas, ...otrosDesastres];
  } catch (error) {
    console.error("Error obteniendo alertas de GDACS:", error);
  }

  return alertasCombinadas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
};