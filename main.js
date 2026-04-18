const API_BASE_URL = "https://api-colombia.com/api/v1/Holiday/year";
const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const yearInput = document.getElementById("year-input");
const button = document.getElementById("submit-button");
const statusText = document.getElementById("status");
const totalHolidays = document.getElementById("total-holidays");
const nextHoliday = document.getElementById("next-holiday");
const topMonth = document.getElementById("top-month");
const tableBody = document.getElementById("holiday-table-body");

yearInput.value = new Date().getFullYear();

button.addEventListener("click", () => loadData(yearInput.value));

loadData(yearInput.value);

async function loadData(year) {
  statusText.innerText = "Consultando datos...";

  try {
    const response = await fetch(`${API_BASE_URL}/${year}`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    const holidays = data.map((holiday) => ({
      name: holiday.name,
      date: new Date(holiday.date.includes("T") ? holiday.date : `${holiday.date}T00:00:00`)
    }));

    renderSummary(holidays);
    renderTable(holidays);
    renderChart(holidays);

    statusText.innerText = `Se cargaron ${holidays.length} festivos.`;
  } catch (error) {
    statusText.innerText = "No se pudieron cargar los datos desde la API.";
    console.error(error);
  }
}

function renderChart(holidays) {
  const xValues = holidays.map((holiday) =>
    holiday.date.toLocaleDateString("es-CO", { day: "numeric", month: "short" })
  );
  const dayOfYear = holidays.map((holiday) => getDayOfYear(holiday.date));
  const cumulative = holidays.map((_, index) => index + 1);
  const tickStep = Math.max(1, Math.ceil(xValues.length / 6));
  const tickValues = xValues.filter((_, index) => index % tickStep === 0 || index === xValues.length - 1);

  const data = [
    {
      x: xValues,
      y: dayOfYear,
      text: holidays.map((holiday) => holiday.name),
      type: "bar",
      name: "Día del año",
      marker: {
        color: "rgba(180, 190, 215, 0.75)"
      },
      yaxis: "y2",
      hovertemplate: "Festivo: %{text}<br>Fecha: %{x}<br>Día del año: %{y}<extra></extra>"
    },
    {
      x: xValues,
      y: cumulative,
      text: holidays.map((holiday) => holiday.name),
      type: "scatter",
      name: "Acumulado",
      mode: "lines+markers",
      marker: {
        color: "#d946ef",
        size: 7
      },
      line: {
        color: "#d946ef",
        width: 3
      },
      hovertemplate: "Festivo: %{text}<br>Fecha: %{x}<br>Acumulado: %{y}<extra></extra>"
    }
  ];

  const layout = {
    autosize: true,
    height: 420,
    margin: {
      l: 40,
      r: 45,
      b: 70,
      t: 40,
      pad: 4
    },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    bargap: 0.38,
    xaxis: {
      tickangle: -30,
      showgrid: false,
      tickmode: "array",
      tickvals: tickValues
    },
    yaxis: {
      range: [0, holidays.length + 1],
      dtick: 1,
      gridcolor: "#ececec",
      zeroline: false
    },
    yaxis2: {
      overlaying: "y",
      side: "right",
      range: [Math.min(...dayOfYear) - 10, Math.max(...dayOfYear) + 20],
      gridcolor: "#ececec",
      zeroline: false,
      tickformat: "d"
    }
  };

  Plotly.newPlot("monthly-chart", data, layout, { responsive: true, displayModeBar: false });
}

function renderTable(holidays) {
  tableBody.innerHTML = holidays.map((holiday) => `
    <tr>
      <td>${holiday.date.toLocaleDateString("es-CO")}</td>
      <td>${holiday.date.toLocaleDateString("es-CO", { weekday: "long" })}</td>
      <td>${holiday.name}</td>
    </tr>
  `).join("");
}

function renderSummary(holidays) {
  totalHolidays.innerText = holidays.length;

  nextHoliday.innerText = holidays[0]
    ? `${holidays[0].name} - ${holidays[0].date.toLocaleDateString("es-CO")}`
    : "-";

  const counts = new Array(12).fill(0);
  holidays.forEach((holiday) => {
    counts[holiday.date.getMonth()] += 1;
  });

  const maxCount = Math.max(...counts);
  const maxMonthIndex = counts.indexOf(maxCount);

  topMonth.innerText = maxCount > 0 ? `${MONTH_NAMES[maxMonthIndex]} (${maxCount})` : "-";
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
