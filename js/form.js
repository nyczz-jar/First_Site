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
    // Adiciona event listener ao formulário para validação
    document.getElementById('userForm').addEventListener('submit', validarFormulario);
});