function renderMenu(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container com o ID "${containerId}" não encontrado.`);
        return;
    }

    container.innerHTML = `
        <nav id="menu-lateral" class="text-white p-3" style="width: 250px; min-height: 100vh;">
            <ul class="nav flex-column mt-4">
                <img src="/static/img/logo.png" id="logo" alt="">
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
                    <a href="/login" class="nav-link text-white" style="margin-top: 5%;"><i class="bi bi-arrow-90deg-up"></i> sair</a>
                </li>
            </ul>
        </nav>
    `;
}
