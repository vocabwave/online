let addBTN = document.getElementById("addBTN"); // Add Button
let copyBTN = document.getElementById("copyBTN"); // Copy Data Button
let restoreBTN = document.getElementById("restoreBTN"); // Restore Data Button
let deleteBTN = document.getElementById("deleteBTN"); // Delete Button
let deleteAllBTN = document.getElementById("deleteAllBTN"); // Delete All Button
let sortBTN = document.getElementById("sortBTN"); // Sort Button
let sortCriteria = document.getElementById("sortCriteria"); // Sort Criteria Dropdown
let sortOrder = document.getElementById("sortOrder"); // Sort Order Dropdown
let userInWord = document.getElementById("userInWord"); // Input Text field
let searchWord = document.getElementById("searchWord"); // Search Input field
let collectionData = document.getElementById("collectionData"); // Main element for displaying words
let alertUserEle = document.getElementById("alertUserEle"); //Element that will notify the user when any action happen during the session.
let prevPageBTN = document.getElementById("prevPageBTN"); // Previous Page Button
let nextPageBTN = document.getElementById("nextPageBTN"); // Next Page Button
let addPageBTN = document.getElementById("addPageBTN"); // Add Page Button
let pageIndicator = document.getElementById("pageIndicator"); // Page Indicator

// Retrieve words from local storage or initialize as an empty array
let pages = JSON.parse(localStorage.getItem('pages')) || [[]];
let currentPage = 0;
let deleteMode = false; // Flag to track delete mode

// Function to refresh the list of words on the screen
function refreshWords(filteredWords = null) {
    collectionData.innerHTML = "";
    let displayWords = filteredWords || pages[currentPage];

    if (displayWords.length === 0) {
        let noMatchElement = document.createElement("p");
        noMatchElement.className = "elemtDataColle centreText";
        if (searchWord.value != "") {
            noMatchElement.innerText = "No match found";
        } else {
            noMatchElement.innerText = `Nothing to show. \n\n"Type any word or sentence and click on 'Add' to add word(s) here."`;
        }
        collectionData.appendChild(noMatchElement);
    } else {
        for (let i = 0; i < displayWords.length; i++) {
            let wordElement = document.createElement("p");
            wordElement.className = "elemtDataColle capitText";
            wordElement.innerText = displayWords[i].word;
            wordElement.addEventListener("click", () => {
                if (deleteMode) {
                    pages[currentPage].splice(pages[currentPage].indexOf(displayWords[i]), 1); // Remove the word from the array
                    localStorage.setItem('pages', JSON.stringify(pages)); // Update local storage
                    refreshWords(); // Refresh the list
                }
            });
            wordElement.addEventListener("dblclick", () => {
                let searchQuery = `https://www.google.com/search?q=Define+${displayWords[i].word}`;
                window.open(searchQuery, '_blank');
            });
            collectionData.appendChild(wordElement);
        }
    }

    if (deleteMode) {
        collectionData.classList.add("delete-mode");
    } else {
        collectionData.classList.remove("delete-mode");
    }

    // Update page indicator
    pageIndicator.innerText = `Page ${currentPage + 1} of ${pages.length}`;
}

// Initial call to refreshWords to display any stored words on page load
refreshWords();

//Event Listen with enter key to add words
userInWord.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        addWord();
    }
});

// Event listener for the add button
addBTN.addEventListener("click", () => {
    addWord();
});

