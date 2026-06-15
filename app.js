const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const revealEls = document.querySelectorAll('.reveal');
const filterButtons = document.querySelectorAll('[data-filter]');
const catalogCards = document.querySelectorAll('[data-category]');
const quoteForm = document.querySelector('[data-quote-form]');
const dialog = document.querySelector('[data-dialog]');
const dialogOutput = document.querySelector('[data-dialog-output]');
const closeDialogButtons = document.querySelectorAll('[data-close-dialog]');
const interestInput = document.querySelector('[data-interest-input]');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function onScroll() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

filterButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove('is-active'));
    button.classList.add('is-active');

    const updateCards = () => {
      catalogCards.forEach((card) => {
        const visible = filter === 'todo' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !visible);
      });
    };

    if (document.startViewTransition && !prefersReducedMotion) {
      document.startViewTransition(updateCards);
    } else {
      updateCards();
    }
  });
});

document.querySelectorAll('[data-open-form]').forEach((button) => {
  button.addEventListener('click', () => {
    const interest = button.dataset.interest || '';
    if (interestInput) {
      interestInput.value = interest;
      interestInput.focus({ preventScroll: true });
    }
    document.querySelector('#contacto')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
});

function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const runCounter = (el) => {
    const target = Number(el.dataset.count || 0);
    const duration = 950;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString('es-ES');
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .35 });

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(runCounter);
  }
}

animateCounters();

function persistDemoLead(payload) {
  const key = 'azulejos-sol-demo-leads';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.unshift(payload);
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 8)));
}

if (quoteForm) {
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(quoteForm);
    const payload = {
      fecha_demo: new Date().toLocaleString('es-ES'),
      tipo: formData.get('tipo'),
      estancia: formData.get('estancia'),
      metros: formData.get('metros') || 'No indicado',
      urgencia: formData.get('urgencia'),
      interes: formData.get('interes'),
      contacto: formData.get('contacto'),
      estado: 'Solicitud demo preparada'
    };

    persistDemoLead(payload);

    if (dialog && dialogOutput) {
      dialogOutput.textContent = JSON.stringify(payload, null, 2);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else alert('Solicitud demo preparada:\n' + JSON.stringify(payload, null, 2));
    }

    quoteForm.reset();
  });
}

closeDialogButtons.forEach((button) => {
  button.addEventListener('click', () => dialog?.close());
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') dialog?.close();
});
