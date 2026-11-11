import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Juan/.gemini/antigravity/brain/4f6d2d33-27c0-4d28-b624-75401d1bc7b6';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { res, rej } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((res, rej) => {
      const id = this.id++;
      this.callbacks.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, filename), buffer);
    console.log(`Saved screenshot ${filename} (${buffer.length} bytes)`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const targets = await getJson('http://localhost:9227/json');
  const pageTarget = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
  if (!pageTarget) throw new Error('Target not found');

  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');

  // 1. Desktop 1440x900: Navbar y Mega Menú Marcas
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/' });
  await new Promise(r => setTimeout(r, 1200));

  // Abrir Mega Menú Marcas
  await cdp.evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('.bf-desktop-nav button')).find(b => b.textContent.includes('Marcas'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));
  await cdp.captureScreenshot('redesign-mega-menu-marcas-1440.png');

  // Abrir Mega Menú Ropa
  await cdp.evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('.bf-desktop-nav button')).find(b => b.textContent.includes('Ropa'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));
  await cdp.captureScreenshot('redesign-mega-menu-ropa-1440.png');

  // Cerrar mega menú y capturar cards en Home
  await cdp.evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('.bf-desktop-nav button')).find(b => b.textContent.includes('Inicio'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 500));
  await cdp.captureScreenshot('redesign-cards-home-1440.png');

  // 2. Nuevo Login & Registro Minimalista (/admin/login)
  console.log('Capturing /admin/login...');
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/admin/login' });
  await new Promise(r => setTimeout(r, 1000));
  await cdp.captureScreenshot('redesign-login-desktop-1440.png');

  // Cambiar a pestaña Registro
  await cdp.evaluate(`
    (() => {
      const regTab = Array.from(document.querySelectorAll('.sauz-auth-tab')).find(t => t.textContent.includes('Crear Cuenta'));
      if (regTab) regTab.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 300));
  await cdp.captureScreenshot('redesign-register-desktop-1440.png');

  // 3. Mobile 390x844: Drawer Lateral con 6 elementos y acordeones
  console.log('Capturing Mobile Drawer at 390px...');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/' });
  await new Promise(r => setTimeout(r, 1200));

  await cdp.evaluate(`
    const btn = document.querySelector('.bf-mobile-menu-btn');
    if (btn) btn.click();
  `);
  await new Promise(r => setTimeout(r, 500));
  await cdp.captureScreenshot('redesign-drawer-mobile-390.png');

  await cdp.send('Emulation.clearDeviceMetricsOverride');
  cdp.close();
  console.log('Final integration screenshots captured successfully!');
}

run().catch(console.error);
