/**
 * Sistema de Autenticação
 * - Validação de campos
 * - Gerenciamento de sessão (localStorage)
 * - Integração com PHP backend
 */

// Configuração da API
const API_CONFIG = {
    // Altere para apontar para seu arquivo PHP
    loginEndpoint: 'api/login.php', // ex: http://localhost/Projeto_Koenigsegg/api/login.php
    validateEndpoint: 'api/validate.php'
};

/**
 * Valida se um email é válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida se é um telefone (apenas dígitos, espaços, parênteses e hífens)
 */
function isValidPhone(phone) {
    // Remove caracteres especiais e conta dígitos
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10; // Mínimo de dígitos para um telefone
}

/**
 * Valida se email ou telefone é válido
 */
function isValidEmailOrPhone(value) {
    const trimmed = value.trim();
    return isValidEmail(trimmed) || isValidPhone(trimmed);
}

/**
 * Mostra mensagem de alerta na página de login
 */
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;

    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;
    alertBox.style.display = 'block';

    // Auto-hide em 5 segundos se for sucesso
    if (type === 'success') {
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000);
    }
}

/**
 * Mostra/limpa erro em campo específico
 */
function setFieldError(fieldId, show = true) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');

    if (!field || !errorElement) return;

    if (show) {
        field.classList.add('error');
        errorElement.classList.add('show');
    } else {
        field.classList.remove('error');
        errorElement.classList.remove('show');
    }
}

/**
 * Valida formulário antes de enviar
 */
function validateForm() {
    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value || '';

    let isValid = true;

    // Valida email/telefone
    if (!email) {
        setFieldError('email', true);
        isValid = false;
    } else if (!isValidEmailOrPhone(email)) {
        setFieldError('email', true);
        document.getElementById('emailError').textContent = 'Email ou telefone inválido';
        isValid = false;
    } else {
        setFieldError('email', false);
    }

    // Valida senha
    if (!password) {
        setFieldError('password', true);
        isValid = false;
    } else {
        setFieldError('password', false);
    }

    return isValid;
}

/**
 * Função principal de login - chamada ao enviar o formulário
 */
async function handleLogin(event) {
    event.preventDefault();

    // Limpa alertas anteriores
    const alertBox = document.getElementById('alertBox');
    if (alertBox) alertBox.style.display = 'none';

    // Valida campos
    if (!validateForm()) {
        return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');

    // Desabilita botão e mostra loading
    if (submitBtn) submitBtn.disabled = true;
    if (loading) loading.style.display = 'block';

    try {
        // OPÇÃO 1: Validação simples (sem PHP)
        // Remove esta seção se você quiser usar seu próprio backend
        if (!isUsingBackend()) {
            // Validação de exemplo (substitua pelo seu backend)
            const isValidUser = validateLocalUser(email, password);

            if (isValidUser) {
                // Armazena autenticação no localStorage
                storeAuth({
                    email: email,
                    token: generateToken(),
                    timestamp: Date.now()
                });

                showAlert('Login realizado com sucesso!', 'success');

                // Redireciona para index após 1 segundo
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showAlert('Email/Telefone ou senha incorretos', 'error');
            }

            if (submitBtn) submitBtn.disabled = false;
            if (loading) loading.style.display = 'none';
            return;
        }

        // OPÇÃO 2: Integração com PHP Backend
        const response = await fetch(API_CONFIG.loginEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Armazena dados de autenticação
            storeAuth({
                email: email,
                token: data.token || generateToken(),
                userId: data.userId,
                timestamp: Date.now()
            });

            showAlert('Login realizado com sucesso!', 'success');

            // Redireciona para index
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showAlert(data.message || 'Email/Telefone ou senha incorretos', 'error');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showAlert('Erro ao conectar ao servidor. Tente novamente.', 'error');
    } finally {
        // Re-habilita botão e esconde loading
        if (submitBtn) submitBtn.disabled = false;
        if (loading) loading.style.display = 'none';
    }
}

/**
 * Armazena dados de autenticação no localStorage
 */
function storeAuth(authData) {
    try {
        localStorage.setItem('authToken', JSON.stringify(authData));
    } catch (error) {
        console.error('Erro ao armazenar autenticação:', error);
    }
}

/**
 * Recupera dados de autenticação do localStorage
 */
function getAuth() {
    try {
        const auth = localStorage.getItem('authToken');
        return auth ? JSON.parse(auth) : null;
    } catch (error) {
        console.error('Erro ao recuperar autenticação:', error);
        return null;
    }
}

/**
 * Verifica se usuário está autenticado
 */
function isAuthenticated() {
    const auth = getAuth();
    if (!auth) return false;

    // Verifica se token expirou (opcional - defina duração em horas)
    const EXPIRY_HOURS = 24;
    const expiryTime = auth.timestamp + (EXPIRY_HOURS * 60 * 60 * 1000);

    return Date.now() < expiryTime;
}

/**
 * Remove autenticação (logout)
 */
function logout() {
    try {
        localStorage.removeItem('authToken');
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

/**
 * Gera um token simples (substitua pelo token do seu backend)
 */
function generateToken() {
    return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * Valida usuário localmente (EXEMPLO - remova quando usar PHP)
 * Substitua com chamadas reais ao seu backend
 */
function validateLocalUser(email, password) {
    // EXEMPLO DE USUÁRIOS (remova quando integrar com PHP)
    const validUsers = [
        { email: 'admin@koenigsegg.com', password: 'admin123' },
        { email: 'user@koenigsegg.com', password: 'senha123' },
        { email: '11912345678', password: 'admin123' }
    ];

    return validUsers.some(user => 
        (user.email === email || user.email === email.replace(/\D/g, '')) &&
        user.password === password
    );
}

/**
 * Verifica se está usando backend (mude para true ao integrar com PHP)
 */
function isUsingBackend() {
    // Mude para true quando estiver usando seu PHP backend
    return false;
}

/**
 * Redireciona para login se não estiver autenticado
 * Use esta função em suas páginas protegidas (index.html, etc)
 */
function requireAuth() {
    if (!isAuthenticated()) {
        // Redireciona para login
        window.location.href = 'login.html';
    }
}

/**
 * Inicializa página de login
 */
document.addEventListener('DOMContentLoaded', function() {
    // Se já está autenticado, redireciona para index
    if (isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Focus no campo de email
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.focus();

    // Limpa erros quando usuário começa a digitar
    const formInputs = document.querySelectorAll('#loginForm input');
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            const errorId = this.id + 'Error';
            const errorElement = document.getElementById(errorId);
            if (errorElement && errorElement.classList.contains('show')) {
                setFieldError(this.id, false);
            }
        });
    });
});
