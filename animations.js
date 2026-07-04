/* august — scroll reveals + FAQ accordion */
(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     Scroll reveal — reveal once, stagger siblings, then strip
     the classes so hover transforms are unaffected afterwards.
     ---------------------------------------------------------- */
  var revealSelectors = [
    '.our-approach .copy-text > *',
    '.choose-your-focus2 > .how-do-i-get-started-parent .options > *',
    '.choose-your-focus2 > .how-do-i-get-started-parent .begin-cta2',
    '.carousel .options .performance2',
    '.carousel .information-card',
    '.ongoing-relationship .upper-text > *',
    '.lower-text > *',
    '.cards .card-01',
    '.no-compromise .image-icon',
    '.no-compromise .text-copy > *',
    '.four-points .point-one',
    '.no-compromise .see-you-cta',
    '.upper-text2 > *',
    '.lower-text2 > *',
    '.upper-text3 > *',
    '.cards2 .testimonial-01',
    '.testimonials .begin-your-journey-wrapper',
    '.faqs .text15 > *',
    '.faqs3 .faq-01',
    '.sign-up .text16 > *'
  ];

  var targets = document.querySelectorAll(revealSelectors.join(','));

  if (reducedMotion || !('IntersectionObserver' in window)) {
    initFaq();
    initFocusTabs();
    return;
  }

  targets.forEach(function (el) {
    el.classList.add('reveal');
  });

  // Stagger: delay is based on position among revealed siblings.
  targets.forEach(function (el) {
    var siblings = el.parentElement
      ? Array.prototype.filter.call(el.parentElement.children, function (c) {
          return c.classList.contains('reveal');
        })
      : [el];
    var index = siblings.indexOf(el);
    el.style.setProperty('--reveal-delay', Math.min(index, 6) * 80 + 'ms');
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        el.classList.add('in-view');
        // Once the reveal finishes, remove the helper classes so the
        // element's own hover/press transitions take over cleanly.
        var delay = parseFloat(getComputedStyle(el).transitionDelay) || 0;
        setTimeout(function () {
          el.classList.remove('reveal', 'in-view');
          el.style.removeProperty('--reveal-delay');
          el.style.willChange = 'auto';
        }, delay * 1000 + 750);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });

  initFaq();
  initFocusTabs();

  /* ----------------------------------------------------------
     FAQ accordion — one item open at a time
     ---------------------------------------------------------- */
  function initFaq() {
    var items = document.querySelectorAll('.faqs3 .faq-01');
    items.forEach(function (item) {
      var trigger = item.querySelector('.how-do-i-get-started-parent');
      if (!trigger) return;
      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        items.forEach(function (other) {
          other.classList.remove('open');
        });
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ----------------------------------------------------------
     Choose-your-focus tabs — click an option card to swap the
     information card's image, copy, and stats with a crossfade.
     ---------------------------------------------------------- */
  function initFocusTabs() {
    var tabData = [
      {
        title: 'Weight',
        desc: 'A metabolic protocol built around GLP-1 medication, physician-tuned and adjusted as your body responds. Paired with labs, not guesswork.',
        stat1: '4-6 Weeks', stat1Label: 'To first results',
        stat2: 'Monthly', stat2Label: 'Physician check-ins',
        image: './images/opt/focus-weight.jpg'
      },
      {
        title: 'Performance',
        desc: 'Hormone and energy optimization built on real bloodwork. Your physician calibrates testosterone, peptide, and recovery support to your labs — and re-tests as you progress.',
        stat1: '2-4 Weeks', stat1Label: 'To first results',
        stat2: 'Quarterly', stat2Label: 'Lab panels',
        image: './images/opt/ongoing-bg.jpg'
      },
      {
        title: 'Skin',
        desc: 'Dermatology, compounded for your skin alone. Prescription-strength actives blended into a single nightly formula, refined by your physician at every follow-up.',
        stat1: '6-8 Weeks', stat1Label: 'To first results',
        stat2: 'Monthly', stat2Label: 'Formula reviews',
        image: './images/opt/bottle.jpg'
      },
      {
        title: 'Hair',
        desc: 'Growth and retention, treated at the root cause. Clinically proven medication paired with physician follow-ups to keep density moving in the right direction.',
        stat1: '3-6 Months', stat1Label: 'To visible regrowth',
        stat2: 'Monthly', stat2Label: 'Progress check-ins',
        image: './images/opt/hero-bg.jpg'
      }
    ];

    var tabs = Array.prototype.slice.call(
      document.querySelectorAll('.carousel .options .performance2')
    );
    var card = document.querySelector('.carousel .information-card');
    if (!tabs.length || !card) return;

    var img = card.querySelector('.bg-image-icon');
    var title = card.querySelector('.weight3');
    var desc = card.querySelector('.a-metabolic-protocol');
    var stat1 = card.querySelector('.weeks-parent .monthly');
    var stat1Label = card.querySelector('.weeks-parent .to-first-results');
    var stat2 = card.querySelector('.monthly-parent .monthly');
    var stat2Label = card.querySelector('.monthly-parent .to-first-results');

    // Preload tab images so switches never flash
    tabData.forEach(function (d) {
      new Image().src = d.image;
    });

    var current = 0;
    var switching = false;

    tabs.forEach(function (tab, i) {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tab.addEventListener('click', function () {
        selectTab(i);
      });
    });
    tabs[0].classList.add('selected');

    function selectTab(i) {
      if (i === current || switching) return;
      current = i;
      switching = true;

      tabs.forEach(function (t, j) {
        t.classList.toggle('selected', j === i);
        t.setAttribute('aria-selected', j === i ? 'true' : 'false');
      });

      var d = tabData[i];
      var swapDelay = reducedMotion ? 0 : 300;
      card.classList.add('switching');

      setTimeout(function () {
        title.textContent = d.title;
        desc.textContent = d.desc;
        stat1.textContent = d.stat1;
        stat1Label.textContent = d.stat1Label;
        stat2.textContent = d.stat2;
        stat2Label.textContent = d.stat2Label;

        var finish = function () {
          card.classList.remove('switching');
          switching = false;
        };
        if (img.src.indexOf(d.image.replace('./', '/')) !== -1) {
          finish();
          return;
        }
        img.onload = finish;
        img.onerror = finish;
        img.src = d.image;
        // Safety net if the image is already cached and onload raced
        setTimeout(finish, 600);
      }, swapDelay);
    }
  }
})();
