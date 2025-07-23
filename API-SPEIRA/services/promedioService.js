const DatosSensor = require('../models/datosModel');
const PromedioSensor = require('../models/promedioModel');

async function calcularPromedioYGuardar(estanqueId, desde, hasta, tipo) {
    const datos = await DatosSensor.find({
        estanque: estanqueId,
        fecha: {
            $gte: desde,
            $lte: hasta
        }
    });

    if (datos.length === 0) return;

    const promedio = campo =>
        datos.reduce((acc, d) => acc + d[campo], 0) / datos.length;

    const nuevoPromedio = new PromedioSensor({
        estanque: estanqueId,
        fechaInicio: desde,
        fechaFin: hasta,
        tipo,
        ph: promedio('ph'),
        temperaturaAgua: promedio('temperaturaAgua'),
        temperaturaAmbiente: promedio('temperaturaAmbiente'),
        humedad: promedio('humedad'),
        luminosidad: promedio('luminosidad'),
        conductividadElectrica: promedio('conductividadElectrica'),
        co2: promedio('co2')
    });

    await nuevoPromedio.save();
}

module.exports = calcularPromedioYGuardar;
