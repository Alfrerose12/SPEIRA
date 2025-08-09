const FcmToken = require('../models/fcmToken');
const admin = require('../firebase');

exports.guardarToken = async (req, res) => {
  const { token, userId } = req.body;
  try {
    await FcmToken.updateOne({ token }, { token, userId }, { upsert: true });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.enviarNotificacion = async (req, res) => {
  const { titulo, cuerpo, token } = req.body;

  if (!token) return res.status(400).json({ error: 'Token es obligatorio' });

  const message = {
    token,
    notification: {
      title: titulo,
      body: cuerpo,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    res.json({ ok: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
