// Stopp alle native drag/ghost på touch og mus globalt for stickers
document.addEventListener('dragstart', e => {
  if (e.target.closest('.sticker')) e.preventDefault();
});

// Draggable stickers
let anyDragging = false;

document.querySelectorAll('.sticker').forEach(sticker => {
  let dragging = false, startX, startY, startLeft, startTop;

  const onStart = (x, y) => {
    dragging = true;
    anyDragging = true;
    startX = x; startY = y;
    const rect = sticker.getBoundingClientRect();
    startLeft = rect.left + window.scrollX;
    startTop  = rect.top  + window.scrollY;
    sticker.style.left   = startLeft + 'px';
    sticker.style.top    = startTop  + 'px';
    sticker.style.right  = 'auto';
    sticker.style.zIndex = 200;
    sticker.classList.add('is-dragging');
  };

  const onMove = (x, y) => {
    if (!dragging) return;
    sticker.style.left = (startLeft + x - startX) + 'px';
    sticker.style.top  = (startTop  + y - startY) + 'px';
  };

  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    anyDragging = false;
    sticker.style.zIndex = '';
    sticker.classList.remove('is-dragging');
  };

  sticker.addEventListener('mousedown', e => {
    onStart(e.clientX, e.clientY);
    e.preventDefault();
  });
  sticker.addEventListener('dragstart', e => e.preventDefault());

  document.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
  document.addEventListener('mouseup', onEnd);

  sticker.addEventListener('touchstart', e => {
    onStart(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
    e.stopPropagation();
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (dragging) {
      onMove(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchend', onEnd, { passive: true });
  document.addEventListener('touchcancel', onEnd, { passive: true });
});

// Konvolutt-animasjon
const overlay  = document.getElementById('envelope-overlay');
const envelope = document.getElementById('envelope');

if (overlay && envelope) {
  const openEnvelope = () => {
    overlay.removeEventListener('click', openEnvelope);
    envelope.classList.add('opening');
    setTimeout(() => overlay.classList.add('fade-out'), 1000);
    setTimeout(() => { overlay.style.display = 'none'; }, 1900);
  };
  overlay.addEventListener('click', openEnvelope);
}

// RSVP-skjema
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWriCnKMnMg-iyptcYISLRhWdoAawpYaxzLvmbnGpKKYZa-KU2DOuS5xiG9EQIKI2nPg/exec';

const form       = document.getElementById('rsvpForm');
const successMsg = document.getElementById('formSuccess');
const errorMsg   = document.getElementById('formError');
const submitBtn  = form ? form.querySelector('.submit-btn') : null;

function showSuccess(attending) {
  const heading = document.getElementById('successHeading');
  const text    = document.getElementById('successText');

  if (attending === 'Ja') {
    heading.textContent = 'Takk for svaret!';
    text.textContent    = 'Vi gleder oss så til å feire med deg. Vel møtt til fest!';
  } else {
    heading.textContent = 'Det var synd!';
    text.textContent    = 'Vi tar en skål for deg allikevel :)';
  }

  document.getElementById('rsvpHeading').style.display = 'none';
  document.getElementById('rsvpIntro').style.display   = 'none';
  form.style.display = 'none';
  successMsg.classList.remove('hidden');
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameVal   = form.elements['name'].value.trim();
    const attending = form.querySelector('input[name="attending"]:checked');

    if (!nameVal)   { alert('Vennligst fyll inn navn.'); return; }
    if (!attending) { alert('Vennligst velg om du kommer eller ikke.'); return; }

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sender…';
    errorMsg.classList.add('hidden');

    const params = new URLSearchParams({
      name:      nameVal,
      attending: attending.value,
      allergies: form.elements['allergies'].value.trim(),
      message:   form.elements['message'].value.trim(),
      timestamp: new Date().toLocaleString('no-NO'),
    });

    fetch(APPS_SCRIPT_URL + '?' + params.toString(), { method: 'GET', mode: 'no-cors' })
      .then(() => showSuccess(attending.value))
      .catch(() => showSuccess(attending.value)); // vis suksess uansett — no-cors gir alltid opaque respons
  });
}
