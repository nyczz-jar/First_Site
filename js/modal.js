// Modal handling for Contact form
document.addEventListener('DOMContentLoaded', function () {
    var openButtons = document.querySelectorAll('#contactBtn');
    var modal = document.getElementById('contactModal');
    if (!modal) return;
    var overlay = modal.querySelector('.contact-modal__overlay');
    var closeBtns = modal.querySelectorAll('[data-close]');

    function openModal() {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        // focus first input inside modal
        var firstInput = modal.querySelector('input, button, textarea');
        if (firstInput) firstInput.focus();
    }
    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    openButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openModal();
        });
    });

    if (overlay) overlay.addEventListener('click', closeModal);
    closeBtns.forEach(function (b) { b.addEventListener('click', closeModal); });

    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') closeModal();
    });
});
