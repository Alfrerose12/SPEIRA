const Estanques = require('../models/estanqueModel');

exports.crearEstanque = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ error: 'Nombre inválido' });
    }

    const nombreNormalizado = nombre.trim();

    const existe = await Estanques.findOne({ 
      nombre: { $regex: new RegExp(`^${nombreNormalizado}$`, 'i') }
    });

    if (existe) {
      return res.status(409).json({ error: 'El estanque ya existe' });
    }

    const estanque = new Estanques({ 
      nombre: nombreNormalizado 
    });

    await estanque.save();

    return res.status(201).json({
      success: true,
      data: estanque,
      message: 'Estanque creado exitosamente'
    });

  } catch (error) {
    console.error('Error en crearEstanque:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El nombre del estanque ya existe' });
    }

    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.obtenerEstanques = async (req, res) => {
  try {
    const estanques = await Estanques.find();
    res.json(estanques);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.editarEstanque = async (req, res) => {
  try {
    const { nombre } = req.params;
    const { nuevoNombre } = req.body;

    if (!nuevoNombre) {
      return res.status(400).json({ error: 'El nuevo nombre es requerido' });
    }

    const estanque = await Estanques.findOne({ nombre });
    if (!estanque) {
      return res.status(404).json({ error: 'Estanque no encontrado' });
    }

    estanque.nombre = nuevoNombre;
    await estanque.save(); 

    res.json(estanque);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.eliminarEstanque = async (req, res) => {
  try {
    const { nombre } = req.params;
    const estanque = await Estanques.findOneAndDelete({ nombre });
    if (!estanque) {
      return res.status(404).json({ error: 'Estanque no encontrado' });
    }
    res.json({ message: 'Estanque eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};