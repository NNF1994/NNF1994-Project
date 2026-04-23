// Initialize Lenis Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Update GSAP with Lenis
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);


document.addEventListener("DOMContentLoaded", (event) => {
    
    // --- 0. APPLICATION FORM LOGIC (CRITICAL - MOVED TO TOP) ---
    const applyBtn = document.getElementById('start-app-btn');
    const closeBtn = document.getElementById('close-app-btn');
    const appContainer = document.getElementById('application-flow');
    const steps = document.querySelectorAll('.form-step');
    const progressFill = document.querySelector('.progress-fill');
    const totalSteps = steps.length;
    let currentStepIndex = 0;

    // Support for both modal and standalone page
    if (applyBtn && appContainer) {
        applyBtn.addEventListener('click', () => {
            appContainer.classList.remove('hidden');
            lenis.stop();
        });
    }

    const closeApp = () => {
        if (appContainer) {
            appContainer.classList.add('hidden');
            lenis.start();
        }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeApp);
    
    const finishBtn = document.getElementById('finish-btn');
    if (finishBtn) finishBtn.addEventListener('click', closeApp);

    const updateProgress = () => {
        if (!progressFill || totalSteps === 0) return;
        const percent = ((currentStepIndex + 1) / totalSteps) * 100;
        progressFill.style.width = `${percent}%`;
    };

    const goToNextStep = () => {
        if(steps.length > 0 && currentStepIndex < totalSteps - 1) {
            steps[currentStepIndex].classList.remove('active');
            currentStepIndex++;
            steps[currentStepIndex].classList.add('active');
            updateProgress();
            
            if (window.innerWidth < 768 && appContainer) {
                lenis.scrollTo(appContainer, { offset: -20 });
            }
        }
    };

    // Option buttons listeners
    document.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.target.closest('.opt-btn');
            const parentStep = button.closest('.form-step');
            if (!parentStep) return;

            parentStep.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');

            setTimeout(() => goToNextStep(), 300);
        });
    });

    // Input/Textarea listeners
    document.querySelectorAll('input, textarea').forEach(field => {
        const parentStep = field.closest('.form-step');
        if (!parentStep) return;
        const nextBtn = parentStep.querySelector('.next-btn');
        if(!nextBtn) return;

        field.addEventListener('input', () => {
            const inputs = parentStep.querySelectorAll('input[required]');
            const textarea = parentStep.querySelector('textarea');
            let isValid = true;

            if (inputs.length > 0) {
                inputs.forEach(inp => {
                    const val = inp.value.trim();
                    if (val === "") isValid = false;
                    if (inp.type === 'email' && (!val.includes('@') || !val.includes('.'))) isValid = false;
                });
            } else if (textarea) {
                if (textarea.value.trim().length <= 5) isValid = false;
            }

            if (isValid) nextBtn.removeAttribute('disabled');
            else nextBtn.setAttribute('disabled', 'true');
        });

        if(!nextBtn.dataset.navListener) {
            nextBtn.addEventListener('click', () => goToNextStep());
            nextBtn.dataset.navListener = 'true';
        }
    });

    updateProgress();

    // --- 1. HERO ANIMATIONS ---
    const heroImg = document.querySelector('.hero-img-wrapper img');
    if (heroImg) {
        gsap.to(heroImg, { scale: 1, duration: 3, ease: "power2.out" });
    }

    const glitchText = document.querySelector('.glitch');
    if(glitchText) {
        setInterval(() => {
            if(Math.random() > 0.8) {
                glitchText.style.transform = `translate(${Math.random()*4 - 2}px, ${Math.random()*4 - 2}px)`;
                glitchText.style.textShadow = `
                    ${Math.random()*5}px ${Math.random()*5}px 0px var(--red), 
                    -${Math.random()*5}px -${Math.random()*5}px 0px var(--neon-green)
                `;
                setTimeout(() => {
                    glitchText.style.transform = 'translate(0, 0)';
                    glitchText.style.textShadow = '2px 2px 0px var(--red), -2px -2px 0px var(--neon-green)';
                }, 50);
            }
        }, 1200);
    }

    // --- 2. MANIFESTO ANIMATIONS ---
    const manifestoLines = document.querySelectorAll('.manifesto-text .line');
    if (manifestoLines.length > 0 && document.querySelector('.manifesto-section')) {
        manifestoLines.forEach((line, index) => {
            gsap.fromTo(line, 
                { opacity: 0, y: 30 + (index * 20) }, 
                {
                    scrollTrigger: {
                        trigger: ".manifesto-section",
                        start: "top 80%",
                        end: "bottom top",
                        scrub: 1
                    },
                    opacity: 1,
                    y: - (index * 25),
                    ease: "none"
                }
            );
        });
    }

    // --- 2.5. WHAT WE DO SECTION ---
    if (document.querySelector('#what-we-do')) {
        gsap.from(".wwd-header, .wwd-core", {
            scrollTrigger: { trigger: "#what-we-do", start: "top 80%" },
            y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out"
        });
        gsap.to(".wwd-block", {
            scrollTrigger: { trigger: ".wwd-grid", start: "top 85%" },
            opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"
        });
    }

    // --- 3. SYSTEM SECTION — Node & Legend click routing ---
    document.querySelectorAll('.node[data-href], .legend-item[data-href]').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
            const href = el.dataset.href;
            if (href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) lenis.scrollTo(target, { offset: -80, duration: 1.2 });
            } else {
                window.location.href = href;
            }
        });
    });

    if (document.querySelector('.system-section')) {
        gsap.to(".system-visual", {
            scrollTrigger: { trigger: ".system-section", start: "top bottom", end: "bottom top", scrub: 1 },
            y: -50, ease: "none"
        });
    }

    // --- 4. PROCESS HORIZONTAL SCROLL ---
    const horizontalContainer = document.querySelector(".horizontal-track");
    const processSection = document.querySelector(".process-section");
    if (horizontalContainer && processSection) {
        gsap.to(horizontalContainer, {
            x: () => -(horizontalContainer.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: ".process-section",
                pin: true,
                pinSpacing: true,
                scrub: 1,
                start: "top top",
                end: () => "+=" + horizontalContainer.scrollWidth
            }
        });

        if (document.querySelector(".process-bg")) {
            gsap.to(".process-bg", {
                x: () => -(window.innerWidth / 2),
                ease: "none",
                scrollTrigger: { trigger: ".process-section", scrub: 1, start: "top top", end: () => "+=" + horizontalContainer.scrollWidth }
            });
        }
    }

    // --- 5. RESULTS COUNTERS ---
    const resultItems = document.querySelectorAll('.result-item');
    if (resultItems.length > 0 && document.querySelector('.results-section')) {
        gsap.from(resultItems, {
            scrollTrigger: { trigger: ".results-section", start: "top 70%" },
            y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power3.out"
        });
    }

    // --- 6. CHAOS SECTION ---
    if (document.querySelector('.chaos-section')) {
        const chaosTl = gsap.timeline({
            scrollTrigger: { trigger: ".chaos-section", start: "top 50%", end: "bottom top", toggleActions: "play none none reverse" }
        });
        chaosTl.to(".chaos-img", { opacity: 1, duration: 0.5 })
               .to(".chaos-flash", { opacity: 0.4, duration: 0.2 })
               .to(".chaos-flash", { opacity: 0, duration: 0.2 })
               .to(".chaos-img", { scale: 1.05, duration: 0.4 })
               .to(".chaos-flash", { opacity: 0.3, duration: 0.2 })
               .to(".chaos-flash", { opacity: 0, duration: 0.2 })
               .to(".chaos-img", { filter: "invert(0.2)", duration: 0.3 })
               .to(".chaos-img", { filter: "none", duration: 0.3 });
    }

    // --- 6. PERCEPTION DOMINANCE (POWER SYSTEM) ---
    const powerSvg = document.querySelector('#power-system-svg');
    if (powerSvg) {
        const powerLines = document.querySelector('.power-lines');
        const powerNodes = document.querySelector('.power-nodes');
        const powerCore = document.querySelector('.power-core');
        const nodeCount = 12;
        const centerX = 500;
        const centerY = 500;
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const distance = 200 + Math.random() * 200;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", centerX); line.setAttribute("y1", centerY);
            line.setAttribute("x2", x); line.setAttribute("y2", y);
            line.classList.add("power-line");
            powerLines.appendChild(line);
            
            const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            node.setAttribute("cx", x); node.setAttribute("cy", y);
            node.setAttribute("r", 4 + Math.random() * 4);
            node.classList.add("power-node");
            powerNodes.appendChild(node);
        }

        const powerTl = gsap.timeline({
            scrollTrigger: { trigger: "#perception-dominance", start: "top 40%", toggleActions: "play none none reverse" }
        });
        powerTl.from(powerCore, { scale: 0, opacity: 0, duration: 1.2, ease: "power4.out" })
               .from(".power-line", { attr: { x2: centerX, y2: centerY }, opacity: 0, duration: 1.5, stagger: 0.1, ease: "power2.out" }, "-=0.6")
               .from(".power-node", { scale: 0, opacity: 0, duration: 0.8, stagger: 0.05, ease: "back.out(1.7)" }, "-=1");

        gsap.to("#power-system-svg", { scale: 1.05, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }

    // --- 7. EDITORIAL SECTION PARALLAX ---
    if (document.querySelector('.editorial-section')) {
        gsap.to(".item-1", { scrollTrigger: { trigger: ".editorial-section", scrub: true }, y: -100, ease: "none" });
        gsap.to(".item-2", { scrollTrigger: { trigger: ".editorial-section", scrub: true }, y: 100, ease: "none" });
        gsap.to(".editorial-bg-words", { scrollTrigger: { trigger: ".editorial-section", scrub: true }, scale: 1.1, ease: "none" });
    }

    // --- 9. NAVBAR SCROLL ---
    ScrollTrigger.create({
        start: "top -50", end: 99999,
        toggleClass: {className: "scrolled", targets: ".saso-nav"}
    });

    // Scramble Text
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = ''; let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) { complete++; output += to; }
                else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) { char = this.randomChar(); this.queue[i].char = char; }
                    output += `<span class="d-flicker">${char}</span>`;
                } else { output += from; }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) this.resolve();
            else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
        }
        randomChar() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
    }

    document.querySelectorAll('[data-scramble]').forEach(line => {
        const scrambler = new TextScramble(line);
        const originalText = line.innerText;
        line.innerText = '';
        scrambler.setText(originalText);
    });

    const immersiveBg = document.querySelector('.fused-immersive-bg');
    if (immersiveBg) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 40;
            const y = (e.clientY / window.innerHeight - 0.5) * 40;
            gsap.to(immersiveBg, { x: x, y: y, duration: 2.5, ease: "power2.out" });
        });
    }

    // --- 10. MOBILE MENU TOGGLE ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const overlayCloseBtn = document.getElementById('overlay-close-btn');
    const overlayLinks = document.querySelectorAll('.overlay-link');

    if (mobileMenuBtn && mobileOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileOverlay.classList.add('active');
            lenis.stop();
        });

        const closeMenu = () => {
            mobileOverlay.classList.remove('active');
            lenis.start();
        };

        if (overlayCloseBtn) overlayCloseBtn.addEventListener('click', closeMenu);
        
        overlayLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
                // If it's an anchor, handle scroll
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) {
                        setTimeout(() => {
                            lenis.scrollTo(target, { offset: -80 });
                        }, 300);
                    }
                }
            });
        });
    }

    const runtimeDisplay = document.querySelector('.runtime-counter');
    if (runtimeDisplay) {
        let seconds = 0;
        setInterval(() => {
            seconds++;
            const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            runtimeDisplay.innerText = `SESSION_TIME: ${h}:${m}:${s}`;
        }, 1000);
    }
});
