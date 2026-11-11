import React, { useState } from 'react';
import { Package, Check, Truck, CheckCircle2, Clock3, Copy, ExternalLink, MapPin } from 'lucide-react';
import { orderStage, orderStages, safeTrackingUrl } from '../../utilidades/orderTracking';
import './order-tracking.css';

export function OrderTracking({ order, compact = false }) {
  const [copyMessage,setCopyMessage] = useState('');
  const stage=orderStage(order.orderStatus);
  const cancelled=order.orderStatus==='Cancelado';
  const shipping=order.shippingTracking || {};
  const link=safeTrackingUrl(shipping.trackingUrl);
  const latest=order.trackingHistory?.at(-1);
  const Icon=stage===4?CheckCircle2:stage===3?Truck:stage>0?Package:Clock3;
  const title=cancelled?'Pedido cancelado':stage<0?(order.orderStatus || 'Estado por confirmar'):orderStages[stage].label;
  return <section className={`order-tracking ${compact?'is-compact':''}`} aria-label={`Estado del pedido ${order.orderId}`}>
    <div className="order-tracking-status"><span className={`order-status-icon ${cancelled?'is-cancelled':''}`}><Icon size={22} aria-hidden="true" /></span><div><span className="order-tracking-kicker">{order.orderId}</span><h4>{title}</h4><p>{cancelled?'Este pedido figura como cancelado.':stage<0?'Consulta las actualizaciones registradas por SAUZ.':orderStages[stage].description}</p></div></div>
    {!cancelled && <ol className="order-progress" aria-label="Etapas del pedido">{orderStages.map((step,index)=><li key={step.label} className={`${index<=stage?'is-complete':''} ${index===stage?'is-current':''}`} aria-current={index===stage?'step':undefined}><span className="order-progress-node">{index<stage?<Check size={12} aria-hidden="true" />:index+1}</span><span>{step.label}</span></li>)}</ol>}
    {!cancelled && <div className="order-shipping-guide">
      <div className="order-guide-heading"><Truck size={18} aria-hidden="true" /><strong>{shipping.trackingNumber?'Tu guía de envío':'Guía pendiente de asignación'}</strong></div>
      {shipping.trackingNumber?<><div className="order-guide-data"><div><span>Transportadora</span><strong>{shipping.carrier || 'Por confirmar'}</strong></div><div><span>Número de guía</span><code>{shipping.trackingNumber}</code></div></div><div className="order-guide-actions"><button type="button" onClick={async()=>{try { await navigator.clipboard.writeText(shipping.trackingNumber);setCopyMessage('Guía copiada'); } catch { setCopyMessage('Puedes seleccionar y copiar el número de guía de arriba.'); }}}><Copy size={14} aria-hidden="true" /> Copiar guía</button>{link && <a href={link} target="_blank" rel="noopener noreferrer">Consultar envío <ExternalLink size={14} aria-hidden="true" /></a>}</div><span className="order-copy-message" role="status">{copyMessage}</span>{!link && <p>Usa este número en el sitio oficial de la transportadora. SAUZ aún no ha registrado un enlace de seguimiento.</p>}</>:<p>Cuando SAUZ registre la transportadora y el número de guía, los encontrarás aquí.</p>}
    </div>}
    {!compact && <div className="order-tracking-last"><span>Última actualización registrada</span><p>{latest?.dateFormatted || latest?.timestamp || order.date || 'Sin fecha registrada'}</p>{latest?.note && <p>{latest.note}</p>}{latest?.location && <small><MapPin size={12} aria-hidden="true" />{latest.location}</small>}</div>}
  </section>;
}
