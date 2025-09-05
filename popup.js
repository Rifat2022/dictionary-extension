const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const displayResult = (entry, word) => {
  const resultDiv = document.getElementById("result");
  if (!entry) {
    resultDiv.innerHTML = `<p class="error">No translation found for "${word}".</p>`;
    return;
  }
  resultDiv.innerHTML = `
    <p><strong>${word}</strong></p>
    <p><span>Bangla:</span> ${entry.bn}</p>
    <p><span>Pronunciation:</span> ${entry.pron.filter(p => p).join(" / ") || "—"}</p>
    <p><span>Bangla Synonyms:</span> ${entry.bn_syns.join(", ") || "—"}</p>
    <p><span>English Synonyms:</span> ${entry.en_syns.join(", ") || "—"}</p>
    <p><span>Examples:</span></p>
    <ul>${entry.sents.length ? entry.sents.map(s => `<li>${s}</li>`).join("") : "<li>None available</li>"}</ul>
  `;
};

const displayError = (message) => {
  document.getElementById("result").innerHTML = `<p class="error">${message}</p>`;
};

const displayLoading = () => {
  document.getElementById("result").innerHTML = `<p class="placeholder">Loading dictionary...</p>`;
};
const displayDefaultState = () => {
  document.getElementById("result").innerHTML = `<p class="placeholder">Type a word to see its Bangla translation.</p>`;
}

const loadDictionary = () => {
  displayLoading();
  chrome.storage.local.get("dictionaryData", ({ dictionaryData }) => {
    displayDefaultState();
    if (!dictionaryData || dictionaryData.length === 0) {
      displayError("Failed to load dictionary. Please try again.");
      return;
    }

    const dictMap = new Map();
    // First, map only the main English words
    dictionaryData.forEach(e => {
      dictMap.set(e.en.toLowerCase(), e);
    });

    const wordInput = document.getElementById("word");
    const searchWord = debounce((word) => {
      if (!word) {
        document.getElementById("result").innerHTML = `<p class="placeholder">Type a word to see its Bangla translation.</p>`;
        return;
      }

      const lowerWord = word.toLowerCase();
      let entry = null;

      // 1. First, try to find an exact match in main English words (e.en)
      entry = dictMap.get(lowerWord);

      // 2. If not found in main words, search through synonyms
      if (!entry) {
        for (const dictEntry of dictionaryData) {
          // Check if the word exists in the en_syns array (case-insensitive)
          if (dictEntry.en_syns.some(syn => syn.toLowerCase() === lowerWord)) {
            entry = dictEntry;
            break; // Exit loop once found
          }
        }
      }

      // 3. Display result (entry will be null if not found anywhere)
      displayResult(entry, word);
    }, 300);

    wordInput.addEventListener("input", (e) => {
      searchWord(e.target.value.trim());
    });

    wordInput.focus();
  });
};

loadDictionary();
