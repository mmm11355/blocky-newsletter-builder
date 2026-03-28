import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  EmailTemplate, EmailRow, EmailBlock, BlockType, ColumnLayout, 
  createBlock, createRow, BlockStyle, CellStyle, 
  SocialBlock, TestimonialBlock, SpeakerBlock, ContactBlock, LinksBlock 
} from '@/types/email-builder';

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

  // Функция для обработки маркеров форматирования
  const formatContent = (content: string) => {
    if (!content) return '';
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\{color:(#[0-9a-fA-F]{6})\}(.*?)\{\/color\}/g, '<span style="color: $1;">$2</span>');
    formatted = formatted.replace(/\{bgcolor:(#[0-9a-fA-F]{6})\}(.*?)\{\/bgcolor\}/g, '<span style="background-color: $1;">$2</span>');
    return formatted;
  };

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
        case 'heading': {
          const formattedContent = formatContent(block.content);
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
              <tr>
                <td>
                  <h1 style="${baseStyle}margin:0;mso-line-height-rule:exactly;">${formattedContent}</h1>
                </td>
              </tr>
            </table>`;
        }
        case 'text': {
          const formattedContent = formatContent(block.content);
          let finalContent = formattedContent;
          if (!finalContent.includes('<p>') && !finalContent.includes('<br')) {
            finalContent = finalContent
              .split(/\n/)
              .map(para => {
                const trimmed = para.trim();
                if (trimmed === '') return '<br>';
                return `<p style="margin: 0 0 12px 0;">${trimmed}</p>`;
              })
              .join('');
          }
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
              <tr>
                <td>
                  <div style="${baseStyle}margin:0;mso-line-height-rule:exactly;">${finalContent}</div>
                </td>
              </tr>
            </table>`;
        }
        case 'image': {
          const imgWidth = s.width && s.width !== '100%' ? s.width.replace('px', '').replace('%', '') : '100%';
          const imgTag = `<img src="${(block as any).src}" alt="${(block as any).alt || ''}" width="${imgWidth}" style="max-width:100%;height:auto;display:block;border:0;outline:none;border-radius:${s.borderRadius}px;${s.textAlign === 'center' ? 'margin:0 auto;' : ''}" />`;
          const wrapped = (block as any).href ? `<a href="${(block as any).href}" target="_blank" style="text-decoration:none;border:0;">${imgTag}</a>` : imgTag;
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
              <tr>
                <td style="padding:${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px;text-align:${s.textAlign};">${wrapped}</td>
              </tr>
            </table>`;
        }
        case 'button': {
          const btnAlign = s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'right' : 'left';
          const formattedContent = formatContent(block.content);
          const buttonWidth = s.width ? `width:${s.width};` : '';
          const buttonMargin = s.textAlign === 'center' ? 'margin:0 auto;' : s.textAlign === 'right' ? 'margin:0 0 0 auto;' : '';
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
              <tr>
                <td align="${btnAlign}" style="padding:4px 0;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${(block as any).href || '#'}" style="height:auto;v-text-anchor:middle;width:auto;" arcsize="${Math.round(s.borderRadius / 40 * 100)}%" strokecolor="${s.borderColor}" fillcolor="${s.backgroundColor}">
                    <w:anchorlock/>
                    <center style="color:${s.color};font-family:${s.fontFamily !== 'inherit' ? s.fontFamily : globalStyle.fontFamily};font-size:${s.fontSize}px;font-weight:${s.fontWeight};">${formattedContent}</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${(block as any).href || '#'}" target="_blank" style="display:inline-block;background-color:${s.backgroundColor};color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};padding:${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px;border-radius:${s.borderRadius}px;text-decoration:none;text-align:center;${fontFamilyStr}${borderStr}line-height:${s.lineHeight};${buttonWidth}${buttonMargin}">${formattedContent}</a>
                  <!--<![endif]-->
                </td>
              </tr>
            </table>`;
        }
        case 'list': {
          const bs = (block as any).bulletStyle || { type: 'disc', color: '#333333', size: 16, fontWeight: '400', customIcon: '', fontAwesomeIcon: '', offsetX: 0, offsetY: 0 };
          const bulletTdStyle = `color:${bs.color};font-size:${bs.size}px;font-weight:${bs.fontWeight};width:${bs.size + 12}px;padding-right:8px;vertical-align:top;text-align:left;`;
          const bulletContainerStyle = `display:inline-block;position:relative;left:${bs.offsetX}px;top:${bs.offsetY}px;line-height:1;`;
          const items = ((block as any).listItems || []).map((item: string, i: number) => {
            let bulletContent = '';
            if (bs.type === 'custom' && bs.fontAwesomeIcon) {
              bulletContent = `<i class="${bs.fontAwesomeIcon}" style="color:${bs.color}; font-size:${bs.size}px;"></i>`;
            } else if (bs.type === 'custom' && bs.customIcon) {
              bulletContent = `<img src="${bs.customIcon}" alt="" width="${bs.size}" height="${bs.size}" style="display:block;" />`;
            } else if (bs.type === 'check') {
              bulletContent = '✓';
            } else if (bs.type === 'number') {
              bulletContent = `${i + 1}.`;
            } else {
              bulletContent = '•';
            }
            return `<tr>
              <td style="${bulletTdStyle}"><span style="${bulletContainerStyle}">${bulletContent}</span></td>
              <td style="color:${s.color};font-size:${s.fontSize}px;line-height:${s.lineHeight};${fontFamilyStr}padding-bottom:${i < ((block as any).listItems?.length || 0) - 1 ? '8' : '0'}px;vertical-align:top;">${item}</td>
            </tr>`;
          }).join('');
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
              <tr>
                <td style="${baseStyle}">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${items}</table>
                </td>
              </tr>
            </table>`;
        }
        case 'menu': {
          const menuLayout = (block as any).menuLayout || 'horizontal';
          const isH = menuLayout === 'horizontal';
          const gap = (block as any).menuGap || 16;
          const btnAlign = s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'right' : 'left';
          const logoHtml = (block as any).menuLogoSrc
            ? `<td style="padding-right:${isH ? gap : 0}px;padding-bottom:${!isH ? gap : 0}px;">${(block as any).menuLogoHref
              ? `<a href="${(block as any).menuLogoHref}" target="_blank" style="text-decoration:none;border:0;"><img src="${(block as any).menuLogoSrc}" alt="Logo" width="${(block as any).menuLogoWidth || 120}" style="display:block;border:0;height:auto;" /></a>`
              : `<img src="${(block as any).menuLogoSrc}" alt="Logo" width="${(block as any).menuLogoWidth || 120}" style="display:block;border:0;height:auto;" />`}</td>`
            : '';
          const linksHtml = ((block as any).menuItems || []).map((item: any, i: number) =>
            `<td style="padding:${isH ? `0 ${i < ((block as any).menuItems?.length || 0) - 1 ? gap / 2 : 0}px 0 ${i > 0 ? gap / 2 : 0}px` : `${i > 0 ? gap / 2 : 0}px 0 ${i < ((block as any).menuItems?.length || 0) - 1 ? gap / 2 : 0}px 0`};"><a href="${item.href || '#'}" target="_blank" style="color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};text-decoration:none;white-space:nowrap;${fontFamilyStr}">${item.label}</a></td>`
          ).join('');
          if (isH) {
            return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
                <tr>
                  <td style="${baseStyle}" align="${btnAlign}">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>${logoHtml}${linksHtml}</tr>
                    </table>
                  </td>
                </tr>
              </table>`;
          } else {
            const allItems = [];
            if (logoHtml) allItems.push(`<tr>${logoHtml}</tr>`);
            ((block as any).menuItems || []).forEach((item: any, i: number) => {
              allItems.push(`<tr><td style="padding:${i > 0 ? gap / 2 : 0}px 0 ${i < ((block as any).menuItems?.length || 0) - 1 ? gap / 2 : 0}px 0;"><a href="${item.href || '#'}" target="_blank" style="color:${s.color};font-size:${s.fontSize}px;font-weight:${s.fontWeight};text-decoration:none;white-space:nowrap;${fontFamilyStr}">${item.label}</a></td></tr>`);
            });
            return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
                <tr>
                  <td style="${baseStyle}" align="${btnAlign}">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">${allItems.join('')}</table>
                  </td>
                </tr>
              </table>`;
          }
        }
        case 'social': {
          const socialBlock = block as SocialBlock;
          const iconSize = socialBlock.iconSize;
          const iconColor = socialBlock.iconColor;
          const iconBgColor = socialBlock.iconBgColor;
          const layout = socialBlock.layout;
          const gap = socialBlock.gap;
          
          const getIconHtml = (link: any) => {
            const color = link.iconColor || iconColor;
            const size = iconSize * 0.6;
            
            if (link.customIconUrl) {
              return `<img src="${link.customIconUrl}" width="${size}" height="${size}" style="display:block;" />`;
            }
            if (link.iconName) {
              return `<i class="${link.iconName}" style="font-size:${size}px; color:${color};"></i>`;
            }
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><circle cx="12" cy="12" r="10"/></svg>`;
          };
          
          const linksHtml = socialBlock.links.map(link => `
            <a href="${link.url}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; width:${iconSize}px; height:${iconSize}px; background-color:${link.bgColor || iconBgColor}; border-radius:50%; text-decoration:none;">
              ${getIconHtml(link)}
            </a>
          `).join('');
          
          const flexDirection = layout === 'horizontal' ? 'row' : 'column';
          
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
              <tr>
                <td style="${baseStyle}" align="${s.textAlign}">
                  <div style="display:flex; flex-direction:${flexDirection}; gap:${gap}px; justify-content:${s.textAlign}; align-items:center; flex-wrap:wrap;">
                    ${linksHtml}
                  </div>
                </td>
              </tr>
            </table>`;
        }
        case 'testimonial': {
          const tb = block as TestimonialBlock;
          const stars = '★'.repeat(tb.rating) + '☆'.repeat(5 - tb.rating);
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
              <tr>
                <td style="${baseStyle}">
                  <div style="display:flex; gap:12px; align-items:flex-start;">
                    ${tb.avatarUrl ? `<img src="${tb.avatarUrl}" width="48" height="48" style="border-radius:50%; object-fit:cover;" />` : ''}
                    <div>
                      <div style="color:#f59e0b; font-size:14px; margin-bottom:8px;">${stars}</div>
                      <p style="margin:0 0 12px 0; font-size:14px; font-style:italic;">«${tb.quote}»</p>
                      <p style="margin:0; font-weight:bold;">${tb.authorName}</p>
                      ${tb.authorTitle ? `<p style="margin:4px 0 0 0; font-size:12px; color:#6b7280;">${tb.authorTitle}</p>` : ''}
                    </div>
                  </div>
                </td>
              </tr>
            </table>`;
        }
        case 'speaker': {
          const sp = block as SpeakerBlock;
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
              <tr>
                <td style="${baseStyle}" align="center">
                  ${sp.photoUrl ? `<img src="${sp.photoUrl}" width="100" height="100" style="border-radius:50%; margin:0 auto 16px;" />` : ''}
                  <h3 style="margin:0 0 8px; font-size:20px; font-weight:bold;">${sp.name}</h3>
                  <p style="margin:0 0 4px; font-size:14px;">${sp.title}</p>
                  ${sp.company ? `<p style="margin:0 0 12px; font-size:12px;">${sp.company}</p>` : ''}
                  <p style="margin:0 0 16px; font-size:14px;">${sp.bio}</p>
                  <div style="display:flex; gap:12px; justify-content:center;">
                    ${(sp.socialLinks || []).map(link => `
                      <a href="${link.url}" target="_blank" style="color:inherit; text-decoration:none;">
                        ${link.iconName ? `<i class="${link.iconName}" style="font-size:18px;"></i>` : '•'}
                      </a>
                    `).join('')}
                  </div>
                </td>
              </tr>
            </table>`;
        }
        case 'contact': {
          const cb = block as ContactBlock;
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
              <tr>
                <td style="${baseStyle}">
                  <div style="display:flex; flex-direction:column; gap:12px;">
                    ${cb.email ? `<div>📧 <a href="mailto:${cb.email}" style="color:${s.color};">${cb.email}</a></div>` : ''}
                    ${cb.phone ? `<div>📞 <a href="tel:${cb.phone}" style="color:${s.color};">${cb.phone}</a></div>` : ''}
                    ${cb.address ? `<div>📍 ${cb.address}</div>` : ''}
                    ${cb.workHours ? `<div>🕒 ${cb.workHours}</div>` : ''}
                  </div>
                </td>
              </tr>
            </table>`;
        }
        case 'links': {
          const lb = block as LinksBlock;
          const isHorizontal = lb.layout === 'horizontal';
          const linksHtml = lb.links.map(link => `
            <a href="${link.url}" target="_blank" style="color:${s.color}; text-decoration:none; font-size:${s.fontSize}px;">${link.label}</a>
          `).join('');
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="${blockClass}" width="100%" style="${wrapStyle}">
              <tr>
                <td style="${baseStyle}" align="${s.textAlign}">
                  <div style="display:flex; flex-direction:${isHorizontal ? 'row' : 'column'}; gap:${lb.gap}px; justify-content:${s.textAlign}; align-items:center; flex-wrap:wrap;">
                    ${linksHtml}
                  </div>
                </td>
              </tr>
            </table>`;
        }
        default:
          return '';
      }
    };

    // Сборка мобильных стилей
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
      
      const stackClass = (row.mobileStack !== false && row.columns > 1) ? 'mobile-stack' : '';
      
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="${gap}" border="0" class="${stackClass}" style="background-color:${row.style.backgroundColor};padding:${row.style.paddingTop}px ${row.style.paddingRight}px ${row.style.paddingBottom}px ${row.style.paddingLeft}px;border-collapse:separate;border-spacing:${gap}px;">
        <tr>${cellsHTML}</tr>
      </table>`;
    };

    const mobileCSS = mobileStyles.length > 0 ? mobileStyles.join('\n    ') : '';

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
  
  /* Мобильные стили */
  @media only screen and (max-width: ${globalStyle.maxWidth + 20}px){
    .email-container{width:100%!important;max-width:100%!important;}
    .mobile-stack td{
      display:block!important;
      width:100%!important;
      box-sizing:border-box!important;
      margin-bottom:${(row: any) => row?.cellGap || 0}px!important;
    }
    ${mobileCSS}
  }
</style>
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v6.5.1/css/all.css">
</head>
<body id="body" style="margin:0;padding:0;background-color:${globalStyle.backgroundColor};word-spacing:normal;">
<div style="display:none;font-size:1px;color:${globalStyle.backgroundColor};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">&#8199;&#65279;&#847;</div>
<center style="width:100%;background-color:${globalStyle.backgroundColor};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${globalStyle.backgroundColor};">
   <tr>
    <td align="center" valign="top">
      <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="${globalStyle.maxWidth}" style="margin:0 auto;max-width:${globalStyle.maxWidth}px;width:100%;">
         <tr>
           <td>
            ${rows.map(renderRow).join('\n')}
           </td>
         </tr>
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
