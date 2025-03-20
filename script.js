// Initialisation des particules
particlesJS("particles-js", {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
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
      speed: 6,
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
      onhover: { enable: true, mode: "repulse" },
      onclick: { enable: true, mode: "push" },
      resize: true,
    },
    modes: {
      repulse: { distance: 100, duration: 0.4 },
      push: { particles_nb: 4 },
    },
  },
  retina_detect: true,
});

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
  // Gestion du menu mobile
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mainMenu = document.getElementById("main-menu");
  const body = document.body;

  if (mobileMenuButton && mainMenu) {
    mobileMenuButton.addEventListener("click", () => {
      const isOpen = mainMenu.classList.contains("flex");
      mainMenu.classList.toggle("hidden");
      mainMenu.classList.toggle("flex");
      // Change l'icône du menu
      const menuIcon = mobileMenuButton.querySelector("i");
      menuIcon.classList.toggle("fa-bars");
      menuIcon.classList.toggle("fa-times");
      // Empêche le défilement du body quand le menu est ouvert
      body.style.overflow = isOpen ? "auto" : "hidden";
    });

    // Fermer le menu au clic sur un lien
    mainMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainMenu.classList.add("hidden");
        mainMenu.classList.remove("flex");
        body.style.overflow = "auto";
        // Réinitialiser l'icône
        const menuIcon = mobileMenuButton.querySelector("i");
        menuIcon.classList.add("fa-bars");
        menuIcon.classList.remove("fa-times");
      });
    });
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

  // Curseur personnalisé
  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  document.body.appendChild(cursor);

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

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

  // Effet de parallaxe sur les particules
  if (window.innerWidth > 768) {
    window.addEventListener("mousemove", (e) => {
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;

      gsap.to("#particles-js", {
        duration: 1,
        x: mouseX * 50,
        y: mouseY * 50,
        ease: "power2.out",
      });
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
      dropdownMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.add("hidden");
      }
    });
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
