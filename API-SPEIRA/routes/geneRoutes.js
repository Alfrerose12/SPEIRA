const express = require('express');
const router = express.Router();

const verificarRol = require('../middlewares/rolValidator');

const {
  crearDato,
  obtenerDatosPorPeriodo,
  generarReporte,
  generarReporteporEstanque,
  obtenerDatosPorNombreEstanque,
  obtenerDatosGenerales
} = require('../controllers/datosController');

const {
  crearEstanque,
  obtenerEstanques,
  editarEstanque,
  eliminarEstanque
} = require('../controllers/estanqueController');

const {
  registrarUsuario,
  editarUsuario,
  eliminarUsuario,
  iniciarSesion,
  obtenerUsuarios,
  obtenerUsuariosPorNombre,
  cerrarSesion
} = require('../controllers/usuarioController');

const {
  guardarToken,
  enviarNotificacion
} = require('../controllers/notificationController');

// Notificaciones - públicas
router.post('/notificaciones/token', guardarToken);
router.post('/notificaciones', enviarNotificacion);

// Datos
router.post('/datos', verificarRol('admin'), crearDato);
router.get('/datos/generales', verificarRol('admin'), obtenerDatosGenerales);
router.get('/datos/estanque/:nombre', verificarRol('admin'), obtenerDatosPorNombreEstanque);
router.get('/datos/:periodo/:fecha', verificarRol('admin'), obtenerDatosPorPeriodo);
router.post('/datos/reportes/estanque', verificarRol('admin'), generarReporteporEstanque);
router.post('/datos/reportes', verificarRol('admin'), generarReporte);

// Estanques (solo admin)
router.post('/estanque', verificarRol('admin'), crearEstanque);
router.put('/estanque/:nombre', verificarRol('admin'), editarEstanque);
router.delete('/estanque/:nombre', verificarRol('admin'), eliminarEstanque);
router.get('/estanques', verificarRol('admin'), obtenerEstanques);

// Usuarios
router.post('/usuario/registro', registrarUsuario);  // público para crear usuario
router.post('/usuario/iniciar-sesion', iniciarSesion);  // público para login
router.get('/usuario/cerrar-sesion', cerrarSesion);  // podría protegerse si quieres

// Rutas protegidas para admin
router.put('/usuario/:id', verificarRol('admin'), editarUsuario);
router.delete('/usuario/:id', verificarRol('admin'), eliminarUsuario);
router.get('/usuarios', verificarRol('admin'), obtenerUsuarios);
router.get('/usuarios/:nombre', verificarRol('admin'), obtenerUsuariosPorNombre);

module.exports = router;
