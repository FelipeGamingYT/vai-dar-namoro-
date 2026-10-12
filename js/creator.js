/**
 * Proposal Creator Module
 * Handles form validation, customized URL generation, WhatsApp sharing, QR Code modal, and Mobile Web Share
 */
(function(window) {
  'use strict';
  window.App = window.App || {};

  function setupCreator({ onPreview }) {
    const form = document.getElementById('form-creator');
    const inputPara = document.getElementById('input-para');
    const inputDe = document.getElementById('input-de');
    const inputMsg = document.getElementById('input-msg');
    const inputPergunta = document.getElementById('input-pergunta');

    const shareBox = document.getElementById('share-box');
    const shareLinkText = document.getElementById('share-link-text');
    const btnCopy = document.getElementById('btn-copy');
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    const btnShareNative = document.getElementById('btn-share-native');
    const btnQr = document.getElementById('btn-qr');
    const btnPreview = document.getElementById('btn-preview');

    const qrModal = document.getElementById('qr-modal');
    const qrCanvas = document.getElementById('qr-canvas');
    const qrSubtext = document.getElementById('qr-subtext');
    const btnCloseModal = document.getElementById('btn-close-modal');

    let currentLink = '';
    let networkIpInfo = null;

    // Detect local network IP for mobile testing if running local server
    fetch('/api/network-info')
      .then(res => res.json())
      .then(info => {
        if (info && info.ip && info.ip !== 'localhost') {
          networkIpInfo = info;
        }
      })
      .catch(() => {});

    // Show native share button on mobile devices supporting Web Share API
    if (btnShareNative) {
      if (navigator.share) {
        btnShareNative.classList.remove('hidden');
      } else {
        btnShareNative.classList.add('hidden');
      }
    }

    // Generate URL with current input values
    function generateProposalUrl(forceNetworkIp = false) {
      const para = (inputPara.value || '').trim();
      const de = (inputDe.value || '').trim();
      const msg = (inputMsg.value || '').trim();
      const pergunta = (inputPergunta.value || '').trim();

      if (!para) {
        showToast('Por favor, informe o nome de quem vai receber! 💖');
        inputPara.focus();
        return null;
      }

      const params = new URLSearchParams();
      params.set('para', para);
      if (de) params.set('de', de);
      if (msg) params.set('msg', msg);
      if (pergunta) params.set('pergunta', pergunta);

      let baseUrl;
      if (forceNetworkIp && networkIpInfo) {
        baseUrl = `http://${networkIpInfo.ip}:${networkIpInfo.port}/`;
      } else if (window.location.origin && window.location.origin !== 'null') {
        baseUrl = window.location.origin + window.location.pathname;
      } else {
        baseUrl = window.location.href.split('?')[0].split('#')[0];
      }

      const finalUrl = `${baseUrl}?${params.toString()}`;
      return { finalUrl, para, de, msg, pergunta };
    }

    // Submit Handler
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const result = generateProposalUrl();
        if (!result) return;

        currentLink = result.finalUrl;
        shareLinkText.textContent = currentLink;
        shareBox.classList.remove('hidden');
        shareBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        copyToClipboard(currentLink, false);
        showToast('Link especial gerado! Copie ou envie direto no WhatsApp 💌');
      };
    }

    // Copy Link Button
    if (btnCopy) {
      btnCopy.onclick = () => {
        if (!currentLink) return;
        copyToClipboard(currentLink, true);
      };
    }

    // WhatsApp Share Button
    if (btnWhatsapp) {
      btnWhatsapp.onclick = () => {
        if (!currentLink) return;
        const para = (inputPara.value || '').trim();
        const messageText = `Oi ${para ? para : 'meu amor'}... Tenho uma pergunta muito especial e importante para te fazer! 💌 Dá uma olhadinha aqui:\n${currentLink}`;
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      };
    }

    // Mobile Web Share API Button
    if (btnShareNative) {
      btnShareNative.onclick = async () => {
        if (!currentLink) return;
        const para = (inputPara.value || '').trim();
        const messageText = `Oi ${para ? para : 'meu amor'}... Tenho uma pergunta muito especial e importante para te fazer! 💌`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Tenho uma pergunta pra você 💌',
              text: messageText,
              url: currentLink
            });
            showToast('Compartilhado com sucesso! 💖');
          } catch (err) {
            // User cancelled share or not supported
          }
        }
      };
    }

    // QR Code Modal Trigger
    if (btnQr && qrCanvas) {
      btnQr.onclick = () => {
        if (!currentLink) return;

        // If on computer and testing locally, generate QR with the phone Wi-Fi URL!
        let qrTargetUrl = currentLink;
        if (networkIpInfo && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          const mobileResult = generateProposalUrl(true);
          if (mobileResult) {
            qrTargetUrl = mobileResult.finalUrl;
            if (qrSubtext) {
              qrSubtext.innerHTML = `Escaneie com a câmera do celular conectado ao mesmo Wi-Fi:<br><strong style="color: var(--primary);">http://${networkIpInfo.ip}:${networkIpInfo.port}</strong>`;
            }
          }
        }

        if (window.App.renderQRCode) {
          window.App.renderQRCode(qrTargetUrl, qrCanvas);
        }
        qrModal.classList.add('open');
      };
    }

    if (btnCloseModal && qrModal) {
      btnCloseModal.onclick = () => {
        qrModal.classList.remove('open');
      };

      qrModal.onclick = (e) => {
        if (e.target === qrModal) {
          qrModal.classList.remove('open');
        }
      };
    }

    // Preview Button
    if (btnPreview) {
      btnPreview.onclick = (e) => {
        e.preventDefault();
        const result = generateProposalUrl();
        if (!result) return;
        if (typeof onPreview === 'function') {
          onPreview(result);
        }
      };
    }
  }

  function copyToClipboard(text, notify = true) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        if (notify) showToast('Link copiado com sucesso! 📋✨');
      }).catch(() => {
        fallbackCopy(text, notify);
      });
    } else {
      fallbackCopy(text, notify);
    }
  }

  function fallbackCopy(text, notify) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      if (notify) showToast('Link copiado com sucesso! 📋✨');
    } catch (err) {
      if (notify) showToast('Não foi possível copiar automaticamente.');
    }
    document.body.removeChild(textArea);
  }

  function showToast(message, duration = 3200) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  window.App.setupCreator = setupCreator;
  window.App.copyToClipboard = copyToClipboard;
  window.App.showToast = showToast;
})(window);
