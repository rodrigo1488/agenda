function ativarFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }
  
  // Mantém o fullscreen ativo se estiver navegando dentro da mesma sessão
  document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('fullscreenAtivado') === 'true') {
      ativarFullscreen();
    }
  
    document.addEventListener('click', () => {
      ativarFullscreen();
      sessionStorage.setItem('fullscreenAtivado', 'true'); // Mantém para a sessão atual
    });
  });
  