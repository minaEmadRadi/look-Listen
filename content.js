window.onload = function() {
    var pageContent = document.body.innerText;
    var pageUrl = window.location.href;
    // console.log('Page URL:', pageUrl);
    // console.log('Page Content:', pageContent);
    chrome.runtime.sendMessage({ pageData: "Data from page console" });
    chrome.runtime.sendMessage({ pageContent: pageContent, pageUrl: pageUrl });
    const eventData = { key: "value" };
    const customEvent = new CustomEvent('customKeyEventFromPage', { detail: eventData });
    document.dispatchEvent(customEvent);


    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log("Message received in content script: ", request);
            showToast(request.message);
            sendResponse({ farewell: "goodbye from content" });
        }
    );


    
};
var  pressedKeys = [];


document.addEventListener('customKeyEventFromPage', function(event) {
    const eventData = event.detail;
    chrome.runtime.sendMessage({ keysData: eventData });
});

function dispatchCustomEvent(keyValue) {
    const customEvent = new CustomEvent('customKeyEventFromPage', { detail: { key: keyValue } });
    document.dispatchEvent(customEvent);
    pressedKeys = [];
}

document.addEventListener('keydown', function(event) {
    const key = event.key; 
    pressedKeys.push(key);
    sendPressedKeys();

});

function sendPressedKeys() {
    if (pressedKeys.includes('Enter') ) {
        pressedKeys = pressedKeys.filter(key => key !== 'Enter');
        const keyValueString = pressedKeys.join('');
        dispatchCustomEvent(keyValueString);
    }else if (pressedKeys.includes('MouseClick')) {
        pressedKeys = pressedKeys.filter(key => key !== 'MouseClick');
        const keyValueString = pressedKeys.join('');
        dispatchCustomEvent(keyValueString);
    }
}
document.addEventListener('click', function(event) {
    pressedKeys.push('MouseClick');
    sendPressedKeys();
});

const toastCss = `
.toast {
    visibility: hidden; /* Hidden by default. Visible on click */
    min-width: 250px; /* Set a default minimum width */
    margin-left: -125px; /* Divide value of min-width by 2 */
    background-color: #333; /* Black background color */
    color: #fff; /* White text color */
    text-align: center; /* Centered text */
    border-radius: 2px; /* Rounded borders */
    padding: 16px; /* Padding */
    position: fixed; /* Sit on top of the screen */
    z-index: 1; /* Add a z-index if needed */
    left: 50%; /* Center the snackbar */
    bottom: 30px; /* 30px from the bottom */
}

/* Show the snackbar when clicking on a button (class added with JavaScript) */
.toast.show {
    visibility: visible; /* Show the snackbar */
    /* Add animation: Take 0.5 seconds to fade in and out the snackbar. 
    However, delay the fade out process for 2.5 seconds */
    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
    animation: fadein 0.5s, fadeout 0.5s 2.5s;
}

@-webkit-keyframes fadein {
    from {bottom: 0; opacity: 0;} 
    to {bottom: 30px; opacity: 1;}
}

@keyframes fadein {
    from {bottom: 0; opacity: 0;}
    to {bottom: 30px; opacity: 1;}
}

@-webkit-keyframes fadeout {
    from {bottom: 30px; opacity: 1;} 
    to {bottom: 0; opacity: 0;}
}

@keyframes fadeout {
    from {bottom: 30px; opacity: 1;}
    to {bottom: 0; opacity: 0;}
}`;
function injectToast() {
    const styleEl = document.createElement('style');
    styleEl.textContent = toastCss;
    document.head.appendChild(styleEl);

    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
}
function showToast(message) {
    const toastEl = document.querySelector('.toast');
    toastEl.textContent = message;
    toastEl.className = 'toast show';

    // After 3 seconds, remove the show class from DIV
    setTimeout(() => { toastEl.className = toastEl.className.replace('show', ''); }, 3000);
}
injectToast();
