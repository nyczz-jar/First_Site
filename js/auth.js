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
    // Prefer modal alert if present
    const modalAlert = document.getElementById('loginAlert');
    const alertBox = document.getElementById('alertBox');
    const target = modalAlert || alertBox;
    if (!target) return;

    target.className = `alert ${type}`;
    target.textContent = message;
    target.style.display = 'block';

    // Auto-hide em 5 segundos se for sucesso
    if (type === 'success') {
        setTimeout(() => {
            target.style.display = 'none';
        }, 5000);
    }
}

/**
 * Mostra/limpa erro em campo específico
 */
function setFieldError(fieldId, show = true) {
    // Tenta campo normal, senão busca modal equivalents (modalEmail/modalPassword)
    let field = document.getElementById(fieldId);
    let errorElement = document.getElementById(fieldId + 'Error');
    if (!field || !errorElement) {
        const modalFieldId = 'modal' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1);
        field = document.getElementById(modalFieldId) || field;
        errorElement = document.getElementById(modalFieldId + 'Error') || errorElement;
    }

    if (!field || !errorElement) return;

    if (show) {
        field.classList.add('error');
        errorElement.style.display = 'block';
    } else {
        field.classList.remove('error');
        errorElement.style.display = 'none';
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
        const emailErr = document.getElementById('emailError') || document.getElementById('modalEmailError');
        if (emailErr) emailErr.textContent = 'Email ou telefone inválido';
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
    let submitBtn = document.getElementById('submitBtn') || document.getElementById('modalSubmitBtn');
    let loading = document.getElementById('loading') || null;

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
                // Se o login foi acionado a partir do modal, apenas feche o modal e atualize UI.
                // Caso contrário (página dedicada login.html), redirecione para index.
                const path = window.location.pathname || '';
                const page = path.substring(path.lastIndexOf('/') + 1);
                if (page === 'login.html') {
                    setTimeout(() => { location.replace('index.html'); }, 1000);
                } else {
                    hideLoginModal();
                    updateUserInfoUI();
                }
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
            const path = window.location.pathname || '';
            const page = path.substring(path.lastIndexOf('/') + 1);
            if (page === 'login.html') {
                setTimeout(() => { location.replace('index.html'); }, 1000);
            } else {
                hideLoginModal();
                updateUserInfoUI();
            }
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
        // Se houver suporte a modal, carregue-o e exiba; caso contrário, redirecione para login.html
        if (typeof loadLoginModal === 'function') {
            loadLoginModal().then(() => {
                showLoginModal();
            }).catch(() => {
                location.replace('login.html');
            });
        } else {
            location.replace('login.html');
        }
    }
}

/** Modal: carregar, mostrar e esconder **/
let _loginModalLoaded = false;
async function loadLoginModal() {
    if (_loginModalLoaded) return;
    try {
        const resp = await fetch('components/login-modal.html');
        if (!resp.ok) throw new Error('não carregou');
        const html = await resp.text();
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
        _loginModalLoaded = true;

        // Map modal fields to generic handlers used by auth.js
        // Move values between modal inputs and expected ids
        const modalEmail = document.getElementById('modalEmail');
        const modalPassword = document.getElementById('modalPassword');
        const modalEmailError = document.getElementById('modalEmailError');
        const modalPasswordError = document.getElementById('modalPasswordError');
        const modalAlert = document.getElementById('loginAlert');

        // When auth.js calls setFieldError or showAlert, these will map to modal elements if present.
        // Attach close behavior
        const closeBtn = document.getElementById('loginModalClose');
        if (closeBtn) closeBtn.addEventListener('click', hideLoginModal);

        // Ensure modal form fields are wired to main handlers by id mapping
        // If handleLogin expects elements with ids 'email' and 'password', copy on submit
        const modalForm = document.getElementById('modalLoginForm');
        if (modalForm) {
            modalForm.addEventListener('submit', function(e){
                e.preventDefault();
                // copy modal values into temporary inputs expected by validateForm
                ensureTempInputsForModal(modalEmail.value, modalPassword.value);
                handleLogin(e);
            });
        }

    } catch (err) {
        _loginModalLoaded = false;
        throw err;
    }
}

function ensureTempInputsForModal(emailVal, passVal) {
    // Create or update hidden inputs with ids expected by validateForm/handleLogin
    let e = document.getElementById('email');
    if (!e) {
        e = document.createElement('input');
        e.type = 'hidden';
        e.id = 'email';
        document.body.appendChild(e);
    }
    let p = document.getElementById('password');
    if (!p) {
        p = document.createElement('input');
        p.type = 'hidden';
        p.id = 'password';
        document.body.appendChild(p);
    }
    e.value = emailVal;
    p.value = passVal;
}

function showLoginModal() {
    const overlay = document.getElementById('loginModalOverlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    // move modal values into hidden inputs if present
}

function hideLoginModal() {
    const overlay = document.getElementById('loginModalOverlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    // cleanup temporary hidden inputs
    const e = document.getElementById('email');
    const p = document.getElementById('password');
    if (e && e.type === 'hidden') e.remove();
    if (p && p.type === 'hidden') p.remove();
}

function updateUserInfoUI() {
    // Atualiza elementos da interface que mostram usuário logado
    const auth = getAuth();
    const userInfo = document.getElementById('userInfo');
    if (auth && userInfo) {
        userInfo.textContent = 'Olá, ' + (auth.email.split('@')[0] || auth.email);
    }
}

/**
 * Inicializa página de login
 */
document.addEventListener('DOMContentLoaded', function() {
    // Somente execute comportamento de página de login aqui.
    // Evita redirecionamentos automáticos em outras páginas (causa de reload/piscar).
    var path = window.location.pathname || '';
    var page = path.substring(path.lastIndexOf('/') + 1);

    // Se já está autenticado e estamos na página de login, encaminhe para index.html
    if (isAuthenticated() && page === 'login.html') {
        location.replace('index.html');
        return;
    }

    // Apenas executar foco e listeners se estivermos na página de login
    if (page !== 'login.html') return;

    // Focus no campo de email (somente em login.html)
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
