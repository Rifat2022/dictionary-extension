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
      <p><span>Pronunciation:</span> ${
        entry.pron.filter((p) => p).join(" / ") || "—"
      }</p>
      <p><span>Bangla Synonyms:</span> ${entry.bn_syns.join(", ") || "—"}</p>
      <p><span>English Synonyms:</span> ${entry.en_syns.join(", ") || "—"}</p>
      <p><span>Examples:</span></p>
      <ul>
        ${
          entry.sents.length
            ? entry.sents.map((s) => `<li>${s}</li>`).join("")
            : "<li>None available</li>"
        }
      </ul>
    `;
};

const displayError = (message) => {
  document.getElementById(
    "result"
  ).innerHTML = `<p class="error">${message}</p>`;
};

const displayLoading = () => {
  document.getElementById(
    "result"
  ).innerHTML = `<p class="placeholder">Loading dictionary...</p>`;
};

// Fetch dictionary data from background script
const loadDictionary = () => {
  displayLoading();
  chrome.runtime.sendMessage({ action: "getDictionaryData" }, (response) => {
    if (chrome.runtime.lastError || !response || response.length === 0) {
      displayError("Failed to load dictionary. Please try again.");
      return;
    }

    // Setup search input with debounced handler
    const wordInput = document.getElementById("word");
    const searchWord = debounce((word) => {
      if (!word) {
        document.getElementById(
          "result"
        ).innerHTML = `<p class="placeholder">Type a word to see its Bangla translation.</p>`;
        return;
      }
      const entry = response.find(
        (e) => e.en.toLowerCase() === word.toLowerCase()
      );
      displayResult(entry, word);
    }, 300);

    wordInput.addEventListener("input", (e) => {
      searchWord(e.target.value.trim());
    });

    // Focus input on load
    wordInput.focus();
  });
};

// Initialize
loadDictionary();
