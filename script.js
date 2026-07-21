/* ==========================================================================
   MERIDIAN POST — main.js
   GSAP-driven animation system shared across all pages
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger);

/* -------------------------------------------------------------------------
   0. Utility
------------------------------------------------------------------------- */
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduceMotion = mq.matches;

/* -------------------------------------------------------------------------
   1. Navbar — scroll state + mobile toggle
------------------------------------------------------------------------- */
(function navbar(){
  const nav = document.querySelector('.navbar');
  if(!nav) return;
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    toggleClass: { targets: nav, className: 'is-scrolled' }
  });

  if(toggle){
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('open');
      const spans = toggle.querySelectorAll('span');
      if(toggle.classList.contains('open')){
        gsap.to(spans[0], { rotate:45, y:7, duration:.35, ease:'power2.out' });
        gsap.to(spans[1], { opacity:0, duration:.2 });
        gsap.to(spans[2], { rotate:-45, y:-7, duration:.35, ease:'power2.out' });
      } else {
        gsap.to(spans, { rotate:0, y:0, opacity:1, duration:.35, ease:'power2.out' });
      }
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      const spans = toggle.querySelectorAll('span');
      gsap.to(spans, { rotate:0, y:0, opacity:1, duration:.3 });
    }));
  }
})();

// Ensure stat numbers show their target values immediately (before scroll animation)
window.addEventListener('load', () => {
  document.querySelectorAll('.stat-num').forEach(el => {
    const span = el.querySelector('span[data-count]');
    if(!span) return;
    const target = parseFloat(span.dataset.count);
    if(isNaN(target)) return;
    const isFloat = target % 1 !== 0;
    span.textContent = isFloat ? target.toFixed(1) : Math.floor(target).toLocaleString();
  });
  // Reapply after a short delay to override any script-initialization that sets 0
  let reapplies = 0;
  const reapplier = setInterval(() => {
    document.querySelectorAll('.stat-num').forEach(el => {
      const span = el.querySelector('span[data-count]');
      if(!span) return;
      const target = parseFloat(span.dataset.count);
      if(isNaN(target)) return;
      const isFloat = target % 1 !== 0;
      span.textContent = isFloat ? target.toFixed(1) : Math.floor(target).toLocaleString();
    });
    reapplies += 1;
    if(reapplies > 10) clearInterval(reapplier); // stop after ~2s
  }, 200);
});

/* -------------------------------------------------------------------------
   2. Magnetic buttons — cursor pull effect
------------------------------------------------------------------------- */
(function magnetic(){
  if(reduceMotion) return;
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      gsap.to(el, { x: x*0.28, y: y*0.5, duration:.5, ease:'power3.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x:0, y:0, duration:.6, ease:'elastic.out(1,0.4)' });
    });
  });
})();

