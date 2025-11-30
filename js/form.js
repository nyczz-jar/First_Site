function mascaraTelefone(event) {
    let telefone = event.target.value.replace(/\D+/g, "");

    let tamanho = telefone.length;
    // garante máximo de 9 dígitos (celular com 8 ou 9 dígitos)
    if (tamanho > 9) {
        telefone = telefone.slice(0, 9);
        tamanho = telefone.length;
    }
    if (tamanho === 9) {
        telefone = telefone.replace(/^(\d{5})(\d{4})$/, "$1-$2");
    } else if (tamanho === 8) {
        telefone = telefone.replace(/^(\d{4})(\d{4})$/, "$1-$2");
    } else {
        telefone = telefone.replace(/^(\d*)$/, "$1");
    }

    event.target.value = telefone;
}

function validarFormulario(event) {
    const telefone = document.getElementById('cel').value.replace(/\D+/g, '');
    if (telefone.length < 8 || telefone.length > 9) {
        event.preventDefault();
        alert('Por favor, insira um número de telefone válido com 8 ou 9 dígitos.');
    }
}

// Espera até que o DOM esteja totalmente carregado
document.addEventListener('DOMContentLoaded', function () {
    // Adiciona event listener ao campo de telefone para aplicar a máscara
    document.getElementById('cel').addEventListener('input', mascaraTelefone);
    // Não enviar via GET; iremos tratar o submit por fetch abaixo

    // Tab switching (Details / Password)
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // deactivate all
            tabButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');

            const target = this.getAttribute('data-target');
            document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
            const panel = document.getElementById(target);
            if (panel) panel.style.display = '';
        });
    });

    // Enhance validation: check passwords if provided
    function validatePasswords(event) {
        const pwdEl = document.getElementById('password');
        const pwd2El = document.getElementById('password2');
        if (!pwdEl || !pwd2El) return true; // nothing to check

        const pwd = pwdEl.value || '';
        const pwd2 = pwd2El.value || '';

        // If either password field is filled, enforce rules
        if (pwd.length > 0 || pwd2.length > 0) {
            if (pwd.length < 6) {
                event.preventDefault();
                alert('A senha deve ter ao menos 6 caracteres.');
                return false;
            }
            if (pwd !== pwd2) {
                event.preventDefault();
                alert('As senhas não coincidem.');
                return false;
            }
        }
        return true;
    }

    // Unified submit handler: valida campos e envia para API via fetch
    const form = document.getElementById('userForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Valida telefone
            const telefone = document.getElementById('cel').value.replace(/\D+/g, '');
            if (telefone.length < 8 || telefone.length > 9) {
                alert('Por favor, insira um número de telefone válido com 8 ou 9 dígitos.');
                return;
            }

            // Valida nomes e email
            const nome = (document.getElementById('nome') || {}).value || '';
            const email = (document.getElementById('email') || {}).value || '';
            if (!nome || !email) {
                alert('Nome e email são obrigatórios.');
                return;
            }

            // Valida senhas
            const pwdEl = document.getElementById('password');
            const pwd2El = document.getElementById('password2');
            const pwd = pwdEl ? pwdEl.value : '';
            const pwd2 = pwd2El ? pwd2El.value : '';

            if (!pwd || !pwd2) {
                alert('Por favor, informe a senha e sua confirmação na aba Password.');
                return;
            }
            if (pwd.length < 6) {
                alert('A senha deve ter ao menos 6 caracteres.');
                return;
            }
            if (pwd !== pwd2) {
                alert('As senhas não coincidem.');
                return;
            }

            // Monta payload
            const payload = {
                nome: nome.trim(),
                email: email.trim(),
                password: pwd
            };

            const submitBtn = form.querySelector('.btn-submit');
            if (submitBtn) submitBtn.disabled = true;

            try {
                const res = await fetch('api/createUser.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    alert('Cadastro realizado com sucesso. Você já pode entrar com seu email e senha.');
                    // Opcional: redirecionar para login
                    window.location.href = 'login.html';
                } else {
                    alert(data.message || 'Erro ao criar usuário');
                }
            } catch (err) {
                console.error(err);
                alert('Erro na requisição. Veja console para detalhes.');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});