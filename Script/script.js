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
let alertUserEle = document.getElementById("alertUserEle"); // Element that will notify the user when any action happens during the session.
let prevPageBTN = document.getElementById("prevPageBTN"); // Previous Page Button
let nextPageBTN = document.getElementById("nextPageBTN"); // Next Page Button
let addPageBTN = document.getElementById("addPageBTN"); // Add Page Button
let pageIndicator = document.getElementById("pageIndicator"); // Page Indicator

let overlayMenu = document.getElementById("overlayMenu");
let editOverlay = document.getElementById("editOverlay");
let editInput = document.getElementById("editInput");

let pages = JSON.parse(localStorage.getItem('pages')) || [[]];
let currentPage = 0;
let deleteMode = false;

let longPressTimer;
let selectedWordElement;
let selectedWordObj;

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
            wordElement.addEventListener("mousedown", (event) => handleMouseDown(event, displayWords[i], wordElement));
            wordElement.addEventListener("mouseup", handleMouseUp);
            wordElement.addEventListener("mouseleave", handleMouseUp);
            wordElement.addEventListener("touchstart", (event) => handleTouchStart(event, displayWords[i], wordElement));
            wordElement.addEventListener("touchend", handleTouchEnd);
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
        localStorage.setItem('currentPage', currentPage); // Save current page to local storage
    }
});

// Event listener for the next page button
nextPageBTN.addEventListener("click", () => {
    if (currentPage < pages.length - 1) {
        currentPage++;
        refreshWords();
        localStorage.setItem('currentPage', currentPage); // Save current page to local storage
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
    localStorage.setItem('currentPage', currentPage); // Save current page to local storage
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

// Setting up dark css in a variable 
let sty = document.createElement("link");
sty.setAttribute('rel', 'stylesheet');
sty.setAttribute("href", "Style/darkTheme.css");

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
    document.head.removeChild(sty);
}
function darkMode() {
    document.head.appendChild(sty);
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

// Side Menu Javascript Code 
let sideMenuBTNNav = document.getElementById("sideMenuBTNNav");
document.getElementById('sideMenuBTNNav').addEventListener('click', function () {
    var sideMenuParent = document.getElementById('sidemenuParnt');
    if (sideMenuParent.style.display === "block") {
        document.getElementById('sideMenu').classList.add('hideMenu');
        document.getElementById('sideMenu').classList.remove('showMenu');
        sideMenuBTNNav.children[1].style.opacity = "1";
        sideMenuBTNNav.children[0].style.transform = "rotate(0) translate(0, 0)";
        sideMenuBTNNav.children[2].style.transform = "rotate(0) translate(0, 0)";
        setTimeout(() => {
            sideMenuParent.style.display = "none";
            document.body.classList.remove('no-scroll');
            // Adding global click event listener
        }, 400);
    } else {
        sideMenuParent.style.display = "block";

        setTimeout(() => {
            document.getElementById('sideMenu').classList.add('showMenu');
            document.getElementById('sideMenu').classList.remove('hideMenu');
            sideMenuBTNNav.children[1].style.opacity = "0";
            sideMenuBTNNav.children[0].style.transform = "rotate(45deg) translate(5px, 5px)";
            sideMenuBTNNav.children[2].style.transform = "rotate(-45deg) translate(8px, -8px)";
            document.body.classList.add('no-scroll');
            document.addEventListener("mousedown", SideMenuCollapse);
        }, 100);
    }
});


// Script to show menu for words 
function handleMouseDown(event, wordObj, wordElement) {
    selectedWordObj = wordObj;
    selectedWordElement = wordElement;
    longPressTimer = setTimeout(() => {
        showOverlayMenu(event.clientX, event.clientY);
    }, 500);
}

function handleMouseUp() {
    clearTimeout(longPressTimer);
}

function handleTouchStart(event, wordObj, wordElement) {
    selectedWordObj = wordObj;
    selectedWordElement = wordElement;
    longPressTimer = setTimeout(() => {
        showOverlayMenu(event.touches[0].clientX, event.touches[0].clientY);
    }, 500);
}

function handleTouchEnd() {
    clearTimeout(longPressTimer);
}

function showOverlayMenu(x, y) {
    overlayMenu.style.display = "flex";
    document.body.classList.add('no-scroll');
    document.getElementById('HoldMenuSlctText').textContent = selectedWordObj.word
}


document.getElementById("searchBtn").addEventListener("click", () => {
    let searchQuery = `https://www.google.com/search?q=Define+${selectedWordObj.word}`;
    window.open(searchQuery, '_blank');
    overlayMenu.style.display = "none";
    document.body.classList.remove('no-scroll');
});

document.getElementById("editBtn").addEventListener("click", () => {
    overlayMenu.style.display = "none";
    document.body.classList.remove('no-scroll');
    editOverlay.style.left = `${selectedWordElement.getBoundingClientRect().left}px`;
    editOverlay.style.top = `${selectedWordElement.getBoundingClientRect().top}px`;
    editOverlay.style.display = "block";
    editInput.value = selectedWordObj.word;
    editInput.focus();
});

editInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        let editedWord = editInput.value.trim(); // Remove leading and trailing whitespace

        // Check if the edited word contains any spaces within itself
        if (/\s/.test(editedWord)) {
            showAlert("Word cannot contain spaces within.", true);
        } else if (editedWord === "") {
            showAlert("Cannot submit blank word.", true);
        } else {
            selectedWordObj.word = editedWord;
            localStorage.setItem('pages', JSON.stringify(pages));
            refreshWords();
            editOverlay.style.display = "none";
            showAlert("Word edited successfully.", false);
        }
    }
});


