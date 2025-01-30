document.getElementById('fechar-modal').addEventListener('click', function () {
   window.location.reload();
});

document.addEventListener('DOMContentLoaded', function () {
    esconderCarregamento(); // Garante que a tela de carregamento estará oculta ao carregar a página
});

async function carregarDetalhesEmpresa(empresaId) {
    try {
        // Faz a requisição para buscar os detalhes da empresa
        const response = await axios.get(`/api/empresa/${empresaId}`);

        const empresa = response.data; // Obtém os dados da empresa

        // Garantir que os valores booleanos sejam tratados corretamente
        const estacionamento = empresa.estacionamento ? 'Disponível' : null;
        const wifi = empresa.wifi ? 'Disponível' : null;
        const kids = empresa.kids ? 'Permitido' : null;
        const acessibilidade = empresa.acessibilidade ? 'Disponível' : null;

        // Atualiza o conteúdo da div com as informações da empresa
        const divInfo = document.getElementById('informacoes-empresa');
        divInfo.innerHTML = `
        <div class="empresa-info">
            <img src="${empresa.logo}" alt="Logo da ${empresa.nome_empresa}" class="logo-descricao">
            <h3 class="nome-empresa">${empresa.nome_empresa}</h3>
            <p class="descricao"> ${empresa.descricao}</p>
            <p class="horario"><strong>Horário de funcionamento:</strong> ${empresa.horario}</p>
    
            <div class="comodidades-container">
                ${wifi ? `<div class="botao-neumorphism">
                            <i class="fas fa-wifi"></i> 
                            <span>Wi-Fi Disponível</span>
                          </div>` : ''}
                
                ${estacionamento ? `<div class="botao-neumorphism">
                            <i class="fas fa-car"></i> 
                            <span>Estacionamento Disponível</span>
                          </div>` : ''}
                
                ${kids ? `<div class="botao-neumorphism">
                            <i class="fas fa-child"></i> 
                            <span>Atende Crianças</span>
                          </div>` : ''}
                
                ${acessibilidade ? `<div class="botao-neumorphism">
                            <i class="fas fa-wheelchair"></i> 
                            <span>Acessibilidade Disponível</span>
                          </div>` : ''}
            </div>
    
            <!-- Botão do WhatsApp dentro do card -->
            <a href="https://api.whatsapp.com/send?phone=${empresa.tel_empresa.replace(/\D/g, '')}&text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20hor%C3%A1rio" 
               target="_blank" 
               class="whatsapp-card">
               <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp Icon">
               <span></span>
            </a>
        </div>
    `;
    } catch (error) {
        console.error("Erro ao carregar os detalhes da empresa:", error);
    }
}



document.getElementById('search-bar').addEventListener('input', function(event) {
    const nomeEmpresa = event.target.value.trim();  // Captura o valor digitado no campo de busca

    // Modifica a URL para refletir o termo de busca sem recarregar a página
    const urlParams = new URLSearchParams(window.location.search);
    if (nomeEmpresa) {
        urlParams.set('nome_empresa', nomeEmpresa);  // Adiciona o parâmetro nome_empresa à URL
    } else {
        urlParams.delete('nome_empresa');  // Se o campo de busca estiver vazio, remove o parâmetro
    }

    // Atualiza a URL da barra de endereços sem recarregar a página
    window.history.pushState({}, '', `${window.location.pathname}?${urlParams}`);

    // Chama a função para carregar as empresas com o novo parâmetro
    carregarEmpresas(nomeEmpresa);
});

