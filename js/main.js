function openModal(car) {
    const modal = document.getElementById("knowMore");
    const txt1 = document.getElementById("txt1");
    const txt2 = document.getElementById("txt2");
    const txt3 = document.getElementById("txt3");
    const txt4 = document.getElementById("txt4");
    
    // Limpa o conteúdo anterior
    txt1.innerHTML = "";
    txt2.innerHTML = "";
    txt3.innerHTML = "";
    txt4.innerHTML = "";
    
    const carData = {
        1: {
            title: "Koenigsegg Gemera",
            speed: "Top speed: 404 km/h.",
            accel: "0-100 km/h in 1.9 seconds.",
            price: "Starting at: $3,700,000"
        },
        2: {
            title: "Koenigsegg Jesko Sadair's Spear Edition",
            speed: "Top speed: 360 km/h.",
            accel: "0-100 km/h in 2.5 seconds.",
            price: "Starting at: $5,000,000"
        },
        3: {
            title: "Koenigsegg Agera RS",
            speed: "Top speed: 447 km/h (227.9 mph).",
            accel: "0-100 km/h in 2.8 seconds.",
            price: "Starting at: $2,200,000"
        },
        4: {
            title: "Koenigsegg CCX",
            speed: "Top speed: 395 km/h (245 mph).",
            accel: "0-100 km/h in 3.2 seconds.",
            price: "Starting at: $1,550,000"
        },
        5: {
            title: "Koenigsegg One:1",
            speed: "Top speed: 440 km/h (273 mph).",
            accel: "0-100 km/h in 2.7 seconds.",
            price: "Starting at: $7,200,000"
        },
        6: {
            title: "Koenigsegg Gemera",
            speed: "Top speed: 400 km/h (249 mph).",
            accel: "0-100 km/h in 1.9 seconds.",
            price: "Starting at: $3,702,000"
        }
    };

    const info = carData[car];
    if (info) {
        txt1.textContent = info.title;
        txt2.textContent = info.speed;
        txt3.textContent = info.accel;
        txt4.textContent = info.price;
    }
    // Exibe o modal
    modal.style.display = "block";
    // Foca no modal
    modal.focus();
}

function closeModal() {
    const modal = document.getElementById("knowMore");
    modal.style.display = "none";
    const firstButton = document.getElementById('Koenig1Button');
    if (firstButton) {
        firstButton.focus();
    }
}

// Fecha o modal quando clicar fora dele
document.addEventListener('click', function (event) {
    const modal = document.getElementById("knowMore");
    if (modal && event.target === modal) {
        closeModal();
    }
});

// Fecha o modal com a tecla ESC
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById("knowMore");
    if (event.key === 'Escape' && modal && modal.style.display === 'block') {
        closeModal();
    }
});

// Adiciona os event listeners para os botões "More..."
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