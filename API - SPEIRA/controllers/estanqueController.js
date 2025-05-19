const Estanque = require('../models/estanqueModel');

exports.crearEstanque = async (req, res) => {
  try {
    const { nombre } = req.query; 
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    const estanque = new Estanque({ nombre });
    await estanque.save();
    res.status(201).json(estanque);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerEstanques = async (req, res) => {
  try {
    const estanques = await Estanque.find();
    res.json(estanques);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editarEstanque = async (req, res) => {
    try {
        const { id } = req.params;
        const estanque = await Estanque.findByIdAndUpdate(id, req.body, { new: true }); 
        if (!estanque) {
            return res.status(404).json({ error: 'Estanque no encontrado' });
        }
        res.json(estanque);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}