//Function to add word
function addWord() {
    let inputText = userInWord.value.trim();
    if (inputText) { // Ensure the input is not empty
        // Remove all symbols and keep only alphanumeric characters and spaces
        let cleanedInputText = inputText.replace(/[^a-zA-Z0-9\s]/g, '');
        let inputWords = cleanedInputText.split(/\s+/); // Split the input by spaces
        let uniqueInputWords = [...new Set(inputWords.map(word => word.toLowerCase()))]; // Unique words in lower case
        let wordsToAdd = [];
        let duplicateInStorage = false;

        // Check if any of the words already exist in storage
        for (let word of uniqueInputWords) {
            let found = false;
            for (let page of pages) {
                if (page.some(wordObj => wordObj.word.toLowerCase() === word)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                wordsToAdd.push(word); // Add the word to the list of words to be added
            } else if (inputWords.length === 1) { // If it's a single word input and it's found
                duplicateInStorage = true;
                showAlert(`The word "${word}" is already saved.`, true);
                break;
            }
        }

        if (!duplicateInStorage && wordsToAdd.length > 0) {
            wordsToAdd.forEach(word => {
                pages[currentPage].push({ word: word, date: new Date().toISOString() });
            });
            localStorage.setItem('pages', JSON.stringify(pages)); // Store updated words array in local storage
            refreshWords(); // Refresh the list to show the new words
            userInWord.value = ""; // Clear the input field after adding the words
            showAlert("Word(s) added successfully.", true);
        } else if (!duplicateInStorage && wordsToAdd.length === 0) {
            showAlert("All word(s) are already saved.", true);
        }
    }
}


// Event listener for the copy button
copyBTN.addEventListener("click", async () => {
    // Show the confirmation dialog
    const userConfirmed = await showDialogue(
        "Are you sure you want to copy the data? This will copy all pages data to the clipboard.",
        'No',
        'Yes'
    );

    // If the user confirms, proceed with the copy action
    if (userConfirmed) {
        let textArea = document.createElement("textarea");
        textArea.value = JSON.stringify(pages);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        // Notify the user that data has been copied
        showAlert("Data copied to clipboard! Now save it as a text file on your device.");
    }
});


// Event listener for the restore button
restoreBTN.addEventListener("click", async () => {
    let backupData = await showPrompt("Paste your backup data here:");
    if (backupData) {
        try {
            pages = JSON.parse(backupData);
            currentPage = 0; // Reset to the first page
            localStorage.setItem('pages', JSON.stringify(pages));
            refreshWords();
            showAlert("Data restored successfully!");
            setTimeout(() => {
                alertUserEle.innerText = "";
            }, 3000);
        } catch (e) {
            showAlert("Invalid data format. Please try again.");
        }
    }
});

// Event listener for the delete button
deleteBTN.addEventListener("click", async () => {
    if (deleteMode) {
        // If delete mode is currently active, show confirmation to deactivate
        const userConfirmed = await showDialogue(
            "Are you sure you want to deactivate delete mode?",
            'No',
            'Yes'
        );

        // If user confirms, deactivate delete mode and update UI
        if (userConfirmed) {
            deleteMode = false;
            refreshWords(); // Refresh the list to update the interface
            showAlert("Delete mode deactivated.");
            deleteBTN.style.backgroundColor = "rgb(255, 142, 142)";
        }
    } else {
        // If delete mode is currently inactive, show confirmation to activate
        const userConfirmed = await showDialogue(
            "Are you sure you want to activate delete mode?",
            'No',
            'Yes'
        );

        // If user confirms, activate delete mode and update UI
        if (userConfirmed) {
            deleteMode = true;
            refreshWords(); // Refresh the list to update the interface
            showAlert("Delete mode activated. Click on any word to delete it.");
            deleteBTN.style.backgroundColor = "rgba(255, 142, 142, 0.488)";
        }
    }
});



// Event listener for the delete all button
deleteAllBTN.addEventListener("click", async () => {
    if (await showDialogue(
        "Are you sure you want to delete all words? This action cannot be undone.",
        'No',
        'Yes'
    )) {
        pages = [[]];
        currentPage = 0;
        localStorage.removeItem('pages');
        refreshWords();
        showAlert("Everything has been deleted.");
    }
});

// Event listener for the search input
searchWord.addEventListener("input", () => {
    let searchTerm = searchWord.value.trim().toLowerCase();
    let filteredWords = [];
    pages.forEach(page => {
        filteredWords.push(...page.filter(wordObj => wordObj.word.toLowerCase().includes(searchTerm)));
    });
    refreshWords(filteredWords);
});

// Event listener for the sort button
sortBTN.addEventListener("click", () => {
    let criteria = sortCriteria.value;
    let order = sortOrder.value;

    if (criteria === "random") {
        pages[currentPage].sort(() => Math.random() - 0.5); // Random sort
    } else {
        pages[currentPage].sort((a, b) => {
            let comparison = 0;
            if (criteria === "name") {
                comparison = a.word.localeCompare(b.word);
            } else if (criteria === "date") {
                comparison = new Date(a.date) - new Date(b.date);
            } else if (criteria === "length") {
                comparison = a.word.length - b.word.length;
            }
            return order === "asc" ? comparison : -comparison;
        });
    }
    refreshWords();
});

// Event listener for the previous page button
prevPageBTN.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        refreshWords();
    }
});

// Event listener for the next page button
nextPageBTN.addEventListener("click", () => {
    if (currentPage < pages.length - 1) {
        currentPage++;
        refreshWords();
    }
});

