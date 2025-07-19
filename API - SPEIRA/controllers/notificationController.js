const admin = require('../firebase'); 

exports.enviarNotificacion = async (req, res) => {
  const { token, titulo, cuerpo } = req.body;

  const message = {
    notification: {
      title: titulo,
      body: cuerpo,
    },
    token: token,
  };

  try {
    await admin.messaging().send(message);
    res.status(200).json({ message: 'Notificación enviada correctamente' });
  } catch (error) {
    console.error('Error enviando notificación:', error);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
};
