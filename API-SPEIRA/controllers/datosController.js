const DatosSensor = require('../models/datosModel');
const Estanque = require('../models/estanqueModel');
const { obtenerRangoFechas } = require('../utils/dateCalculator');
const { generarReporte } = require('../utils/reportGenerator');
const moment = require('moment-timezone');

const ZONA_HORARIA = 'America/Mexico_City';
const PERIODOS_VALIDOS = ['diario', 'semanal', 'mensual', 'anual'];

exports.crearDato = async (req, res) => {
  try {
    const {
      estanqueId,
      nombre,
      ph,
      temperaturaAgua,
      temperaturaAmbiente,
      humedad,
      luminosidad,
      conductividadElectrica,
      co2
    } = req.body;

    const errores = [];

    const rangos = {
      ph: { min: 0, max: 14 },
      temperaturaAgua: { min: -10, max: 50 },
      temperaturaAmbiente: { min: -10, max: 50 },
      humedad: { min: 0, max: 100 },
      luminosidad: { min: 0, max: 100000 },
      conductividadElectrica: { min: 0, max: 100000 },
      co2: { min: 0, max: 1000 }
    };

    function validarParametro(nombreParam, valor) {
      if (valor === undefined || isNaN(valor)) {
        return `${nombreParam} inválido o faltante`;
      }
      const num = parseFloat(valor);
      if (num < rangos[nombreParam].min || num > rangos[nombreParam].max) {
        return `${nombreParam} fuera de rango (${rangos[nombreParam].min} - ${rangos[nombreParam].max})`;
      }
      return null;
    }

    const params = { ph, temperaturaAgua, temperaturaAmbiente, humedad, luminosidad, conductividadElectrica, co2 };

    for (const [param, valor] of Object.entries(params)) {
      const error = validarParametro(param, valor);
      if (error) errores.push(error);
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Parámetros inválidos', detalles: errores });
    }

    let estanque = null;

    if (estanqueId) {
      estanque = await Estanque.findById(estanqueId);
    } else if (nombre) {
      const nombreNormalizado = nombre.trim();
      estanque = await Estanque.findOne({ nombre: { $regex: `^${nombreNormalizado}$`, $options: 'i' } });
    }

    if (!estanque) {
      return res.status(404).json({ error: 'Estanque no encontrado' });
    }

    const datosConFecha = {
      ph: parseFloat(ph),
      temperaturaAgua: parseFloat(temperaturaAgua),
      temperaturaAmbiente: parseFloat(temperaturaAmbiente),
      humedad: parseFloat(humedad),
      luminosidad: parseFloat(luminosidad),
      conductividadElectrica: parseFloat(conductividadElectrica),
      co2: parseFloat(co2),
      fecha: moment.tz(ZONA_HORARIA).toDate(),
      estanque: estanque.id
    };

    const nuevoDato = new DatosSensor(datosConFecha);
    await nuevoDato.save();

    const datoRespuesta = {
      ...nuevoDato._doc,
      fecha: moment(nuevoDato.fecha).tz(ZONA_HORARIA).format('YYYY-MM-DD HH:mm')
    };

    res.status(201).json(datoRespuesta);
  } catch (error) {
    res.status(400).json({
      error: 'Error al registrar datos',
      detalles: error.message
    });
  }
};

exports.obtenerDatosGenerales = async (req, res) => {
  try {
    const estanques = await Estanque.find();

    if (estanques.length === 0) {
      return res.status(404).json({ mensaje: 'No hay estanques registrados' });
    }

    const resumen = await Promise.all(
      estanques.map(async (estanque) => {
        const ultimoDato = await DatosSensor.findOne({ estanque: estanque._id })
          .sort({ fecha: -1 });

        return {
          estanqueId: estanque._id,
          nombre: estanque.nombre,
          fecha: ultimoDato ? moment(ultimoDato.fecha).tz(ZONA_HORARIA).format('YYYY-MM-DD HH:mm') : null,
          datos: ultimoDato
            ? {
                ph: ultimoDato.ph,
                temperaturaAgua: ultimoDato.temperaturaAgua,
                temperaturaAmbiente: ultimoDato.temperaturaAmbiente,
                humedad: ultimoDato.humedad,
                luminosidad: ultimoDato.luminosidad,
                conductividadElectrica: ultimoDato.conductividadElectrica,
                co2: ultimoDato.co2
              }
            : null
        };
      })
    );

    res.json({
      zona_horaria: ZONA_HORARIA,
      total_estanques: resumen.length,
      resumen
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener datos generales',
      detalles: error.message
    });
  }
};


