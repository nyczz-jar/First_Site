function openModal(car) {
    var modal = document.getElementById("knowMore");
    var txt1 = document.getElementById("txt1");
    var txt2 = document.getElementById("txt2");
    var txt3 = document.getElementById("txt3");
    var txt4 = document.getElementById("txt4");
    
    // Limpa o conteúdo anterior
    txt1.innerHTML = "";
    txt2.innerHTML = "";
    txt3.innerHTML = "";
    txt4.innerHTML = "";
    
    switch (car) {
        case 1:
            txt1.innerHTML = "Koenigsegg Gemera";
            txt2.innerHTML = "Velocidade máxima de 404 km/h.";
            txt3.innerHTML = "Aceleração de 0 a 100 km/h em 1,9 segundos.";
            txt4.innerHTML = "Seu preço parte de: $3.700.000"; 
            break;
        case 2:
            txt1.innerHTML = "Koenigsegg Sadair's Spear Edition";
            txt2.innerHTML = "Velocidade máxima de 360 km/h.";
            txt3.innerHTML = "Aceleração de 0 a 100 km/h em 2,5 segundos.";
            txt4.innerHTML = "Seu preço parte de: $5.000.000";
            break;
        case 3:
            txt1.innerHTML = "Koenigsegg Agera RS";
            txt2.innerHTML = "Velocidade máxima de 447 km/h (227.9 mph).";
            txt3.innerHTML = "Aceleração de 0 a 100 km/h em 2,8 segundos.";
            txt4.innerHTML = "Seu preço parte de: $2.200.000";
            break;
        case 4:
            txt1.innerHTML = "Koenigsegg CCX";
            txt2.innerHTML = "Velocidade máxima de 395 km/h (245 mph).";
            txt3.innerHTML = "Aceleração de 0 a 100 km/h em 3,2 segundos.";
            txt4.innerHTML = "Seu preço parte de: $1.550.000";
            break;
        case 5:
            txt1.innerHTML = "Koenigsegg One:1";
            txt2.innerHTML = "Velocidade máxima de 440 km/h (273 mph).";
            txt3.innerHTML = "Aceleração de 0 a 100 km/h em 2,7 segundos.";
            txt4.innerHTML = "Seu preço parte de: $7.200.000";
            break;
        case 6:
            txt1.innerHTML = "Koenigsegg Gemera";
            txt2.innerHTML = "Velocidade máxima de 400 km/h (249 mph).";
            txt3.innerHTML = "Aceleração de 0 a 100 km/h em 1,9 segundos.";
            txt4.innerHTML = "Seu Preço parte de: $3.702.000";
            break;
    }
        // Exibe o modal
    modal.style.display = "block";
}

function closeModal() {
    var modal = document.getElementById("knowMore");
    modal.style.display = "none";
}

// Fecha o modal quando clicar fora dele
window.onclick = function(event) {
    var modal = document.getElementById("knowMore");
    if (event.target == modal) {
        closeModal();
    }
}

// Adiciona os event listeners para os botões "Saiba mais"
document.addEventListener('DOMContentLoaded', function() {
    // Botões de cada carro
    document.getElementById('Koenig1Button').addEventListener('click', function() { openModal(1); });
    document.getElementById('Koenig2Button').addEventListener('click', function() { openModal(2); });
    document.getElementById('Koenig3Button').addEventListener('click', function() { openModal(3); });
    document.getElementById('Koenig4Button').addEventListener('click', function() { openModal(4); });
    document.getElementById('Koenig5Button').addEventListener('click', function() { openModal(5); });
    document.getElementById('Koenig6Button').addEventListener('click', function() { openModal(6); });
    
    // Botão de fechar o modal
    document.getElementById('closeModalButton').addEventListener('click', closeModal);
});