async function carregarEmpresas(nomeEmpresa = '') {
    try {
        // Captura o parâmetro "nome_empresa" da URL
        const urlParams = new URLSearchParams(window.location.search);
        const nomeEmpresaURL = urlParams.get('nome_empresa') || nomeEmpresa;

        // Faz a requisição à API, incluindo o filtro (se houver)
        const response = await axios.get('/api/empresas', {
            params: { nome_empresa: nomeEmpresaURL }
        });

        const empresas = response.data;
        const lista = document.getElementById('empresas-lista');

        lista.innerHTML = '';  // Limpa a lista antes de adicionar novos itens

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

// Chama a função para carregar as empresas ao carregar a página (isso vai considerar a URL também)
window.onload = function() {
    carregarEmpresas();
};


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

async function carregarUsuarioResponsavel() {
    const servicoId = document.getElementById('servico-select').value;
    
    if (!servicoId) {
        // Limpa a lista de profissionais se nenhum serviço estiver selecionado
        document.getElementById('profissional-select').innerHTML = '<option value="">Selecione o Profissional</option>';
        return;
    }

    try {
        // Faz uma chamada para buscar o serviço específico pelo ID
        const response = await axios.get(`/api/servicos/detalhes/${servicoId}`);
        const servico = response.data;
        
        const selectUsuarios = document.getElementById('profissional-select');
        selectUsuarios.innerHTML = '<option value="">Selecione o Profissional</option>';

        if (!servico || !servico.id_usuario || !servico.usuarios) {
            selectUsuarios.innerHTML = '<option value="">Nenhum Profissional encontrado</option>';
            return;
        }

        // Adiciona o usuário responsável ao select
        const option = document.createElement('option');
        option.value = servico.id_usuario;
        option.textContent = servico.usuarios.nome_usuario; // Acessa o nome do profissional corretamente
        selectUsuarios.appendChild(option);
    } catch (error) {
        console.error('Erro ao carregar o usuário responsável:', error);
        alert('Erro ao carregar o profissional responsável. Tente novamente mais tarde.');
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
    carregarDetalhesEmpresa(empresaId); // Chama a nova função
    document.getElementById('modal-agendamento').style.display = 'block';
    document.getElementById('empresas-lista').style.display = 'none';
    document.getElementById('search-container').style.display = 'none';
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


const form = document.getElementById('form-agendamento');
    const telefoneInput = document.getElementById('telefone-input');

    // Remove caracteres inválidos do telefone
    telefoneInput.addEventListener('input', (event) => {
        const apenasNumeros = telefoneInput.value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
        telefoneInput.value = apenasNumeros; // Atualiza o valor no campo
    });

    // Validação ao enviar o formulário
    form.addEventListener('submit', (event) => {
        const telefone = telefoneInput.value;

        // Verifica se o telefone tem um tamanho válido (ex: 10 ou 11 dígitos para o Brasil)
        if (telefone.length < 10 || telefone.length > 11) {
            alert('Por favor, insira um número de telefone válido com 10 ou 11 dígitos.');
            event.preventDefault(); // Impede o envio do formulário
            return;
        }

        // (Opcional) Aqui, o campo de telefone já está limpo e validado antes de ser enviado ao banco
        console.log('Telefone validado e pronto para envio:', telefone);
    });




    /// codigo para listar empresa pela localização



// Verifica se a geolocalização está disponível no navegador
// Verifica se a geolocalização está disponível no navegador
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
            // URL da API de geolocalização
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            console.log(`[INFO] Enviando requisição para: ${url}`);

            // Faz a requisição para a API de geolocalização
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`[ERRO] Falha ao buscar cidade. Status HTTP: ${response.status}`);
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const data = await response.json();
            console.log("[INFO] Resposta completa da API:", data);

            // Verifica se a resposta contém o endereço
            if (!data.address) {
                console.error("[ERRO] Resposta não contém o campo 'address'.", data);
                throw new Error("A resposta da API não contém informações de endereço.");
            }

            // Tenta obter a cidade da resposta da API
            const cidade = data.address.city || 
                           data.address.town || 
                           data.address.village || 
                           data.address.municipality || 
                           data.address.county;

            if (cidade) {
                console.log(`[INFO] Cidade detectada: ${cidade}`);
                buscarEmpresas(cidade);  // Chama a função para buscar empresas para a cidade detectada
            } else {
                console.error("[ERRO] Nenhum nome de cidade foi encontrado na resposta.", data.address);
            }
        } catch (error) {
            console.error("[ERRO] Exceção capturada ao buscar a cidade:", error);
        }
    }, (error) => {
        console.error("[ERRO] Falha ao obter a localização do usuário:", error.message);
    });
} else {
    console.error("[ERRO] Geolocalização não suportada pelo navegador.");
}

// Função para buscar empresas com base na cidade
async function buscarEmpresas(cidade) {
    console.log(`[INFO] Buscando empresas para a cidade: ${cidade}`);

    try {
        // Monta a URL corretamente para o endpoint da API
        const url = `/api/empresas?cidade=${encodeURIComponent(cidade)}`;
        console.log(`[INFO] Enviando requisição para: ${url}`);

        // Realiza a requisição para buscar as empresas
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`[ERRO] Falha ao buscar empresas. Status HTTP: ${response.status}`);
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data = await response.json();
        console.log("[INFO] Resposta da API de empresas:", data);

        // Exibe as empresas no console ou na interface
        if (data.length === 0) {
            console.warn("[AVISO] Nenhuma empresa encontrada para esta cidade.");
        } else {
            // Exemplo de como exibir as empresas no console
            data.forEach(empresa => {
                console.log(`Empresa: ${empresa.nome_empresa}, Cidade: ${empresa.cidade}`);
                // Você pode processar os dados aqui para atualizar a UI com as empresas
            });
        }
    } catch (error) {
        console.error("[ERRO] Exceção ao buscar empresas:", error);
    }
}

function filtrarEmpresas() {
    const input = document.getElementById("filtro-cidade").value.toLowerCase();
    const empresas = document.querySelectorAll(".empresa-card");

    empresas.forEach(empresa => {
        const cidade = empresa.querySelector(".empresa-info p:nth-child(5)").textContent.toLowerCase();
        if (cidade.includes(input)) {
            empresa.style.display = "flex";
        } else {
            empresa.style.display = "none";
        }
    });
}


