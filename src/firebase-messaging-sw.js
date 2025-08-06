// Importa las versiones 'compat' para soporte de service workers
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Inicializa Firebase en el Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyCe1-ukYoXmUPeSQqqmmSL_bUnFsY_3hs0",
  authDomain: "speira-c84d5.firebaseapp.com",
  projectId: "speira-c84d5",
  storageBucket: "speira-c84d5.appspot.com",
  messagingSenderId: "405388809495",
  appId: "1:405388809495:web:d2d8cde904c3f4e3ec5352",
  measurementId: "G-DWJCN7HR3Y"
});

// Obtiene instancia del servicio de mensajería
const messaging = firebase.messaging();

// Escucha mensajes en segundo plano
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);

  const notificationTitle = payload?.notification?.title || 'Notificación';
  const notificationOptions = {
    body: payload?.notification?.body || 'Tienes un nuevo mensaje.',
    icon: '/assets/icon/icon.png',
    data: {
      click_action: payload?.notification?.click_action || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Maneja clics en notificaciones
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.click_action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
