document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        events: function (fetchInfo, successCallback, failureCallback) {
            fetch('/agenda/data')
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const eventos = data.map(agendamento => ({
                            id: agendamento.id,
                            title: `${agendamento.cliente_nome} - Serviço: ${agendamento.servico_nome}`,
                            start: `${agendamento.data}T${agendamento.horario}`,
                            allDay: false,
                            descricao: agendamento.descricao,
                            finalizado: agendamento.finalizado || false
                        }));
                        successCallback(eventos);
                    } else {
                        console.error('Dados recebidos não são um array:', data);
                        failureCallback('Erro nos dados recebidos');
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar agendamentos:', error);
                    failureCallback(error);
                });
        },
        eventMouseEnter: function (info) {
            const eventEl = info.el;
            eventEl.style.cursor = 'pointer'; // Define o cursor como uma mãozinha
        },
        eventMouseLeave: function (info) {
            const eventEl = info.el;
            eventEl.style.cursor = ''; // Restaura o estilo padrão do cursor
        },
        eventClick: function (info) {
            if (!info.event.extendedProps.finalizado) {
                mostrarDetalhesAgendamento(info.event);
            } else {
                alert('Este agendamento já foi finalizado e não pode ser modificado.');
            }
        },
        eventDidMount: function (info) {
            const eventEl = info.el;
            const now = new Date();

          if (info.event.start < now) {
                eventEl.style.backgroundColor = 'red';
                eventEl.style.color = 'white';
            }
        }
    });

    calendar.render();

    function mostrarDetalhesAgendamento(event) {
        const modalBody = document.getElementById('modal-body');
        const modalTitle = document.getElementById('modal-title');
        modalTitle.textContent = `Agendamento de ${event.title}`;
        modalBody.innerHTML = `
            <p><strong>Cliente:</strong> ${event.title.split(' - ')[0]}</p>
            <p><strong>Serviço:</strong> ${event.title.split(' - ')[1]}</p>
            <p><strong>Data:</strong> ${event.start.toLocaleDateString()}</p>
            <p><strong>Horário:</strong> ${event.start.toLocaleTimeString()}</p>
            <p><strong>Descrição:</strong> ${event.extendedProps.descricao || 'Sem descrição'}</p>
            <button class="btn btn-danger btn-cancelar">Cancelar</button>
            <button class="btn btn-success btn-finalizar">Finalizar</button>
        `;

        document.querySelector('.btn-cancelar').addEventListener('click', function () {
            cancelarAgendamento(event.id);
        });

        document.querySelector('.btn-finalizar').addEventListener('click', function () {
            mostrarModalPagamento(event.id);
        });

        const modal = new bootstrap.Modal(document.getElementById('agendamentoDetalhesModal'));
        modal.show();
    }

    function mostrarModalPagamento(agendamentoId) {
        const modalPagamentoBody = document.getElementById('modal-pagamento-body');
        const modalPagamento = new bootstrap.Modal(document.getElementById('pagamentoModal'));

        modalPagamentoBody.innerHTML = `
            <form id="form-pagamento">
                <div class="mb-3">
                    <label for="valor-pagamento" class="form-label">Valor</label>
                    <input type="number" class="form-control" id="valor-pagamento" required>
                </div>
                <div class="mb-3">
                    <label for="meio-pagamento" class="form-label">Meio de Pagamento</label>
                    <select class="form-control" id="meio-pagamento" required>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Pix">Pix</option>
                        <option value="Outro">sem custo</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-success">finalizar</button>
            </form>
        `;

        document.getElementById('form-pagamento').addEventListener('submit', function (e) {
            e.preventDefault();

            const valor = document.getElementById('valor-pagamento').value;
            const meioPagamento = document.getElementById('meio-pagamento').value;

            finalizarAgendamento(agendamentoId, valor, meioPagamento);
            modalPagamento.hide();
        });

        modalPagamento.show();
    }

    function finalizarAgendamento(agendamentoId, valor, meioPagamento) {
        mostrarCarregamento();
        fetch(`/api/agendamento/finalizar/${agendamentoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                valor: parseFloat(valor),
                meio_pagamento: meioPagamento,
            }),
        })
            .then(response => response.json())
            .then(data => {
                esconderCarregamento();
                if (data.message) {
                    alert('Agendamento finalizado com sucesso!');
                    location.reload();
                } else {
                    alert('Erro ao finalizar agendamento.');
                }
            })
            .catch(error => {
                esconderCarregamento();
                console.error('Erro:', error);
            });
    }

    function cancelarAgendamento(id) {
        if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;

        mostrarCarregamento();
        fetch(`/api/agendamento/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                esconderCarregamento();
                if (data.message) {
                    location.reload();
                } else {
                    alert('Erro ao cancelar agendamento.');
                }
            })
            .catch(error => {
                esconderCarregamento();
                console.error('Erro ao processar a solicitação:', error);
            });
    }

    function carregarDados() {
        fetch('/api/clientes')
            .then(response => response.json())
            .then(data => {
                const clienteSelect = document.getElementById('cliente-agendamento');
                data.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente.id;
                    option.textContent = cliente.nome_cliente;
                    clienteSelect.appendChild(option);
                });
            });

        fetch('/api/usuarios')
            .then(response => response.json())
            .then(data => {
                const usuarioSelect = document.getElementById('usuario-agendamento');
                data.forEach(usuario => {
                    const option = document.createElement('option');
                    option.value = usuario.id;
                    option.textContent = usuario.nome_usuario;
                    usuarioSelect.appendChild(option);
                });
            });

        fetch('/api/servicos')
            .then(response => response.json())
            .then(data => {
                const servicoSelect = document.getElementById('servico-agendamento');
                data.forEach(servico => {
                    const option = document.createElement('option');
                    option.value = servico.id;
                    option.textContent = servico.nome_servico;
                    servicoSelect.appendChild(option);
                });
            });
    }

    document.getElementById('form-agendamento').addEventListener('submit', function (e) {
        e.preventDefault();

        const cliente = document.getElementById('cliente-agendamento').value;
        const usuario = document.getElementById('usuario-agendamento').value;
        const servico = document.getElementById('servico-agendamento').value;
        const data = document.getElementById('data-agendamento').value;
        const horario = document.getElementById('hora-agendamento').value;
        const descricao = document.getElementById('descricao-agendamento').value;

        const dadosAgendamento = {
            cliente_id: cliente,
            usuario_id: usuario,
            servico_id: servico,
            data: data,
            horario: horario,
            descricao: descricao
        };

        mostrarCarregamento();
        fetch('/api/agendar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAgendamento)
        })
            .then(response => response.json())
            .then(data => {
                esconderCarregamento();
                if (data.message) {
                    location.reload();
                } else {
                    alert('Erro ao criar agendamento.');
                }
            })
            .catch(error => {
                esconderCarregamento();
                console.error('Erro ao enviar os dados do agendamento:', error);
            });
    });

    function mostrarCarregamento() {
        document.getElementById('loading-screen').style.display = 'flex';
    }

    function esconderCarregamento() {
        document.getElementById('loading-screen').style.display = 'none';
    }

    carregarDados();
});