/* -------------------------------------------------------------------------
   3. Hero intro timeline (home page only)
------------------------------------------------------------------------- */
(function heroIntro(){
  const hero = document.querySelector('.hero');
  if(!hero) return;

  // split title lines into spans for reveal
  document.querySelectorAll('.hero-title .line').forEach(line => {
    const text = line.textContent;
    line.innerHTML = `<span>${text}</span>`;
  });

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.set('.hero', { visibility: 'visible' })
    .from('.hero-kicker', { y: 30, opacity:0, duration:.7 }, 0.1)
    .from('.hero-title .line span', { yPercent: 120, opacity:0, duration:1, stagger:.12 }, 0.25)
    .from('.hero-sub', { y: 24, opacity:0, duration:.8 }, 0.75)
    .from('.hero-actions .btn', { y: 20, opacity:0, duration:.6, stagger:.1 }, 0.9)
    .from('.hero-track-mini', { y:16, opacity:0, duration:.6 }, 1.05)
    .from('.postmark', { scale: 2.4, opacity:0, rotate: -35, duration:1.1, ease:'back.out(1.4)' }, 0.5)
    .from('.hero-route-path', { drawSVG: '0%' }, 0.6)
    .from('.navbar', { y: -30, opacity:0, duration:.7 }, 0.1);

  // fallback if drawSVG plugin absent: animate stroke-dashoffset manually
  document.querySelectorAll('.hero-route-path').forEach(path => {
    const len = path.getTotalLength ? path.getTotalLength() : 400;
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    gsap.to(path, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', delay: .6 });
  });

  // ambient float on postmark
  gsap.to('.postmark', { y: -14, duration: 3.2, ease:'sine.inOut', yoyo:true, repeat:-1, delay: 1.6 });

  // parallax dots drifting
  gsap.to('.hero-dot', {
    y: 'random(-14,14)', x: 'random(-10,10)', duration: 4, ease:'sine.inOut',
    yoyo:true, repeat:-1, stagger: { each:.3, from:'random' }
  });
})();

/* -------------------------------------------------------------------------
   4. Generic scroll reveals — fade/slide up on entry
------------------------------------------------------------------------- */
(function reveals(){
  gsap.utils.toArray('.reveal').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  // eyebrow underline draw
  gsap.utils.toArray('.eyebrow').forEach(el => {
    gsap.from(el, {
      opacity:0, x:-16, duration:.6, ease:'power2.out',
      scrollTrigger:{ trigger: el, start:'top 90%' }
    });
  });
})();

/* -------------------------------------------------------------------------
   5. Ticker band — infinite marquee (duplicated for seamless loop)
------------------------------------------------------------------------- */
(function ticker(){
  const track = document.querySelector('.ticker-track');
  if(!track) return;
  track.innerHTML += track.innerHTML; // duplicate content for seamless wrap
  const width = track.scrollWidth / 2;
  gsap.to(track, { x: -width, duration: 26, ease: 'none', repeat: -1 });
})();

/* -------------------------------------------------------------------------
   6. Stat counters
------------------------------------------------------------------------- */
(function counters(){
  // Non-animated initializer: populate stats from their `data-count` attributes.
  document.querySelectorAll('.stat-num span[data-count]').forEach(span => {
    const target = parseFloat(span.dataset.count);
    if(isNaN(target)) return;
    const isFloat = target % 1 !== 0;
    span.textContent = isFloat ? target.toFixed(1) : Math.floor(target).toLocaleString();
  });
})();

/* -------------------------------------------------------------------------
   7. Services grid — staggered reveal + card index count-up feel
------------------------------------------------------------------------- */
(function svcGrid(){
  const cards = gsap.utils.toArray('.svc-card');
  if(!cards.length) return;
  gsap.from(cards, {
    y: 50, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out',
    scrollTrigger: { trigger: '.svc-grid', start: 'top 82%' }
  });
})();

/* -------------------------------------------------------------------------
   8. Process / how-it-works — line draw + step pop
------------------------------------------------------------------------- */
(function process(){
  const wrap = document.querySelector('.process-wrap');
  if(!wrap) return;
  gsap.to('.process-line', {
    scaleX: 1, duration: 1.4, ease: 'power2.inOut',
    scrollTrigger: { trigger: wrap, start: 'top 75%' }
  });
  gsap.from('.process-step', {
    y: 30, opacity: 0, duration: .7, stagger: .18, ease: 'back.out(1.5)',
    scrollTrigger: { trigger: wrap, start: 'top 70%' }
  });
})();

/* -------------------------------------------------------------------------
   9. Coverage map — pulsing route dots
------------------------------------------------------------------------- */
(function coverage(){
  const map = document.querySelector('.coverage-map');
  if(!map) return;
  gsap.utils.toArray('.coverage-pulse').forEach((el, i) => {
    gsap.to(el, {
      opacity: 0, scale: 2.6, transformOrigin: '50% 50%',
      duration: 2, ease: 'power1.out', repeat: -1, delay: i * .5,
      onStart: () => gsap.set(el, { opacity: 1, scale: 1 })
    });
  });
  gsap.utils.toArray('.coverage-route').forEach(path => {
    const len = path.getTotalLength ? path.getTotalLength() : 300;
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    gsap.to(path, {
      strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut',
      scrollTrigger: { trigger: map, start: 'top 75%' }
    });
  });
})();

/* -------------------------------------------------------------------------
   10. Live tracking demo — fake progress interaction
------------------------------------------------------------------------- */
(function trackDemo(){
  const btn = document.querySelector('.track-btn');
  const nodes = document.querySelectorAll('.track-node');
  if(!btn || !nodes.length) return;

  function animateProgress(){
    nodes.forEach((n, i) => n.classList.remove('is-active'));
    const tl = gsap.timeline();
    nodes.forEach((n, i) => {
      tl.call(() => n.classList.add('is-active'), null, i * .4);
      tl.from(n, { x: -10, opacity: .4, duration: .5, ease:'power2.out' }, i * .4);
    });
  }
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    animateProgress();
  });
  ScrollTrigger.create({ trigger: '.track-demo', start:'top 75%', once:true, onEnter: animateProgress });
})();

