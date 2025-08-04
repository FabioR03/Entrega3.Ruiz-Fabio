let destinos = [];
let historial = [];

const destinoSelect = document.getElementById("destino");
const duracionInput = document.getElementById("duracion");
const monedaSelect = document.getElementById("moneda");
const hotelCheckbox = document.getElementById("hotel");
const excursionesCheckbox = document.getElementById("excursiones");
const transporteCheckbox = document.getElementById("transporte");
const formCotizador = document.getElementById("formCotizador");
const resultadoDiv = document.getElementById("resultadoCotizacion");
const historialDiv = document.getElementById("historial");
const vaciarHistorialBtn = document.getElementById("vaciarHistorial");

function obtenerTasaCambio(moneda) {
  const tasas = { USD: 1, EUR: 0.9, ARS: 900, COP: 4000 };
  return tasas[moneda] || 1;
}

function formatoMoneda(valor, moneda) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: moneda,
  }).format(valor);
}

function logCotizacion(destino, total, moneda) {
  console.log(
    `[LOG] Cotización generada: ${destino} - ${moneda} ${total.toFixed(2)}`
  );
}

function guardarHistorial() {
  localStorage.setItem("historialCotizaciones", JSON.stringify(historial));
}

function cargarHistorial() {
  const data = localStorage.getItem("historialCotizaciones");
  if (data) {
    historial = JSON.parse(data);
  }
}

function renderHistorial() {
  historialDiv.innerHTML = "";
  if (historial.length === 0) {
    historialDiv.innerHTML = "<p>No hay cotizaciones en el historial.</p>";
    return;
  }

  historial.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.index = index;

    card.innerHTML = `
      <h3>Resumen del Viaje</h3>
      <p><strong>Destino:</strong> ${item.destino}</p>
      <p><strong>Días:</strong> ${item.dias}</p>
      <p><strong>Extras:</strong> ${
        item.extras.length ? item.extras.join(", ") : "Ninguno"
      }</p>
      <p><strong>Moneda:</strong> ${item.moneda}</p>
      <p><strong>Total estimado:</strong> ${formatoMoneda(
        item.total,
        item.moneda
      )}</p>
      <div class="acciones-card">
        <button class="editar">Editar</button>
        <button class="borrar">Borrar</button>
      </div>
    `;

    historialDiv.appendChild(card);
  });
}

function cargarOpciones(destinos) {
  destinoSelect.innerHTML =
    '<option value="" disabled selected>Seleccione destino</option>';
  destinos.forEach((dest) => {
    const option = document.createElement("option");
    option.value = dest.id;
    option.textContent = dest.destino;
    destinoSelect.appendChild(option);
  });
}

function calcularCotizacion(e) {
  e.preventDefault();

  try {
    const id = parseInt(destinoSelect.value);
    if (isNaN(id)) throw new Error("Por favor, seleccione un destino válido.");

    const dias = parseInt(duracionInput.value);
    if (isNaN(dias) || dias < 1)
      throw new Error("La duración debe ser un número mayor o igual a 1.");

    const moneda = monedaSelect.value;

    const extrasSeleccionados = {
      hotel: hotelCheckbox.checked,
      excursiones: excursionesCheckbox.checked,
      transporte: transporteCheckbox.checked,
    };

    const destino = destinos.find((d) => d.id === id);
    if (!destino) throw new Error("Destino no válido.");

    let totalUSD = destino.precioBase * dias;
    if (extrasSeleccionados.hotel) totalUSD += destino.hotel * dias;
    if (extrasSeleccionados.excursiones) totalUSD += destino.excursiones;
    if (extrasSeleccionados.transporte) totalUSD += destino.transporte;

    const tasa = obtenerTasaCambio(moneda);
    const totalMoneda = totalUSD * tasa;

    const extrasArray = Object.entries(extrasSeleccionados)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    const nuevaCotizacion = {
      destino: destino.destino,
      dias,
      extras: extrasArray,
      moneda,
      total: totalMoneda,
    };

    historial.push(nuevaCotizacion);
    guardarHistorial();
    renderHistorial();

    mostrarResultado(nuevaCotizacion);

    logCotizacion(destino.destino, totalMoneda, moneda);
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
}

function mostrarResultado(cotizacion) {
  const { destino, dias, extras, total, moneda } = cotizacion;
  resultadoDiv.innerHTML = `
    <h3>Resumen del Viaje</h3>
    <p><strong>Destino:</strong> ${destino}</p>
    <p><strong>Días:</strong> ${dias}</p>
    <p><strong>Extras:</strong> ${
      extras.length ? extras.join(", ") : "Ninguno"
    }</p>
    <p><strong>Total estimado:</strong> ${formatoMoneda(total, moneda)}</p>
  `;

  Toastify({
    text: "Cotización generada con éxito",
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "#4CAF50",
  }).showToast();
}

function editarCotizacion(index) {
  const cot = historial[index];
  if (!cot) return;

  const destinoObj = destinos.find((d) => d.destino === cot.destino);
  if (!destinoObj) return;

  destinoSelect.value = destinoObj.id;
  duracionInput.value = cot.dias;
  monedaSelect.value = cot.moneda;

  hotelCheckbox.checked = cot.extras.includes("hotel");
  excursionesCheckbox.checked = cot.extras.includes("excursiones");
  transporteCheckbox.checked = cot.extras.includes("transporte");

  Swal.fire({
    icon: "info",
    title: "Editar Cotización",
    text: "Modifique los datos y calcule de nuevo para actualizar.",
  });

  historial.splice(index, 1);
  guardarHistorial();
  renderHistorial();

  resultadoDiv.innerHTML = "";
}

function borrarCotizacion(index) {
  Swal.fire({
    title: "¿Está seguro de borrar esta cotización?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, borrar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      historial.splice(index, 1);
      guardarHistorial();
      renderHistorial();

      Toastify({
        text: "Cotización borrada",
        duration: 2000,
        gravity: "top",
        position: "right",
        backgroundColor: "#d9534f",
      }).showToast();
    }
  });
}

function vaciarHistorial() {
  if (historial.length === 0) {
    Swal.fire("Info", "El historial ya está vacío.", "info");
    return;
  }

  Swal.fire({
    title: "¿Está seguro de vaciar todo el historial?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      historial = [];
      guardarHistorial();
      renderHistorial();

      Toastify({
        text: "Historial vaciado",
        duration: 2000,
        gravity: "top",
        position: "right",
        backgroundColor: "#d9534f",
      }).showToast();

      resultadoDiv.innerHTML = "";
    }
  });
}

formCotizador.addEventListener("submit", calcularCotizacion);
vaciarHistorialBtn.addEventListener("click", vaciarHistorial);

historialDiv.addEventListener("click", (e) => {
  if (e.target.classList.contains("editar")) {
    const card = e.target.closest(".card");
    if (!card) return;
    const index = parseInt(card.dataset.index);
    editarCotizacion(index);
  }
  if (e.target.classList.contains("borrar")) {
    const card = e.target.closest(".card");
    if (!card) return;
    const index = parseInt(card.dataset.index);
    borrarCotizacion(index);
  }
});

fetch("./data/viajes.json")
  .then((res) => res.json())
  .then((data) => {
    destinos = data;
    cargarOpciones(destinos);
    cargarHistorial();
    renderHistorial();
  })
  .catch(() => {
    Swal.fire("Error", "No se pudo cargar la lista de destinos.", "error");
  });
