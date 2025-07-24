require('dotenv').config();
const os = require('os');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUI = require('swagger-ui-express');
const conectarDB = require('./config/db');
const swaggerAuth = require('./middleware/swaggerAuth'); // Cambiado a swaggerAuth
const especificacionSwagger = require('./config/swagger');

if (!process.env.MONGO_URI) throw new Error('MONGO_URI no está definida en .env');
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) throw new Error('Claves VAPID no están definidas en .env');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['https://speira.site', 'https://api.speira.site'];

// Configuración de CORS
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

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"]
    }
  }
}));

// Middlewares básicos
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

// Ruta para obtener el JSON de Swagger (acceso público)
app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(especificacionSwagger);
});

// Configuración de Swagger UI
app.use(
  '/api-docs',
  swaggerAuth(), // Usamos el nuevo middleware swaggerAuth
  swaggerUI.serve,
  swaggerUI.setup(especificacionSwagger, {
    customSiteTitle: 'API Speira - Documentación',
    swaggerOptions: {
      docExpansion: 'none',
      tryItOutEnabled: false, // Deshabilita el botón "Try it out"
      persistAuthorization: true, // Mantiene la autorización entre recargas
      displayRequestDuration: true // Muestra la duración de las solicitudes
    }
  })
);

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicio del servidor
const startServer = async () => {
  try {
    await conectarDB();

    // Jobs programados
    require('./jobs/cronJobs');

    // Rutas de la API
    const GeneRoutes = require('./routes/geneRoutes');
    app.use('/api', swaggerAuth('admin'), GeneRoutes); // Protección de rutas API

    const server = app.listen(PORT, '0.0.0.0', () => {
      const localIP = os.networkInterfaces().eth0?.[0]?.address || '127.0.0.1';
      console.log(`Servidor funcionando en:
  Local: http://localhost:${PORT}
  Red Local: http://${localIP}:${PORT}
  Dominio: https://api.speira.site
  Documentación: http://localhost:${PORT}/api-docs`);
    });

    // Manejo de cierre limpio
    process.on('SIGTERM', () => {
      console.log('Apagando servidor...');
      server.close(() => process.exit(0));
    });

  } catch (err) {
    console.error('Error al iniciar el servidor:', err.message);
    process.exit(1);
  }
};

startServer();