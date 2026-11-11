export const orderStages = [
  { label:'Recibido', description:'Recibimos tu pedido. Estamos pendientes de confirmar su aceptación.' },
  { label:'Aceptado', description:'Tu pedido fue aceptado por SAUZ. El siguiente paso es preparar tu selección.' },
  { label:'En preparación', description:'Tu selección está en preparación para el despacho.' },
  { label:'En camino', description:'Tu pedido fue despachado. Consulta la guía registrada para seguir el envío.' },
  { label:'Entregado', description:'El pedido figura como entregado. Consulta el historial para ver los detalles.' },
];
export function orderStage(status) {
  return ({Pendiente:0,Recibido:0,Aceptado:1,'En proceso':2,'En preparación':2,Enviado:3,'En camino':3,Entregado:4})[status] ?? -1;
}
export function safeTrackingUrl(value) {
  try { const url=new URL(value);return url.protocol==='https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
