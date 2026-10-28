const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Initialisation des particules avec des paramètres optimisés pour les performances
function initParticles() {
  if (reduceMotion || typeof particlesJS === "undefined") return;

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
                KONAMI2026
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
        const menuButton = document.getElementById("mobile-menu-button");
        if (menuButton) menuButton.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "auto";
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

  // Fonction pour ajuster la timeline en fonction de la taille de l'écran
  function adjustTimelineForScreenSize() {
    const timelineItems = document.querySelectorAll(".timeline-item");
    const timelineContainer = document.querySelector(".timeline-container");
    const isMobile = window.innerWidth <= 768;
    const isExtraSmall = window.innerWidth <= 480;

    // Ajuster le conteneur de la timeline
    if (timelineContainer) {
      if (isMobile) {
        // Ajouter un style personnalisé pour positionner la ligne verticale
        timelineContainer.style.position = "relative";

        // Créer ou mettre à jour la ligne verticale
        let timelineLine = timelineContainer.querySelector(".timeline-line");
        if (!timelineLine) {
          timelineLine = document.createElement("div");
          timelineLine.className = "timeline-line";
          timelineContainer.appendChild(timelineLine);
        }

        // Positionner la ligne verticale
        timelineLine.style.position = "absolute";
        timelineLine.style.top = "0";
        timelineLine.style.bottom = "0";
        timelineLine.style.width = "2px";
        timelineLine.style.backgroundColor = "#06b6d4"; // Couleur primaire
        timelineLine.style.left = isExtraSmall ? "20px" : "30px";
      } else {
        // Supprimer la ligne verticale personnalisée si elle existe
        const timelineLine = timelineContainer.querySelector(".timeline-line");
        if (timelineLine) {
          timelineLine.remove();
        }

        // Réinitialiser les styles pour le desktop
        timelineContainer.style.position = "relative";
      }
    }

    // Ajuster les éléments de la timeline
    timelineItems.forEach((item) => {
      // Ajuster le style en fonction de la taille de l'écran
      if (isMobile) {
        item.style.width = "100%";
        item.style.left = "0";
        item.style.textAlign = "left";
        item.style.paddingLeft = isExtraSmall ? "45px" : "60px";
        item.style.paddingRight = isExtraSmall ? "10px" : "15px";
        item.style.position = "relative";

        // Ajouter l'année comme étiquette
        const year = item.getAttribute("data-year");
        if (year) {
          // Créer ou mettre à jour l'étiquette d'année
          let yearLabel = item.querySelector(".year-label");
          if (!yearLabel) {
            yearLabel = document.createElement("div");
            yearLabel.className = "year-label";
            item.appendChild(yearLabel);
          }

          // Styler l'étiquette d'année
          yearLabel.textContent = year;
          yearLabel.style.position = "absolute";
          yearLabel.style.left = "0";
          yearLabel.style.top = "0";
          yearLabel.style.backgroundColor = "#06b6d4";
          yearLabel.style.color = "white";
          yearLabel.style.padding = isExtraSmall
            ? "0.2rem 0.4rem"
            : "0.25rem 0.5rem";
          yearLabel.style.borderRadius = "4px";
          yearLabel.style.fontSize = isExtraSmall ? "0.7rem" : "0.8rem";
          yearLabel.style.transform = "translateY(-50%)";
          yearLabel.style.whiteSpace = "nowrap";
        }
      } else {
        // Réinitialiser les styles pour le desktop
        item.style.width = "";
        item.style.left = "";
        item.style.textAlign = "";
        item.style.paddingLeft = "";
        item.style.paddingRight = "";

        // Supprimer l'étiquette d'année si elle existe
        const yearLabel = item.querySelector(".year-label");
        if (yearLabel) {
          yearLabel.remove();
        }
      }
    });
  }

  // Exécuter l'ajustement au chargement
  adjustTimelineForScreenSize();

  // Réajuster la timeline lors du redimensionnement
  window.addEventListener("resize", adjustTimelineForScreenSize);

  // Gestion du menu mobile
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mainMenu = document.getElementById("main-menu");
  const body = document.body;
  const langDropdownBtn = document.getElementById("lang-dropdown-btn");
  const langDropdownMenu = document.getElementById("lang-dropdown-menu");

  const isMenuOpen = () =>
    mainMenu.style.display === "flex" || mainMenu.style.display === "block";

  function setMenuOpen(open) {
    mainMenu.style.display = open ? "flex" : "none";
    if (open) {
      // S'assurer que le menu est au-dessus des autres éléments
      mainMenu.style.zIndex = "9999";
    }
    // Change l'icône du menu
    const menuIcon = mobileMenuButton.querySelector("i");
    menuIcon.classList.toggle("fa-bars", !open);
    menuIcon.classList.toggle("fa-times", open);
    mobileMenuButton.setAttribute("aria-expanded", String(open));
    // Empêche le défilement du body quand le menu est ouvert
    body.style.overflow = open ? "hidden" : "auto";
  }

  function setLangOpen(open) {
    if (!langDropdownBtn || !langDropdownMenu) return;
    langDropdownMenu.style.display = open ? "block" : "none";
    if (open) {
      // S'assurer que le menu déroulant est au-dessus des autres éléments
      langDropdownMenu.style.zIndex = "10000";
    }
    langDropdownBtn.setAttribute("aria-expanded", String(open));
  }

  if (mobileMenuButton && mainMenu) {
    mobileMenuButton.addEventListener("click", () => {
      setMenuOpen(!isMenuOpen());
    });

    // Fermer le menu au clic sur un lien (sauf le bouton de langue)
    mainMenu.querySelectorAll("a:not(#lang-dropdown-btn)").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          setMenuOpen(false);
        }
      });
    });

    // Gestion spécifique du menu déroulant des langues en mobile
    if (langDropdownMenu) {
      langDropdownMenu.querySelectorAll("a").forEach((langLink) => {
        langLink.addEventListener("click", () => {
          if (window.innerWidth <= 768) {
            setMenuOpen(false);
            setLangOpen(false);
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
      if (reduceMotion) {
        bar.style.width = targetWidth;
        return;
      }
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

  // Animation des cartes de compétences
  gsap.utils.toArray(reduceMotion ? [] : ".skill-card").forEach((card, i) => {
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
  if (window.innerWidth > 1024 && !reduceMotion) {
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
    if (reduceMotion) return;
    // Ajouter l'attribut data-year comme contenu avant l'élément sur mobile
    const year = item.getAttribute("data-year");
    if (year && window.innerWidth <= 768) {
      item.style.position = "relative";
    }

    // Animation différente selon la taille de l'écran
    if (window.innerWidth <= 768) {
      // Animation pour mobile - fade in from bottom
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: "top center+=100",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    } else {
      // Animation pour desktop - slide in from sides
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
    }
  });

  // Menu déroulant des langues
  const dropdownBtn = langDropdownBtn;
  const dropdownMenu = langDropdownMenu;

  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault(); // Empêcher le comportement par défaut

      // Basculer la visibilité du menu déroulant
      setLangOpen(dropdownMenu.style.display !== "block");
    });

    document.addEventListener("click", (e) => {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        setLangOpen(false);
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

  function setModalOpen(open) {
    modal.classList.toggle("hidden", !open);
    modal.style.display = open ? "block" : "none";
    if (open) {
      modal.querySelector("a").focus();
    } else {
      downloadBtn.focus();
    }
  }

  if (modal && downloadBtn && closeBtn) {
    downloadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setModalOpen(true);
    });

    closeBtn.addEventListener("click", () => setModalOpen(false));

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        setModalOpen(false);
      }
    });
  }

  // Échap ferme la modale CV, le menu de langue puis le menu mobile
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modal && modal.style.display === "block") {
      setModalOpen(false);
    } else if (langDropdownMenu && langDropdownMenu.style.display === "block") {
      setLangOpen(false);
      langDropdownBtn.focus();
    } else if (mobileMenuButton && mainMenu && isMenuOpen() && window.innerWidth <= 768) {
      setMenuOpen(false);
      mobileMenuButton.focus();
    }
  });

  // Scroll fluide pour les liens d'ancrage
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      // href="#" (CV button, current-page link) has no target to scroll to
      if (targetId === "#") return;
      e.preventDefault();
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: reduceMotion ? "auto" : "smooth",
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
