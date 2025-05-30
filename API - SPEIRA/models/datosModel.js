const mongoose = require('mongoose');
const moment = require('moment-timezone');

const sensorDataSchema = new mongoose.Schema({
    estanque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estanque',
        required: true
    },
    temperatura: {
        type: Number,
        required: true
    },
    ph: {
        type: Number,
        required: true
    },
    salinidad: {
        type: Number,
        required: true
    },
    iluminacion: {
        type: Number,
        required: true
    },
    humedad: {
        type: Number,
        required: true
    },
    agitacion: {
        type: Number,
        required: true
    },
    fecha: {
        type: Date,
        default: () => moment().tz('America/Mexico_City').toDate(),
        index: true
    },
    createdAt: {
        type: Date,
        default: () => moment().tz('America/Mexico_City').toDate(),
        immutable: true
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

sensorDataSchema.index({
    fecha: 1,
    temperatura: 1,
    ph: 1
});

module.exports = mongoose.model('DatosSensor', sensorDataSchema);