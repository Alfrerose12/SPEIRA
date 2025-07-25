const maxPoints = 10;
const labels = [];

const limits = {
  ph: { min: 9, max: 11 },
  tempi: { min: 30, max: 35 },
  tempa: { min: 30, max: 35 },
  humidity: { min: 50, max: 70 },
  lightning: { min: 35, max: 690 },
  conductivity: { min: 0.5, max: 1.5 },
  co2: { min: 0.5, max: 1.5 },
};

const createChart = (ctx, label, color, minY, maxY) => {
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data: [],
        borderColor: color,
        backgroundColor: hexToRgba(color, 0.2),
        borderWidth: 2,
        tension: 0,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: 'Hora' },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          },
          grid: { display: false }
        },
        y: {
          title: { display: true, text: label },
          beginAtZero: false,
          min: minY,
          max: maxY,
          grid: { color: '#ccc' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
};

const phChart = createChart(document.getElementById('phChart'), 'pH', '#FFA07A', limits.ph.min, limits.ph.max);
const tempIChart = createChart(document.getElementById('tempIChart'), 'Temp. del Agua (°C)', '#00bcd4', limits.tempi.min, limits.tempi.max);
const tempAChart = createChart(document.getElementById('tempAChart'), 'Temp. Ambiental (°C)', '#A9A9A9', limits.tempa.min, limits.tempa.max);
const lightningChart = createChart(document.getElementById('lightningChart'), 'Iluminación (μmol/m²s)', '#ffc107', limits.lightning.min, limits.lightning.max);
const humidityChart = createChart(document.getElementById('humidityChart'), 'Humedad (%)', '#66bb6a', limits.humidity.min, limits.humidity.max);
const co2Chart = createChart(document.getElementById('co2Chart'), 'CO2 (ppm)', '#CD853F', limits.co2.min, limits.co2.max);
const conductivityChart = createChart(document.getElementById('conductivityChart'), 'Conductividad (mS/cm)', '#f44336', limits.conductivity.min, limits.conductivity.max);

const prevValues = {
  ph: null,
  tempi: null,
  tempa: null,
  humidity: null,
  lightning: null,
  conductivity: null,
  co2: null
};

function getCurrentTime12h() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function formatValueWithArrow(newVal, prevVal, unit = '') {
  let symbolHtml = '';
  if (prevVal !== null) {
    if (newVal > prevVal) symbolHtml = ' <i class="fas fa-arrow-up arrow-up"></i>';
    else if (newVal < prevVal) symbolHtml = ' <i class="fas fa-arrow-down arrow-down"></i>';
    else symbolHtml = ' <span class="equal-sign">—</span>';
  }
  return newVal.toFixed(2) + unit + symbolHtml;
}

async function updateData() {
  try {
    const response = await fetch('https://api.speira.site/api/datos/generales');
    const data = await response.json();

    const time = getCurrentTime12h();

    const { ph, tempi, tempa, lightning, humidity, co2, conductivity } = data;

    document.getElementById('ph-value').innerHTML = formatValueWithArrow(ph, prevValues.ph);
    document.getElementById('temp-interna-value').innerHTML = formatValueWithArrow(tempi, prevValues.tempi, ' °C');
    document.getElementById('temp-ambiente-value').innerHTML = formatValueWithArrow(tempa, prevValues.tempa, ' °C');
    document.getElementById('lightning-value').innerHTML = formatValueWithArrow(lightning, prevValues.lightning, ' μmol/m²s');
    document.getElementById('humidity-value').innerHTML = formatValueWithArrow(humidity, prevValues.humidity, ' %');
    document.getElementById('co2-value').innerHTML = formatValueWithArrow(co2, prevValues.co2, ' ppm');
    document.getElementById('conductivity-value').innerHTML = formatValueWithArrow(conductivity, prevValues.conductivity, ' mS/cm');
    document.getElementById('update-time').textContent = time;

    prevValues.ph = ph;
    prevValues.tempi = tempi;
    prevValues.tempa = tempa;
    prevValues.lightning = lightning;
    prevValues.humidity = humidity;
    prevValues.co2 = co2;
    prevValues.conductivity = conductivity;

    if (labels.length >= maxPoints) labels.shift();
    labels.push(time);

    [phChart, tempIChart, tempAChart, lightningChart, humidityChart, co2Chart, conductivityChart].forEach(chart => {
      if (chart.data.datasets[0].data.length >= maxPoints) chart.data.datasets[0].data.shift();
    });

    phChart.data.datasets[0].data.push(ph);
    tempIChart.data.datasets[0].data.push(tempi);
    tempAChart.data.datasets[0].data.push(tempa);
    lightningChart.data.datasets[0].data.push(lightning);
    humidityChart.data.datasets[0].data.push(humidity);
    co2Chart.data.datasets[0].data.push(co2);
    conductivityChart.data.datasets[0].data.push(conductivity);

    phChart.update();
    tempIChart.update();
    tempAChart.update();
    lightningChart.update();
    humidityChart.update();
    co2Chart.update();
    conductivityChart.update();

  } catch (error) {
    console.error('Error al obtener datos:', error);
  }
}

updateData();
setInterval(updateData, 1000);
