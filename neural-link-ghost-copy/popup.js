document.getElementById('bypass-trigger').onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const btn = document.getElementById('bypass-trigger');
    const status = document.getElementById('status-text');
  
    btn.innerText = "INJECTING...";
    status.innerText = "PROTOCOL ACTIVE";
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectNeuralLink
    });
  
    setTimeout(() => {
      btn.innerText = "BYPASS SUCCESS";
      btn.style.borderColor = "#fff";
      btn.style.color = "#fff";
    }, 1000);
  };
  
  function injectNeuralLink() {
    const css = `
      * {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  
    const events = ['contextmenu', 'copy', 'cut', 'paste', 'mousedown', 'mouseup', 'selectstart', 'select'];
    events.forEach(event => {
      document.addEventListener(event, (e) => e.stopPropagation(), true);
    });
  
    document.oncontextmenu = null;
    document.onselectstart = null;
    document.oncopy = null;
  }