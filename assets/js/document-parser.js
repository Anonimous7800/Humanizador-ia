

(function (window) {
  'use strict';

  const AI_TOOL_KEYWORDS = /chatgpt|openai|claude|anthropic|gemini|copilot|jasper|writesonic|quillbot|notion\s*ai|perplexity|deepseek|reportlab|weasyprint|midjourney/i;
  const ZW_REGEX = /[\u200b\u200c\u200d\u2060\ufeff\u202f\u00ad]/g;

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function decodeEntities(str) {
    if (!str) return '';
    return str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&#(\d+);/g, (_, dec) => {
        try {
          return String.fromCodePoint(parseInt(dec, 10));
        } catch (e) {
          return '';
        }
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        try {
          return String.fromCodePoint(parseInt(hex, 16));
        } catch (e) {
          return '';
        }
      });
  }

  function extractXmlTagText(xmlString, regex, joiner = '') {
    const matches = [...xmlString.matchAll(regex)];
    return matches.map(m => decodeEntities(m[1])).join(joiner);
  }

  async function parseExcelFile(file, zip = null) {
    let text = '';
    const sections = [];
    const metadata = [];

    if (window.XLSX) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
        const allSheetTexts = [];

        workbook.SheetNames.forEach((sheetName, idx) => {
          const sheet = workbook.Sheets[sheetName];
          if (!sheet) return;

          const csvText = window.XLSX.utils.sheet_to_csv(sheet, { FS: ' | ', RS: '\n', blankrows: false }).trim();
          if (csvText) {
            sections.push({
              l: `Hoja ${idx + 1}: ${sheetName}`,
              t: csvText
            });
            allSheetTexts.push(`=== Hoja: ${sheetName} ===\n${csvText}`);
          }
        });

        if (allSheetTexts.length > 0) {
          text = allSheetTexts.join('\n\n');
        }

        if (workbook.Props) {
          if (workbook.Props.Title) metadata.push(['Título', workbook.Props.Title]);
          if (workbook.Props.Author) metadata.push(['Autor', workbook.Props.Author]);
          if (workbook.Props.Company) metadata.push(['Organización', workbook.Props.Company]);
          if (workbook.Props.CreatedDate) metadata.push(['Fecha creación', String(workbook.Props.CreatedDate)]);
          if (workbook.Props.ModifiedDate) metadata.push(['Fecha modificación', String(workbook.Props.ModifiedDate)]);
          if (workbook.Props.Application) metadata.push(['Software editor', workbook.Props.Application]);
        }
      } catch (err) {
        console.warn('Fallo SheetJS, recurriendo al motor XML nativo:', err);
      }
    }

    if (!text && zip) {
      const readXml = async (path) => (zip.file(path) ? await zip.file(path).async('string') : '');

      const wbXml = await readXml('xl/workbook.xml');
      const sheetNameMatches = [...wbXml.matchAll(/<sheet [^>]*name="([^"]+)"/g)].map(m => decodeEntities(m[1]));

      const sharedStrings = [];
      const ssXml = await readXml('xl/sharedStrings.xml');
      if (ssXml) {
        const siMatches = [...ssXml.matchAll(/<si>(.*?)<\/si>/gs)];
        siMatches.forEach(siMatch => {
          const tMatches = [...siMatch[1].matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map(t => decodeEntities(t[1]));
          sharedStrings.push(tMatches.join(''));
        });
      }

      const sheetKeys = Object.keys(zip.files)
        .filter(k => /^xl\/worksheets\/sheet\d+\.xml$/.test(k))
        .sort((a, b) => {
          const numA = parseInt(a.match(/sheet(\d+)\.xml/)[1], 10);
          const numB = parseInt(b.match(/sheet(\d+)\.xml/)[1], 10);
          return numA - numB;
        });

      const allSheetTexts = [];

      for (let idx = 0; idx < sheetKeys.length; idx++) {
        const key = sheetKeys[idx];
        const sheetName = sheetNameMatches[idx] || `Hoja ${idx + 1}`;
        const sheetXml = await readXml(key);
        const rowLines = [];

        const rowMatches = [...sheetXml.matchAll(/<row [^>]*>(.*?)<\/row>/gs)];
        for (const rowMatch of rowMatches) {
          const cellTexts = [];
          const cellMatches = [...rowMatch[1].matchAll(/<c ([^>]*)>(.*?)<\/c>/gs)];

          for (const cellMatch of cellMatches) {
            const attrs = cellMatch[1];
            const body = cellMatch[2];
            let val = '';

            if (attrs.includes('t="s"')) {
              const vMatch = body.match(/<v>(\d+)<\/v>/);
              if (vMatch) {
                const sIdx = parseInt(vMatch[1], 10);
                if (sIdx < sharedStrings.length) {
                  val = sharedStrings[sIdx];
                }
              }
            
            } else if (attrs.includes('t="inlineStr"') || body.includes('<is>')) {
              const tMatches = [...body.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map(t => decodeEntities(t[1]));
              val = tMatches.join('');
            
            } else if (attrs.includes('t="str"')) {
              const vMatch = body.match(/<v>([^<]*)<\/v>/);
              if (vMatch) {
                val = decodeEntities(vMatch[1]);
              }
            
            } else {
              const tMatches = [...body.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map(t => decodeEntities(t[1]));
              if (tMatches.length > 0) {
                val = tMatches.join('');
              } else {
                const vMatch = body.match(/<v>([^<]*)<\/v>/);
                if (vMatch && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(vMatch[1])) {
                  val = decodeEntities(vMatch[1]);
                }
              }
            }

            val = val.trim();
            if (val) cellTexts.push(val);
          }

          if (cellTexts.length > 0) {
            rowLines.push(cellTexts.join(' | '));
          }
        }

        const sheetText = rowLines.join('\n').trim();
        if (sheetText) {
          sections.push({
            l: `Hoja ${idx + 1}: ${sheetName}`,
            t: sheetText
          });
          allSheetTexts.push(`=== Hoja: ${sheetName} ===\n${sheetText}`);
        }
      }

      if (allSheetTexts.length > 0) {
        text = allSheetTexts.join('\n\n');
      }
    }

    return { text, sections, metadata };
  }

  async function parseDocument(file) {
    const fileName = file.name.toLowerCase();
    const metadata = [];
    const flags = [];
    let text = '';
    let sections = null;
    let pdfDocument = null;

    if (fileName.endsWith('.pdf')) {
      if (!window.pdfjsLib) {
        throw new Error('La librería PDF.js no está disponible.');
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      pdfDocument = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      sections = [];

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const content = await page.getTextContent();
        let pageText = '';
        for (const item of content.items) {
          pageText += item.str + (item.hasEOL ? '\n' : ' ');
        }
        pageText = pageText
          .replace(/-\n(?=\p{Ll})/gu, '')
          .replace(/([^\n.!?:])\n(?!\n)/g, '$1 ')
          .replace(/ {2,}/g, ' ')
          .trim();

        sections.push({ l: `Pág. ${i}`, t: pageText });
      }

      text = sections.map(s => s.t).join('\n\n');

      try {
        const meta = await pdfDocument.getMetadata();
        const info = (meta && meta.info) ? meta.info : {};
        const fieldMap = [
          ['Title', 'Título'],
          ['Author', 'Autor'],
          ['Creator', 'Aplicación creadora'],
          ['Producer', 'Productor PDF'],
          ['CreationDate', 'Fecha de creación'],
          ['ModDate', 'Fecha de modificación']
        ];
        fieldMap.forEach(([key, label]) => {
          if (info[key]) metadata.push([label, String(info[key])]);
        });
      } catch (err) {
        console.warn('Error leyendo metadatos PDF:', err);
      }
      metadata.push(['Total de páginas', String(pdfDocument.numPages)]);

    } else if (/\.(xlsx|xls|xlsm|xltx)$/i.test(fileName)) {
      let zip = null;
      if (window.JSZip && !fileName.endsWith('.xls')) {
        try {
          zip = await window.JSZip.loadAsync(await file.arrayBuffer());
        } catch (e) {
          console.warn('No es un contenedor zip o es .xls antiguo:', e);
        }
      }

      const excelResult = await parseExcelFile(file, zip);
      text = excelResult.text;
      sections = excelResult.sections;
      if (excelResult.metadata && excelResult.metadata.length) {
        metadata.push(...excelResult.metadata);
      }

      if (zip) {
        const readXml = async (path) => (zip.file(path) ? await zip.file(path).async('string') : '');
        const coreXml = await readXml('docProps/core.xml');
        if (coreXml) {
          const coreFields = [
            ['creator', 'Autor'],
            ['lastModifiedBy', 'Última modificación por'],
            ['created', 'Fecha creación'],
            ['modified', 'Fecha modificación'],
            ['revision', 'Número de revisión']
          ];
          coreFields.forEach(([tag, label]) => {
            const regex = new RegExp(`<(?:\\w+:)?${tag}[^>]*>([^<]+)<`);
            const match = coreXml.match(regex);
            if (match && !metadata.some(m => m[0] === label)) {
              metadata.push([label, decodeEntities(match[1])]);
            }
          });
        }

        const appXml = await readXml('docProps/app.xml');
        if (appXml) {
          const appMatch = appXml.match(/<Application>([^<]*)<\/Application>/i);
          if (appMatch && !metadata.some(m => m[0] === 'Software editor')) {
            metadata.push(['Software editor', decodeEntities(appMatch[1])]);
          }
          const timeMatch = appXml.match(/<TotalTime>(\d+)<\/TotalTime>/i);
          if (timeMatch) metadata.push(['Tiempo de edición (min)', timeMatch[1]]);
        }
      }

      if (sections && sections.length) {
        metadata.push(['Total de hojas analizadas', String(sections.length)]);
      }

    } else if (/\.(docx|pptx|odt|odp)$/i.test(fileName)) {
      if (!window.JSZip) {
        throw new Error('La librería JSZip no está disponible.');
      }
      const zip = await window.JSZip.loadAsync(await file.arrayBuffer());
      const readXml = async (path) => (zip.file(path) ? await zip.file(path).async('string') : '');

      if (fileName.endsWith('.docx')) {
        const docXml = await readXml('word/document.xml');
        text = docXml
          .split(/<\/w:p>/)
          .map(paragraph => extractXmlTagText(paragraph, /<w:t[^>]*>([^<]*)<\/w:t>/g, ''))
          .join('\n');

      } else if (fileName.endsWith('.pptx')) {
        const slideKeys = Object.keys(zip.files)
          .filter(k => /^ppt\/slides\/slide\d+\.xml$/.test(k))
          .sort((a, b) => {
            const numA = parseInt(a.match(/(\d+)\.xml/)[1], 10);
            const numB = parseInt(b.match(/(\d+)\.xml/)[1], 10);
            return numA - numB;
          });

        sections = [];
        for (const key of slideKeys) {
          const slideNum = key.match(/(\d+)\.xml/)[1];
          const slideXml = await readXml(key);
          const slideText = extractXmlTagText(slideXml, /<a:t>([^<]*)<\/a:t>/g, ' ');
          sections.push({ l: `Diap. ${slideNum}`, t: slideText.trim() });
        }
        text = sections.map(s => s.t).join('\n\n');

      } else {
        
        const contentXml = await readXml('content.xml');
        text = decodeEntities(
          contentXml
            .replace(/<\/text:(p|h)>/g, '\n')
            .replace(/<[^>]+>/g, '')
        );
      }

      const coreXml = await readXml('docProps/core.xml');
      if (coreXml) {
        const coreFields = [
          ['creator', 'Autor'],
          ['lastModifiedBy', 'Última modificación por'],
          ['created', 'Fecha creación'],
          ['modified', 'Fecha modificación'],
          ['revision', 'Número de revisión']
        ];
        coreFields.forEach(([tag, label]) => {
          const regex = new RegExp(`<(?:\\w+:)?${tag}[^>]*>([^<]+)<`);
          const match = coreXml.match(regex);
          if (match) metadata.push([label, decodeEntities(match[1])]);
        });
      }

      const appXml = await readXml('docProps/app.xml');
      if (appXml) {
        const appMatch = appXml.match(/<Application>([^<]*)<\/Application>/);
        if (appMatch) metadata.push(['Software editor', decodeEntities(appMatch[1])]);

        const timeMatch = appXml.match(/<TotalTime>(\d+)<\/TotalTime>/);
        if (timeMatch) metadata.push(['Tiempo de edición (min)', timeMatch[1]]);
      }

    } else {
      let rawContent = '';
      try {
        const buf = await file.arrayBuffer();
        const decoderUtf8 = new TextDecoder('utf-8', { fatal: false });
        rawContent = decoderUtf8.decode(buf);
        
        const ufffdCount = (rawContent.match(/\uFFFD/g) || []).length;
        if (ufffdCount > 2) {
          try {
            const decoderAnsi = new TextDecoder('windows-1252', { fatal: false });
            const ansiContent = decoderAnsi.decode(buf);
            if ((ansiContent.match(/\uFFFD/g) || []).length < ufffdCount) {
              rawContent = ansiContent;
            }
          } catch (e) {}
        }
      } catch (err) {
        rawContent = await file.text();
      }

      if (fileName.endsWith('.rtf')) {
        text = rawContent
          .replace(/\\par[d]?/g, '\n')
          .replace(/\{\\\*[^}]*\}/g, '')
          .replace(/\\'[0-9a-f]{2}/gi, '')
          .replace(/\\[a-z]+-?\d* ?/gi, '')
          .replace(/[{}]/g, '');
      } else if (/\.html?$/.test(fileName)) {
        const dom = new DOMParser().parseFromString(rawContent, 'text/html');
        text = dom.body.textContent || '';
      } else if (fileName.endsWith('.json')) {
        try {
          const parsed = JSON.parse(rawContent);
          const strings = [];
          (function walk(obj) {
            if (typeof obj === 'string') strings.push(obj);
            else if (obj && typeof obj === 'object') {
              Object.values(obj).forEach(walk);
            }
          })(parsed);
          text = strings.join('\n');
        } catch (e) {
          text = rawContent;
        }
      } else {
        text = rawContent;
      }
    }

    text = text.trim();

    metadata.forEach(([key, val]) => {
      if (AI_TOOL_KEYWORDS.test(val)) {
        flags.push(`El metadato «${key}» menciona una herramienta de IA o generación automatizada: ${val}`);
      }
    });

    const editTimeEntry = metadata.find(m => m[0] === 'Tiempo de edición (min)');
    if (editTimeEntry && parseInt(editTimeEntry[1], 10) <= 1 && text.split(/\s+/).length > 250) {
      flags.push('Tiempo de edición registrado ≈ 0-1 min en un documento extenso: evidencia típica de copiado masivo desde otra fuente.');
    }

    const zwCount = (text.match(ZW_REGEX) || []).length;
    if (zwCount >= 3) {
      flags.push(`Se detectaron ${zwCount} caracteres invisibles (Zero-Width): suelen proceder de texto generado y copiado de asistentes web.`);
    }

    return {
      name: file.name,
      fileSize: file.size || 0,
      fileSizeFormatted: formatBytes(file.size || 0),
      text,
      metadata,
      sections,
      pdfDocument,
      flags
    };
  }

  window.DocumentParser = {
    parseDocument,
    parseExcelFile,
    decodeEntities,
    AI_TOOL_KEYWORDS
  };

})(window);
