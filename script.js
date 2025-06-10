document.addEventListener('DOMContentLoaded', function() {
    const docElement = document.documentElement;
    const allThemeButtons = document.querySelectorAll('.theme-switcher button');

    let hackerIntervals = [];
    let subtitleAnimationTimeout;
    let popupTimeouts = [];
    let mouseTrailListener = null;

    const popupSequence = ['hacker-popup-1', 'hacker-popup-2', 'hacker-popup-3'];
    let currentPopupIndex = 0;

    // --- HELPER FUNCTIONS FOR BACKGROUND VISUALS ---
    function createLightBubbles() {
        const container = document.querySelector('.light-bubbles');
        if (!container) return;
        container.innerHTML = '';
        const bubbleCount = 6;
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            container.appendChild(bubble);
        }
    }

    function createDarkStars(count = 100) {
        const container = document.querySelector('.dark-stars');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            if (Math.random() < 0.05) {
                star.className = 'falling-star';
                star.style.left = `${Math.random() * 150}vw`; 
                star.style.top = `${Math.random() * 100 - 50}vh`; 
                star.style.width = `${Math.random() * 150 + 100}px`; 
                star.style.animationDuration = `${Math.random() * 3 + 4}s`;
                star.style.animationDelay = `${Math.random() * 10}s`;
            } else {
                star.className = 'star';
                const size = Math.random() * 2 + 1;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.top = `${Math.random() * 100}%`;
                star.style.left = `${Math.random() * 100}%`;
                star.style.animationDuration = `${Math.random() * 3 + 2}s`;
                star.style.animationDelay = `${Math.random() * 3}s`;
            }
            container.appendChild(star);
        }
    }
    
    function clearAllVisuals() {
        clearTimeout(subtitleAnimationTimeout);
        popupTimeouts.forEach(clearTimeout);
        popupTimeouts = [];
        if(mouseTrailListener) {
            document.removeEventListener('mousemove', mouseTrailListener);
            mouseTrailListener = null;
        }
        
        const lightBubbles = document.querySelector('.light-bubbles');
        if(lightBubbles) lightBubbles.innerHTML = '';
        const darkStars = document.querySelector('.dark-stars');
        if(darkStars) darkStars.innerHTML = '';

        hackerIntervals.forEach(clearInterval);
        hackerIntervals = [];
        const canvas = document.getElementById('hackerCanvas');
        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

                
        function initHackerMatrix() { const canvas = document.getElementById('hackerCanvas'), ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight; const chars = "01", fontSize = 14, columns = Math.ceil(canvas.width / fontSize), drops = Array(columns).fill(1).map(() => Math.random() * canvas.height), colors = ['#39ff14', '#0ff0fc', '#9457eb', '#f5f749']; function draw() { ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.font = `${fontSize}px monospace`; for (let i = 0; i < drops.length; i++) { const text = chars.charAt(Math.floor(Math.random() * chars.length)); ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]; ctx.fillText(text, i * fontSize, drops[i] * fontSize); if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0; drops[i]++; } } hackerIntervals.push(setInterval(draw, 50)); }
        function initHackerTextScroller() { const scroller = document.querySelector('.hacker-text-scroller'); if (scroller.dataset.initialized) return; scroller.dataset.initialized = 'true'; let content = "SYSTEM SCANNING... // PORT 22 OPEN // EXECUTING PAYLOAD... // DECRYPTING HASHES... // ACCESS GRANTED // "; scroller.innerHTML = content.repeat(5); let pos = 0; function animate() { pos--; if (pos <= -scroller.scrollWidth / 5) pos = 0; scroller.style.transform = `translateX(${pos}px)`; requestAnimationFrame(animate); } animate(); }

        
        document.querySelectorAll('.hacker-popup').forEach(p => p.classList.add('hidden'));
        const h1 = document.querySelector('#home h1');
        if(h1) h1.classList.remove('glitch-text');
    }

    // --- THEME MANAGEMENT ---
    function applyTheme(theme) {
        clearAllVisuals();
        
        docElement.className = theme;
        localStorage.setItem('portfolio_theme', theme);

        allThemeButtons.forEach(b => b.classList.remove('active-theme'));
        document.querySelectorAll(`#${theme}-theme, #${theme}-theme-mobile`).forEach(b => b.classList.add('active-theme'));
        
        const h1 = document.querySelector('#home h1');
        
        if (theme === 'hacker') {
            h1.classList.add('glitch-text');
            startHackingSequence();
            spawnHackerVisuals();
            currentPopupIndex = 0; 
            popupTimeouts.push(setTimeout(() => showHackerPopup(popupSequence[currentPopupIndex]), 4000));
        } else {
            startTextShuffle();
            if (theme === 'light') {
                createLightBubbles();
            } else if (theme === 'dark') {
                createDarkStars(100);
            }
            
            mouseTrailListener = (e) => {
                const sparkle = document.createElement('div');
                sparkle.className = 'cursor-sparkle';
                document.body.appendChild(sparkle);
                sparkle.style.left = `${e.pageX}px`;
                sparkle.style.top = `${e.pageY}px`;
                setTimeout(() => sparkle.remove(), 800);
            };
            document.addEventListener('mousemove', mouseTrailListener);
        }
    }

    // --- SUBTITLE ANIMATIONS ---
    function startTextShuffle() {
        const container = document.getElementById('subtitle-container');
        if (!container) return;
        container.innerHTML = '';
        "I'm a Developer".split('').forEach(char => {
            const letter = document.createElement('span');
            letter.className = 'letter-shuffle';
            letter.textContent = char === ' ' ? '\u00A0' : char;
            letter.style.setProperty('--x', `${Math.random() * 100 - 50}px`);
            letter.style.setProperty('--y', `${Math.random() * 60 - 30}px`);
            letter.style.setProperty('--r', `${Math.random() * 360}deg`);
            container.appendChild(letter);
        });
        subtitleAnimationTimeout = setTimeout(() => { container.classList.add('active'); }, 100);
    }
    
    async function startHackingSequence() {
        const container = document.getElementById('subtitle-container');
        if (!container) return;
        container.classList.remove('active');
        const phrases = ['[INITIALIZING...]', '[AUTH_REQUEST_DENIED]', '[OVERRIDING_SECURITY...]', '[ACCESS_GRANTED]'];
        const chars = "!<>-_\\/[]{}—=+*^?#";

        async function scrambleText(text) {
            let currentText = '';
            for (let i = 0; i < text.length; i++) {
                if (!docElement.classList.contains('hacker')) return;
                for (let j = 0; j < 3; j++) {
                    container.textContent = currentText + chars[Math.floor(Math.random() * chars.length)];
                    await new Promise(resolve => setTimeout(resolve, 20));
                }
                currentText += text[i];
                container.textContent = currentText;
            }
        }
        
        let i = 0;
        while (docElement.classList.contains('hacker')) {
            await scrambleText(phrases[i]);
            await new Promise(resolve => setTimeout(resolve, 1500));
            i = (i + 1) % phrases.length;
        }
    }

    // --- HACKER THEME VISUALS & POPUP ---
    function showHackerPopup(id) {
        const modal = document.getElementById(id);
        if (!modal || !docElement.classList.contains('hacker')) return;
        modal.classList.remove('hidden');

        const lines = {
            'popup-1': [{ el: document.getElementById('popup-1-line-1'), text: "[CRITICAL] KERNEL_PANIC - Memory Heap Corruption at 0x7FFF9A4E" }, { el: document.getElementById('popup-1-line-2'), text: "> Dumping core... System halt imminent." }],
            'popup-2': [{ el: document.getElementById('popup-2-line-1'), text: "Attempting to patch remote firewall vulnerability..." }, { el: document.getElementById('popup-2-line-2'), text: "> Rule `deny all` on port 8080 applied." }],
            'popup-3': [{ el: document.getElementById('popup-3-line-1'), text: "Initializing data stream... Encrypting packet 1 of 4096." }, { el: document.getElementById('popup-3-line-2'), text: "> Transfer progress: [████..........] 32%" }]
        };
        
        const popupKey = id.split('-').slice(1).join('-');
        const popupLines = lines[popupKey];
        if (!popupLines) return;

        typeOutText(popupLines[0].el, popupLines[0].text, () => {
            if(popupLines[1]) setTimeout(() => typeOutText(popupLines[1].el, popupLines[1].text), 300);
        });
    }

    function typeOutText(element, text, onComplete = () => {}) {
        if (!element) return;
        let i = 0;
        element.innerHTML = '';
        element.classList.remove('completed');
        function type() {
            if (i < text.length && docElement.classList.contains('hacker')) {
                element.innerHTML += text.charAt(i++);
                setTimeout(type, 40);
            } else if (i >= text.length) {
                element.classList.add('completed');
                onComplete();
            }
        }
        type();
    }
    
    function spawnHackerVisuals() {
        if (hackerIntervals.length > 0) return;
        initHackerMatrix();
        initHackerTextScroller();
        mouseTrailListener = (e) => {
            const trail = document.createElement('div');
            trail.className = 'binary-trail';
            trail.textContent = Math.random() > 0.5 ? '1' : '0';
            document.body.appendChild(trail);
            trail.style.left = `${e.pageX}px`;
            trail.style.top = `${e.pageY}px`;
            setTimeout(() => trail.remove(), 1000);
        };
        document.addEventListener('mousemove', mouseTrailListener);
    }
    
    function initHackerMatrix() {
        const canvas = document.getElementById('hackerCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        canvas.style.pointerEvents = 'none';

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const chars = "01", fontSize = 14;
        const columns = Math.ceil(canvas.width / fontSize);
        const drops = Array(columns).fill(1).map(() => Math.random() * canvas.height);
        const colors = ['#39ff14', '#00ff00', '#33ff33'];

    

        
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        hackerIntervals.push(setInterval(draw, 40));
    }

    function initHackerTextScroller() {
        const scroller = document.getElementById('hacker-text-scroller');
        if (!scroller) return;
        let position = 0;
        const text = '>> Welcome to the Hacker Theme << ';
        function scroll() {
            if (!scroller) return;
            scroller.textContent = text.substring(position) + text.substring(0, position);
            position = (position + 1) % text.length;
        }
        hackerIntervals.push(setInterval(scroll, 200));
    }

    // --- POPUP CLOSE BUTTON HANDLER ---
    function setupPopupCloseButtons() {
        // *** FIX 2: Correct the selector from '.popup-close' to '.popup-close-btn' ***
        document.querySelectorAll('.popup-close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const popup = e.target.closest('.hacker-popup');
                if (popup) {
                    popup.classList.add('hidden');
                    if (docElement.classList.contains('hacker')) {
                        currentPopupIndex++;
                        if (currentPopupIndex < popupSequence.length) {
                            popupTimeouts.push(setTimeout(() => showHackerPopup(popupSequence[currentPopupIndex]), 500));
                        }
                    }
                }
            });
        });
    }

    // --- THEME BUTTONS EVENT LISTENERS ---
    function setupThemeButtons() {
        allThemeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.id.split('-')[0];
                if (theme === 'hacker' || theme === 'light' || theme === 'dark') {
                    applyTheme(theme);
                }
            });
        });
    }


