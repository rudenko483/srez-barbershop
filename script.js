const dialog = document.querySelector('#panel');
const title = document.querySelector('#panel-title');
const content = document.querySelector('#panel-content');
const titles = {
  menu: 'Меню',
  booking: 'Демозапись',
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

  if (name === 'booking' && button.dataset.service) {
    const choice = content.querySelector('#booking-form').elements.namedItem('service');
    choice.value = button.dataset.service;
  }
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  title.focus({ preventScroll: true });
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-panel]');
  if (button) openPanel(button);
});

content.addEventListener('submit', (event) => {
  const form = event.target;
  if (form.id !== 'booking-form') return;
  event.preventDefault();
  const values = new FormData(form);
  const summary = content.querySelector('#booking-summary');
  summary.querySelector('.summary-service').textContent = values.get('service');
  const notes = values.get('notes').trim();
  const notesText = summary.querySelector('.summary-notes');
  notesText.textContent = notes;
  notesText.hidden = !notes;
  form.hidden = true;
  summary.hidden = false;
  summary.querySelector('h3').focus();
});

content.addEventListener('click', (event) => {
  if (event.target.closest('[data-edit-booking]')) {
    const form = content.querySelector('#booking-form');
    content.querySelector('#booking-summary').hidden = true;
    form.hidden = false;
    form.querySelector('input:checked').focus();
  }
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
  }, { threshold: 0.1 });
  for (const section of document.querySelectorAll('[data-reveal]')) {
    if (section.getBoundingClientRect().top >= window.innerHeight) reveal.observe(section);
  }
}
