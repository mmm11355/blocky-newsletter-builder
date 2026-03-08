import React, { createContext, useContext, useState, useCallback } from 'react';
import { EmailTemplate, EmailRow, EmailBlock, BlockType, ColumnLayout, createBlock, createRow, BlockStyle } from '@/types/email-builder';

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
  updateGlobalStyle: (style: Partial<EmailTemplate['globalStyle']>) => void;
  getSelectedBlock: () => { block: EmailBlock; rowId: string; cellIndex: number } | null;
  generateHTML: () => string;
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

  const updateGlobalStyle = useCallback((style: Partial<EmailTemplate['globalStyle']>) => {
    setTemplate(prev => ({ ...prev, globalStyle: { ...prev.globalStyle, ...style } }));
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
    const renderBlock = (block: EmailBlock) => {
      const s = block.style;
      const baseStyle = `color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};text-align:${s.textAlign};background-color:${s.backgroundColor};padding:${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px;border:${s.borderWidth}px solid ${s.borderColor};border-radius:${s.borderRadius}px;line-height:${s.lineHeight};`;
      switch (block.type) {
        case 'heading':
          return `<h1 style="${baseStyle}margin:0;font-family:${globalStyle.fontFamily};">${block.content}</h1>`;
        case 'text':
          return `<p style="${baseStyle}margin:0;font-family:${globalStyle.fontFamily};">${block.content}</p>`;
        case 'image':
          return `<div style="${baseStyle}"><img src="${block.src}" alt="${block.alt || ''}" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:${s.borderRadius}px;" /></div>`;
        case 'button':
          return `<div style="text-align:${s.textAlign};padding:${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px;"><a href="${block.href || '#'}" style="display:inline-block;background-color:${s.backgroundColor};color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};padding:12px 24px;border-radius:${s.borderRadius}px;text-decoration:none;font-family:${globalStyle.fontFamily};border:${s.borderWidth}px solid ${s.borderColor};">${block.content}</a></div>`;
      }
    };

    const renderRow = (row: EmailRow) => {
      const colWidth = Math.floor(100 / row.columns);
      const cellsHTML = row.cells.map(cell =>
        `<td style="width:${colWidth}%;vertical-align:top;padding:0;">${cell.map(renderBlock).join('')}</td>`
      ).join('');
      return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${row.style.backgroundColor};padding:${row.style.paddingTop}px ${row.style.paddingRight}px ${row.style.paddingBottom}px ${row.style.paddingLeft}px;"><tr>${cellsHTML}</tr></table>`;
    };

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
      updateRowStyle, updateGlobalStyle, getSelectedBlock, generateHTML,
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
