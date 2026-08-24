/**
 * Modern Portfolio Website JavaScript
 * Modular, readable, and beginner-friendly
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    const contactForm = document.getElementById('contact-form');
    const navItems = document.querySelectorAll('.nav-links a');

    // --- Mobile Navigation Menu ---
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    }

    function closeMenu() {
        if (navLinks.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    }

    // Event Listeners for Mobile Menu
    hamburger.addEventListener('click', toggleMenu);
    navItems.forEach(item => {
        item.addEventListener('click', closeMenu);
    });

    // --- Dark/Light Mode Theme Toggle ---
    function initTheme() {
        // Check if user has a saved preference, else use system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Toggle icons
        if (newTheme === 'dark') {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }

    // Initialize theme on load
    initTheme();
    // Event Listener for Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // --- Form Validation ---
    function validateEmail(email) {
        // Simple regex for email validation
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Reset previous errors
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => group.classList.remove('error'));
        document.getElementById('form-success').classList.add('hidden');
        
        let isValid = true;
        
        // Get form fields
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        
        // Validate Name
        if (nameInput.value.trim() === '') {
            nameInput.parentElement.classList.add('error');
            isValid = false;
        }
        
        // Validate Email
        if (emailInput.value.trim() === '' || !validateEmail(emailInput.value.trim())) {
            emailInput.parentElement.classList.add('error');
            isValid = false;
        }
        
        // Validate Message
        if (messageInput.value.trim() === '') {
            messageInput.parentElement.classList.add('error');
            isValid = false;
        }
        
        // If form is valid, simulate successful submission
        if (isValid) {
            console.log('Form submitted successfully:', {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                message: messageInput.value.trim()
            });
            
            // Show success message and reset form
            document.getElementById('form-success').classList.remove('hidden');
            contactForm.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                document.getElementById('form-success').classList.add('hidden');
            }, 5000);
        }
    }

    // Event Listener for Form Submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // --- Smooth Scrolling for anchor links (fallback for JS offset) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80; // Height of fixed navbar
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
