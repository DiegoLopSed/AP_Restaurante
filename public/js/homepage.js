// ========================================
// Gestión del Header y Scroll
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const headerButtons = document.querySelector('.header-buttons');
    const menuOverlay = document.getElementById('menu-overlay');
    const heroSection = document.querySelector('.hero');

    // Función para manejar el scroll y cambiar el header
    function handleScroll() {
        if (!heroSection) return;
        
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollPosition >= heroBottom) {
            // Fuera de la sección hero, agregar fondo negro
            header.classList.add('scrolled');
        } else {
            // Dentro de la sección hero, mantener transparente
            header.classList.remove('scrolled');
        }
    }

    // Event listener para el scroll
    window.addEventListener('scroll', handleScroll);
    
    // Verificar posición inicial
    handleScroll();

    // ========================================
    // Menú Hamburguesa para Móvil
    // ========================================

    if (menuToggle && navMenu) {
        function openMenu() {
            menuToggle.classList.add('active');
            navMenu.classList.add('active');
            if (menuOverlay) {
                menuOverlay.classList.add('active');
            }
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        }

        function closeMenu() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            if (menuOverlay) {
                menuOverlay.classList.remove('active');
            }
            document.body.style.overflow = ''; // Restaurar scroll del body
        }

        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (navMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Cerrar menú al hacer clic en el overlay
        if (menuOverlay) {
            menuOverlay.addEventListener('click', closeMenu);
        }

        // Cerrar menú al hacer clic en un enlace
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });

        // Cerrar menú al hacer clic en los botones
        if (headerButtons) {
            const buttons = headerButtons.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        closeMenu();
                    }
                });
            });
        }

        // Cerrar menú al redimensionar la ventana (si cambia a desktop)
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }
});

