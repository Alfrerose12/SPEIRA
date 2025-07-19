const express = require('express');
const router = express.Router();

const {
  crearDato,
  obtenerDatosPorPeriodo,
  generarReporte,
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
  guardarSuscripcion,
  enviarNotificacion
} = require('../controllers/notificationController');

router.post('/suscripcion', guardarSuscripcion);
router.post('/sendNotification', enviarNotificacion);

router.post('/datos', crearDato);
router.get('/datos/generales', obtenerDatosGenerales);
router.get('/datos/estanque/:nombre', obtenerDatosPorNombreEstanque);
router.get('/datos/:periodo/:fecha', obtenerDatosPorPeriodo);
router.post('/datos/reportes', generarReporte);

router.post('/estanque', crearEstanque);
router.put('/estanque/:nombre', editarEstanque);
router.delete('/estanque/:nombre', eliminarEstanque);
router.get('/estanques', obtenerEstanques);

router.post('/usuario/registro', registrarUsuario);
router.put('/usuario/:id', editarUsuario);
router.delete('/usuario/:id', eliminarUsuario);
router.post('/usuario/iniciar-sesion', iniciarSesion);
router.get('/usuario/cerrar-sesion', cerrarSesion);
router.get('/usuarios', obtenerUsuarios);
router.get('/usuarios/:nombre', obtenerUsuariosPorNombre);

module.exports = router;