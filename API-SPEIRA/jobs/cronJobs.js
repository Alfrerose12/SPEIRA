const cron = require('node-cron');
const moment = require('moment-timezone');
const Estanques = require('../models/estanquesModel');
const calcularPromedioYGuardar = require('../services/promedioService');

const ZONA_HORARIA = 'America/Mexico_City';

// DIARIO
cron.schedule('0 0 * * *', async () => {
    console.log(' Calculando promedio DIARIO...');

    const hoy = moment().tz(ZONA_HORARIA);
    const desde = hoy.clone().subtract(1, 'day').startOf('day').toDate();
    const hasta = hoy.clone().subtract(1, 'day').endOf('day').toDate();

    const estanques = await Estanques.find();
    for (const estanque of estanques) {
        await calcularPromedioYGuardar(estanque._id, desde, hasta, 'diario');
    }

    console.log(' Promedios diarios guardados.');
}, { timezone: ZONA_HORARIA });

//  SEMANAL
cron.schedule('0 0 * * 1', async () => {
    console.log(' Calculando promedio SEMANAL...');

    const hoy = moment().tz(ZONA_HORARIA);
    const desde = hoy.clone().subtract(1, 'week').startOf('isoWeek').toDate();
    const hasta = hoy.clone().subtract(1, 'week').endOf('isoWeek').toDate();

    const estanques = await Estanques.find();
    for (const estanque of estanques) {
        await calcularPromedioYGuardar(estanque._id, desde, hasta, 'semanal');
    }

    console.log(' Promedios semanales guardados.');
}, { timezone: ZONA_HORARIA });

//  MENSUAL
cron.schedule('0 0 1 * *', async () => {
    console.log(' Calculando promedio MENSUAL...');

    const hoy = moment().tz(ZONA_HORARIA);
    const desde = hoy.clone().subtract(1, 'month').startOf('month').toDate();
    const hasta = hoy.clone().subtract(1, 'month').endOf('month').toDate();

    const estanques = await Estanques.find();
    for (const estanque of estanques) {
        await calcularPromedioYGuardar(estanque._id, desde, hasta, 'mensual');
    }

    console.log(' Promedios mensuales guardados.');
}, { timezone: ZONA_HORARIA });

//  ANUAL
cron.schedule('0 0 1 1 *', async () => {
    console.log(' Calculando promedio ANUAL...');

    const hoy = moment().tz(ZONA_HORARIA);
    const desde = hoy.clone().subtract(1, 'year').startOf('year').toDate();
    const hasta = hoy.clone().subtract(1, 'year').endOf('year').toDate();

    const estanques = await Estanques.find();
    for (const estanque of estanques) {
        await calcularPromedioYGuardar(estanque._id, desde, hasta, 'anual');
    }

    console.log(' Promedios anuales guardados.');
}, { timezone: ZONA_HORARIA });
