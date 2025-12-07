const REJECT_KEYWORDS = [
  'reject',
  'decline',
  'refuse',
  'dissent',
  'only necessary',
  'deny',
  'disagree',
  'do not accept',
  'close',
  'opt out'
];

const CONFIRM_KEYWORDS = [
  'confirm',
  'save',
  'apply',
  'accept',
  'submit'
];

const EXPAND_KEYWORDS = [
  'more',
  'details',
  'options',
  'settings',
  'preferences',
  'show more',
  'manage'
];

const DIALOG_KEYWORDS = [
  'cookie',
  'consent',
  'privacy',
  'gdpr',
  'ccpa'
];

const NON_ESSENTIAL_KEYWORDS = [
  'marketing',
  'analytics',
  'advertising',
  'tracking',
  'social',
  'performance',
  'targeting'
];

// Check if extension is enabled
async function isExtensionEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get('extensionEnabled', (result) => {
      resolve(result.extensionEnabled !== false);
    });
  });
}

// Find and click reject button
function findAndClickRejectButton() {
  const allButtons = document.querySelectorAll('button, a[role="button"]');
  
  for (let button of allButtons) {
    const text = button.textContent.toLowerCase().trim();
    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
    
    if (REJECT_KEYWORDS.some(keyword => 
      text.includes(keyword) || ariaLabel.includes(keyword)
    )) {
      if (button.offsetParent !== null && isLikelyDialogContext(button)) {
        console.log(`[Cookie Rejector] Clicking reject: "${text}"`);
        button.click();
        return true;
      }
    }
  }
  return false;
}

// Find and click expand/more options button
function findAndClickExpandButton() {
  const allButtons = document.querySelectorAll('button, a[role="button"]');
  
  for (let button of allButtons) {
    const text = button.textContent.toLowerCase().trim();
    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
    
    if (EXPAND_KEYWORDS.some(keyword => 
      text.includes(keyword) || ariaLabel.includes(keyword)
    )) {
      if (button.offsetParent !== null && isLikelyDialogContext(button)) {
        console.log(`[Cookie Rejector] Clicking expand: "${text}"`);
        button.click();
        return true;
      }
    }
  }
  return false;
}

// Turn off all non-essential cookie toggles
function turnOffNonEssentialCookies() {
  let togglesFound = 0;
  
  // Find all toggles/checkboxes
  const toggles = document.querySelectorAll(
    'input[type="checkbox"], input[type="radio"], [role="switch"]'
  );
  
  for (let toggle of toggles) {
    // Check if toggle is visible and in dialog context
    if (toggle.offsetParent === null) continue;
    if (!isLikelyDialogContext(toggle)) continue;
    
    // Get label/description text
    const label = getToggleLabel(toggle);
    const isNonEssential = NON_ESSENTIAL_KEYWORDS.some(keyword => 
      label.toLowerCase().includes(keyword)
    );
    
    if (isNonEssential) {
      // Turn off non-essential cookies
      if (toggle.type === 'checkbox' && toggle.checked) {
        console.log(`[Cookie Rejector] Disabling: "${label}"`);
        toggle.click();
        togglesFound++;
      } else if (toggle.getAttribute('role') === 'switch' && toggle.getAttribute('aria-checked') === 'true') {
        console.log(`[Cookie Rejector] Disabling switch: "${label}"`);
        toggle.click();
        togglesFound++;
      }
    }
  }
  
  return togglesFound > 0;
}

// Get label text associated with a toggle
function getToggleLabel(toggle) {
  // Check for associated label
  const labelId = toggle.getAttribute('aria-labelledby');
  if (labelId) {
    const label = document.getElementById(labelId);
    if (label) return label.textContent;
  }
  
  // Check for parent label
  let parent = toggle.parentElement;
  for (let i = 0; i < 5; i++) {
    if (!parent) break;
    if (parent.tagName === 'LABEL') {
      return parent.textContent;
    }
    parent = parent.parentElement;
  }
  
  // Check for nearby text nodes
  const wrapper = toggle.closest('div');
  if (wrapper) {
    return wrapper.textContent;
  }
  
  return toggle.getAttribute('aria-label') || '';
}

// Find and click confirm/save button
function findAndClickConfirmButton() {
  const allButtons = document.querySelectorAll('button, a[role="button"]');
  
  // Prioritize "confirm" over other similar buttons
  for (let button of allButtons) {
    const text = button.textContent.toLowerCase().trim();
    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
    
    if (text.includes('confirm') || ariaLabel.includes('confirm')) {
      if (button.offsetParent !== null && isLikelyDialogContext(button)) {
        console.log(`[Cookie Rejector] Clicking confirm: "${text}"`);
        button.click();
        return true;
      }
    }
  }
  
  // Fall back to other confirmation keywords
  for (let button of allButtons) {
    const text = button.textContent.toLowerCase().trim();
    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
    
    if (CONFIRM_KEYWORDS.some(keyword => 
      text.includes(keyword) || ariaLabel.includes(keyword)
    )) {
      if (button.offsetParent !== null && isLikelyDialogContext(button)) {
        console.log(`[Cookie Rejector] Clicking confirm: "${text}"`);
        button.click();
        return true;
      }
    }
  }
  
  return false;
}

// Check if button is in a dialog-like context
function isLikelyDialogContext(element) {
  let parent = element.parentElement;
  for (let i = 0; i < 15; i++) {
    if (!parent) break;
    
    const text = parent.textContent.toLowerCase();
    const classList = parent.className.toLowerCase();
    const id = (parent.id || '').toLowerCase();
    
    if (DIALOG_KEYWORDS.some(keyword => 
      text.includes(keyword) || classList.includes(keyword) || id.includes(keyword)
    )) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

// Clear localStorage and sessionStorage of non-essential items
function clearStorageData() {
  try {
    // Clear localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!isEssentialStorageKey(key)) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear sessionStorage
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
  const lowerKey = key.toLowerCase();
  return [
    'auth',
    'session',
    'user',
    'login',
    'preference'
  ].some(keyword => lowerKey.includes(keyword));
}

// Main execution with multi-screen handling
async function handleCookieConsent() {
  if (!(await isExtensionEnabled())) return;
  
  // Step 1: Try to find and click reject button on first screen
  if (findAndClickRejectButton()) {
    clearStorageData();
    return;
  }
  
  // Step 2: If no reject button, try to expand options
  if (findAndClickExpandButton()) {
    console.log('[Cookie Rejector] Expanded options, waiting for second screen...');
    await sleep(800);
  }
  
  // Step 3: Turn off non-essential cookie toggles on detailed screen
  if (turnOffNonEssentialCookies()) {
    console.log('[Cookie Rejector] Disabled non-essential cookies');
    await sleep(500);
  }
  
  // Step 4: Click confirm/save button
  if (findAndClickConfirmButton()) {
    clearStorageData();
    return;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleCookieConsent);
} else {
  handleCookieConsent();
}

// Also run periodically to catch dynamically added dialogs
setInterval(handleCookieConsent, 2500);
