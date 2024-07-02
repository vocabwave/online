
// Hide Hold Menu when user click on other element 
// Function to check if click was outside the element
function handleClickOutside(event) {
    // Get all elements with the given class
    const elements = document.querySelectorAll('.highlight');
    let clickedOutside = true;

    elements.forEach((element) => {
        if (element.contains(event.target)) {
            clickedOutside = false;
        }
    });

    if (clickedOutside) {
        overlayMenu.style.display = "none";
        document.body.classList.remove('no-scroll');
    }
}

// Adding global click event listener
document.addEventListener("mouseup", handleClickOutside);

// For demonstration, adding the class to an element after a click
document.querySelectorAll('.clickable').forEach((element) => {
    element.addEventListener('click', (e) => {
        element.classList.add('highlight');
    });
});