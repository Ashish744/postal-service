/* ==========================================================================
   MERIDIAN POST — auth.js
   Shared interactions for Login & Create Account pages
   ========================================================================== */

gsap.registerPlugin();

/* -------------------------------------------------------------------------
   1. Entrance animation
------------------------------------------------------------------------- */
(function entrance(){
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.auth-brand-top', { y: -20, opacity: 0, duration: .6 })
    .from('.auth-brand-mid .eyebrow', { x: -20, opacity: 0, duration: .5 }, .1)
    .from('.auth-brand-mid h1', { y: 30, opacity: 0, duration: .7 }, .2)
    .from('.auth-brand-mid p', { y: 20, opacity: 0, duration: .6 }, .4)
    .from('.auth-postmark', { scale: .6, opacity: 0, rotate: -20, duration: .8, ease: 'back.out(1.6)' }, .5)
    .from('.auth-brand-quote', { opacity: 0, duration: .6 }, .7)
    .from('.auth-form-top', { y: -14, opacity: 0, duration: .5 }, .15)
    .from('.auth-heading .eyebrow, .auth-heading h2, .auth-heading p', { y: 18, opacity: 0, duration: .55, stagger: .08 }, .25)
    .from('.auth-steps', { y: 14, opacity: 0, duration: .5 }, .35)
    .from('.auth-social-btn', { y: 16, opacity: 0, duration: .5, stagger: .08 }, .4)
    .from('.auth-divider', { opacity: 0, duration: .4 }, .55)
    .from('.auth-field', { y: 16, opacity: 0, duration: .5, stagger: .07 }, .6)
    .from('.auth-row-between, .auth-submit, .auth-step-actions', { y: 16, opacity: 0, duration: .5 }, .85)
    .from('.auth-footer-link', { opacity: 0, duration: .5 }, 1);

  // ambient postmark float
  gsap.to('.auth-postmark', { y: -10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });

  // route path draw
  document.querySelectorAll('.auth-brand-route path').forEach(path => {
    const len = path.getTotalLength ? path.getTotalLength() : 400;
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    gsap.to(path, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', delay: .5 });
  });
})();

/* -------------------------------------------------------------------------
   2. Password visibility toggle
------------------------------------------------------------------------- */
(function passwordToggle(){
  document.querySelectorAll('.auth-toggle-visibility').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if(!input) return;
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      btn.textContent = isPw ? 'Hide' : 'Show';
    });
  });
})();

/* -------------------------------------------------------------------------
   3. Inline field validation
------------------------------------------------------------------------- */
(function fieldValidation(){
  const validators = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address',
    required: v => v.trim().length ? '' : 'This field is required',
  };

  function getMinLenError(rule, value){
    const match = /^minlen(\d+)$/.exec(rule);
    if(!match) return '';
    const minLength = Number(match[1]);
    return value.length >= minLength ? '' : `Must be at least ${minLength} characters`;
  }

  document.querySelectorAll('[data-validate]').forEach(input => {
    const rules = input.dataset.validate.split(' ');
    const msgEl = input.closest('.auth-field')?.querySelector('.auth-field-msg');

    function validate(){
      let error = '';
      for(const rule of rules){
        if(validators[rule]){
          error = validators[rule](input.value);
        } else if(/^minlen\d+$/.test(rule)){
          error = getMinLenError(rule, input.value);
        }
        if(error) break;
      }
      input.classList.toggle('is-invalid', !!error);
      input.classList.toggle('is-valid', !error && input.value.length > 0);
      if(msgEl){
        msgEl.textContent = error;
        msgEl.classList.toggle('show', !!error);
      }
      return !error;
    }
    input.addEventListener('blur', validate);
    input.addEventListener('input', () => { if(input.classList.contains('is-invalid')) validate(); });
    input._validate = validate;
  });
})();

/* -------------------------------------------------------------------------
   4. Password strength meter (create-account page)
------------------------------------------------------------------------- */
(function pwStrength(){
  const input = document.getElementById('password');
  const bar = document.querySelector('.pw-strength-bar');
  const label = document.querySelector('.pw-strength-label');
  if(!input || !bar) return;

  const levels = [
    { min: 0,  color: 'var(--red)',    text: 'Too weak',   width: '10%' },
    { min: 1,  color: 'var(--red)',    text: 'Weak',       width: '32%' },
    { min: 2,  color: '#C77D2E',       text: 'Fair',       width: '55%' },
    { min: 3,  color: 'var(--brass)',  text: 'Good',       width: '78%' },
    { min: 4,  color: '#5B8A5B',       text: 'Strong',     width: '100%' },
  ];

  input.addEventListener('input', () => {
    const v = input.value;
    let score = 0;
    if(v.length >= 6) score++;
    if(v.length >= 10) score++;
    if(/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if(/[0-9]/.test(v)) score++;
    if(/[^A-Za-z0-9]/.test(v)) score++;
    score = Math.min(score, 4);

    const lvl = levels[v.length === 0 ? 0 : score];
    gsap.to(bar, { width: lvl.width, backgroundColor: lvl.color.startsWith('var') ? getComputedStyle(document.documentElement).getPropertyValue(lvl.color.slice(4,-1)) : lvl.color, duration: .4, ease: 'power2.out' });
    label.textContent = v.length === 0 ? '' : lvl.text;
  });
})();

/* -------------------------------------------------------------------------
   5. Multi-step form (create-account page)
------------------------------------------------------------------------- */
(function multiStep(){
  const steps = document.querySelectorAll('.auth-fieldset');
  const stepDots = document.querySelectorAll('.auth-step');
  if(!steps.length) return;
  let current = 0;

  function render(){
    steps.forEach((s, i) => s.classList.toggle('is-active', i === current));
    stepDots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.classList.toggle('is-done', i < current);
    });
    gsap.fromTo(steps[current], { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: .5, ease: 'power3.out' });
  }

  function validateStep(stepEl){
    const inputs = stepEl.querySelectorAll('[data-validate]');
    let valid = true;
    inputs.forEach(input => { if(input._validate && !input._validate()) valid = false; });
    return valid;
  }

  document.querySelectorAll('.step-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if(!validateStep(steps[current])) return;
      if(current < steps.length - 1){ current++; render(); }
    });
  });
  document.querySelectorAll('.step-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      if(current > 0){ current--; render(); }
    });
  });

  render();
})();

/* -------------------------------------------------------------------------
   6. Form submit — front-end only toast + redirect stub
------------------------------------------------------------------------- */
(function submitHandlers(){
  const form = document.querySelector('.auth-form');
  if(!form) return;
  const toast = document.querySelector('.auth-toast');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll('[data-validate]');
    let valid = true;
    inputs.forEach(input => { if(input._validate && !input._validate()) valid = false; });
    if(!valid) return;

    if(toast){
      toast.classList.add('show');
      gsap.fromTo(toast, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: .5, ease: 'power3.out' });
      setTimeout(() => {
        gsap.to(toast, { x: 60, opacity: 0, duration: .4, ease: 'power2.in', onComplete: () => toast.classList.remove('show') });
      }, 2600);
    }

    const redirect = form.dataset.redirect;
    if(redirect){
      setTimeout(() => { window.location.href = redirect; }, 1100);
    }
  });
})();