// Event listener for the add page button
addPageBTN.addEventListener("click", async () => {
    // Show the confirmation dialog
    const userConfirmed = await showDialogue(
        "Are you sure you want to add a new page?",
        'No',
        'Yes'
    );

    // If the user confirms, proceed to add a new page
    if (userConfirmed) {
        pages.push([]); // Add a new blank page
        currentPage = pages.length - 1; // Set the current page to the newly added page
        localStorage.setItem('pages', JSON.stringify(pages)); // Update local storage
        refreshWords(); // Refresh the words display
        updatePageIndicator(); // Update the page indicator
        showAlert("New page added successfully.");
    }
});

// function that will notify the user
function showAlert(msg, pos) {
    if (pos) {
        alertUserEle.style.top = '0';
        alertUserEle.style.bottom = 'unset';
    } else {
        alertUserEle.style.top = 'unset';
        alertUserEle.style.bottom = '0';

    }
    alertUserEle.style.display = "flex";
    const timeshow = setTimeout(() => {
        alertUserEle.style.opacity = '1';
    }, 300);
    alertUserEle.textContent = msg;
    setTimeout(() => {
        alertUserEle.style.opacity = '0';
    }, 2500);
    setTimeout(() => {
        alertUserEle.style.display = "none";
    }, 2700);

}
// Event listener for the delete page button
deletePageBTN.addEventListener("click", async () => {
    if (pages.length === 1) {
        showAlert("Cannot delete the last remaining page.");
        return;
    }
    if (await showDialogue("Are you sure you want to delete the current page? This action cannot be undone.", 'No', 'Yes')) {
        pages.splice(currentPage, 1); // Remove the current page
        if (pages.length === 0) {
            pages.push([]); // Ensure there is always at least one blank page
        }
        currentPage = Math.max(0, currentPage - 1); // Set the current page to a valid index
        localStorage.setItem('pages', JSON.stringify(pages)); // Update local storage
        refreshWords(); // Refresh the words display
        updatePageIndicator(); // Update the page indicator
        showAlert("Page deleted successfully.");
    }
});


function updatePageIndicator() {
    document.getElementById('pageIndicator').innerText = `Page ${currentPage + 1} of ${pages.length}`;
}

// Light mode control feature section 
let lightmodeBTN = document.getElementById("lightmodeBTN"); // Light Mode Button

// Function to toggle dark mode/light mode
function toggleMode() {
    document.body.classList.toggle('dark-mode');

    // Save the current mode to local storage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        darkMode();
    } else {
        localStorage.setItem('theme', 'light');
        lightMode();
    }
}

// Event listener for the light mode button
lightmodeBTN.addEventListener("click", toggleMode);

