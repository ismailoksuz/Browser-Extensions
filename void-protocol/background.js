let blockedCount = 0;

const rules = [
  { "id": 1, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "doubleclick.net", "resourceTypes": ["script", "image"] } },
  { "id": 2, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "google-analytics.com", "resourceTypes": ["script"] } },
  { "id": 3, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "netmera", "resourceTypes": ["script", "xmlhttprequest", "other"] } },
  { "id": 4, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "googletagmanager.com", "resourceTypes": ["script"] } },
  { "id": 5, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "criteo.com", "resourceTypes": ["script"] } }
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isActive: false, blockedCount: 0 });
});

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(() => {
  chrome.storage.local.get(['isActive', 'blockedCount'], (result) => {
    if (result.isActive) {
      let count = (result.blockedCount || 0) + 1;
      chrome.storage.local.set({ blockedCount: count });
    }
  });
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "enable") {
    chrome.storage.local.set({ blockedCount: 0 }, () => {
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map(r => r.id),
        addRules: rules
      }, () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0]) chrome.tabs.reload(tabs[0].id);
        });
      });
    });
  } else if (request.action === "disable") {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(r => r.id)
    }, () => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) chrome.tabs.reload(tabs[0].id);
      });
    });
  }
});