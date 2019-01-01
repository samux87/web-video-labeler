// Attach runtime ID to DOM to allow message passing
document.body.dataset.__chrome_runtime_id = chrome.runtime.id;

// Inject compiled script and style into the page context
const SCRIPT_URL = chrome.extension.getURL('bundle.js');
const script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', SCRIPT_URL);
document.body.appendChild(script);

const STYLE_URL = chrome.extension.getURL('bundle.css');
const style = document.createElement('link');
style.setAttribute('rel', 'stylesheet');
style.setAttribute('href', STYLE_URL);
document.head && document.head.appendChild(style);
