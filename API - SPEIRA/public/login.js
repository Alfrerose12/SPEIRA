document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const regresoLink = document.querySelector('.regreso');

    if (loginForm) {
        loginForm.onsubmit = async function (e) {
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
                    body: JSON.stringify(datos),
                    credentials: 'include'
                });

                const data = await res.json();
                if (res.ok) {
                    if (data.rol && data.rol.toLowerCase() !== 'admin') {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Acceso denegado',
                            text: 'No tienes permisos de administrador para acceder a esta sección.'
                        });
                        return;
                    }
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
                        timer: 1000,
                        timerProgressBar: true
                    }).then(() => {
                        return Swal.fire({
                            icon: 'success',
                            title: '¡Acceso concedido!',
                            showConfirmButton: false,
                            timer: 1000,
                            timerProgressBar: true,
                            background: '#d4edda',
                            color: '#155724',
                            allowOutsideClick: false,
                            allowEscapeKey: false
                        });
                    }).then(() => {
                        window.location.href = '/api-docs';
                    });
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
    }

    if (loginBtn && loginForm) {
        loginBtn.onclick = function (e) {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        };
    }

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

const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const toggleIcon = document.getElementById('toggleIcon');

togglePassword.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleIcon.classList.toggle('fa-eye');
    toggleIcon.classList.toggle('fa-eye-slash');
});
