const DatosSensor = require('../models/datosModel');
const Estanque = require('../models/estanqueModel');
const { obtenerRangoFechas } = require('../utils/dateCalculator');
const { generarReporte } = require('../utils/reportGenerator');
const moment = require('moment-timezone');

const ZONA_HORARIA = 'America/Mexico_City';
const PERIODOS_VALIDOS = ['diario', 'semanal', 'mensual', 'anual'];

exports.crearDato = async (req, res) => {
  try {
    const { nombre, temperatura, ph, salinidad, agitacion, humedad, iluminacion } = req.query;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del estanque es requerido' });
    }

    const errores = [];

    const rangos = {
      temperatura: { min: -10, max: 50 },
      ph: { min: 0, max: 14 },
      salinidad: { min: 0, max: 50 },
      agitacion: { min: 0, max: 100 },
      humedad: { min: 0, max: 100 },
      iluminacion: { min: 0, max: 100000 }
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

    const params = { temperatura, ph, salinidad, agitacion, humedad, iluminacion };

    for (const [param, valor] of Object.entries(params)) {
      const error = validarParametro(param, valor);
      if (error) errores.push(error);
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Parámetros inválidos', detalles: errores });
    }

    const estanque = await Estanque.findOne({ nombre });
    if (!estanque) {
      return res.status(404).json({ error: 'Estanque no encontrado' });
    }

    const datosConFecha = {
      temperatura: parseFloat(temperatura),
      ph: parseFloat(ph),
      salinidad: parseFloat(salinidad),
      agitacion: parseFloat(agitacion),
      humedad: parseFloat(humedad),
      iluminacion: parseFloat(iluminacion),
      fecha: moment.tz(ZONA_HORARIA).toDate(),
      estanque: estanque._id
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

exports.obtenerDatosPorNombreEstanque = async (req, res) => {
  try {
    const { nombre } = req.params;

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
    const nombreArchivo = `reporte_${periodo}_${fecha}.pdf`;

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
