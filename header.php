<?php
// header.php
?>
<header class="app-header">
    <div class="header-container">
        <div class="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="6" fill="#137466"/>
                <path d="M12 7V17M7 12H17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Dawaya</span>
        </div>
        
        <nav class="main-nav">
            <a href="#search" class="nav-link active" data-target="searchSection">Search</a>
            <a href="#inventory" class="nav-link" data-target="inventorySection">Inventory</a>
            <a href="#uploads" class="nav-link" data-target="uploadsSection">Uploads</a>
        </nav>

        <button class="hamburger-menu" id="hamburgerBtn">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <div class="user-profile">
            <img src="https://ui-avatars.com/api/?name=IS&background=2c3e50&color=fff" alt="User Profile" class="avatar">
        </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <nav class="mobile-nav" id="mobileNav">
        <a href="#search" class="nav-link active" data-target="searchSection">Search</a>
        <a href="#inventory" class="nav-link" data-target="inventorySection">Inventory</a>
        <a href="#uploads" class="nav-link" data-target="uploadsSection">Uploads</a>
    </nav>
</header>