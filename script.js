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

function openPanel(trigger, name, label, ...nodes) {
  if (!dialog.open) opener = trigger;
  dialog.dataset.view = name;
  title.textContent = label;
  content.replaceChildren(...nodes);

  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  title.focus({ preventScroll: true });
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-panel]');
  if (!trigger || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const name = trigger.dataset.panel;
  if (name === 'result') {
    event.preventDefault();
    const card = trigger.closest('.result-card');
    const photo = trigger.querySelector('img').cloneNode();
    photo.className = 'result-enlarged';
    const credit = document.createElement('p');
    credit.className = 'result-credit';
    credit.append(card.querySelector('figcaption > span').cloneNode(true));
    openPanel(trigger, name, card.dataset.label, photo, credit);
    return;
  }
  const template = document.getElementById(name);
  openPanel(trigger, name, titles[name], template.content.cloneNode(true));
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
  const picked = bookingForm.querySelector('#booking-selected');
  function selectedName() {
    return bookingForm.querySelector('input:checked')?.labels[0].querySelector('strong').textContent;
  }
  function showSelection() {
    const service = selectedName();
    picked.textContent = service ? `Выбрано: ${service}` : 'Услуга ещё не выбрана';
  }
  bookingForm.addEventListener('change', showSelection);
  showSelection();
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    summary.querySelector('.summary-service').textContent = selectedName();
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
