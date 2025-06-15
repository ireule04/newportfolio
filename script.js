(function() {
    'use strict';

    // --- State Management ---
    const state = {
        currentTheme: 'light',
        isMuted: false,
        audioUnlocked: false,
        activeThemeSound: null,
        effectIntervals: [],
        popupQueue: ['hacker-popup-1', 'hacker-popup-2', 'hacker-popup-3'],
        currentPopupIndex: 0,
        animationFrameId: null
    };

    // --- DOM Element References ---
    const elements = {
        doc: document.documentElement,
        themeButtons: document.querySelectorAll('.theme-switcher button'),
        audioControls: document.getElementById('audio-controls'),
        muteButton: document.getElementById('mute-button'),
        hackerVolume: document.querySelector('#hacker-volume-slider input'),
        darkVolume: document.querySelector('#dark-volume-slider input'),
        scrollIndicator: document.getElementById('scroll-indicator'),
        matrixCanvas: document.getElementById('matrixCanvas'),
        rainCanvas: document.getElementById('rainCanvas'),
        lightning: document.getElementById('lightning'),
        sounds: {



    
    glitch: document.getElementById('glitch-sound'),
    glitchy: document.getElementById('glitchy-sound'),
    rain: document.getElementById('rain-sound'),



            
        }
    };

    // --- Defensive Programming: Prevent JS crashes ---
    function robustQuery(selector, callback) {
        const element = document.querySelector(selector);
        if (element) callback(element);
    }
    
    function robustQueryAll(selector, callback) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) callback(elements);
    }

    // --- Core Audio Management ---
    function unlockAudio() {
        if (state.audioUnlocked) return;
        state.audioUnlocked = true;
        Object.values(elements.sounds).forEach(sound => {
            if (sound && sound.paused) {
                const promise = sound.play();
                if (promise !== undefined) {
                    promise.then(() => sound.pause()).catch(() => {});
                }
            }
        });
        if (state.activeThemeSound && !state.isMuted) {
            state.activeThemeSound.play().catch(e => console.warn("Audio failed on unlock:", e.message));
        }
    }

    // Bug Fix: Added robust error handling to prevent crashes from unplayable audio sources.
    function playSound(sound) {
        if (!state.isMuted && state.audioUnlocked && sound) {
            sound.currentTime = 0;
            // Use .catch() to handle potential playback errors gracefully.
            sound.play().catch(e => console.warn(`Sound effect '${sound.id}' could not be played:`, e.message));
        }
    }

    function manageThemeAudio(theme) {
        if (state.activeThemeSound) {
            state.activeThemeSound.pause();
            state.activeThemeSound = null;
        }

        const audioControls = elements.audioControls;
        const hackerSlider = document.getElementById('hacker-volume-slider');
        const darkSlider = document.getElementById('dark-volume-slider');

        if (!audioControls || !hackerSlider || !darkSlider) return;
        
        // Enhancement: Show/hide audio controls based on theme.
        let isAudioTheme = false;
        hackerSlider.classList.add('hidden');
        darkSlider.classList.add('hidden');
        
        switch (theme) {
            case 'hacker':
                state.activeThemeSound = elements.sounds.hackerAmbient;
                hackerSlider.classList.remove('hidden');
                isAudioTheme = true;
                break;
            case 'dark':
                state.activeThemeSound = elements.sounds.rain;
                darkSlider.classList.remove('hidden');
                isAudioTheme = true;
                break;
        }
        
        audioControls.classList.toggle('visible', isAudioTheme);

        if (state.activeThemeSound && !state.isMuted && state.audioUnlocked) {
            // Bug Fix: Use a robust play method with error handling to prevent NotSupportedError.
            const playPromise = state.activeThemeSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Theme audio for '${theme}' theme could not be played:`, error.message);
                });
            }
        }
    }

    // --- Visual Effect Management ---
    function clearAllEffects() {
        state.effectIntervals.forEach(id => clearInterval(id));
        state.effectIntervals = [];
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }
        
        robustQuery('.light-bubbles', el => { el.style.display = 'none'; el.innerHTML = ''; });
        robustQuery('#rainCanvas', el => { el.style.display = 'none'; el.getContext('2d').clearRect(0, 0, el.width, el.height); });
        robustQuery('#matrixCanvas', el => { el.style.display = 'none'; el.getContext('2d').clearRect(0, 0, el.width, el.height); });
        robustQuery('.hacker-visual', el => el.style.display = 'none');
        robustQuery('#hero-title', h1 => h1.classList.remove('glitch-text'));
    }

    function applyTheme(theme) {
        clearAllEffects();
        state.currentTheme = theme;
        elements.doc.className = theme;
        localStorage.setItem('portfolio_theme', theme);

        elements.themeButtons.forEach(b => b.classList.remove('active-theme'));
        robustQueryAll(`#${theme}-theme, #${theme}-theme-mobile`, buttons => buttons.forEach(b => b.classList.add('active-theme')));
        
        manageThemeAudio(theme);
        
        if (theme === 'hacker') {
            spawnHackerFx();
        } else {
            startTextShuffle();
            if (theme === 'dark') {
                spawnDarkFx();
            } else if (theme === 'light') {
                spawnLightBubbles();
            }
        }
    }
    
    // --- Canvas & DOM Animations ---
    // Enhancement: Creative animated bubble elements for the light theme.
    function spawnLightBubbles() {
        robustQuery('.light-bubbles', container => {
            container.style.display = 'block';
            for (let i = 0; i < 15; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                const size = Math.random() * 60 + 20;
                bubble.style.width = `${size}px`;
                bubble.style.height = `${size}px`;
                bubble.style.left = `${Math.random() * 100}%`;
                bubble.style.animationDuration = `${Math.random() * 10 + 8}s`;
                bubble.style.animationDelay = `${Math.random() * 5}s`;
                bubble.style.setProperty('--x-end', `${Math.random() * 20 - 10}vw`);
                container.appendChild(bubble);
            }
        });
    }

    // Enhancement: Realistic rain and synchronized thunder/lightning for the dark/stormy theme.
    function spawnDarkFx() {
        robustQuery('#rainCanvas', canvas => {
            canvas.style.display = 'block';
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            let drops = Array.from({ length: 150 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                l: Math.random() * 1,
                v: Math.random() * 5 + 5
            }));

            function drawRain() {
                if(state.currentTheme !== 'dark') {
                    cancelAnimationFrame(state.animationFrameId);
                    return;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = 'rgba(174,194,224,0.5)';
                ctx.lineWidth = 1;
                ctx.lineCap = 'round';
                drops.forEach(p => {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.l, p.y + p.l * 10);
                    ctx.stroke();
                    p.y += p.v;
                    if (p.y > canvas.height) {
                        p.y = 0 - 20;
                        p.x = Math.random() * canvas.width;
                    }
                });
                state.animationFrameId = requestAnimationFrame(drawRain);
            }
            drawRain();
        });

        const lightningInterval = setInterval(() => {
            if (state.currentTheme === 'dark' && Math.random() > 0.3) { // Occasional flashes
                elements.lightning.classList.add('flash');
                playSound(elements.sounds.lightning);
                setTimeout(() => elements.lightning.classList.remove('flash'), 700);
            }
        }, 8000);
        state.effectIntervals.push(lightningInterval);
    }
    
    function spawnHackerFx() {
        robustQuery('.hacker-visual', el => el.style.display = 'block');
        robustQuery('#hero-title', h1 => h1.classList.add('glitch-text'));
        startHackerSubtitleCycle();
        initMatrix();
        state.currentPopupIndex = 0;
        const initialTimeout = setTimeout(() => showNextHackerPopup(), 4000);
        state.effectIntervals.push(initialTimeout);
    }

    function showNextHackerPopup() {
        if (state.currentTheme === 'hacker' && state.currentPopupIndex < state.popupQueue.length) {
            robustQuery(`#${state.popupQueue[state.currentPopupIndex++]}`, popup => {
                playSound(elements.sounds.hackerPopup);
                popup.classList.remove('hidden');
                // The next popup is now triggered by the close button listener
            });
        }
    }

    function initMatrix() {
        robustQuery('#matrixCanvas', canvas => {
            canvas.style.display = 'block';
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const chars = "01", fontSize = 14;
            const columns = Math.ceil(canvas.width / fontSize);
            const drops = Array(columns).fill(1).map(() => Math.random() * canvas.height);
            const colors = ['#39ff14', '#0ff0fc', '#9457eb', '#f5f749'];
            
            const interval = setInterval(() => {
                if (state.currentTheme !== 'hacker') {
                    clearInterval(interval);
                    return;
                }
                ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = `${fontSize}px monospace`;
                for (let i = 0; i < drops.length; i++) {
                    const text = chars.charAt(Math.floor(Math.random() * chars.length));
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }, 50);
            state.effectIntervals.push(interval);
        });
    }

    // --- Interactive Text Logic ---
    function startTextShuffle() {
        robustQuery('#subtitle-container', container => {
            container.innerHTML = '';
            "A Full Stack Developer".split('').forEach(char => {
                const letter = document.createElement('span');
                letter.className = 'letter-shuffle';
                letter.textContent = char === ' ' ? '\u00A0' : char;
                letter.style.setProperty('--x', `${Math.random() * 100 - 50}px`);
                letter.style.setProperty('--y', `${Math.random() * 60 - 30}px`);
                letter.style.setProperty('--r', `${Math.random() * 360}deg`);
                container.appendChild(letter);
            });
            setTimeout(() => { container.classList.add('active'); }, 100);
        });
    }
    
    async function startHackerSubtitleCycle() {
        robustQuery('#subtitle-container', async container => {
            container.classList.remove('active');
            const phrases = ['[INITIALIZING...]', '[BREACHING_FIREWALL...]', '[ACCESS_GRANTED]'];
            const chars = "!<>-_\\/[]{}—=+*^?#";
            let i = 0;
            
            async function scrambleText(text) {
                let currentText = '';
                for (let charIndex = 0; charIndex < text.length; charIndex++) {
                    if (state.currentTheme !== 'hacker') return;
                    for (let j = 0; j < 3; j++) {
                        container.textContent = currentText + chars[Math.floor(Math.random() * chars.length)];
                        await new Promise(resolve => setTimeout(resolve, 20));
                    }
                    currentText += text[charIndex];
                    container.textContent = currentText;
                }
            }
            
            while (state.currentTheme === 'hacker') {
                await scrambleText(phrases[i]);
                await new Promise(resolve => setTimeout(resolve, 2000));
                i = (i + 1) % phrases.length;
            }
        });
    }

    function showToast(message, type = 'success') {
        robustQuery('#toast', toast => {
            robustQuery('#toast-message', msgEl => msgEl.textContent = message);
            toast.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white opacity-0 transition-all duration-300 -translate-y-12 ${type} visible`;
            setTimeout(() => toast.classList.remove('visible'), 4000);
        });
    }
    
    function initMagneticButtons() {
        const magneticElements = document.querySelectorAll('[data-magnetic]');
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', function(e) {
                const pos = el.getBoundingClientRect();
                const x = e.clientX - pos.left - pos.width / 2;
                const y = e.clientY - pos.top - pos.height / 2;
                el.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
            });
            el.addEventListener('mouseleave', function() {
                el.style.transform = 'translate(0,0)';
            });
        });
    }

    // --- Initialization ---
    function initialize() {
        document.body.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('keydown', e => {
            unlockAudio();
            if (e.key.toLowerCase() === 'm') elements.muteButton?.click();
        });

        elements.themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.id.split('-')[0];
                if (['light', 'dark', 'hacker'].includes(theme)) applyTheme(theme);
            });
        });

        robustQuery('#mute-button', button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                state.isMuted = !state.isMuted;
                const icon = button.querySelector('i');
                if (state.isMuted) {
                    icon?.classList.replace('fa-volume-up', 'fa-volume-mute');
                    if (state.activeThemeSound) state.activeThemeSound.pause();
                } else {
                    icon?.classList.replace('fa-volume-mute', 'fa-volume-up');
                    if (state.activeThemeSound && state.audioUnlocked) {
                       const playPromise = state.activeThemeSound.play();
                       if (playPromise !== undefined) {
                           playPromise.catch(err => console.warn("Audio play on unmute failed:", err.message));
                       }
                    }
                }
            });
        });
        
        robustQuery('#hacker-volume-slider input', input => {
            input.addEventListener('input', e => {
                const vol = e.target.value;
                Object.values(elements.sounds).forEach(sound => { if(sound && sound.id.startsWith('hacker')) sound.volume = vol; });
            });
        });

        robustQuery('#dark-volume-slider input', input => {
            input.addEventListener('input', e => {
                const vol = e.target.value;
                if(elements.sounds.rain) elements.sounds.rain.volume = vol;
                if(elements.sounds.lightning) elements.sounds.lightning.volume = vol;
            });
        });

        robustQuery('#hero-title', title => {
            title.addEventListener('click', () => {
                if(state.currentTheme !== 'hacker') startTextShuffle();
            });
        });

        window.addEventListener('scroll', () => {
           robustQuery('#scroll-indicator', el => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                el.style.width = (winScroll / height) * 100 + "%";
           });
           robustQuery('#scroll-to-top', btn => btn.classList.toggle('visible', window.scrollY > 300));
        });

        robustQueryAll('.popup-close-btn', btns => {
            btns.forEach(btn => btn.addEventListener('click', e => {
                e.target.closest('.hacker-popup')?.classList.add('hidden');
                // Trigger the next popup after a delay
                const timeout = setTimeout(() => showNextHackerPopup(), 1500);
                state.effectIntervals.push(timeout);
            }));
        });
        
        robustQuery('#contact-form', form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(form);
                const object = Object.fromEntries(formData.entries());
                const json = JSON.stringify(object);
                showToast('Sending...', 'success');
                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: json
                })
                .then(async (response) => {
                    let jsonRes = await response.json();
                    if (response.status == 200) {
                        showToast('Message sent successfully!', 'success');
                    } else {
                        showToast(jsonRes.message || 'An error occurred.', 'error');
                    }
                })
                .catch(() => showToast('An error occurred.', 'error'))
                .finally(() => form.reset());
            });
        });
        
        robustQueryAll('.reveal-fade, .reveal-left, .reveal-right', elements => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            elements.forEach(el => observer.observe(el));
        });
        
        robustQuery('#scroll-to-top', btn => btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })));
        
        robustQuery('#visitor-count', countElement => {
            const namespace = 'ishwor-reule-portfolio-final';
            const hasVisited = localStorage.getItem(namespace);
            const getCount = () => {
               let data;
fetch(`https://api.countapi.xyz/get/${namespace}/visits`)
    .then(res => res.json())
    .then(data => {
        if (data.value) 
             console.log("API response value:", data.value);
            countElement.textContent = data.value.toLocaleString();
    })
    .catch(() => {
        countElement.textContent = 'N/A';
    });

           
           
           
           
            };
          
            if (!hasVisited) {
                localStorage.setItem(namespace, 'true');
                fetch(`https://api.countapi.xyz/hit/${namespace}/visits`).then(res => res.json()).then(data => {
                    if (data.value) countElement.textContent = data.value.toLocaleString();
                }).catch(() => getCount());
            } else { getCount(); }
        });
        
        initMagneticButtons();
        
        const savedTheme = localStorage.getItem('portfolio_theme') || 'light';
        applyTheme(savedTheme);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();