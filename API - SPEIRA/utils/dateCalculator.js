const moment = require('moment-timezone');

const ZONA_HORARIA = 'America/Mexico_City';

moment.updateLocale('en', {
  week: {
    dow: 1,
    doy: 4
  }
});

exports.obtenerRangoFechas = (periodo, fechaStr) => {
  const fecha = moment.tz(fechaStr, ZONA_HORARIA);

  if (!fecha.isValid()) throw new Error('Fecha inválida');

  if (periodo === 'semanal' && fecha.day() !== 1) {
    throw new Error(`Para reportes semanales debe proporcionar una fecha que sea día lunes. Día recibido: ${fecha.format('dddd')}`);
  }

  switch (periodo) {
    case 'diario':
      return {
        fechaInicio: fecha.clone().startOf('day').toDate(),
        fechaFin: fecha.clone().endOf('day').toDate()
      };
    case 'semanal':
      return {
        fechaInicio: fecha.clone().startOf('isoWeek').toDate(),
        fechaFin: fecha.clone().endOf('isoWeek').toDate(),
        semanaStr: `${fecha.clone().format('YYYY-MM-DD')}_a_${fecha.clone().endOf('isoWeek').format('YYYY-MM-DD')}`
      };
    case 'mensual':
      return {
        fechaInicio: fecha.clone().startOf('month').toDate(),
        fechaFin: fecha.clone().endOf('month').toDate()
      };
    case 'anual':
      return {
        fechaInicio: fecha.clone().startOf('year').toDate(),
        fechaFin: fecha.clone().endOf('year').toDate()
      };
    default:
      throw new Error('Período no válido');
  }
};