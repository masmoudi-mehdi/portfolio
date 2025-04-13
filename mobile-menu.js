// Script pour le menu mobile
document.addEventListener("DOMContentLoaded", function() {
  // Éléments du menu
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mainMenu = document.getElementById("main-menu");
  const body = document.body;
  
  // Vérifier si les éléments existent
  if (mobileMenuButton && mainMenu) {
    // Fonction pour ouvrir/fermer le menu
    mobileMenuButton.addEventListener("click", function() {
      const isOpen = mainMenu.classList.contains("flex");
      mainMenu.classList.toggle("hidden");
      mainMenu.classList.toggle("flex");
      
      // Changer l'icône du menu
      const menuIcon = mobileMenuButton.querySelector("i");
      if (menuIcon) {
        menuIcon.classList.toggle("fa-bars");
        menuIcon.classList.toggle("fa-times");
      }
      
      // Empêcher le défilement du body quand le menu est ouvert
      body.style.overflow = isOpen ? "auto" : "hidden";
    });
    
    // Fermer le menu au clic sur un lien (sauf le bouton de langue)
    mainMenu.querySelectorAll("a:not(#lang-dropdown-btn)").forEach(function(link) {
      link.addEventListener("click", function() {
        if (window.innerWidth <= 768) {
          mainMenu.classList.add("hidden");
          mainMenu.classList.remove("flex");
          body.style.overflow = "auto";
          
          // Réinitialiser l'icône
          const menuIcon = mobileMenuButton.querySelector("i");
          if (menuIcon) {
            menuIcon.classList.add("fa-bars");
            menuIcon.classList.remove("fa-times");
          }
        }
      });
    });
  }
  
  // Gestion du menu déroulant des langues
  const langDropdownBtn = document.getElementById("lang-dropdown-btn");
  const langDropdownMenu = document.getElementById("lang-dropdown-menu");
  
  if (langDropdownBtn && langDropdownMenu) {
    langDropdownBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      langDropdownMenu.classList.toggle("hidden");
    });
    
    document.addEventListener("click", function(e) {
      if (!langDropdownBtn.contains(e.target) && !langDropdownMenu.contains(e.target)) {
        langDropdownMenu.classList.add("hidden");
      }
    });
  }
});
