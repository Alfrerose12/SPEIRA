const mongoose = require('mongoose');
const moment = require('moment-timezone');
const bcrypt = require('bcrypt');

const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    rol: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: moment.tz("America/Mexico_City").format()
    },
    updatedAt: {
        type: Date,
        default: moment.tz("America/Mexico_City").format()
    },
    deletedAt: {
        type: Date,
        default: null
    }
});

UsuarioSchema.methods.compararPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UsuarioSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

module.exports = mongoose.model('Usuarios', UsuarioSchema);