exports.obtenerDatosPorPeriodo = async (req, res) => {
  try {
    const { periodo, fecha } = req.params;

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return res.status(400).json({
        error: 'Período inválido',
        opciones_validas: PERIODOS_VALIDOS
      });
    }

    const formatos = {
      diario: 'YYYY-MM-DD',
      semanal: 'YYYY-MM-DD',
      mensual: 'YYYY-MM',
      anual: 'YYYY'
    };

    if (!moment(fecha, formatos[periodo], true).isValid()) {
      return res.status(400).json({
        error: 'Formato de fecha inválido',
        formato_requerido: formatos[periodo],
        ejemplo: periodo === 'diario' ? '2024-05-04' :
          periodo === 'semanal' ? '2024-05-06 (debe ser lunes)' :
            periodo === 'mensual' ? '2024-05' : '2024'
      });
    }

    if (periodo === 'semanal' && moment(fecha).day() !== 1) {
      return res.status(400).json({
        error: 'Fecha inválida para reporte semanal',
        detalles: 'Debe proporcionar una fecha que sea día lunes',
        ejemplo: moment().startOf('isoWeek').format('YYYY-MM-DD')
      });
    }

    const { fechaInicio, fechaFin } = obtenerRangoFechas(periodo, fecha);

    const datos = await DatosSensor.find({
      fecha: {
        $gte: moment.tz(fechaInicio, ZONA_HORARIA).toDate(),
        $lte: moment.tz(fechaFin, ZONA_HORARIA).toDate()
      }
    }).sort({ fecha: 1 });

    if (datos.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron datos',
        periodo: `${periodo} (${fecha})`
      });
    }

    const datosFormateados = datos.map(dato => ({
      ...dato._doc,
      fecha: moment(dato.fecha).tz(ZONA_HORARIA).format('YYYY-MM-DD HH:mm')
    }));

    res.json({
      zona_horaria: ZONA_HORARIA,
      cantidad_datos: datos.length,
      datos: datosFormateados
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al consultar datos',
      detalles: error.message
    });
  }
};

exports.obtenerDatosPorEstanque = async (req, res) => {
  try {
    const { nombre } = req.body;

    const estanque = await Estanque.findOne({ nombre });
    if (!estanque) {
      return res.status(404).json({ error: 'Estanque no encontrado' });
    }

    const datos = await DatosSensor.find({ estanque: estanque._id }).sort({ fecha: -1 });
    if (datos.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron datos para el estanque',
        estanque: nombre
      });
    }

    const datosFormateados = datos.map(dato => ({
      ...dato._doc,
      fecha: moment(dato.fecha).tz(ZONA_HORARIA).format('YYYY-MM-DD HH:mm')
    }));

    res.json({
      zona_horaria: ZONA_HORARIA,
      cantidad_datos: datos.length,
      datos: datosFormateados
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al consultar datos',
      detalles: error.message
    });
  }
};

exports.generarReporteporEstanque = async (req, res) => {
  try {
    const { periodo, fecha, estanque } = req.body;

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return res.status(400).json({
        error: 'Período inválido',
        opciones_validas: PERIODOS_VALIDOS
      });
    }

    const formatos = {
      diario: 'YYYY-MM-DD',
      semanal: 'YYYY-MM-DD',
      mensual: 'YYYY-MM',
      anual: 'YYYY'
    };

    if (!moment(fecha, formatos[periodo], true).isValid()) {
      return res.status(400).json({
        error: 'Formato de fecha inválido',
        formato_requerido: formatos[periodo],
        ejemplo: periodo === 'diario' ? '2024-05-04' :
          periodo === 'semanal' ? '2024-05-06 (debe ser lunes)' :
            periodo === 'mensual' ? '2024-05' : '2024'
      });
    }

    if (periodo === 'semanal' && moment(fecha).day() !== 1) {
      return res.status(400).json({
        error: 'Fecha inválida para reporte semanal',
        detalles: 'Debe proporcionar una fecha que sea día lunes',
        ejemplo: moment().startOf('isoWeek').format('YYYY-MM-DD')
      });
    }

    const rutaReporte = await generarReporte(periodo, fecha, estanque);
    const nombreArchivo = `reporte_${estanque}_${periodo}_${fecha}.pdf`.replace(/\s+/g, '_');

    res.download(rutaReporte, nombreArchivo, err => {
      if (err) {
        console.error('Error al descargar reporte:', err);
        res.status(500).json({ error: 'Error al generar el reporte' });
      }
    });

  } catch (error) {
    res.status(400).json({
      error: 'Error al generar reporte',
      detalles: error.message
    });
  }
};

exports.generarReporte = async (req, res) => {
  try {
    const { periodo, fecha } = req.body;

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return res.status(400).json({
        error: 'Período inválido',
        opciones_validas: PERIODOS_VALIDOS
      });
    }

    const formatos = {
      diario: 'YYYY-MM-DD',
      semanal: 'YYYY-MM-DD',
      mensual: 'YYYY-MM',
      anual: 'YYYY'
    };

    if (!moment(fecha, formatos[periodo], true).isValid()) {
      return res.status(400).json({
        error: 'Formato de fecha inválido',
        formato_requerido: formatos[periodo],
        ejemplo: periodo === 'diario' ? '2024-05-04' :
          periodo === 'semanal' ? '2024-05-06 (debe ser lunes)' :
            periodo === 'mensual' ? '2024-05' : '2024'
      });
    }

    if (periodo === 'semanal' && moment(fecha).day() !== 1) {
      return res.status(400).json({
        error: 'Fecha inválida para reporte semanal',
        detalles: 'Debe proporcionar una fecha que sea día lunes',
        ejemplo: moment().startOf('isoWeek').format('YYYY-MM-DD')
      });
    }

    const rutaReporte = await generarReporte(periodo, fecha);
    const nombreArchivo = `reporte_${periodo}_${fecha}.pdf`.replace(/\s+/g, '_');

    res.download(rutaReporte, nombreArchivo, err => {
      if (err) {
        console.error('Error al descargar reporte:', err);
        res.status(500).json({ error: 'Error al generar el reporte' });
      }
    });

  } catch (error) {
    res.status(400).json({
      error: 'Error al generar reporte',
      detalles: error.message
    });
  }
};