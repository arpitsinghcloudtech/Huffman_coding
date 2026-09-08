// ===============================
// HUFFMAN CODING
// ===============================

function buildHuffmanCodes(text) {

    let frequency = {};

    for (let char of text) {
        frequency[char] = (frequency[char] || 0) + 1;
    }

    let nodes = Object.keys(frequency).map(char => ({
        char: char,
        freq: frequency[char],
        left: null,
        right: null
    }));

    // Only one different character
    if (nodes.length === 1) {
        return {
            frequency: frequency,
            codes: {
                [nodes[0].char]: "0"
            }
        };
    }

    // Build Huffman tree
    while (nodes.length > 1) {

        nodes.sort((a, b) => a.freq - b.freq);

        let left = nodes.shift();
        let right = nodes.shift();

        nodes.push({
            char: null,
            freq: left.freq + right.freq,
            left: left,
            right: right
        });
    }

    let root = nodes[0];
    let codes = {};

    function generateCodes(node, code) {

        if (!node.left && !node.right) {
            codes[node.char] = code;
            return;
        }

        generateCodes(node.left, code + "0");
        generateCodes(node.right, code + "1");
    }

    generateCodes(root, "");

    return {
        frequency: frequency,
        codes: codes
    };
}


// ===============================
// COMPRESS
// ===============================

function compressText() {

    let text = document.getElementById("textInput").value;

    if (text.trim() === "") {
        alert("Please enter some text first.");
        return;
    }

    let result = buildHuffmanCodes(text);

    let frequency = result.frequency;
    let codes = result.codes;

    // Original size
    let originalBits = text.length * 8;

    // Compressed size
    let compressedBits = 0;

    let encoded = "";

    for (let char of text) {

        compressedBits += codes[char].length;

        encoded += codes[char];
    }

    // Compression ratio
    let compressionRatio =
        originalBits / compressedBits;

    // Compression percentage
    let compressionPercentage =
        (1 - compressedBits / originalBits) * 100;


    // ===============================
    // DISPLAY RESULTS
    // ===============================

    document.getElementById("originalText").textContent = text;

    document.getElementById("originalBits").textContent =
        originalBits + " bits";

    document.getElementById("compressedBits").textContent =
        compressedBits + " bits";

    document.getElementById("compressionRatio").textContent =
        compressionRatio.toFixed(2) + " : 1";

    document.getElementById("efficiency").textContent =
        compressionPercentage.toFixed(2) + "%";

    document.getElementById("encodedData").textContent =
        encoded;


    // ===============================
    // FREQUENCY TABLE
    // ===============================

    let frequencyTable =
        document.getElementById("frequencyTable");

    frequencyTable.innerHTML = `
        <tr>
            <th>Character</th>
            <th>Frequency</th>
        </tr>
    `;

    for (let char in frequency) {

        let displayChar = char;

        if (char === " ") {
            displayChar = "Space";
        }

        frequencyTable.innerHTML += `
            <tr>
                <td>${displayChar}</td>
                <td>${frequency[char]}</td>
            </tr>
        `;
    }


    // ===============================
    // HUFFMAN CODE TABLE
    // ===============================

    let codeTable =
        document.getElementById("codeTable");

    codeTable.innerHTML = `
        <tr>
            <th>Character</th>
            <th>Code</th>
        </tr>
    `;

    for (let char in codes) {

        let displayChar = char;

        if (char === " ") {
            displayChar = "Space";
        }

        codeTable.innerHTML += `
            <tr>
                <td>${displayChar}</td>
                <td>${codes[char]}</td>
            </tr>
        `;
    }
}


// ===============================
// CLEAR
// ===============================

function clearAll() {

    document.getElementById("textInput").value = "";

    document.getElementById("originalText").textContent = "-";
    document.getElementById("originalBits").textContent = "-";
    document.getElementById("compressedBits").textContent = "-";
    document.getElementById("compressionRatio").textContent = "-";
    document.getElementById("efficiency").textContent = "-";
    document.getElementById("encodedData").textContent = "-";

    document.getElementById("frequencyTable").innerHTML = `
        <tr>
            <th>Character</th>
            <th>Frequency</th>
        </tr>
    `;

    document.getElementById("codeTable").innerHTML = `
        <tr>
            <th>Character</th>
            <th>Code</th>
        </tr>
    `;
}


// ===============================
// SPEECH INPUT
// ===============================

function startSpeech() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "Speech recognition is not supported. Please use Google Chrome."
        );

        return;
    }

    let recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {

        console.log("Listening...");

        let button =
            document.querySelector(".buttons button:nth-child(2)");

        button.textContent = "🎙️ Listening...";
        button.disabled = true;
    };

    recognition.onresult = function (event) {

        let speechText =
            event.results[0][0].transcript;

        document.getElementById("textInput").value =
            speechText;
    };

    recognition.onerror = function (event) {

        console.log("Speech error:", event.error);

        if (event.error === "not-allowed") {

            alert(
                "Microphone permission was denied. Allow microphone access in Chrome."
            );

        } else if (event.error === "no-speech") {

            alert("No speech detected. Please try again.");

        } else {

            alert(
                "Speech recognition error: " +
                event.error
            );
        }
    };

    recognition.onend = function () {

        let button =
            document.querySelector(".buttons button:nth-child(2)");

        button.textContent = "🎤 Speak";
        button.disabled = false;
    };

    try {

        recognition.start();

    } catch (error) {

        console.log(error);

        alert("Could not start microphone. Please try again.");
    }
}