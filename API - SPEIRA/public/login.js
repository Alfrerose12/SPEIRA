document.getElementById('loginForm').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    const datos = {
        nombre: form.nombre.value,
        password: form.password.value
    };
    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await res.json();
        if (res.ok) {
            window.location.href = '/api-docs';
        } else {
            document.getElementById('mensaje').innerText = data.error || 'Error al iniciar sesión';
        }
    } catch (err) {
        document.getElementById('mensaje').innerText = 'No se pudo conectar al servidor';
    }
};