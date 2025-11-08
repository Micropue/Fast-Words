// Global variables
let words = {}; // Will store words from JSON
let wordKeys = []; // Array of English words
let currentWordIndex = 0;
let currentMode = 'enToZh'; // 'enToZh' or 'zhToEn'
let correctAnswer = '';
let selectedWord = null; // Track selected word from list
let letterInputs = []; // Array of letter input elements
let answeredWords = {}; // Track answered words: {index: 'correct'/'incorrect'}
let currentFilter = 'all'; // Current filter: 'all', 'correct', or 'incorrect'
let searchQuery = ''; // Current search query

// DOM elements
const fileUploadSection = document.getElementById('fileUploadSection');
const mainApp = document.getElementById('mainApp');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const dropZone = document.getElementById('dropZone');
const fileInfo = document.getElementById('fileInfo');
const enToZhBtn = document.getElementById('enToZhBtn');
const zhToEnBtn = document.getElementById('zhToEnBtn');
const enToZhSection = document.getElementById('enToZhSection');
const zhToEnSection = document.getElementById('zhToEnSection');
const enWordElement = document.getElementById('enWord');
const zhWordElement = document.getElementById('zhWord');
const optionsContainer = document.getElementById('optionsContainer');
const letterInputsContainer = document.getElementById('letterInputsContainer');
const inputFeedback = document.getElementById('inputFeedback');
const progressText = document.getElementById('progressText');
const wordListContainer = document.getElementById('wordListContainer');
const correctPopup = document.getElementById('correctPopup');
const incorrectPopup = document.getElementById('incorrectPopup');
const searchInput = document.getElementById('searchInput');
const showAllBtn = document.getElementById('showAllBtn');
const showCorrectBtn = document.getElementById('showCorrectBtn');
const showIncorrectBtn = document.getElementById('showIncorrectBtn');
const showExplanationBtn = document.getElementById('showExplanationBtn');
const showExplanationBtnZh = document.getElementById('showExplanationBtnZh');
const explanationModal = document.getElementById('explanationModal');
const closeExplanationModal = document.getElementById('closeExplanationModal');
const explanationEnglishWord = document.getElementById('explanationEnglishWord');
const explanationChineseWord = document.getElementById('explanationChineseWord');
const videoCanvas = document.getElementById("canvas")
const example = document.querySelector(".example")
example.value = `{
    "word1": "单词释义",
    "word2": "单词释义",
    "word3": "单词释义",
    "word4": "单词释义"
}`
videoCanvas.width = window.innerWidth
videoCanvas.height = window.innerHeight
async function getUserVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        })
        const video = document.createElement("video")
        video.srcObject = stream
        video.onloadedmetadata = () => video.play()
        const ctx = videoCanvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height
        function updateCanvas(now, metadata) {
            ctx.drawImage(video, 0, 0, width, height)
            video.requestVideoFrameCallback(updateCanvas)
        }
        video.requestVideoFrameCallback(updateCanvas)
    } catch { }
}
// function generateWhiteBg() {
//     document.body.style.backgroundColor = 'white'
// }
// getUserVideo()
// generateWhiteBg()
// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    // Set up file upload event listeners
    selectFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // Set up drag and drop event listeners
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    // Set up app event listeners
    enToZhBtn.addEventListener('click', () => switchMode('enToZh'));
    zhToEnBtn.addEventListener('click', () => switchMode('zhToEn'));

    // Set up filter event listeners
    if (searchInput) searchInput.addEventListener('input', filterWordList);
    if (showAllBtn) showAllBtn.addEventListener('click', () => setFilter('all'));
    if (showCorrectBtn) showCorrectBtn.addEventListener('click', () => setFilter('correct'));
    if (showIncorrectBtn) showIncorrectBtn.addEventListener('click', () => setFilter('incorrect'));

    // Set up explanation event listeners
    if (showExplanationBtn) showExplanationBtn.addEventListener('click', showWordExplanation);
    if (showExplanationBtnZh) showExplanationBtnZh.addEventListener('click', showWordExplanation);
    if (closeExplanationModal) closeExplanationModal.addEventListener('click', hideWordExplanation);

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (explanationModal && event.target === explanationModal) {
            hideWordExplanation();
        }
    });
});

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Handle drag over event
function handleDragOver(event) {
    event.preventDefault();
    dropZone.classList.add('dragover');
}

// Handle drag leave event
function handleDragLeave(event) {
    event.preventDefault();
    dropZone.classList.remove('dragover');
}

// Handle drop event
function handleDrop(event) {
    event.preventDefault();
    dropZone.classList.remove('dragover');

    const file = event.dataTransfer.files[0];
    if (file) {
        processFile(file);
    }
}

