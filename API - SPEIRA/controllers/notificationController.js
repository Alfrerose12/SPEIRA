const Subscription = require('../models/subscriptionModel');
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:espirulina2025@speira.site',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.guardarSuscripcion = async (req, res) => {
  try {
    const subscription = req.body;
    const exists = await Subscription.findOne({ endpoint: subscription.endpoint });
    if (!exists) {
      const newSub = new Subscription(subscription);
      await newSub.save();
    }
    res.status(201).json({ message: 'Suscripción almacenada con éxito' });
  } catch (error) {
    console.error('Error guardando suscripción:', error);
    res.status(500).json({ error: 'Error guardando suscripción' });
  }
};

exports.enviarNotificacion = async (req, res) => {
  const { payload } = req.body;
  try {
    const subs = await Subscription.find({});
    const resultados = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(sub, JSON.stringify(payload))
          .catch(async (error) => {
            if (error.statusCode === 410 || error.statusCode === 404) {
              await Subscription.deleteOne({ endpoint: sub.endpoint });
            } else {
              console.error('Error enviando notificación:', error);
            }
            throw error; 
          })
      )
    );
    const errores = resultados.filter(r => r.status === 'rejected');
    if (errores.length > 0) {
      console.error('Errores al enviar notificaciones:', errores);
      return res.status(500).json({ error: 'Algunas notificaciones fallaron' });
    }
    res.status(200).json({ message: 'Notificaciones enviadas' });
  } catch (error) {
    console.error('Error al enviar notificaciones:', error);
    res.status(500).json({ error: 'Error al enviar notificaciones' });
  }
};