// Check local storage for the saved theme on page load
window.addEventListener("load", () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        darkMode();
    } else {
        lightMode();
    }
});
function lightMode() {
    lightmodeBTN.style.backgroundImage = "url(./Files/moon.png)";
    const primary = "whitesmoke";
    const secondary = "white";
    const fontclr = "black";
    lightmodeBTN.style.filter = "invert(0)";
    document.body.style.backgroundColor = primary;
    document.querySelector('nav').style.backgroundColor = secondary;
    document.querySelector("#dataTrans").children[0].style.backgroundColor = 'greenyellow'; //For Backup
    //changing the color of the font of data trans btn
    for (let i = 0; i < document.querySelector("#dataTrans").children.length; i++) {
        document.querySelector("#dataTrans").children[i].style.color = 'black';

    }
    document.querySelector("#dataTrans").children[1].style.backgroundColor = 'rgb(255, 199, 32)'; //For Restore
    document.querySelector('#userinPrent').children[0].style.backgroundColor = 'transparent'; //For Wordtype adding
    document.querySelector('#userinPrent').children[0].classList.remove("placeholder-fordark"); //For Wordtype adding
    document.querySelector('#userinPrent').children[0].classList.add("placeholder-forlight"); //For Wordtype adding
    document.querySelector('#userinPrent').children[0].style.color = fontclr;  //For Wordtype adding
    addBTN.style.backgroundColor = '#d4daff'; //add button
    addBTN.style.color = fontclr; //add button
    //Mass change of page control buttons
    for (let i = 0; i < document.querySelector("#pageCtrlBtn").children.length; i++) {
        document.querySelector("#pageCtrlBtn").children[i].style.backgroundColor = "#ffff9a";
        document.querySelector("#pageCtrlBtn").children[i].style.color = fontclr;
    }
    pageIndicator.style.color = fontclr;//page count show
    document.querySelector("#collectionPrnt").style.backgroundColor = '#ffff9ad4'; //Main Page background
    document.querySelector("#collectionPrnt").children[1].style.color = 'rgb(0, 128, 255)'; //heading of the word page
    document.querySelector("#wordEditModePrnt").children[0].style.color = fontclr; //find input field
    document.querySelector("#wordEditModePrnt").children[0].classList.remove("placeholder-fordark"); //find input
    document.querySelector("#wordEditModePrnt").children[0].classList.add("placeholder-forlight"); //find input
    //mass change of the select buttons sort
    for (let i = 0; i < 2; i++) {
        document.querySelector("#sortChangerPrnt").children[i].style.backgroundColor = "transparent";
        document.querySelector("#sortChangerPrnt").children[i].style.color = fontclr;
        document.querySelector("#sortChangerPrnt").children[2].style.color = fontclr;

    }
    sortBTN.style.backgroundColor = '#ffdede'; //apply button
    //mass element of words
    for (let i = 0; i < collectionData.children.length; i++) {
        collectionData.style.color = fontclr;
    }
    document.querySelector("#collectionPrnt").style.borderColor = 'black';
    document.querySelector("#collectionPrnt").children[0].style.backgroundColor = 'black';
    //Prompt And Dia-Box
    let DiaTextAllSize = document.getElementsByClassName("DiaTextAllSize");
    let mainWindDialo = document.getElementById("mainWindDialo");
    let mainWindPrompt = document.getElementById("mainWindPrompt");
    for (let i = 0; i < DiaTextAllSize.length; i++) {
        DiaTextAllSize[i].style.color = "black";

    }

    promptInput.style.backgroundColor = primary;
    mainWindDialo.style.backgroundColor = secondary;
    mainWindDialo.style.boxShadow = '0px 0px 10px 0px rgba(255, 255, 255, 0.441)';
    mainWindPrompt.style.backgroundColor = secondary;
    mainWindPrompt.style.boxShadow = '0px 0px 10px 0px rgba(255, 255, 255, 0.441)';
    for (let i = 0; i < DiaBtns.length; i++) {
        DiaBtns[i].style.backgroundColor = primary

    }
}
function darkMode() {
    lightmodeBTN.style.backgroundImage = "url(./Files/sun.png)";
    const primary = "#222";
    const secondary = "#111";
    document.body.style.backgroundColor = primary;
    document.querySelector('nav').style.backgroundColor = secondary;
    lightmodeBTN.style.filter = "invert(1)";
    document.querySelector("#dataTrans").children[0].style.backgroundColor = '#6ca416'; //For Backup
    //changing the color of the font of data trans btn
    for (let i = 0; i < document.querySelector("#dataTrans").children.length; i++) {
        document.querySelector("#dataTrans").children[i].style.color = 'white';

    }
    document.querySelector("#dataTrans").children[1].style.backgroundColor = '#c79d1f'; //For Restore
    // document.querySelector("#dataTrans").children[2].style.backgroundColor = '#cd6060'; //For D-One
    // document.querySelector("#dataTrans").children[3].style.backgroundColor = '#cd6060'; //For D-All
    document.querySelector('#userinPrent').children[0].style.backgroundColor = 'black'; //For Wordtype adding
    document.querySelector('#userinPrent').children[0].classList.remove("placeholder-forlight"); //For Wordtype adding
    document.querySelector('#userinPrent').children[0].classList.add("placeholder-fordark"); //For Wordtype adding
    document.querySelector('#userinPrent').children[0].style.color = 'white';  //For Wordtype adding
    addBTN.style.backgroundColor = '#959bbb'; //add button
    addBTN.style.color = 'white'; //add button
    for (let i = 0; i < document.querySelector("#pageCtrlBtn").children.length; i++) {
        document.querySelector("#pageCtrlBtn").children[i].style.backgroundColor = "#919100";
        document.querySelector("#pageCtrlBtn").children[i].style.color = "white";
    }
    pageIndicator.style.color = 'white';
    document.querySelector("#collectionPrnt").style.backgroundColor = '#a1a1468a'; //Main Page background
    document.querySelector("#collectionPrnt").children[1].style.color = 'whitesmoke';
    document.querySelector("#wordEditModePrnt").children[0].style.color = 'white';
    document.querySelector("#wordEditModePrnt").children[0].classList.remove("placeholder-forlight");
    document.querySelector("#wordEditModePrnt").children[0].classList.add("placeholder-fordark");
    for (let i = 0; i < 2; i++) {
        document.querySelector("#sortChangerPrnt").children[i].style.backgroundColor = "transparent";
        document.querySelector("#sortChangerPrnt").children[i].style.color = "white";
        document.querySelector("#sortChangerPrnt").children[2].style.color = "white";

    }
    sortBTN.style.backgroundColor = '#a78484';
    for (let i = 0; i < collectionData.children.length; i++) {
        collectionData.style.color = 'white';
    }
    document.querySelector("#collectionPrnt").style.borderColor = 'whitesmoke';
    document.querySelector("#collectionPrnt").children[0].style.backgroundColor = 'whitesmoke';
    //Prompt And Dia-Box
    let DiaTextAllSize = document.getElementsByClassName("DiaTextAllSize");
    let DiaBtns = document.getElementsByClassName("DiaBtns");
    let mainWindDialo = document.getElementById("mainWindDialo");
    let mainWindPrompt = document.getElementById("mainWindPrompt");
    let promptInput = document.getElementById("promptInput");
    for (let i = 0; i < DiaTextAllSize.length; i++) {
        DiaTextAllSize[i].style.color = "white";

    }
    promptInput.style.backgroundColor = 'black';
    mainWindDialo.style.backgroundColor = primary;
    mainWindDialo.style.boxShadow = '0px 0px 10px 0px ' + primary;
    mainWindPrompt.style.backgroundColor = primary;
    mainWindPrompt.style.boxShadow = '0px 0px 10px 0px ' + primary;
    for (let i = 0; i < DiaBtns.length; i++) {
        DiaBtns[i].style.backgroundColor = secondary;
    }
}





