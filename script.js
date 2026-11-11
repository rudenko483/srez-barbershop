const dialog = document.querySelector('#panel');
const title = document.querySelector('#panel-title');
const content = document.querySelector('#panel-content');
const titles = {
  menu: 'Меню',
  interior: 'Интерьер',
};
let opener;

function describePanelButtons(container) {
  for (const button of container.querySelectorAll('[data-panel]')) {
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', dialog.id);
  }
}

describePanelButtons(document);

function openPanel(button) {
  const name = button.dataset.panel;
  const template = document.getElementById(name);
  if (!dialog.open) opener = button;
  dialog.dataset.view = name;
  title.textContent = titles[name];
  content.replaceChildren(template.content.cloneNode(true));
  describePanelButtons(content);

  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  title.focus({ preventScroll: true });
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-panel]');
  if (button) openPanel(button);
});

content.addEventListener('click', (event) => {
  if (event.target.closest('a[href]') && event.button === 0 &&
      !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    dialog.close();
  }
});

dialog.addEventListener('close', () => {
  if (dialog.open) return;
  content.replaceChildren();
  opener?.focus({ preventScroll: true });
  opener = undefined;
});

let pressedBackdrop = false;
dialog.addEventListener('pointerdown', (event) => {
  pressedBackdrop = event.target === dialog;
});
dialog.addEventListener('click', (event) => {
  if (pressedBackdrop && event.target === dialog) dialog.close();
  pressedBackdrop = false;
});

if ('IntersectionObserver' in window && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  for (const section of document.querySelectorAll('[data-reveal]')) {
    if (section.getBoundingClientRect().top >= window.innerHeight) reveal.observe(section);
  }
}

const bookingForm = document.querySelector('#booking-form');
if (bookingForm) {
  const summary = document.querySelector('#booking-summary');
  const heading = summary.querySelector('h2');
  const notesText = summary.querySelector('.summary-notes');
  const choices = bookingForm.elements.namedItem('service');
  const requested = new URLSearchParams(location.search).get('service');
  if (requested) choices.value = requested;
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const selection = bookingForm.querySelector('input:checked');
    summary.querySelector('.summary-service').textContent = selection.labels[0].querySelector('strong').textContent;
    const notes = bookingForm.elements.namedItem('notes').value.trim();
    notesText.textContent = notes;
    notesText.hidden = !notes;
    bookingForm.hidden = true;
    summary.hidden = false;
    heading.focus();
  });
  summary.querySelector('[data-edit-booking]').addEventListener('click', () => {
    summary.hidden = true;
    bookingForm.hidden = false;
    bookingForm.querySelector('input:checked').focus();
  });
  bookingForm.hidden = false;
}

const gallery = document.querySelector('[data-gallery]');
if (gallery) {
  const slides = [...gallery.querySelectorAll('.gallery-slide')];
  const choices = [...gallery.querySelectorAll('[data-gallery-choice]')];
  const count = gallery.querySelector('[data-gallery-count]');
  const status = gallery.querySelector('[data-gallery-status]');
  let active = -1;

  function showSlide(next, direction = 1) {
    const index = (next + slides.length) % slides.length;
    if (index === active) return;
    active = index;
    slides.forEach((slide, number) => {
      slide.hidden = number !== index;
      choices[number].setAttribute('aria-pressed', String(number === index));
    });
    gallery.style.setProperty('--gallery-travel', direction < 0 ? '-2rem' : '2rem');
    count.textContent = `${index + 1} / ${slides.length}`;
    status.textContent = `${slides[index].dataset.label}. Кадр ${index + 1} из ${slides.length}.`;
  }

  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-gallery-step')) {
      const step = Number(button.dataset.galleryStep);
      showSlide(active + step, step);
    } else if (button.hasAttribute('data-gallery-choice')) {
      const index = Number(button.dataset.galleryChoice);
      showSlide(index, Math.sign(index - active));
    }
  });
  gallery.addEventListener('keydown', (event) => {
    if (!event.target.closest('[data-gallery-controls]')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.key === 'ArrowLeft' ? -1 : 1;
    showSlide(active + step, step);
  });
  showSlide(0);
  gallery.classList.add('gallery-ready');
  gallery.querySelector('[data-gallery-controls]').hidden = false;
}
