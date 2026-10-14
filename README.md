# 🛡️ Punto Seguro

> Aplicación móvil colaborativa en tiempo real para la gestión, notificación y ubicación de puntos de atención, refugio y alertas ante situaciones de emergencia.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000000?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## 📱 Descripción

**Punto Seguro** es una solución móvil diseñada para conectar a la comunidad en situaciones de riesgo o desastres naturales. Permite a los usuarios ubicar puntos de socorro cercanos en un mapa interactivo, proponer nuevos lugares de ayuda, gestionar información médica de emergencia y recibir notificaciones push en tiempo real sobre alertas sísmicas y actualización de propuestas.

---

## ✨ Características Principales

- **🗺️ Mapa Interactivo en Tiempo Real:** Visualización de puntos de ayuda aprobados con cálculo de distancia automática desde la ubicación actual del usuario.
- **🔔 Notificaciones Push Bidireccionales:** 
  - Alertas instantáneas a administradores cuando se propone un nuevo punto.
  - Notificaciones personalizadas al usuario cuando su propuesta es aprobada o modificada.
- **📲 Actualizaciones Over-The-Air (EAS Update):** Despliegue de mejoras y parches en caliente sin necesidad de reinstalar la APK.
- **📑 Moderación de Puntos:** Sistema de roles (`usuario` / `admin`) para revisar, aprobar o eliminar solicitudes de la comunidad.
- **🏥 Perfil de Emergencia:** Registro de datos clave (grupo sanguíneo, alergias, condiciones médicas y contactos directos de emergencia).
- **🔒 Autenticación Segura:** Inicio de sesión y registro con validaciones de visibilidad de credenciales e integración con Firebase Auth.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** React Native + Expo (Expo Router)
- **Lenguaje:** TypeScript
- **Base de Datos & Auth:** Firebase Firestore & Firebase Auth
- **Notificaciones Push:** Expo Notifications & EAS Push Service
- **Geolocalización:** Expo Location & React Native Maps
- **Despliegue OTA:** EAS Updates (Expo Application Services)

## 📄 Licencia

- Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.