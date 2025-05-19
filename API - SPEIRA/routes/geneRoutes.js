const express = require('express');
const router = express.Router();

const {
  crearDato,
  obtenerDatosPorPeriodo,
  generarReporte,
  obtenerDatosPorNombreEstanque
} = require('../controllers/sensorController');

const {
  crearEstanque,
  obtenerEstanques,
  editarEstanque
} = require('../controllers/estanqueController');

const {
  registrarUsuario,
  iniciarSesion,
  obtenerUsuarios,
  obtenerUsuariosPorNombre
} = require('../controllers/usuarioController');


router.post('/datos', crearDato); 

router.get('/datos/:periodo/:fecha', obtenerDatosPorPeriodo); 
router.post('/reportes', generarReporte);

router.post('/estanque', crearEstanque);
router.get('/estanques', obtenerEstanques);
router.put('/estanque/:id', editarEstanque);
router.get('/datos/estanque/nombre/:nombre', obtenerDatosPorNombreEstanque);

router.post('/registrar', registrarUsuario);
router.post('/iniciar-sesion', iniciarSesion);
router.get('/usuarios', obtenerUsuarios);
router.get('/usuarios/nombre/:nombre', obtenerUsuariosPorNombre);

module.exports = router;