const toggleCheckbox = document.getElementById('toggleExtension');
const statusDiv = document.getElementById('status');

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

function updateStatus(isEnabled) {
  if (isEnabled) {
    statusDiv.innerHTML = '<p class="active">✓ Active - Rejecting cookies automatically</p>';
  } else {
    statusDiv.innerHTML = '<p class="inactive">✗ Inactive - Cookie dialogs will not be rejected</p>';
  }
}
