document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real application, this would involve a fetch call to an authentication endpoint.
            // For this project, we are simulating a successful login.
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'admin' && password === 'password') {
                console.log('Simulating successful login and redirecting to dashboard...');
                window.location.href = 'admin_dashboard.html';
            } else {
                alert('Invalid credentials. Please try again.');
            }
        });
    }
});