import { obtenerTasaCambio, formatoMoneda, logCotizacion } from "../script_2/utils.js"

let destinos = []

document.addEventListener("DOMContentLoaded", () => {
  fetch("data/viajes.json")
    .then(res => res.json())
    .then(data => {
      destinos = data
      cargarOpciones(destinos)
    })

  document.getElementById("formCotizador").addEventListener("submit", calcularCotizacion)

  const cotizacionGuardada = localStorage.getItem("ultimaCotizacion")
  if (cotizacionGuardada) {
    document.getElementById("resultadoCotizacion").innerHTML = cotizacionGuardada
  }
})

function cargarOpciones(destinos) {
  const select = document.getElementById("destino")
  destinos.forEach(dest => {
    const option = document.createElement("option")
    option.value = dest.id
    option.textContent = dest.destino
    select.appendChild(option)
  })
}

function calcularCotizacion(e) {
  e.preventDefault()

  try {
    const id = parseInt(document.getElementById("destino").value)
    const dias = parseInt(document.getElementById("duracion").value)
    const moneda = document.getElementById("moneda").value

    const extras = {
      hotel: document.getElementById("hotel").checked,
      excursiones: document.getElementById("excursiones").checked,
      transporte: document.getElementById("transporte").checked
    }

    const destino = destinos.find(d => d.id === id)
    if (!destino) throw new Error("Destino no válido")

    let totalUSD = destino.precioBase * dias
    if (extras.hotel) totalUSD += destino.hotel * dias
    if (extras.excursiones) totalUSD += destino.excursiones
    if (extras.transporte) totalUSD += destino.transporte

    const tasa = obtenerTasaCambio(moneda)
    const totalMoneda = totalUSD * tasa

    mostrarResultado(destino.destino, totalMoneda, dias, extras, moneda)
    logCotizacion(destino.destino, totalMoneda, moneda)
  } catch (error) {
    Swal.fire("Error", error.message, "error")
  }
}

function mostrarResultado(destino, total, dias, extras, moneda) {
  const resultadoHTML = `
    <h3>Resumen del Viaje</h3>
    <p><strong>Destino:</strong> ${destino}</p>
    <p><strong>Días:</strong> ${dias}</p>
    <p><strong>Extras:</strong> 
      ${Object.entries(extras).filter(([k,v]) => v).map(([k]) => k).join(", ") || "Ninguno"}
    </p>
    <p><strong>Total estimado:</strong> ${formatoMoneda(total, moneda)}</p>
  `

  document.getElementById("resultadoCotizacion").innerHTML = resultadoHTML
  localStorage.setItem("ultimaCotizacion", resultadoHTML)

  Toastify({
    text: "Cotización generada con éxito",
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "#4CAF50"
  }).showToast()
}
