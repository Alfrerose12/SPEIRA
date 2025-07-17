require('dotenv').config();
const os = require('os');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');
const swaggerUI = require('swagger-ui-express');
const conectarDB = require('./config/db');
const GeneRoutes = require('./routes/geneRoutes');
const especificacionSwagger = require('./config/swagger');
const verificarRol = require('./middleware/rolValidator');

if (!process.env.MONGO_URI) throw new Error('❌ MONGO_URI no está definida en .env');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['https://speira.site', 'http://localhost:3000', 'https://api.speira.site'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Dominio no permitido por CORS'));
    }
  },
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"]
    }
  }
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

app.use(
  '/api-docs',
  verificarRol('admin'),
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

const server = app.listen(PORT, '0.0.0.0', () => {
  const localIP = os.networkInterfaces().eth0?.[0]?.address || '127.0.0.1';
  console.log(`🚀 Servidor funcionando en:\n  📍 Local: http://localhost:${PORT}\n  🌐 Red Local: http://${localIP}:${PORT}\n  🌐 Dominio: https://api.speira.site`);
});

process.on('SIGTERM', () => {
  console.log('🛑 Apagando servidor...');
  server.close(() => process.exit(0));
});