(() => {
  const script = document.currentScript;
  const theme = script.dataset.theme;
  const dialog = document.createElement('dialog');
  dialog.className = 'receipt-screen receipt-' + theme;
  dialog.setAttribute('aria-labelledby', 'receipt-screen-title');
  dialog.setAttribute('aria-describedby', 'receipt-screen-note');
  dialog.innerHTML = `
    <form method="dialog" class="receipt-dismiss"><button aria-label="Закрыть подтверждение">×</button></form>
    <div class="receipt-copy">
      <svg class="receipt-mark" width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <circle cx="48" cy="48" r="43" /><path d="m29 49 13 13 26-28" />
      </svg>
      <h2 id="receipt-screen-title" tabindex="-1"></h2>
      <p class="receipt-detail"></p>
      <p id="receipt-screen-note"></p>
      <form method="dialog"><button class="receipt-back"></button></form>
    </div>`;
  document.body.append(dialog);
  const title = dialog.querySelector('h2');
  const detail = dialog.querySelector('.receipt-detail');
  const description = dialog.querySelector('#receipt-screen-note');
  const back = dialog.querySelector('.receipt-back');
  let opener;

  window.showPortfolioReceipt = ({ heading, summary, note, action, trigger = document.activeElement }) => {
    if (dialog.open) return;
    opener = trigger;
    title.textContent = heading;
    detail.textContent = summary;
    description.textContent = note;
    back.textContent = action;
    dialog.showModal();
    title.focus({ preventScroll: true });
  };
  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
})();
