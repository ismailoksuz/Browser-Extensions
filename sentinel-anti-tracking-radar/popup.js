async function initRadar() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.runtime.sendMessage({ type: "GET_TRACKERS", tabId: tab.id }, (response) => {
      const trackers = response.trackers;
      const countEl = document.getElementById('threat-count');
      const statusEl = document.getElementById('sys-status');
      const logEl = document.getElementById('tracker-list');
      const dotContainer = document.getElementById('tracker-dots');
  
      countEl.innerText = trackers.length;
      
      if (trackers.length > 0) {
        statusEl.innerText = "THREAT DETECTED";
        statusEl.style.color = "var(--alert-red)";
        
        trackers.forEach(domain => {
          const entry = document.createElement('div');
          entry.className = 'log-entry';
          entry.innerText = `[BLOCKED] ${domain}`;
          logEl.appendChild(entry);
  
          const dot = document.createElement('div');
          dot.className = 'dot';
          dot.style.left = Math.random() * 80 + 10 + "%";
          dot.style.top = Math.random() * 80 + 10 + "%";
          dotContainer.appendChild(dot);
        });
      }
    });
  }
  
  initRadar();