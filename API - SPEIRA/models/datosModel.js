const mongoose = require('mongoose');
const moment = require('moment-timezone');

const sensorDataSchema = new mongoose.Schema({
    estanque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estanques',
        required: true
    },
    ph: {
        type: Number,
        required: true
    },
    temperaturaAgua: {
        type: Number,
        required: true
    },
    temperaturaAmbiente: {
        type: Number,
        required: true
    },
    humedad: {
        type: Number,
        required: true
    },
    luminosidad: {
        type: Number,
        required: true
    },
    conductividadElectrica: {
        type: Number,
        required: true
    },
    co2: {
        type: Number,
        required: true
    },
    fecha: {
        type: Date,
        default: () => moment().tz('America/Mexico_City').toDate(),
        index: true
    },
    updatedAt: {
        type: Date,
        default: () => moment().tz('America/Mexico_City').toDate()
    }
},
);

sensorDataSchema.pre('save', function (next) {
    this.updatedAt = moment().tz('America/Mexico_City').toDate();
    next();
});

sensorDataSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: moment().tz('America/Mexico_City').toDate() });
    next();
});

module.exports = mongoose.model('DatosSensor', sensorDataSchema);