let dictionaryData = [];

// Fetch dictionary from storage
function fetchDictionaryData() {
  chrome.storage.local.get("dictionaryData", ({ dictionaryData: data }) => {
    if (data && data.length > 0) {
      dictionaryData = data;
      buildDictMap();
      setupEventListeners();
    } else {
      // Retry after 500ms if not loaded
      setTimeout(fetchDictionaryData, 500);
    }
  });
}

// Map for fast lookup of main words only
let dictMap = new Map();
function buildDictMap() {
  dictMap.clear();
  // Only map main English words for fast O(1) lookup
  dictionaryData.forEach(e => {
    dictMap.set(e.en.toLowerCase(), e);
  });
}

// Function to search with priority: main words first, then synonyms
function findDictionaryEntry(word) {
  const lowerWord = word.toLowerCase();

  // 1. First, try to find an exact match in main English words (e.en)
  const mainEntry = dictMap.get(lowerWord);
  if (mainEntry) {
    return mainEntry;
  }

  // 2. If not found in main words, search through synonyms
  for (const dictEntry of dictionaryData) {
    // Check if the word exists in the en_syns array (case-insensitive)
    if (dictEntry.en_syns.some(syn => syn.toLowerCase() === lowerWord)) {
      return dictEntry;
    }
  }

  // 3. Return null if not found anywhere
  return null;
}

function setupEventListeners() {
  document.addEventListener("dblclick", () => {
    const selected = window.getSelection().toString().trim();
    if (!selected) return;

    const entry = findDictionaryEntry(selected);
    if (!entry) return;

    showPopup(selected, entry);
  });

  document.addEventListener("click", (e) => {
    const popup = document.getElementById("dictionary-popup");
    if (popup && !popup.contains(e.target)) {
      removePopup();
    }
  });
}

function showPopup(word, entry) {
  removePopup();

  const popup = document.createElement("div");
  popup.id = "dictionary-popup";
  popup.className = "dictionary-style";

  popup.innerHTML = `
    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px;">
      <strong style="font-size: 1.2em;">${word}</strong> <strong>→</strong>
      <span style="font-size: 1.1em; color: #000000ff; font-weight:700">${entry.bn}</span>
    </div>
    <hr>
    <div style="margin-bottom: 6px;">
      <em>Pron:</em> ${entry.pron.filter(p => p).join(" / ") || "—"}
    </div>
    <div style="margin-bottom: 6px;">
      <em>BN Syns:</em> ${entry.bn_syns.join(", ") || "—"}
    </div>
    <div style="margin-bottom: 6px;">
      <em>EN Syns:</em> ${entry.en_syns.join(", ") || "—"}
    </div>
    <div style="margin-bottom: 5px;">
      <em>Examples:</em>
    </div>
    <ul style="padding-left: 15px; margin: 0;">${entry.sents.map(s => `<li>${s}</li>`).join("")}</ul>
  `;

  document.body.appendChild(popup);

  // Add ▼ arrow for expand BEFORE setting height/overflow
  // const arrow = document.createElement("div");
  // arrow.textContent = "▼";
  // arrow.style.textAlign = "center";
  // arrow.style.cursor = "pointer";
  // arrow.style.padding = "5px 0";
  // arrow.onclick = (e) => {
  //   e.stopPropagation(); // prevent closing popup
  //   popup.style.height = "auto";
  //   popup.style.overflow = "visible";
  //   arrow.remove();
  // };
  // popup.appendChild(arrow);

  const range = window.getSelection().getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const margin = 10;
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;

  const popupWidth = 320;
  const popupHeight = 200; // Total height including arrow

  // Horizontal placement (prefer right, fallback left)
  let left;
  if (rect.right + margin + popupWidth <= winWidth) {
    left = rect.right + window.scrollX + margin;
  } else if (rect.left - margin - popupWidth >= 0) {
    left = rect.left + window.scrollX - popupWidth - margin;
  } else {
    left = Math.max(window.scrollX + margin, winWidth - popupWidth - margin);
  }

  // Vertical placement (center align with word, 160 above + 160 below)
  let top = rect.top + window.scrollY + rect.height / 2 - popupHeight / 2;

  // Ensure popup stays in viewport
  if (top < margin) top = margin;
  if (top + popupHeight > winHeight + window.scrollY - margin) {
    top = winHeight + window.scrollY - popupHeight - margin;
  }

  popup.style.position = "absolute";
  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
  popup.style.width = popupWidth + "px";
  popup.style.height = popupHeight + "px";
  popup.style.overflow = "auto";

  // Prevent popup from closing when clicked
  popup.addEventListener("click", (e) => e.stopPropagation());
}
function removePopup() {
  const old = document.getElementById("dictionary-popup");
  if (old) old.remove();
}

// Start
fetchDictionaryData();