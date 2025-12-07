const ESSENTIAL_KEYWORDS = [
  'session',
  'auth',
  'security',
  'csrf',
  'xsrf',
  'user_id',
  'preferences'
];

// Essential cookie patterns
function isEssentialCookie(cookie) {
  const name = cookie.name.toLowerCase();
  return ESSENTIAL_KEYWORDS.some(keyword => name.includes(keyword));
}

// Monitor cookie changes
chrome.cookies.onChanged.addListener((changeInfo) => {
  chrome.storage.local.get('extensionEnabled', (result) => {
    if (result.extensionEnabled === false) return;

    const cookie = changeInfo.cookie;
    
    // Remove non-essential cookies
    if (!isEssentialCookie(cookie) && !changeInfo.removed) {
      chrome.cookies.remove({
        url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
        name: cookie.name
      }).catch(err => console.log(`Could not remove cookie: ${cookie.name}`));
    }
  });
});

// Initialize extension as enabled by default
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('extensionEnabled', (result) => {
    if (result.extensionEnabled === undefined) {
      chrome.storage.local.set({ extensionEnabled: true });
    }
  });
});
