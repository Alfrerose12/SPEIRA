require('dotenv').config();
const os = require('os');
const express = require('express');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');
const swaggerUI = require('swagger-ui-express');
const conectarDB = require('./config/db');
const GeneRoutes = require('./routes/geneRoutes');
const especificacionSwagger = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

const getLocalIPAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {

      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; 
};

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

app.use('/api-docs', auth);

app.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(especificacionSwagger, {
    customSiteTitle: 'API Speira - Documentación',
  })
);

conectarDB();

app.use('/api', GeneRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIPAddress();
  console.log(`🚀 Servidor funcionando en:`);
  console.log(`  📍 Local: http://localhost:${PORT}`);
  console.log(`  🌐 Red: http://${localIP}:${PORT}`);
  console.log(`  📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
});