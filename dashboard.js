/* ==========================================================================
   MERIDIAN POST — dashboard.js
   ========================================================================== */

/* -------------------------------------------------------------------------
   1. Sidebar toggle (mobile)
------------------------------------------------------------------------- */
(function sidebarToggle(){
  const toggle = document.querySelector('.dash-menu-toggle');
  const sidebar = document.querySelector('.dash-sidebar');
  if(!toggle || !sidebar) return;
  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if(sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle.contains(e.target)){
      sidebar.classList.remove('open');
    }
  });
})();

/* -------------------------------------------------------------------------
   2. Entrance timeline
------------------------------------------------------------------------- */
(function entrance(){
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.dash-sidebar', { x: -30, opacity: 0, duration: .6 })
    .from('.dash-nav-link', { x: -14, opacity: 0, duration: .4, stagger: .04 }, .15)
    .from('.dash-topbar', { y: -20, opacity: 0, duration: .5 }, .1)
    .from('.dash-welcome', { y: 16, opacity: 0, duration: .5 }, .3)
    .from('.dash-stat-card', { y: 26, opacity: 0, duration: .55, stagger: .08 }, .35)
    .from('.dash-panel', { y: 26, opacity: 0, duration: .6, stagger: .1 }, .55)
    .from('.dash-action-card', { y: 20, opacity: 0, duration: .5, stagger: .06 }, .8);
})();

/* -------------------------------------------------------------------------
   3. Stat counters
------------------------------------------------------------------------- */
(function counters(){
  document.querySelectorAll('.dash-stat-num').forEach(el => {
    const target = parseFloat(el.dataset.count);
    if(isNaN(target)) return;
    const counter = { val: 0 };
    gsap.to(counter, {
      val: target, duration: 1.6, ease: 'power2.out', delay: .5,
      onUpdate: () => {
        const isFloat = target % 1 !== 0;
        el.textContent = (isFloat ? counter.val.toFixed(1) : Math.floor(counter.val).toLocaleString()) + (el.dataset.suffix || '');
      }
    });
  });
})();

/* -------------------------------------------------------------------------
   4. Mini bar chart animation
------------------------------------------------------------------------- */
(function chart(){
  const bars = document.querySelectorAll('.dash-chart .bar');
  if(!bars.length) return;
  bars.forEach((bar, i) => {
    const h = bar.dataset.height || '40';
    gsap.to(bar, { height: h + '%', duration: 1, ease: 'power3.out', delay: 1 + i * .07 });
  });
})();

/* -------------------------------------------------------------------------
   5. Track progress bar fill
------------------------------------------------------------------------- */
(function trackProgress(){
  const fill = document.querySelector('.dash-track-progress .bar-fill');
  if(!fill) return;
  gsap.to(fill, { width: '62%', duration: 1.4, ease: 'power2.inOut', delay: 1.2 });

  const btn = document.querySelector('.dash-track-btn');
  const input = document.querySelector('.dash-track-input input');
  btn?.addEventListener('click', (e) => {
    e.preventDefault();
    gsap.fromTo(fill, { width: '10%' }, { width: '62%', duration: 1.2, ease: 'power2.inOut' });
    gsap.fromTo('.dash-track-progress .node.done', { scale: 0.6 }, { scale: 1, duration: .4, stagger: .1, ease: 'back.out(2)' });
  });
})();

/* -------------------------------------------------------------------------
   6. Table row entrance on load
------------------------------------------------------------------------- */
(function tableRows(){
  const rows = document.querySelectorAll('.dash-table tbody tr');
  if(!rows.length) return;
  gsap.from(rows, { opacity: 0, x: 12, duration: .5, stagger: .06, delay: .9, ease: 'power2.out' });
})();

/* -------------------------------------------------------------------------
   7. Notification bell micro-interaction
------------------------------------------------------------------------- */
(function bell(){
  const bell = document.querySelector('.dash-bell');
  if(!bell) return;
  bell.addEventListener('click', () => {
    gsap.fromTo(bell.querySelector('svg'), { rotate: 0 }, { rotate: 15, duration: .12, yoyo: true, repeat: 5, ease: 'power1.inOut', transformOrigin: '50% 0%' });
  });
})();