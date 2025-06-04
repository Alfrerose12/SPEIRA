const express = require('express');
const router = express.Router();

const {
  crearDato,
  obtenerDatosPorPeriodo,
  generarReporte,
  obtenerDatosPorNombreEstanque
} = require('../controllers/datosController');

const {
  crearSensor,
  obtenerSensores,
  editarSensor,
  eliminarSensor,
  obtenerSensoresPorEstanque
} = require('../controllers/sensorController');

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


router.post('/datos', crearDato); 
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

router.post('/sensor', crearSensor);
router.put('/sensor/:id', editarSensor);
router.delete('/sensor/:id', eliminarSensor);
router.get('/sensores', obtenerSensores);
router.get('/sensores/estanque/:nombreEstanque', obtenerSensoresPorEstanque);

module.exports = router;