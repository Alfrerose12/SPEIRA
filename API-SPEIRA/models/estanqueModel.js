const mongoose = require('mongoose');
const moment = require('moment-timezone');

const EstanqueSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: () => moment().tz('America/Mexico_City').toDate(),
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: () => moment().tz('America/Mexico_City').toDate()
    },
    deletedAt: {
        type: Date,
        default: null
    }
});

// Campo virtual para datosSensors (no se guarda en MongoDB)
EstanqueSchema.virtual('datosSensors');

// Permitir que los virtuales aparezcan en JSON
EstanqueSchema.set('toJSON', { virtuals: true });
EstanqueSchema.set('toObject', { virtuals: true });

EstanqueSchema.pre('save', function (next) {
    this.updatedAt = moment().tz('America/Mexico_City').toDate();
    next();
});

module.exports = mongoose.model('Estanques', EstanqueSchema);