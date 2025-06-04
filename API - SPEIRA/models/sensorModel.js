const mongoose = require('mongoose');
const moment = require('moment-timezone');

const sensorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    ubicacion: {
       type: String,
        required: true,
        trim: true
    },
    tipo: {
        type: String,
        required: true,
        enum: ['humedad', 'pH', 'iluminación', 'agitación', 'salinidad', 'temperatura']
    },
    createdAt: {
        type: Date,
        default: () => moment().tz("America/Mexico_City").toDate()
    },
    updatedAt: {
        type: Date,
        default: () => moment().tz("America/Mexico_City").toDate()
    },
    deletedAt: {
        type: Date,
        default: null
    }
});

sensorSchema.pre('save', function (next) {
    this.updatedAt = moment().tz("America/Mexico_City").toDate();
    next();
});

module.exports = mongoose.model('Sensores', sensorSchema);
