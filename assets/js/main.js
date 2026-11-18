(() => {
  const hero = document.querySelector('.hero');
  const video = document.querySelector('.hero__video');
  const source = video && video.querySelector('source');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const play = () => {
    if (!video) return;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
  };

  const pause = () => {
    if (video) video.pause();
  };

  if (video) {
    const wide = window.matchMedia('(min-width: 1000px)');
    const bar = document.querySelector('.hero__loading');
    const fill = bar && bar.querySelector('span');
    let started = false;

    // The film is 736px wide. On a large screen it gets magnified, so those
    // screens get a 1920px encode of the same loop instead.
    const start = () => {
      if (started) return;
      started = true;
      if (source && source.dataset.hi && wide.matches) source.src = source.dataset.hi;
      video.load();
      play();
    };

    if (reduce.matches) {
      // The poster is the whole hero in this case, so nothing downloads.
      video.pause();
    } else {
      if (bar) {
        bar.classList.add('is-active');

        const paint = () => {
          if (!fill || !video.duration || !video.buffered.length) return;
          const end = video.buffered.end(video.buffered.length - 1);
          fill.style.width = Math.min(100, (end / video.duration) * 100).toFixed(1) + '%';
        };

        const done = () => {
          if (fill) fill.style.width = '100%';
          bar.classList.add('is-done');
        };

        video.addEventListener('progress', paint);
        video.addEventListener('loadedmetadata', paint);
        // Frame is decoded, poster is replaced: nothing left to wait for.
        video.addEventListener('loadeddata', done);
        video.addEventListener('playing', done);
      }

      // Several megabytes of film should not compete with the fonts and the
      // poster, so it starts once the page has painted. The poster holds the
      // frame in the meantime.
      if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
      else window.addEventListener('load', start, { once: true });
      window.addEventListener('load', start, { once: true });

      // Phones and battery savers can hold autoplay until a gesture.
      document.addEventListener('touchstart', start, { passive: true, once: true });
      document.addEventListener('click', start, { once: true });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) pause();
        else play();
      });

      // Stop decoding once the film has scrolled away.
      if (hero && 'IntersectionObserver' in window) {
        new IntersectionObserver(
          (entries) => entries.forEach((entry) => (entry.isIntersecting ? start() : pause())),
          { threshold: 0.01 }
        ).observe(hero);
      }
    }
  }

  // Contact form, posted to Web3Forms (same inbox key as the old site)
  const form = document.getElementById('contactForm');
  if (form) {
    const note = form.querySelector('.form__note');
    const button = form.querySelector('button[type="submit"]');
    const label = button ? button.textContent : '';

    const setNote = (message, state) => {
      if (!note) return;
      note.textContent = message;
      note.className = 'form__note' + (state ? ' is-' + state : '');
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending…';
      }
      setNote('', '');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
          form.reset();
          setNote('Sent. I’ll reply soon.', 'ok');
        } else {
          setNote(data.message || 'That didn’t send. Try again, or message me on Instagram.', 'err');
        }
      } catch (error) {
        setNote('Network error. Try again.', 'err');
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = label;
        }
      }
    });
  }
})();
