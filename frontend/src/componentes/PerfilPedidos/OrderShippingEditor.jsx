import React, { useState } from 'react';
import { useCart } from '../../contextos/CartContext';
import { safeTrackingUrl } from '../../utilidades/orderTracking';

export function OrderShippingEditor({ order, onSaved }) {
  const { updateOrderStatus }=useCart();
  const [draft,setDraft]=useState({ carrier:order.shippingTracking?.carrier || '', trackingNumber:order.shippingTracking?.trackingNumber || '',trackingUrl:order.shippingTracking?.trackingUrl || '' });
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  return <div className="admin-shipping-editor"><h4>Transportadora y guía</h4><p>Estos datos se mostrarán al cliente en Mi cuenta. Registra el enlace HTTPS oficial del envío.</p>{[['carrier','Transportadora','Nombre de la transportadora'],['trackingNumber','Número de guía','Número asignado al envío'],['trackingUrl','Enlace de seguimiento','https://…']].map(([key,label,placeholder])=><label key={key}>{label}<input type={key==='trackingUrl'?'url':'text'} value={draft[key]} maxLength={key==='trackingUrl'?2048:120} placeholder={placeholder} onChange={e=>setDraft({...draft,[key]:e.target.value})} /></label>)}<button type="button" disabled={busy} onClick={async()=>{if(draft.trackingUrl.trim()&&!safeTrackingUrl(draft.trackingUrl.trim())) {setMessage('Introduce un enlace HTTPS válido de la transportadora.');return;}if((draft.carrier.trim()||draft.trackingUrl.trim())&&!draft.trackingNumber.trim()){setMessage('Registra el número de guía del envío.');return;}setBusy(true);setMessage('');try{const data=await updateOrderStatus(order.orderId,undefined,undefined,undefined,draft);onSaved(data.order);setMessage('Guía actualizada. El cliente puede consultarla en Mi cuenta.');}catch(error){setMessage(error.message);}finally{setBusy(false);}}}>{busy?'Guardando…':'Guardar guía de envío'}</button><p role="status">{message}</p></div>;
}
