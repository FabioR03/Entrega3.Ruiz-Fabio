export function obtenerTasaCambio(moneda) {
  const tasas = {
    USD: 1,
    EUR: 0.9,
    ARS: 900,
    COP: 4000 
  }
  return tasas[moneda] || 1
}

export function formatoMoneda(valor, moneda) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: moneda
  }).format(valor)
}

export function logCotizacion(destino, total, moneda) {
  console.log(`[LOG] Cotización generada: ${destino} - ${moneda} ${total.toFixed(2)}`)
}
