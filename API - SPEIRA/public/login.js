document.getElementById('loginForm').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    const usuario = form.usuario.value.trim();
    const password = form.password.value;

    const datos = { password };

    // Si tiene un @ se asume que es correo, si no, es nombre
    if (usuario.includes('@')) {
        datos.email = usuario;
    } else {
        datos.nombre = usuario;
    }

    try {
        const res = await fetch('/api/usuario/iniciar-sesion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await res.json();
        if (res.ok) {
            window.location.href = '/api-docs';
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error || 'Error al iniciar sesión'
            });
        }
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo conectar al servidor'
        });
    }
};

document.getElementById('loginBtn').onclick = function (e) {
    e.preventDefault();
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
};


document.addEventListener('DOMContentLoaded', () => {
    const regresoLink = document.querySelector('.regreso');

    if (regresoLink) {
        regresoLink.addEventListener('click', function (e) {
            e.preventDefault();
            document.body.classList.remove('fade-in');
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = this.href;
            }, 400); // Tiempo igual al de la animación
        });
    }
});

