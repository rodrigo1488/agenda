

function carregarAgendamentos() {
    fetch('/agenda/data') // Rota GET que retorna todos os agendamentos
        .then(response => response.json())
        .then(data => {
            // Limpar a lista atual de agendamentos
            const calendar = document.getElementById('calendar');
            calendar.innerHTML = ''; // Limpa a lista atual de eventos no calendário

            // Adicionar os agendamentos no calendário
            data.forEach(agendamento => {
                calendar.addEvent({
                    title: `Cliente: ${agendamento.cliente_nome} - Serviço: ${agendamento.servico_nome}`,
                    start: `${agendamento.data}T${agendamento.horario}`,
                    allDay: false
                });
            });
        })
        .catch(error => console.error('Erro ao carregar agendamentos:', error));
}


document.addEventListener('DOMContentLoaded', function() {
    carregarAgendamentos();
    carregarDados(); // Carregar os dados de clientes, serviços e profissionais
});


function criarMenuLateral() {
    return `
    <nav id="menu-lateral" class="text-white p-3" style="width: 250px; min-height: 100vh;">
        <ul class="nav flex-column mt-4">
            <img src="/static/logo.png" id="logo" alt="">
            <li class="nav-item mb-3">
                <a href="/agenda" class="nav-link text-white"><i class="bi bi-calendar3"></i> Agenda</a>
            </li>
            <li class="nav-item mb-3">
                <a href="/clientes" class="nav-link text-white"><i class="bi bi-people"></i> Clientes</a>
            </li>
            <li class="nav-item mb-3">
                <a href="/usuarios" class="nav-link text-white"><i class="bi bi-person-badge"></i> Usuários</a>
            </li>
            <li class="nav-item mb-3">
                <a href="/servicos" class="nav-link text-white"><i class="bi bi-scissors"></i> Serviços</a>
            </li>
            <li class="nav-item mb-3">
                <a href="/relatorios" class="nav-link text-white"><i class="bi bi-bar-chart"></i> Relatórios</a>
            </li>
            <li class="nav-item mb-3">
                <a href="/login" class="nav-link text-white" style="margin-top: 8%;"><i
                        class="bi bi-arrow-90deg-up"></i> Sair</a>
            </li>
        </ul>
    </nav>`;
}

// Para usar a função em outro código, basta chamar:
document.getElementById('menu-container').innerHTML = criarMenuLateral();
