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
            loginButton.disabled = true;
            loadingSpinner.style.display = 'inline-block';
            buttonText.textContent = 'Signing In...';
        } else {
            loginButton.disabled = false;
            loadingSpinner.style.display = 'none';
            buttonText.textContent = 'Sign In';
        }
    }

    // Add input animations
    const inputs = document.querySelectorAll('.form-input');
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
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response.text().then(text => {
                    console.log('Raw response text:', text);
                    
                    if (!text.trim()) {
                        throw new Error('Empty response from server');
                    }
                    
                    try {
                        return JSON.parse(text);
                    } catch (parseError) {
                        console.error('JSON parse error:', parseError);
                        throw new Error('Invalid JSON response from server');
                    }
                });
            })
            .then(data => {
                console.log('Parsed data:', data);
                
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
                            window.location.href = 'main.html'; // Changed from secret-website.html
                        }
                    }, 1500);
                } else {
                    showError(data.message || 'Invalid username or password');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                
                let errorMsg = 'An error occurred during login. Please try again.';
                
                if (error.message.includes('Failed to fetch')) {
                    errorMsg = 'Network error. Please check your connection and try again.';
                } else if (error.message.includes('Empty response')) {
                    errorMsg = 'Server returned empty response. Please check your Netlify functions.';
                } else if (error.message.includes('Invalid JSON')) {
                    errorMsg = 'Server returned invalid response. Please check server logs.';
                } else if (error.message.includes('HTTP 401')) {
                    errorMsg = 'Invalid username or password. Please try again.';
                } else if (error.message.includes('HTTP 500')) {
                    errorMsg = 'Server error. Please try again later.';
                }
                
                showError(errorMsg);
            })
            .finally(() => {
                setLoading(false);
            });
        }, 500);
    });

    // Add enter key support for form submission
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    });

    // Add focus management
    const firstInput = document.getElementById('username');
    if (firstInput) {
        firstInput.focus();
    }
});