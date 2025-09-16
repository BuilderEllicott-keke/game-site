// Enhanced login script with modern UI interactions
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const buttonText = document.getElementById('button-text');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Password toggle functionality
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Form validation
    function validateForm() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username) {
            showError('Please enter your username');
            return false;
        }
        
        if (!password) {
            showError('Please enter your password');
            return false;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return false;
        }
        
        return true;
    }

    // Show error message
    function showError(message) {
        hideMessages();
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        hideMessages();
        successMessage.textContent = message;
        successMessage.style.display = 'block';
    }

    // Hide all messages
    function hideMessages() {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
    }

    // Set loading state
    function setLoading(loading) {
        if (loading) {
            loadingSpinner.style.display = 'inline-block';
            buttonText.textContent = 'Signing in...';
            loginButton.disabled = true;
        } else {
            loadingSpinner.style.display = 'none';
            buttonText.textContent = 'Sign In';
            loginButton.disabled = false;
        }
    }

    // Form submission
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        hideMessages();
        setLoading(true);

        // Simulate a small delay for better UX
        setTimeout(() => {
            fetch('/.netlify/functions/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username, 
                    password,
                    action: 'login'
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showSuccess('Login successful! Redirecting...');
                    
                    // Store session data
                    localStorage.setItem('sessionId', data.sessionId);
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('username', username);
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        if (data.role === 'admin') {
                            window.location.href = 'admin-dashboard.html';
                        } else {
                            window.location.href = 'main.html';
                        }
                    }, 1500);
                } else {
                    showError(data.message || 'Invalid username or password');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showError('Login failed. Please try again.');
            })
            .finally(() => {
                setLoading(false);
            });
        }, 500);
    });

    // Add some visual feedback for form interactions
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});