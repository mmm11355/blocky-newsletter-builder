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
// Функция получения иконки (Font Awesome через CDN или SVG)
const getSocialIconHtml = (network: string, customIconName: string | undefined, size: number, color: string, bgColor: string): string => {
  // Если указано кастомное имя иконки (например, "fa-brands fa-facebook")
  if (customIconName) {
    return `<i class="${customIconName}" style="font-size:${size * 0.6}px; color:${color}; width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center;"></i>`;
  }
  
  // Стандартные иконки (SVG)
  const icons: Record<string, string> = {
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size * 0.6}" height="${size * 0.6}"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size * 0.6}" height="${size * 0.6}"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12c0-3.402 2.76-6.162 6.162-6.162s6.162 2.76 6.162 6.162-2.76 6.162-6.162 6.162-6.162-2.76-6.162-6.162zM12 16c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm4.965-10.405c0 .796-.645 1.441-1.441 1.441-.795 0-1.44-.645-1.44-1.441 0-.795.645-1.44 1.44-1.44.796 0 1.441.645 1.441 1.44z"/></svg>`,
    twitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size * 0.6}" height="${size * 0.6}"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size * 0.6}" height="${size * 0.6}"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/></svg>`,
    youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size * 0.6}" height="${size * 0.6}"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    telegram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size * 0.6}" height="${size * 0.6}"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.03-1.98 1.26-5.59 3.69-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.05-.49-.82-.27-1.47-.41-1.41-.88.03-.24.36-.49 1.01-.75 3.96-1.72 6.6-2.86 7.93-3.42 3.77-1.6 4.56-1.88 5.07-1.89.11 0 .36.03.53.19.13.13.17.31.18.44.01.13-.01.28-.02.34z"/></svg>`,
    vk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size * 0.6}" height="${size * 0.6}"><path d="M21.579 6.855c.14-.465 0-.806-.662-.806h-2.193c-.558 0-.813.295-.953.62 0 0-1.115 2.719-2.695 4.482-.51.512-.742.674-1.021.674-.14 0-.341-.162-.341-.626V6.855c0-.558-.162-.806-.63-.806H9.597c-.349 0-.558.259-.558.506 0 .531.79.653.87 2.145v3.243c0 .71-.127.84-.407.84-.742 0-2.548-2.725-3.618-5.84-.21-.607-.42-.852-.982-.852H2.72c-.63 0-.76.295-.76.62 0 .582.743 3.462 3.46 7.271 1.812 2.601 4.363 4.011 6.687 4.011 1.393 0 1.565-.313 1.565-.852v-1.968c0-.628.135-.84.58-.84.33 0 .896.163 2.218 1.418 1.505 1.505 1.754 2.183 2.602 2.183h2.193c.63 0 .947-.313.765-.931-.199-.62-.915-1.52-1.864-2.587-.511-.6-1.277-1.245-1.509-1.567-.326-.419-.233-.607 0-.982 0 0 2.666-3.754 2.944-5.025z"/></svg>`,
  };
  return icons[network] || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size * 0.6}" height="${size * 0.6}"><circle cx="12" cy="12" r="10"/></svg>`;
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
                  style={{
                    display: 'inline-flex',
                    textDecoration: 'none',
                    backgroundColor: socialBlock.iconBgColor,
                    borderRadius: '50%',
                    width: socialBlock.iconSize,
                    height: socialBlock.iconSize,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={(e) => e.stopPropagation()}
                  dangerouslySetInnerHTML={{
                    __html: getSocialIcon(link.network, socialBlock.iconSize * 0.6, socialBlock.iconColor)
                  }}
                />
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
