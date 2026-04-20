// Navigation - Handle section switching
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.spa-section');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');

    // Handle section switching for both desktop and mobile nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section ID from data-target attribute
            const targetId = this.getAttribute('data-target');
            
            // Remove active class from all nav links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Remove active class from all sections
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked nav link (all occurrences)
            document.querySelectorAll(`[data-target="${targetId}"]`).forEach(el => {
                el.classList.add('active');
            });
            
            // Add active class to target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Close mobile menu after navigation
            if (mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                hamburgerBtn.classList.remove('active');
            }
        });
    });

    // Hamburger menu toggle
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function() {
            hamburgerBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileNav && mobileNav.classList.contains('active') && 
            !mobileNav.contains(e.target) && 
            !hamburgerBtn.contains(e.target)) {
            mobileNav.classList.remove('active');
            hamburgerBtn.classList.remove('active');
        }
    });
});

