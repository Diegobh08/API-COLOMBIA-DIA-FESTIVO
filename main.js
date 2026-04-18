const API_BASE_URL = "https://api-colombia.com/api/v1/Holiday/year";
const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const yearInput = document.getElementById('year-input');
const btn = document.getElementById('submit-button');
const statusText = document.getElementById('status');

// Año por defecto
yearInput.value = new Date().getFullYear();

// Escuchador del botón
btn.addEventListener('click', () => loadData(yearInput.value));

// Carga inicial
loadData(yearInput.value);

async function loadData(year) {
  statusText.innerText = `🔄 Consultando...`;

  try {
    const response = await fetch(`${API_BASE_URL}/${year}`);
    if (!response.ok) throw new Error("API no disponible");

    const data = await response.json();

    // Si la API devuelve datos, los normalizamos
    const holidays = data.map(h => ({
      name: h.name,
      // IMPORTANTE: Aseguramos que la fecha se lea correctamente
      date: new Date(h.date.includes('T') ? h.date : `${h.date}T00:00:00`)
    }));

    if (holidays.length === 0) {
      statusText.innerText = "⚠️ No se encontraron festivos para este año.";
      return;
    }

    renderSummary(holidays);
    renderTable(holidays);
    renderChart(holidays); // Esta es la función clave

    statusText.innerText = `✅ Éxito: ${holidays.length} festivos.`;

  } catch (error) {
    statusText.innerText = "❌ Error al cargar datos.";
    console.error(error);
  }
}

function renderChart(holidays) {
  // Inicializamos los 12 meses en 0
  const counts = new Array(12).fill(0);

  holidays.forEach(h => {
    const monthIndex = h.date.getMonth();
    if (monthIndex >= 0 && monthIndex < 12) {
      counts[monthIndex]++;
    }
  });

  // Verificamos en consola si hay datos antes de graficar
  console.log("Conteo por mes:", counts);

  const trace = {
    x: MONTH_NAMES,
    y: counts,
    type: 'bar',
    marker: {
      color: '#003893',
      line: { color: '#ce1126', width: 1.5 }
    }
  };

  const layout = {
    title: '<b>Festivos por Mes</b>',
    xaxis: { title: 'Meses', tickangle: -45 },
    yaxis: {
      title: 'Cantidad de días',
      dtick: 1, // Esto obliga a mostrar números enteros (1, 2, 3...)
      range: [0, Math.max(...counts) + 1] // Ajusta el alto automáticamente
    },
    margin: { t: 50, b: 80, l: 50, r: 20 }
  };

  // Plotly.react es mejor que newPlot para actualizar gráficos existentes
  Plotly.react('monthly-chart', [trace], layout, { responsive: true });
}

// Funciones auxiliares para que no de error el código
function renderTable(holidays) {
  const tableBody = document.getElementById('holiday-table-body');
  tableBody.innerHTML = holidays.map(h => `
    <tr>
      <td>${h.date.toLocaleDateString('es-CO')}</td>
      <td>${h.date.toLocaleDateString('es-CO', { weekday: 'long' })}</td>
      <td>${h.name}</td>
    </tr>
  `).join('');
}

function renderSummary(holidays) {
  document.getElementById('total-holidays').innerText = holidays.length;
}