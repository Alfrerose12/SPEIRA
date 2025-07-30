const mongoose = require('mongoose');

const promedioSensorSchema = new mongoose.Schema({
    estanque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estanques',
        required: true
    },
    estanqueNombre: {
        type: String,
        required: true
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    tipo: {
        type: String,
        enum: ['diario', 'semanal', 'mensual', 'anual'],
        required: true
    },
    ph: Number,
    temperaturaAgua: Number,
    temperaturaAmbiente: Number,
    humedad: Number,
    luminosidad: Number,
    conductividadElectrica: Number,
    co2: Number,
    creadoEn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PromedioSensor', promedioSensorSchema);