/* -------------------------------------------------------------------------
   11. Testimonials — draggable / button carousel
------------------------------------------------------------------------- */
(function testimonials(){
  const track = document.querySelector('.testi-track');
  if(!track) return;
  const cards = track.children;
  let index = 0;

  function cardWidth(){ return cards[0].getBoundingClientRect().width + 30; }

  function go(dir){
    index = Math.max(0, Math.min(cards.length - 1, index + dir));
    gsap.to(track, { x: -index * cardWidth(), duration: .7, ease: 'power3.inOut' });
  }
  document.querySelector('.testi-next')?.addEventListener('click', () => go(1));
  document.querySelector('.testi-prev')?.addEventListener('click', () => go(-1));
})();

/* -------------------------------------------------------------------------
   12. Blog cards — hover tilt handled in CSS; entrance stagger here
------------------------------------------------------------------------- */
(function blogGrid(){
  const grids = document.querySelectorAll('.blog-grid-home, .blog-grid-full');
  grids.forEach(grid => {
    gsap.from(grid.children, {
      y: 40, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 85%' }
    });
  });
})();

/* -------------------------------------------------------------------------
   13. CTA banner — number-stamp rotate ambient
------------------------------------------------------------------------- */
(function ctaStamps(){
  gsap.to('.cta-stamp', { rotate: 360, duration: 40, ease: 'none', repeat: -1 });
  gsap.to('.cta-stamp.two', { rotate: -360, duration: 30, ease: 'none', repeat: -1 });
})();

/* -------------------------------------------------------------------------
   14. Page hero (inner pages) entrance
------------------------------------------------------------------------- */
(function pageHero(){
  const ph = document.querySelector('.page-hero');
  if(!ph) return;
  gsap.from('.page-hero-crumb', { y: 20, opacity: 0, duration: .6, ease:'power2.out' });
  gsap.from('.page-hero h1', { y: 40, opacity: 0, duration: .9, ease:'power3.out', delay:.1 });
  gsap.from('.page-hero p.lede', { y: 24, opacity: 0, duration: .8, ease:'power3.out', delay:.3 });
})();