document.getElementById("archiveBtn").addEventListener("click", () => {
    if (selectedWordObj) {
        // Archive the selected word
        let archivedWords = JSON.parse(localStorage.getItem('archivedWords')) || [];
        archivedWords.push(selectedWordObj.word);
        localStorage.setItem('archivedWords', JSON.stringify(archivedWords));

        // Optionally remove the word from the current page
        pages[currentPage] = pages[currentPage].filter(word => word !== selectedWordObj);
        localStorage.setItem('pages', JSON.stringify(pages));

        // Refresh your UI or perform any necessary updates
        refreshWords();
        showAlert("Word archived successfully.", true);
    } else {
        showAlert("No word selected.", true);
    }

    // Hide the overlay menu and restore scroll
    overlayMenu.style.display = "none";
    document.body.classList.remove('no-scroll');
});


document.getElementById("copyBtn").addEventListener("click", () => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(selectedWordObj.word).then(() => {
            showAlert("Word copied to clipboard.", true);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showAlert("Failed to copy word.", false);
        });
    } else {
        // Fallback for browsers that don't support navigator.clipboard
        let textArea = document.createElement("textarea");
        textArea.value = selectedWordObj.word;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showAlert("Word copied to clipboard.", true);
        } catch (err) {
            console.error('Failed to copy: ', err);
            showAlert("Failed to copy word.", false);
        }
        document.body.removeChild(textArea);
    }
    overlayMenu.style.display = "none";
    document.body.classList.remove('no-scroll');
});


document.getElementById("moveBtn").addEventListener("click", async () => {
    let destinationPage = await showPrompt("Enter the destination page number:");
    if (destinationPage !== null && !isNaN(destinationPage) && destinationPage > 0 && destinationPage <= pages.length) {
        pages[destinationPage - 1].push(selectedWordObj);
        pages[currentPage] = pages[currentPage].filter(word => word !== selectedWordObj);
        localStorage.setItem('pages', JSON.stringify(pages));
        refreshWords();
        showAlert("Word moved successfully.", true);
    } else {
        showAlert("Invalid page number.", true);
    }
    overlayMenu.style.display = "none";
    document.body.classList.remove('no-scroll');
});

document.getElementById("deleteBtn").addEventListener("click", async () => {
    const confirmDeletion = await showDialogue("Are you sure you want to delete this word?", 'No', 'Yes');
    if (confirmDeletion) {
        showAlert("Word deleted.", true);
        pages[currentPage] = pages[currentPage].filter(word => word !== selectedWordObj);
        localStorage.setItem('pages', JSON.stringify(pages));
        refreshWords();
        showAlert("Word deleted successfully.", false);
        overlayMenu.style.display = "none";
        document.body.classList.remove('no-scroll');

    } else {
        showAlert("Deletion canceled.", false);
    }
    overlayMenu.style.display = "none";
    document.body.classList.remove('no-scroll');
});


document.getElementById("ExitBtn").addEventListener("click", () => {
    overlayMenu.style.display = "none";
    document.body.classList.remove('no-scroll');

})


// For Mobile User 
// Add this JavaScript code to handle long press on touch devices
let touchStartTimer;
let touchWordElement;
let touchWordObj;

collectionData.addEventListener("touchstart", (event) => {
    let touch = event.touches[0];
    let element = document.elementFromPoint(touch.clientX, touch.clientY);

    touchWordObj = findWordObj(element.textContent.trim());
    if (touchWordObj) {
        touchWordElement = element;
        touchStartTimer = setTimeout(() => {
            showOverlayMenu(touch.clientX, touch.clientY);
        }, 500);
    }
});

collectionData.addEventListener("touchend", () => {
    clearTimeout(touchStartTimer);
});

function findWordObj(word) {
    for (let page of pages) {
        for (let wordObj of page) {
            if (wordObj.word === word) {
                return wordObj;
            }
        }
    }
    return null;
}



// Load Previous Pages 
document.addEventListener("DOMContentLoaded", () => {
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage !== null) {
        currentPage = parseInt(savedPage, 10);
        refreshWords();
    } else {
        currentPage = 0;
        refreshWords();
    }
});
