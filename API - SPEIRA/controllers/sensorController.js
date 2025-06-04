const Sensor = require('../models/sensorModel');
const Estanque = require('../models/estanqueModel');

exports.crearSensor = async (req, res) => {
    try {
        const { nombre, tipo, ubicacion } = req.body; 

        const estanque = await Estanque.findOne({ nombre: ubicacion, deletedAt: null });
        if (!estanque) {
            return res.status(404).json({ error: 'Estanque no encontrado' });
        }

        const nuevoSensor = new Sensor({ nombre, tipo, ubicacion });
        await nuevoSensor.save();

        res.status(201).json(nuevoSensor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.editarSensor = async (req, res) => {
    try {
        const { id } = req.params;
        const sensorActualizado = await Sensor.findByIdAndUpdate(id
            , req.body, { new: true });
        if (!sensorActualizado) {
            return res.status(404).json({ error: 'Sensor no encontrado' });
        }
        res.json(sensorActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.eliminarSensor = async (req, res) => {
    try {
        const { id } = req.params;
        const sensorEliminado = await Sensor.findByIdAndDelete(id);
        if (!sensorEliminado) {
            return res.status(404).json({ error: 'Sensor no encontrado' });
        }
        res.json({ message: 'Sensor eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerSensores = async (req, res) => {
    try {
        const sensores = await Sensor.find().populate('ubicacion');

        if (sensores.length === 0) {
            return res.status(200).json({ mensaje: 'No hay sensores registrados' });
        }

        res.status(200).json(sensores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.obtenerSensoresPorEstanque = async (req, res) => {
    try {
        const { nombreEstanque } = req.params;

        const estanque = await Estanque.findOne({ nombre: nombreEstanque });

        if (!estanque) {
            return res.status(404).json({ error: 'Estanque no encontrado' });
        }

        const sensores = await Sensor.find({ estanque: estanque._id });

        if (sensores.length === 0) {
            return res.status(404).json({ error: 'No se encontraron sensores para este estanque' });
        }

        res.json(sensores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};