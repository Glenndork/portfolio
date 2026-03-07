// Mobile menu toggle
document.getElementById('menu-toggle').addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when clicking a link
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.add('hidden');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Carousel functionality using Tailwind
document.addEventListener('DOMContentLoaded', function() {
    const carousels = {
        'bastion': { currentIndex: 0 },
        'nio': { currentIndex: 0 }
    };

    Object.keys(carousels).forEach(carouselName => {
        const carousel = document.getElementById(`${carouselName}-carousel`);
        if (!carousel) return;

        const inner = carousel.querySelector('.flex');
        const images = carousel.querySelectorAll('img');
        const totalSlides = images.length;
        const indicators = carousel.querySelectorAll('.carousel-indicator');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');

        function updateCarousel(index) {
            carousels[carouselName].currentIndex = (index + totalSlides) % totalSlides;
            const offset = carousels[carouselName].currentIndex * 100;
            inner.style.transform = `translateX(-${offset}%)`;

            // Update indicators
            indicators.forEach((indicator, i) => {
                if (i === carousels[carouselName].currentIndex) {
                    indicator.classList.add('bg-white');
                    indicator.classList.remove('bg-white/50');
                } else {
                    indicator.classList.add('bg-white/50');
                    indicator.classList.remove('bg-white');
                }
            });
        }

        // Set up button handlers
        prevBtn.addEventListener('click', () => {
            updateCarousel(carousels[carouselName].currentIndex - 1);
        });

        nextBtn.addEventListener('click', () => {
            updateCarousel(carousels[carouselName].currentIndex + 1);
        });

        // Set up indicator handlers
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                updateCarousel(index);
            });
        });

        // Initialize first carousel state
        updateCarousel(0);

        // Auto-advance every 5 seconds
        setInterval(() => {
            updateCarousel(carousels[carouselName].currentIndex + 1);
        }, 5000);
    });
});