require('dotenv').config();
const mongoose = require('mongoose');

const conectarDB = async (maxRetries = 5, delay = 5000) => {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const mongoURI = process.env.MONGO_URI;
      if (!mongoURI) {
        throw new Error('La URI de MongoDB no está definida en .env');
      }

      const dbName = mongoURI.match(/\/([^/?]+)/)?.[1] || 'desconocida';

      const opciones = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      };

      await mongoose.connect(mongoURI, opciones);

      console.log(`Conectado a MongoDB (DB: ${dbName})`);

      mongoose.connection.on('error', (err) => {
        console.error('Error de MongoDB:', err.message.includes('auth')
          ? 'Fallo de autenticación - Verifica .env'
          : err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('Desconectado de MongoDB');
        if (!process.env.MONGO_URI.includes('password')) {
          console.error('URI no contiene credenciales!');
        }
      });

      return; 

    } catch (error) {
      attempts++;
      console.error(`Intento ${attempts} - Error de conexión:`,
        error.message.includes('Authentication failed')
          ? 'Credenciales incorrectas en .env'
          : error.message);

      if (error.message.includes('auth')) {
        process.exit(1);
      }

      if (attempts < maxRetries) {
        console.log(`Reintentando en ${delay / 1000} segundos...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('No se pudo conectar a MongoDB tras varios intentos.');
        process.exit(1);
      }
    }
  }
};

module.exports = conectarDB;
