document.getElementById('loginForm').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    const usuario = form.usuario.value.trim();
    const password = form.password.value;

    const datos = { password };

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
            Swal.fire({
                title: 'Verificando credenciales',
                html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <img src="https://cdn-icons-png.flaticon.com/512/5957/5957596.png" width="60" style="margin-bottom: 10px;" />
        <p style="font-size: 16px;">Por favor espera un momento...</p>
      </div>
    `,
                background: '#f0f2f5',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                timer: 2000,
                timerProgressBar: true
            }).then(() => {
                return Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    background: '#d4edda',
                    color: '#155724',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
            }).then(() => {
                window.location.href = '/api-docs';
            });
        }

        else {
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
            }, 400);
        });
    }
});

