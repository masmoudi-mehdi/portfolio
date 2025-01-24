// Scroll fluide pour les liens de navigation
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animation des Progress Bars
    const animateProgressBars = () => {
        document.querySelectorAll('.skill-progress').forEach(bar => {
            const targetWidth = bar.getAttribute('data-width');
            bar.style.width = targetWidth;
        });
    };

    const skillsSection = document.getElementById('skills');
    const observerOptions = {
        root: null,
        threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateProgressBars();
                observer.unobserve(skillsSection);
            }
        });
    }, observerOptions);

    observer.observe(skillsSection);
});



// Scroll fluide pour les liens de navigation
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animation des Progress Bars
    const animateProgressBars = () => {
        document.querySelectorAll('.skill-progress').forEach(bar => {
            const targetWidth = bar.getAttribute('data-width');
            bar.style.width = targetWidth;
        });
    };

    const skillsSection = document.getElementById('skills');
    const observerOptions = {
        root: null,
        threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateProgressBars();
                observer.unobserve(skillsSection);
            }
        });
    }, observerOptions);

    observer.observe(skillsSection);
});


// Gestion de la modale
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('cv-modal');
    const downloadBtn = document.getElementById('download-cv-btn');
    const closeBtn = document.getElementById('close-modal-btn');

    // Ouvrir la modale
    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('hidden');
    });

    // Fermer la modale
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Fermer la modale en cliquant à l'extérieur
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const dropdownBtn = document.getElementById('lang-dropdown-btn');
    const dropdownMenu = document.getElementById('lang-dropdown-menu');

    // Ouvrir/fermer le menu déroulant au clic
    dropdownBtn.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });

    // Fermer le menu déroulant si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });
});