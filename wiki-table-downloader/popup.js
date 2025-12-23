document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const tableCountEl = document.getElementById('tableCount');

  const updateUI = (isActive) => {
    toggleBtn.innerText = isActive ? 'DEACTIVATE' : 'ACTIVATE';
    toggleBtn.className = isActive ? 'active-mode' : 'passive-mode';
    if (!isActive) tableCountEl.innerText = "0";
  };

  chrome.storage.local.get(['isActive'], (result) => {
    updateUI(result.isActive);
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "updateCount") {
      tableCountEl.innerText = msg.count;
    }
  });

  toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['isActive'], (result) => {
      const newState = !result.isActive;
      chrome.storage.local.set({ isActive: newState }, () => {
        updateUI(newState);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "refresh" });
          }
        });
      });
    });
  });
});