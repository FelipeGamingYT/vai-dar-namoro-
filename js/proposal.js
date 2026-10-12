/**
 * Proposal Engine Module
 * Handles proposal screen interaction, fleeing 'Não' button mechanics that teleports to another corner with funny phrases,
 * sound effects, and celebration.
 */
(function(window) {
  'use strict';
  window.App = window.App || {};

  function setupProposal({ para, de, msg, pergunta, onReset }) {
    const cardProposal = document.getElementById('card-proposal');
    const cardCelebration = document.getElementById('card-celebration');

    const emojiAvatar = document.getElementById('proposal-emoji');
    const titleElem = document.getElementById('proposal-title');
    const descElem = document.getElementById('proposal-desc');

    const btnSim = document.getElementById('btn-sim');
    const btnNao = document.getElementById('btn-nao');

    const celebTitle = document.getElementById('celeb-title');
    const celebSubtitle = document.getElementById('celeb-subtitle');
    const celebDesc = document.getElementById('celeb-desc');
    const btnNotifyWa = document.getElementById('btn-notify-wa');
    const btnCreateOwn = document.getElementById('btn-create-own');

    const targetName = para || 'Meu amor';
    const senderName = de || '';
    const questionText = pergunta || 'quer namorar comigo?';
    const customMessage = msg || 'Desde o momento em que você entrou na minha vida, tudo ficou mais bonito e especial...';

    if (titleElem) {
      titleElem.textContent = `${targetName}, ${questionText}`;
    }
    if (descElem) {
      descElem.textContent = customMessage;
    }
    if (emojiAvatar) {
      emojiAvatar.textContent = '🥺';
    }

    // Reset button styles in case of view flip
    if (btnNao) {
      btnNao.style.position = '';
      btnNao.style.left = '';
      btnNao.style.top = '';
      btnNao.innerHTML = 'Não';
    }
    if (btnSim) {
      btnSim.style.transform = 'scale(1)';
    }

    let dodgeCount = 0;
    let lastCornerIndex = -1;

    // Speech bubble element attached to "Não" button
    let speechBubble = document.createElement('div');
    speechBubble.className = 'nao-bubble hidden';
    if (btnNao) {
      btnNao.appendChild(speechBubble);
    }

    const cornerPhrases = [
      'Ops! Fui pra cá! 🏃💨',
      'Quase me pegou! 😜',
      'Aqui não! 🤭',
      'Tenta de novo! 🏃‍♀️',
      'Pensa com carinho... 🥺',
      'Clica no Sim logo! 💕',
      'Nem pensar! 🙅‍♂️',
      'Eu te pago um açaí! 🍧',
      'Erro 404: Opção inválida! ⚡',
      'Prometo te amar pra sempre! 💍',
      'Não adianta fugir do amor! 🥰',
      'Nem o Google acha alguém melhor! 🔎',
      'Última chance de reconsiderar! ✨',
      'Eu sei fazer massagem e cafuné! 💆',
      'Olha o meu coraçãozinho 💔'
    ];

    const buttonLabels = [
      'Não',
      'Errou! 😜',
      'Aqui não! 🤭',
      'Nem tenta!',
      'Quase! 😂',
      'Diz Sim! 💕',
      'Tô longe! 🏃',
      'Impossível! ⚡',
      'Só Sim! 💖'
    ];

    function spawnPoof(x, y) {
      const poof = document.createElement('div');
      poof.className = 'poof-cloud';
      poof.textContent = '💨';
      poof.style.left = `${x}px`;
      poof.style.top = `${y}px`;
      document.body.appendChild(poof);
      setTimeout(() => poof.remove(), 500);
    }

    function getCorners(btnWidth, btnHeight) {
      const padding = 22;
      const topSafe = 80; // Below top bar
      const bottomSafe = 75; // Above mobile browser bar

      const maxX = Math.max(window.innerWidth - btnWidth - padding, padding);
      const maxY = Math.max(window.innerHeight - btnHeight - bottomSafe, topSafe);
      const midX = Math.floor(maxX / 2);
      const midY = Math.floor((topSafe + maxY) / 2);

      return [
        { name: 'top-left', x: padding, y: topSafe },
        { name: 'top-right', x: maxX, y: topSafe },
        { name: 'bottom-left', x: padding, y: maxY },
        { name: 'bottom-right', x: maxX, y: maxY },
        { name: 'mid-left', x: padding, y: midY },
        { name: 'mid-right', x: maxX, y: midY },
        { name: 'top-center', x: midX, y: topSafe },
        { name: 'bottom-center', x: midX, y: maxY }
      ];
    }

    let isFleeing = false;

    function fleeButton(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isFleeing) return;
      isFleeing = true;
      setTimeout(() => { isFleeing = false; }, 180);

      dodgeCount++;

      // Mobile Haptic Vibration Feedback
      if (navigator.vibrate) {
        try {
          navigator.vibrate(45);
        } catch (err) {}
      }

      // Play audio effect
      if (window.App.sound) {
        window.App.sound.playDodge();
      }

      // Current position before jump (for poof smoke effect)
      const currentRect = btnNao.getBoundingClientRect();
      spawnPoof(currentRect.left + currentRect.width / 4, currentRect.top);

      const btnWidth = btnNao.offsetWidth || 110;
      const btnHeight = btnNao.offsetHeight || 48;
      const corners = getCorners(btnWidth, btnHeight);

      // Pick a different corner each time
      let nextCornerIndex;
      do {
        nextCornerIndex = Math.floor(Math.random() * corners.length);
      } while (nextCornerIndex === lastCornerIndex && corners.length > 1);

      lastCornerIndex = nextCornerIndex;
      const targetCorner = corners[nextCornerIndex];

      // Slight natural random jitter within the corner
      const jitterX = Math.floor((Math.random() - 0.5) * 20);
      const jitterY = Math.floor((Math.random() - 0.5) * 20);
      const finalX = Math.max(16, Math.min(window.innerWidth - btnWidth - 16, targetCorner.x + jitterX));
      const finalY = Math.max(70, Math.min(window.innerHeight - btnHeight - 65, targetCorner.y + jitterY));

      // Teleport button to new corner
      btnNao.style.position = 'fixed';
      btnNao.style.left = `${finalX}px`;
      btnNao.style.top = `${finalY}px`;
      btnNao.style.zIndex = '999';

      // Update button text and speech bubble
      const phraseText = cornerPhrases[dodgeCount % cornerPhrases.length];
      const buttonText = buttonLabels[dodgeCount % buttonLabels.length];

      btnNao.textContent = buttonText;
      speechBubble.textContent = phraseText;
      speechBubble.classList.remove('hidden');
      btnNao.appendChild(speechBubble);

      // Visual teleport bounce animation
      btnNao.classList.remove('teleport-pop');
      void btnNao.offsetWidth; // Trigger reflow
      btnNao.classList.add('teleport-pop');

      // Grow "Sim" button
      const scale = Math.min(1 + dodgeCount * 0.14, 2.3);
      btnSim.style.transform = `scale(${scale})`;

      // Change avatar emoji
      if (dodgeCount > 1) {
        emojiAvatar.textContent = dodgeCount % 2 === 0 ? '😢' : '🥺';
      }
    }

    // Proximity detection: when mouse moves close to "Não", it teleports away before you can touch it!
    function handleProximity(e) {
      if (!btnNao || !cardProposal || cardProposal.classList.contains('hidden')) return;
      const rect = btnNao.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

      if (dist < 70) {
        fleeButton(e);
      }
    }

    window.addEventListener('pointermove', handleProximity);

    if (btnNao) {
      btnNao.onmouseenter = fleeButton;
      btnNao.ontouchstart = (e) => {
        fleeButton(e);
      };
      btnNao.onpointerdown = (e) => {
        fleeButton(e);
      };
      btnNao.onclick = fleeButton;
    }

    if (btnSim) {
      btnSim.onclick = () => {
        window.removeEventListener('pointermove', handleProximity);

        // Mobile Celebration Vibration Pattern
        if (navigator.vibrate) {
          try {
            navigator.vibrate([100, 50, 100, 50, 250]);
          } catch (err) {}
        }

        if (window.App.sound) {
          window.App.sound.playCelebration();
        }
        if (window.App.particles) {
          window.App.particles.triggerCelebration();
        }

        const confettiInterval = setInterval(() => {
          if (window.App.particles) {
            window.App.particles.triggerCelebration();
          }
        }, 4500);

        if (cardProposal) cardProposal.classList.add('hidden');
        if (cardCelebration) {
          cardCelebration.classList.remove('hidden');
          cardCelebration.classList.add('pop-in');
        }

        if (celebTitle) celebTitle.textContent = 'ELA DISSE SIM! 🎉💍❤️';
        if (celebSubtitle) {
          celebSubtitle.textContent = senderName
            ? `${senderName} & ${targetName}`
            : `Para sempre juntos com ${targetName} ❤️`;
        }
        if (celebDesc) {
          celebDesc.textContent = 'O melhor e mais lindo capítulo da nossa história começa agora. Prepare o coração para os momentos mais incríveis ao meu lado! 💑✨';
        }

        // Oculta completamente o botão "Criar o Meu" no topo ao aceitar o pedido
        const btnSwitch = document.getElementById('btn-switch-view');
        if (btnSwitch) {
          btnSwitch.classList.add('hidden');
        }

        if (btnNotifyWa) {
          btnNotifyWa.onclick = () => {
            const replyText = `SIM! Eu aceito namorar com você! ❤️💍 Mal posso esperar pelo nosso próximo momento juntinhos! ✨`;
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(replyText)}`;
            window.open(waUrl, '_blank', 'noopener,noreferrer');
          };
        }
      };
    }
  }

  window.App.setupProposal = setupProposal;
})(window);
