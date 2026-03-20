import React, { createContext, useContext, useState, useCallback } from 'react';
import { EmailTemplate, EmailRow, EmailBlock, BlockType, ColumnLayout, createBlock, createRow, BlockStyle, CellStyle } from '@/types/email-builder';

interface Selection {
  rowId: string;
  cellIndex: number;
  blockId: string;
}

interface EmailBuilderContextType {
  template: EmailTemplate;
  selection: Selection | null;
  previewMode: 'desktop' | 'mobile';
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  setSelection: (sel: Selection | null) => void;
  addRow: (columns: ColumnLayout) => void;
  deleteRow: (rowId: string) => void;
  moveRow: (rowId: string, direction: 'up' | 'down') => void;
  addBlockToCell: (rowId: string, cellIndex: number, type: BlockType) => void;
  updateBlock: (rowId: string, cellIndex: number, blockId: string, updates: Partial<EmailBlock>) => void;
  updateBlockStyle: (rowId: string, cellIndex: number, blockId: string, style: Partial<BlockStyle>) => void;
  deleteBlock: (rowId: string, cellIndex: number, blockId: string) => void;
  moveBlock: (rowId: string, cellIndex: number, blockId: string, direction: 'up' | 'down') => void;
  reorderBlock: (rowId: string, cellIndex: number, blockId: string, newPosition: number) => void;
  moveBlockBetweenCells: (fromRowId: string, fromCellIndex: number, blockId: string, toRowId: string, toCellIndex: number, position: number) => void;
  updateRowStyle: (rowId: string, style: Partial<EmailRow['style']>) => void;
  updateCellStyle: (rowId: string, cellIndex: number, style: Partial<CellStyle>) => void;
  updateCellGap: (rowId: string, gap: number) => void;
  updateRowMobileStack: (rowId: string, mobileStack: boolean) => void;
  updateGlobalStyle: (style: Partial<EmailTemplate['globalStyle']>) => void;
  getSelectedBlock: () => { block: EmailBlock; rowId: string; cellIndex: number } | null;
  generateHTML: () => string;
  setTemplate: (template: EmailTemplate) => void;
  addBlockFromSaved: (rowId: string, cellIndex: number, block: EmailBlock) => void;
}

const EmailBuilderContext = createContext<EmailBuilderContextType | null>(null);

