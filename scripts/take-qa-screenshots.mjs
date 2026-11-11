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

  // Desktop 1440x900
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // 1. Size Finder
  console.log('Capturing /size-finder...');
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/size-finder' });
  await new Promise(r => setTimeout(r, 1000));
  await cdp.captureScreenshot('sauz-size-finder.png');

  // 2. Fit Builder
  console.log('Capturing /fit-builder...');
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/fit-builder' });
  await new Promise(r => setTimeout(r, 1000));
  await cdp.captureScreenshot('sauz-fit-builder.png');

  // 3. Drops
  console.log('Capturing /drops...');
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/drops' });
  await new Promise(r => setTimeout(r, 1000));
  await cdp.captureScreenshot('sauz-drops.png');

  // 4. Community
  console.log('Capturing /community...');
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/community' });
  await new Promise(r => setTimeout(r, 1000));
  await cdp.captureScreenshot('sauz-community.png');

  // 5. Style DNA
  console.log('Capturing /style-dna...');
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/style-dna' });
  await new Promise(r => setTimeout(r, 1000));
  await cdp.captureScreenshot('sauz-style-dna.png');

  // 6. Closet
  console.log('Capturing /closet...');
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/closet' });
  await new Promise(r => setTimeout(r, 1000));
  await cdp.captureScreenshot('sauz-closet.png');

  // 7. Mobile Drawer (390x844)
  console.log('Capturing Mobile Drawer at 390px...');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:31990/' });
  await new Promise(r => setTimeout(r, 1200));

  // Open mobile drawer
  await cdp.evaluate(`
    const btn = document.querySelector('.bf-mobile-menu-btn');
    if (btn) btn.click();
  `);
  await new Promise(r => setTimeout(r, 500));

  // Open SAUZ Experience accordion in mobile drawer
  await cdp.evaluate(`
    const trigger = document.querySelector('.bf-exp-mobile-trigger');
    if (trigger) trigger.click();
  `);
  await new Promise(r => setTimeout(r, 500));
  await cdp.captureScreenshot('mega-menu-mobile.png');

  // Clear device override at the end
  await cdp.send('Emulation.clearDeviceMetricsOverride');

  cdp.close();
  console.log('Completed capturing all experience pages and mobile menu!');
}

run().catch(console.error);
