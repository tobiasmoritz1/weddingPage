/**
 * JENNIFER & TOBIAS - HOCHZEITS-WEBSITE
 * Interaktive Logik: Countdown, Kalender, RSVP, FAQ & Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initCalendarExport();
  initRsvpForm();
  initAddressCopy();
  initMobileNav();
  initFaqAccordion();
  initScrollSpy();
});

/* ==========================================================================
   1. LIVE COUNTDOWN ZUR HOCHZEIT (26. Juni 2027, 14:00 Uhr)
   ========================================================================== */
function initCountdown() {
  // Zielzeit: 26. Juni 2027 um 14:00 Uhr MESZ (UTC+2)
  const targetDate = new Date('2027-06-26T14:00:00+02:00').getTime();

  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minutesEl = document.getElementById('cdMinutes');
  const secondsEl = document.getElementById('cdSeconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      const cdTitle = document.querySelector('.countdown-title');
      if (cdTitle) cdTitle.textContent = 'Heute ist unser großer Tag! 💍';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = days.toString().padStart(2, '0');
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. IN DEN KALENDER EINTRAGEN (.ICS & GOOGLE CALENDAR)
   ========================================================================== */
function initCalendarExport() {
  const btn = document.getElementById('addToCalendarBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const event = {
      title: 'Hochzeit von Jennifer & Tobias',
      description: 'Come for the love, stay for the party! Freie Trauung um 14:00 Uhr (Ankunft bitte um 13:45 Uhr) im Hubertushof Fährbrück.',
      location: 'Hubertushof, Fährbrück 2, 97262 Fährbrück bei Hausen',
      start: '20270626T114500Z', // 13:45 MESZ = 11:45 UTC
      end: '20270627T020000Z'    // Open End
    };

    // Google Calendar URL oder .ics Datei
    // Für iOS / Mac & Outlook generieren wir eine native .ics Datei zum Download
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Jennifer und Tobias//Hochzeit//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      `DTSTART:${event.start}`,
      `DTEND:${event.end}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'Hochzeit-Jennifer-und-Tobias.ics');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  });
}

/* ==========================================================================
   3. ADRESSE IN ZWISCHENABLAGE KOPIEREN
   ========================================================================== */
function initAddressCopy() {
  const btn = document.getElementById('copyAddressBtn');
  const toast = document.getElementById('copyToast');
  if (!btn || !toast) return;

  btn.addEventListener('click', () => {
    const address = 'Hubertushof, Fährbrück 2, 97262 Fährbrück bei Hausen';
    navigator.clipboard.writeText(address).then(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    }).catch(() => {
      prompt('Adresse kopieren:', address);
    });
  });
}

/* ==========================================================================
   4. INTERAKTIVES RSVP FORMULAR (Zusage / Absage)
   ========================================================================== */
function initRsvpForm() {
  const form = document.getElementById('weddingRsvpForm');
  const modal = document.getElementById('confirmationModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const modalOk = document.getElementById('modalOkBtn');
  const modalDesc = document.getElementById('modalDesc');
  const modalSummary = document.getElementById('modalSummary');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      id: Date.now(),
      attendance: formData.get('attendance'), // 'ja' oder 'nein'
      name: formData.get('guestName'),
      email: formData.get('guestEmail'),
      count: formData.get('guestCount'),
      diet: formData.get('guestDiet'),
      allergies: formData.get('guestAllergies') || 'Keine angegeben',
      song: formData.get('guestSong') || 'Kein Wunschsong',
      message: formData.get('guestMessage') || '-',
      submittedAt: new Date().toLocaleString('de-DE')
    };

    // Im LocalStorage speichern (damit das Brautpaar alle Einsendungen einsehen kann)
    saveRsvpToLocal(data);

    // Modal befüllen
    if (data.attendance === 'ja') {
      modalDesc.innerHTML = `Vielen Dank, <strong>${escapeHtml(data.name)}</strong>! Wir haben deine Zusage mit <strong>${escapeHtml(data.count)} Person(en)</strong> freudig notiert. Wir können es kaum erwarten, am 26. Juni 2027 mit dir/euch anzustoßen! 🎉🥂`;
    } else {
      modalDesc.innerHTML = `Vielen Dank für deine Rückmeldung, <strong>${escapeHtml(data.name)}</strong>. Wir bedauern sehr, dass du/ihr nicht dabei sein könnt, danken dir aber herzlich für die Nachricht! 🤍`;
    }

    modalSummary.innerHTML = `
      <strong>Zusammenfassung deiner Rückmeldung:</strong><br>
      • Status: ${data.attendance === 'ja' ? '✅ Zusage' : '❌ Absage'}<br>
      • Name(n): ${escapeHtml(data.name)} (${escapeHtml(data.email)})<br>
      • Personen: ${escapeHtml(data.count)}<br>
      • Menü: ${escapeHtml(data.diet)} (Allergien: ${escapeHtml(data.allergies)})<br>
      ${data.song ? `• Wunschsong: 🎶 ${escapeHtml(data.song)}<br>` : ''}
      ${data.message && data.message !== '-' ? `• Nachricht: „${escapeHtml(data.message)}“` : ''}
    `;

    // Modal anzeigen
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    // Formular zurücksetzen
    form.reset();
  });

  // Modal Schließen
  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOk) modalOk.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Admin Modal & CSV Export
  initAdminRsvpViewer();
}

function saveRsvpToLocal(rsvp) {
  try {
    const existing = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    existing.push(rsvp);
    localStorage.setItem('wedding_rsvps', JSON.stringify(existing));
  } catch (err) {
    console.warn('LocalStorage nicht verfügbar', err);
  }
}

function initAdminRsvpViewer() {
  const showBtn = document.getElementById('showRsvpListBtn');
  const adminModal = document.getElementById('adminModal');
  const adminClose = document.getElementById('adminModalCloseBtn');
  const tbody = document.getElementById('rsvpTableBody');
  const exportBtn = document.getElementById('exportCsvBtn');
  const clearBtn = document.getElementById('clearRsvpBtn');

  if (!showBtn || !adminModal) return;

  function renderTable() {
    const list = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    tbody.innerHTML = '';

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 20px; color: #888;">Bisher sind noch keine Rückmeldungen gespeichert.</td></tr>';
      return;
    }

    list.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.attendance === 'ja' ? '<span style="color:#6D7736;font-weight:bold;">Zusage</span>' : '<span style="color:#a84040;">Absage</span>'}</td>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${escapeHtml(item.email)}</td>
        <td>${escapeHtml(item.count)}</td>
        <td>${escapeHtml(item.diet)}</td>
        <td>${escapeHtml(item.allergies)}</td>
        <td>${escapeHtml(item.song)}</td>
        <td>${escapeHtml(item.message)}</td>
        <td><small>${escapeHtml(item.submittedAt)}</small></td>
      `;
      tbody.appendChild(tr);
    });
  }

  showBtn.addEventListener('click', () => {
    renderTable();
    adminModal.classList.add('open');
    adminModal.setAttribute('aria-hidden', 'false');
  });

  const closeAdmin = () => {
    adminModal.classList.remove('open');
    adminModal.setAttribute('aria-hidden', 'true');
  };

  if (adminClose) adminClose.addEventListener('click', closeAdmin);
  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) closeAdmin();
  });

  // CSV Export
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const list = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
      if (list.length === 0) {
        alert('Keine Einträge zum Exportieren vorhanden.');
        return;
      }

      let csv = '\uFEFF'; // UTF-8 BOM für Excel
      csv += 'Status;Name;Email;Personen;Essen;Allergien;Musikwunsch;Nachricht;Datum\n';
      list.forEach(r => {
        csv += `"${r.attendance}";"${r.name}";"${r.email}";"${r.count}";"${r.diet}";"${r.allergies}";"${r.song}";"${r.message}";"${r.submittedAt}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'Hochzeit-Jennifer-Tobias-RSVP-Liste.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  // Clear RSVPs
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Möchtest du wirklich alle gespeicherten Rückmeldungen löschen?')) {
        localStorage.removeItem('wedding_rsvps');
        renderTable();
      }
    });
  }
}

/* ==========================================================================
   5. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('navMenu');
  const closeBtn = document.getElementById('mobileClose');
  const backdrop = document.getElementById('navBackdrop');
  const links = document.querySelectorAll('.nav-link, .btn-nav');

  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });
}

/* ==========================================================================
   6. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const questions = document.querySelectorAll('.faq-question');

  questions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');

      // Schließe andere
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle diesen
      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
        q.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   7. SCROLL-SPY & HEADER SCHATTEN
   ========================================================================== */
function initScrollSpy() {
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Header Schatten
    if (header) {
      if (scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Aktiver Menüpunkt
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   HILFSFUNKTIONEN
   ========================================================================== */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
