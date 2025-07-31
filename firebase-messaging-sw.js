// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCe1-ukYoXmUPeSQqqmmSL_bUnFsY_3hs0",
  authDomain: "speira-c84d5.firebaseapp.com",
  projectId: "speira-c84d5",
  storageBucket: "speira-c84d5.appspot.com",
  messagingSenderId: "405388809495",
  appId: "1:405388809495:web:d2d8cde904c3f4e3ec5352",
  measurementId: "G-DWJCN7HR3Y"
});

const messaging = firebase.messaging();

// Este evento permite mostrar la notificación cuando la app esté en segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icon/icon.png' // Cambia el ícono si deseas
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
