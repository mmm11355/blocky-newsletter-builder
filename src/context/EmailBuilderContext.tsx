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
  updateRowStyle: (rowId: string, style: Partial<EmailRow['style']>) => void;
  updateCellStyle: (rowId: string, cellIndex: number, style: Partial<CellStyle>) => void;
  updateCellGap: (rowId: string, gap: number) => void;
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
      const baseStyle = `color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};text-align:${s.textAlign};background-color:${s.backgroundColor};padding:${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px;border:${s.borderWidth}px solid ${s.borderColor};border-radius:${s.borderRadius}px;line-height:${s.lineHeight};${fontFamilyStr}`;
      switch (block.type) {
        case 'heading':
          return `<div class="${blockClass}" style="${widthStr}${marginStr}max-width:100%;"><h1 style="${baseStyle}margin:0;">${block.content}</h1></div>`;
        case 'text':
          return `<div class="${blockClass}" style="${widthStr}${marginStr}max-width:100%;"><p style="${baseStyle}margin:0;">${block.content}</p></div>`;
        case 'image': {
          const imgTag = `<img src="${block.src}" alt="${block.alt || ''}" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:${s.borderRadius}px;" />`;
          const wrapped = block.href ? `<a href="${block.href}" target="_blank" style="text-decoration:none;">${imgTag}</a>` : imgTag;
          return `<div class="${blockClass}" style="${baseStyle}${widthStr}${marginStr}max-width:100%;">${wrapped}</div>`;
        }
        case 'button':
          return `<div class="${blockClass}" style="text-align:${s.textAlign};${widthStr}${marginStr}max-width:100%;"><a href="${block.href || '#'}" style="display:block;width:100%;box-sizing:border-box;background-color:${s.backgroundColor};color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};padding:${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px;border-radius:${s.borderRadius}px;text-decoration:none;text-align:${s.textAlign};${fontFamilyStr}border:${s.borderWidth}px solid ${s.borderColor};line-height:${s.lineHeight};">${block.content}</a></div>`;
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
        return `<td style="width:${colWidth}%;vertical-align:top;${cellBgStyle}${cellBr}${cellPad}">${cell.map(renderBlock).join('')}</td>`;
      }).join('');
      return `<table width="100%" cellpadding="0" cellspacing="${gap}" style="background-color:${row.style.backgroundColor};padding:${row.style.paddingTop}px ${row.style.paddingRight}px ${row.style.paddingBottom}px ${row.style.paddingLeft}px;border-collapse:separate;border-spacing:${gap}px;"><tr>${cellsHTML}</tr></table>`;
    };

    const mobileCSS = mobileStyles.length > 0 ? mobileStyles.join('\n    ') : '';

    return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Email</title>
<!--[if mso]><style>table{border-collapse:collapse;}</style><![endif]-->
<style>
  body{margin:0;padding:0;background-color:${globalStyle.backgroundColor};font-family:${globalStyle.fontFamily};}
  @media only screen and (max-width:620px){
    .email-container{width:100%!important;max-width:100%!important;}
    table td{display:block!important;width:100%!important;}
    ${mobileCSS}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${globalStyle.backgroundColor};">
<center>
<table role="presentation" class="email-container" width="${globalStyle.maxWidth}" cellpadding="0" cellspacing="0" style="margin:0 auto;max-width:${globalStyle.maxWidth}px;width:100%;">
<tr><td>
${rows.map(renderRow).join('\n')}
</td></tr>
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
      updateRowStyle, updateCellStyle, updateCellGap, updateGlobalStyle, getSelectedBlock, generateHTML,
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
