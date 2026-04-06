const { response } = require("express");
const { data } = require("jquery");

/*===== SIGN IN POPUP MODAL =====*/
function showSignInModal() {

    const sign_in_container = document.getElementById('sign-in-container');

    sign_in_container.style.display = 'flex';
}

function hideSignInModal() {

    const sign_in_container = document.getElementById('sign-in-container');

    sign_in_container.style.display = 'none';
}




/*========== ADMINISTRATOR ==========*/
function showAddNewAdmin() {

    const add_new_admin_modal = document.getElementById('register-administrator-container');

    add_new_admin_modal.style.display = "flex";
}

function hideAddNewAdmin() {

    const add_new_admin_modal = document.getElementById('register-administrator-container');

    add_new_admin_modal.style.display = 'none';
}


/*========== STUDENT ==========*/
function showAddNewStudent() {

    const add_new_student_modal = document.getElementById('register-student-container');

    add_new_student_modal.style.display = "flex";

    
}

function hideAddNewStudent() {

    const add_new_student_modal = document.getElementById('register-student-container');

    add_new_student_modal.style.display = 'none';
}



document.addEventListener('DOMContentLoaded', async () => {
    const sideMenu = document.querySelector("aside");
    const profileBtn = document.querySelector("#profile-btn");
    const themeToggler = document.querySelector(".theme-toggler");

    // Profile button toggle for side menu
    profileBtn.onclick = function() {
        sideMenu.classList.toggle('active');
    }

    // Scroll event to remove side menu and add/remove header active class
    window.onscroll = () => {
        sideMenu.classList.remove('active');
        if(window.scrollY > 0) {
            document.querySelector('header').classList.add('active');
        } else {
            document.querySelector('header').classList.remove('active');
        }
    }

    // Theme toggle function
    const applySavedTheme = () => {
        const isDarkMode = localStorage.getItem('dark-theme') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
            themeToggler.querySelector('span:nth-child(1)').classList.add('active');
            themeToggler.querySelector('span:nth-child(2)').classList.remove('active');
        } else {
            document.body.classList.remove('dark-theme');
            themeToggler.querySelector('span:nth-child(1)').classList.remove('active');
            themeToggler.querySelector('span:nth-child(2)').classList.add('active');
        }
    }

    // Set the initial theme based on localStorage
    applySavedTheme();

    // Toggle theme function
    themeToggler.onclick = function() {
        // Toggle dark theme class on body
        document.body.classList.toggle('dark-theme');
        
        // Toggle active class on the theme toggler spans
        themeToggler.querySelector('span:nth-child(1)').classList.toggle('active');
        themeToggler.querySelector('span:nth-child(2)').classList.toggle('active');
        
        // Save the theme preference in localStorage
        localStorage.setItem('dark-theme', document.body.classList.contains('dark-theme'));
    }
});

