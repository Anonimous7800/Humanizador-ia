

(function (window) {
  'use strict';

  const PHRASES = [
    
    "en conclusión", "en resumen", "en definitiva", "a modo de resumen", "en resumidas cuentas",
    "a fin de cuentas", "en última instancia", "por lo tanto", "por consiguiente", "asimismo",
    "en este sentido", "en este contexto", "sin lugar a dudas", "es indudable que",
    "no solo", "sino también", "no solo eso sino que", "por otro lado", "por su parte",

    "cabe destacar", "cabe señalar", "cabe mencionar", "es importante destacar", "es importante señalar",
    "es importante mencionar", "es crucial destacar", "es fundamental entender", "es menester señalar",
    "juega un papel crucial", "juega un papel fundamental", "juega un papel clave",
    "desempeña un papel crucial", "desempeña un papel fundamental", "desempeña un rol primordial",
    "de vital importancia", "un punto de inflexión", "la piedra angular", "un papel preponderante",
    "es imperativo", "cobra especial relevancia", "un elemento indispensable",

    "en el mundo actual", "en la era digital", "en el panorama actual", "en un mundo cada vez más",
    "en constante evolución", "a la vanguardia de", "un testimonio de", "un testimonio viviente",
    "un abanico de", "un amplio abanico", "una amplia gama", "un sinfín de", "una plétora de",
    "multifacético", "un enfoque holístico", "un marco integral", "dar rienda suelta",
    "adentrarse en", "un tapiz de", "desentrañar los misterios", "fomentar una cultura",
    "navegar por el complejo", "navegar por los desafíos", "potenciar al máximo",

    "como modelo de lenguaje", "como inteligencia artificial", "como ia", "como ia desarrollada por",
    "espero que esto ayude", "espero que esta información", "no dudes en preguntar",
    "no dudes en consultar", "si tienes alguna otra duda", "estoy aquí para ayudarte",
    "a continuación se detalla", "en el presente documento", "a grandes rasgos",

    "in conclusion", "in summary", "to summarize", "in essence", "ultimately", "furthermore",
    "moreover", "additionally", "consequently", "on the other hand", "it goes without saying",
    "it is worth noting", "it is important to note", "it should be noted", "it is essential to remember",

    "delve into", "delve deeper", "rich tapestry", "tapestry of", "evolving landscape",
    "in today's fast-paced world", "in today's digital era", "plays a crucial role",
    "plays a pivotal role", "a testament to", "beacon of", "seamlessly integrate",
    "navigate the complexities", "at the forefront of", "shed light on", "underscore the importance",
    "holistic approach", "myriad of", "plethora of", "game-changer", "vital cornerstone",
    "ever-evolving", "foster collaboration", "unlock the potential", "in the realm of",

    "as an ai language model", "as an ai", "i hope this helps", "feel free to reach out",
    "let me know if you need"
  ];

  const MARKERS = [
    /\*\*[^*]+\*\*/g,          
    /^#{1,4}\s/gm,             
    /^\s*[-•*]\s/gm,           
    /—/g,                      
    /^\s*\d+\.\s/gm            
  ];

  const STARTERS = [
    "además", "asimismo", "por lo tanto", "sin embargo", "por otro lado",
    "en conclusión", "en resumen", "por ende", "finalmente", "en primer lugar",
    "en segundo lugar", "por último", "no obstante", "en este sentido", "adicionalmente",
    "por consiguiente", "de este modo", "en consecuencia",
    "furthermore", "moreover", "additionally", "however", "in conclusion",
    "consequently", "overall", "firstly", "secondly", "lastly", "importantly"
  ];

  const PERSONAL = /\b(yo|me|mi|mis|conmigo|nosotros|nos|nuestro|nuestra|creo|pienso|opino|siento|sospecho|me parece|a mi juicio|jaja|jajaja|jeje|xd|pues|bueno|oye|mira|fíjate|chicos|amigos|total que|la verdad|en fin|qué va|i|my|me|myself|we|our|us|lol|lmao|honestly|imo|imho|tbh|frankly|yep|nope)\b/gi;

  const ZW_CHARS = /[\u200b\u200c\u200d\u2060\ufeff\u202f\u00ad]/g;

  const VAGUE_WORDS = /\b(diversos|diferentes|varios|importante|significativo|clave|esencial|relevante|numerosos|fundamental|notable|vital|crucial|óptimo|integral|estratégico|multifacético|various|significant|essential|key|important|numerous|pivotal|crucial|vital|optimal|strategic)\b/gi;

  const PARALLEL_STRUCTURES = [
    /\bno solo\b.*?\bsino (?:también|que además)\b/i,
    /\bpor un lado\b.*?\bpor (?:otro|otra parte)\b/i,
    /\ben primer lugar\b.*?\ben segundo lugar\b/i,
    /\bcon el fin de\b.*?\by así\b/i,
    /\bnot only\b.*?\bbut also\b/i,
    /\bon (?:the )?one hand\b.*?\bon the other hand\b/i
  ];

  const mean = arr => (arr.length ? arr.reduce((acc, val) => acc + val, 0) / arr.length : 0);
  const sd = arr => {
    if (arr.length <= 1) return 0;
    const m = mean(arr);
    return Math.sqrt(mean(arr.map(x => Math.pow(x - m, 2))));
  };
  const clamp = (val, min = 0, max = 1) => Math.max(min, Math.min(max, val));

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  function analyzeSentence(sentence, meanSentenceLength) {
    const clean = sentence.trim();
    const lower = clean.toLowerCase();
    const words = clean.match(/[\p{L}\p{N}’']+/gu) || [];
    const wordCount = words.length;

    if (wordCount < 3) {
      return { prob: 0.08, reasons: [], matchedPhrases: [] };
    }

    let prob = 0.16;
    const reasons = [];
    const matchedPhrases = [];

    PHRASES.forEach(phrase => {
      if (lower.includes(phrase)) {
        matchedPhrases.push(phrase);
      }
    });

    if (matchedPhrases.length > 0) {
      const boost = Math.min(0.48, matchedPhrases.length * 0.28);
      prob += boost;
      reasons.push(`Muletilla típica: "${matchedPhrases.slice(0, 2).join('", "')}"`);
    }

    const matchedStarter = STARTERS.find(st => lower.startsWith(st));
    if (matchedStarter) {
      prob += 0.15;
      reasons.push(`Apertura formal con conector ("${matchedStarter}")`);
    }

    const hasParallel = PARALLEL_STRUCTURES.some(regex => regex.test(clean));
    if (hasParallel) {
      prob += 0.18;
      reasons.push('Estructura sintáctica paralela balanceada');
    }

    if (/\*\*|^\s*#|—/.test(sentence)) {
      prob += 0.14;
      reasons.push('Huellas de formato chatbot (Markdown/rayas)');
    }

    if (wordCount >= 10 && meanSentenceLength > 0) {
      const diffRatio = Math.abs(wordCount - meanSentenceLength) / meanSentenceLength;
      if (diffRatio < 0.22) {
        prob += 0.12;
        reasons.push('Longitud uniforme en el rango promedio');
      }
    }

    const abstractMatches = lower.match(/\p{L}*(?:ción|ciones|idad|idades|mente|ismo|ismos|ización|miento|tion|tions|ity|ities|ness|ment)(?!\p{L})/gu) || [];
    const abstractRatio = abstractMatches.length / wordCount;
    if (abstractRatio > 0.18) {
      prob += Math.min(0.20, abstractRatio * 1.2);
      reasons.push('Alta concentración de sustantivos abstractos formales');
    }

    const vagueMatches = (lower.match(VAGUE_WORDS) || []).length;
    if (vagueMatches > 0) {
      prob += Math.min(0.18, (vagueMatches / wordCount) * 1.4);
      reasons.push('Presencia de adjetivos comodín típicos');
    }

    const personalMatches = (sentence.match(PERSONAL) || []).length;
    if (personalMatches > 0) {
      prob -= Math.min(0.38, personalMatches * 0.18);
    }

    if (/[?!¿¡]/.test(sentence) || wordCount < 6) {
      prob -= 0.14;
    }

    const finalProb = clamp(prob, 0.02, 0.98);
    return {
      prob: finalProb,
      reasons,
      matchedPhrases
    };
  }

  function analyzeText(rawText, sensitivity = 'balanced') {
    const text = (rawText || '').trim();
    if (!text) {
      return {
        score: 0,
        humanScore: 100,
        editedScore: 0,
        words: 0,
        characters: 0,
        readingTime: 0,
        out: [],
        lines: [],
        hits: [],
        flags: [],
        share: 0,
        verdict: { label: 'Sin texto', status: 'neutral', message: 'Ingresa un texto para analizar.' }
      };
    }

    const words = text.toLowerCase().match(/[\p{L}\p{N}’']+/gu) || [];
    const wordCount = words.length;
    const charCount = text.length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    const rawSentences = text.split(/(?<=[.!?…])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 0);
    const validSentences = rawSentences.filter(s => (s.match(/[\p{L}\p{N}]+/gu) || []).length > 2);
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const lower = text.toLowerCase();

    const codeTokens = (text.match(/\b(function|const|let|var|def|class|import|from|return|if|else|for|while|SELECT|FROM|WHERE|INSERT|UPDATE|public|private|void)\b|[{};=><]/g) || []).length;
    const isCode = codeTokens > 12 && (codeTokens / Math.max(1, wordCount)) > 0.16;
    const pipeCount = (text.match(/\|/g) || []).length;
    const isTabular = pipeCount > 8;

    let contentType = 'prosa';
    if (isCode) contentType = 'codigo';
    else if (isTabular) contentType = 'tabular';

    const metrics = [];

    const sentenceLengths = validSentences.map(s => (s.match(/[\p{L}\p{N}]+/gu) || []).length);
    const meanSentenceLen = mean(sentenceLengths);
    const cvSentence = sentenceLengths.length > 2 ? (sd(sentenceLengths) / (meanSentenceLen || 1)) : 0.65;
    const scoreBurstiness = clamp((0.68 - cvSentence) / 0.44);
    metrics.push({
      id: 'burstiness',
      n: 'Variación de frases (Burstiness)',
      v: cvSentence.toFixed(2),
      s: scoreBurstiness,
      d: 'Los humanos alternan constantemente frases breves con oraciones extensas. La IA tiende a una longitud monótona.'
    });

    let deltas = [];
    for (let i = 1; i < sentenceLengths.length; i++) {
      deltas.push(Math.abs(sentenceLengths[i] - sentenceLengths[i - 1]));
    }
    const meanDelta = mean(deltas);
    const deltaRatio = meanSentenceLen > 0 ? (meanDelta / meanSentenceLen) : 0.5;
    
    const scoreDelta = clamp((0.50 - deltaRatio) / 0.35);
    metrics.push({
      id: 'sequential_delta',
      n: 'Alternancia rítmica secuencial',
      v: `${meanDelta.toFixed(1)} palabras`,
      s: scoreDelta,
      d: 'Diferencia de longitud entre oraciones consecutivas. Valores bajos reflejan transiciones uniformes de chatbot.'
    });

    let ttr = 0.75;
    if (words.length >= 40) {
      const windowSize = Math.min(50, words.length);
      const scores = [];
      const step = Math.max(5, Math.floor(windowSize / 4));
      for (let i = 0; i + windowSize <= words.length; i += step) {
        const slice = words.slice(i, i + windowSize);
        scores.push(new Set(slice).size / windowSize);
      }
      ttr = scores.length ? mean(scores) : (new Set(words).size / words.length);
    } else if (words.length > 0) {
      ttr = new Set(words).size / words.length;
    }
    const scoreLexical = clamp((0.76 - ttr) / 0.22);
    metrics.push({
      id: 'lexical',
      n: 'Diversidad léxica (MATTR)',
      v: ttr.toFixed(2),
      s: scoreLexical,
      d: 'Riqueza de vocabulario único por ventana de 50 palabras. La IA suele recurrir a un subconjunto de tokens estándar.'
    });

    const trigrams = {};
    let trigramReps = 0;
    for (let i = 0; i < words.length - 2; i++) {
      const tg = words.slice(i, i + 3).join(' ');
      trigrams[tg] = (trigrams[tg] || 0) + 1;
    }
    Object.values(trigrams).forEach(count => {
      if (count > 1) trigramReps += (count - 1);
    });
    const trigramRatio = trigramReps / Math.max(1, words.length - 2);
    const scoreTrigrams = clamp(trigramRatio / 0.07);
    metrics.push({
      id: 'trigrams',
      n: 'Repetición de patrones (Trigramas)',
      v: (trigramRatio * 100).toFixed(1) + '%',
      s: scoreTrigrams,
      d: 'Secuencias de 3 palabras que se repiten estructuralmente a lo largo del texto.'
    });

    const hits = [];
    PHRASES.forEach(phrase => {
      let idx = -1;
      while ((idx = lower.indexOf(phrase, idx + 1)) !== -1) {
        hits.push({
          phrase: phrase,
          start: idx,
          end: idx + phrase.length
        });
      }
    });
    const phrasesPer100 = (hits.length / Math.max(1, words.length)) * 100;
    const scorePhrases = clamp(phrasesPer100 / 2.2);
    metrics.push({
      id: 'phrases',
      n: 'Muletillas típicas de IA',
      v: `${hits.length} hallazgo(s) (${phrasesPer100.toFixed(1)}/100 pal.)`,
      s: scorePhrases,
      d: 'Expresiones arquetípicas como "en conclusión", "cabe destacar", "desempeña un papel fundamental", "delve"...'
    });

    const starterMatches = validSentences.filter(s => STARTERS.some(x => s.toLowerCase().startsWith(x))).length;
    const starterRatio = starterMatches / Math.max(1, validSentences.length);
    const scoreStarters = clamp(starterRatio / 0.22);
    metrics.push({
      id: 'starters',
      n: 'Conectores formales de apertura',
      v: `${starterMatches} de ${validSentences.length} (${Math.round(starterRatio * 100)}%)`,
      s: scoreStarters,
      d: 'Tendencia mecánica de los LLM a abrir oraciones con conectores lógicos de enlace.'
    });

    let scoreParagraphs = 0.25;
    let paraDisplay = 'n/d';
    if (paragraphs.length >= 3) {
      const paraLengths = paragraphs.map(p => (p.match(/[\p{L}\p{N}]+/gu) || []).length);
      const cvPara = sd(paraLengths) / (mean(paraLengths) || 1);
      paraDisplay = cvPara.toFixed(2);
      scoreParagraphs = clamp((0.55 - cvPara) / 0.38);
    }
    metrics.push({
      id: 'paragraphs',
      n: 'Uniformidad de párrafos',
      v: paraDisplay,
      s: scoreParagraphs,
      d: 'Párrafos de longitud prácticamente idéntica denotan generación estructurada por bloques.'
    });

    let markerCount = 0;
    MARKERS.forEach(regex => {
      const m = text.match(regex);
      if (m) markerCount += m.length;
    });
    const scoreMarkers = clamp(markerCount / Math.max(3, validSentences.length * 0.32));
    metrics.push({
      id: 'markers',
      n: 'Marcas de formato Chatbot',
      v: `${markerCount} marca(s)`,
      s: scoreMarkers,
      d: 'Presencia de negritas (**), títulos Markdown (#), viñetas continuas o rayas em-dash (—).'
    });

    const personalCount = (text.match(PERSONAL) || []).length;
    const scorePersonal = clamp(personalCount / Math.max(1, words.length) / 0.024);
    metrics.push({
      id: 'personal',
      n: 'Rasgos humanos y coloquiales',
      v: `${personalCount} expresión(es)`,
      s: -scorePersonal,
      d: 'Primera persona singular, opiniones subjetivas o giros espontáneos (restan sospecha de IA).'
    });

    const punctuationTypes = new Set(text.match(/[;:()?!"“”¿¡…\-—]/g) || []).size;
    const scorePunctuation = clamp((5 - punctuationTypes) / 5);
    metrics.push({
      id: 'punctuation',
      n: 'Riqueza de signos de puntuación',
      v: `${punctuationTypes} tipo(s)`,
      s: scorePunctuation,
      d: 'La IA suele usar solo puntos y comas, prescindiendo de signos expresivos (; : ¿ ? ¡ ! …).'
    });

    const vagueCount = (text.match(VAGUE_WORDS) || []).length;
    const scoreVague = clamp(vagueCount / Math.max(1, wordCount) / 0.022);
    metrics.push({
      id: 'vague',
      n: 'Adjetivos comodín y relleno',
      v: `${vagueCount} término(s)`,
      s: scoreVague,
      d: 'Términos genéricos favorecidos por modelos de lenguaje ("clave", "crucial", "fundamental", "diversos").'
    });

    let flaggedWords = 0;
    let totalAnalyzedWords = 0;

    const lines = text.split('\n').map(line => {
      const sentenceParts = line.match(/[^.!?…]+[.!?…]*|\n/g) || [line];
      return sentenceParts.map(part => {
        const pWords = (part.match(/[\p{L}\p{N}]+/gu) || []).length;
        if (pWords === 0) return { t: part, p: 0, words: 0, reasons: [] };

        totalAnalyzedWords += pWords;
        const analysis = analyzeSentence(part, meanSentenceLen);

        if (analysis.prob >= 0.48) {
          flaggedWords += pWords;
        }

        return {
          t: part,
          p: analysis.prob,
          words: pWords,
          reasons: analysis.reasons,
          matchedPhrases: analysis.matchedPhrases
        };
      });
    });

    const aiShare = flaggedWords / Math.max(1, totalAnalyzedWords);

    const weights = [0.18, 0.12, 0.14, 0.08, 0.20, 0.08, 0.06, 0.08, 0.03, 0.03];
    let compositeScore = 0;
    for (let i = 0; i < 8; i++) {
      compositeScore += metrics[i].s * weights[i];
    }
    
    compositeScore += metrics[8].s * 0.16;
    
    compositeScore += (metrics[9].s * 0.03) + (metrics[10].s * 0.03);

    let rawScore = (compositeScore * 0.45 + aiShare * 0.45 + (scorePhrases * 0.10)) * 100;

    if (sensitivity === 'strict') {
      rawScore = rawScore * 1.15;
    } else if (sensitivity === 'lenient') {
      rawScore = rawScore * 0.85;
    }

    if (wordCount < 80) {
      rawScore *= Math.max(0.45, wordCount / 80);
    }

    const finalScore = Math.round(clamp(rawScore, 0, 100));
    const humanScore = 100 - finalScore;

    const burstScore = metrics[0].s;
    const phraseScore = metrics[4].s;
    const paraScore = metrics[6].s;
    let editedScore = Math.round(100 * clamp(((burstScore + paraScore) / 2) - phraseScore));
    if (aiShare >= 0.70 || finalScore < 25) {
      editedScore = 0;
    }

    let verdict;
    if (finalScore < 30) {
      verdict = {
        label: 'Probablemente Humano',
        status: 'human',
        badgeClass: 'badge-success',
        color: '#10b981',
        message: 'El texto presenta una variabilidad rítmica natural, riqueza sintáctica espontánea y carece de las muletillas habituales de los modelos de IA.'
      };
    } else if (finalScore < 60) {
      verdict = {
        label: 'Resultado Mixto / Parcialmente Editado',
        status: 'mixed',
        badgeClass: 'badge-warning',
        color: '#f59e0b',
        message: 'Se aprecian señales híbridas: puede tratarse de una redacción humana de estilo muy formal/académico, o de un texto generado por IA que fue posteriormente modificado.'
      };
    } else {
      verdict = {
        label: 'Alta Probabilidad de IA',
        status: 'ai',
        badgeClass: 'badge-danger',
        color: '#ef4444',
        message: 'Se detecta una marcada uniformidad de patrones sintácticos, frases predecibles y estructuras características de modelos automáticos de lenguaje.'
      };
    }

    const zwMatches = text.match(ZW_CHARS) || [];
    const flags = [];
    if (contentType === 'codigo') {
      flags.push({
        type: 'content-type-code',
        title: 'Estructura de código detectada',
        desc: 'El texto contiene fragmentos de programación o marcado técnico. Se calibró el algoritmo para ponderar el léxico en lugar de la sintaxis estricta.'
      });
    }

    if (zwMatches.length >= 2) {
      flags.push({
        type: 'invisible-chars',
        title: 'Caracteres invisibles detectados',
        desc: `Se encontraron ${zwMatches.length} caracteres especiales de ancho cero (Zero-Width). Suelen quedar tras copiar de ciertos chatbots o marcas de agua.`
      });
    }

    return {
      score: finalScore,
      humanScore,
      editedScore,
      share: aiShare,
      words: wordCount,
      characters: charCount,
      readingTime,
      contentType,
      confidence: wordCount >= 90 ? 'Alta' : wordCount >= 45 ? 'Media' : 'Baja',
      out: metrics,
      lines,
      hits,
      flags,
      verdict,
      isShortText: wordCount < 80
    };
  }

  window.TextAnalyzer = {
    analyze: analyzeText,
    analyzeSentence,
    escapeHtml,
    PHRASES,
    STARTERS,
    MARKERS
  };

})(window);