// lastly added for scrolling texts

    function despawnHackerVisuals() {
            hackerIntervals.forEach(clearInterval); hackerIntervals = [];
            const canvas = document.getElementById('hackerCanvas');
            if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }
        
        function initHackerMatrix() { const canvas = document.getElementById('hackerCanvas'), ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight; const chars = "01", fontSize = 14, columns = Math.ceil(canvas.width / fontSize), drops = Array(columns).fill(1).map(() => Math.random() * canvas.height), colors = ['#39ff14', '#0ff0fc', '#9457eb', '#f5f749']; function draw() { ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.font = `${fontSize}px monospace`; for (let i = 0; i < drops.length; i++) { const text = chars.charAt(Math.floor(Math.random() * chars.length)); ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]; ctx.fillText(text, i * fontSize, drops[i] * fontSize); if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0; drops[i]++; } } hackerIntervals.push(setInterval(draw, 50)); }
        function initHackerTextScroller() { const scroller = document.querySelector('.hacker-text-scroller'); if (scroller.dataset.initialized) return; scroller.dataset.initialized = 'true'; let content = "SYSTEM SCANNING... // PORT 22 OPEN // EXECUTING PAYLOAD... // DECRYPTING HASHES... // ACCESS GRANTED // "; scroller.innerHTML = content.repeat(5); let pos = 0; function animate() { pos--; if (pos <= -scroller.scrollWidth / 5) pos = 0; scroller.style.transform = `translateX(${pos}px)`; requestAnimationFrame(animate); } animate(); }



    // --- INITIALIZATION ---
    function initialize() {
        setupThemeButtons();
        setupPopupCloseButtons();
        const savedTheme = localStorage.getItem('portfolio_theme') || 'light';
        applyTheme(savedTheme);
    }

    initialize();

    window.addEventListener('resize', () => {
        if (docElement.classList.contains('hacker')) {
            const canvas = document.getElementById('hackerCanvas');
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        }
    });
});