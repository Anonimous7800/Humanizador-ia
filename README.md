# 🔍 VeritAI - Detector Forense de Texto Generado por IA

[![Deploy to GitHub Pages](https://github.com/usuario/Analizador/actions/workflows/deploy.yml/badge.svg)](https://github.com/usuario/Analizador/actions/workflows/deploy.yml)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![Privacidad: 100% Cliente](https://img.shields.io/badge/Privacidad-100%25%20En%20Navegador-emerald.svg)](#privacidad)

**VeritAI** es una herramienta web profesional de código abierto para la detección, análisis estilométrico y forense de textos generados por Inteligencia Artificial (ChatGPT, Claude, Gemini, Copilot, Jasper, DeepSeek, etc.).

Diseñado para ejecutarse **100% en el lado del cliente (en tu navegador)**: ningún texto ni documento se envía a servidores externos ni a APIs de terceros, garantizando absoluta privacidad y confidencialidad.

---

## 🚀 Características Principales

- 🔒 **100% Privado y Seguro:** Todo el análisis (extracción de texto, cálculo estilométrico y análisis forense) ocurre en la memoria de tu navegador.
- 📁 **Soporte Multiformato y Análisis por Lotes:**
  - Archivos compatibles: **PDF**, **DOCX**, **PPTX**, **XLSX / XLS / XLSM**, **ODT**, **ODP**, **RTF**, **TXT**, **Markdown**, **CSV / TSV**, **HTML** y **JSON**.
  - **Motor avanzado para Hojas de Cálculo (Excel):** Integración con SheetJS y parser XML nativo para libros con múltiples hojas (`Resumen`, `Datos`, etc.), cadenas en línea (*inline strings* de Openpyxl, Google Sheets o Pandas), fórmulas y metadatos forenses del archivo.
  - Permite arrastrar múltiples documentos a la vez y compararlos en una cola organizada.
- 🎨 **Visualización Moderna y Profesional:**
  - Indicador de probabilidad semicircular animado (*Gauge meter*).
  - Veredicto y desglose tripartito: Probabilidad de IA, Probabilidad Humana e Indicios de Paráfrasis.
  - Modo Oscuro / Claro (*Dark / Light Mode*) persistente.
  - Diseño responsivo adaptado a escritorios, tablets y móviles.
- 🗺️ **Mapa de Calor Interactivo (Sentence Heatmap):**
  - Resaltado frase a frase con gradación de colores (rojo = alta sospecha, amarillo = dudosa).
  - Detección y marcado visual de muletillas típicas de modelos de lenguaje con tooltip explicativo.
  - Vista previa de páginas PDF originales con cajas de texto resaltadas en tiempo real mediante HTML5 Canvas.
- 📊 **Mapa por Secciones y Páginas:**
  - Mapeo longitudinal por página (PDF), diapositiva (PPTX) o bloques de ~250 palabras para identificar exactamente en qué partes se concentran los fragmentos generados por IA.
- 📐 **Indicadores Estilométricos Detallados:**
  1. **Variación de longitud de frases (*Burstiness* / CV):** Evaluación de uniformidad rítmica vs. alternancia humana.
  2. **Diversidad léxica (MATTR):** Riqueza de vocabulario único por ventana deslizante.
  3. **Repetición de patrones (Trigramas):** Detección de n-gramas reiterados.
  4. **Muletillas arquetípicas:** Identificación de clichés sintácticos en español e inglés.
  5. **Conectores mecánicos al inicio:** Tendencia a abrir oraciones de manera predecible.
  6. **Uniformidad de longitud de párrafos:** Detección de bloques simétricos generados automáticamente.
  7. **Huellas sintácticas de Chatbot:** Rastreo de Markdown residual (`**negritas**`, `#`, viñetas, em-dashes).
  8. **Marcadores personales y coloquiales:** Detección de marcas de voz humana que reducen la sospecha.
  9. **Variedad de signos de puntuación:** Rango de signos ricos (`;`, `:`, `¿?`, `¡!`, `…`).
  10. **Adjetivos vagos y de relleno:** Densidad de comodines (*"crucial"*, *"fundamental"*, *"diversos"*, etc.).
- 🕵️ **Auditoría Forense y Metadatos:**
  - Extracción de metadatos de documentos Office y PDF (autor, software creador, fechas, tiempo de edición).
  - Detección de caracteres invisibles (*Zero-Width characters*) procedentes de copiado desde interfaces web o marcas de agua.
- ✨ **Humanizador Integrado:**
  - Sugiere una reescritura que limpia artefactos de formato, aligera oraciones compuestas y reemplaza frases trilladas.
  - Muestra la variación de la puntuación antes y después.
  - Permite copiar o reanalizar la versión humanizada con un solo clic.
- 📄 **Exportación de Informes:**
  - Impresión / Exportación limpia a PDF lista para informes académicos o corporativos.
  - Descarga estructurada en archivo **JSON**.

---

## 📂 Estructura del Proyecto

```text
Analizador/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Flujo automático de despliegue en GitHub Pages
├── assets/
│   ├── css/
│   │   ├── styles.css          # Estilos modernos, temas (Light/Dark) y componentes
│   │   └── print.css           # Hoja de estilos para exportar a PDF o imprimir
│   ├── js/
│   │   ├── analyzer.js         # Motor heurístico y matemático de detección de IA
│   │   ├── document-parser.js  # Lector de archivos PDF, Office, RTF, JSON, etc.
│   │   ├── humanizer.js        # Motor de humanización y reescritura de texto
│   │   ├── sample-data.js      # Textos de prueba precargados (IA vs Humano)
│   │   └── app.js              # Controlador principal de la UI, eventos y renderizado
│   └── images/
│       ├── logo.svg            # Logotipo de la aplicación en formato SVG
│       └── favicon.svg         # Favicon vectorial para la pestaña del navegador
├── index.html                  # Punto de entrada de la aplicación web
├── .gitignore                  # Configuración de exclusiones de Git
├── LICENSE                     # Licencia de código abierto MIT
└── README.md                   # Documentación completa del proyecto
```

---

## 🌐 Cómo Desplegar en GitHub Pages

Este proyecto está 100% listo para GitHub Pages sin necesidad de compilar código (`npm run build` no es necesario):

### Opción 1: Despliegue Automático mediante GitHub Actions (Recomendado)

1. Sube este repositorio a tu cuenta de GitHub:
   ```bash
   git add .
   git commit -m "feat: inicializar VeritAI para GitHub Pages"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git push -u origin main
   ```
2. En GitHub, ve a **Settings** > **Pages** de tu repositorio.
3. En la sección **Build and deployment** > **Source**, selecciona **GitHub Actions**.
4. ¡Listo! El archivo `.github/workflows/deploy.yml` compilará y desplegará automáticamente la página en:
   `https://TU-USUARIO.github.io/TU-REPOSITORIO/`

### Opción 2: Despliegue Directo desde la Rama `main`

1. En GitHub, ve a la pestaña **Settings** > **Pages**.
2. En **Build and deployment** > **Source**, selecciona **Deploy from a branch**.
3. En **Branch**, selecciona `main` (o `master`) y la carpeta `/ (root)`.
4. Haz clic en **Save**. En un par de minutos tu sitio estará en línea.

---

## 💻 Ejecución en Local

Puedes probar la aplicación en tu máquina de varias formas:

1. **Directamente en el navegador:**
   - Haz doble clic sobre `index.html` para abrirlo en Chrome, Firefox, Edge o Safari.

2. **Con un servidor local ligero (Recomendado para lectura óptima de Workers de PDF.js):**
   ```bash
   # Opción con Python
   python -m http.server 8080

   # O con Node.js (npx)
   npx serve .
   ```
   Luego abre en tu navegador `http://localhost:8080`.

---

## ⚖️ Aviso Ético y Limitaciones

Ningún clasificador o detector heurístico de IA es infalible al 100%. 

- Un texto técnico, legal, científico o escrito por un hablante no nativo con estilo muy académico puede presentar baja variación sintáctica y generar **falsos positivos**.
- Un texto generado por IA que haya sido editado minuciosamente por una persona puede evadir los patrones automáticos (**falsos negativos**).
- **Recomendación:** Utilice este sistema como un apoyo de orientación preliminar, nunca como única prueba para juzgar la autoría de un trabajo.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

