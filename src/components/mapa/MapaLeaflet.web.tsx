import { CENTRO_MAPA, ZOOM_MAPA } from '../../constants/puntosIniciales';
import { PuntoSeguro } from '../../types';

interface Props {
  puntos: PuntoSeguro[];
  centro?: [number, number];
  zoom?: number;
  focusId?: string;
  focusLat?: number;
  focusLng?: number;
}

export default function MapaLeaflet({
  puntos,
  centro = CENTRO_MAPA,
  zoom = ZOOM_MAPA,
  focusId,
  focusLat,
  focusLng,
}: Props) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { margin:0; padding:0; height:100%; width:100%; background:#F8FAFC; }
          .leaflet-popup-content { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${centro[0]}, ${centro[1]}], ${zoom});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19, attribution: '&copy; OpenStreetMap'
          }).addTo(map);

          var puntos = ${JSON.stringify(puntos)};
          var focusId = ${JSON.stringify(focusId ?? null)};
          var focusLat = ${focusLat ?? 'null'};
          var focusLng = ${focusLng ?? 'null'};

          function emoji(tipo) {
            var t = (tipo || '').toLowerCase();
            if (t.includes('policía') || t.includes('policia')) return '👮‍♂️';
            if (t.includes('hospital') || t.includes('salud') || t.includes('clínica')) return '🏥';
            if (t.includes('bombero')) return '👨‍🚒';
            if (t.includes('agua')) return '💧';
            if (t.includes('refugio') || t.includes('albergue')) return '🏠';
            if (t.includes('acopio')) return '📦';
            return '🛡️';
          }

          var markers = {};
          var bounds = [];

          puntos.forEach(function (p) {
            var m = L.marker([p.latitud, p.longitud], {
              icon: L.divIcon({
                html: '<div style="font-size:26px;text-align:center;">' + emoji(p.tipo) + '</div>',
                className: '', iconSize: [30,30], iconAnchor: [15,15]
              })
            }).addTo(map).bindPopup(
              '<b>' + p.nombre + '</b><br/>' + (p.direccion || '') +
              '<br/>📞 ' + (p.telefono || 'N/A')
            );
            markers[p.id] = m;
            bounds.push([p.latitud, p.longitud]);
          });

          if (focusId && markers[focusId]) {
            var mk = markers[focusId];
            var ll = mk.getLatLng();
            map.flyTo([ll.lat, ll.lng], 16, { duration: 0.8 });
            mk.openPopup();
          } else if (focusLat !== null && focusLng !== null) {
            map.flyTo([focusLat, focusLng], 16, { duration: 0.8 });
          } else if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [30, 30] });
          } else if (bounds.length === 1) {
            map.setView(bounds[0], 15);
          }
        </script>
      </body>
    </html>
  `;

  // @ts-ignore
  return (
    <iframe
      srcDoc={html}
      title="mapa"
      style={{ border: 'none', width: '100%', height: '100%' }}
    />
  );
}