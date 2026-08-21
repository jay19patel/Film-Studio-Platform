import html2canvas from 'html2canvas';

export async function captureHtml2Canvas(element: HTMLElement) {
  // 1. Find and temporarily disable any document styleSheet containing modern lab()/oklch() color functions
  const disabledSheets: CSSStyleSheet[] = [];

  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (rules) {
        let hasModernColor = false;
        for (let i = 0; i < rules.length; i++) {
          const text = rules[i].cssText || '';
          if (
            text.includes('lab(') ||
            text.includes('oklch(') ||
            text.includes('oklab(') ||
            text.includes('color(')
          ) {
            hasModernColor = true;
            break;
          }
        }
        if (hasModernColor) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    } catch (e) {
      // Ignore cross-origin or security restricted stylesheets
    }
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // Remove style elements containing modern color functions in the cloned document
        const styleNodes = clonedDoc.querySelectorAll('style, link');
        styleNodes.forEach((node) => {
          const text = node.textContent || '';
          if (
            text.includes('lab(') ||
            text.includes('oklch(') ||
            text.includes('oklab(') ||
            text.includes('color(')
          ) {
            node.remove();
          }
        });

        // Delete any remaining modern color rules from clonedDoc.styleSheets
        Array.from(clonedDoc.styleSheets).forEach((sheet) => {
          try {
            const rules = sheet.cssRules || sheet.rules;
            if (rules) {
              for (let i = rules.length - 1; i >= 0; i--) {
                const text = rules[i].cssText || '';
                if (
                  text.includes('lab(') ||
                  text.includes('oklch(') ||
                  text.includes('oklab(') ||
                  text.includes('color(')
                ) {
                  sheet.deleteRule(i);
                }
              }
            }
          } catch (e) {
            // Ignore
          }
        });

        // Inject essential clean CSS fallback to ensure Arial font & line height stability in canvas
        const fallbackStyle = clonedDoc.createElement('style');
        fallbackStyle.textContent = `
          * {
            box-sizing: border-box !important;
            font-family: Arial, Helvetica, sans-serif !important;
            letter-spacing: normal !important;
            text-transform: none !important;
          }
        `;
        clonedDoc.head.appendChild(fallbackStyle);
      },
    });

    return canvas;
  } finally {
    // Re-enable all disabled document stylesheets instantly
    disabledSheets.forEach((sheet) => {
      sheet.disabled = false;
    });
  }
}
