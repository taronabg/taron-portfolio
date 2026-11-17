/* TA² Websites — site script */
(function () {
  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Annotated screenshot: draw the marks in once the image has loaded
  document.querySelectorAll('.plan.animate').forEach(function (plan) {
    var img = plan.querySelector('img');
    var go = function () { requestAnimationFrame(function () { plan.classList.add('ready'); }); };
    if (!img || img.complete) { setTimeout(go, 250); } else { img.addEventListener('load', function () { setTimeout(go, 150); }); }
  });

  // Year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Forms (Formspree)
  var FORM_ENDPOINT = 'https://formspree.io/f/xdkzvjpl';
  var lastSubmit = 0;

  function setError(field, msg) {
    var input = field.querySelector('input, textarea, select');
    var err = field.querySelector('.err');
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) { err.textContent = msg || ''; err.classList.toggle('show', !!msg); }
  }

  document.querySelectorAll('form[data-ta2-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) { status.textContent = ''; status.classList.remove('error'); }

      // Honeypot: bots fill this, people never see it
      var hp = form.querySelector('input[name="company_website"]');
      if (hp && hp.value) return;

      var ok = true, firstBad = null;
      form.querySelectorAll('.field').forEach(function (field) {
        var input = field.querySelector('input, textarea, select');
        if (!input) return;
        var v = (input.value || '').trim();
        var msg = '';
        if (input.required && !v) msg = 'Please fill this in.';
        else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Enter an email like name@business.com.';
        else if (input.type === 'tel' && v && !/^[+()\d\s.-]{7,20}$/.test(v)) msg = 'Enter a phone number like (555) 123-4567.';
        else if (input.tagName === 'TEXTAREA' && input.required && v.length < 10) msg = 'Add a little more detail (10 characters or more).';
        setError(field, msg);
        if (msg) { ok = false; if (!firstBad) firstBad = input; }
      });
      if (!ok) { firstBad.focus(); return; }

      var now = Date.now();
      if (now - lastSubmit < 30000) {
        if (status) { status.textContent = 'Your message was just sent. Wait a few seconds before sending another.'; status.classList.add('error'); }
        return;
      }

      var data = new FormData(form);
      data.delete('company_website');
      var label = button ? button.textContent : '';
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }

      fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('Request failed');
          lastSubmit = now;
          window.location.href = form.getAttribute('data-next') || 'thank-you.html';
        })
        .catch(function () {
          if (button) { button.disabled = false; button.textContent = label; }
          if (status) {
            status.innerHTML = 'Your message didn’t send. Check your connection and try again, or email <a href="mailto:tasquaredwebsites@gmail.com">tasquaredwebsites@gmail.com</a>.';
            status.classList.add('error');
          }
        });
    });

    form.querySelectorAll('input, textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field && input.getAttribute('aria-invalid') === 'true') setError(field, '');
      });
    });
  });
})();
