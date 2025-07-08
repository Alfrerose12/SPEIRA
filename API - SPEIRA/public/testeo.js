function getCurrentTime12h() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

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
        legend: {
          display: false,
          labels: { color: '#000' }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
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
  ph: true,
  tempi: true,
  tempa: true,
  humidity: true,
  lightning: true,
  conductivity: true,
  co2: true
};

function formatValueWithArrow(newVal, prevVal, unit = '') {
  let symbolHtml = '';
  if (prevVal !== null) {
    if (newVal > prevVal) symbolHtml = ' <i class="fas fa-arrow-up arrow-up"></i>';
    else if (newVal < prevVal) symbolHtml = ' <i class="fas fa-arrow-down arrow-down"></i>';
    else symbolHtml = ' <span class="equal-sign">—</span>';
  }
  return newVal.toFixed(2) + unit + symbolHtml;
}

function updateData() {
  const time = getCurrentTime12h();

  const ph = limits.ph.min + Math.random() * (limits.ph.max - limits.ph.min);
  const tempI = limits.tempi.min + Math.random() * (limits.tempi.max - limits.tempi.min);
  const tempA = limits.tempa.min + Math.random() * (limits.tempa.max - limits.tempa.min);
  const lightning = limits.lightning.min + Math.random() * (limits.lightning.max - limits.lightning.min);
  const humidity = limits.humidity.min + Math.random() * (limits.humidity.max - limits.humidity.min);
  const co2 = limits.co2.min + Math.random() * (limits.co2.max - limits.co2.min);
  const conductivity = limits.conductivity.min + Math.random() * (limits.conductivity.max - limits.conductivity.min);

  document.getElementById('ph-value').innerHTML = formatValueWithArrow(ph, prevValues.ph);
  document.getElementById('temp-interna-value').innerHTML = formatValueWithArrow(tempI, prevValues.tempi, ' °C');
  document.getElementById('temp-ambiente-value').innerHTML = formatValueWithArrow(tempA, prevValues.tempa, ' °C');
  document.getElementById('lightning-value').innerHTML = formatValueWithArrow(lightning, prevValues.lightning, ' μmol/m²s');
  document.getElementById('humidity-value').innerHTML = formatValueWithArrow(humidity, prevValues.humidity, ' %');
  document.getElementById('co2-value').innerHTML = formatValueWithArrow(co2, prevValues.co2, ' ppm');
  document.getElementById('conductivity-value').innerHTML = formatValueWithArrow(conductivity, prevValues.conductivity, ' mS/cm');

  document.getElementById('update-time').textContent = time;

  prevValues.ph = ph;
  prevValues.tempi = tempI;
  prevValues.tempa = tempA;
  prevValues.lightning = lightning;
  prevValues.humidity = humidity;
  prevValues.co2 = co2;
  prevValues.conductivity = conductivity;

  if (labels.length >= maxPoints) labels.shift();
  labels.push(time);

  [phChart, tempIChart, tempAChart, lightningChart, humidityChart, co2Chart, conductivityChart].forEach(chart => {
    if (chart.data.datasets[0].data.length >= maxPoints) chart.data.datasets[0].data.shift();
  });

  phChart.data.datasets[0].data.push(Number(ph.toFixed(2)));
  tempIChart.data.datasets[0].data.push(Number(tempI.toFixed(1)));
  tempAChart.data.datasets[0].data.push(Number(tempA.toFixed(1)));
  lightningChart.data.datasets[0].data.push(Number(lightning.toFixed(1)));
  humidityChart.data.datasets[0].data.push(Number(humidity.toFixed(1)));
  co2Chart.data.datasets[0].data.push(Number(co2.toFixed(1)));
  conductivityChart.data.datasets[0].data.push(Number(conductivity.toFixed(1)));

  phChart.update();
  tempIChart.update();
  tempAChart.update();
  lightningChart.update();
  humidityChart.update();
  co2Chart.update();
  conductivityChart.update();
}

updateData();

// Para pruebas rápidas, actualiza cada minuto
// setInterval(updateData, 60000);

// Para pruebas rápidas, actualiza cada segundo
setInterval(updateData, 1000);
