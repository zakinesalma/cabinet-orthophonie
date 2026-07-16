/* ==========================================================================
   SCRIPT JAVASCRIPT - CABINET D'ORTHOPHONIE SAFIA MASBAH
   Gestion du routage SPA, menu mobile et validation du formulaire de contact
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des icônes Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Sélection des éléments du DOM
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const appointmentForm = document.getElementById('appointment-form');
    const successOverlay = document.getElementById('success-message');
    const successNameSpan = document.getElementById('success-name');
    const navLogoLink = document.getElementById('nav-logo-link');

    // ==========================================================================
    // 1. GESTION DE LA NAVIGATION SPA
    // ==========================================================================
    window.navigateToPage = function(pageId) {
        // Mise à jour de l'état actif des liens
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Affichage dynamique de la section demandée
        sections.forEach(section => {
            if (section.id === `page-${pageId}`) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Scroll fluide vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Fermeture du menu mobile
        navMenu.classList.remove('show');
        updateMobileMenuIcon();

        // Mise à jour de l'ancre URL
        history.pushState(null, null, `#${pageId}`);
    };

    // Écouteurs de clic sur les liens
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            navigateToPage(pageId);
        });
    });

    // Clic sur le logo renvoie à l'accueil
    navLogoLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPage('accueil');
    });

    // Gestion du bouton précédent/suivant du navigateur
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['accueil', 'a-propos', 'contact'].includes(hash)) {
            navigateToPage(hash);
        } else {
            navigateToPage('accueil');
        }
    });

    // Routage initial basé sur l'ancre URL au chargement
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['accueil', 'a-propos', 'contact'].includes(initialHash)) {
        navigateToPage(initialHash);
    } else {
        navigateToPage('accueil');
    }

    // ==========================================================================
    // 2. MENU MOBILE RESPONSIVE
    // ==========================================================================
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        updateMobileMenuIcon();
    });

    function updateMobileMenuIcon() {
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('show')) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Fermeture du menu mobile en cliquant en dehors
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('show')) {
            navMenu.classList.remove('show');
            updateMobileMenuIcon();
        }
    });

    // ==========================================================================
    // 3. VALIDATION ET SOUMISSION DU FORMULAIRE
    // ==========================================================================
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isFormValid = true;

            // Règles de validation des données
            const fields = [
                { id: 'lastname', validator: val => val.trim().length > 0 },
                { id: 'firstname', validator: val => val.trim().length > 0 },
                { id: 'email', validator: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) },
                { id: 'phone', validator: val => /^[0-9\s]{10,20}$/.test(val.replace(/\s/g, '')) },
                { id: 'patient-type', validator: val => val !== '' },
                { id: 'reason', validator: val => val !== '' }
            ];

            // Validation de chaque champ
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                const formGroup = element.closest('.form-group');
                
                if (field.validator(element.value)) {
                    formGroup.classList.remove('has-error');
                } else {
                    formGroup.classList.add('has-error');
                    isFormValid = false;
                }

                // Supprimer les messages d'erreur lors de la saisie
                element.addEventListener('input', () => {
                    if (field.validator(element.value)) {
                        formGroup.classList.remove('has-error');
                    }
                });

                if (element.tagName === 'SELECT') {
                    element.addEventListener('change', () => {
                        if (field.validator(element.value)) {
                            formGroup.classList.remove('has-error');
                        }
                    });
                }
            });

            // Envoi des données si le formulaire est valide
            if (isFormValid) {
                const submitBtn = document.getElementById('submit-btn');
                const originalBtnText = submitBtn.innerHTML;
                
                // Désactiver le bouton et afficher l'état de chargement
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Envoi en cours...';
                
                const form = appointmentForm;
                const data = new FormData(form);

                fetch(form.action, {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(response => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }

                    if (response.ok) {
                        const firstnameVal = document.getElementById('firstname').value;
                        const lastnameVal = document.getElementById('lastname').value;
                        
                        successNameSpan.textContent = `${firstnameVal} ${lastnameVal}`;
                        successOverlay.classList.add('show');
                        form.reset();
                    } else {
                        alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
                    }
                }).catch(error => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                    alert("Erreur de connexion. Veuillez vérifier votre réseau internet.");
                });
            }
        });
    }

    // Fermeture du message de confirmation de succès
    window.closeSuccessMessage = function() {
        successOverlay.classList.remove('show');
        if (appointmentForm) {
            appointmentForm.reset();
        }
    };
});
