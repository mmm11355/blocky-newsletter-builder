import { useRef, useCallback, useState } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EMAIL_FONTS, BulletType, MenuItem, MenuLayout } from '@/types/email-builder';
import { Trash2, ArrowUp, ArrowDown, Settings2, Upload, ClipboardPaste, Link, Plus, X, Bold, Palette, Highlighter } from 'lucide-react';

const PropertyPanel = () => {
  const { getSelectedBlock, updateBlock, updateBlockStyle, deleteBlock, moveBlock, selection, template, updateCellStyle, updateCellGap, updateRowMobileStack, updateGlobalStyle } = useEmailBuilder();
  const selected = getSelectedBlock();

  if (!selected || !selection) {
    return (
      <div className="w-[400px] bg-card border-l border-border p-6 h-full overflow-y-auto scrollbar-thin flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">Выберите элемент<br/>для редактирования</p>
      </div>
    );
  }

  const { block, rowId, cellIndex } = selected;
  const s = block.style;
  const row = template.rows.find(r => r.id === rowId);
  const cellStyle = row?.cellStyles?.[cellIndex] || { backgroundColor: 'transparent', borderRadius: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 };

  const upd = (style: Record<string, any>) => updateBlockStyle(rowId, cellIndex, block.id, style);
  const updBlock = (updates: Record<string, any>) => updateBlock(rowId, cellIndex, block.id, updates);

  const typeLabels: Record<string, string> = { 
    heading: 'Заголовок', text: 'Текст', image: 'Изображение', button: 'Кнопка', 
    list: 'Список', menu: 'Меню', social: 'Соцсети', testimonial: 'Отзыв', 
    speaker: 'Спикер', contact: 'Контакты', links: 'Ссылки' 
  };

  const stripHtml = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const [textValue, setTextValue] = useState(() => stripHtml(block.content));
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [selectedBgColor, setSelectedBgColor] = useState('#ffff00');

  const updateText = (newText: string) => {
    setTextValue(newText);
    updBlock({ content: newText });
  };

  const wrapText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = textValue.substring(start, end);
    if (!selected) return;
    const newText = textValue.substring(0, start) + before + selected + after + textValue.substring(end);
    updateText(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + before.length, end + before.length);
      }
    }, 0);
  };

  const applyColor = (color: string) => {
    wrapText(`{color:${color}}`, '{/color}');
    setShowColorPicker(false);
  };

  const applyBgColor = (color: string) => {
    wrapText(`{bgcolor:${color}}`, '{/bgcolor}');
    setShowBgColorPicker(false);
  };

  return (
    <div className="w-[400px] bg-card border-l border-border h-full overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full gradient-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">{typeLabels[block.type] || block.type}</h3>
        </div>
        <div className="flex gap-0.5">
          <button onClick={() => moveBlock(rowId, cellIndex, block.id, 'up')} className="p-1.5 rounded-md hover:bg-secondary"><ArrowUp className="h-3.5 w-3.5" /></button>
          <button onClick={() => moveBlock(rowId, cellIndex, block.id, 'down')} className="p-1.5 rounded-md hover:bg-secondary"><ArrowDown className="h-3.5 w-3.5" /></button>
          <button onClick={() => deleteBlock(rowId, cellIndex, block.id)} className="p-1.5 rounded-md hover:bg-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Content */}
        {(block.type === 'heading' || block.type === 'text' || block.type === 'button') && (
          <Field label="Контент">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-input flex-wrap">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); wrapText('**', '**'); }} className="p-1.5 rounded hover:bg-secondary"><Bold className="h-3.5 w-3.5" /></button>
                <div className="relative">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); }} className="p-1.5 rounded hover:bg-secondary"><Palette className="h-3.5 w-3.5" /></button>
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 z-20 p-2 rounded-lg bg-card border border-border shadow-lg">
                      <input type="color" value={selectedColor} onChange={(e) => { setSelectedColor(e.target.value); applyColor(e.target.value); }} className="w-8 h-8 cursor-pointer border-0" />
                      <div className="flex gap-1 mt-2">
                        {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff'].map(c => (
                          <button key={c} onClick={() => applyColor(c)} className="w-5 h-5 rounded border border-border" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); setShowBgColorPicker(!showBgColorPicker); }} className="p-1.5 rounded hover:bg-secondary"><Highlighter className="h-3.5 w-3.5" /></button>
                  {showBgColorPicker && (
                    <div className="absolute top-full left-0 mt-1 z-20 p-2 rounded-lg bg-card border border-border shadow-lg">
                      <input type="color" value={selectedBgColor} onChange={(e) => { setSelectedBgColor(e.target.value); applyBgColor(e.target.value); }} className="w-8 h-8 cursor-pointer border-0" />
                      <div className="flex gap-1 mt-2">
                        {['#ffff00', '#ffcc00', '#ff9900', '#ff6600', '#ff3300', '#00ff00', '#00ccff', '#ff00ff'].map(c => (
                          <button key={c} onClick={() => applyBgColor(c)} className="w-5 h-5 rounded border border-border" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {block.type === 'text' ? (
                <textarea ref={textareaRef as any} value={textValue} onChange={(e) => updateText(e.target.value)} rows={8} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
              ) : (
                <input ref={textareaRef as any} type="text" value={textValue} onChange={(e) => updateText(e.target.value)} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
              )}
            </div>
          </Field>
        )}

        {/* ==================== LIST BLOCK ==================== */}
        {block.type === 'list' && (
          <ListFields
            items={block.listItems || []}
            bulletStyle={block.bulletStyle || { type: 'disc', color: '#333333', size: 16, fontWeight: '400', customIcon: '', fontAwesomeIcon: '', offsetX: 0, offsetY: 0 }}
            onUpdateItems={(listItems) => updBlock({ listItems })}
            onUpdateBullet={(bulletStyle) => updBlock({ bulletStyle })}
          />
        )}

        {/* ==================== MENU BLOCK ==================== */}
        {block.type === 'menu' && (
          <MenuFields
            items={block.menuItems || []}
            layout={block.menuLayout || 'horizontal'}
            logoSrc={block.menuLogoSrc || ''}
            logoWidth={block.menuLogoWidth || 120}
            logoHref={block.menuLogoHref || '#'}
            gap={block.menuGap || 16}
            onUpdate={updBlock}
          />
        )}

        {/* ==================== IMAGE BLOCK ==================== */}
        {block.type === 'image' && (
          <ImageFields src={block.src || ''} alt={block.alt || ''} href={block.href || ''} onUpdate={updBlock} />
        )}

        {/* ==================== BUTTON BLOCK ==================== */}
        {block.type === 'button' && (
          <Field label="Ссылка (href)">
            <input type="text" value={block.href || ''} onChange={(e) => updBlock({ href: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
          </Field>
        )}

        {/* ==================== SOCIAL BLOCK ==================== */}
        {block.type === 'social' && (
          <>
            <Section title="Социальные сети">
              <div className="space-y-3">
                {(block.links || []).map((link: any, i: number) => (
                  <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="flex items-center gap-2">
                      <select
                        value={link.network}
                        onChange={(e) => {
                          const newLinks = [...block.links];
                          newLinks[i] = { ...newLinks[i], network: e.target.value };
                          updBlock({ links: newLinks });
                        }}
                        className="flex-1 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">Twitter (X)</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="youtube">YouTube</option>
                        <option value="telegram">Telegram</option>
                        <option value="vk">VK (ВКонтакте)</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="tenchat">TenChat</option>
                        <option value="dzen">Дзен</option>
                        <option value="rutube">Rutube</option>
                        <option value="setka">Сетка</option>
                        <option value="custom">Своя иконка</option>
                      </select>
                      <button onClick={() => {
                        const newLinks = block.links.filter((_: any, idx: number) => idx !== i);
                        updBlock({ links: newLinks });
                      }} className="p-1.5 rounded hover:bg-destructive"><X className="h-4 w-4" /></button>
                    </div>
                    <input type="text" value={link.url} onChange={(e) => {
                      const newLinks = [...block.links];
                      newLinks[i] = { ...newLinks[i], url: e.target.value };
                      updBlock({ links: newLinks });
                    }} placeholder="https://" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
                    
                    {link.network === 'custom' && (
                      <div className="space-y-2">
                        <Field label="Font Awesome класс" compact>
                          <input type="text" value={link.iconName || ''} onChange={(e) => {
                            const newLinks = [...block.links];
                            newLinks[i] = { ...newLinks[i], iconName: e.target.value };
                            updBlock({ links: newLinks });
                          }} placeholder="fa-brands fa-custom" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
                        </Field>
                        <Field label="Или URL своей иконки" compact>
                          <input type="text" value={link.customIconUrl || ''} onChange={(e) => {
                            const newLinks = [...block.links];
                            newLinks[i] = { ...newLinks[i], customIconUrl: e.target.value };
                            updBlock({ links: newLinks });
                          }} placeholder="https://example.com/icon.svg" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
                        </Field>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Field label="Цвет иконки" compact>
                        <input type="color" value={link.iconColor || block.iconColor} onChange={(e) => {
                          const newLinks = [...block.links];
                          newLinks[i] = { ...newLinks[i], iconColor: e.target.value };
                          updBlock({ links: newLinks });
                        }} className="w-full h-8 rounded border cursor-pointer" />
                      </Field>
                      <Field label="Цвет фона" compact>
                        <input type="color" value={link.bgColor || block.iconBgColor} onChange={(e) => {
                          const newLinks = [...block.links];
                          newLinks[i] = { ...newLinks[i], bgColor: e.target.value };
                          updBlock({ links: newLinks });
                        }} className="w-full h-8 rounded border cursor-pointer" />
                      </Field>
                    </div>
                  </div>
                ))}
                <button onClick={() => updBlock({ links: [...(block.links || []), { network: 'facebook', url: '#', iconName: '', customIconUrl: '', iconColor: block.iconColor, bgColor: block.iconBgColor }] })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-sm">
                  <Plus className="h-3.5 w-3.5" /> Добавить соцсеть
                </button>
              </div>
            </Section>
            <Section title="Глобальное оформление">
              <Field label="Размер иконок" compact>
                <div className="flex items-center gap-2">
                  <input type="range" min={24} max={56} value={block.iconSize} onChange={(e) => updBlock({ iconSize: +e.target.value })} className="flex-1" />
                  <span className="text-xs w-12">{block.iconSize}px</span>
                </div>
              </Field>
              <Field label="Цвет иконок (по умолчанию)" compact>
                <input type="color" value={block.iconColor} onChange={(e) => updBlock({ iconColor: e.target.value })} className="w-full h-8 rounded border" />
              </Field>
              <Field label="Цвет фона (по умолчанию)" compact>
                <input type="color" value={block.iconBgColor} onChange={(e) => updBlock({ iconBgColor: e.target.value })} className="w-full h-8 rounded border" />
              </Field>
              <Field label="Расположение" compact>
                <div className="flex gap-1">
                  <button onClick={() => updBlock({ layout: 'horizontal' })} className={`flex-1 py-1.5 text-xs rounded ${block.layout === 'horizontal' ? 'bg-primary text-white' : 'bg-secondary'}`}>Горизонтально</button>
                  <button onClick={() => updBlock({ layout: 'vertical' })} className={`flex-1 py-1.5 text-xs rounded ${block.layout === 'vertical' ? 'bg-primary text-white' : 'bg-secondary'}`}>Вертикально</button>
                </div>
              </Field>
              <Field label="Отступ" compact>
                <input type="number" value={block.gap} onChange={(e) => updBlock({ gap: +e.target.value })} className="w-full rounded border px-2 py-1.5 text-sm" />
              </Field>
            </Section>
          </>
        )}

        {/* ==================== TESTIMONIAL BLOCK ==================== */}
        {block.type === 'testimonial' && (
          <>
            <Field label="Текст отзыва">
              <textarea rows={4} value={block.quote} onChange={(e) => updBlock({ quote: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Имя автора">
              <input type="text" value={block.authorName} onChange={(e) => updBlock({ authorName: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Должность / Компания">
              <input type="text" value={block.authorTitle} onChange={(e) => updBlock({ authorTitle: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Фото (URL)">
              <input type="text" value={block.avatarUrl} onChange={(e) => updBlock({ avatarUrl: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Рейтинг">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => updBlock({ rating: star })} className={`w-8 h-8 rounded text-xl ${block.rating >= star ? 'text-yellow-500' : 'text-gray-500'}`}>★</button>
                ))}
              </div>
            </Field>
          </>
        )}

        {/* ==================== SPEAKER BLOCK ==================== */}
        {block.type === 'speaker' && (
          <>
            <Field label="Имя спикера">
              <input type="text" value={block.name} onChange={(e) => updBlock({ name: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Должность">
              <input type="text" value={block.title} onChange={(e) => updBlock({ title: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Компания">
              <input type="text" value={block.company} onChange={(e) => updBlock({ company: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Фото (URL)">
              <input type="text" value={block.photoUrl} onChange={(e) => updBlock({ photoUrl: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Биография">
              <textarea rows={3} value={block.bio} onChange={(e) => updBlock({ bio: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Section title="Социальные сети спикера">
              <div className="space-y-2">
                {(block.socialLinks || []).map((link: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                    <select value={link.network} onChange={(e) => {
                      const newLinks = [...(block.socialLinks || [])];
                      newLinks[i] = { ...newLinks[i], network: e.target.value };
                      updBlock({ socialLinks: newLinks });
                    }} className="flex-1 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm">
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                    </select>
                    <input type="text" value={link.url} onChange={(e) => {
                      const newLinks = [...(block.socialLinks || [])];
                      newLinks[i] = { ...newLinks[i], url: e.target.value };
                      updBlock({ socialLinks: newLinks });
                    }} placeholder="https://" className="flex-1 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
                    <button onClick={() => {
                      const newLinks = (block.socialLinks || []).filter((_: any, idx: number) => idx !== i);
                      updBlock({ socialLinks: newLinks });
                    }} className="p-1.5 rounded hover:bg-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={() => updBlock({ socialLinks: [...(block.socialLinks || []), { network: 'linkedin', url: '#' }] })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-sm">
                  <Plus className="h-3.5 w-3.5" /> Добавить соцсеть
                </button>
              </div>
            </Section>
          </>
        )}

        {/* ==================== CONTACT BLOCK ==================== */}
        {block.type === 'contact' && (
          <>
            <Field label="Email">
              <input type="email" value={block.email || ''} onChange={(e) => updBlock({ email: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Телефон">
              <input type="tel" value={block.phone || ''} onChange={(e) => updBlock({ phone: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Адрес">
              <input type="text" value={block.address || ''} onChange={(e) => updBlock({ address: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
            <Field label="Часы работы">
              <input type="text" value={block.workHours || ''} onChange={(e) => updBlock({ workHours: e.target.value })} placeholder="Пн-Пт: 9:00-18:00" className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
            </Field>
          </>
        )}

        {/* ==================== LINKS BLOCK ==================== */}
        {block.type === 'links' && (
          <>
            <Section title="Ссылки">
              <div className="space-y-2">
                {(block.links || []).map((link: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                    <input type="text" value={link.label} onChange={(e) => {
                      const newLinks = [...block.links];
                      newLinks[i] = { ...newLinks[i], label: e.target.value };
                      updBlock({ links: newLinks });
                    }} placeholder="Название" className="flex-1 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
                    <input type="text" value={link.url} onChange={(e) => {
                      const newLinks = [...block.links];
                      newLinks[i] = { ...newLinks[i], url: e.target.value };
                      updBlock({ links: newLinks });
                    }} placeholder="https://" className="flex-1 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
                    <button onClick={() => {
                      const newLinks = block.links.filter((_: any, idx: number) => idx !== i);
                      updBlock({ links: newLinks });
                    }} className="p-1.5 rounded hover:bg-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={() => updBlock({ links: [...(block.links || []), { label: 'Новая ссылка', url: '#' }] })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-sm">
                  <Plus className="h-3.5 w-3.5" /> Добавить ссылку
                </button>
              </div>
            </Section>
            <Section title="Оформление">
              <Field label="Расположение" compact>
                <div className="flex gap-1">
                  <button onClick={() => updBlock({ layout: 'horizontal' })} className={`flex-1 py-1.5 text-xs rounded ${block.layout === 'horizontal' ? 'bg-primary text-white' : 'bg-secondary'}`}>Горизонтально</button>
                  <button onClick={() => updBlock({ layout: 'vertical' })} className={`flex-1 py-1.5 text-xs rounded ${block.layout === 'vertical' ? 'bg-primary text-white' : 'bg-secondary'}`}>Вертикально</button>
                </div>
              </Field>
              <Field label="Отступ" compact>
                <input type="number" value={block.gap} onChange={(e) => updBlock({ gap: +e.target.value })} className="w-full rounded border px-2 py-1.5 text-sm" />
              </Field>
            </Section>
          </>
        )}

        {/* ==================== COLUMN STYLES ==================== */}
        {row && row.columns > 1 && (
          <Section title={`Колонка ${(cellIndex || 0) + 1}`}>
            <Field label="Фон колонки" compact>
              <div className="relative">
                <input type="color" value={cellStyle.backgroundColor === 'transparent' ? '#ffffff' : cellStyle.backgroundColor} onChange={(e) => updateCellStyle(rowId, cellIndex, { backgroundColor: e.target.value })} className="w-full h-9 rounded-lg border border-input cursor-pointer opacity-0 absolute inset-0" />
                <div className="w-full h-9 rounded-lg border border-input flex items-center gap-2 px-2">
                  <div className="w-5 h-5 rounded-md border border-border" style={{ backgroundColor: cellStyle.backgroundColor === 'transparent' ? '#ffffff' : cellStyle.backgroundColor }} />
                  <span className="text-xs text-muted-foreground font-mono">{cellStyle.backgroundColor === 'transparent' ? 'прозрачный' : cellStyle.backgroundColor}</span>
                  {cellStyle.backgroundColor !== 'transparent' && (
                    <button onClick={() => updateCellStyle(rowId, cellIndex, { backgroundColor: 'transparent' })} className="ml-auto text-[10px] text-muted-foreground hover:text-foreground">✕</button>
                  )}
                </div>
              </div>
            </Field>
            <Field label="Закругление" compact>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={40} value={cellStyle.borderRadius || 0} onChange={(e) => updateCellStyle(rowId, cellIndex, { borderRadius: +e.target.value })} className="flex-1 h-2 accent-primary" />
                <span className="text-xs w-12">{cellStyle.borderRadius || 0}px</span>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              {([['paddingTop', '↑ Верх'], ['paddingRight', '→ Право'], ['paddingBottom', '↓ Низ'], ['paddingLeft', '← Лево']] as const).map(([key, label]) => (
                <Field key={key} label={label} compact>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateCellStyle(rowId, cellIndex, { [key]: Math.max(0, (cellStyle as any)[key] - 5) })} className="w-6 h-6 rounded bg-secondary">-</button>
                    <input type="number" value={(cellStyle as any)[key] || 0} onChange={(e) => updateCellStyle(rowId, cellIndex, { [key]: +e.target.value })} className="w-16 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-center" />
                    <button onClick={() => updateCellStyle(rowId, cellIndex, { [key]: ((cellStyle as any)[key] || 0) + 5 })} className="w-6 h-6 rounded bg-secondary">+</button>
                  </div>
                </Field>
              ))}
            </div>
          </Section>
        )}

        {/* ==================== ROW STYLES ==================== */}
        {row && (
          <Section title="Строка">
            <Field label="Мобильная версия" compact>
              <div className="flex gap-1">
                <button onClick={() => updateRowMobileStack(rowId, true)} className={`flex-1 py-1.5 text-xs rounded ${row.mobileStack !== false ? 'bg-primary text-white' : 'bg-secondary'}`}>В 1 колонку</button>
                <button onClick={() => updateRowMobileStack(rowId, false)} className={`flex-1 py-1.5 text-xs rounded ${row.mobileStack === false ? 'bg-primary text-white' : 'bg-secondary'}`}>Оставить колонки</button>
              </div>
            </Field>
            <Field label="Отступ между колонками" compact>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={40} value={row.cellGap || 0} onChange={(e) => updateCellGap(rowId, +e.target.value)} className="flex-1 h-2 accent-primary" />
                <span className="text-xs w-12">{row.cellGap || 0}px</span>
              </div>
            </Field>
            <Field label="Фон строки" compact>
              <div className="relative">
                <input type="color" value={row.style.backgroundColor === 'transparent' ? '#ffffff' : row.style.backgroundColor} onChange={(e) => updateRowStyle(rowId, { backgroundColor: e.target.value })} className="w-full h-9 rounded-lg border border-input cursor-pointer opacity-0 absolute inset-0" />
                <div className="w-full h-9 rounded-lg border border-input flex items-center gap-2 px-2">
                  <div className="w-5 h-5 rounded-md border border-border" style={{ backgroundColor: row.style.backgroundColor === 'transparent' ? '#ffffff' : row.style.backgroundColor }} />
                  <span className="text-xs text-muted-foreground font-mono">{row.style.backgroundColor === 'transparent' ? 'прозрачный' : row.style.backgroundColor}</span>
                </div>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              {([['paddingTop', '↑ Верх'], ['paddingRight', '→ Право'], ['paddingBottom', '↓ Низ'], ['paddingLeft', '← Лево']] as const).map(([key, label]) => (
                <Field key={key} label={label} compact>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateRowStyle(rowId, { [key]: Math.max(0, (row.style as any)[key] - 5) })} className="w-6 h-6 rounded bg-secondary">-</button>
                    <input type="number" value={(row.style as any)[key] || 0} onChange={(e) => updateRowStyle(rowId, { [key]: +e.target.value })} className="w-16 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-center" />
                    <button onClick={() => updateRowStyle(rowId, { [key]: ((row.style as any)[key] || 0) + 5 })} className="w-6 h-6 rounded bg-secondary">+</button>
                  </div>
                </Field>
              ))}
            </div>
          </Section>
        )}

        {/* ==================== GLOBAL STYLES ==================== */}
        <Section title="Глобальные настройки">
          <Field label="Фон письма" compact>
            <div className="relative">
              <input type="color" value={template.globalStyle.backgroundColor} onChange={(e) => updateGlobalStyle({ backgroundColor: e.target.value })} className="w-full h-9 rounded-lg border border-input cursor-pointer opacity-0 absolute inset-0" />
              <div className="w-full h-9 rounded-lg border border-input flex items-center gap-2 px-2">
                <div className="w-5 h-5 rounded-md border border-border" style={{ backgroundColor: template.globalStyle.backgroundColor }} />
                <span className="text-xs text-muted-foreground font-mono">{template.globalStyle.backgroundColor}</span>
              </div>
            </div>
          </Field>
          <Field label="Максимальная ширина" compact>
            <div className="flex items-center gap-2">
              <input type="range" min={320} max={800} step={10} value={template.globalStyle.maxWidth} onChange={(e) => updateGlobalStyle({ maxWidth: +e.target.value })} className="flex-1 h-2 accent-primary" />
              <span className="text-xs w-12">{template.globalStyle.maxWidth}px</span>
            </div>
          </Field>
        </Section>

        {/* ==================== COMMON BLOCK STYLES ==================== */}
        {(block.type === 'heading' || block.type === 'text' || block.type === 'button' || block.type === 'social' || block.type === 'testimonial' || block.type === 'speaker' || block.type === 'contact' || block.type === 'links') && (
          <Section title="Шрифт">
            <Field label="Семейство шрифта" compact>
              <select value={s.fontFamily} onChange={(e) => upd({ fontFamily: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm">
                {EMAIL_FONTS.map(f => (<option key={f.value} value={f.value}>{f.label}</option>))}
              </select>
            </Field>
          </Section>
        )}

        <Section title="Типографика">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Размер" compact>
              <div className="flex items-center gap-1">
                <button onClick={() => upd({ fontSize: Math.max(8, (s.fontSize || 16) - 2) })} className="w-6 h-6 rounded bg-secondary">-</button>
                <input type="range" min={8} max={72} value={s.fontSize} onChange={(e) => upd({ fontSize: +e.target.value })} className="flex-1 h-2 accent-primary" />
                <button onClick={() => upd({ fontSize: Math.min(72, (s.fontSize || 16) + 2) })} className="w-6 h-6 rounded bg-secondary">+</button>
                <input type="number" value={s.fontSize} onChange={(e) => upd({ fontSize: +e.target.value })} className="w-14 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-center" />
              </div>
            </Field>
            <Field label="Высота строки" compact>
              <div className="flex items-center gap-1">
                <button onClick={() => upd({ lineHeight: Math.max(0.8, (s.lineHeight || 1.5) - 0.1) })} className="w-6 h-6 rounded bg-secondary">-</button>
                <input type="range" min={0.8} max={2.5} step={0.1} value={s.lineHeight} onChange={(e) => upd({ lineHeight: +e.target.value })} className="flex-1 h-2 accent-primary" />
                <button onClick={() => upd({ lineHeight: Math.min(2.5, (s.lineHeight || 1.5) + 0.1) })} className="w-6 h-6 rounded bg-secondary">+</button>
                <input type="number" step={0.1} value={s.lineHeight} onChange={(e) => upd({ lineHeight: +e.target.value })} className="w-14 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-center" />
              </div>
            </Field>
          </div>
          <Field label="Жирность" compact>
            <select value={s.fontWeight} onChange={(e) => upd({ fontWeight: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm">
              <option value="400">Обычный</option>
              <option value="500">Средний</option>
              <option value="600">Полужирный</option>
              <option value="700">Жирный</option>
            </select>
          </Field>
          <Field label="Выравнивание" compact>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(a => (
                <button key={a} onClick={() => upd({ textAlign: a })} className={`flex-1 py-1.5 text-xs rounded ${s.textAlign === a ? 'bg-primary text-white' : 'bg-secondary'}`}>
                  {a === 'left' ? 'Лево' : a === 'center' ? 'Центр' : 'Право'}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        <Section title="Цвета">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Текст" compact>
              <input type="color" value={s.color} onChange={(e) => upd({ color: e.target.value })} className="w-full h-9 rounded border border-input cursor-pointer" />
            </Field>
            <Field label="Фон блока" compact>
              <input type="color" value={s.backgroundColor === 'transparent' ? '#ffffff' : s.backgroundColor} onChange={(e) => upd({ backgroundColor: e.target.value })} className="w-full h-9 rounded border border-input cursor-pointer" />
            </Field>
          </div>
        </Section>

        <Section title="Размер блока">
          <Field label="Ширина (десктоп)" compact>
            <div className="flex items-center gap-2">
              <button onClick={() => upd({ width: `${Math.max(10, (parseInt(s.width) || 100) - 5)}%` })} className="w-6 h-6 rounded bg-secondary">-</button>
              <input type="range" min={10} max={100} value={parseInt(s.width) || 100} onChange={(e) => upd({ width: `${e.target.value}%` })} className="flex-1 h-2 accent-primary" />
              <button onClick={() => upd({ width: `${Math.min(100, (parseInt(s.width) || 100) + 5)}%` })} className="w-6 h-6 rounded bg-secondary">+</button>
              <span className="text-xs w-10 text-right">{s.width || '100%'}</span>
            </div>
          </Field>
          <Field label="Ширина (мобильная)" compact>
            <div className="flex items-center gap-2">
              <button onClick={() => upd({ mobileWidth: `${Math.max(10, (parseInt(s.mobileWidth) || 100) - 5)}%` })} className="w-6 h-6 rounded bg-secondary">-</button>
              <input type="range" min={10} max={100} value={parseInt(s.mobileWidth) || 100} onChange={(e) => upd({ mobileWidth: `${e.target.value}%` })} className="flex-1 h-2 accent-primary" />
              <button onClick={() => upd({ mobileWidth: `${Math.min(100, (parseInt(s.mobileWidth) || 100) + 5)}%` })} className="w-6 h-6 rounded bg-secondary">+</button>
              <span className="text-xs w-10 text-right">{s.mobileWidth || '100%'}</span>
            </div>
          </Field>
        </Section>

        <Section title="Внутренние отступы">
          <div className="grid grid-cols-2 gap-2">
            {([['paddingTop', '↑ Верх'], ['paddingRight', '→ Право'], ['paddingBottom', '↓ Низ'], ['paddingLeft', '← Лево']] as const).map(([key, label]) => (
              <Field key={key} label={label} compact>
                <div className="flex items-center gap-1">
                  <button onClick={() => upd({ [key]: Math.max(0, (s[key] || 0) - 5) })} className="w-6 h-6 rounded bg-secondary">-</button>
                  <input type="number" value={s[key] || 0} onChange={(e) => upd({ [key]: +e.target.value })} className="w-16 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-center" />
                  <button onClick={() => upd({ [key]: (s[key] || 0) + 5 })} className="w-6 h-6 rounded bg-secondary">+</button>
                </div>
              </Field>
            ))}
          </div>
        </Section>

        <Section title="Внешние отступы">
          <div className="grid grid-cols-2 gap-2">
            {([['marginTop', '↑ Верх'], ['marginRight', '→ Право'], ['marginBottom', '↓ Низ'], ['marginLeft', '← Лево']] as const).map(([key, label]) => (
              <Field key={key} label={label} compact>
                <div className="flex items-center gap-1">
                  <button onClick={() => upd({ [key]: Math.max(0, (s[key] || 0) - 5) })} className="w-6 h-6 rounded bg-secondary">-</button>
                  <input type="number" value={s[key] || 0} onChange={(e) => upd({ [key]: +e.target.value })} className="w-16 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-center" />
                  <button onClick={() => upd({ [key]: (s[key] || 0) + 5 })} className="w-6 h-6 rounded bg-secondary">+</button>
                </div>
              </Field>
            ))}
          </div>
        </Section>

        <Section title="Обводка">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Толщина" compact>
              <div className="flex items-center gap-1">
                <button onClick={() => upd({ borderWidth: Math.max(0, (s.borderWidth || 0) - 1) })} className="w-6 h-6 rounded bg-secondary">-</button>
                <input type="number" value={s.borderWidth || 0} onChange={(e) => upd({ borderWidth: +e.target.value })} className="w-16 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-center" />
                <button onClick={() => upd({ borderWidth: (s.borderWidth || 0) + 1 })} className="w-6 h-6 rounded bg-secondary">+</button>
              </div>
            </Field>
            <Field label="Радиус" compact>
              <div className="flex items-center gap-1">
                <button onClick={() => upd({ borderRadius: Math.max(0, (s.borderRadius || 0) - 2) })} className="w-6 h-6 rounded bg-secondary">-</button>
                <input type="number" value={s.borderRadius || 0} onChange={(e) => upd({ borderRadius: +e.target.value })} className="w-16 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-center" />
                <button onClick={() => upd({ borderRadius: (s.borderRadius || 0) + 2 })} className="w-6 h-6 rounded bg-secondary">+</button>
              </div>
            </Field>
          </div>
          <Field label="Цвет обводки" compact>
            <input type="color" value={s.borderColor} onChange={(e) => upd({ borderColor: e.target.value })} className="w-full h-9 rounded border border-input cursor-pointer" />
          </Field>
        </Section>
      </div>
    </div>
  );
};

const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

const ImageFields: React.FC<{ src: string; alt: string; href: string; onUpdate: (u: Record<string, any>) => void }> = ({ src, alt, href, onUpdate }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await fileToDataURL(file);
    onUpdate({ src: dataUrl });
  }, [onUpdate]);

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const dataUrl = await fileToDataURL(new File([blob], 'pasted.png', { type: imageType }));
          onUpdate({ src: dataUrl });
          return;
        }
        if (item.types.includes('text/plain')) {
          const blob = await item.getType('text/plain');
          const text = await blob.text();
          if (text.startsWith('http')) {
            onUpdate({ src: text });
            return;
          }
        }
      }
    } catch {
      const text = await navigator.clipboard.readText();
      if (text.startsWith('http') || text.startsWith('data:')) {
        onUpdate({ src: text });
      }
    }
  }, [onUpdate]);

  return (
    <>
      <Field label="Изображение">
        <div className="space-y-2">
          <input type="text" value={src} onChange={(e) => onUpdate({ src: e.target.value })} placeholder="URL изображения" className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
          <div className="flex gap-1.5">
            <button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-xs">Загрузить</button>
            <button onClick={handlePaste} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-xs">Вставить</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>
      </Field>
      <Field label="Alt текст">
        <input type="text" value={alt} onChange={(e) => onUpdate({ alt: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
      </Field>
      <Field label="Ссылка при клике">
        <input type="text" value={href} onChange={(e) => onUpdate({ href: e.target.value })} placeholder="https://example.com" className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm" />
      </Field>
    </>
  );
};

const Field: React.FC<{ label: string; compact?: boolean; children: React.ReactNode }> = ({ label, compact, children }) => (
  <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <h4 className="text-[11px] font-semibold text-card-foreground/60 uppercase tracking-widest">{title}</h4>
      <div className="flex-1 h-px bg-border" />
    </div>
    {children}
  </div>
);

import type { ListBulletStyle } from '@/types/email-builder';

const ListFields: React.FC<{
  items: string[];
  bulletStyle: ListBulletStyle;
  onUpdateItems: (items: string[]) => void;
  onUpdateBullet: (bs: ListBulletStyle) => void;
}> = ({ items, bulletStyle, onUpdateItems, onUpdateBullet }) => {
  const iconFileRef = useRef<HTMLInputElement>(null);
  const bs = bulletStyle;

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onUpdateItems(newItems);
  };
  const addItem = () => onUpdateItems([...items, 'Новый пункт']);
  const removeItem = (index: number) => onUpdateItems(items.filter((_, i) => i !== index));

  const handleIconFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onUpdateBullet({ ...bs, customIcon: reader.result as string, type: 'custom' });
    reader.readAsDataURL(file);
  }, [bs, onUpdateBullet]);

  return (
    <>
      <Section title="Пункты списка">
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <input type="text" value={item} onChange={(e) => updateItem(i, e.target.value)} className="flex-1 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
              <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-destructive"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <button onClick={addItem} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-xs">Добавить пункт</button>
        </div>
      </Section>

      <Section title="Маркер">
        <Field label="Тип маркера" compact>
          <select value={bs.type} onChange={(e) => onUpdateBullet({ ...bs, type: e.target.value as BulletType })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm">
            <option value="disc">● Точка</option>
            <option value="check">✓ Галочка</option>
            <option value="number">1. Цифры</option>
            <option value="custom">🖼 Своя иконка</option>
          </select>
        </Field>

        <Field label="Font Awesome иконка (для кастомного маркера)" compact>
          <input type="text" value={bs.fontAwesomeIcon || ''} onChange={(e) => onUpdateBullet({ ...bs, fontAwesomeIcon: e.target.value, type: 'custom' })} placeholder="fa-solid fa-check" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
        </Field>

        {bs.type === 'custom' && !bs.fontAwesomeIcon && (
          <Field label="Иконка (URL)" compact>
            <input type="text" value={bs.customIcon} onChange={(e) => onUpdateBullet({ ...bs, customIcon: e.target.value })} placeholder="URL изображения" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
            <button onClick={() => iconFileRef.current?.click()} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-xs mt-1">Загрузить иконку</button>
            <input ref={iconFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleIconFile(e.target.files[0]); }} />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Field label="Цвет" compact>
            <input type="color" value={bs.color} onChange={(e) => onUpdateBullet({ ...bs, color: e.target.value })} className="w-full h-8 rounded border" />
          </Field>
          <Field label="Размер" compact>
            <input type="number" value={bs.size} onChange={(e) => onUpdateBullet({ ...bs, size: +e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
          </Field>
        </div>

        <Field label="Жирность" compact>
          <select value={bs.fontWeight} onChange={(e) => onUpdateBullet({ ...bs, fontWeight: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm">
            <option value="400">Обычный</option>
            <option value="500">Средний</option>
            <option value="600">Полужирный</option>
            <option value="700">Жирный</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Сдвиг X" compact>
            <input type="range" min={-20} max={20} value={bs.offsetX} onChange={(e) => onUpdateBullet({ ...bs, offsetX: +e.target.value })} className="w-full h-2 accent-primary" />
            <span className="text-xs">{bs.offsetX}</span>
          </Field>
          <Field label="Сдвиг Y" compact>
            <input type="range" min={-20} max={20} value={bs.offsetY} onChange={(e) => onUpdateBullet({ ...bs, offsetY: +e.target.value })} className="w-full h-2 accent-primary" />
            <span className="text-xs">{bs.offsetY}</span>
          </Field>
        </div>
      </Section>
    </>
  );
};

const MenuFields: React.FC<{
  items: MenuItem[];
  layout: MenuLayout;
  logoSrc: string;
  logoWidth: number;
  logoHref: string;
  gap: number;
  onUpdate: (u: Record<string, any>) => void;
}> = ({ items, layout, logoSrc, logoWidth, logoHref, gap, onUpdate }) => {
  const logoFileRef = useRef<HTMLInputElement>(null);

  const handleLogoFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await fileToDataURL(file);
    onUpdate({ menuLogoSrc: dataUrl });
  }, [onUpdate]);

  const updateItem = (index: number, field: keyof MenuItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate({ menuItems: newItems });
  };
  const addItem = () => {
    if (items.length >= 5) return;
    onUpdate({ menuItems: [...items, { label: 'Пункт', href: '#' }] });
  };
  const removeItem = (index: number) => onUpdate({ menuItems: items.filter((_, i) => i !== index) });

  return (
    <>
      <Section title="Ориентация">
        <div className="flex gap-1">
          {(['horizontal', 'vertical'] as const).map(l => (
            <button key={l} onClick={() => onUpdate({ menuLayout: l })} className={`flex-1 py-1.5 text-xs rounded ${layout === l ? 'bg-primary text-white' : 'bg-secondary'}`}>
              {l === 'horizontal' ? 'Горизонтально' : 'Вертикально'}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Логотип">
        <Field label="Изображение" compact>
          <div className="space-y-1.5">
            <input type="text" value={logoSrc} onChange={(e) => onUpdate({ menuLogoSrc: e.target.value })} placeholder="URL логотипа" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
            <button onClick={() => logoFileRef.current?.click()} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-xs">Загрузить</button>
            <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleLogoFile(e.target.files[0]); }} />
          </div>
        </Field>
        {logoSrc && (
          <>
            <Field label="Ширина лого" compact>
              <input type="range" min={30} max={300} value={logoWidth} onChange={(e) => onUpdate({ menuLogoWidth: +e.target.value })} className="w-full h-2 accent-primary" />
              <span className="text-xs">{logoWidth}px</span>
            </Field>
            <Field label="Ссылка лого" compact>
              <input type="text" value={logoHref} onChange={(e) => onUpdate({ menuLogoHref: e.target.value })} placeholder="https://" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm" />
            </Field>
          </>
        )}
      </Section>

      <Section title="Пункты меню">
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="space-y-1 p-2 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-1">
                <input type="text" value={item.label} onChange={(e) => updateItem(i, 'label', e.target.value)} placeholder="Название" className="flex-1 rounded-lg border border-input bg-secondary/50 px-2 py-1 text-sm" />
                <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-destructive"><X className="h-3.5 w-3.5" /></button>
              </div>
              <input type="text" value={item.href} onChange={(e) => updateItem(i, 'href', e.target.value)} placeholder="https://" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1 text-sm" />
            </div>
          ))}
          {items.length < 5 && (
            <button onClick={addItem} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-xs">Добавить пункт</button>
          )}
        </div>
      </Section>

      <Field label="Отступ между элементами" compact>
        <input type="range" min={4} max={40} value={gap} onChange={(e) => onUpdate({ menuGap: +e.target.value })} className="w-full h-2 accent-primary" />
        <span className="text-xs">{gap}px</span>
      </Field>
    </>
  );
};

export default PropertyPanel;
