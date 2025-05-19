const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit-table');
const moment = require('moment-timezone');
const DatosSensor = require('../models/sensorModel');
const { obtenerRangoFechas } = require('./dateCalculator');

const ZONA_HORARIA = 'America/Mexico_City';

exports.generarReporte = async (periodo, fechaStr) => {
  const { fechaInicio, fechaFin } = obtenerRangoFechas(periodo, fechaStr);

  let datos = await DatosSensor.find({
    fecha: { $gte: fechaInicio, $lte: fechaFin }
  }).sort({ fecha: 1 });

  if (datos.length === 0) throw new Error('No hay datos para el período seleccionado');

  if (periodo === 'diario') {
    datos = agruparPorDia(datos); 
  } else if (periodo === 'semanal') {
    datos = agruparPorSemana(datos);
  } else if (periodo === 'mensual') {
    datos = agruparPorMes(datos); 
  } else if (periodo === 'anual') {
    datos = agruparPorAnio(datos); 
  }

  const doc = new PDFDocument({ margin: 20, size: 'A4' });
  const rutaReportes = path.join(__dirname, '../reportes', periodo);
  if (!fs.existsSync(rutaReportes)) fs.mkdirSync(rutaReportes, { recursive: true });

  const nombreArchivo = periodo === 'semanal' 
    ? `semanal_${moment(fechaInicio).format('YYYY-MM-DD')}_a_${moment(fechaFin).format('YYYY-MM-DD')}_reporte.pdf`
    : `${periodo}_${fechaStr}_reporte.pdf`;
  
  const rutaArchivo = path.join(rutaReportes, nombreArchivo);
  const stream = fs.createWriteStream(rutaArchivo);

  const configColumnas = [
    { 
      key: 'fecha', 
      label: periodo === 'diario' ? 'Fecha y Hora' : 
             (periodo === 'semanal' ? 'Semana (Lunes a Domingo)' : 
             (periodo === 'anual' ? 'Año-Mes' : 'Fecha')),
      format: (val) => {
        if (periodo === 'diario') return moment(val).tz(ZONA_HORARIA).format('YYYY-MM-DD HH:mm');
        if (periodo === 'semanal') {
          const lunes = moment(val).tz(ZONA_HORARIA);
          const domingo = lunes.clone().add(6, 'days');
          return `${lunes.format('YYYY-MM-DD')} a ${domingo.format('YYYY-MM-DD')}`;
        }
        if (periodo === 'anual') return moment(val).tz(ZONA_HORARIA).format('YYYY-MM');
        return moment(val).tz(ZONA_HORARIA).format('YYYY-MM-DD');
      },
      width: periodo === 'semanal' ? 180 : 140,
      align: 'center'
    },
    { 
      key: 'temperatura', 
      label: 'Temperatura', 
      format: (val) => `${val.toFixed(2)} °C`, 
      width: 70,
      align: 'center'
    },
    { 
      key: 'ph', 
      label: 'pH', 
      format: (val) => `${val.toFixed(2)}`, 
      width: 35,
      align: 'center'
    },
    { 
      key: 'salinidad', 
      label: 'Salinidad', 
      format: (val) => `${val.toFixed(2)} mg/L`, 
      width: 70,
      align: 'center'
    },
    { 
      key: 'iluminacion', 
      label: 'Iluminación', 
      format: (val) => `${val.toFixed(2)} lúmenes`, 
      width: 80,
      align: 'center'
    },
    { 
      key: 'humedad', 
      label: 'Humedad', 
      format: (val) => `${val.toFixed(2)} %`,
      width: 80,
      align: 'center'
    },
    { 
      key: 'agitacion', 
      label: 'Agitación', 
      format: (val) => `${val.toFixed(2)} RPM`, 
      width: 60,
      align: 'center'
    }
  ];

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(rutaArchivo));
    stream.on('error', reject);

    doc.pipe(stream);

    const tituloReporte = periodo === 'semanal'
      ? `Reporte de Monitoreo de Espirulina - Semanal (${moment(fechaInicio).format('YYYY-MM-DD')} a ${moment(fechaFin).format('YYYY-MM-DD')})`
      : `Reporte de Monitoreo de Espirulina - ${periodo} ${fechaStr}`;

      doc.fontSize(16).text(tituloReporte, { 
        align: 'center',
        underline: false,
        lineGap: 10,     
        paragraphGap: 1   
      });
      doc.moveDown(0.5);  

    const tabla = {
      headers: configColumnas.map(col => col.label),
      rows: datos.map(item => 
        configColumnas.map(col => col.format(item[col.key]))
      ) 
    };

    const columnOptions = {};
    configColumnas.forEach((col, index) => {
      columnOptions[index] = { 
        width: col.width,
        align: col.align
      };
    });

    doc.table(tabla, {
      prepareHeader: () => {
        doc.font('Helvetica-Bold').fontSize(10);
      },
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('Helvetica').fontSize(9);
      },
      columnOptions: columnOptions,
      padding: [5, 5, 5, 5],
      divider: {
        header: { disabled: false, width: 0.5, color: '#000000' },
        horizontal: { disabled: false, width: 0.2, color: '#cccccc' }
      },
      headerAlign: 'center'
    }).then(() => {
      doc.end();
    }).catch(reject);
  });
};

