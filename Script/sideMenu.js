// Hide Hold Menu when user click on other element 
// Function to check if click was outside the element
function SideMenuCollapse(event) {
    // Get all elements with the given class
    var sideMenuParent = document.getElementById('sidemenuParnt');
    const elements = document.querySelectorAll('.highlight');
    let clickedOutside = true;

    elements.forEach((element) => {
        if (element.contains(event.target)) {
            clickedOutside = false;
        }
    });

    if (clickedOutside) {
        document.getElementById('sideMenu').classList.add('hideMenu');
        document.getElementById('sideMenu').classList.remove('showMenu');
        sideMenuBTNNav.children[1].style.opacity = "1";
        sideMenuBTNNav.children[0].style.transform = "rotate(0) translate(0, 0)";
        sideMenuBTNNav.children[2].style.transform = "rotate(0) translate(0, 0)";
        setTimeout(() => {
            sideMenuParent.style.display = "none";
            document.body.classList.remove('no-scroll');
        }, 400);
    }
}



// For demonstration, adding the class to an element after a click
document.querySelectorAll('.sideMenuColl').forEach((element) => {
    element.addEventListener('click', (e) => {
        element.classList.add('highlight');
    });
});