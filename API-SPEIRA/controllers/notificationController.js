const admin = require('../firebase');
const Token = require('../models/tokenModel');

exports.guardarToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token es requerido' });

  try {
    const existing = await Token.findOne({ token });
    if (!existing) {
      await Token.create({ token });
      console.log('Token FCM guardado:', token);
    }
    res.status(201).json({ message: 'Token guardado' });
  } catch (error) {
    console.error('Error guardando token:', error);
    res.status(500).json({ error: 'Error guardando token' });
  }
};

exports.enviarNotificacion = async (req, res) => {
  const { token, titulo, cuerpo } = req.body;

  try {
    if (token) {
      const message = {
        notification: {
          title: titulo || 'Notificación',
          body: cuerpo || 'Mensaje desde backend',
        },
        token,
      };

      await admin.messaging().send(message);
      res.status(200).json({ message: 'Notificación enviada correctamente a token específico' });
    } else {
      const tokens = await Token.find().distinct('token');
      if (tokens.length === 0) {
        return res.status(400).json({ error: 'No hay tokens guardados para enviar notificación' });
      }

      const message = {
        notification: {
          title: titulo || 'Notificación',
          body: cuerpo || 'Mensaje desde backend',
        },
        tokens,
      };

      const response = await admin.messaging().sendMulticast(message);
      res.status(200).json({
        message: 'Notificaciones enviadas',
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      });
    }
  } catch (error) {
    console.error('Error enviando notificación:', error);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
};