/* -------------------------------------------------------------------------
   15. Value / team / pricing / svc-detail grids — generic stagger reveal
------------------------------------------------------------------------- */
(function genericGrids(){
  const selectors = ['.value-grid', '.team-grid', '.pricing-grid', '.svc-detail-list', '.timeline-v', '.coverage-list'];
  selectors.forEach(sel => {
    const el = document.querySelector(sel);
    if(!el) return;
    gsap.from(el.children, {
      y: 36, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });
})();

/* -------------------------------------------------------------------------
   16. FAQ accordion (contact page)
------------------------------------------------------------------------- */
(function faq(){
  document.querySelectorAll('.faq-item').forEach(item => {
    const answer = item.querySelector('.faq-a');
    item.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if(other !== item){
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });
})();

/* -------------------------------------------------------------------------
   17. Contact form — front-end only success animation
------------------------------------------------------------------------- */
(function contactForm(){
  const form = document.querySelector('.contact-form');
  if(!form) return;

  const fname = document.querySelector('#fname');
  const lname = document.querySelector('#lname');
  const email = document.querySelector('#email');
  const namePattern = /^[A-Za-z\s]+$/;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const blockedEmails = ['hello@domain.co'];

  const validateNames = () => {
    let valid = true;
    [fname, lname].forEach(input => {
      if(!input) return;
      if(!namePattern.test(input.value.trim())){
        input.setCustomValidity('Please enter letters only.');
        valid = false;
      } else {
        input.setCustomValidity('');
      }
    });
    return valid;
  };

  const validateEmail = () => {
    if(!email) return true;
    const value = email.value.trim().toLowerCase();
    if(blockedEmails.includes(value)){
      email.setCustomValidity('Please enter a valid email address.');
      return false;
    }
    if(!emailPattern.test(value)){
      email.setCustomValidity('Please enter a valid email address.');
      return false;
    }
    email.setCustomValidity('');
    return true;
  };

  [fname, lname].forEach(input => {
    if(!input) return;
    input.addEventListener('input', () => {
      input.setCustomValidity('');
      if(input.value && !namePattern.test(input.value.trim())){
        input.setCustomValidity('Please enter letters only.');
      }
    });
  });

  if(email){
    email.addEventListener('input', () => {
      const value = email.value.trim().toLowerCase();
      email.setCustomValidity('');
      if(value && blockedEmails.includes(value)){
        email.setCustomValidity('Please enter a valid email address.');
      } else if(value && !emailPattern.test(value)){
        email.setCustomValidity('Please enter a valid email address.');
      }
    });
  }

  let _hideSuccessTimer = null;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!validateNames() || !validateEmail()){
      form.reportValidity();
      return;
    }

    window.location.href = '404error.html';
  });
})();

/* -------------------------------------------------------------------------
   18. Footer newsletter — valid email only + submit confirmation
------------------------------------------------------------------------- */
(function footerNewsletter(){
  const forms = document.querySelectorAll('.footer-newsletter-form');
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const blockedEmails = ['hello@domain.co'];

  forms.forEach(form => {
    const input = form.querySelector('input[type="email"]');
    const msg = form.querySelector('.footer-newsletter-msg');
    if(!input || !msg) return;

    const setEmailError = (show) => {
      input.setCustomValidity(show ? 'Please enter a valid email address.' : '');
      if(show) input.reportValidity();
    };

    const validateEmail = () => {
      const value = input.value.trim().toLowerCase();
      if(!value) return false;
      if(blockedEmails.includes(value)) return false;
      return emailPattern.test(value);
    };

    input.addEventListener('input', () => {
      input.setCustomValidity('');
      msg.classList.remove('show');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if(!validateEmail()){
        setEmailError(true);
        return;
      }
      msg.classList.add('show');
      input.value = '';
    });
  });
})();

/* -------------------------------------------------------------------------
   19. Blog filter buttons (blog page)
------------------------------------------------------------------------- */
(function blogFilters(){
  const filters = document.querySelectorAll('.blog-filters button');
  const cards = document.querySelectorAll('.blog-grid-full .blog-card');
  if(!filters.length) return;
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        gsap.to(card, {
          opacity: match ? 1 : 0.15,
          scale: match ? 1 : 0.96,
          duration: .4, ease: 'power2.out'
        });
        card.style.pointerEvents = match ? 'auto' : 'none';
      });
    });
  });
})();

/* -------------------------------------------------------------------------
   19. Section dividers — airmail stripe slide-in
------------------------------------------------------------------------- */
(function stripes(){
  gsap.utils.toArray('.airmail-rule').forEach(el => {
    gsap.from(el, {
      scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'power3.inOut',
      scrollTrigger: { trigger: el, start: 'top 92%' }
    });
  });
})();

/* -------------------------------------------------------------------------
   20. Smooth-refresh on load
------------------------------------------------------------------------- */
window.addEventListener('load', () => ScrollTrigger.refresh());