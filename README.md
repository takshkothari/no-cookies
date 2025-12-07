# No Cookies

A privacy-focused Chrome extension that automatically rejects cookie consent dialogs and removes non-essential cookies from websites.

## Features

✅ **Automatic Cookie Rejection**
- Detects and clicks reject/decline buttons on cookie consent dialogs
- Handles single and multi-screen consent dialogs
- Supports various button labels: "Reject", "Decline", "Only Necessary", etc.

✅ **Multi-Screen Support**
- Expands detailed preference screens when simple reject option unavailable
- Automatically disables non-essential cookie toggles (marketing, analytics, tracking)
- Confirms and saves preferences automatically

✅ **Cookie Management**
- Monitors and removes non-essential cookies in real-time
- Preserves essential cookies (authentication, session, security)
- Clears tracking data from localStorage and sessionStorage

✅ **Easy Control**
- Toggle extension on/off via popup menu
- No configuration needed - works out of the box
- Minimal performance impact

## Installation

### From Chrome Web Store (when published)
1. Visit the Chrome Web Store page
2. Click "Add to Chrome"
3. Confirm the permissions

### Manual Installation (Development)
1. Clone this repository or download the files
2. Ensure you have the `images/` directory with icon files:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
3. Open `chrome://extensions/` in your browser
4. Enable "Developer mode" (top right)
5. Click "Load unpacked"
6. Select the `no cookies` folder
7. The extension is now installed!

## Project Structure

```
no cookies/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (cookie monitoring)
├── content.js             # Content script (dialog detection & interaction)
├── popup.html             # Extension popup UI
├── popup.js               # Popup functionality
├── styles.css             # Popup styling
├── images/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## How It Works

### 1. Content Script (`content.js`)
- Runs on every page load
- Scans for cookie consent dialogs using keyword matching
- Attempts to find and click reject/decline buttons
- If no reject option exists:
  - Clicks "More Options" or "Details" button
  - Waits for detailed preferences screen
  - Finds and disables all non-essential cookie toggles
  - Clicks confirm/save button

### 2. Background Service Worker (`background.js`)
- Monitors all cookie changes across the browser
- Identifies essential vs. non-essential cookies
- Automatically removes non-essential cookies in real-time
- Respects user preference (enabled/disabled state)

### 3. Popup UI (`popup.html`, `popup.js`, `styles.css`)
- Displays extension status
- Provides toggle to enable/disable functionality
- Shows active/inactive state with visual feedback
- Lists what the extension does

## Cookie Classification

### Essential Cookies (Preserved)
- Session management
- Authentication tokens
- CSRF/XSRF tokens
- User preferences
- Security cookies

### Non-Essential Cookies (Removed)
- Marketing & advertising
- Analytics & tracking
- Social media tracking
- Performance monitoring
- User profiling

## Supported Dialog Types

The extension recognizes and handles various cookie consent implementations:

- ✅ Simple reject/decline buttons
- ✅ Multi-step preference screens
- ✅ Toggle switches for cookie categories
- ✅ "Only Necessary" quick options
- ✅ Save/Confirm buttons on preference pages

## Permissions Explained

```json
{
  "cookies": "Required to monitor and remove cookies",
  "storage": "Stores extension enabled/disabled state",
  "scripting": "Injects content scripts to detect dialogs",
  "host_permissions": "<all_urls> - Needed to work on all websites"
}
```

## Troubleshooting

### Extension Not Rejecting Cookies
1. **Check if enabled**: Click extension icon and verify toggle is ON
2. **Check console**: Right-click page → Inspect → Console tab
3. **Look for errors**: Report if you see "[No Cookies]" messages

### Dialog Not Being Detected
- Some custom cookie implementations may use non-standard HTML
- Try enabling DevTools and checking the dialog structure
- Report the domain on GitHub Issues

### Extension Affecting Website Functionality
- Disable extension for that specific site via Chrome extensions menu
- Or toggle off temporarily using extension popup

## Privacy & Security

- ✅ No data collection - all processing happens locally
- ✅ No external requests - works completely offline
- ✅ No tracking - extension doesn't track your activity
- ✅ Open source - code is transparent and reviewable
- ✅ Minimal permissions - only what's necessary

## Browser Compatibility

- ✅ Chrome/Chromium 90+
- ✅ Edge (Chromium-based)
- ✅ Brave
- ✅ Opera
- ✅ Vivaldi

## Development

### Running Locally
1. Make changes to `.js` or `.css` files
2. Go to `chrome://extensions/`
3. Find "No Cookies"
4. Click the refresh icon
5. Changes are applied immediately

### Debugging
Enable debug logging by adding to `content.js`:
```javascript
const DEBUG = true;
// Then use: if (DEBUG) console.log('message');
```

### Building for Distribution
1. Zip the entire `No Cookies` folder
2. Upload to Chrome Web Store Developer Console
3. Follow Google's extension review process

## Known Limitations

- Does not handle cookies set by third-party scripts after page load (covered by background service worker)
- Some websites may use JavaScript-only cookie management
- Custom/obscured dialogs may not be detected
- Does not remove cookies already set before extension installation
