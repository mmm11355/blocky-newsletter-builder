import React from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EmailBlock, SocialBlock, TestimonialBlock, SpeakerBlock, SocialLink } from '@/types/email-builder';
import { GripVertical } from 'lucide-react';

interface Props {
  block: EmailBlock;
  rowId: string;
  cellIndex: number;
}

// Функция парсинга тегов форматирования в HTML
const parseContentToHtml = (content: string): string => {
  if (!content) return '';
  
  let html = content;
  
  // Жирный текст **текст**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Цвет текста {color:#ff0000}текст{/color}
  html = html.replace(/\{color:(#[0-9a-fA-F]{6})\}(.*?)\{\/color\}/g, '<span style="color: $1;">$2</span>');
  
  // Цвет фона {bgcolor:#ffff00}текст{/bgcolor}
  html = html.replace(/\{bgcolor:(#[0-9a-fA-F]{6})\}(.*?)\{\/bgcolor\}/g, '<span style="background-color: $1;">$2</span>');
  
  return html;
};

// Иконки для соцсетей
const getSocialIcon = (network: string, size: number): string => {
  const icons: Record<string, string> = {
    facebook: 'f',
    instagram: '📷',
    twitter: '🐦',
    linkedin: 'in',
    youtube: '▶',
    telegram: '✈',
    tiktok: '🎵',
    vk: 'vk',
    whatsapp: '💬',
  };
  return icons[network] || '•';
};

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
    direction: 'ltr',
  };

    const baseStyle: React.CSSProperties = {
    color: s.color,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight as any,
    fontFamily: s.fontFamily !== 'inherit' ? s.fontFamily : undefined,
    textAlign: s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'right' : 'left',
    backgroundColor: s.backgroundColor,
    padding: `${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px`,
    border: `${s.borderWidth}px solid ${s.borderColor}`,
    borderRadius: s.borderRadius,
    lineHeight: s.lineHeight,
    cursor: 'pointer',
    outline: isSelected ? '2px solid hsl(var(--primary))' : 'none',
    outlineOffset: '1px',
    transition: 'outline 0.15s',
    direction: 'ltr',
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
      direction: 'ltr',
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

  const parsedContent = parseContentToHtml(block.content);

  const renderContent = () => {
    switch (block.type) {
      case 'heading':
        return <h1 style={{ ...baseStyle, margin: 0, direction: 'ltr' }} onClick={handleClick} dangerouslySetInnerHTML={{ __html: parsedContent }} />;
      case 'text':
        return <div style={{ ...baseStyle, margin: 0, direction: 'ltr', whiteSpace: 'pre-wrap' }} onClick={handleClick} dangerouslySetInnerHTML={{ __html: parsedContent }} />;
      case 'image':
        return (
          <div style={baseStyle} onClick={handleClick}>
            <img src={block.src} alt={block.alt} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: s.borderRadius }} />
          </div>
        );
      case 'button':
        return (
          <div style={{ textAlign: s.textAlign as any, direction: 'ltr' }} onClick={handleClick}>
            <a style={{
              display: 'inline-block',
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
              textAlign: 'center',
              lineHeight: s.lineHeight,
              direction: 'ltr',
            }}>
              <span dangerouslySetInnerHTML={{ __html: parsedContent }} />
            </a>
          </div>
        );
      case 'list':
        return (
          <div style={{ ...baseStyle, margin: 0, direction: 'ltr' }} onClick={handleClick}>
            {(block.listItems || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: i < (block.listItems?.length || 0) - 1 ? 6 : 0, direction: 'ltr' }}>
                {renderBullet(i)}
                <span style={{ direction: 'ltr' }}>{item}</span>
              </div>
            ))}
          </div>
        );
      case 'menu': {
        const layout = block.menuLayout || 'horizontal';
        const gap = block.menuGap || 16;
        const isHorizontal = layout === 'horizontal';
        return (
          <div style={{ ...baseStyle, margin: 0, direction: 'ltr' }} onClick={handleClick}>
            <div style={{
              display: 'flex',
              flexDirection: isHorizontal ? 'row' : 'column',
              alignItems: isHorizontal ? 'center' : (s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'flex-end' : 'flex-start'),
              justifyContent: s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'flex-end' : 'flex-start',
              gap,
              flexWrap: 'wrap',
              direction: 'ltr',
            }}>
              {block.menuLogoSrc && (
                <img src={block.menuLogoSrc} alt="Logo" style={{ width: block.menuLogoWidth || 120, height: 'auto', flexShrink: 0 }} />
              )}
              {(block.menuItems || []).map((item, i) => (
                <a key={i} style={{ color: s.color, fontSize: s.fontSize, fontWeight: s.fontWeight as any, textDecoration: 'none', whiteSpace: 'nowrap', direction: 'ltr' }}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        );
      }
      case 'social': {
        const socialBlock = block as SocialBlock;
        const iconStyle: React.CSSProperties = {
          width: socialBlock.iconSize,
          height: socialBlock.iconSize,
          backgroundColor: socialBlock.iconBgColor,
          color: socialBlock.iconColor,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          fontSize: socialBlock.iconSize * 0.5,
          fontWeight: 'bold',
          transition: 'opacity 0.2s',
        };
        return (
          <div style={{ ...baseStyle, margin: 0, direction: 'ltr' }} onClick={handleClick}>
            <div style={{
              display: 'flex',
              flexDirection: socialBlock.layout === 'horizontal' ? 'row' : 'column',
              gap: socialBlock.gap,
              justifyContent: s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'flex-end' : 'flex-start',
              alignItems: 'center',
              flexWrap: 'wrap',
              direction: 'ltr',
            }}>
              {socialBlock.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={iconStyle}
                  onClick={(e) => e.stopPropagation()}
                >
                  {getSocialIcon(link.network, socialBlock.iconSize)}
                </a>
              ))}
            </div>
          </div>
        );
      }
      case 'testimonial': {
        const tb = block as TestimonialBlock;
        const stars = '★'.repeat(tb.rating) + '☆'.repeat(5 - tb.rating);
        return (
          <div style={{ ...baseStyle, margin: 0, direction: 'ltr' }} onClick={handleClick}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', direction: 'ltr' }}>
              {tb.avatarUrl && (
                <img src={tb.avatarUrl} alt={tb.authorName} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, direction: 'ltr' }}>
                <div style={{ color: '#f59e0b', fontSize: 14, marginBottom: 8 }}>{stars}</div>
                <p style={{ margin: '0 0 12px 0', fontSize: 14, lineHeight: 1.5, fontStyle: 'italic' }}>«{tb.quote}»</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{tb.authorName}</p>
                {tb.authorTitle && <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6b7280' }}>{tb.authorTitle}</p>}
              </div>
            </div>
          </div>
        );
      }
      case 'speaker': {
        const sp = block as SpeakerBlock;
        return (
          <div style={{ ...baseStyle, margin: 0, direction: 'ltr', textAlign: 'center' }} onClick={handleClick}>
            {sp.photoUrl && (
              <img src={sp.photoUrl} alt={sp.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.5)' }} />
            )}
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 'bold' }}>{sp.name}</h3>
            <p style={{ margin: '0 0 4px', fontSize: 14, opacity: 0.9 }}>{sp.title}</p>
            {sp.company && <p style={{ margin: '0 0 12px', fontSize: 12, opacity: 0.8 }}>{sp.company}</p>}
            <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.5 }}>{sp.bio}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', direction: 'ltr' }}>
              {sp.socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'white', textDecoration: 'none', fontSize: 18 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {getSocialIcon(link.network, 18)}
                </a>
              ))}
            </div>
          </div>
        );
      }
      default:
        return null;
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
