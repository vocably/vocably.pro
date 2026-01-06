import { browserEnv } from './browserEnv';

let alivePort = null;

const SECONDS = 1000;
let isFirstStart = true;
let wakeup = undefined;

function stayAlive() {
  if (wakeup === undefined) {
    wakeup = setInterval(Highlander, 4 * SECONDS);
  }
}

async function Highlander() {
  console.log('Wake up Neo...');

  if (alivePort == null) {
    alivePort = browserEnv.runtime.connect({ name: 'whatever' });

    alivePort.onDisconnect.addListener(() => {
      if (browserEnv.runtime.lastError) {
        // This piece of code is to avoid the error message that appears when the port is disconnected
      }
      alivePort = null;
    });
  }

  if (alivePort) {
    alivePort.postMessage({ content: 'ping' });
  }

  if (isFirstStart) {
    isFirstStart = false;
    clearInterval(wakeup);
    wakeup = setInterval(Highlander, 180 * SECONDS);
  }
}

browserEnv.runtime.onInstalled.addListener(async () => {
  console.log('Stay alive: extension installed');
  stayAlive();
});

browserEnv.windows.onRemoved.addListener((windowId) => {
  console.log('Stay alive: window removed');
  if (wakeup !== undefined) {
    clearInterval(wakeup);
    wakeup = undefined;
    isFirstStart = true;
  }
});

browserEnv.windows.onCreated.addListener(async () => {
  console.log('Stay alive: window created');
  stayAlive();
});

stayAlive();
