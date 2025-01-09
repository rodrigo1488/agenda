document.getElementById('fechar-modal').addEventListener('click', function () {
    document.getElementById('modal-agendamento').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function () {
    esconderCarregamento(); // Garante que a tela de carregamento estará oculta ao carregar a página
});

async function carregarEmpresas() {
    try {
        const response = await axios.get('/api/empresas');
        const empresas = response.data;
        const lista = document.getElementById('empresas-lista');

        lista.innerHTML = '';

        if (!empresas || empresas.length === 0) {
            lista.innerHTML = '<p>Nenhuma empresa encontrada.</p>';
            return;
        }

        empresas.forEach(empresa => {
            const item = document.createElement('div');
            item.classList.add('card');
            item.dataset.nomeEmpresa = empresa.nome_empresa.toLowerCase();

            item.innerHTML = `
                <div class="card-body">
                    <img src="${empresa.logo}" alt="Logo" class="logo">
                    <div class="card-text">
                        <h3 class="card-title">${empresa.nome_empresa}</h3>
                        <p class="card-text">${empresa.descricao}</p>
                        <button class="btn-agendar" onclick="abrirModalAgendamento(${empresa.id})">Agendar</button>
                    </div>
                </div>
            `;

            lista.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        alert('Erro ao carregar empresas. Tente novamente mais tarde.');
    }
}

document.getElementById('search-bar').addEventListener('input', function () {
    const termoBusca = this.value.toLowerCase();
    const empresas = document.querySelectorAll('#empresas-lista .card');

    empresas.forEach(empresa => {
        const nomeEmpresa = empresa.dataset.nomeEmpresa;
        if (nomeEmpresa.includes(termoBusca)) {
            empresa.style.display = 'block';
        } else {
            empresa.style.display = 'none';
        }
    });
});

carregarEmpresas();

async function carregarFuncionarios(empresaId) {
    try {
        const response = await axios.get(`/api/usuarios/${empresaId}`);
        const funcionarios = response.data;
        const selectUsuarios = document.getElementById('profissional-select');

        selectUsuarios.innerHTML = '<option value="">Selecione o Profissional</option>';

        if (!funcionarios || funcionarios.length === 0) {
            selectUsuarios.innerHTML = '<option value="">Nenhum Profissional disponível</option>';
            return;
        }

        funcionarios.forEach(funcionario => {
            const option = document.createElement('option');
            option.value = funcionario.id;
            option.textContent = funcionario.nome_usuario;
            selectUsuarios.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        alert('Erro ao carregar funcionários. Tente novamente mais tarde.');
    }
}

async function carregarServicos(empresaId) {
    try {
        const response = await axios.get(`/api/servicos/${empresaId}`);
        const servicos = response.data;
        const selectServicos = document.querySelector('select[name="servico_id"]');

        selectServicos.innerHTML = '<option value="">Selecione o Serviço</option>';

        if (!servicos || servicos.length === 0) {
            selectServicos.innerHTML = '<option value="">Nenhum serviço disponível</option>';
            return;
        }

        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.id;
            option.textContent = `${servico.nome_servico} - R$ ${servico.preco.toFixed(2)}`;
            selectServicos.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        alert('Erro ao carregar serviços. Tente novamente mais tarde.');
    }
}

async function carregarHorariosDisponiveis(event) {
    const usuarioId = document.querySelector('select[name="usuario_id"]').value;
    const data = document.querySelector('input[name="data"]').value;

    if (!usuarioId || !data) {
        return;
    }

    try {
        const response = await axios.get(`/api/agenda/data?usuario_id=${usuarioId}&data=${data}`);
        const horariosDisponiveis = response.data.horarios_disponiveis;
        const containerHorarios = document.getElementById('horarios-disponiveis');

        containerHorarios.innerHTML = '';

        if (!horariosDisponiveis || horariosDisponiveis.length === 0) {
            containerHorarios.innerHTML = '<p>Nenhum horário disponível.</p>';
            return;
        }

        horariosDisponiveis.forEach(horario => {
            const botaoHorario = document.createElement('button');
            botaoHorario.classList.add('btn-horario');
            botaoHorario.textContent = horario;
            botaoHorario.onclick = () => selecionarHorario(horario);
            containerHorarios.appendChild(botaoHorario);
        });
    } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
        alert(err.response?.data?.error || 'Erro ao carregar horários disponíveis.');
    }
}

document.querySelector('input[name="data"]').addEventListener('change', carregarHorariosDisponiveis);
document.querySelector('select[name="usuario_id"]').addEventListener('change', carregarHorariosDisponiveis);

function selecionarHorario(horario) {
    const horarioSelecionado = document.getElementById('horario-selecionado');
    horarioSelecionado.textContent = `Horário selecionado: ${horario}`;

    const containerHorarios = document.getElementById('horarios-disponiveis');
    const botoes = containerHorarios.querySelectorAll('button');
    botoes.forEach(botao => {
        if (botao.textContent !== horario) {
            botao.style.display = 'none';
        }
    });

    const form = document.getElementById('form-agendamento');
    let inputHorario = form.querySelector('input[name="horario"]');

    if (!inputHorario) {
        inputHorario = document.createElement('input');
        inputHorario.type = 'hidden';
        inputHorario.name = 'horario';
        form.appendChild(inputHorario);
    }

    inputHorario.value = horario;
}

function abrirModalAgendamento(empresaId) {
    carregarFuncionarios(empresaId);
    carregarServicos(empresaId);
    document.getElementById('modal-agendamento').style.display = 'block';
}

document.getElementById('form-agendamento').onsubmit = async function (e) {
    e.preventDefault();

    mostrarCarregamento(); // Exibe a tela de carregamento

    const dados = new FormData(e.target);
    const dadosObj = Object.fromEntries(dados.entries());

    try {
        const response = await axios.post('/api/agendar-cliente', dadosObj);
        alert(response.data.message);
        document.getElementById('modal-agendamento').style.display = 'none';
        window.location.reload();
    } catch (err) {
        console.error('Erro ao agendar:', err);
        alert(err.response?.data?.error || 'Erro ao realizar o agendamento');
    } finally {
        esconderCarregamento(); // Esconde a tela de carregamento após o processo
    }
};

document.getElementById('data-input').addEventListener('change', carregarHorariosDisponiveis);
document.getElementById('profissional-select').addEventListener('change', carregarHorariosDisponiveis);


function mostrarCarregamento() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex'; // Exibe o carregamento
    } else {
        console.error('Elemento de carregamento não encontrado!');
    }
}

function esconderCarregamento() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none'; // Oculta o carregamento
    } else {
        console.error('Elemento de carregamento não encontrado!');
    }
}