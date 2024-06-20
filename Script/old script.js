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

// Retrieve words from local storage or initialize as an empty array
let words = JSON.parse(localStorage.getItem('words')) || [];
let deleteMode = false; // Flag to track delete mode

// Function to refresh the list of words on the screen
function refreshWords(filteredWords = null) {
    collectionData.innerHTML = "";
    let displayWords = filteredWords || words;

    if (displayWords.length === 0) {
        let noMatchElement = document.createElement("p");
        noMatchElement.className = "elemtDataColle uniFont centreText";
        if (searchWord.value != "") {
            noMatchElement.innerText = "No match found";
        } else {
            noMatchElement.innerText = `Nothing to show. \n\n"Type any word or sentence and click on 'Add' to add word(s) here."`;

        }
        collectionData.appendChild(noMatchElement);
    } else {
        for (let i = 0; i < displayWords.length; i++) {
            let wordElement = document.createElement("p");
            wordElement.className = "elemtDataColle uniFont capitText";
            wordElement.innerText = displayWords[i].word;
            wordElement.addEventListener("click", () => {
                if (deleteMode) {
                    words.splice(words.indexOf(displayWords[i]), 1); // Remove the word from the array
                    localStorage.setItem('words', JSON.stringify(words)); // Update local storage
                    refreshWords(); // Refresh the list
                }
            });
            collectionData.appendChild(wordElement);
        }
    }

    if (deleteMode) {
        collectionData.classList.add("delete-mode");
    } else {
        collectionData.classList.remove("delete-mode");
    }
}

// Initial call to refreshWords to display any stored words on page load
refreshWords();

//Event Listen with enter key to add words
userInWord.addEventListener("keypress", (e) => {
    if (e.keyCode == 13) {
        let inputText = userInWord.value.trim();
        if (inputText) { // Ensure the input is not empty
            // Remove all symbols and keep only alphanumeric characters and spaces
            let cleanedInputText = inputText.replace(/[^a-zA-Z0-9\s]/g, '');
            let inputWords = cleanedInputText.split(/\s+/); // Split the input by spaces
            for (let word of inputWords) {
                words.push({ word: word, date: new Date().toISOString() });
            }
            localStorage.setItem('words', JSON.stringify(words)); // Store updated words array in local storage
            refreshWords(); // Refresh the list to show the new words
            userInWord.value = ""; // Clear the input field after adding the words
        }
    }
})

// Event listener for the add button
addBTN.addEventListener("click", () => {
    let inputText = userInWord.value.trim();
    if (inputText) { // Ensure the input is not empty
        // Remove all symbols and keep only alphanumeric characters and spaces
        let cleanedInputText = inputText.replace(/[^a-zA-Z0-9\s]/g, '');
        let inputWords = cleanedInputText.split(/\s+/); // Split the input by spaces
        for (let word of inputWords) {
            words.push({ word: word, date: new Date().toISOString() });
        }
        localStorage.setItem('words', JSON.stringify(words)); // Store updated words array in local storage
        refreshWords(); // Refresh the list to show the new words
        userInWord.value = ""; // Clear the input field after adding the words
    }

});

// Event listener for the copy button
copyBTN.addEventListener("click", () => {
    const wordsString = JSON.stringify(words);
    navigator.clipboard.writeText(wordsString).then(() => {
        showAlert("Data copied to clipboard! Now save it as a text file on your device.");
    }).catch(err => {
        showAlert("Failed to copy: ");
        // console.error("Failed to copy: ", err);
    });
});

// Event listener for the restore button
restoreBTN.addEventListener("click", async () => {
    try {
        const clipboardText = await navigator.clipboard.readText();
        const restoredWords = JSON.parse(clipboardText);
        if (Array.isArray(restoredWords)) {
            words = restoredWords;
            localStorage.setItem('words', JSON.stringify(words)); // Store restored words array in local storage
            refreshWords(); // Refresh the list to show the restored words
            showAlert("Data restored from clipboard!");
        } else {
            showAlert("Invalid data format. Please ensure the clipboard contains valid JSON data.");
        }
    } catch (err) {
        // console.error("Failed to read from clipboard: ", err);
        showAlert("Failed to restore data from clipboard.");
    }
});

// Event listener for the delete button
deleteBTN.addEventListener("click", () => {
    deleteMode = !deleteMode; // Toggle delete mode
    refreshWords(); // Refresh the list to update the interface
    if (deleteMode) {
        showAlert("Delete mode activated. Click on any word to delete it.");
        deleteBTN.style.backgroundColor = "rgba(255, 142, 142, 0.488)";
    } else {
        showAlert("Delete mode deactivated.");
        deleteBTN.style.backgroundColor = "rgb(255, 142, 142)";
    }
});

// Event listener for the delete all button
deleteAllBTN.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all words?")) {
        words = []; // Clear the array
        localStorage.setItem('words', JSON.stringify(words)); // Update local storage
        refreshWords(); // Refresh the list to show no words
        showAlert("All words have been deleted.");
    }
});

// Event listener for the sort button
sortBTN.addEventListener("click", () => {
    let criteria = sortCriteria.value;
    let order = sortOrder.value;
    
    if (criteria === "random") {
        words.sort(() => Math.random() - 0.5); // Random sort
    } else {
        words.sort((a, b) => {
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

// function that will notify the user
function showAlert(msg) {
    alertUserEle.style.display = "flex";
    const timeshow = setTimeout(() => {
        alertUserEle.style.opacity = '1';
    }, 300);
    alertUserEle.textContent = msg;
    setTimeout(() => {
        alertUserEle.style.opacity = '0';
    }, 2500);
    alertUserEle.style.display = "flex";

}

// Event listener for the search input field
searchWord.addEventListener("input", () => {
    let searchText = searchWord.value.trim().toLowerCase();
    if (searchText) {
        let filteredWords = words.filter(wordObj => wordObj.word.toLowerCase().includes(searchText));
        refreshWords(filteredWords); // Show filtered words
    } else {
        refreshWords(); // Show all words if search box is empty
    }
});


