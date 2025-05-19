const Usuario = require('../models/usuarioModel');

exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.query;
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const nuevoUsuario = new Usuario({ nombre, email, password });
        await nuevoUsuario.save();
        res.status(201).json({
            id: nuevoUsuario._id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            fechaCreacion: nuevoUsuario.fechaCreacion,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario', detalles: error.message });
    }
};

exports.iniciarSesion = async (req, res) => {
  const { email, nombre, password } = req.body;

  try {
    const usuario = await Usuario.findOne(
      email ? { email } : { nombre }
    );
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const esValido = await usuario.compararPassword(password);
    if (!esValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      fechaCreacion: usuario.fechaCreacion
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión', detalles: err.message });
  }
};

exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(400).json({ error: 'Error al obtener los usuarios', detalles: error.message });
    }
};

exports.obtenerUsuariosPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;
        const usuarios = await Usuario.find({ nombre: new RegExp(nombre, 'i') });
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(400).json({ error: 'Error al obtener los usuarios', detalles: error.message });
    }
};


