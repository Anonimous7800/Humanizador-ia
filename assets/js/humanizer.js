(function (window) {
  'use strict';

  const REPLACEMENTS = [
    [/\ben conclusión,?\s*/gi, 'Al final, '],
    [/\ben resumen,?\s*/gi, 'En resumen, '],
    [/\ben definitiva,?\s*/gi, 'En el fondo, '],
    [/\ba modo de resumen,?\s*/gi, 'Para sintetizar, '],
    [/\ben resumidas cuentas,?\s*/gi, 'En suma, '],
    [/\ba fin de cuentas,?\s*/gi, 'A la larga, '],

    [/\bcabe (?:destacar|señalar|mencionar) que\s*/gi, ''],
    [/\bes importante (?:destacar|señalar|mencionar) que\s*/gi, ''],
    [/\bes crucial (?:destacar|señalar|tener en cuenta) que\s*/gi, ''],
    [/\bes fundamental entender que\s*/gi, 'Conviene ver que '],
    [/\bde vital importancia\b/gi, 'muy importante'],
    [/\b(?:juega|desempeña) un papel (?:crucial|fundamental|clave)\b/gi, 'es determinante'],
    [/\bdesempeña un rol importante\b/gi, 'influye mucho'],

    [/\ben el mundo actual\b/gi, 'hoy en día'],
    [/\ben la era digital\b/gi, 'actualmente'],
    [/\ben el panorama actual\b/gi, 'en la actualidad'],
    [/\ben un mundo cada vez más\s+(\w+)/gi, 'en un entorno muy $1'],

    [/\bun abanico de\b/gi, 'variedad de'],
    [/\buna amplia gama de\b/gi, 'muchos'],
    [/\bun sinfín de\b/gi, 'numerosos'],
    [/\bsin lugar a dudas\b/gi, 'seguramente'],
    [/\bmultifacético\b/gi, 'complejo'],
    [/\bfomentar\b/gi, 'impulsar'],
    [/\bpotenciar\b/gi, 'mejorar'],
    [/\badentrarse en\b/gi, 'explorar'],
    [/\bun testimonio de\b/gi, 'una muestra de'],
    [/\bun punto de inflexión\b/gi, 'un giro importante'],

    [/\bademás,\s*/gi, 'Asimismo, '],
    [/\basimismo,\s*/gi, 'También '],
    [/\bpor lo tanto,?\s*/gi, 'Así que '],
    [/\bpor ende,?\s*/gi, 'Por eso, '],
    [/\bpor otro lado,\s*/gi, 'Por su parte, '],
    [/\ben última instancia,?\s*/gi, 'Al final de cuentas, '],

    [/\bin conclusion,?\s*/gi, 'In the end, '],
    [/\bto summarize,?\s*/gi, 'To sum up, '],
    [/\bfurthermore,\s*/gi, 'Also, '],
    [/\bmoreover,\s*/gi, 'Besides, '],
    [/\badditionally,\s*/gi, 'In addition, '],
    [/\bit is worth noting that\s*/gi, ''],
    [/\bit is important to note that\s*/gi, ''],
    [/\bdelve into\b/gi, 'explore'],
    [/\bdelve deeper\b/gi, 'look closer'],
    [/\brich tapestry\b/gi, 'diverse blend'],
    [/\btapestry of\b/gi, 'mix of'],
    [/\bevolving landscape\b/gi, 'changing environment'],
    [/\bleverage\b/gi, 'use'],
    [/\bseamlessly\b/gi, 'smoothly'],
    [/\ba testament to\b/gi, 'proof of'],
    [/\bplays a (?:crucial|pivotal) role\b/gi, 'matters deeply']
  ];

  function humanize(text) {
    if (!text || typeof text !== 'string') return { text: '', stats: { replacements: 0, sentencesSplit: 0 } };

    let s = text;
    let replacementsCount = 0;
    let splitCount = 0;

    s = s.replace(/\*\*(.+?)\*\*/g, '$1');
    s = s.replace(/^\s*#{1,4}\s+/gm, '');
    s = s.replace(/^\s*[-•*]\s+/gm, '');
    s = s.replace(/\s*—\s*/g, ', ');

    REPLACEMENTS.forEach(([regex, replacement]) => {
      const match = s.match(regex);
      if (match) {
        replacementsCount += match.length;
        s = s.replace(regex, replacement);
      }
    });

    s = s.replace(/(^|[.!?…]\s+|\n)([a-záéíóúñ])/gu, (m, prefix, char) => prefix + char.toUpperCase());

    const lines = s.split('\n');
    s = lines.map(line => {
      return line.replace(/[^.!?…]+[.!?…]*/gu, sentence => {
        const words = sentence.trim().split(/\s+/);
        if (words.length <= 25) return sentence;

        const contrastMatch = sentence.match(/^(.{45,}?),\s+(pero|aunque|sin embargo|mas|but|although)\s+(.*)$/su);
        if (contrastMatch) {
          splitCount++;
          const part1 = contrastMatch[1].trim();
          const conj = contrastMatch[2].toLowerCase();
          const part2 = contrastMatch[3].trim();
          const capConj = conj.charAt(0).toUpperCase() + conj.slice(1);
          return `${part1}. ${capConj} ${part2}`;
        }
        return sentence;
      });
    }).join('\n');

    s = s.replace(/[ \t]{2,}/g, ' ')
         .replace(/ ,/g, ',')
         .replace(/ \./g, '.')
         .trim();

    return {
      text: s,
      stats: {
        replacements: replacementsCount,
        sentencesSplit: splitCount
      }
    };
  }

  function suggestFix(sentence) {
    if (!sentence || typeof sentence !== 'string') return '';
    const res = humanize(sentence);
    return res.text || sentence;
  }

  window.Humanizer = {
    humanize,
    suggestFix,
    REPLACEMENTS
  };

})(window);
