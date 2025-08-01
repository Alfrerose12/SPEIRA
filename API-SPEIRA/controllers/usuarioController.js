const Usuario = require('../models/usuarioModel');
const jwt = require('jsonwebtoken');

exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password,
      rol: rol || 'user',
    });

    await nuevoUsuario.save();

    res.status(201).json({
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
      fechaCreacion: nuevoUsuario.fechaCreacion,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario', detalles: error.message });
  }
};


exports.editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password } = req.body;

  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (email && email !== usuario.email) {
      const existe = await Usuario.findOne({ email, _id: { $ne: id } });
      if (existe) {
        return res.status(400).json({ error: 'El email ya está registrado por otro usuario' });
      }
      usuario.email = email;
    }

    if (nombre) {
      usuario.nombre = nombre;
    }

    if (password) {
      usuario.password = password;
    }

    await usuario.save();

    res.status(200).json({
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      fechaCreacion: usuario.createdAt
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al editar usuario', detalles: error.message });
  }
};


exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario', detalles: error.message });
  }
};

exports.iniciarSesion = async (req, res) => {
  const { email, nombre, password } = req.body;

  try {
    if (!password || (!email && !nombre)) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }

    const usuario = await Usuario.findOne({
      $or: [
        email ? { email } : null,
        nombre ? { nombre: { $regex: new RegExp(`^${nombre}$`, 'i') } } : null
      ].filter(Boolean)
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const esValido = await usuario.compararPassword(password);

    if (!esValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '15min' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 1000
    });

    res.json({
      token,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
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

exports.cerrarSesion = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax'
  });

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.json({ message: 'Sesión cerrada exitosamente' });
  }

  res.redirect('/');
};

