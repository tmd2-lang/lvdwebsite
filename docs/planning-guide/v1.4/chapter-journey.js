(() => {
  const chapters = [...document.querySelectorAll('.package')];

  chapters.forEach((section, index) => {
    const photo = section.querySelector('.photo');
    const content = section.querySelector('.package-content');
    if (!photo || !content) return;

    const top = content.querySelector('.package-top');
    const title = content.querySelector('h2');
    const price = content.querySelector('.price');
    const description = content.querySelector('.package-desc');
    const inclusions = content.querySelector('.inclusions');
    const scope = content.querySelector('.scope');
    const folio = content.querySelector('.folio');
    if (!top || !title || !price || !description || !inclusions) return;

    section.classList.add('chapter');
    section.style.setProperty('--chapter-order', index + 2);
    const chapterId = `${section.id}-title`;
    title.id = chapterId;
    section.setAttribute('aria-labelledby', chapterId);

    const stage = document.createElement('div');
    stage.className = 'chapter-stage';
    stage.setAttribute('aria-label', `Chapter ${String(index + 1).padStart(2, '0')}`);
    stage.append(photo);

    const intro = document.createElement('div');
    intro.className = 'chapter-intro';
    intro.append(top, title, price, description);
    stage.append(intro);

    const cue = document.createElement('span');
    cue.className = 'chapter-cue';
    cue.textContent = 'Scroll to explore';
    stage.append(cue);

    const detail = document.createElement('div');
    detail.className = 'chapter-detail';
    const inner = document.createElement('div');
    inner.className = 'package-content';

    const detailHeading = document.createElement('div');
    detailHeading.className = 'chapter-detail-heading';
    detailHeading.innerHTML = '<div><p class="eyebrow">Your planning, in detail</p><h3>What’s included</h3></div><p>Clear support, thoughtful details, and a team focused on your celebration.</p>';
    inner.append(detailHeading, inclusions);
    if (scope) inner.append(scope);
    if (folio) inner.append(folio);
    detail.append(inner);

    section.replaceChildren(stage, detail);
  });

  const rail = document.createElement('nav');
  rail.className = 'chapter-rail';
  rail.setAttribute('aria-label', 'Planning package chapters');
  rail.innerHTML = chapters.map((section, index) => {
    const label = section.querySelector('h2')?.textContent.replace(/\s+/g, ' ').trim() || `Package ${index + 1}`;
    return `<a href="#${section.id}" aria-label="Go to ${label}"${index === 0 ? ' aria-current="step"' : ''}><span class="rail-number">${String(index + 1).padStart(2, '0')}</span><span class="rail-label">${label}</span></a>`;
  }).join('');
  document.body.append(rail);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        rail.querySelectorAll('a').forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'step');
          else link.removeAttribute('aria-current');
        });
      }
    }, { rootMargin: '-46% 0px -46% 0px' });
    chapters.forEach(section => observer.observe(section));
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    chapters.forEach(section => {
      const stage = section.querySelector('.chapter-stage');
      const intro = section.querySelector('.chapter-intro');
      const image = section.querySelector('.photo img');
      gsap.from(intro.children, {
        autoAlpha: 0,
        y: 30,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'opacity,visibility,transform',
        scrollTrigger: { trigger: stage, start: 'top 62%', once: true }
      });
      if (image && window.matchMedia('(min-width: 761px)').matches) {
        gsap.fromTo(image, { scale: 1.14 }, {
          scale: 1.035,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
        });
      }
      const items = section.querySelectorAll('.chapter-detail-heading, .inclusion, .scope');
      ScrollTrigger.batch(items, {
        start: 'top 84%',
        once: true,
        onEnter: elements => gsap.fromTo(elements, { autoAlpha: 0, y: 24 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform'
        })
      });
    });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
