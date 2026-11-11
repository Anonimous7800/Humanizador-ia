(function () {
  'use strict';

  const dom = {
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    soundToggle: document.getElementById('soundToggle'),
    soundIcon: document.getElementById('soundIcon'),
    btnSampleAi: document.getElementById('btnSampleAi'),
    btnSampleHuman: document.getElementById('btnSampleHuman'),
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    textArea: document.getElementById('textArea'),
    btnAnalyze: document.getElementById('btnAnalyze'),
    btnClear: document.getElementById('btnClear'),
    btnPaste: document.getElementById('btnPaste'),
    wordCount: document.getElementById('wordCount'),
    charCount: document.getElementById('charCount'),
    readingTime: document.getElementById('readingTime'),
    filesSection: document.getElementById('filesSection'),
    filesList: document.getElementById('filesList'),
    resultsSection: document.getElementById('resultsSection'),
    gaugeArc: document.getElementById('gaugeArc'),
    gaugeNeedleTip: document.getElementById('gaugeNeedleTip'),
    gaugeAura: document.getElementById('gaugeAura'),
    scoreValue: document.getElementById('scoreValue'),
    verdictBadge: document.getElementById('verdictBadge'),
    verdictMessage: document.getElementById('verdictMessage'),
    breakdownAi: document.getElementById('breakdownAi'),
    breakdownHuman: document.getElementById('breakdownHuman'),
    breakdownEdited: document.getElementById('breakdownEdited'),
    breakdownEditedRow: document.getElementById('breakdownEditedRow'),
    metricsGrid: document.getElementById('metricsGrid'),
    previewBox: document.getElementById('previewBox'),
    previewTabs: document.getElementById('previewTabs'),
    tabDocView: document.getElementById('tabDocView'),
    tabHeatmapView: document.getElementById('tabHeatmapView'),
    previewNote: document.getElementById('previewNote'),
    sectionMap: document.getElementById('sectionMap'),
    forensicSection: document.getElementById('forensicSection'),
    forensicMeta: document.getElementById('forensicMeta'),
    forensicFlags: document.getElementById('forensicFlags'),
    btnHumanize: document.getElementById('btnHumanize'),
    humanizeSection: document.getElementById('humanizeSection'),
    humanizeMsg: document.getElementById('humanizeMsg'),
    humanizeOutput: document.getElementById('humanizeOutput'),
    btnCopyHumanized: document.getElementById('btnCopyHumanized'),
    btnReanalyzeHumanized: document.getElementById('btnReanalyzeHumanized'),
    copyToast: document.getElementById('copyToast'),
    btnPrintReport: document.getElementById('btnPrintReport'),
    btnExportJson: document.getElementById('btnExportJson'),
    toast: document.getElementById('toast'),
    filterHeatmap: document.getElementById('filterHeatmap'),
    sensitivitySelector: document.getElementById('sensitivitySelector'),
    analysisScanner: document.getElementById('analysisScanner'),
    scannerStatusText: document.getElementById('scannerStatusText'),
    sentenceTooltip: document.getElementById('sentenceTooltip'),
    sentenceNavGroup: document.getElementById('sentenceNavGroup'),
    btnPrevSentence: document.getElementById('btnPrevSentence'),
    btnNextSentence: document.getElementById('btnNextSentence'),
    sentenceCounter: document.getElementById('sentenceCounter'),
    btnOpenCorrections: document.getElementById('btnOpenCorrections'),
    correctionModal: document.getElementById('correctionModal'),
    correctionOverlay: document.getElementById('correctionOverlay'),
    btnCloseCorrection: document.getElementById('btnCloseCorrection'),
    corrBadge: document.getElementById('corrBadge'),
    corrCounter: document.getElementById('corrCounter'),
    corrOriginalText: document.getElementById('corrOriginalText'),
    corrReasons: document.getElementById('corrReasons'),
    corrEditText: document.getElementById('corrEditText'),
    btnApplySuggestion: document.getElementById('btnApplySuggestion'),
    btnPrevCorr: document.getElementById('btnPrevCorr'),
    btnNextCorr: document.getElementById('btnNextCorr'),
    btnApplyCorr: document.getElementById('btnApplyCorr'),
    btnDownloadCorrected: document.getElementById('btnDownloadCorrected'),
    btnCopyCorrected: document.getElementById('btnCopyCorrected')
  };

  let state = {
    documents: [],
    currentDoc: null,
    activeTab: 'heatmap',
    activeFilter: 'all',
    sensitivity: 'balanced',
    flaggedElements: [],
    activeFlaggedIdx: -1,
    pvToken: 0,
    currentScore: 0,
    theme: localStorage.getItem('veritai-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    flaggedSentencesData: [],
    currentCorrIdx: 0
  };

  function init() {
    applyTheme(state.theme);
    if (dom.soundIcon && window.SoundFX) {
      dom.soundIcon.textContent = window.SoundFX.isMuted() ? '🔇' : '🔊';
    }
    bindEvents();
    updateTextStats();
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('veritai-theme', theme);
    if (dom.themeIcon) {
      dom.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  function showToast(message, type = 'info') {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.className = `toast show ${type}`;
    setTimeout(() => {
      dom.toast.className = 'toast';
    }, 3200);
  }

  function updateTextStats() {
    const text = dom.textArea.value || '';
    const words = (text.match(/[\p{L}\p{N}’']+/gu) || []).length;
    const chars = text.length;
    const estTime = Math.max(1, Math.round(words / 200));

    dom.wordCount.textContent = `${words} palabras`;
    dom.charCount.textContent = `${chars} caracteres`;
    dom.readingTime.textContent = `~${estTime} min lectura`;

    if (words === 0) {
      dom.btnClear.disabled = true;
    } else {
      dom.btnClear.disabled = false;
    }
  }

  function bindEvents() {
    dom.themeToggle.addEventListener('click', () => {
      toggleTheme();
      if (window.SoundFX) window.SoundFX.playClick();
    });

    if (dom.soundToggle) {
      dom.soundToggle.addEventListener('click', () => {
        const isMuted = window.SoundFX ? window.SoundFX.toggleMute() : false;
        if (dom.soundIcon) {
          dom.soundIcon.textContent = isMuted ? '🔇' : '🔊';
        }
        showToast(isMuted ? 'Efectos de sonido silenciados' : 'Efectos de sonido activados 🔊', 'info');
      });
    }

    if (dom.sensitivitySelector) {
      dom.sensitivitySelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.seg-btn');
        if (!btn) return;
        if (window.SoundFX) window.SoundFX.playClick();
        dom.sensitivitySelector.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.sensitivity = btn.getAttribute('data-sens') || 'balanced';

        const text = dom.textArea.value.trim();
        if (text) {
          analyzeCurrentText(state.currentDoc ? state.currentDoc.name : 'Texto pegado', false);
        }
      });
    }

    dom.btnSampleAi.addEventListener('click', () => {
      if (window.SoundFX) window.SoundFX.playClick();
      dom.textArea.value = window.SampleData ? window.SampleData.ai : '';
      updateTextStats();
      analyzeCurrentText('Texto de ejemplo (Generado por IA)', true);
    });

    dom.btnSampleHuman.addEventListener('click', () => {
      if (window.SoundFX) window.SoundFX.playClick();
      dom.textArea.value = window.SampleData ? window.SampleData.human : '';
      updateTextStats();
      analyzeCurrentText('Texto de ejemplo (Redacción humana)', true);
    });

    dom.textArea.addEventListener('input', updateTextStats);

    dom.textArea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        dom.btnAnalyze.click();
      }
    });

    dom.btnClear.addEventListener('click', () => {
      dom.textArea.value = '';
      updateTextStats();
      dom.resultsSection.classList.add('hide');
      dom.filesSection.classList.add('hide');
      dom.humanizeSection.classList.add('hide');
      closeCorrectionModal();
      state.documents = [];
      state.currentDoc = null;
      state.currentScore = 0;
      showToast('Texto limpiado', 'info');
    });

    dom.btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          dom.textArea.value = text;
          updateTextStats();
          showToast('Texto pegado desde el portapapeles', 'success');
        } else {
          showToast('El portapapeles está vacío', 'info');
        }
      } catch (e) {
        showToast('Presiona Ctrl+V para pegar manualmente', 'info');
        dom.textArea.focus();
      }
    });

    dom.btnAnalyze.addEventListener('click', () => {
      const text = dom.textArea.value.trim();
      if (!text) {
        showToast('Escribe o pega algún texto antes de analizar', 'warning');
        dom.textArea.focus();
        return;
      }
      analyzeCurrentText('Texto pegado', true);
    });

    dom.dropZone.addEventListener('click', () => dom.fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
      dom.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dom.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.dropZone.classList.remove('dragover');
      });
    });

    dom.dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length) handleFilesUpload(files);
    });

    dom.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleFilesUpload(e.target.files);
        e.target.value = '';
      }
    });

    if (dom.btnPrevSentence) {
      dom.btnPrevSentence.addEventListener('click', () => {
        if (!state.flaggedElements.length) return;
        if (window.SoundFX) window.SoundFX.playClick();
        state.activeFlaggedIdx = (state.activeFlaggedIdx - 1 + state.flaggedElements.length) % state.flaggedElements.length;
        goToFlaggedSentence(state.activeFlaggedIdx);
      });
    }

    if (dom.btnNextSentence) {
      dom.btnNextSentence.addEventListener('click', () => {
        if (!state.flaggedElements.length) return;
        if (window.SoundFX) window.SoundFX.playClick();
        state.activeFlaggedIdx = (state.activeFlaggedIdx + 1) % state.flaggedElements.length;
        goToFlaggedSentence(state.activeFlaggedIdx);
      });
    }

    if (dom.btnOpenCorrections) {
      dom.btnOpenCorrections.addEventListener('click', () => {
        if (window.SoundFX) window.SoundFX.playClick();
        const targetIdx = state.activeFlaggedIdx >= 0 ? state.activeFlaggedIdx : 0;
        openCorrectionModal(targetIdx);
      });
    }

    if (dom.btnCloseCorrection) {
      dom.btnCloseCorrection.addEventListener('click', closeCorrectionModal);
    }

    if (dom.correctionOverlay) {
      dom.correctionOverlay.addEventListener('click', closeCorrectionModal);
    }

    if (dom.btnApplySuggestion) {
      dom.btnApplySuggestion.addEventListener('click', () => {
        applySuggestionToField();
        if (window.SoundFX) window.SoundFX.playClick();
      });
    }

    if (dom.btnPrevCorr) {
      dom.btnPrevCorr.addEventListener('click', () => {
        navigateCorrection(-1);
      });
    }

    if (dom.btnNextCorr) {
      dom.btnNextCorr.addEventListener('click', () => {
        navigateCorrection(1);
      });
    }

    if (dom.btnApplyCorr) {
      dom.btnApplyCorr.addEventListener('click', () => {
        applyCorrection();
      });
    }

    if (dom.btnDownloadCorrected) {
      dom.btnDownloadCorrected.addEventListener('click', downloadCorrectedDoc);
    }

    if (dom.btnCopyCorrected) {
      dom.btnCopyCorrected.addEventListener('click', copyCorrectedDoc);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.correctionModal && !dom.correctionModal.classList.contains('hide')) {
        closeCorrectionModal();
      }
    });

    if (dom.tabHeatmapView) {
      dom.tabHeatmapView.addEventListener('click', () => {
        state.activeTab = 'heatmap';
        updatePreviewTabs();
        renderPreview();
      });
    }

    if (dom.tabDocView) {
      dom.tabDocView.addEventListener('click', () => {
        state.activeTab = 'pdf';
        updatePreviewTabs();
        renderPreview();
      });
    }

    if (dom.filterHeatmap) {
      dom.filterHeatmap.addEventListener('change', (e) => {
        state.activeFilter = e.target.value;
        renderPreview();
      });
    }

    dom.btnHumanize.addEventListener('click', handleHumanize);

    dom.btnCopyHumanized.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(dom.humanizeOutput.value);
        if (window.SoundFX) window.SoundFX.playCopy();
        showToast('¡Texto humanizado copiado al portapapeles! ✓', 'success');
      } catch (err) {
        dom.humanizeOutput.select();
        showToast('Selecciona y copia con Ctrl+C', 'info');
      }
    });

    dom.btnReanalyzeHumanized.addEventListener('click', () => {
      const newText = dom.humanizeOutput.value.trim();
      if (!newText) return;
      dom.textArea.value = newText;
      updateTextStats();
      analyzeCurrentText('Versión humanizada', true);
      showToast('Analizando versión humanizada...', 'info');
    });

    dom.btnPrintReport.addEventListener('click', () => {
      window.print();
    });

    dom.btnExportJson.addEventListener('click', exportJsonReport);

    initSentenceTooltips();
  }

  function initSentenceTooltips() {
    if (!dom.sentenceTooltip) return;

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('.sentence-highlight');
      if (!target) return;

      const prob = target.getAttribute('data-prob');
      const reasonsJson = target.getAttribute('data-reasons');
      if (!prob) return;

      let reasons = [];
      try {
        reasons = JSON.parse(reasonsJson || '[]');
      } catch (err) {}

      const pVal = parseInt(prob, 10);
      const color = pVal >= 48 ? 'var(--color-danger)' : 'var(--color-warning)';
      const label = pVal >= 48 ? 'Alta probabilidad IA' : 'Dudosa / Mixta';

      let reasonsHtml = '';
      if (reasons.length) {
        reasonsHtml = `<ul class="tooltip-reasons">${reasons.map(r => `<li>${window.TextAnalyzer.escapeHtml(r)}</li>`).join('')}</ul>`;
      }

      dom.sentenceTooltip.innerHTML = `
        <div class="tooltip-header">
          <span class="tooltip-badge" style="background:${color}22; color:${color}; border: 1px solid ${color}66">${label}: ${prob}%</span>
        </div>
        ${reasonsHtml}
        <div style="margin-top:6px; font-size:0.75rem; color:var(--text-muted); text-align:right;">✏️ Haz clic para corregir en el documento</div>
      `;

      dom.sentenceTooltip.classList.remove('hide');
      positionTooltip(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (!dom.sentenceTooltip.classList.contains('hide')) {
        positionTooltip(e);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('.sentence-highlight');
      if (target) {
        dom.sentenceTooltip.classList.add('hide');
      }
    });
  }

  function positionTooltip(e) {
    const tooltip = dom.sentenceTooltip;
    const padding = 15;
    let x = e.clientX + padding;
    let y = e.clientY - tooltip.offsetHeight - 10;

    if (x + tooltip.offsetWidth > window.innerWidth - 10) {
      x = window.innerWidth - tooltip.offsetWidth - 10;
    }
    if (y < 10) {
      y = e.clientY + 20;
    }

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function setupSentenceNavigation() {
    if (!dom.previewBox || !dom.sentenceNavGroup) return;
    state.flaggedElements = Array.from(dom.previewBox.querySelectorAll('.sentence-highlight'));
    state.activeFlaggedIdx = state.flaggedElements.length > 0 ? 0 : -1;

    buildFlaggedSentencesData();

    if (state.flaggedElements.length > 0) {
      dom.sentenceNavGroup.style.display = 'inline-flex';
      dom.sentenceCounter.textContent = `1 / ${state.flaggedElements.length}`;
    } else {
      dom.sentenceNavGroup.style.display = 'none';
      dom.sentenceCounter.textContent = '0 / 0';
    }
  }

  function buildFlaggedSentencesData() {
    state.flaggedSentencesData = [];
    if (!state.flaggedElements.length) return;

    state.flaggedElements.forEach((el, index) => {
      const text = el.getAttribute('data-raw') || el.textContent || '';
      const prob = parseInt(el.getAttribute('data-prob') || '0', 10);
      let reasons = [];
      try {
        reasons = JSON.parse(el.getAttribute('data-reasons') || '[]');
      } catch (e) {}

      state.flaggedSentencesData.push({
        index,
        element: el,
        text: text.trim(),
        prob,
        reasons
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dom.sentenceTooltip) dom.sentenceTooltip.classList.add('hide');
        openCorrectionModal(index);
      });
    });
  }

  function goToFlaggedSentence(idx) {
    if (!state.flaggedElements.length || idx < 0 || idx >= state.flaggedElements.length) return;
    const el = state.flaggedElements[idx];
    if (dom.sentenceCounter) {
      dom.sentenceCounter.textContent = `${idx + 1} / ${state.flaggedElements.length}`;
    }

    state.flaggedElements.forEach(item => item.classList.remove('active-focus'));
    el.classList.add('active-focus');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function openCorrectionModal(idx = 0) {
    if (!dom.correctionModal) return;
    if (!state.flaggedSentencesData.length) {
      showToast('No hay frases sospechosas pendientes en este documento', 'info');
      return;
    }

    state.currentCorrIdx = Math.max(0, Math.min(idx, state.flaggedSentencesData.length - 1));
    const item = state.flaggedSentencesData[state.currentCorrIdx];
    if (!item) return;

    state.activeFlaggedIdx = state.currentCorrIdx;
    goToFlaggedSentence(state.currentCorrIdx);

    const isHighAi = item.prob >= 48;
    dom.corrBadge.textContent = `${item.prob}% IA`;
    dom.corrBadge.className = `correction-badge ${isHighAi ? '' : 'warning'}`;
    dom.corrCounter.textContent = `${state.currentCorrIdx + 1} de ${state.flaggedSentencesData.length}`;

    dom.corrOriginalText.textContent = item.text;

    if (item.reasons && item.reasons.length) {
      dom.corrReasons.innerHTML = item.reasons.map(r => `<span class="corr-reason-tag">${window.TextAnalyzer.escapeHtml(r)}</span>`).join('');
    } else {
      dom.corrReasons.innerHTML = '<span class="corr-reason-tag">Patrón uniforme de longitud y vocabulario</span>';
    }

    const suggestion = window.Humanizer ? window.Humanizer.suggestFix(item.text) : item.text;
    dom.corrEditText.value = suggestion;

    dom.btnPrevCorr.disabled = state.currentCorrIdx === 0;
    dom.btnNextCorr.disabled = state.currentCorrIdx === state.flaggedSentencesData.length - 1;

    dom.correctionModal.classList.remove('hide');
    setTimeout(() => {
      dom.corrEditText.focus();
      dom.corrEditText.select();
    }, 50);
  }

  function closeCorrectionModal() {
    if (!dom.correctionModal) return;
    dom.correctionModal.classList.add('hide');
  }

  function navigateCorrection(step) {
    if (!state.flaggedSentencesData.length) return;
    const nextIdx = state.currentCorrIdx + step;
    if (nextIdx >= 0 && nextIdx < state.flaggedSentencesData.length) {
      if (window.SoundFX) window.SoundFX.playClick();
      openCorrectionModal(nextIdx);
    }
  }

  function applySuggestionToField() {
    const item = state.flaggedSentencesData[state.currentCorrIdx];
    if (!item) return;
    const suggestion = window.Humanizer ? window.Humanizer.suggestFix(item.text) : item.text;
    dom.corrEditText.value = suggestion;
    dom.corrEditText.focus();
  }

  function applyCorrection() {
    if (!state.flaggedSentencesData.length) return;
    const item = state.flaggedSentencesData[state.currentCorrIdx];
    if (!item) return;

    const originalSentence = item.text;
    const newSentence = dom.corrEditText.value.trim();

    if (!newSentence) {
      showToast('La corrección no puede estar vacía', 'warning');
      return;
    }

    const fullDocText = dom.textArea.value;
    const indexInDoc = fullDocText.indexOf(originalSentence);

    if (indexInDoc === -1) {
      const normalizedDoc = fullDocText.replace(/\s+/g, ' ');
      const normalizedOrig = originalSentence.replace(/\s+/g, ' ');
      const normIndex = normalizedDoc.indexOf(normalizedOrig);
      if (normIndex === -1) {
        showToast('No se encontró la frase exacta en el documento; pudo haber cambiado previamente.', 'warning');
        return;
      }
    }

    let updatedDocText = fullDocText;
    if (indexInDoc !== -1) {
      updatedDocText = fullDocText.slice(0, indexInDoc) + newSentence + fullDocText.slice(indexInDoc + originalSentence.length);
    } else {
      updatedDocText = fullDocText.replace(originalSentence, newSentence);
    }

    dom.textArea.value = updatedDocText;
    updateTextStats();

    if (state.currentDoc) {
      state.currentDoc.text = updatedDocText;
    }

    if (window.SoundFX) window.SoundFX.playCopy();

    const docName = state.currentDoc ? state.currentDoc.name : 'Texto editado';
    const analysis = window.TextAnalyzer.analyze(updatedDocText, state.sensitivity);
    const updatedDoc = buildDocumentItem(updatedDocText, docName, null, state.currentDoc ? state.currentDoc.metadata : [], [], analysis, state.currentDoc ? state.currentDoc.pdfDocument : null);

    state.currentDoc = updatedDoc;
    renderDashboard(updatedDoc);

    showToast(`Frase corregida ✓ Nuevo nivel de IA: ${analysis.score}%`, 'success');

    if (state.flaggedSentencesData.length > 0) {
      const nextIdx = Math.min(state.currentCorrIdx, state.flaggedSentencesData.length - 1);
      openCorrectionModal(nextIdx);
    } else {
      closeCorrectionModal();
      if (window.ParticleFX) window.ParticleFX.burstConfetti();
      showToast('¡Todas las frases sospechosas han sido corregidas con éxito! 🎉', 'success');
    }
  }

  function downloadCorrectedDoc() {
    const text = dom.textArea.value || '';
    if (!text.trim()) {
      showToast('No hay texto para descargar', 'warning');
      return;
    }

    const docName = state.currentDoc && state.currentDoc.name ? state.currentDoc.name.replace(/\.[^/.]+$/, '') : 'documento';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docName}-corregido.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.SoundFX) window.SoundFX.playCopy();
    showToast('Documento corregido descargado ✓', 'success');
  }

  async function copyCorrectedDoc() {
    const text = dom.textArea.value || '';
    if (!text.trim()) {
      showToast('No hay texto para copiar', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      if (window.SoundFX) window.SoundFX.playCopy();
      showToast('¡Texto corregido copiado al portapapeles! ✓', 'success');
    } catch (e) {
      showToast('Presiona Ctrl+C para copiar', 'info');
    }
  }

  function animateCounter(element, start, end, duration = 850) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (end - start) * ease);
      element.textContent = `${currentVal}%`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  function animateGauge(targetScore) {
    const score = Math.max(0, Math.min(100, targetScore));

    let gradientId = 'gradHuman';
    let solidColor = '#10b981';
    let auraClass = 'human';

    if (score >= 60) {
      gradientId = 'gradAi';
      solidColor = '#ef4444';
      auraClass = 'ai';
    } else if (score >= 35) {
      gradientId = 'gradMixed';
      solidColor = '#f59e0b';
      auraClass = 'mixed';
    }

    dom.gaugeArc.setAttribute('stroke', `url(#${gradientId})`);
    dom.gaugeArc.setAttribute('stroke-dasharray', `${score} 100`);

    const rad = (score / 100) * Math.PI;
    const cx = (110 - 85 * Math.cos(rad)).toFixed(2);
    const cy = (110 - 85 * Math.sin(rad)).toFixed(2);

    if (dom.gaugeNeedleTip) {
      dom.gaugeNeedleTip.setAttribute('cx', cx);
      dom.gaugeNeedleTip.setAttribute('cy', cy);
      dom.gaugeNeedleTip.setAttribute('stroke', solidColor);
    }

    if (dom.gaugeAura) {
      dom.gaugeAura.className = `gauge-glow-aura ${auraClass}`;
    }

    animateCounter(dom.scoreValue, state.currentScore, score, 850);
    dom.scoreValue.style.color = solidColor;

    state.currentScore = score;
  }

  function runScannerSimulation(onComplete) {
    if (!dom.analysisScanner) {
      onComplete();
      return;
    }

    if (window.SoundFX) window.SoundFX.playScan();
    dom.analysisScanner.classList.remove('hide');
    const steps = [
      'Extrayendo n-gramas y tokens...',
      'Calculando perplejidad y burstiness secuencial...',
      'Analizando marcadores sintácticos de LLMs...',
      'Sintetizando veredicto estilométrico...'
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length && dom.scannerStatusText) {
        dom.scannerStatusText.textContent = steps[stepIdx];
      }
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      dom.analysisScanner.classList.add('hide');
      onComplete();
    }, 520);
  }

  async function handleFilesUpload(fileList) {
    const files = Array.from(fileList);
    if (!files.length) return;

    dom.btnAnalyze.disabled = true;
    dom.btnAnalyze.innerHTML = '<span class="spinner"></span> Analizando archivos...';

    state.documents = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      showToast(`Procesando (${i + 1}/${files.length}): ${file.name}...`, 'info');

      try {
        const parsed = await window.DocumentParser.parseDocument(file);
        if (parsed.text.length < 20) {
          state.documents.push({
            name: file.name,
            error: 'No se encontró texto suficiente (¿documento vacío o escaneo?).'
          });
          continue;
        }

        const analysis = window.TextAnalyzer.analyze(parsed.text, state.sensitivity);
        const docItem = buildDocumentItem(parsed.text, file.name, parsed.sections, parsed.metadata, parsed.flags, analysis, parsed.pdfDocument);
        state.documents.push(docItem);
      } catch (err) {
        console.error(err);
        state.documents.push({
          name: file.name,
          error: `Error al procesar: ${err.message || 'Formato no soportado'}`
        });
      }
    }

    dom.btnAnalyze.disabled = false;
    dom.btnAnalyze.innerHTML = '<span class="btn-bolt">⚡</span> Analizar texto';

    renderDocumentsList();

    const firstValid = state.documents.find(d => !d.error);
    if (firstValid) {
      loadDocumentIntoView(firstValid);
      showToast(`Se analizaron ${state.documents.length} documento(s)`, 'success');
    } else {
      showToast('Ningún archivo contenía texto editable.', 'warning');
    }
  }

  function buildDocumentItem(text, name, rawSections, metadata = [], customFlags = [], analysis = null, pdfDoc = null) {
    const r = analysis || window.TextAnalyzer.analyze(text, state.sensitivity);

    let sections = rawSections;
    if (!sections || !sections.length) {
      const words = text.split(/\s+/);
      sections = [];
      for (let i = 0; i < words.length; i += 250) {
        sections.push({
          l: `Bloque ${sections.length + 1}`,
          t: words.slice(i, i + 250).join(' ')
        });
      }
    }

    const sectionScores = sections.map(sec => {
      const wCount = (sec.t.match(/[\p{L}\p{N}]+/gu) || []).length;
      return {
        label: sec.l,
        score: wCount >= 25 ? window.TextAnalyzer.analyze(sec.t, state.sensitivity).score : null,
        words: wCount
      };
    });

    const flags = [...customFlags, ...(r.flags ? r.flags.map(f => f.desc) : [])];

    const validScores = sectionScores.filter(s => s.score !== null).map(s => s.score);
    if (validScores.length >= 3) {
      const m = validScores.reduce((a, b) => a + b, 0) / validScores.length;
      const sd = Math.sqrt(validScores.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / validScores.length);
      if (sd > 22) {
        flags.push(`Alta variabilidad estilística entre secciones (desviación: ${Math.round(sd)} pts): indicio de fragmentos intercalados de IA y redacción humana.`);
      }
    }

    return {
      name,
      text,
      analysis: r,
      sections: sectionScores,
      metadata,
      flags,
      pdfDocument: pdfDoc
    };
  }

  function analyzeCurrentText(sourceName = 'Texto pegado', withScannerAnimation = true) {
    const text = dom.textArea.value.trim();
    if (!text) return;

    dom.btnAnalyze.disabled = true;

    const performAnalysis = () => {
      const analysis = window.TextAnalyzer.analyze(text, state.sensitivity);
      const docItem = buildDocumentItem(text, sourceName, null, [], [], analysis, null);

      state.documents = [docItem];
      renderDocumentsList();
      loadDocumentIntoView(docItem);

      dom.btnAnalyze.disabled = false;
      showToast('Análisis completado', 'success');
    };

    if (withScannerAnimation) {
      runScannerSimulation(performAnalysis);
    } else {
      performAnalysis();
    }
  }

  function loadDocumentIntoView(doc) {
    state.currentDoc = doc;
    dom.textArea.value = doc.text;
    updateTextStats();

    renderDashboard(doc);
    dom.resultsSection.classList.remove('hide');

    dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderDocumentsList() {
    if (state.documents.length <= 1) {
      dom.filesSection.classList.add('hide');
      return;
    }

    dom.filesSection.classList.remove('hide');
    dom.filesList.innerHTML = state.documents.map((doc, idx) => {
      if (doc.error) {
        return `
          <div class="doc-card error">
            <div class="doc-info">
              <span class="doc-icon">${window.Icons ? window.Icons.get('alertTriangle', 'doc-svg-icon error-icon', 20) : '⚠️'}</span>
              <div style="flex:1; overflow:hidden;">
                <strong class="doc-name">${window.TextAnalyzer.escapeHtml(doc.name)}</strong>
                <small class="doc-meta text-danger">${window.TextAnalyzer.escapeHtml(doc.error)}</small>
              </div>
            </div>
            <button class="btn-remove-doc" data-remove="${idx}" title="Quitar archivo">&times;</button>
          </div>
        `;
      }

      const score = doc.analysis.score;
      const statusClass = score < 35 ? 'success' : score < 60 ? 'warning' : 'danger';
      const isCurrent = state.currentDoc === doc;
      const isSpreadsheet = /\.(xlsx|xls|csv|tsv|ods)$/i.test(doc.name);
      const iconSvg = window.Icons ? window.Icons.get(isSpreadsheet ? 'fileSpreadsheet' : 'fileText', 'doc-svg-icon', 20) : '📄';
      const sizeTag = doc.fileSizeFormatted ? `<span class="doc-size-badge">${doc.fileSizeFormatted}</span>` : '';

      return `
        <div class="doc-card ${isCurrent ? 'active' : ''}" data-idx="${idx}">
          <div class="doc-info">
            <span class="doc-icon">${iconSvg}</span>
            <div style="flex:1; overflow:hidden;">
              <strong class="doc-name" title="${window.TextAnalyzer.escapeHtml(doc.name)}">${window.TextAnalyzer.escapeHtml(doc.name)}</strong>
              <small class="doc-meta">${sizeTag} ${doc.analysis.words} palabras</small>
            </div>
          </div>
          <div class="doc-actions-right">
            <div class="doc-score-pill ${statusClass}">
              ${score}%
            </div>
            <button class="btn-remove-doc" data-remove="${idx}" title="Quitar de la lista">&times;</button>
          </div>
        </div>
      `;
    }).join('');

    dom.filesList.querySelectorAll('.btn-remove-doc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const removeIdx = parseInt(btn.getAttribute('data-remove'), 10);
        if (state.documents[removeIdx]) {
          const wasCurrent = state.documents[removeIdx] === state.currentDoc;
          state.documents.splice(removeIdx, 1);
          renderDocumentsList();
          if (wasCurrent) {
            const nextDoc = state.documents.find(d => !d.error);
            if (nextDoc) {
              loadDocumentIntoView(nextDoc);
            } else {
              dom.resultsSection.classList.add('hide');
              dom.filesSection.classList.add('hide');
            }
          }
          showToast('Documento quitado de la lista', 'info');
        }
      });
    });

    dom.filesList.querySelectorAll('.doc-card:not(.error)').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-idx'), 10);
        if (state.documents[idx]) {
          loadDocumentIntoView(state.documents[idx]);
          renderDocumentsList();
        }
      });
    });
  }

  function renderDashboard(doc) {
    const r = doc.analysis;
    const score = r.score;

    animateGauge(score);

    if (window.SoundFX) window.SoundFX.playResult(score);
    if (score < 35 && window.ParticleFX) {
      setTimeout(() => {
        window.ParticleFX.burstConfetti();
      }, 350);
    }

    dom.verdictBadge.textContent = r.verdict.label;
    dom.verdictBadge.className = `verdict-badge ${r.verdict.badgeClass} animated-pop`;
    dom.verdictMessage.textContent = r.verdict.message + (r.isShortText ? ' (⚠️ Advertencia: El texto es corto, con menos de 80 palabras la fiabilidad disminuye).' : '');

    dom.breakdownAi.textContent = `${score}%`;
    dom.breakdownHuman.textContent = `${r.humanScore}%`;

    if (r.editedScore >= 12) {
      dom.breakdownEditedRow.classList.remove('hide');
      dom.breakdownEdited.textContent = `${r.editedScore}%`;
    } else {
      dom.breakdownEditedRow.classList.add('hide');
    }

    dom.metricsGrid.innerHTML = r.out.map((m, idx) => {
      const badgeClass = m.s > 0.6 ? 'metric-badge danger' : m.s > 0.3 ? 'metric-badge warning' : 'metric-badge success';
      const pct = Math.max(5, Math.min(95, Math.round(m.s * 100)));
      const pinColor = m.s > 0.6 ? 'var(--color-danger)' : m.s > 0.3 ? 'var(--color-warning)' : 'var(--color-success)';

      return `
        <div class="metric-card" style="animation-delay: ${idx * 45}ms">
          <div class="metric-header">
            <span class="metric-title">${window.TextAnalyzer.escapeHtml(m.n)}</span>
            <span class="${badgeClass}">${window.TextAnalyzer.escapeHtml(m.v)}</span>
          </div>
          <div class="metric-spectrum-bar" title="Nivel de sospecha estilométrica: ${pct}%">
            <div class="metric-spectrum-track">
              <div class="metric-spectrum-pin" style="left: ${pct}%; background-color: ${pinColor}"></div>
            </div>
            <div class="metric-spectrum-labels">
              <span>Natural</span>
              <span>IA</span>
            </div>
          </div>
          <p class="metric-desc">${window.TextAnalyzer.escapeHtml(m.d)}</p>
        </div>
      `;
    }).join('');

    renderSectionMap(doc.sections);
    renderForensics(doc);
    updatePreviewTabs();
    renderPreview();
  }

  function renderSectionMap(sections) {
    if (!sections || !sections.length) {
      dom.sectionMap.innerHTML = '<p class="note">No hay suficientes secciones para mapear.</p>';
      return;
    }

    dom.sectionMap.innerHTML = sections.map((s, idx) => {
      const score = s.score;
      const isNull = score === null;
      const color = isNull ? 'var(--border-color)' : score < 35 ? 'var(--color-success)' : score < 60 ? 'var(--color-warning)' : 'var(--color-danger)';
      const width = isNull ? 0 : score;

      return `
        <div class="section-row" style="animation-delay: ${idx * 30}ms">
          <span class="section-label">${window.TextAnalyzer.escapeHtml(s.label)}</span>
          <div class="section-meter">
            <div class="section-meter-fill" style="width: ${width}%; background-color: ${color}"></div>
          </div>
          <span class="section-val" style="color: ${color}">${isNull ? '—' : `${score}%`}</span>
        </div>
      `;
    }).join('');
  }

  function renderForensics(doc) {
    const metaList = doc.metadata || [];
    const flagsList = doc.flags || [];

    if (!metaList.length && !flagsList.length) {
      dom.forensicSection.classList.add('hide');
      return;
    }

    dom.forensicSection.classList.remove('hide');

    if (metaList.length) {
      dom.forensicMeta.innerHTML = `
        <div class="metadata-grid">
          ${metaList.map(([key, val]) => `
            <div class="meta-item">
              <span class="meta-key">${window.TextAnalyzer.escapeHtml(key)}</span>
              <span class="meta-value">${window.TextAnalyzer.escapeHtml(val)}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      dom.forensicMeta.innerHTML = '<p class="note">Este tipo de documento no contiene metadatos de aplicación.</p>';
    }

    if (flagsList.length) {
      dom.forensicFlags.innerHTML = flagsList.map(flag => `
        <div class="alert-flag">
          <span class="flag-icon">⚠️</span>
          <span class="flag-text">${window.TextAnalyzer.escapeHtml(flag)}</span>
        </div>
      `).join('');
    } else {
      dom.forensicFlags.innerHTML = '<p class="note text-success">✓ No se encontraron anomalías forenses adicionales.</p>';
    }
  }

  function updatePreviewTabs() {
    const hasPdf = state.currentDoc && state.currentDoc.pdfDocument;
    dom.previewTabs.style.display = hasPdf ? 'flex' : 'none';

    if (dom.tabHeatmapView) {
      dom.tabHeatmapView.className = state.activeTab === 'heatmap' ? 'tab-btn active' : 'tab-btn';
    }
    if (dom.tabDocView) {
      dom.tabDocView.className = state.activeTab === 'pdf' ? 'tab-btn active' : 'tab-btn';
    }
  }

  async function renderPreview() {
    const doc = state.currentDoc;
    if (!doc) return;

    const token = ++state.pvToken;
    const box = dom.previewBox;

    if (!doc.pdfDocument || state.activeTab === 'heatmap') {
      dom.previewNote.innerHTML = `
        <div class="heatmap-legend">
          <span><span class="legend-dot hl-ai"></span> Frase de alta probabilidad IA (≥48%)</span>
          <span><span class="legend-dot hl-mixed"></span> Frase dudosa/mixta (≥35%)</span>
          <span><b>Subrayado</b>: Muletilla detectada</span>
          <span class="legend-hint">💡 Toca o haz clic en cualquier frase resaltada para corregirla.</span>
        </div>
      `;

      const filter = state.activeFilter;
      const htmlContent = doc.analysis.lines.map(lineGroup => {
        return lineGroup.map(item => {
          const rawText = item.t;
          if (!rawText.trim()) return rawText;

          const p = item.p;
          const probPercent = Math.round(p * 100);
          let escaped = window.TextAnalyzer.escapeHtml(rawText);

          window.TextAnalyzer.PHRASES.forEach(phrase => {
            if (rawText.toLowerCase().includes(phrase)) {
              const regex = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
              escaped = escaped.replace(regex, '<b class="stock-phrase">$1</b>');
            }
          });

          if (filter === 'ai' && p < 0.48) return escaped;
          if (filter === 'phrases' && !escaped.includes('stock-phrase')) return escaped;

          let hlClass = '';
          if (p >= 0.48) hlClass = 'hl-ai';
          else if (p >= 0.35) hlClass = 'hl-mixed';

          if (hlClass) {
            const reasonsAttr = window.TextAnalyzer.escapeHtml(JSON.stringify(item.reasons || []));
            const rawAttr = window.TextAnalyzer.escapeHtml(rawText);
            return `<span class="sentence-highlight ${hlClass}" data-prob="${probPercent}" data-reasons="${reasonsAttr}" data-raw="${rawAttr}" title="Haz clic o toca para corregir en el documento">${escaped}</span>`;
          }
          return escaped;
        }).join('');
      }).join('\n');

      box.innerHTML = `<div class="paper-preview">${htmlContent}</div>`;
      setupSentenceNavigation();
      return;
    }

    dom.previewNote.innerHTML = '<p class="note">Páginas originales del documento con resaltado forense superpuesto.</p>';
    box.innerHTML = '<div class="pdf-loading"><span class="spinner"></span> Renderizando páginas PDF...</div>';

    const pdf = doc.pdfDocument;
    const maxPages = Math.min(pdf.numPages, 10);

    const flaggedSentences = doc.analysis.lines.flat()
      .filter(o => o.p >= 0.35)
      .map(o => ({
        text: o.t.replace(/\s+/g, ' ').trim(),
        isAi: o.p >= 0.48,
        prob: Math.round(o.p * 100)
      }));

    box.innerHTML = '';

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      if (token !== state.pvToken) return;

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.3 });

      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page-wrapper';

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      pageWrapper.appendChild(canvas);

      const secScore = doc.sections[pageNum - 1];
      if (secScore && secScore.score !== null) {
        const badge = document.createElement('div');
        const sc = secScore.score;
        badge.className = `pdf-page-badge ${sc < 35 ? 'success' : sc < 60 ? 'warning' : 'danger'}`;
        badge.textContent = `Pág. ${pageNum} · ${sc}% IA`;
        pageWrapper.appendChild(badge);
      }

      box.appendChild(pageWrapper);

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const textContent = await page.getTextContent();
      textContent.items.forEach(item => {
        const str = item.str.replace(/\s+/g, ' ').trim();
        if (str.length < 8) return;

        const matched = flaggedSentences.find(s => s.text.includes(str));
        if (matched) {
          const transform = window.pdfjsLib.Util.transform(viewport.transform, item.transform);
          const height = Math.hypot(transform[2], transform[3]);
          ctx.fillStyle = matched.isAi ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.32)';
          ctx.fillRect(transform[4], transform[5] - height * 0.9, item.width * viewport.scale, height * 1.15);
        }
      });
    }

    if (pdf.numPages > maxPages) {
      const extraNotice = document.createElement('p');
      extraNotice.className = 'note text-center';
      extraNotice.textContent = `(Mostrando las primeras ${maxPages} de ${pdf.numPages} páginas; el informe cubre la totalidad del documento).`;
      box.appendChild(extraNotice);
    }
  }

  function handleHumanize() {
    const text = dom.textArea.value.trim();
    if (!text) {
      showToast('No hay texto para humanizar', 'warning');
      return;
    }

    const result = window.Humanizer.humanize(text);
    const beforeAnalysis = window.TextAnalyzer.analyze(text, state.sensitivity);
    const afterAnalysis = window.TextAnalyzer.analyze(result.text, state.sensitivity);

    dom.humanizeOutput.value = result.text;
    dom.humanizeSection.classList.remove('hide');
    if (window.SoundFX) window.SoundFX.playMagic();

    dom.humanizeMsg.innerHTML = `
      <strong>Puntuación de IA:</strong> <span class="text-danger">${beforeAnalysis.score}%</span> ➔ <span class="text-success">${afterAnalysis.score}%</span> 
      · Se sustituyeron <strong>${result.stats.replacements}</strong> muletillas y se aligeraron <strong>${result.stats.sentencesSplit}</strong> oraciones.
    `;

    dom.humanizeSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function exportJsonReport() {
    if (!state.currentDoc) return;
    const doc = state.currentDoc;
    const data = {
      nombreDocumento: doc.name,
      fechaAnalisis: new Date().toISOString(),
      calibracion: state.sensitivity,
      puntuacionGlobalIa: `${doc.analysis.score}%`,
      puntuacionHumana: `${doc.analysis.humanScore}%`,
      veredicto: doc.analysis.verdict,
      palabras: doc.analysis.words,
      caracteres: doc.analysis.characters,
      metricasDetalladas: doc.analysis.out.map(m => ({ metrica: m.n, valor: m.v, descripcion: m.d })),
      alertasForenses: doc.flags,
      metadatosDocumento: doc.metadata
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ia-${doc.name.replace(/\.[^/.]+$/, '')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Informe JSON descargado ✓', 'success');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
