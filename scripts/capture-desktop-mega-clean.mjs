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
  await cdp.send('Emulation.clearDeviceMetricsOverride');

  // Set explicit 1440x900 desktop
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Reload page to ensure clean desktop layout
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/' });
  await new Promise(r => setTimeout(r, 1200));

  const winWidth = await cdp.evaluate('window.innerWidth');
  console.log('Window innerWidth is:', winWidth);

  // 1. Hover/Click Hombre
  const hombreRes = await cdp.evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('.bf-desktop-nav button')).find(b => b.textContent.includes('Hombre'));
      if (!btn) return 'Hombre btn not found';
      btn.click();
      return 'Clicked ' + btn.textContent.trim();
    })()
  `);
  console.log('Hombre action:', hombreRes);
  await new Promise(r => setTimeout(r, 400));
  const menu1 = await cdp.evaluate('Boolean(document.querySelector(".sauz-mega-menu-container"))');
  console.log('Mega menu open?', menu1);
  await cdp.captureScreenshot('mega-menu-desktop-hombre.png');

  // 2. Click Marcas
  await cdp.evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('.bf-desktop-nav button')).find(b => b.textContent.includes('Marcas'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));
  const menu2 = await cdp.evaluate('Boolean(document.querySelector(".sauz-mega-menu-container"))');
  console.log('Marcas mega menu open?', menu2);
  await cdp.captureScreenshot('mega-menu-desktop-marcas.png');

  // 3. Click SAUZ Experience
  await cdp.evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('.bf-desktop-nav button')).find(b => b.textContent.includes('SAUZ Experience'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));
  const menu3 = await cdp.evaluate('Boolean(document.querySelector(".sauz-mega-menu-container"))');
  console.log('Experience mega menu open?', menu3);
  await cdp.captureScreenshot('mega-menu-desktop-experience.png');

  cdp.close();
}

run().catch(console.error);
