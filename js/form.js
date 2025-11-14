function mascaraTelefone(event) {
    let telefone = event.target.value.replace(/\D+/g, "");

    let tamanho = telefone.length;
    if (tamanho > 10) { // Se telefone com mais de 10 caracteres, não faz mais nada
        telefone = telefone.slice(0, 9);
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

// Espera até que o DOM esteja totalmente carregado
document.addEventListener('DOMContentLoaded', function () {
    // Adiciona event listener ao campo de telefone para aplicar a máscara
    document.getElementById('cel').addEventListener('input', mascaraTelefone);
});