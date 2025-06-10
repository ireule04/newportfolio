document.addEventListener('DOMContentLoaded', function() {
    const docElement = document.documentElement;
    let hackerIntervals = [];
    let subtitleAnimationTimeout;
    let popupTimeouts = [];
    const cursorTrailContainer = document.querySelector('.cursor-trail-container');

    const allThemeButtons = document.querySelectorAll('.theme-switcher button');

    function applyTheme(theme) {
        docElement.className = theme;
        localStorage.setItem('portfolio_theme', theme);

        allThemeButtons.forEach(b => b.classList.remove('active-theme'));
        document.querySelectorAll(`#${theme}-theme, #${theme}-theme-mobile`).forEach(b => b.classList.add('active-theme'));
        
        clearTimeout(subtitleAnimationTimeout);
        clearInterval(subtitleAnimationTimeout);
        popupTimeouts.forEach(clearTimeout);
        popupTimeouts = [];
        document.querySelectorAll('.hacker-popup').forEach(p => p.style.display = 'none');
        document.body.removeEventListener('mousemove', magicTrailCursor);
        stopAllSounds();
        
        const h1 = document.querySelector('#home h1');
        
        if (theme === 'hacker') {
            h1.classList.add('glitch-text');
            cursorTrailContainer.innerHTML = ''; // Clear light/dark cursor
            startHackingSequence();
            spawnHackerVisuals();
            playSound('sound-hacker-theme');
        } else {
            h1.classList.remove('glitch-text');
            despawnHackerVisuals();
            startTextShuffle();
            document.body.addEventListener('mousemove', magicTrailCursor);
        }
        initTextZoom(theme);
    }

    allThemeButtons.forEach(btn => btn.addEventListener('click', function() { applyTheme(this.id.replace('-theme', '').replace('-mobile', '')); }));

    function startTextShuffle() {
        const container = document.getElementById('subtitle-container');
        container.innerHTML = ''; container.classList.remove('active');
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

    function showHackerPopup(id) {
        playSound('sound-popup-open');
        const modal = document.getElementById(id);
        if (!modal) return;
        sessionStorage.setItem(`${id.split('-')[2]}_shown`, 'true');
        modal.style.display = 'block'; modal.classList.remove('hidden');
        const lines = {
            '1': [{ el: document.getElementById('popup-1-line-1'), text: "Critical system breach detected..." }, { el: document.getElementById('popup-1-line-2'), text: "> Kernel panic initiated." }],
            '2': [{ el: document.getElementById('popup-2-line-1'), text: "System integrity compromised." }, { el: document.getElementById('popup-2-line-2'), text: "> FIREWALL_BREACHED" }]
        };
        const popupLines = lines[id.split('-')[2]];
        typeOutText(popupLines[0].el, popupLines[0].text, () => {
            if(popupLines[1]) setTimeout(() => typeOutText(popupLines[1].el, popupLines[1].text), 300);
        });
    }
    
    function typeOutText(element, text, onComplete = () => {}) { if(!element) return; let i = 0; element.innerHTML = ''; element.classList.remove('completed'); playSound('sound-typing'); function type() { if (i < text.length) { element.innerHTML += text.charAt(i++); setTimeout(type, 40); } else { stopSound('sound-typing'); element.classList.add('completed'); onComplete(); } } type(); }
    document.querySelectorAll('.popup-close-btn').forEach(btn => btn.addEventListener('click', (e) => { const modal = e.target.closest('.hacker-popup'); modal.classList.add('hidden'); setTimeout(() => { modal.style.display = 'none'; }, 300); }));
    document.getElementById('hacker-trigger')?.addEventListener('click', () => {
        if (docElement.classList.contains('hacker')) {
             if (!sessionStorage.getItem('1_shown')) popupTimeouts.push(setTimeout(() => showHackerPopup('hacker-popup-1'), 500));
             if (!sessionStorage.getItem('2_shown')) popupTimeouts.push(setTimeout(() => showHackerPopup('hacker-popup-2'), 1500));
        }
    });

    function spawnHackerVisuals() { if (hackerIntervals.length > 0) return; initHackerMatrix(); initHackerTextScroller(); }
    function despawnHackerVisuals() { hackerIntervals.forEach(clearInterval); hackerIntervals = []; const canvas = document.getElementById('hackerCanvas'); if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); }
    function initHackerMatrix() { const canvas = document.getElementById('hackerCanvas'), ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight; const chars = "01", fontSize = 14, columns = Math.ceil(canvas.width / fontSize), drops = Array(columns).fill(1).map(() => Math.random() * canvas.height), colors = ['#39ff14', '#0ff0fc', '#9457eb', '#f5f749']; function draw() { ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.font = `${fontSize}px monospace`; for (let i = 0; i < drops.length; i++) { const text = chars.charAt(Math.floor(Math.random() * chars.length)); ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]; ctx.fillText(text, i * fontSize, drops[i] * fontSize); if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0; drops[i]++; } } hackerIntervals.push(setInterval(draw, 50)); }
    function initHackerTextScroller() { const scroller = document.querySelector('.hacker-text-scroller'); if (scroller.dataset.initialized) return; scroller.dataset.initialized = 'true'; let content = "SYSTEM SCANNING... // PORT 22 OPEN // EXECUTING PAYLOAD... // DECRYPTING HASHES... // ACCESS GRANTED // "; scroller.innerHTML = content.repeat(5); let pos = 0; function animate() { pos--; if (pos <= -scroller.scrollWidth / 5) pos = 0; scroller.style.transform = `translateX(${pos}px)`; requestAnimationFrame(animate); } animate(); }
    
    function magicTrailCursor(e) {
        const trail = document.createElement('div');
        trail.className = 'trail';
        cursorTrailContainer.appendChild(trail);
        const size = Math.random() * 6 + 2;
        trail.style.width = `${size}px`;
        trail.style.height = `${size}px`;
        trail.style.left = `${e.pageX - size / 2}px`;
        trail.style.top = `${e.pageY - size / 2}px`;
        setTimeout(() => cursorTrailContainer.removeChild(trail), 500);
    }

    function playSound(id) { const sound = document.getElementById(id); if (sound) { sound.currentTime = 0; sound.volume = 0.1; sound.play().catch(e => {}); } }
    function stopSound(id) { const sound = document.getElementById(id); if(sound) sound.pause(); }
    function stopAllSounds() { document.querySelectorAll('audio').forEach(audio => audio.pause()); }

    function initTextZoom(theme) {
        document.querySelectorAll('[data-zoomable]').forEach(el => {
            if (!el.dataset.originalHtml) {
                el.dataset.originalHtml = el.innerHTML;
            }
            if(theme === 'hacker') {
                el.innerHTML = el.dataset.originalHtml;
            } else {
                const words = el.dataset.originalHtml.split(' ');
                el.innerHTML = words.map(word => 
                    `<span>${word.split('').map(char => `<span class="zoom-hover-char">${char}</span>`).join('')}</span>`
                ).join(' ');
            }
        });
    }

    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async (e) => { e.preventDefault(); const btn = document.getElementById('submit-btn'); const btnText = btn.querySelector('.btn-text'); btn.classList.add('loading'); await new Promise(res => setTimeout(res, 1500)); btn.classList.remove('loading'); btn.classList.add('success'); btnText.textContent = 'Message Sent ✔'; form.reset(); setTimeout(() => { btn.classList.remove('success'); btnText.textContent = 'Send Message'; }, 3000); });
    
    function initialize() {
        const mobileMenu = document.getElementById('mobile-menu');
        document.getElementById('mobile-menu-button').addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        document.querySelectorAll('#mobile-menu a').forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));
        window.addEventListener('scroll', () => { document.querySelectorAll('.skill-bar').forEach(bar => { const rect = bar.getBoundingClientRect(); if (rect.top <= window.innerHeight && rect.bottom >= 0 && bar.style.width === '0px') bar.style.width = bar.dataset.width; }); });
        const quoteEl = document.getElementById('random-quote'); if(quoteEl) { const quotes = ["Code is like humor. When you have to explain it, it's bad.", "First, solve the problem. Then, write the code.", "Debugging is twice as hard as writing the code."]; quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)]; }
        if (typeof particlesJS !== 'undefined') particlesJS('particles-js', { particles: { number: { value: 60, density: { enable: true, value_area: 800 } }, color: { value: "#6366F1" }, opacity: { value: 0.4, random: true }, size: { value: 2, random: true }, line_linked: { enable: true, distance: 150, color: "#6366F1", opacity: 0.2 }, move: { enable: true, speed: 1 }}, interactivity: { events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" } } } });
        applyTheme(localStorage.getItem('portfolio_theme') || 'light');
    }
    initialize();
});