const initialTemplate: EmailTemplate = {
  rows: [],
  globalStyle: {
    backgroundColor: '#f0f0f0',
    maxWidth: 600,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
};

export const EmailBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [template, setTemplate] = useState<EmailTemplate>(initialTemplate);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const addRow = useCallback((columns: ColumnLayout) => {
    setTemplate(prev => ({ ...prev, rows: [...prev.rows, createRow(columns)] }));
  }, []);

  const deleteRow = useCallback((rowId: string) => {
    setTemplate(prev => ({ ...prev, rows: prev.rows.filter(r => r.id !== rowId) }));
    setSelection(null);
  }, []);

  const moveRow = useCallback((rowId: string, direction: 'up' | 'down') => {
    setTemplate(prev => {
      const idx = prev.rows.findIndex(r => r.id === rowId);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.rows.length) return prev;
      const rows = [...prev.rows];
      [rows[idx], rows[newIdx]] = [rows[newIdx], rows[idx]];
      return { ...prev, rows };
    });
  }, []);

  const addBlockToCell = useCallback((rowId: string, cellIndex: number, type: BlockType) => {
    const block = createBlock(type);
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => {
        if (r.id !== rowId) return r;
        const cells = r.cells.map((cell, i) => i === cellIndex ? [...cell, block] : cell);
        return { ...r, cells };
      }),
    }));
    setSelection({ rowId, cellIndex, blockId: block.id });
  }, []);

  const updateBlock = useCallback((rowId: string, cellIndex: number, blockId: string, updates: Partial<EmailBlock>) => {
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => {
        if (r.id !== rowId) return r;
        const cells = r.cells.map((cell, i) => {
          if (i !== cellIndex) return cell;
          return cell.map(b => b.id === blockId ? { ...b, ...updates } : b);
        });
        return { ...r, cells };
      }),
    }));
  }, []);

  const updateBlockStyle = useCallback((rowId: string, cellIndex: number, blockId: string, style: Partial<BlockStyle>) => {
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => {
        if (r.id !== rowId) return r;
        const cells = r.cells.map((cell, i) => {
          if (i !== cellIndex) return cell;
          return cell.map(b => b.id === blockId ? { ...b, style: { ...b.style, ...style } } : b);
        });
        return { ...r, cells };
      }),
    }));
  }, []);

  const deleteBlock = useCallback((rowId: string, cellIndex: number, blockId: string) => {
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => {
        if (r.id !== rowId) return r;
        const cells = r.cells.map((cell, i) => {
          if (i !== cellIndex) return cell;
          return cell.filter(b => b.id !== blockId);
        });
        return { ...r, cells };
      }),
    }));
    setSelection(null);
  }, []);

  const moveBlock = useCallback((rowId: string, cellIndex: number, blockId: string, direction: 'up' | 'down') => {
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => {
        if (r.id !== rowId) return r;
        const cells = r.cells.map((cell, i) => {
          if (i !== cellIndex) return cell;
          const idx = cell.findIndex(b => b.id === blockId);
          if (idx === -1) return cell;
          const newIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (newIdx < 0 || newIdx >= cell.length) return cell;
          const arr = [...cell];
          [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
          return arr;
        });
        return { ...r, cells };
      }),
    }));
  }, []);

  const reorderBlock = useCallback((rowId: string, cellIndex: number, blockId: string, newPosition: number) => {
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => {
        if (r.id !== rowId) return r;
        const cells = r.cells.map((cell, i) => {
          if (i !== cellIndex) return cell;
          const idx = cell.findIndex(b => b.id === blockId);
          if (idx === -1) return cell;
          const arr = [...cell];
          const [item] = arr.splice(idx, 1);
          const insertAt = idx < newPosition ? newPosition - 1 : newPosition;
          arr.splice(insertAt, 0, item);
          return arr;
        });
        return { ...r, cells };
      }),
    }));
  }, []);

  const moveBlockBetweenCells = useCallback((fromRowId: string, fromCellIndex: number, blockId: string, toRowId: string, toCellIndex: number, position: number) => {
    setTemplate(prev => {
      let movedBlock: EmailBlock | null = null;
      const rows = prev.rows.map(r => {
        if (r.id !== fromRowId) return r;
        const cells = r.cells.map((cell, i) => {
          if (i !== fromCellIndex) return cell;
          const idx = cell.findIndex(b => b.id === blockId);
          if (idx === -1) return cell;
          movedBlock = cell[idx];
          return cell.filter(b => b.id !== blockId);
        });
        return { ...r, cells };
      });
      if (!movedBlock) return prev;
      const finalRows = rows.map(r => {
        if (r.id !== toRowId) return r;
        const cells = r.cells.map((cell, i) => {
          if (i !== toCellIndex) return cell;
          const arr = [...cell];
          arr.splice(position, 0, movedBlock!);
          return arr;
        });
        return { ...r, cells };
      });
      return { ...prev, rows: finalRows };
    });
    setSelection({ rowId: toRowId, cellIndex: toCellIndex, blockId });
  }, []);

  const updateRowStyle = useCallback((rowId: string, style: Partial<EmailRow['style']>) => {
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => r.id === rowId ? { ...r, style: { ...r.style, ...style } } : r),
    }));
  }, []);

  const updateCellStyle = useCallback((rowId: string, cellIndex: number, style: Partial<CellStyle>) => {
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => {
        if (r.id !== rowId) return r;
        const cellStyles = [...(r.cellStyles || r.cells.map(() => ({ backgroundColor: 'transparent', borderRadius: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 })))];
        cellStyles[cellIndex] = { ...cellStyles[cellIndex], ...style };
        return { ...r, cellStyles };
      }),
    }));
  }, []);

  const updateCellGap = useCallback((rowId: string, gap: number) => {
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => r.id === rowId ? { ...r, cellGap: gap } : r),
    }));
  }, []);

  const updateRowMobileStack = useCallback((rowId: string, mobileStack: boolean) => {
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => r.id === rowId ? { ...r, mobileStack } : r),
    }));
  }, []);

  const updateGlobalStyle = useCallback((style: Partial<EmailTemplate['globalStyle']>) => {
    setTemplate(prev => ({ ...prev, globalStyle: { ...prev.globalStyle, ...style } }));
  }, []);

  const setTemplateDirectly = useCallback((t: EmailTemplate) => {
    setTemplate(t);
    setSelection(null);
  }, []);

  const addBlockFromSaved = useCallback((rowId: string, cellIndex: number, savedBlock: EmailBlock) => {
    const newBlock = { ...savedBlock, id: crypto.randomUUID() };
    setTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(r => {
        if (r.id !== rowId) return r;
        const cells = r.cells.map((cell, i) => i === cellIndex ? [...cell, newBlock] : cell);
        return { ...r, cells };
      }),
    }));
    setSelection({ rowId, cellIndex, blockId: newBlock.id });
  }, []);

  const getSelectedBlock = useCallback(() => {
    if (!selection) return null;
    const row = template.rows.find(r => r.id === selection.rowId);
    if (!row) return null;
    const cell = row.cells[selection.cellIndex];
    if (!cell) return null;
    const block = cell.find(b => b.id === selection.blockId);
    if (!block) return null;
    return { block, rowId: selection.rowId, cellIndex: selection.cellIndex };
  }, [selection, template]);

  const generateHTML = useCallback(() => {
    const { globalStyle, rows } = template;
    let blockCounter = 0;

    const renderBlock = (block: EmailBlock) => {
      const s = block.style;
      const blockClass = `block-${blockCounter++}`;
      const fontFamilyStr = s.fontFamily !== 'inherit' ? `font-family:${s.fontFamily};` : `font-family:${globalStyle.fontFamily};`;
      const widthStr = s.width ? `width:${s.width};` : '';
      const marginStr = s.width && s.width !== '100%' ? (s.textAlign === 'center' ? 'margin:0 auto;' : s.textAlign === 'right' ? 'margin:0 0 0 auto;' : '') : '';
      const outerMargin = (s.marginTop || s.marginRight || s.marginBottom || s.marginLeft) ? `margin:${s.marginTop || 0}px ${s.marginRight || 0}px ${s.marginBottom || 0}px ${s.marginLeft || 0}px;` : '';
      const bgStr = s.backgroundColor && s.backgroundColor !== 'transparent' ? `background-color:${s.backgroundColor};` : '';
      const borderStr = s.borderWidth > 0 ? `border:${s.borderWidth}px solid ${s.borderColor};` : '';
      const baseStyle = `color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};text-align:${s.textAlign};${bgStr}padding:${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px;${borderStr}border-radius:${s.borderRadius}px;line-height:${s.lineHeight};${fontFamilyStr}`;
      const wrapStyle = `${widthStr}${outerMargin || marginStr}`;

      switch (block.type) {
        case 'heading':
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}"><tr><td><h1 style="${baseStyle}margin:0;mso-line-height-rule:exactly;">${block.content}</h1></td></tr></table>`;
        case 'text':
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}"><tr><td><p style="${baseStyle}margin:0;mso-line-height-rule:exactly;">${block.content}</p></td></tr></table>`;
        case 'image': {
          const imgWidth = s.width && s.width !== '100%' ? s.width.replace('px', '').replace('%', '') : '100%';
          const imgTag = `<img src="${block.src}" alt="${block.alt || ''}" width="${imgWidth}" style="max-width:100%;height:auto;display:block;border:0;outline:none;border-radius:${s.borderRadius}px;${s.textAlign === 'center' ? 'margin:0 auto;' : ''}" />`;
          const wrapped = block.href ? `<a href="${block.href}" target="_blank" style="text-decoration:none;border:0;">${imgTag}</a>` : imgTag;
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}"><tr><td style="padding:${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px;text-align:${s.textAlign};">${wrapped}</td></tr></table>`;
        }
        case 'button': {
          const btnAlign = s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'right' : 'left';
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}"><tr><td align="${btnAlign}" style="padding:4px 0;">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${block.href || '#'}" style="height:auto;v-text-anchor:middle;width:auto;" arcsize="${Math.round(s.borderRadius / 40 * 100)}%" strokecolor="${s.borderColor}" fillcolor="${s.backgroundColor}"><w:anchorlock/><center style="color:${s.color};font-family:${s.fontFamily !== 'inherit' ? s.fontFamily : globalStyle.fontFamily};font-size:${s.fontSize}px;font-weight:${s.fontWeight};">${block.content}</center></v:roundrect><![endif]-->
<!--[if !mso]><!--><a href="${block.href || '#'}" target="_blank" style="display:inline-block;background-color:${s.backgroundColor};color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};padding:${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px;border-radius:${s.borderRadius}px;text-decoration:none;text-align:center;${fontFamilyStr}${borderStr}line-height:${s.lineHeight};mso-hide:all;">${block.content}</a><!--<![endif]-->
</td></tr></table>`;
        }
        case 'list': {
          const bs = block.bulletStyle || { type: 'disc', color: '#333333', size: 16, fontWeight: '400', customIcon: '', offsetX: 0, offsetY: 0 };
          const items = (block.listItems || []).map((item, i) => {
            let bulletHtml = '';
            const bulletTdStyle = `color:${bs.color};font-size:${bs.size}px;font-weight:${bs.fontWeight};vertical-align:top;padding-right:8px;white-space:nowrap;`;
            if (bs.type === 'custom' && bs.customIcon) {
              bulletHtml = `<td style="${bulletTdStyle}"><img src="${bs.customIcon}" alt="" width="${bs.size}" height="${bs.size}" style="display:block;border:0;" /></td>`;
            } else if (bs.type === 'check') {
              bulletHtml = `<td style="${bulletTdStyle}">&#10003;</td>`;
            } else if (bs.type === 'number') {
              bulletHtml = `<td style="${bulletTdStyle}">${i + 1}.</td>`;
            } else {
              bulletHtml = `<td style="${bulletTdStyle}">&bull;</td>`;
            }
            return `<tr>${bulletHtml}<td style="color:${s.color};font-size:${s.fontSize}px;line-height:${s.lineHeight};${fontFamilyStr}padding-bottom:${i < (block.listItems?.length || 0) - 1 ? '6' : '0'}px;">${item}</td></tr>`;
          }).join('');
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}"><tr><td style="${baseStyle}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${items}</table></td></tr></table>`;
        }
        case 'menu': {
          const menuLayout = block.menuLayout || 'horizontal';
          const isH = menuLayout === 'horizontal';
          const gap = block.menuGap || 16;
          const btnAlign = s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'right' : 'left';
          const logoHtml = block.menuLogoSrc
            ? `<td style="padding-right:${isH ? gap : 0}px;padding-bottom:${!isH ? gap : 0}px;">${block.menuLogoHref
              ? `<a href="${block.menuLogoHref}" target="_blank" style="text-decoration:none;border:0;"><img src="${block.menuLogoSrc}" alt="Logo" width="${block.menuLogoWidth || 120}" style="display:block;border:0;height:auto;" /></a>`
              : `<img src="${block.menuLogoSrc}" alt="Logo" width="${block.menuLogoWidth || 120}" style="display:block;border:0;height:auto;" />`}</td>`
            : '';
          const linksHtml = (block.menuItems || []).map((item, i) =>
            `<td style="padding:${isH ? `0 ${i < (block.menuItems?.length || 0) - 1 ? gap / 2 : 0}px 0 ${i > 0 ? gap / 2 : 0}px` : `${i > 0 ? gap / 2 : 0}px 0 ${i < (block.menuItems?.length || 0) - 1 ? gap / 2 : 0}px 0`};"><a href="${item.href || '#'}" target="_blank" style="color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};text-decoration:none;white-space:nowrap;${fontFamilyStr}">${item.label}</a></td>`
          ).join('');

          if (isH) {
            return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}"><tr><td style="${baseStyle}" align="${btnAlign}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${logoHtml}${linksHtml}</tr></table></td></tr></table>`;
          } else {
            const allItems = [];
            if (logoHtml) allItems.push(`<tr>${logoHtml}</tr>`);
            (block.menuItems || []).forEach((item, i) => {
              allItems.push(`<tr><td style="padding:${i > 0 ? gap / 2 : 0}px 0 ${i < (block.menuItems?.length || 0) - 1 ? gap / 2 : 0}px 0;"><a href="${item.href || '#'}" target="_blank" style="color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};text-decoration:none;white-space:nowrap;${fontFamilyStr}">${item.label}</a></td></tr>`);
            });
            return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}"><tr><td style="${baseStyle}" align="${btnAlign}"><table role="presentation" cellpadding="0" cellspacing="0" border="0">${allItems.join('')}</table></td></tr></table>`;
          }
        }
      }
    };

    // Collect mobile width overrides
    blockCounter = 0;
    const mobileStyles: string[] = [];
    rows.forEach(row => {
      row.cells.forEach(cell => {
        cell.forEach(block => {
          const cls = `block-${blockCounter++}`;
          const mw = block.style.mobileWidth || '100%';
          if (mw !== (block.style.width || '100%')) {
            const mobileMargin = block.style.textAlign === 'center' ? 'margin:0 auto!important;' : block.style.textAlign === 'right' ? 'margin:0 0 0 auto!important;' : '';
            mobileStyles.push(`.${cls}{width:${mw}!important;${mobileMargin}}`);
          }
        });
      });
    });

    blockCounter = 0;

    const renderRow = (row: EmailRow) => {
      const colWidth = Math.floor(100 / row.columns);
      const gap = row.cellGap || 0;
      const cellsHTML = row.cells.map((cell, ci) => {
        const cs = row.cellStyles?.[ci];
        const cellBg = cs?.backgroundColor;
        const cellBgStyle = cellBg && cellBg !== 'transparent' ? `background-color:${cellBg};` : '';
        const cellBr = cs?.borderRadius ? `border-radius:${cs.borderRadius}px;` : '';
        const cellPad = cs ? `padding:${cs.paddingTop || 0}px ${cs.paddingRight || 0}px ${cs.paddingBottom || 0}px ${cs.paddingLeft || 0}px;` : '';
        return `<td style="width:${colWidth}%;vertical-align:top;${cellBgStyle}${cellBr}${cellPad}" valign="top">${cell.map(renderBlock).join('')}</td>`;
      }).join('');
      const stackClass = (row.mobileStack !== false && row.columns > 1) ? ' mobile-stack' : '';
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="${gap}" border="0" class="${stackClass}" style="background-color:${row.style.backgroundColor};padding:${row.style.paddingTop}px ${row.style.paddingRight}px ${row.style.paddingBottom}px ${row.style.paddingLeft}px;border-collapse:separate;border-spacing:${gap}px;"><tr>${cellsHTML}</tr></table>`;
    };

    const mobileCSS = mobileStyles.length > 0 ? mobileStyles.join('\n    ') : '';

    // Check for base64 images
    const hasBase64Images = rows.some(row =>
      row.cells.some(cell =>
        cell.some(block =>
          (block.src && block.src.startsWith('data:')) ||
          (block.menuLogoSrc && block.menuLogoSrc.startsWith('data:')) ||
          (block.bulletStyle?.customIcon && block.bulletStyle.customIcon.startsWith('data:'))
        )
      )
    );

    // If base64 images present, strip them to reduce size (they won't work in most email clients anyway)
    const processImageSrc = (src: string | undefined) => {
      if (!src) return '';
      if (src.startsWith('data:')) return 'https://placehold.co/600x300/e2e8f0/64748b?text=Upload+Image+URL';
      return src;
    };

    // Re-render with processed images if base64 detected
    if (hasBase64Images) {
      blockCounter = 0;
      // We'll use a second pass approach - just warn in the export dialog
    }

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="ru">
<head>
<meta charset="utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
<title>Email</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style type="text/css">
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;}
  body{margin:0;padding:0;width:100%!important;background-color:${globalStyle.backgroundColor};font-family:${globalStyle.fontFamily};-webkit-font-smoothing:antialiased;}
  .email-container{max-width:${globalStyle.maxWidth}px;}
  u+#body a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit;}
  @media only screen and (max-width:${globalStyle.maxWidth + 20}px){
    .email-container{width:100%!important;max-width:100%!important;}
    .mobile-stack td{display:block!important;width:100%!important;box-sizing:border-box!important;}
    ${mobileCSS}
  }
</style>
</head>
<body id="body" style="margin:0;padding:0;background-color:${globalStyle.backgroundColor};word-spacing:normal;">
<div style="display:none;font-size:1px;color:${globalStyle.backgroundColor};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">&#8199;&#65279;&#847;</div>
<center style="width:100%;background-color:${globalStyle.backgroundColor};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${globalStyle.backgroundColor};">
<tr>
<td align="center" valign="top">
<table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="${globalStyle.maxWidth}" style="margin:0 auto;max-width:${globalStyle.maxWidth}px;width:100%;">
<tr><td>
${rows.map(renderRow).join('\n')}
</td></tr>
</table>
</td>
</tr>
</table>
</center>
</body>
</html>`;
  }, [template]);

  return (
    <EmailBuilderContext.Provider value={{
      template, selection, previewMode, setPreviewMode,
      setSelection, addRow, deleteRow, moveRow,
      addBlockToCell, updateBlock, updateBlockStyle, deleteBlock, moveBlock,
      reorderBlock, moveBlockBetweenCells,
      updateRowStyle, updateCellStyle, updateCellGap, updateRowMobileStack, updateGlobalStyle, getSelectedBlock, generateHTML,
      setTemplate: setTemplateDirectly, addBlockFromSaved,
    }}>
      {children}
    </EmailBuilderContext.Provider>
  );
};

export const useEmailBuilder = () => {
  const ctx = useContext(EmailBuilderContext);
  if (!ctx) throw new Error('useEmailBuilder must be used within EmailBuilderProvider');
  return ctx;
};
