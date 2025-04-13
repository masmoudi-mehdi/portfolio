// Initialisation des particules avec des paramètres optimisés pour les performances
function initParticles() {
  // Vérifier si l'appareil est mobile ou a un écran de petite taille
  const isMobile = window.innerWidth <= 768;

  particlesJS("particles-js", {
    particles: {
      number: {
        value: isMobile ? 30 : 50,
        density: { enable: true, value_area: 800 },
      },
      color: { value: "#06b6d4" },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: false },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#06b6d4",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: isMobile ? 3 : 4, // Réduire la vitesse sur mobile
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: !isMobile, mode: "repulse" }, // Désactiver sur mobile
        onclick: { enable: true, mode: "push" },
        resize: true,
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: false, // Désactiver la détection retina pour améliorer les performances
  });
}

// Code Konami
const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let konamiIndex = 0;

document.addEventListener("keydown", (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      activateKonamiCode();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

function activateKonamiCode() {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
  container.style.zIndex = "9999";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  document.body.appendChild(container);

  const content = document.createElement("div");
  content.style.textAlign = "center";
  content.innerHTML = `
        <h1 style="color: #06b6d4; font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">
            🎮 FÉLICITATIONS! 🎮
        </h1>
        <p style="color: #ffffff; font-size: 1.2rem; margin-bottom: 2rem;">
            Vous avez découvert le code secret!
        </p>
        <div style="background: rgba(6, 182, 212, 0.1); padding: 2rem; border-radius: 1rem; border: 2px solid #06b6d4;">
            <p style="color: #ffffff; font-size: 1.1rem; margin-bottom: 1rem;">
                Voici votre code promo exclusif:
            </p>
            <h2 style="color: #06b6d4; font-size: 2rem; font-weight: bold; letter-spacing: 0.5rem;">
                KONAMI2024
            </h2>
            <p style="color: #9ca3af; font-size: 0.9rem; margin-top: 1rem;">
                -20% sur ma prochaine prestation
            </p>
        </div>
        <button id="close-konami" style="margin-top: 2rem; padding: 0.75rem 2rem; background: #06b6d4; color: white; border-radius: 0.5rem; cursor: pointer;">
            Fermer
        </button>
    `;
  container.appendChild(content);

  gsap.from(content.children, {
    scale: 0,
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "back.out(1.7)",
  });

  document.getElementById("close-konami").addEventListener("click", () => {
    gsap.to(container, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => container.remove(),
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialiser les particules avec un délai pour améliorer le temps de chargement initial
  setTimeout(() => {
    initParticles();
  }, 1000);

  // Initialisation - s'assurer que le menu est correctement configuré au chargement
  function initializeMenu() {
    const mainMenu = document.getElementById("main-menu");
    if (mainMenu) {
      if (window.innerWidth <= 768) {
        // En mode mobile, s'assurer que le menu est caché au début
        mainMenu.style.display = "none";
        // Réinitialiser l'icône du menu burger
        const menuIcon = document.querySelector("#mobile-menu-button i");
        if (menuIcon) {
          menuIcon.classList.add("fa-bars");
          menuIcon.classList.remove("fa-times");
        }
        // S'assurer que le menu a un z-index élevé
        mainMenu.style.zIndex = "9999";
        // S'assurer que le menu a un fond solide
        mainMenu.style.backgroundColor = "#111827";
      } else {
        // En mode desktop, s'assurer que le menu est visible
        mainMenu.style.display = "flex";
      }
    }
  }

  // Exécuter l'initialisation au chargement
  initializeMenu();

  // Réinitialiser le menu lors du redimensionnement de la fenêtre
  window.addEventListener("resize", initializeMenu);

  // Gestion du menu mobile
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mainMenu = document.getElementById("main-menu");
  const body = document.body;

  if (mobileMenuButton && mainMenu) {
    mobileMenuButton.addEventListener("click", () => {
      // Vérifier si le menu est actuellement visible
      const isOpen =
        mainMenu.style.display === "flex" || mainMenu.style.display === "block";

      if (isOpen) {
        // Fermer le menu
        mainMenu.style.display = "none";
      } else {
        // Ouvrir le menu
        mainMenu.style.display = "flex";
        // S'assurer que le menu est au-dessus des autres éléments
        mainMenu.style.zIndex = "9999";
      }

      // Change l'icône du menu
      const menuIcon = mobileMenuButton.querySelector("i");
      menuIcon.classList.toggle("fa-bars");
      menuIcon.classList.toggle("fa-times");

      // Empêche le défilement du body quand le menu est ouvert
      body.style.overflow = isOpen ? "auto" : "hidden";

      // Empêcher le comportement par défaut
      return false;
    });

    // Fermer le menu au clic sur un lien (sauf le bouton de langue)
    mainMenu.querySelectorAll("a:not(#lang-dropdown-btn)").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          // Fermer le menu
          mainMenu.style.display = "none";
          body.style.overflow = "auto";
          // Réinitialiser l'icône
          const menuIcon = mobileMenuButton.querySelector("i");
          menuIcon.classList.add("fa-bars");
          menuIcon.classList.remove("fa-times");
        }
      });
    });

    // Gestion spécifique du menu déroulant des langues en mobile
    const langDropdownBtn = document.getElementById("lang-dropdown-btn");
    const langDropdownMenu = document.getElementById("lang-dropdown-menu");

    if (langDropdownBtn && langDropdownMenu) {
      // S'assurer que le menu de langues reste dans le menu mobile
      langDropdownMenu.querySelectorAll("a").forEach((langLink) => {
        langLink.addEventListener("click", () => {
          if (window.innerWidth <= 768) {
            // Fermer le menu principal
            mainMenu.style.display = "none";
            body.style.overflow = "auto";
            // Réinitialiser l'icône
            const menuIcon = mobileMenuButton.querySelector("i");
            menuIcon.classList.add("fa-bars");
            menuIcon.classList.remove("fa-times");
            // Fermer aussi le menu déroulant des langues
            langDropdownMenu.style.display = "none";
          }
        });
      });
    }
  }

  // Animation des barres de compétences
  const animateProgressBars = () => {
    const progressBars = document.querySelectorAll(".skill-progress");
    progressBars.forEach((bar) => {
      // Reset width to 0 before animation
      bar.style.width = "0%";

      // Force reflow
      void bar.offsetWidth;

      // Animate to target width
      const targetWidth = bar.getAttribute("data-width");
      gsap.to(bar, {
        width: targetWidth,
        duration: 1.5,
        ease: "power2.out",
      });
    });
  };

  // Observer pour les barres de compétences
  const skillsSection = document.getElementById("skills");
  if (skillsSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateProgressBars();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(skillsSection);
  }

  // Curseur personnalisé - désactivé pour améliorer les performances
  // const cursor = document.createElement("div");
  // cursor.className = "custom-cursor";
  // document.body.appendChild(cursor);

  // document.addEventListener("mousemove", (e) => {
  //   cursor.style.left = e.clientX + "px";
  //   cursor.style.top = e.clientY + "px";
  // });

  // Ajout de l'indicateur de progression de défilement
  const createScrollProgress = () => {
    const progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";
    document.body.appendChild(progressBar);

    window.addEventListener("scroll", () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + "%";
    });
  };

  // GSAP Animations améliorées
  gsap.registerPlugin(ScrollTrigger);

  // Animation du hero avec un effet de parallaxe
  gsap.to(".hero-content", {
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
    y: 100,
    opacity: 0.8,
  });

  // Animation des cartes de compétences
  gsap.utils.toArray(".skill-card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top bottom-=100",
        end: "top center",
        scrub: 1,
        toggleActions: "play none none reverse",
      },
      y: 50,
      opacity: 0,
      rotateX: 45,
      transformOrigin: "center center",
      ease: "power2.out",
      duration: 1,
    });
  });

  // Effet de parallaxe sur les particules - optimisé pour les performances
  if (window.innerWidth > 1024) {
    // Seulement sur les grands écrans
    let ticking = false;

    window.addEventListener("mousemove", (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const mouseX = e.clientX / window.innerWidth - 0.5;
          const mouseY = e.clientY / window.innerHeight - 0.5;

          gsap.to("#particles-js", {
            duration: 1,
            x: mouseX * 30, // Réduit l'amplitude
            y: mouseY * 30,
            ease: "power2.out",
          });

          ticking = false;
        });

        ticking = true;
      }
    });
  }

  // Animation de la timeline
  gsap.utils.toArray(".timeline-item").forEach((item) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top center+=100",
        toggleActions: "play none none reverse",
      },
      x: item.classList.contains("left") ? -100 : 100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
  });

  // Menu déroulant des langues
  const dropdownBtn = document.getElementById("lang-dropdown-btn");
  const dropdownMenu = document.getElementById("lang-dropdown-menu");

  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault(); // Empêcher le comportement par défaut

      // Basculer la visibilité du menu déroulant
      if (dropdownMenu.style.display === "block") {
        dropdownMenu.style.display = "none";
      } else {
        dropdownMenu.style.display = "block";
        // S'assurer que le menu déroulant est au-dessus des autres éléments
        dropdownMenu.style.zIndex = "10000";
      }
    });

    document.addEventListener("click", (e) => {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = "none";
      }
    });

    // Assurer que le menu de langues fonctionne correctement en mode mobile
    function adjustDropdownForMobile() {
      if (window.innerWidth <= 768) {
        // En mode mobile, ajuster la position du menu déroulant
        dropdownMenu.style.position = "static";
        dropdownMenu.style.width = "100%";
        dropdownMenu.style.marginTop = "0.5rem";
        dropdownMenu.style.boxShadow = "none";
        dropdownMenu.style.backgroundColor = "#1f2937";
        dropdownMenu.style.zIndex = "10000";
        // Cacher le menu déroulant par défaut
        dropdownMenu.style.display = "none";
      } else {
        // En mode desktop, rétablir les styles par défaut
        dropdownMenu.style.position = "absolute";
        dropdownMenu.style.width = "";
        dropdownMenu.style.marginTop = "";
        dropdownMenu.style.boxShadow = "";
        dropdownMenu.style.backgroundColor = "";
        dropdownMenu.style.zIndex = "";
      }
    }

    // Appliquer les styles initiaux et écouter les changements de taille d'écran
    adjustDropdownForMobile();
    window.addEventListener("resize", adjustDropdownForMobile);
  }

  // Gestion de la modale CV
  const modal = document.getElementById("cv-modal");
  const downloadBtn = document.getElementById("download-cv-btn");
  const closeBtn = document.getElementById("close-modal-btn");

  if (modal && downloadBtn && closeBtn) {
    downloadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("hidden");
      modal.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
      }
    });
  }

  // Scroll fluide pour les liens d'ancrage
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Suppression de l'overlay de chargement
  const loadingOverlay = document.querySelector(".loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 500);
  }
  createScrollProgress();
});
