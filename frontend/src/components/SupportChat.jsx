import React, { useState } from 'react';

const answers = (message) => {
  const text = message.toLowerCase();
  if (text.includes('talla') || text.includes('cambio')) return 'Para un cambio de talla, envíanos por WhatsApp tu número de pedido, la talla recibida y la talla que necesitas. Puedes solicitarlo hasta 30 días después de la entrega.';
  if (text.includes('devolu') || text.includes('reembolso')) return 'Para solicitar una devolución, envíanos por WhatsApp tu número de pedido y el motivo. Te indicaremos los siguientes pasos.';
  if (text.includes('pedido') || text.includes('envío') || text.includes('envio') || text.includes('rastreo')) return 'Compártenos por WhatsApp tu número de orden y el nombre de la compra. Un asesor verificará el estado de tu envío.';
  return 'Puedo ayudarte con cambios de talla, devoluciones y pedidos. También puedes continuar con un asesor por WhatsApp.';
};

export const SupportChat = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ id: 'welcome', from: 'bot', text: '¡Hola! Soy el asistente de Sauz Store. ¿Necesitas ayuda con un cambio, devolución o pedido?' }]);

  const send = (text) => {
    const value = text.trim();
    if (!value) return;
    const id = Date.now();
    setMessages((current) => [...current, { id: 'user-' + id, from: 'user', text: value }, { id: 'bot-' + id, from: 'bot', text: answers(value) }]);
    setInput('');
  };

  return (
    <aside className="support-chat" aria-label="Asistente de atención al cliente">
      {open && (
        <section className="support-chat-panel" aria-label="Chat de soporte">
          <header className="support-chat-header">
            <div><span className="support-chat-status" /><strong>Asistente Sauz</strong><p>Cambios, devoluciones y pedidos</p></div>
            <button type="button" className="support-chat-close" onClick={() => setOpen(false)} aria-label="Cerrar chat">×</button>
          </header>
          <div className="support-chat-messages" aria-live="polite">
            {messages.map((message) => <p key={message.id} className={'support-message ' + message.from}>{message.text}</p>)}
          </div>
          <div className="support-chat-quick-actions">
            <button type="button" onClick={() => send('Necesito un cambio de talla')}>Cambio de talla</button>
            <button type="button" onClick={() => send('Quiero una devolución')}>Devolución</button>
            <button type="button" onClick={() => send('Quiero saber el estado de mi pedido')}>Mi pedido</button>
          </div>
          <a className="support-chat-whatsapp" href="https://wa.me/573129876543?text=Hola%20Sauz%20Store%2C%20necesito%20ayuda%20con%20mi%20pedido." target="_blank" rel="noreferrer">Continuar por WhatsApp</a>
          <form className="support-chat-form" onSubmit={(event) => { event.preventDefault(); send(input); }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Escribe tu consulta..." aria-label="Escribe tu consulta" />
            <button type="submit" aria-label="Enviar mensaje">↑</button>
          </form>
        </section>
      )}
      <button type="button" className="support-chat-launcher" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? '×' : '💬'} <span>{open ? 'Cerrar' : '¿Necesitas ayuda?'}</span>
      </button>
    </aside>
  );
};
