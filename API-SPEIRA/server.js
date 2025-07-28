require('dotenv').config();
const os = require('os');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUI = require('swagger-ui-express');
const conectarDB = require('./config/db');
const swaggerAuth = require('./middleware/swaggerAuth');
const especificacionSwagger = require('./config/swagger');

if (!process.env.MONGO_URI) throw new Error('MONGO_URI no está definida en .env');
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) throw new Error('Claves VAPID no están definidas en .env');

// Herramientas de diagnóstico de memoria
const memwatch = require('memwatch-next');
const heapdump = require('heapdump');

// Detectar fugas automáticamente
memwatch.on('leak', (info) => {
  console.error('⚠️ Memory leak detectada:', info);
});

// Mostrar estadísticas de uso de memoria
memwatch.on('stats', (stats) => {
  console.log('📊 Estadísticas de memoria:', stats);
});

// Guardar un snapshot del heap cada 5 minutos
setInterval(() => {
  const filename = `/usr/src/app/heap-${Date.now()}.heapsnapshot`;
  heapdump.writeSnapshot(filename, (err, filename) => {
    if (err) {
      console.error('Error al guardar snapshot:', err);
    } else {
      console.log('Snapshot de heap guardado en:', filename);
    }
  });
}, 5 * 60 * 1000); // 5 minutos


const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['https://speira.site', 'https://api.speira.site'];

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

app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(especificacionSwagger);
});

app.use(
  '/api-docs',
  swaggerAuth(),
  swaggerUI.serve,
  swaggerUI.setup(especificacionSwagger, {
    customSiteTitle: 'API Speira - Documentación',
    swaggerOptions: {
      docExpansion: 'none',
      tryItOutEnabled: false,
      persistAuthorization: true,
      displayRequestDuration: true
    }
  })
);

const geneRoutes = require('./routes/geneRoutes');
app.use('/api', geneRoutes);  

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const startServer = async () => {
  try {
    await conectarDB();
    require('./jobs/cronJobs');

    const server = app.listen(PORT, '0.0.0.0', () => {
      const localIP = os.networkInterfaces().eth0?.[0]?.address || '127.0.0.1';
      console.log(`Servidor funcionando en:
Local: http://localhost:${PORT}
Red Local: http://${localIP}:${PORT}
Dominio: https://api.speira.site
Documentación: http://localhost:${PORT}/api-docs`);
    });

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
