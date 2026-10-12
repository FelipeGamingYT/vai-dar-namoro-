/**
 * Main Application Orchestrator
 * Coordinates theme switching, audio settings, URL routing, and view toggling
 */
(function(window) {
  'use strict';
  window.App = window.App || {};

  class App {
    constructor() {
      this.viewCreator = document.getElementById('view-creator');
      this.viewProposal = document.getElementById('view-proposal');
      this.cardProposal = document.getElementById('card-proposal');
      this.cardCelebration = document.getElementById('card-celebration');

      this.btnThemeToggle = document.getElementById('btn-theme-toggle');
      this.btnSoundToggle = document.getElementById('btn-sound-toggle');
      this.btnSwitchView = document.getElementById('btn-switch-view');

      this.initTheme();
      this.initAudioToggle();
      this.initRouting();
    }

    // Theme Handling
    initTheme() {
      const savedTheme = localStorage.getItem('site_theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

      this.applyTheme(initialTheme);

      if (this.btnThemeToggle) {
        this.btnThemeToggle.onclick = () => {
          const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          this.applyTheme(newTheme);
        };
      }
    }

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('site_theme', theme);
      if (this.btnThemeToggle) {
        this.btnThemeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        this.btnThemeToggle.title = theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro';
      }
    }

    // Sound Toggle Handling
    initAudioToggle() {
      if (this.btnSoundToggle) {
        const isEnabled = window.App.sound ? window.App.sound.enabled : true;
        this.updateSoundButtonUI(isEnabled);
        this.btnSoundToggle.onclick = () => {
          if (window.App.sound) {
            const nextState = window.App.sound.toggleSound();
            this.updateSoundButtonUI(nextState);
          }
        };
      }
    }

    updateSoundButtonUI(isEnabled) {
      if (this.btnSoundToggle) {
        this.btnSoundToggle.textContent = isEnabled ? '🔊' : '🔇';
        this.btnSoundToggle.title = isEnabled ? 'Desativar sons' : 'Ativar sons';
      }
    }

    // URL Query Parameters Extraction
    getParams() {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      const para = searchParams.get('para') || hashParams.get('para');
      const de = searchParams.get('de') || hashParams.get('de');
      const msg = searchParams.get('msg') || hashParams.get('msg');
      const pergunta = searchParams.get('pergunta') || hashParams.get('pergunta');
      const criar = searchParams.get('criar') || hashParams.get('criar');

      return { para, de, msg, pergunta, criar };
    }

    // Routing
    initRouting() {
      const params = this.getParams();

      // Se tiver parâmetros na URL (link enviado com ?para=...), abre direto o Pedido!
      // Se entrar direto no site, aparece PRIMEIRO a tela de Criar o Meu!
      if (params.para) {
        this.showProposalView(params);
      } else {
        this.showCreatorView();
      }

      if (this.btnSwitchView) {
        this.btnSwitchView.onclick = () => {
          if (!this.viewCreator.classList.contains('hidden')) {
            const currentParams = this.getParams();
            this.showProposalView({
              para: currentParams.para || 'Meu Amor',
              de: currentParams.de || '',
              msg: currentParams.msg || 'Eu tenho algo muito especial e importante guardado no coração para te perguntar...',
              pergunta: currentParams.pergunta || 'quer namorar comigo?'
            });
          } else {
            this.showCreatorView();
          }
        };
      }
    }

    showCreatorView() {
      this.viewCreator.classList.remove('hidden');
      this.viewProposal.classList.add('hidden');
      if (this.btnSwitchView) {
        this.btnSwitchView.textContent = '👀 Ver Demonstração';
        this.btnSwitchView.title = 'Ver como fica a tela do pedido';
      }

      if (window.App.setupCreator) {
        window.App.setupCreator({
          onPreview: (data) => {
            this.showProposalView(data);
          }
        });
      }
    }

    showProposalView(data) {
      this.viewCreator.classList.add('hidden');
      this.viewProposal.classList.remove('hidden');
      this.cardProposal.classList.remove('hidden');
      this.cardCelebration.classList.add('hidden');

      if (this.btnSwitchView) {
        this.btnSwitchView.textContent = '✨ Criar o Meu';
        this.btnSwitchView.title = 'Voltar para a tela de criação';
      }

      if (window.App.setupProposal) {
        window.App.setupProposal({
          para: data.para,
          de: data.de,
          msg: data.msg,
          pergunta: data.pergunta,
          onReset: () => {
            this.showCreatorView();
          }
        });
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.App.instance = new App();
  });
})(window);
