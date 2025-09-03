let dictionaryData = [];

function loadDictionaryData() {
  fetch(chrome.runtime.getURL("BengaliDictionary.json"))
    .then(response => response.json())
    .then(data => {
      dictionaryData = data;
    })
    .catch(err => console.error('Failed to load BengaliDictionary.json', err));
}

// Load dictionary data when the background script starts
loadDictionaryData();

// Optional: Reload data on install/update if needed
chrome.runtime.onInstalled.addListener(loadDictionaryData);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDictionaryData') {
    // Send the current dictionaryData (may be empty if still loading)
    sendResponse(dictionaryData);
    // Keep the message channel open for async response
    return true;
  }
});
