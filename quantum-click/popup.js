const chronoRadio = document.getElementById('chrono');
const pulseRadio = document.getElementById('pulse');
const panelChrono = document.getElementById('panel-chrono');
const panelPulse = document.getElementById('panel-pulse');
const cpsRange = document.getElementById('cps-range');
const cpsValue = document.getElementById('cps-value');
const statusDisplay = document.getElementById('status');

const togglePanels = () => {
  if (chronoRadio.checked) {
    panelChrono.classList.remove('hidden');
    panelPulse.classList.add('hidden');
  } else {
    panelPulse.classList.remove('hidden');
    panelChrono.classList.add('hidden');
  }
};

chronoRadio.onchange = togglePanels;
pulseRadio.onchange = togglePanels;

cpsRange.oninput = (e) => {
  cpsValue.innerText = e.target.value;
};

document.getElementById('place-cursor').onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  let config = {
    mode: chronoRadio.checked ? 'chrono' : 'pulse',
    active: true
  };

  if (config.mode === 'chrono') {
    const parts = document.getElementById('duration').value.split(':');
    const seconds = (+parts[0]) * 3600 + (+parts[1]) * 60 + (+parts[2]);
    const totalClicks = parseInt(document.getElementById('total-clicks').value);
    config.interval = (seconds / totalClicks) * 1000;
    config.total = totalClicks;
    config.alerts = parseInt(document.getElementById('alert-count').value);
  } else {
    config.interval = 1000 / parseInt(cpsRange.value);
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: injectCursorAndListenKey,
    args: [config]
  });
};

document.getElementById('stop').onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => { window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'f'})); }
  });
};

function injectCursorAndListenKey(config) {
    if (document.querySelector('.quantum-independent-cursor')) return;

    const cursor = document.createElement('div');
    cursor.className = 'quantum-independent-cursor';
    document.body.appendChild(cursor);

    let dragging = false;
    cursor.onmousedown = (e) => { dragging = true; e.preventDefault(); };
    document.addEventListener('mouseup', () => { dragging = false; });
    document.addEventListener('mousemove', (e) => {
        if (dragging) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
    });

    const handleKey = (e) => {
        const key = e.key.toLowerCase();
        if (key === 'e' && !window.quantumClickActive) {
            startLoop();
        } else if (key === 'f') {
            stopEverything();
        }
    };
    document.addEventListener('keydown', handleKey);

    function stopEverything() {
        window.quantumClickActive = false;
        const c = document.querySelector('.quantum-independent-cursor');
        if (c) c.remove();
        document.removeEventListener('keydown', handleKey);
    }

    function playAlert() {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        for (let i = 0; i < config.alerts; i++) {
            setTimeout(() => {
                const osc = context.createOscillator();
                const gain = context.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, context.currentTime);
                osc.connect(gain);
                gain.connect(context.destination);
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
                osc.stop(context.currentTime + 0.5);
            }, i * 600);
        }
    }

    function startLoop() {
        window.quantumClickActive = true;
        let clickCount = 0;

        const loop = setInterval(() => {
            if (!window.quantumClickActive) {
                clearInterval(loop);
                return;
            }

            const rect = cursor.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2;

            cursor.style.pointerEvents = 'none';
            const elementToClick = document.elementFromPoint(targetX, targetY);
            cursor.style.pointerEvents = 'auto';

            if (elementToClick) {
                const pulse = document.createElement('div');
                pulse.className = 'pulse-fx';
                pulse.style.left = targetX + 'px';
                pulse.style.top = targetY + 'px';
                document.body.appendChild(pulse);
                setTimeout(() => pulse.remove(), 300);

                elementToClick.click();
                clickCount++;
            }

            if (config.mode === 'chrono' && config.total > 0 && clickCount >= config.total) {
                playAlert();
                stopEverything();
            }
        }, config.interval);
    }
}