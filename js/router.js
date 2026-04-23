export const Router = {
  init() {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.dataset.target;

        // Only switch if we aren't already on that section
        if (!document.getElementById(target).classList.contains("active")) {
          this.switchSection(target);
          window.location.hash = link.getAttribute("href");
        }
      });
    });

    // Handle initial page load
    if (window.location.hash) {
      const initialLink = document.querySelector(
        `.nav-link[href="${window.location.hash}"]`,
      );
      if (initialLink) {
        this.switchSection(initialLink.dataset.target);
      }
    } else {
      // Default to search if no hash
      this.switchSection("searchSection");
    }

    // --- Mobile Menu Toggle ---
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileNav = document.getElementById("mobileNav");

    if (hamburgerBtn && mobileNav) {
      hamburgerBtn.addEventListener("click", () => {
        hamburgerBtn.classList.toggle("active");
        mobileNav.classList.toggle("active");
      });
    }

    // Close mobile menu when a link is clicked
    const mobileLinks = mobileNav ? mobileNav.querySelectorAll(".nav-link") : [];
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (hamburgerBtn) hamburgerBtn.classList.remove("active");
        if (mobileNav) mobileNav.classList.remove("active");
      });
    });
  },

  switchSection(targetId) {
    const sections = document.querySelectorAll(".spa-section");
    const navLinks = document.querySelectorAll(".nav-link");

    // 1. Handle Section Transitions
    sections.forEach((sec) => {
      sec.classList.remove("active");
      // Adding a small delay or using display hidden ensures the CSS transition triggers
      setTimeout(() => {
        if (!sec.classList.contains("active")) {
          sec.classList.add("hidden");
        }
      }, 10);
    });

    const targetSec = document.getElementById(targetId);
    if (targetSec) {
      targetSec.classList.remove("hidden");
      // Force a reflow to ensure the 'active' animation triggers
      void targetSec.offsetWidth;
      targetSec.classList.add("active");
    }

    // 2. Trigger Nav Link Animation
    // This ensures the underline/glow moves to the correct word
    navLinks.forEach((link) => {
      if (link.dataset.target === targetId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // 3. Functional Triggers
    if (targetId === "inventorySection" && window.InventoryModule) {
      window.InventoryModule.loadTable();
    }
  },
};
