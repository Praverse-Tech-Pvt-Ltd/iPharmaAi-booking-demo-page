(function () {
  'use strict';

  var PERSONAL_EMAIL_DOMAINS = new Set([
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
    'icloud.com', 'aol.com', 'protonmail.com', 'proton.me', 'rediffmail.com',
    'zoho.com', 'gmx.com', 'yandex.com', 'mail.com',
  ]);

  function isPersonalEmail(email) {
    var domain = (email.split('@')[1] || '').toLowerCase().trim();
    return !!domain && PERSONAL_EMAIL_DOMAINS.has(domain);
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function getCookie(name) {
    var match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? decodeURIComponent(match[2]) : null;
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function toDateKey(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function to12h(time) {
    var parts = time.split(':').map(Number);
    var h = parts[0], m = parts[1];
    var period = h >= 12 ? 'PM' : 'AM';
    var h12 = (h % 12) || 12;
    return h12 + ':' + pad2(m) + ' ' + period;
  }

  function generateTimeSlots() {
    var slots = [];
    for (var h = 9; h <= 17; h++) {
      slots.push(pad2(h) + ':00');
      if (h < 17) slots.push(pad2(h) + ':30');
    }
    return slots;
  }

  var WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  document.addEventListener('DOMContentLoaded', function () {
    var STEPS = ['email', 'details', 'calendar', 'confirmed'];
    var ORDERED_DOT_STEPS = ['email', 'details', 'calendar'];

    var state = {
      step: 'email',
      email: '',
      fullName: '',
      meetingUrl: null,
      confirmedDate: null,
      confirmedTime: null,
    };

    var stepEls = {};
    STEPS.forEach(function (s) { stepEls[s] = document.querySelector('[data-step="' + s + '"]'); });
    var stepHeading = document.getElementById('step-heading');
    var dotEls = Array.prototype.slice.call(document.querySelectorAll('.step-dot'));

    function showStep(name) {
      state.step = name;
      STEPS.forEach(function (s) {
        var el = stepEls[s];
        if (!el) return;
        if (s === name) {
          el.classList.add('is-active', 'transitioning-in');
          requestAnimationFrame(function () {
            setTimeout(function () { el.classList.remove('transitioning-in'); }, 350);
          });
        } else {
          el.classList.remove('is-active', 'transitioning-in');
        }
      });

      stepHeading.textContent = name === 'confirmed' ? "You're booked!" : 'Book your demo';

      var activeIdx = ORDERED_DOT_STEPS.indexOf(name);
      dotEls.forEach(function (dot, i) {
        var done = name === 'confirmed' || activeIdx > i;
        var active = activeIdx === i;
        dot.classList.toggle('active', active);
        dot.classList.toggle('done', done && !active);
      });

      if (name === 'email') {
        var emailInput = document.getElementById('email-input');
        if (emailInput) emailInput.focus();
      }
      if (name === 'details') {
        var nameInput = document.getElementById('fullname-input');
        if (nameInput) nameInput.focus();
      }
    }

    // ── STEP 1: email ──
    var emailForm = document.getElementById('step-email');
    var emailInput = document.getElementById('email-input');
    var emailError = document.getElementById('email-error');

    emailInput.addEventListener('input', function () {
      emailError.hidden = true;
      emailInput.classList.remove('error');
    });

    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = emailInput.value.trim();

      if (!validateEmail(value)) {
        emailError.textContent = 'Please enter a valid work email.';
        emailError.hidden = false;
        emailInput.classList.add('error');
        return;
      }
      if (isPersonalEmail(value)) {
        emailError.textContent = 'Please use your work email, not a personal email.';
        emailError.hidden = false;
        emailInput.classList.add('error');
        return;
      }

      emailError.hidden = true;
      emailInput.classList.remove('error');
      state.email = value;
      document.getElementById('email-input-2').value = value;
      showStep('details');
    });

    // ── STEP 2: details ──
    var detailsForm = document.getElementById('step-details');
    detailsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      state.fullName = document.getElementById('fullname-input').value.trim();
      state.email = document.getElementById('email-input-2').value.trim();
      showStep('calendar');
    });

    // ── STEP 3: calendar widget ──
    var calendarRoot = document.getElementById('calendar-root');
    var bookingErrorBanner = document.getElementById('booking-error');

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var calState = {
      currentMonth: new Date(today.getFullYear(), today.getMonth(), 1),
      selectedDate: null,
      selectedTime: null,
      is24h: false,
      bookedSlots: new Set(),
      availLoading: false,
      isBooking: false,
    };

    function isAvailableDay(year, month, day) {
      var d = new Date(year, month, day);
      var dow = d.getDay();
      return d >= today && dow !== 0 && dow !== 6;
    }

    function renderCalendar() {
      var year = calState.currentMonth.getFullYear();
      var month = calState.currentMonth.getMonth();
      var firstDay = new Date(year, month, 1).getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var canGoPrev = new Date(year, month - 1, 1) >= new Date(today.getFullYear(), today.getMonth(), 1);

      var displayName = state.fullName || 'there';

      var html = '';
      html += '<div class="calendar-host">';
      html += '  <div class="calendar-host-avatar">' + displayName.charAt(0).toUpperCase() + '</div>';
      html += '  <div><p class="calendar-host-name">' + escapeHtml(displayName) + '</p>';
      html += '  <p class="calendar-host-meta">Audit Mind Demo · 30 min · MS Teams</p></div>';
      html += '</div>';

      html += '<div class="calendar-header">';
      html += '  <span class="font-semibold text-sm"><span class="month">' + MONTHS[month] + '</span> <span class="year">' + year + '</span></span>';
      html += '  <div class="calendar-nav">';
      html += '    <button type="button" id="cal-prev" ' + (canGoPrev ? '' : 'disabled') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>';
      html += '    <button type="button" id="cal-next"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>';
      html += '  </div>';
      html += '</div>';

      html += '<div class="calendar-grid">';
      WEEKDAYS.forEach(function (d) { html += '<div class="calendar-weekday">' + d + '</div>'; });

      var cells = [];
      for (var i = 0; i < firstDay; i++) cells.push(null);
      for (var d2 = 1; d2 <= daysInMonth; d2++) cells.push(d2);
      while (cells.length % 7 !== 0) cells.push(null);

      cells.forEach(function (day) {
        if (!day) { html += '<div class="calendar-cell"></div>'; return; }
        var available = isAvailableDay(year, month, day);
        var isToday = new Date(year, month, day).getTime() === today.getTime();
        var isSelected = calState.selectedDate &&
          calState.selectedDate.getFullYear() === year &&
          calState.selectedDate.getMonth() === month &&
          calState.selectedDate.getDate() === day;
        var classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (isSelected) classes.push('selected');
        if (!available) classes.push('disabled');
        html += '<div class="calendar-cell"><button type="button" class="' + classes.join(' ') + '" data-day="' + day + '" ' + (available ? '' : 'disabled') + '>' + day + '</button></div>';
      });
      html += '</div>';

      html += '<div id="slots-area"></div>';

      calendarRoot.innerHTML = html;

      document.getElementById('cal-prev').addEventListener('click', function () {
        calState.currentMonth = new Date(year, month - 1, 1);
        renderCalendar();
      });
      document.getElementById('cal-next').addEventListener('click', function () {
        calState.currentMonth = new Date(year, month + 1, 1);
        renderCalendar();
      });
      Array.prototype.slice.call(calendarRoot.querySelectorAll('.calendar-day:not(.disabled)')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          calState.selectedDate = new Date(year, month, Number(btn.dataset.day));
          calState.selectedTime = null;
          renderCalendar();
          loadAvailability();
        });
      });

      if (calState.selectedDate) renderSlots();
    }

    function escapeHtml(s) {
      var div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML;
    }

    function loadAvailability() {
      calState.availLoading = true;
      calState.bookedSlots = new Set();
      renderSlots();

      var dateKey = toDateKey(calState.selectedDate);
      fetch('/api/availability?date=' + dateKey)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.bookedSlots) calState.bookedSlots = new Set(data.bookedSlots);
        })
        .catch(function () { /* silently ignore — leave all slots open */ })
        .finally(function () {
          calState.availLoading = false;
          renderSlots();
        });
    }

    function renderSlots() {
      var area = document.getElementById('slots-area');
      if (!area) return;
      var slots = generateTimeSlots();
      var selectedLabel = calState.selectedDate
        ? calState.selectedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
        : '';

      var html = '';
      html += '<div class="slots-header">';
      html += '  <p>' + (calState.availLoading ? 'Checking availability…' : selectedLabel) + '</p>';
      html += '  <div class="format-toggle">';
      html += '    <button type="button" data-fmt="12h" class="' + (!calState.is24h ? 'active' : '') + '">12h</button>';
      html += '    <button type="button" data-fmt="24h" class="' + (calState.is24h ? 'active' : '') + '">24h</button>';
      html += '  </div>';
      html += '</div>';

      html += '<div class="slots-grid custom-scroll">';
      if (calState.availLoading) {
        for (var i = 0; i < 8; i++) html += '<div class="slot-skeleton"></div>';
      } else {
        slots.forEach(function (slot) {
          var booked = calState.bookedSlots.has(slot);
          var selected = calState.selectedTime === slot;
          var classes = ['slot-btn'];
          if (selected) classes.push('selected');
          if (booked) classes.push('booked');
          html += '<button type="button" class="' + classes.join(' ') + '" data-slot="' + slot + '" ' + (booked ? 'disabled' : '') + '>' + (calState.is24h ? slot : to12h(slot)) + '</button>';
        });
      }
      html += '</div>';

      if (calState.selectedTime && !calState.isBooking) {
        html += '<button type="button" id="confirm-slot-btn" class="shimmer-btn btn-primary confirm-slot-btn">Confirm booking — ' + (calState.is24h ? calState.selectedTime : to12h(calState.selectedTime)) + '</button>';
      }
      if (calState.isBooking) {
        html += '<div class="booking-loading"><svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Booking your slot…</div>';
      }

      area.innerHTML = html;

      Array.prototype.slice.call(area.querySelectorAll('[data-fmt]')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          calState.is24h = btn.dataset.fmt === '24h';
          renderSlots();
        });
      });
      Array.prototype.slice.call(area.querySelectorAll('[data-slot]:not([disabled])')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          calState.selectedTime = btn.dataset.slot;
          renderSlots();
        });
      });
      var confirmBtn = document.getElementById('confirm-slot-btn');
      if (confirmBtn) confirmBtn.addEventListener('click', confirmBooking);
    }

    function confirmBooking() {
      calState.isBooking = true;
      bookingErrorBanner.hidden = true;
      renderSlots();

      var nameParts = state.fullName.trim().split(/\s+/);
      var firstName = nameParts[0] || '';
      var lastName = nameParts.slice(1).join(' ') || '-';

      var payload = {
        first_name: firstName,
        last_name: lastName,
        full_name: state.fullName,
        email: state.email,
        phone: document.getElementById('mobile-input').value,
        country: document.getElementById('country-input').value,
        company: document.getElementById('company-input').value,
        company_domain: document.getElementById('company-domain-input').value,
        service: document.getElementById('service-input').value,
        question: document.getElementById('question-input').value,
        date: toDateKey(calState.selectedDate),
        time: calState.selectedTime,
      };

      fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (result) {
          if (!result.ok) throw new Error(result.data.error || 'Booking failed. Please try again.');
          state.confirmedDate = calState.selectedDate;
          state.confirmedTime = calState.selectedTime;
          state.meetingUrl = result.data.meetingUrl || null;
          showConfirmed();
          showStep('confirmed');
        })
        .catch(function (err) {
          bookingErrorBanner.textContent = err.message || 'Something went wrong.';
          bookingErrorBanner.hidden = false;
        })
        .finally(function () {
          calState.isBooking = false;
          renderSlots();
        });
    }

    // ── STEP 4: confirmed ──
    function showConfirmed() {
      var dateShort = state.confirmedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      document.getElementById('confirmed-title').textContent = 'See you on ' + dateShort + ' at ' + to12h(state.confirmedTime);
      document.getElementById('confirmed-sub').innerHTML = 'Invite sent to <strong>' + escapeHtml(state.email) + '</strong>';

      var dateFull = state.confirmedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      document.getElementById('confirmed-date').textContent = dateFull;
      document.getElementById('confirmed-time').textContent = to12h(state.confirmedTime) + ' - 30 minutes';

      var meetingEl = document.getElementById('confirmed-meeting');
      if (state.meetingUrl) {
        meetingEl.innerHTML = '<a href="' + state.meetingUrl + '" target="_blank" rel="noopener noreferrer">Join video call</a>';
      } else {
        meetingEl.textContent = 'Video link in your calendar invite';
      }
    }

    document.getElementById('book-another-btn').addEventListener('click', function () {
      state.step = 'email';
      state.email = '';
      state.fullName = '';
      state.meetingUrl = null;
      state.confirmedDate = null;
      state.confirmedTime = null;
      calState.selectedDate = null;
      calState.selectedTime = null;
      calState.bookedSlots = new Set();
      emailForm.reset();
      detailsForm.reset();
      bookingErrorBanner.hidden = true;
      renderCalendar();
      showStep('email');
    });

    renderCalendar();
    showStep('email');
  });
})();
