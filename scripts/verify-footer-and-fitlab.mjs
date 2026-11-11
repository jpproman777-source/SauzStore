import fs from 'node:fs/promises';

const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const action = pending.get(message.id);
    pending.delete(message.id);
    message.error ? action.reject(message.error) : action.resolve(message.result);
  }
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const next = ++id;
  pending.set(next, { resolve, reject });
  socket.send(JSON.stringify({ id: next, method, params }));
});
const evaluate = async expr => {
  const res = await call('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  return res.result.value;
};

await call('Page.enable');
await call('Runtime.enable');

// Desktop 1440x1000
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await call('Page.navigate', { url: 'http://127.0.0.1:31990/' });
await new Promise(r => setTimeout(r, 1500));

// 1. Verify FitLab removal and DOM presence
const audit = await evaluate(`(() => {
  const fitLabEl = document.getElementById('fit-lab');
  const bodyText = document.body.innerText;
  const hasFitLabText = bodyText.includes('SAUZ FIT LAB') || bodyText.includes('TU ESTILO, TU FÓRMULA');
  
  const footer = document.querySelector('.site-footer');
  const sauzLogo = document.querySelector('.footer-sauz-logo');
  const brandLogos = document.querySelectorAll('.footer-brand-img');
  const divider = document.querySelector('.footer-divider');
  const cols = document.querySelectorAll('.footer-nav-col');
  const bottomBar = document.querySelector('.footer-bottom-bar');
  
  return {
    fitLabInDom: !!fitLabEl,
    hasFitLabText,
    footerExists: !!footer,
    sauzLogoSrc: sauzLogo ? sauzLogo.getAttribute('src') : null,
    brandLogosCount: brandLogos.length,
    dividerExists: !!divider,
    columnsCount: cols.length,
    columnsHeadings: Array.from(cols).map(c => c.querySelector('.footer-nav-heading')?.textContent),
    bottomBarText: bottomBar ? bottomBar.textContent.trim().replace(/\\s+/g, ' ') : null,
    footerBg: footer ? window.getComputedStyle(footer).backgroundColor : null
  };
})()`);

console.log('AUDIT RESULT:', JSON.stringify(audit, null, 2));

// 2. Capture desktop footer
await evaluate(`(() => {
  const footer = document.querySelector('.site-footer');
  if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'start' });
})()`);
await new Promise(r => setTimeout(r, 800));

const shotFooterDesktop = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await fs.writeFile('docs/catalog-migration/footer-desktop-1440.png', Buffer.from(shotFooterDesktop.data, 'base64'));
console.log('Saved docs/catalog-migration/footer-desktop-1440.png');

// 3. Capture Home bottom transition (#marcas to footer)
await evaluate(`(() => {
  const marcas = document.getElementById('marcas');
  if (marcas) marcas.scrollIntoView({ behavior: 'instant', block: 'center' });
})()`);
await new Promise(r => setTimeout(r, 800));

const shotTransition = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await fs.writeFile('docs/catalog-migration/home-bottom-transition-1440.png', Buffer.from(shotTransition.data, 'base64'));
console.log('Saved docs/catalog-migration/home-bottom-transition-1440.png');

// 4. Test modal opening
await evaluate(`(() => {
  const shippingBtn = Array.from(document.querySelectorAll('.footer-nav-link')).find(b => b.textContent.includes('Envíos y entregas'));
  if (shippingBtn) shippingBtn.click();
})()`);
await new Promise(r => setTimeout(r, 700));

const shotModal = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await fs.writeFile('docs/catalog-migration/footer-modal-test.png', Buffer.from(shotModal.data, 'base64'));
console.log('Saved docs/catalog-migration/footer-modal-test.png');

// Close modal
await evaluate(`(() => {
  const closeBtn = document.querySelector('.footer-modal-close');
  if (closeBtn) closeBtn.click();
})()`);
await new Promise(r => setTimeout(r, 400));

// 5. Test Mobile 390x844
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await evaluate(`(() => {
  const footer = document.querySelector('.site-footer');
  if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'start' });
})()`);
await new Promise(r => setTimeout(r, 800));

const shotMobile = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await fs.writeFile('docs/catalog-migration/footer-mobile-390.png', Buffer.from(shotMobile.data, 'base64'));
console.log('Saved docs/catalog-migration/footer-mobile-390.png');

socket.close();
console.log('Verification finished successfully!');
