document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector('.message-form');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const messageField = form.querySelector('textarea[name="message"]');
            const message = messageField.value.trim();
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            if (!message) {
                alert('Please enter a message before sending.');
                return;
            }

            fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrfToken
                },
                body: new URLSearchParams(new FormData(form))
            })
            .then(response => {
                if (response.ok) {
                    alert('Message sent successfully.');
                    form.reset();
                    location.reload();  // or update UI dynamically instead
                } else {
                    alert('Failed to send message. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert('Something went wrong.');
            });
        });
    }
});
