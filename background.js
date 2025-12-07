// Regex pattern for essential cookies (case-insensitive)
const ESSENTIAL_PATTERN = /session|auth|security|csrf|xsrf|user_id|preferences|functional|necessary/i;

// Session-based cache for processed websites
let processedWebsites = new Set();

// Check if cookie is essential
function isEssentialCookie(cookie) {
  if (!cookie || !cookie.name) return false;
  return ESSENTIAL_PATTERN.test(cookie.name);
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    console.error('[No Cookies] Error extracting domain:', e);
    return url;
  }
}

// Initialize extension as enabled by default
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('extensionEnabled', (result) => {
    if (result.extensionEnabled === undefined) {
      chrome.storage.local.set({ extensionEnabled: true });
    }
  });
  console.log('[No Cookies] Extension installed');
});

// Monitor cookie changes
chrome.cookies.onChanged.addListener((changeInfo) => {
  chrome.storage.local.get('extensionEnabled', (result) => {
    if (result.extensionEnabled === false) return;

    const cookie = changeInfo.cookie;
    
    if (!isEssentialCookie(cookie) && !changeInfo.removed) {
      const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
      chrome.cookies.remove({
        url: url,
        name: cookie.name
      }).catch(err => {
        console.log(`[No Cookies] Could not remove cookie: ${cookie.name}`);
      });
    }
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'checkIfProcessed') {
      const domain = extractDomain(request.url);
      const isProcessed = processedWebsites.has(domain);
      sendResponse({ isProcessed });
    } else if (request.action === 'markAsProcessed') {
      const domain = extractDomain(request.url);
      processedWebsites.add(domain);
      console.log(`[No Cookies] Cached: ${domain}`);
      sendResponse({ success: true });
    } else if (request.action === 'clearCache') {
      processedWebsites.clear();
      console.log('[No Cookies] Cache cleared');
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error('[No Cookies] Error handling message:', error);
    sendResponse({ error: error.message });
  }
});

// Clear cache on browser shutdown (session end)
chrome.runtime.onSuspend.addListener(() => {
  processedWebsites.clear();
  console.log('[No Cookies] Session ended - cache cleared');
});
