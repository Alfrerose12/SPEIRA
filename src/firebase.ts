import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCe1-ukYoXmUPeSQqqmmSL_bUnFsY_3hs0",
  authDomain: "speira-c84d5.firebaseapp.com",
  projectId: "speira-c84d5",
  storageBucket: "speira-c84d5.appspot.com",
  messagingSenderId: "405388809495",
  appId: "1:405388809495:web:d2d8cde904c3f4e3ec5352",
  measurementId: "G-DWJCN7HR3Y"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
