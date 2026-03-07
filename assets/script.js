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

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70, // Adjust for header height
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Custom Carousel Functionality
        class Carousel {
            constructor(element) {
                this.carousel = element;
                this.inner = element.querySelector('.carousel-inner');
                this.items = element.querySelectorAll('.carousel-item');
                this.prevBtn = element.querySelector('.carousel-control.prev');
                this.nextBtn = element.querySelector('.carousel-control.next');
                this.indicators = element.querySelectorAll('.carousel-indicator');
                this.currentIndex = 0;
                this.itemCount = this.items.length;
                
                this.init();
            }
            
            init() {
                // Set up event listeners
                this.prevBtn.addEventListener('click', () => this.prev());
                this.nextBtn.addEventListener('click', () => this.next());
                
                // Set up indicator clicks
                this.indicators.forEach((indicator, index) => {
                    indicator.addEventListener('click', () => this.goTo(index));
                });
                
                // Auto-advance every 5 seconds
                this.autoPlayInterval = setInterval(() => this.next(), 5000);
                
                // Pause auto-advance on hover
                this.carousel.addEventListener('mouseenter', () => {
                    clearInterval(this.autoPlayInterval);
                });
                
                this.carousel.addEventListener('mouseleave', () => {
                    this.autoPlayInterval = setInterval(() => this.next(), 5000);
                });
            }
            
            goTo(index) {
                this.currentIndex = index;
                this.updateCarousel();
            }
            
            prev() {
                this.currentIndex = (this.currentIndex - 1 + this.itemCount) % this.itemCount;
                this.updateCarousel();
            }
            
            next() {
                this.currentIndex = (this.currentIndex + 1) % this.itemCount;
                this.updateCarousel();
            }
            
            updateCarousel() {
                // Update transform to show current slide
                this.inner.style.transform = `translateX(-${this.currentIndex * 100}%)`;
                
                // Update active indicator
                this.indicators.forEach((indicator, index) => {
                    if (index === this.currentIndex) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
            }
        }
        
        // Initialize all carousels on the page
        document.addEventListener('DOMContentLoaded', function() {
            const carousels = document.querySelectorAll('.carousel');
            carousels.forEach(carousel => {
                new Carousel(carousel);
            });
            ensureProjectsGrid();
            equalizeProjectCardHeights();
        });

        // Re-run on resize and after images load
        window.addEventListener('resize', equalizeProjectCardHeights);
        window.addEventListener('load', equalizeProjectCardHeights);