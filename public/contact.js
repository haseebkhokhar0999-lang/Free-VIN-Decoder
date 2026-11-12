function bootContactForm() {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');
  const statusBox = document.getElementById('contact-status');

  if (!form || !nameInput || !emailInput || !messageInput || !submitBtn || !statusBox) return;

  function showStatus(msg, isError) {
    statusBox.className = isError ? 'alert alert-error' : 'alert alert-success';
    statusBox.textContent = msg;
    statusBox.hidden = false;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !email || !message) {
      showStatus('Please fill in your name, email address, and feedback message.', true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    statusBox.hidden = true;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showStatus(data?.message || 'Could not send feedback right now. Please try again.', true);
        return;
      }

      showStatus(data?.message || 'Thank you for your website feedback!', false);
      form.reset();
    } catch {
      showStatus('Network error while sending feedback. Please try again in a moment.', true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootContactForm);
} else {
  bootContactForm();
}

