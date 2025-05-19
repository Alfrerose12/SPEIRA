require('dotenv').config();
const mongoose = require('mongoose');

const conectarDB = async () => {
  try {

    if (!process.env.MONGO_URI) {
      throw new Error('❌ La URI de MongoDB no está definida en .env');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1); 
  }
};

module.exports = conectarDB;