const mapTrigger = document.querySelector('[data-show-map]');

if (mapTrigger) {
  mapTrigger.hidden = false;
  mapTrigger.addEventListener('click', () => {
    const map = document.createElement('iframe');
    map.title = 'Карта Калининграда для демонстрации';
    map.src = 'https://www.openstreetmap.org/export/embed.html?bbox=20.32%2C54.65%2C20.59%2C54.77&layer=mapnik';
    map.referrerPolicy = 'no-referrer';
    mapTrigger.replaceWith(map);
    map.focus();
  }, { once: true });
}

const heroAction = document.querySelector('.hero-actions .pill-primary');
const mobileAction = document.querySelector('.mobile-action');
if (heroAction && mobileAction && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    mobileAction.hidden = entry.isIntersecting && document.activeElement !== mobileAction;
  }, { threshold: 0.6, rootMargin: '0px 0px -56px' });
  observer.observe(heroAction);
}

// Fill this value with the owner's GA4 measurement ID when analytics is ready.
const measurementId = '';
const analyticsKey = 'srez-analytics-consent';

if (/^G-[A-Z0-9]+$/.test(measurementId)) {
  let consent;
  try {
    consent = localStorage.getItem(analyticsKey);
  } catch {
    // The page still works when browser storage is unavailable.
  }

  function startAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(tag);
  }

  function chooseAnalytics(value) {
    try {
      localStorage.setItem(analyticsKey, value);
      location.reload();
    } catch {
      document.querySelector('.analytics-choice')?.remove();
      if (value === 'allowed') startAnalytics();
      else if (consent === 'allowed') location.reload();
    }
  }

  if (consent === 'allowed') startAnalytics();

  const settings = document.querySelector('[data-analytics-toggle]');
  if (settings) {
    settings.hidden = false;
    settings.textContent = consent === 'allowed' ? 'Отключить аналитику' : 'Разрешить аналитику';
    settings.addEventListener('click', () => chooseAnalytics(consent === 'allowed' ? 'denied' : 'allowed'));
    document.querySelector('[data-analytics-status]').textContent =
      consent === 'allowed' ? 'Вы разрешили Google Analytics.' : 'Google Analytics загружается только после вашего согласия.';
  }

  if (consent !== 'allowed' && consent !== 'denied') {
    const choices = document.createElement('aside');
    choices.className = 'analytics-choice';
    choices.setAttribute('aria-label', 'Настройки аналитики');
    choices.innerHTML = '<p>Разрешить Google Analytics для статистики посещений? <a href="privacy.html">О данных</a></p>' +
      '<button class="pill pill-primary" type="button" data-value="allowed">Разрешить</button>' +
      '<button class="pill pill-outline" type="button" data-value="denied">Отклонить</button>';
    for (const choice of choices.querySelectorAll('button')) {
      choice.addEventListener('click', () => chooseAnalytics(choice.dataset.value));
    }
    document.body.append(choices);
  }
}
