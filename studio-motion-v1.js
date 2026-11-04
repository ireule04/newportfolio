'use strict';
const contact = document.querySelector('#contact-form');
const statusLine = document.querySelector('#contact-status');
contact.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = contact.querySelector('button[type="submit"]');
    if (submit.disabled) return;
    const payload = Object.fromEntries(new FormData(contact));
    submit.disabled = true;
    statusLine.textContent = 'Sending your message…';
    try {
        const response = await fetch(contact.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload)
        });
        const body = await response.json();
        if (!response.ok || !body.success) throw new Error('Delivery failed');
        if (['name', 'email', 'message'].every(key => contact.elements[key].value === payload[key])) contact.reset();
        statusLine.textContent = 'Message sent. Thanks for getting in touch.';
    } catch {
        statusLine.textContent = 'Delivery failed. Your message is still here. Try again or use the email link.';
    } finally {
        submit.disabled = false;
    }
});

// Only run decorative motion while the landscape is on screen.
const scene = document.querySelector('.masthead');
const film = scene.querySelector('.sky-film');
const atlas = scene.querySelector('.atlas');
const toggle = document.querySelector('#motion-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let wantsMotion = !reducedMotion.matches;
let inView = true;

function updateMotion() {
    toggle.textContent = wantsMotion ? 'Pause motion' : 'Play motion';
    if (!wantsMotion || !inView || document.hidden) {
        scene.classList.remove('running');
        film.pause();
        atlas.style.removeProperty('--tilt-x');
        atlas.style.removeProperty('--tilt-y');
        return;
    }
    if (!film.hasAttribute('src')) film.src = 'aurora-ridge.mp4';
    film.muted = true;
    film.play().then(() => {
        scene.classList.toggle('running', !film.paused);
    }).catch(error => {
        if (error.name === 'AbortError') return;
        wantsMotion = false;
        updateMotion();
    });
}
toggle.addEventListener('click', () => {
    wantsMotion = !wantsMotion;
    updateMotion();
});
document.querySelector('#sky-mode').addEventListener('change', event => {
    scene.dataset.sky = event.target.value;
});
atlas.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !scene.classList.contains('running') || reducedMotion.matches) return;
    const box = atlas.getBoundingClientRect();
    atlas.style.setProperty('--tilt-x', ((event.clientX - box.left) / box.width - .5) * 9 + 'deg');
    atlas.style.setProperty('--tilt-y', (.5 - (event.clientY - box.top) / box.height) * 6 + 'deg');
});
atlas.addEventListener('pointerleave', () => {
    atlas.style.removeProperty('--tilt-x');
    atlas.style.removeProperty('--tilt-y');
});
reducedMotion.addEventListener('change', () => {
    wantsMotion = !reducedMotion.matches;
    updateMotion();
});
document.addEventListener('visibilitychange', updateMotion);
new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    updateMotion();
}).observe(scene);
updateMotion();

// Sweep a tube along a parametric spine; depth-sort its faces for solid shading.
function initObservatory() {
    const canvas = document.querySelector('#sculpture');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const spin = document.querySelector('#spin');
    const names = ['TREFOIL', 'ORBIT', 'ROSETTE'];
    const segments = 108, sides = 12, tau = Math.PI * 2;
    let mesh = [], yaw = .35, pitch = -.45;
    let playing = !reducedMotion.matches, visible = false, frame = 0, last = 0;
    let drag = null;

    function build(form) {
        function spine(t) {
            if (form === 0) return [Math.sin(t) + 2*Math.sin(2*t), Math.cos(t) - 2*Math.cos(2*t), -Math.sin(3*t)];
            if (form === 1) return [2.5*Math.cos(t), 1.3*Math.sin(2*t), 2.5*Math.sin(t)];
            const r = 2 + .65*Math.cos(5*t);
            return [r*Math.cos(t), r*Math.sin(t), .88*Math.sin(5*t)];
        }
        mesh = Array.from({length:segments}, (_, i) => {
            const t = tau*i/segments, center = spine(t), next = spine(t+.001);
            const delta = next.map((v,k) => v-center[k]);
            const length = Math.hypot(...delta);
            const [x,y,z] = delta.map(v=>v/length);
            const norm = Math.hypot(x,y);
            const a = [-y/norm,x/norm,0], b = [-z*a[1],z*a[0],norm];
            return Array.from({length:sides},(_,j)=>center.map((v,k)=>
                v+.33*(Math.cos(j*tau/sides)*a[k]+Math.sin(j*tau/sides)*b[k])));
        });
    }
    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0,0,w,h);
        const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
        const points = mesh.map(ring=>ring.map(([x,y,z])=>{
            const rx=x*cy+z*sy, rz=z*cy-x*sy, depth=y*sp+rz*cp;
            const scale=h*1.12/(8-depth*.35);
            return [w/2+rx*scale,h/2+(y*cp-rz*sp)*scale,depth];
        }));
        const faces=[];
        for(let i=0;i<segments;i++) for(let j=0;j<sides;j++) {
            const n=(i+1)%segments,k=(j+1)%sides;
            const face=[points[i][j],points[n][j],points[n][k],points[i][k]];
            faces.push({face,depth:face.reduce((sum,p)=>sum+p[2],0)/4,i,j});
        }
        faces.sort((a,b)=>a.depth-b.depth);
        for(const {face,depth,i,j} of faces) {
            const hue=175+64*(1+Math.sin(tau*i/segments))/2;
            const light=40+depth*5+12*Math.cos(j*tau/sides);
            ctx.fillStyle='hsl('+hue+' 76% '+light+'%)';
            ctx.strokeStyle='rgba(10,25,45,.32)';
            ctx.lineWidth=.6;ctx.beginPath();
            face.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));
            ctx.closePath();ctx.fill();ctx.stroke();
        }
    }
    function animate(now) {
        frame=0;
        if (!visible || document.hidden || !playing || drag) return;
        if(now-last>=32){yaw+=Math.min((now-last)/1000,.06)*.48;last=now;draw();}
        frame=requestAnimationFrame(animate);
    }
    function schedule() {
        cancelAnimationFrame(frame);last=performance.now();
        spin.textContent=playing?'Pause rotation':'Play rotation';
        if(visible && playing && !document.hidden && !drag) frame=requestAnimationFrame(animate);
    }
    document.querySelectorAll('[data-form]').forEach(button=>button.addEventListener('click',()=>{
        const form=Number(button.dataset.form);
        document.querySelectorAll('[data-form]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        document.querySelector('#specimen').textContent='FIG 0'+(form+1)+' / '+names[form];
        build(form);draw();
    }));
    spin.addEventListener('click',()=>{playing=!playing;schedule()});
    canvas.addEventListener('pointerdown',e=>{
        drag={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);schedule();
    });
    canvas.addEventListener('pointermove',e=>{
        if(!drag || drag.id!==e.pointerId)return;
        yaw+=(e.clientX-drag.x)*.012;pitch+=(e.clientY-drag.y)*.012;
        drag.x=e.clientX;drag.y=e.clientY;draw();
    });
    canvas.addEventListener('lostpointercapture',()=>{drag=null;schedule()});
    reducedMotion.addEventListener('change',()=>{playing=!reducedMotion.matches;schedule()});
    document.addEventListener('visibilitychange',schedule);
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule()}).observe(canvas);
    build(0);draw();schedule();
}
initObservatory();
