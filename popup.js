const toggleCheckbox = document.getElementById('toggleExtension');
const statusDiv = document.getElementById('status');
const clearCacheBtn = document.getElementById('clearCacheBtn');

// Load saved state
chrome.storage.local.get('extensionEnabled', (result) => {
  const isEnabled = result.extensionEnabled !== false;
  toggleCheckbox.checked = isEnabled;
  updateStatus(isEnabled);
});

// Handle toggle changes
toggleCheckbox.addEventListener('change', (e) => {
  const isEnabled = e.target.checked;
  chrome.storage.local.set({ extensionEnabled: isEnabled });
  updateStatus(isEnabled);
});

// Handle clear cache button
if (clearCacheBtn) {
  clearCacheBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'clearCache' }, (response) => {
      if (response.success) {
        showNotification('Cache cleared successfully');
      }
    });
  });
}

function updateStatus(isEnabled) {
  if (isEnabled) {
    statusDiv.innerHTML = '<p class="active">✓ Active - Rejecting cookies automatically</p>';
  } else {
    statusDiv.innerHTML = '<p class="inactive">✗ Inactive - Cookie dialogs will not be rejected</p>';
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
}
