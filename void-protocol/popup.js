document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleProtection');
    const statusLabel = document.getElementById('statusLabel');
    const statusPulse = document.getElementById('statusPulse');
    const threatCountText = document.getElementById('threatCount');
  
    const updateDisplay = () => {
      chrome.storage.local.get(['isActive', 'blockedCount'], (result) => {
        const active = result.isActive === true;
        const count = result.blockedCount || 0;
        
        if (active) {
          statusLabel.innerText = "PROTOCOL: ONLINE";
          threatCountText.innerText = `${count.toString().padStart(3, '0')} THREATS`;
          statusPulse.style.background = "var(--neon-blue)";
          statusPulse.style.boxShadow = "0 0 20px var(--neon-blue)";
          toggleBtn.innerText = "DEACTIVATE";
          toggleBtn.style.borderColor = "var(--neon-purple)";
          toggleBtn.style.color = "var(--neon-purple)";
        } else {
          statusLabel.innerText = "PROTOCOL: OFFLINE";
          threatCountText.innerText = "SYSTEM SECURE";
          statusPulse.style.background = "#333";
          statusPulse.style.boxShadow = "none";
          toggleBtn.innerText = "ACTIVATE";
          toggleBtn.style.borderColor = "var(--neon-blue)";
          toggleBtn.style.color = "var(--neon-blue)";
        }
      });
    };
  
    updateDisplay();
    setInterval(updateDisplay, 1000);
  
    toggleBtn.addEventListener('click', () => {
      chrome.storage.local.get(['isActive'], (result) => {
        let newState = !(result.isActive === true);
        chrome.storage.local.set({ isActive: newState }, () => {
          chrome.runtime.sendMessage({ action: newState ? "enable" : "disable" });
          updateDisplay();
        });
      });
    });
  
    document.getElementById('clearCache').addEventListener('click', () => {
      const btn = document.getElementById('clearCache');
      btn.innerText = "EXECUTING...";
      chrome.browsingData.remove({
        "since": (new Date()).getTime() - (1000 * 60 * 60 * 24 * 7)
      }, {
        "appcache": true, "cache": true, "cookies": true, "history": true, "localStorage": true
      }, () => {
        setTimeout(() => {
          btn.innerText = "TRACE ERASED";
          setTimeout(() => { btn.innerText = "PURGE TRACE DATA"; }, 1500);
        }, 800);
      });
    });
});