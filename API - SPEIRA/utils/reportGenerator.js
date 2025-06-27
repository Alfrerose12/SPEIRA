const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit-table');
const moment = require('moment-timezone');
const DatosSensor = require('../models/datosModel');
const { obtenerRangoFechas } = require('./dateCalculator');
const rutaLogo1 = path.join(__dirname, '../utils/assets/logo_colpos.png');
const rutaLogo2 = path.join(__dirname, '../utils/assets/logo_speira.png');

const ZONA_HORARIA = 'America/Mexico_City';

// Función para agregar encabezado
function agregarEncabezado(doc, periodo, fechaStr, fechaInicio, fechaFin) {
  try {
    const logo1Width = 140;
    const logo1Height = 50;
    const logo2Width = 65;
    const logo2Height = 65;
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;

    const logo1Y = 20;
    const logo2Y = 10;

    doc.image(rutaLogo1, margin, logo1Y, { width: logo1Width, height: logo1Height });
    doc.image(rutaLogo2, pageWidth - logo2Width - margin, logo2Y, { width: logo2Width, height: logo2Height });

    doc.moveDown(4);

    const fechaGeneracion = moment().tz(ZONA_HORARIA).format('YYYY-MM-DD HH:mm:ss');
    doc.fontSize(10).text(`Fecha y hora de generación: ${fechaGeneracion}`, { align: 'center' });

    doc.moveDown(1);

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
  } catch (e) {
    console.warn('Error al agregar encabezado:', e.message);
  }
}

