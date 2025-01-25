function renderMenu(containerId) {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex'; // Exibe a tela de carregamento

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container com o ID "${containerId}" não encontrado.`);
        loading.style.display = 'none'; // Remove a tela de carregamento em caso de erro
        return;
    }

    fetch('/api/empresa/logada')
        .then(response => response.json())
        .then(data => {
            const logo = data.logo || '/static/img/logo.png';
            const corEmpresa = data.cor_emp || '#343a40';

            container.innerHTML = `
                <nav id="menu-lateral" class="text-white p-3" style="width: 250px; min-height: 100vh; background-color: ${corEmpresa};">
                    <ul class="nav flex-column mt-4">
                        <img src="${logo}" id="logo" alt="Logo da Empresa" style="max-width: 100%; height: 180px;">
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
                            <a href="/servicos" class="nav-link text-white"><i class="bi bi-hammer"></i> Serviços</a>
                        </li>
                        <li class="nav-item mb-3">
                            <a href="/relatorios" class="nav-link text-white"><i class="bi bi-bar-chart"></i> Relatórios</a>
                        </li>
                        <li class="nav-item mb-3">
                            <a href="/configuracao" class="nav-link text-white"><i class="bi bi-gear"></i> Configurações</a>
                        </li>
                        <li class="nav-item mb-3">
                            <a href="/login" class="nav-link text-white"><i class="bi bi-arrow-90deg-up"></i> sair</a>
                        </li>
                    </ul>
                </nav>
            `;
            const toggleMenu = document.getElementById('toggle-menu');
            const menuLateral = document.getElementById('menu-lateral');
            if (toggleMenu && menuLateral) {
                toggleMenu.addEventListener('click', () => {
                    menuLateral.classList.toggle('open');
                });
            } else {
                console.error('Toggle button ou menu lateral não encontrado.');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados da empresa:', error);
        })
        .finally(() => {
            loading.style.display = 'none'; // Oculta a tela de carregamento após o carregamento
        });
}
