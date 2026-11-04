'use strict';

const bench = document.querySelector('#bench');
const result = document.querySelector('#result');

function compareReadings() {
    const previous = bench.elements.previous.valueAsNumber;
    const current = bench.elements.current.valueAsNumber;
    if (![previous, current].every(value => Number.isSafeInteger(value) && value >= 0)) {
        result.textContent = 'Input check failed. Enter two non-negative whole numbers within the safe integer range.';
    } else if (current < previous) {
        result.textContent = 'Flag for review. The current reading is lower than the previous one.';
    } else {
        const usage = current - previous;
        result.textContent = usage === 0
            ? 'Valid reading. No units consumed in this period.'
            : 'Valid reading. Consumption: ' + usage.toLocaleString() + (usage === 1 ? ' unit.' : ' units.');
    }
}

bench.addEventListener('submit', event => {
    event.preventDefault();
    compareReadings();
});
bench.addEventListener('input', () => {
    result.textContent = 'Readings changed. Run the check again.';
});
bench.querySelectorAll('[data-pair]').forEach(button => {
    button.addEventListener('click', () => {
        const [previous, current] = button.dataset.pair.split(',');
        bench.elements.previous.value = previous;
        bench.elements.current.value = current;
        compareReadings();
    });
});

const contact = document.querySelector('#contact-form');
const statusLine = document.querySelector('#contact-status');
contact.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = contact.querySelector('button[type="submit"]');
    if (submit.disabled) return;
    const payload = Object.fromEntries(new FormData(contact));
    submit.disabled = true;
    statusLine.textContent = 'Sending your message…';
    try {
        const response = await fetch(contact.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload)
        });
        const body = await response.json();
        if (!response.ok || !body.success) throw new Error('Delivery failed');
        if (['name', 'email', 'message'].every(key => contact.elements[key].value === payload[key])) contact.reset();
        statusLine.textContent = 'Message sent. Thanks for getting in touch.';
    } catch {
        statusLine.textContent = 'Delivery failed. Your message is still here. Try again or use the email link.';
    } finally {
        submit.disabled = false;
    }
});
