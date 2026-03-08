import React from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EmailBlock } from '@/types/email-builder';

interface Props {
  block: EmailBlock;
  rowId: string;
  cellIndex: number;
}

const CanvasBlock: React.FC<Props> = ({ block, rowId, cellIndex }) => {
  const { selection, setSelection } = useEmailBuilder();
  const isSelected = selection?.blockId === block.id;
  const s = block.style;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelection({ rowId, cellIndex, blockId: block.id });
  };

  const baseStyle: React.CSSProperties = {
    color: s.color,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight as any,
    textAlign: s.textAlign as any,
    backgroundColor: s.backgroundColor,
    padding: `${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px`,
    border: `${s.borderWidth}px solid ${s.borderColor}`,
    borderRadius: s.borderRadius,
    lineHeight: s.lineHeight,
    cursor: 'pointer',
    outline: isSelected ? '2px solid hsl(230, 80%, 56%)' : 'none',
    outlineOffset: '1px',
    transition: 'outline 0.15s',
  };

  const renderContent = () => {
    switch (block.type) {
      case 'heading':
        return <h1 style={{ ...baseStyle, margin: 0 }} onClick={handleClick}>{block.content}</h1>;
      case 'text':
        return <p style={{ ...baseStyle, margin: 0 }} onClick={handleClick}>{block.content}</p>;
      case 'image':
        return (
          <div style={baseStyle} onClick={handleClick}>
            <img src={block.src} alt={block.alt} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: s.borderRadius }} />
          </div>
        );
      case 'button':
        return (
          <div style={{ textAlign: s.textAlign as any, padding: `${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px` }} onClick={handleClick}>
            <span style={{
              display: 'inline-block',
              backgroundColor: s.backgroundColor,
              color: s.color,
              fontSize: s.fontSize,
              fontWeight: s.fontWeight as any,
              padding: '12px 24px',
              borderRadius: s.borderRadius,
              border: `${s.borderWidth}px solid ${s.borderColor}`,
              cursor: 'pointer',
              outline: isSelected ? '2px solid hsl(230, 80%, 56%)' : 'none',
              outlineOffset: '1px',
            }}>
              {block.content}
            </span>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
};

export default CanvasBlock;
