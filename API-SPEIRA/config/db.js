require('dotenv').config();
const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('La URI de MongoDB no está definida en .env');
    }

    const dbName = mongoURI.match(/\/([^/?]+)/)?.[1] || 'desconocida';

    const opciones = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
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

  } catch (error) {
    console.error('Error de conexión:',
      error.message.includes('Authentication failed')
        ? 'Credenciales incorrectas en .env'
        : error.message);

    if (!error.message.includes('auth')) {
      setTimeout(conectarDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = conectarDB;