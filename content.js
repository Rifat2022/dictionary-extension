
let dictionaryData = [];

function fetchDictionaryData() {
  chrome.runtime.sendMessage({ action: "getDictionaryData" }, (response) => {
    if (response && response.length > 0) {
      dictionaryData = response;
      setupEventListeners();
    } else {
      // Retry after a short delay if response is empty
      setTimeout(fetchDictionaryData, 500);
    }
  });
}

function setupEventListeners() {
  document.addEventListener("dblclick", () => {
    const selected = window.getSelection().toString().trim().toLowerCase();
    if (!selected) return;

    const entry = dictionaryData.find(e => e.en.toLowerCase() === selected);
    if (!entry) return;

    showPopup(selected, entry);
  });
}

function showPopup(word, entry) {
  removePopup();

  const popup = document.createElement("div");
  popup.id = "dictionary-popup";
  popup.className = "dictionary-style";

  popup.innerHTML = `
    <strong>${word}</strong><br>
    <em>Bangla:</em> ${entry.bn}<br>
    <em>Pron:</em> ${entry.pron.filter(p => p).join(" / ")}<br>
    <em>BN Syns:</em> ${entry.bn_syns.join(", ") || "—"}<br>
    <em>EN Syns:</em> ${entry.en_syns.join(", ") || "—"}<br>
    <em>Examples:</em><br><ul style="padding-left: 15px;">${entry.sents.map(s => `<li>${s}</li>`).join("")}</ul>
  `;

  document.body.appendChild(popup);

  const range = window.getSelection().getRangeAt(0);
  const rect = range.getBoundingClientRect();
  popup.style.top = `${rect.top + window.scrollY - 10}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
}

function removePopup() {
  const old = document.getElementById("dictionary-popup");
  if (old) old.remove();
}

document.addEventListener("click", removePopup);

// Start fetching dictionary data
fetchDictionaryData();
