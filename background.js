let dictionaryData = [];

// Load dictionary and store in chrome.storage.local
function loadDictionaryData() {
  fetch(chrome.runtime.getURL("BengaliDictionary.json"))
    .then(res => res.json())
    .then(data => {
      dictionaryData = data;
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ dictionaryData });

      }
    })
    .catch(err =>
      console.error('Failed to load BengaliDictionary.json', err

      ));
}

// Load on start and on install/update
loadDictionaryData();
chrome.runtime.onInstalled.addListener(loadDictionaryData);

// Provide dictionary to popup/content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDictionaryData') {
    // Send current dictionaryData (may still be empty)
    sendResponse(dictionaryData);
    return true; // keep channel open for async if needed
  }
});
