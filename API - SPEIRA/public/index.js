document.body.classList.add('fade-in');

document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.body.classList.remove('fade-in');
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = this.href;
            }, 400);
        });
    }
});

const toggleBtn = document.getElementById('toggleFooterBtn');
const miniFooter = document.getElementById('miniFooter');

toggleBtn.addEventListener('click', () => {
    miniFooter.classList.toggle('hidden');
});

