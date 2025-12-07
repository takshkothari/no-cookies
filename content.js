// Regex patterns for cookie dialog detection and button identification
const PATTERNS = {
  reject: /reject|decline|refuse|dissent|only\s*necessary|deny|disagree|do\s*not\s*accept|opt\s*out|close|necessary\s*cookies\s*only/i,
  expand: /more|details|options|settings|preferences|show\s*more|manage|customize|advanced/i,
  confirm: /confirm|save|apply|accept|submit|continue/i,
  dialog: /cookie|consent|privacy|gdpr|ccpa|tracking/i,
  nonEssential: /marketing|analytics|advertising|tracking|social|performance|targeting|measurement|personali[sz]ation/i,
  essential: /session|auth|security|csrf|xsrf|user_id|preferences|functional|necessary/i
};

// Check if extension is enabled
async function isExtensionEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get('extensionEnabled', (result) => {
      resolve(result.extensionEnabled !== false);
    });
  });
}

// Check if website was already processed in this session
async function isWebsiteProcessed() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'checkIfProcessed', url: window.location.href },
      (response) => {
        resolve(response.isProcessed);
      }
    );
  });
}

// Mark website as processed
async function markWebsiteAsProcessed() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'markAsProcessed', url: window.location.href },
      (response) => {
        resolve(response.success);
      }
    );
  });
}

// Find and click reject button using regex
function findAndClickRejectButton() {
  const allButtons = document.querySelectorAll('button, a[role="button"]');
  
  for (let button of allButtons) {
    const text = button.textContent.toLowerCase().trim();
    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
    
    if (PATTERNS.reject.test(text) || PATTERNS.reject.test(ariaLabel)) {
      if (button.offsetParent !== null && isLikelyDialogContext(button)) {
        console.log(`[No Cookies] Clicking reject: "${text}"`);
        button.click();
        return true;
      }
    }
  }
  return false;
}

// Find and click expand/more options button using regex
function findAndClickExpandButton() {
  const allButtons = document.querySelectorAll('button, a[role="button"]');
  
  for (let button of allButtons) {
    const text = button.textContent.toLowerCase().trim();
    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
    
    if (PATTERNS.expand.test(text) || PATTERNS.expand.test(ariaLabel)) {
      if (button.offsetParent !== null && isLikelyDialogContext(button)) {
        console.log(`[No Cookies] Clicking expand: "${text}"`);
        button.click();
        return true;
      }
    }
  }
  return false;
}

// Turn off all non-essential cookie toggles using regex
function turnOffNonEssentialCookies() {
  let togglesFound = 0;
  
  const toggles = document.querySelectorAll(
    'input[type="checkbox"], input[type="radio"], [role="switch"]'
  );
  
  for (let toggle of toggles) {
    if (toggle.offsetParent === null) continue;
    if (!isLikelyDialogContext(toggle)) continue;
    
    const label = getToggleLabel(toggle);
    const isNonEssential = PATTERNS.nonEssential.test(label) && !PATTERNS.essential.test(label);
    
    if (isNonEssential) {
      if (toggle.type === 'checkbox' && toggle.checked) {
        console.log(`[No Cookies] Disabling: "${label}"`);
        toggle.click();
        togglesFound++;
      } else if (toggle.getAttribute('role') === 'switch' && toggle.getAttribute('aria-checked') === 'true') {
        console.log(`[No Cookies] Disabling switch: "${label}"`);
        toggle.click();
        togglesFound++;
      }
    }
  }
  
  return togglesFound > 0;
}

function getToggleLabel(toggle) {
  const labelId = toggle.getAttribute('aria-labelledby');
  if (labelId) {
    const label = document.getElementById(labelId);
    if (label) return label.textContent;
  }
  
  let parent = toggle.parentElement;
  for (let i = 0; i < 5; i++) {
    if (!parent) break;
    if (parent.tagName === 'LABEL') {
      return parent.textContent;
    }
    parent = parent.parentElement;
  }
  
  const wrapper = toggle.closest('div');
  if (wrapper) {
    return wrapper.textContent;
  }
  
  return toggle.getAttribute('aria-label') || '';
}

// Find and click confirm/save button using regex
function findAndClickConfirmButton() {
  const allButtons = document.querySelectorAll('button, a[role="button"]');
  
  for (let button of allButtons) {
    const text = button.textContent.toLowerCase().trim();
    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
    
    if (PATTERNS.confirm.test(text) || PATTERNS.confirm.test(ariaLabel)) {
      if (button.offsetParent !== null && isLikelyDialogContext(button)) {
        console.log(`[No Cookies] Clicking confirm: "${text}"`);
        button.click();
        return true;
      }
    }
  }
  
  return false;
}

// Check if button is in a dialog-like context using regex
function isLikelyDialogContext(element) {
  let parent = element.parentElement;
  for (let i = 0; i < 15; i++) {
    if (!parent) break;
    
    const text = parent.textContent.toLowerCase();
    const classList = parent.className.toLowerCase();
    const id = (parent.id || '').toLowerCase();
    
    if (PATTERNS.dialog.test(text) || PATTERNS.dialog.test(classList) || PATTERNS.dialog.test(id)) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

function clearStorageData() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!isEssentialStorageKey(key)) {
        localStorage.removeItem(key);
      }
    }
    
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (!isEssentialStorageKey(key)) {
        sessionStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.log('Storage access denied');
  }
}

function isEssentialStorageKey(key) {
  return PATTERNS.essential.test(key.toLowerCase());
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleCookieConsent() {
  if (!(await isExtensionEnabled())) return;
  
  if (await isWebsiteProcessed()) {
    console.log('[No Cookies] Website already processed in this session - skipping');
    return;
  }
  
  const dialogExists = document.querySelector(
    'div[class*="cookie"], div[class*="consent"], div[class*="privacy"]'
  );
  
  if (!dialogExists) {
    console.log('[No Cookies] No cookie dialog detected');
    return;
  }
  
  console.log('[No Cookies] Processing cookie dialog...');
  
  if (findAndClickRejectButton()) {
    clearStorageData();
    await markWebsiteAsProcessed();
    return;
  }
  
  if (findAndClickExpandButton()) {
    console.log('[No Cookies] Expanded options, waiting for second screen...');
    await sleep(800);
  }
  
  if (turnOffNonEssentialCookies()) {
    console.log('[No Cookies] Disabled non-essential cookies');
    await sleep(500);
  }
  
  if (findAndClickConfirmButton()) {
    clearStorageData();
    await markWebsiteAsProcessed();
    return;
  }
  
  await markWebsiteAsProcessed();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleCookieConsent);
} else {
  handleCookieConsent();
}

setInterval(async () => {
  if (!(await isWebsiteProcessed())) {
    handleCookieConsent();
  }
}, 2500);
