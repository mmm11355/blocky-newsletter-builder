import React from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EmailBlock } from '@/types/email-builder';
import { GripVertical } from 'lucide-react';

interface Props {
  block: EmailBlock;
  rowId: string;
  cellIndex: number;
}

const CanvasBlock: React.FC<Props> = ({ block, rowId, cellIndex }) => {
  const { selection, setSelection, previewMode } = useEmailBuilder();
  const isSelected = selection?.blockId === block.id;
  const s = block.style;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelection({ rowId, cellIndex, blockId: block.id });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('moveBlock', JSON.stringify({ rowId, cellIndex, blockId: block.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const activeWidth = previewMode === 'mobile' ? (s.mobileWidth || '100%') : (s.width || '100%');

  const wrapperStyle: React.CSSProperties = {
    width: activeWidth,
    maxWidth: '100%',
    marginTop: s.marginTop || 0,
    marginRight: s.textAlign === 'center' ? 'auto' : s.textAlign === 'right' ? 0 : (s.marginRight || 0),
    marginBottom: s.marginBottom || 0,
    marginLeft: s.textAlign === 'center' ? 'auto' : s.textAlign === 'right' ? 'auto' : (s.marginLeft || 0),
    position: 'relative',
  };

  const baseStyle: React.CSSProperties = {
    color: s.color,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight as any,
    fontFamily: s.fontFamily !== 'inherit' ? s.fontFamily : undefined,
    textAlign: s.textAlign as any,
    backgroundColor: s.backgroundColor,
    padding: `${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px`,
    border: `${s.borderWidth}px solid ${s.borderColor}`,
    borderRadius: s.borderRadius,
    lineHeight: s.lineHeight,
    cursor: 'pointer',
    outline: isSelected ? '2px solid hsl(var(--primary))' : 'none',
    outlineOffset: '1px',
    transition: 'outline 0.15s',
  };

  const renderBullet = (index: number) => {
    const bs = block.bulletStyle;
    if (!bs) return null;
    const bulletContainerStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      position: 'relative',
      left: bs.offsetX,
      top: bs.offsetY,
      flexShrink: 0,
    };
    if (bs.type === 'custom' && bs.customIcon) {
      return <span style={bulletContainerStyle}><img src={bs.customIcon} alt="" style={{ width: bs.size, height: bs.size }} /></span>;
    }
    if (bs.type === 'check') {
      return <span style={{ ...bulletContainerStyle, color: bs.color, fontSize: bs.size, fontWeight: bs.fontWeight as any }}>✓</span>;
    }
    if (bs.type === 'number') {
      return <span style={{ ...bulletContainerStyle, color: bs.color, fontSize: bs.size, fontWeight: bs.fontWeight as any }}>{index + 1}.</span>;
    }
    return <span style={{ ...bulletContainerStyle, color: bs.color, fontSize: bs.size, fontWeight: bs.fontWeight as any }}>•</span>;
  };

  const renderContent = () => {
    switch (block.type) {
      case 'heading':
        return <h1 style={{ ...baseStyle, margin: 0 }} onClick={handleClick} dangerouslySetInnerHTML={{ __html: block.content }} />;
      case 'text':
        return <p style={{ ...baseStyle, margin: 0 }} onClick={handleClick} dangerouslySetInnerHTML={{ __html: block.content }} />;
      case 'image':
        return (
          <div style={baseStyle} onClick={handleClick}>
            <img src={block.src} alt={block.alt} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: s.borderRadius }} />
          </div>
        );
      case 'button':
        return (
          <div style={{ textAlign: s.textAlign as any }} onClick={handleClick}>
            <a style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              backgroundColor: s.backgroundColor,
              color: s.color,
              fontSize: s.fontSize,
              fontWeight: s.fontWeight as any,
              fontFamily: s.fontFamily !== 'inherit' ? s.fontFamily : undefined,
              padding: `${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px`,
              borderRadius: s.borderRadius,
              border: `${s.borderWidth}px solid ${s.borderColor}`,
              cursor: 'pointer',
              outline: isSelected ? '2px solid hsl(var(--primary))' : 'none',
              outlineOffset: '1px',
              textDecoration: 'none',
              textAlign: s.textAlign as any,
              lineHeight: s.lineHeight,
            }}>
              <span dangerouslySetInnerHTML={{ __html: block.content }} />
            </a>
          </div>
        );
      case 'list':
        return (
          <div style={{ ...baseStyle, margin: 0 }} onClick={handleClick}>
            {(block.listItems || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: i < (block.listItems?.length || 0) - 1 ? 6 : 0 }}>
                {renderBullet(i)}
                <span>{item}</span>
              </div>
            ))}
          </div>
        );
      case 'menu': {
        const layout = block.menuLayout || 'horizontal';
        const gap = block.menuGap || 16;
        const isHorizontal = layout === 'horizontal';
        return (
          <div style={{ ...baseStyle, margin: 0 }} onClick={handleClick}>
            <div style={{
              display: 'flex',
              flexDirection: isHorizontal ? 'row' : 'column',
              alignItems: isHorizontal ? 'center' : (s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'flex-end' : 'flex-start'),
              justifyContent: s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'flex-end' : 'flex-start',
              gap,
              flexWrap: 'wrap',
            }}>
              {block.menuLogoSrc && (
                <img src={block.menuLogoSrc} alt="Logo" style={{ width: block.menuLogoWidth || 120, height: 'auto', flexShrink: 0 }} />
              )}
              {(block.menuItems || []).map((item, i) => (
                <a key={i} style={{ color: s.color, fontSize: s.fontSize, fontWeight: s.fontWeight as any, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div style={wrapperStyle} className="group/block relative">
      <div
        draggable
        onDragStart={handleDragStart}
        className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/block:opacity-100 cursor-grab active:cursor-grabbing z-10 p-0.5 rounded bg-muted/80 text-muted-foreground hover:text-foreground transition-opacity"
        title="Перетащить"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      {renderContent()}
    </div>
  );
};

export default CanvasBlock;
