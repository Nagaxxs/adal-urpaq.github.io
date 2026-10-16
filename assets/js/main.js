
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function init() {
    document.documentElement.classList.remove('no-js');

    /* header + progress + scroll state */
    var header = $('.site-header'), prog = $('.progress');
    var onScroll = function () {
      var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
      header.classList.toggle('scrolled', y > 10);
      if (prog) prog.style.setProperty('--s', h > 0 ? (y / h).toFixed(4) : 0);
      timeline();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* mobile menu */
    var burger = $('.burger');
    burger.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { header.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && header.classList.contains('menu-open')) { header.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); burger.focus(); } });

    /* stagger + reveal */
    $$('[data-stagger]').forEach(function (g) { $$('[data-reveal]', g).forEach(function (el, i) { if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', i % 6); }); });
    var counted = new WeakSet();
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('in'); io.unobserve(e.target);
          $$('[data-count]', e.target).forEach(count);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      $$('[data-reveal]').forEach(function (el) { io.observe(el); });
    } else { $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); }); }

    /* number ticker (magicui/number-ticker: spring-like ease to value) */
    function count(el) {
      if (counted.has(el) || reduce) return; counted.add(el);
      var to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = null, dur = 1600;
      var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
      el.textContent = fmt(0);
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
      });
    }

    /* card spotlight: pointer-follow radial gradient */
    $$('.spot, .spot-b').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    /* background beams (aceternity/background-beams) — paths + animated gradients via SMIL */
    var host = $('#beams');
    if (host) {
      var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 696 316'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%'); svg.setAttribute('fill', 'none');
      var defs = document.createElementNS(NS, 'defs'), all = '', n = 50;
      var P = function (i) { var dx = 7 * i, dy = -8 * i;
        return 'M' + (-380 + dx) + ' ' + (-189 + dy) + 'C' + (-380 + dx) + ' ' + (-189 + dy) + ' ' + (-312 + dx) + ' ' + (216 + dy) + ' ' + (152 + dx) + ' ' + (343 + dy) + 'C' + (616 + dx) + ' ' + (470 + dy) + ' ' + (684 + dx) + ' ' + (875 + dy) + ' ' + (684 + dx) + ' ' + (875 + dy); };
      for (var i = 0; i < n; i++) all += P(i);
      var base = document.createElementNS(NS, 'path'); base.setAttribute('d', all); base.setAttribute('stroke', 'rgba(255,255,255,.05)'); base.setAttribute('stroke-width', '0.5'); svg.appendChild(base);
      var lines = reduce ? 0 : 18;
      for (var k = 0; k < lines; k++) {
        var idx = Math.floor(k * n / lines) + 1, id = 'bg' + k, g = document.createElementNS(NS, 'linearGradient');
        g.setAttribute('id', id); g.setAttribute('x1', '0%'); g.setAttribute('x2', '0%'); g.setAttribute('y1', '0%'); g.setAttribute('y2', '0%');
        var dur = (Math.random() * 10 + 10).toFixed(1) + 's', begin = (Math.random() * 10).toFixed(1) + 's';
        [['x1', '0%;100%'], ['x2', '0%;95%'], ['y1', '0%;100%'], ['y2', '0%;' + (93 + Math.random() * 8).toFixed(0) + '%']].forEach(function (a) {
          var an = document.createElementNS(NS, 'animate'); an.setAttribute('attributeName', a[0]); an.setAttribute('values', a[1]);
          an.setAttribute('dur', dur); an.setAttribute('begin', begin); an.setAttribute('repeatCount', 'indefinite'); an.setAttribute('calcMode', 'spline'); an.setAttribute('keySplines', '.42 0 .58 1'); g.appendChild(an);
        });
        [['0', '#2fd6e8', '0'], ['0', '#2fd6e8', '1'], ['32.5%', '#7fe9f4', '1'], ['100%', '#fec50c', '0']].forEach(function (s) {
          var st = document.createElementNS(NS, 'stop'); st.setAttribute('offset', s[0]); st.setAttribute('stop-color', s[1]); st.setAttribute('stop-opacity', s[2]); g.appendChild(st);
        });
        defs.appendChild(g);
        var p = document.createElementNS(NS, 'path'); p.setAttribute('d', P(idx)); p.setAttribute('stroke', 'url(#' + id + ')'); p.setAttribute('stroke-opacity', '0.6'); p.setAttribute('stroke-width', '0.6'); svg.appendChild(p);
      }
      svg.appendChild(defs); host.appendChild(svg);
    }

    /* scenario tabs (ARIA tabs with arrow-key support) */
    var tabs = $$('.scen-tab');
    function select(t, focus) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var j = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (e.key === 'Home') j = -i; if (e.key === 'End') j = tabs.length - 1 - i;
        if (j !== undefined) { e.preventDefault(); select(tabs[(i + j + tabs.length) % tabs.length], true); }
      });
    });

    /* timeline scroll beam (aceternity/timeline) */
    var tl = $('#tl'), tlLine = tl && $('.tl-line i', tl), items = tl ? $$('.tl-item', tl) : [];
    function timeline() {
      if (!tl) return;
      var r = tl.getBoundingClientRect(), vh = innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.55 - r.top) / r.height));
      tlLine.style.height = (p * 100).toFixed(2) + '%';
      items.forEach(function (it) { it.classList.toggle('on', it.getBoundingClientRect().top < vh * 0.55); });
    }

    /* video facades → YouTube iframe on click */
    $$('.vplay').forEach(function (b) {
      b.addEventListener('click', function () {
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.yt + '?autoplay=1&rel=0';
        f.title = b.dataset.title || 'YouTube video';
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin';
        b.replaceWith(f); f.focus();
      });
    });

    /* FAQ: only one open at a time */
    $$('.faq details').forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) $$('.faq details').forEach(function (o) { if (o !== d) o.open = false; }); }); });


    onScroll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