function agruparPorDia(datos) {
  const agrupados = {};
  datos.forEach(dato => {
    const dia = moment(dato.fecha).tz(ZONA_HORARIA).format('YYYY-MM-DD HH:mm');
    if (!agrupados[dia]) agrupados[dia] = [];
    agrupados[dia].push(dato);
  });
  return Object.keys(agrupados).flatMap(dia => agrupados[dia]);
}

function agruparPorSemana(datos) {
  const agrupados = {};
  
  datos.forEach(dato => {
    const fechaDato = moment(dato.fecha).tz(ZONA_HORARIA);
    const lunesSemana = fechaDato.clone().startOf('week').format('YYYY-MM-DD');
    
    if (!agrupados[lunesSemana]) agrupados[lunesSemana] = [];
    agrupados[lunesSemana].push(dato);
  });

  return Object.keys(agrupados).map(lunesSemana => {
    const valores = agrupados[lunesSemana];
    return {
      fecha: lunesSemana,
      temperatura: promedio(valores.map(v => v.temperatura)),
      ph: promedio(valores.map(v => v.ph)),
      salinidad: promedio(valores.map(v => v.salinidad)),
      iluminacion: promedio(valores.map(v => v.iluminacion)),
      humedad: promedio(valores.map(v => v.humedad)),
      agitacion: promedio(valores.map(v => v.agitacion))
    };
  });
}

function agruparPorMes(datos) {
  const agrupados = {};
  datos.forEach(dato => {
    const dia = moment(dato.fecha).tz(ZONA_HORARIA).format('YYYY-MM-DD');
    if (!agrupados[dia]) agrupados[dia] = [];
    agrupados[dia].push(dato);
  });

  return Object.keys(agrupados).map(dia => {
    const valores = agrupados[dia];
    return {
      fecha: dia,
      temperatura: promedio(valores.map(v => v.temperatura)),
      ph: promedio(valores.map(v => v.ph)),
      salinidad: promedio(valores.map(v => v.salinidad)),
      iluminacion: promedio(valores.map(v => v.iluminacion)),
      humedad: promedio(valores.map(v => v.humedad)),
      agitacion: promedio(valores.map(v => v.agitacion))
    };
  });
}

function agruparPorAnio(datos) {
  const agrupados = {};
  datos.forEach(dato => {
    const mes = moment(dato.fecha).tz(ZONA_HORARIA).format('YYYY-MM');
    if (!agrupados[mes]) agrupados[mes] = [];
    agrupados[mes].push(dato);
  });

  return Object.keys(agrupados).map(mes => {
    const valores = agrupados[mes];
    return {
      fecha: mes,
      temperatura: promedio(valores.map(v => v.temperatura)),
      ph: promedio(valores.map(v => v.ph)),
      salinidad: promedio(valores.map(v => v.salinidad)),
      iluminacion: promedio(valores.map(v => v.iluminacion)),
      humedad: promedio(valores.map(v => v.humedad)),
      agitacion: promedio(valores.map(v => v.agitacion))
    };
  });
}

function promedio(valores) {
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}