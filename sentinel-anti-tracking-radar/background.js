let detectedTrackers = {};

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = new URL(details.url);
    const tabId = details.tabId;
    
    if (!detectedTrackers[tabId]) detectedTrackers[tabId] = new Set();
    
    if (url.hostname.includes('google-analytics') || 
        url.hostname.includes('doubleclick') || 
        url.hostname.includes('facebook') ||
        url.hostname.includes('tracker')) {
      detectedTrackers[tabId].add(url.hostname);
    }
  },
  { urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_TRACKERS") {
    sendResponse({ trackers: Array.from(detectedTrackers[request.tabId] || []) });
  }
});