exports.generarReporte = async (periodo, fechaStr) => {

  try {
    const doc = new PDFDocument({ 
      margin: 20, 
      size: 'A4', 
      bufferPages: true 
    });

    const rutaReportes = path.join(__dirname, '../reportes', periodo);
    if (!fs.existsSync(rutaReportes)) {
      fs.mkdirSync(rutaReportes, { recursive: true });
    }

    const { fechaInicio, fechaFin } = obtenerRangoFechas(periodo, fechaStr);

    let datosPorEstanque = {};
    let contador = 0;
    const BATCH_SIZE = 100;

    console.log('Iniciando consulta a MongoDB...');
    const datosCursor = DatosSensor.find({
      fecha: { $gte: fechaInicio, $lte: fechaFin }
    })
      .populate('estanque', 'nombre')
      .sort({ 'estanque.nombre': 1, fecha: 1 })
      .cursor();

    // Procesar datos en streaming
    for await (const dato of datosCursor) {
      const nombreEstanque = dato.estanque ? dato.estanque.nombre : 'Sin estanque';
      
      if (!datosPorEstanque[nombreEstanque]) {
        datosPorEstanque[nombreEstanque] = [];
      }
      
      datosPorEstanque[nombreEstanque].push(dato);
      contador++;

      // Liberar el event loop periódicamente
      if (contador % BATCH_SIZE === 0) {
        await new Promise(resolve => setImmediate(resolve));
        console.log(`Procesados ${contador} registros... Memoria: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
      }
    }

    if (contador === 0) {
      throw new Error('No hay datos para el período seleccionado');
    }

    console.log(`Total de registros procesados: ${contador}`);

    // 2. Procesar cada estanque según el período
    const reportesPorEstanque = {};
    for (const nombreEstanque in datosPorEstanque) {
      let datosEstanque = datosPorEstanque[nombreEstanque];

      if (periodo === 'diario') {
        datosEstanque = agruparPorDia(datosEstanque);
      } else if (periodo === 'semanal') {
        datosEstanque = agruparPorSemana(datosEstanque, nombreEstanque);
      } else if (periodo === 'mensual') {
        datosEstanque = agruparPorMes(datosEstanque, nombreEstanque);
      } else if (periodo === 'anual') {
        datosEstanque = agruparPorAnio(datosEstanque, nombreEstanque);
      }

      reportesPorEstanque[nombreEstanque] = datosEstanque;
    }

    const nombreArchivo = periodo === 'semanal'
      ? `semanal_${moment(fechaInicio).format('YYYY-MM-DD')}_a_${moment(fechaFin).format('YYYY-MM-DD')}_reporte.pdf`
      : `${periodo}_${fechaStr}_reporte.pdf`;

    const rutaArchivo = path.join(rutaReportes, nombreArchivo);
    const stream = fs.createWriteStream(rutaArchivo);

    return new Promise((resolve, reject) => {
      try {
        stream.on('finish', () => {
          console.log('PDF generado exitosamente');
          resolve(rutaArchivo);
        });
        
        stream.on('error', (error) => {
          console.error('Error en el stream de escritura:', error);
          doc.end();
          reject(error);
        });

        doc.pipe(stream);

        // Configuración de columnas
        const configColumnas = [
          {
            key: 'fecha',
            label: periodo === 'diario' ? 'Fecha y Hora' :
              (periodo === 'semanal' ? 'Semana' :
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
            key: 'ph',
            label: 'pH',
            format: (val) => `${val.toFixed(2)}`,
            width: 35,
            align: 'center'
          },
          {
            key: 'temperaturaAgua',
            label: 'Temp. Agua (°C)',
            format: (val) => `${val.toFixed(2)}`,
            width: 50,
            align: 'center'
          },
          {
            key: 'temperaturaAmbiente',
            label: 'Temp. Ambiente (°C)',
            format: (val) => `${val.toFixed(2)}`,
            width: 50,
            align: 'center'
          },
          {
            key: 'humedad',
            label: 'Humedad (%)',
            format: (val) => `${val.toFixed(2)}`,
            width: 50,
            align: 'center'
          },
          {
            key: 'luminosidad',
            label: 'Luminosidad (lx)',
            format: (val) => `${val.toFixed(2)}`,
            width: 50,
            align: 'center'
          },
          {
            key: 'conductividadElectrica',
            label: 'Conductividad Eléctrica (µS/cm)',
            format: (val) => `${val.toFixed(2)}`,
            width: 50,
            align: 'center'
          },
          {
            key: 'co2',
            label: 'CO2 (ppm)',
            format: (val) => `${val.toFixed(2)}`,
            width: 50,
            align: 'center'
          }
        ];

        const columnOptions = {};
        configColumnas.forEach((col, index) => {
          columnOptions[index] = {
            width: col.width,
            align: col.align
          };
        });

        // 3. Función optimizada para generar tablas por trozos
        const generarTablas = async () => {
          const nombresEstanques = Object.keys(reportesPorEstanque).sort((a, b) => {
            const numA = parseInt(a.match(/\d+/) || 0);
            const numB = parseInt(b.match(/\d+/) || 0);
            return numA - numB;
          });

          for (const nombreEstanque of nombresEstanques) {
            // Verificar espacio en página
            if (doc.y + 200 > doc.page.height - doc.page.margins.bottom) {
              doc.addPage();
              agregarEncabezado(doc, periodo, fechaStr, fechaInicio, fechaFin);
            }

            // Agregar título del estanque
            doc.moveDown(2);
            doc.fontSize(14).text(`${nombreEstanque}`, {
              align: 'left',
              underline: false
            });
            doc.moveDown(0.5);

            // Procesar datos en trozos
            const datosEstanque = reportesPorEstanque[nombreEstanque];
            const CHUNK_SIZE = 50; // Mostrar 50 registros por vez

            for (let i = 0; i < datosEstanque.length; i += CHUNK_SIZE) {
              const chunk = datosEstanque.slice(i, i + CHUNK_SIZE);
              
              const tabla = {
                headers: configColumnas.map(col => col.label),
                rows: chunk.map(item => configColumnas.map(col => col.format(item[col.key])))
              };

              await doc.table(tabla, {
                prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
                prepareRow: () => doc.font('Helvetica').fontSize(9),
                columnOptions,
                padding: [5, 5, 5, 5],
                divider: {
                  header: { disabled: false, width: 0.5, color: '#000000' },
                  horizontal: { disabled: false, width: 0.2, color: '#cccccc' }
                },
                headerAlign: 'center'
              });

              // Liberar memoria entre chunks
              if (i + CHUNK_SIZE < datosEstanque.length) {
                await new Promise(resolve => setImmediate(resolve));
                console.log(`Procesando chunk ${i}-${i+CHUNK_SIZE} de ${datosEstanque.length}...`);
              }
            }
          }
        };

        // Agregar encabezado inicial
        agregarEncabezado(doc, periodo, fechaStr, fechaInicio, fechaFin);

        // Generar las tablas
        generarTablas()
          .then(() => {
            console.log('Finalizando documento PDF...');
            doc.end();
          })
          .catch(error => {
            console.error('Error al generar tablas:', error);
            doc.end();
            reject(error);
          });

      } catch (error) {
        console.error('Error en el proceso de generación:', error);
        doc.end();
        reject(error);
      }
    });

  } catch (error) {
    console.error('Error general:', error);
    throw error;
  } finally {

  }
};

function agruparPorDia(datos) {
  const datosAgrupados = {};

  datos.forEach(dato => {
    const hora = moment(dato.fecha).tz(ZONA_HORARIA).startOf('hour').format(); 

    if (!datosAgrupados[hora]) {
      datosAgrupados[hora] = {
        fecha: moment(hora).toDate(),
        ph: 0,
        temperaturaAgua: 0,
        temperaturaAmbiente: 0,
        humedad: 0,
        luminosidad: 0,
        conductividadElectrica: 0,
        co2: 0,
        count: 0
      };
    }

    datosAgrupados[hora].ph += dato.ph || 0;
    datosAgrupados[hora].temperaturaAgua += dato.temperaturaAgua || 0;
    datosAgrupados[hora].temperaturaAmbiente += dato.temperaturaAmbiente || 0;
    datosAgrupados[hora].humedad += dato.humedad || 0;
    datosAgrupados[hora].luminosidad += dato.luminosidad || 0;
    datosAgrupados[hora].conductividadElectrica += dato.conductividadElectrica || 0;
    datosAgrupados[hora].co2 += dato.co2 || 0;
    datosAgrupados[hora].count += 1;
  });

  return Object.values(datosAgrupados).map(horaData => {
    const count = horaData.count || 1;
    return {
      fecha: horaData.fecha,
      ph: horaData.ph / count,
      temperaturaAgua: horaData.temperaturaAgua / count,
      temperaturaAmbiente: horaData.temperaturaAmbiente / count,
      humedad: horaData.humedad / count,
      luminosidad: horaData.luminosidad / count,
      conductividadElectrica: horaData.conductividadElectrica / count,
      co2: horaData.co2 / count
    };
  });
}

function agruparPorSemana(datos) {
  const agrupados = {};
  datos.forEach(dato => {
    const fechaDato = moment(dato.fecha).tz(ZONA_HORARIA);
    const lunesSemana = fechaDato.clone().startOf('week').format('YYYY-MM-DD');
    const clave = `${lunesSemana}_${dato.estanque}`;
    if (!agrupados[clave]) agrupados[clave] = { estanque: dato.estanque, datos: [] };
    agrupados[clave].datos.push(dato);
  });

  return Object.keys(agrupados).map(clave => {
    const grupo = agrupados[clave];
    const valores = grupo.datos;
    return {
      fecha: clave.split('_')[0],
      estanque: grupo.estanque,
      temperaturaAgua: promedio(valores.map(v => v.temperaturaAgua)),
      temperaturaAmbiente: promedio(valores.map(v => v.temperaturaAmbiente)),
      ph: promedio(valores.map(v => v.ph)),
      humedad: promedio(valores.map(v => v.humedad)),
      luminosidad: promedio(valores.map(v => v.luminosidad)),
      conductividadElectrica: promedio(valores.map(v => v.conductividadElectrica)),
      co2: promedio(valores.map(v => v.co2))
    };
  });
}

function agruparPorMes(datos) {
  const agrupados = {};
  datos.forEach(dato => {
    const dia = moment(dato.fecha).tz(ZONA_HORARIA).format('YYYY-MM-DD');
    const clave = `${dia}_${dato.estanque}`;
    if (!agrupados[clave]) agrupados[clave] = { estanque: dato.estanque, datos: [] };
    agrupados[clave].datos.push(dato);
  });

  return Object.keys(agrupados).map(clave => {
    const grupo = agrupados[clave];
    const valores = grupo.datos;
    return {
      fecha: clave.split('_')[0],
      estanque: grupo.estanque,
      temperaturaAgua: promedio(valores.map(v => v.temperaturaAgua)),
      temperaturaAmbiente: promedio(valores.map(v => v.temperaturaAmbiente)),
      ph: promedio(valores.map(v => v.ph)),
      humedad: promedio(valores.map(v => v.humedad)),
      luminosidad: promedio(valores.map(v => v.luminosidad)),
      conductividadElectrica: promedio(valores.map(v => v.conductividadElectrica)),
      co2: promedio(valores.map(v => v.co2))
    };
  });
}

function agruparPorAnio(datos) {
  const agrupados = {};
  datos.forEach(dato => {
    const mes = moment(dato.fecha).tz(ZONA_HORARIA).format('YYYY-MM');
    const clave = `${mes}_${dato.estanque}`;
    if (!agrupados[clave]) agrupados[clave] = { estanque: dato.estanque, datos: [] };
    agrupados[clave].datos.push(dato);
  });

  return Object.keys(agrupados).map(clave => {
    const grupo = agrupados[clave];
    const valores = grupo.datos;
    return {
      fecha: clave.split('_')[0],
      estanque: grupo.estanque,
      temperaturaAgua: promedio(valores.map(v => v.temperaturaAgua)),
      temperaturaAmbiente: promedio(valores.map(v => v.temperaturaAmbiente)),
      ph: promedio(valores.map(v => v.ph)),
      humedad: promedio(valores.map(v => v.humedad)),
      luminosidad: promedio(valores.map(v => v.luminosidad)),
      conductividadElectrica: promedio(valores.map(v => v.conductividadElectrica)),
      co2: promedio(valores.map(v => v.co2))
    };
  });
}

function promedio(valores) {
  if (valores.length === 0) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}