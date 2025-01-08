

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