// Get elements
const mainWindDialo = document.getElementById("mainWindDialo");
const dialogueBoxPrnt = document.getElementById("dialogueBoxPrnt");
const DiaBtns = document.getElementsByClassName("DiaBtns");

// Function to show dialog and return a promise
function showDialogue(diaText, btn1Text, btn2Text) {
    // Set dialog text and button texts
    document.getElementById("Dialoguetext").innerText = diaText;
    document.getElementById("button1Text").innerText = btn1Text;
    document.getElementById("button2Text").innerText = btn2Text;

    // Show dialog
    dialogueBoxPrnt.style.display = "flex";
    setTimeout(() => {
        dialogueBoxPrnt.style.opacity = '1';
        mainWindDialo.style.opacity = '1';
        mainWindDialo.style.transform = 'scale(1)';
        document.body.classList.add('no-scroll');
    }, 50);

    // Return a promise that resolves with the button click value
    return new Promise((resolve) => {
        // Add click event listeners to buttons
        DiaBtns[0].addEventListener("click", () => {
            resolve(false); // Button 1 clicked, return false
            closeDialog();
        }, { once: true });
        DiaBtns[1].addEventListener("click", () => {
            resolve(true); // Button 2 clicked, return true
            closeDialog();
        }, { once: true });
    });
}

// Function to close dialog
function closeDialog() {
    mainWindDialo.style.opacity = '0';
    mainWindDialo.style.transform = 'scale(0.7)';
    dialogueBoxPrnt.style.opacity = '0';
    setTimeout(() => {

        dialogueBoxPrnt.style.display = "none";
        document.body.classList.remove('no-scroll');
    }, 300);
}


// Prompt Section Here 
// Get elements for the prompt
const mainWindPrompt = document.getElementById("mainWindPrompt");
const promptBoxPrnt = document.getElementById("promptBoxPrnt");
const promptInput = document.getElementById("promptInput");
const promptOkBtn = document.getElementById("promptOkBtn");
const promptCancelBtn = document.getElementById("promptCancelBtn");

// Function to show prompt and return a promise
function showPrompt(promptText) {
    // Set prompt text
    document.getElementById("promptText").innerText = promptText;
    promptInput.value = ''; // Clear previous input

    // Show prompt
    promptBoxPrnt.style.display = "flex";
    setTimeout(() => {
        promptBoxPrnt.style.opacity = '1';
        mainWindPrompt.style.opacity = '1';
        mainWindPrompt.style.transform = 'scale(1)';
        document.body.classList.add('no-scroll');
    }, 50);

    // Return a promise that resolves with the input value or null if cancelled
    return new Promise((resolve) => {
        // Add click event listeners to buttons
        promptOkBtn.addEventListener("click", () => {
            resolve(promptInput.value); // OK clicked, return input value
            closePrompt();
        }, { once: true });
        promptCancelBtn.addEventListener("click", () => {
            resolve(null); // Cancel clicked, return null
            closePrompt();
        }, { once: true });
    });
}

// Function to close prompt
function closePrompt() {
    mainWindPrompt.style.opacity = '0';
    mainWindPrompt.style.transform = 'scale(0.7)';
    promptBoxPrnt.style.opacity = '0';
    setTimeout(() => {
        promptBoxPrnt.style.display = "none";
        document.body.classList.remove('no-scroll');
    }, 300);
}