// Process the selected file
function processFile(file) {
    // Check if file is JSON
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('请选择一个 JSON 文件');
        return;
    }

    // Display file info
    fileInfo.textContent = `已选择文件: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;

    // Read file content
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            console.log('File content:', e.target.result);
            const jsonData = JSON.parse(e.target.result);
            console.log('Parsed JSON data:', jsonData);
            loadWordsFromData(jsonData);
        } catch (error) {
            console.error('解析 JSON 文件失败:', error);
            alert('解析 JSON 文件失败，请检查文件格式');
        }
    };
    reader.onerror = function (e) {
        console.error('读取文件失败:', e);
        alert('读取文件失败');
    };
    reader.readAsText(file);
}

// Load words from JSON data
function loadWordsFromData(data) {
    // Validate data structure
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        alert('JSON 文件格式不正确，请确保文件包含一个对象');
        return;
    }

    // Check if object has at least one key-value pair
    const keys = Object.keys(data);
    if (keys.length === 0) {
        alert('词汇表为空，请检查 JSON 文件内容');
        return;
    }

    // Check if all values are strings
    for (const key of keys) {
        if (typeof data[key] !== 'string') {
            alert(`词汇 "${key}" 的翻译不是字符串，请检查 JSON 文件格式`);
            return;
        }
    }

    words = data;
    wordKeys = keys;

    // Hide file upload section and show main app
    fileUploadSection.classList.add('hidden');
    mainApp.classList.remove('hidden');

    // Initialize the app
    generateWordList();
    updateProgress();
    showQuestion();
}


// Set the current filter and update the UI
function setFilter(filter) {
    currentFilter = filter;

    // Update button states
    showAllBtn.classList.toggle('active', filter === 'all');
    showCorrectBtn.classList.toggle('active', filter === 'correct');
    showIncorrectBtn.classList.toggle('active', filter === 'incorrect');

    // Regenerate word list with new filter
    generateWordList();
}

// Filter word list based on search input
function filterWordList() {
    searchQuery = searchInput.value.toLowerCase();
    generateWordList();
}

// Generate word list
function generateWordList() {
    wordListContainer.innerHTML = '';

    wordKeys.forEach((englishWord, index) => {
        // Apply filter based on answer correctness
        if (currentFilter === 'correct' && answeredWords[index] !== 'correct') {
            return; // Skip words that are not marked as correct
        }

        if (currentFilter === 'incorrect' && answeredWords[index] !== 'incorrect') {
            return; // Skip words that are not marked as incorrect
        }

        // Apply search filter
        const chineseWord = words[englishWord];
        const searchText = currentMode === 'zhToEn' ? chineseWord : englishWord;
        if (searchQuery && !searchText.toLowerCase().includes(searchQuery)) {
            return; // Skip words that don't match the search query
        }

        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';

        // Show only Chinese translations in zhToEn mode, and only English words in enToZh mode
        if (currentMode === 'zhToEn') {
            wordItem.textContent = chineseWord;  // Chinese translation
        } else {
            wordItem.textContent = englishWord;  // English word
        }

        // Add styling based on answer correctness
        if (answeredWords[index] === 'correct') {
            wordItem.classList.add('correct-answer');
        } else if (answeredWords[index] === 'incorrect') {
            wordItem.classList.add('incorrect-answer');
        }

        // Highlight the currently selected word (chosen from list or randomly selected)
        if (index === selectedWord || index === currentWordIndex) {
            wordItem.classList.add('selected');
        }

        wordItem.addEventListener('click', () => selectWordFromList(index, wordItem));
        wordListContainer.appendChild(wordItem);
    });
}

// Select a word from the list
function selectWordFromList(index, element) {
    // Remove selected and current-word classes from all items
    document.querySelectorAll('.word-item').forEach(item => {
        item.classList.remove('selected', 'current-word');
    });

    // Add selected class to clicked item
    element.classList.add('selected');

    // Set selected word
    selectedWord = index;

    // Show question for selected word
    showSelectedWordQuestion();
}

// Switch between modes
function switchMode(mode) {
    currentMode = mode;

    // Update button states
    enToZhBtn.classList.toggle('active', mode === 'enToZh');
    zhToEnBtn.classList.toggle('active', mode === 'zhToEn');

    // Show/hide sections
    enToZhSection.classList.toggle('hidden', mode !== 'enToZh');
    zhToEnSection.classList.toggle('hidden', mode !== 'zhToEn');

    // Reset search when switching modes
    searchInput.value = '';
    searchQuery = '';

    // Regenerate word list to show appropriate content
    generateWordList();

    // Show new question
    if (selectedWord !== null) {
        showSelectedWordQuestion();
    } else {
        showQuestion();
    }
}

// Display a question based on current mode (random word)
function showQuestion() {
    if (wordKeys.length === 0) return;

    // Get a random word
    const randomIndex = Math.floor(Math.random() * wordKeys.length);
    currentWordIndex = randomIndex;
    const englishWord = wordKeys[currentWordIndex];
    const chineseWord = words[englishWord];
    correctAnswer = englishWord; // For zhToEn mode

    if (currentMode === 'enToZh') {
        // English to Chinese mode
        enWordElement.textContent = englishWord;
        generateOptions(chineseWord);
    } else {
        // Chinese to English mode
        zhWordElement.textContent = chineseWord;
        createLetterInputs(englishWord);
        inputFeedback.innerHTML = '';
    }

    // Update word list to highlight current word
    generateWordList();
    updateProgress();
}

// Display a question for the selected word
function showSelectedWordQuestion() {
    if (wordKeys.length === 0 || selectedWord === null) return;

    const englishWord = wordKeys[selectedWord];
    const chineseWord = words[englishWord];
    correctAnswer = englishWord; // For zhToEn mode

    if (currentMode === 'enToZh') {
        // English to Chinese mode
        enWordElement.textContent = englishWord;
        generateOptions(chineseWord);
    } else {
        // Chinese to English mode
        zhWordElement.textContent = chineseWord;
        createLetterInputs(englishWord);
        inputFeedback.innerHTML = '';
    }

    // Update word list to highlight selected word
    generateWordList();
    updateProgress();
}

// Create letter input boxes for the Chinese to English mode
function createLetterInputs(word) {
    // Clear previous inputs
    letterInputsContainer.innerHTML = '';
    letterInputs = [];

    // Create an input for each letter
    for (let i = 0; i < word.length; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'letter-input';
        input.maxLength = 1;
        input.autocomplete = 'off';
        input.spellcheck = false;

        // Add event listeners
        input.addEventListener('input', function () {
            handleLetterInput(this, i);
        });

        input.addEventListener('keydown', function (e) {
            handleKeyDown(e, i);
        });

        letterInputsContainer.appendChild(input);
        letterInputs.push(input);
    }

    // Focus on the first input
    if (letterInputs.length > 0) {
        letterInputs[0].focus();
    }
}

// Handle input for each letter box
function handleLetterInput(inputElement, index) {
    const value = inputElement.value;

    // If there's a value and it's a single character, move to next input
    if (value.length === 1) {
        // Move to next input if it exists
        if (index < letterInputs.length - 1) {
            letterInputs[index + 1].focus();
        }

        // Check if all inputs are filled
        checkAnswer();
    }
}

// Handle keydown events for navigation
function handleKeyDown(e, index) {
    // Handle backspace
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
        letterInputs[index - 1].focus();
    }

    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
        letterInputs[index - 1].focus();
    }

    if (e.key === 'ArrowRight' && index < letterInputs.length - 1) {
        letterInputs[index + 1].focus();
    }
}

// Check if the answer is correct
function checkAnswer() {
    // Get the current input values
    let inputValue = '';
    letterInputs.forEach(input => {
        inputValue += input.value.toLowerCase();
    });

    const correctValue = correctAnswer.toLowerCase();

    // Clear previous feedback
    inputFeedback.innerHTML = '';

    // Create feedback indicators for each character
    for (let i = 0; i < Math.max(inputValue.length, correctValue.length); i++) {
        const indicator = document.createElement('div');
        indicator.className = 'letter-indicator';

        if (i < inputValue.length && i < correctValue.length) {
            // Both input and correct value have a character at this position
            if (inputValue[i] === correctValue[i]) {
                indicator.classList.add('correct');
            } else {
                indicator.classList.add('incorrect');
            }
        } else if (i < inputValue.length) {
            // Input is longer than correct value
            indicator.classList.add('incorrect');
        } else {
            // Correct value is longer than input (no indicator needed)
            indicator.style.visibility = 'hidden';
        }

        inputFeedback.appendChild(indicator);
    }

    // Check if answer is correct
    if (inputValue === correctValue && inputValue.length > 0 && inputValue.length === correctValue.length) {
        // Record correct answer
        if (selectedWord !== null) {
            answeredWords[selectedWord] = 'correct';
        } else {
            answeredWords[currentWordIndex] = 'correct';
        }

        // Update word list to show colored background
        generateWordList();

        // Immediately move to next question
        // After answering a manually selected word, switch to automatic mode
        if (selectedWord !== null) {
            selectedWord = null; // Switch to automatic mode
            showQuestion();
        } else {
            showQuestion();
        }
    } else if (inputValue.length === correctValue.length) {
        // Record incorrect answer when all letters are filled but incorrect
        if (selectedWord !== null) {
            answeredWords[selectedWord] = 'incorrect';
        } else {
            answeredWords[currentWordIndex] = 'incorrect';
        }

        // Update word list to show colored background
        generateWordList();

        // Immediately move to next question
        // After answering a manually selected word, switch to automatic mode
        if (selectedWord !== null) {
            selectedWord = null; // Switch to automatic mode
            showQuestion();
        } else {
            showQuestion();
        }
    }
}

// Generate multiple choice options for enToZh mode
function generateOptions(correctTranslation) {
    // Clear previous options
    optionsContainer.innerHTML = '';

    // Create an array of all translations
    const allTranslations = Object.values(words);

    // Make sure we have enough translations
    if (allTranslations.length < 4) {
        console.error('词汇量不足，至少需要4个词汇');
        return;
    }

    // Create options array with the correct answer
    const options = [correctTranslation];

    // Add 3 random incorrect options
    while (options.length < 4) {
        const randomTranslation = allTranslations[Math.floor(Math.random() * allTranslations.length)];
        // Make sure we don't add duplicates
        if (!options.includes(randomTranslation)) {
            options.push(randomTranslation);
        }
    }

    // Shuffle the options
    shuffleArray(options);

    // Create option buttons
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.addEventListener('click', () => checkEnToZhAnswer(option, correctTranslation, button));
        optionsContainer.appendChild(button);
    });
}

// Check answer for enToZh mode
function checkEnToZhAnswer(selectedOption, correctOption, buttonElement) {
    // Disable all buttons to prevent multiple clicks
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctOption) {
            btn.classList.add('correct');
        }
    });

    // Mark selected option
    if (selectedOption === correctOption) {
        buttonElement.classList.add('correct');

        // Record correct answer
        if (selectedWord !== null) {
            answeredWords[selectedWord] = 'correct';
        } else {
            answeredWords[currentWordIndex] = 'correct';
        }

        // Update word list to show colored background
        generateWordList();

        // Show correct popup with animation
        correctPopup.classList.remove('hidden');
        // Trigger reflow to ensure the animation plays
        void correctPopup.offsetWidth;
        correctPopup.classList.add('show');

        // Immediately switch to next question
        // After answering a manually selected word, switch to automatic mode
        if (selectedWord !== null) {
            selectedWord = null; // Switch to automatic mode
            showQuestion();
        } else {
            showQuestion();
        }

        // Hide popup after a delay
        setTimeout(() => {
            correctPopup.classList.remove('show');
            setTimeout(() => {
                correctPopup.classList.add('hidden');
            }, 300); // Wait for animation to complete
        }, 1000);
    } else {
        buttonElement.classList.add('incorrect');

        // Record incorrect answer
        if (selectedWord !== null) {
            answeredWords[selectedWord] = 'incorrect';
        } else {
            answeredWords[currentWordIndex] = 'incorrect';
        }

        // Update word list to show colored background
        generateWordList();

        // Show incorrect popup with animation
        incorrectPopup.classList.remove('hidden');
        // Trigger reflow to ensure the animation plays
        void incorrectPopup.offsetWidth;
        incorrectPopup.classList.add('show');

        // Immediately switch to next question
        // After answering a manually selected word, switch to automatic mode
        if (selectedWord !== null) {
            selectedWord = null; // Switch to automatic mode
            showQuestion();
        } else {
            showQuestion();
        }

        // Hide popup after a delay
        setTimeout(() => {
            incorrectPopup.classList.remove('show');
            setTimeout(() => {
                incorrectPopup.classList.add('hidden');
            }, 300); // Wait for animation to complete
        }, 1000);
    }
}

// Show word explanation modal
function showWordExplanation() {
    // Get current word based on mode and selection
    let englishWord, chineseWord;

    if (selectedWord !== null) {
        englishWord = wordKeys[selectedWord];
        chineseWord = words[englishWord];
    } else {
        englishWord = wordKeys[currentWordIndex];
        chineseWord = words[englishWord];
    }

    // Set the content
    explanationEnglishWord.textContent = englishWord;
    explanationChineseWord.textContent = chineseWord;

    // Show the modal
    explanationModal.classList.remove('hidden');
}

// Hide word explanation modal
function hideWordExplanation() {
    explanationModal.classList.add('hidden');
}

// Update progress display
function updateProgress() {
    if (selectedWord !== null) {
        progressText.textContent = `${selectedWord + 1}/${wordKeys.length}`;
    } else {
        progressText.textContent = `${currentWordIndex + 1}/${wordKeys.length}`;
    }
}

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}