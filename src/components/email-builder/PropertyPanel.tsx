import { useRef, useCallback, useState } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EMAIL_FONTS, BulletType, MenuItem, MenuLayout } from '@/types/email-builder';
import { Trash2, ArrowUp, ArrowDown, Settings2, Upload, ClipboardPaste, Link, Plus, X, Bold, Palette, Highlighter } from 'lucide-react';

const PropertyPanel = () => {
  const { getSelectedBlock, updateBlock, updateBlockStyle, deleteBlock, moveBlock, selection, template, updateCellStyle, updateCellGap, updateRowMobileStack } = useEmailBuilder();
  const selected = getSelectedBlock();

  if (!selected || !selection) {
    return (
      <div className="w-72 bg-card border-l border-border p-6 h-full overflow-y-auto scrollbar-thin flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">Выберите элемент<br/>для редактирования</p>
      </div>
    );
  }

  const { block, rowId, cellIndex } = selected;
  const s = block.style;

  const upd = (style: Record<string, any>) => updateBlockStyle(rowId, cellIndex, block.id, style);
  const updBlock = (updates: Record<string, any>) => updateBlock(rowId, cellIndex, block.id, updates);

  const typeLabels: Record<string, string> = { heading: 'Заголовок', text: 'Текст', image: 'Изображение', button: 'Кнопка', list: 'Список', menu: 'Меню' };

  // Функция для очистки HTML тегов
  const stripHtml = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const [textValue, setTextValue] = useState(() => stripHtml(block.content));
  const textareaRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

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

  return (
    <div className="w-72 bg-card border-l border-border h-full overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full gradient-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">{typeLabels[block.type]}</h3>
        </div>
        <div className="flex gap-0.5">
          <button onClick={() => moveBlock(rowId, cellIndex, block.id, 'up')} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-secondary-foreground transition-colors"><ArrowUp className="h-3.5 w-3.5" /></button>
          <button onClick={() => moveBlock(rowId, cellIndex, block.id, 'down')} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-secondary-foreground transition-colors"><ArrowDown className="h-3.5 w-3.5" /></button>
          <button onClick={() => deleteBlock(rowId, cellIndex, block.id)} className="p-1.5 rounded-md hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Content - простое текстовое поле с кнопками */}
        {(block.type === 'heading' || block.type === 'text' || block.type === 'button') && (
          <Field label="Контент">
            <div className="space-y-1.5">
              {/* Панель инструментов */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-input flex-wrap">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); wrapText('**', '**'); }}
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Жирный"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); wrapText('{color:#ff0000}', '{/color}'); }}
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Красный цвет"
                >
                  <Palette className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); wrapText('{bgcolor:#ffff00}', '{/bgcolor}'); }}
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Желтый фон"
                >
                  <Highlighter className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Поле ввода */}
              {block.type === 'text' ? (
                <textarea
                  ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
                  value={textValue}
                  onChange={(e) => updateText(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="Введите текст... **жирный** {color:#ff0000}красный{/color} {bgcolor:#ffff00}фон{/bgcolor}"
                />
              ) : (
                <input
                  ref={textareaRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={textValue}
                  onChange={(e) => updateText(e.target.value)}
                  className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
              )}
              
              <p className="text-[10px] text-muted-foreground">
                📝 **текст** — жирный | {`{color:#ff0000}текст{/color}`} — цвет | {`{bgcolor:#ffff00}текст{/bgcolor}`} — фон
              </p>
            </div>
          </Field>
        )}

        {/* List Items */}
        {block.type === 'list' && (
          <ListFields
            items={block.listItems || []}
            bulletStyle={block.bulletStyle || { type: 'disc', color: '#333333', size: 16, fontWeight: '400', customIcon: '', offsetX: 0, offsetY: 0 }}
            onUpdateItems={(listItems) => updBlock({ listItems })}
            onUpdateBullet={(bulletStyle) => updBlock({ bulletStyle })}
          />
        )}

        {/* Menu Items */}
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

        {block.type === 'image' && (
          <ImageFields src={block.src || ''} alt={block.alt || ''} href={block.href || ''} onUpdate={updBlock} />
        )}

        {block.type === 'button' && (
          <Field label="Ссылка (href)">
            <input type="text" value={block.href || ''} onChange={(e) => updBlock({ href: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
          </Field>
        )}

        {/* Font Family */}
        {(block.type === 'heading' || block.type === 'text' || block.type === 'button') && (
          <Section title="Шрифт">
            <Field label="Семейство шрифта" compact>
              <select
                value={s.fontFamily}
                onChange={(e) => upd({ fontFamily: e.target.value })}
                className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {EMAIL_FONTS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </Field>
          </Section>
        )}

        {/* Typography */}
        <Section title="Типографика">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Размер" compact>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={8}
                  max={72}
                  value={s.fontSize}
                  onChange={(e) => upd({ fontSize: +e.target.value })}
                  className="flex-1 h-2 accent-primary cursor-pointer"
                />
                <input
                  type="number"
                  value={s.fontSize}
                  onChange={(e) => upd({ fontSize: +e.target.value })}
                  className="w-14 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground text-center"
                />
              </div>
            </Field>
            <Field label="Высота строки" compact>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0.8}
                  max={2.5}
                  step={0.1}
                  value={s.lineHeight}
                  onChange={(e) => upd({ lineHeight: +e.target.value })}
                  className="flex-1 h-2 accent-primary cursor-pointer"
                />
                <input
                  type="number"
                  step={0.1}
                  value={s.lineHeight}
                  onChange={(e) => upd({ lineHeight: +e.target.value })}
                  className="w-14 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground text-center"
                />
              </div>
            </Field>
          </div>
          <Field label="Жирность" compact>
            <select value={s.fontWeight} onChange={(e) => upd({ fontWeight: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
              <option value="400">Обычный</option>
              <option value="500">Средний</option>
              <option value="600">Полужирный</option>
              <option value="700">Жирный</option>
            </select>
          </Field>
          <Field label="Выравнивание" compact>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(a => (
                <button key={a} onClick={() => upd({ textAlign: a })} className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${s.textAlign === a ? 'gradient-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                  {a === 'left' ? 'Лево' : a === 'center' ? 'Центр' : 'Право'}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* Colors */}
        <Section title="Цвета">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Текст" compact>
              <div className="relative">
                <input type="color" value={s.color} onChange={(e) => upd({ color: e.target.value })} className="w-full h-9 rounded-lg border border-input cursor-pointer opacity-0 absolute inset-0" />
                <div className="w-full h-9 rounded-lg border border-input flex items-center gap-2 px-2">
                  <div className="w-5 h-5 rounded-md border border-border" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-muted-foreground font-mono">{s.color}</span>
                </div>
              </div>
            </Field>
            <Field label="Фон" compact>
              <div className="relative">
                <input type="color" value={s.backgroundColor === 'transparent' ? '#ffffff' : s.backgroundColor} onChange={(e) => upd({ backgroundColor: e.target.value })} className="w-full h-9 rounded-lg border border-input cursor-pointer opacity-0 absolute inset-0" />
                <div className="w-full h-9 rounded-lg border border-input flex items-center gap-2 px-2">
                  <div className="w-5 h-5 rounded-md border border-border" style={{ backgroundColor: s.backgroundColor === 'transparent' ? '#ffffff' : s.backgroundColor }} />
                  <span className="text-xs text-muted-foreground font-mono">{s.backgroundColor === 'transparent' ? '#fff' : s.backgroundColor}</span>
                </div>
              </div>
            </Field>
          </div>
        </Section>

        {/* Width */}
        <Section title="Размер">
          <Field label="Ширина (десктоп)" compact>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={10}
                max={100}
                value={parseInt(s.width) || 100}
                onChange={(e) => upd({ width: `${e.target.value}%` })}
                className="flex-1 h-2 accent-primary"
              />
              <span className="text-xs text-muted-foreground font-mono w-10 text-right">{s.width || '100%'}</span>
            </div>
          </Field>
          <Field label="Ширина (мобильная)" compact>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={10}
                max={100}
                value={parseInt(s.mobileWidth) || 100}
                onChange={(e) => upd({ mobileWidth: `${e.target.value}%` })}
                className="flex-1 h-2 accent-primary"
              />
              <span className="text-xs text-muted-foreground font-mono w-10 text-right">{s.mobileWidth || '100%'}</span>
            </div>
          </Field>
        </Section>

        {/* Padding */}
        <Section title="Внутренние отступы">
          <div className="grid grid-cols-2 gap-2">
            {([['paddingTop', '↑ Верх'], ['paddingRight', '→ Право'], ['paddingBottom', '↓ Низ'], ['paddingLeft', '← Лево']] as const).map(([key, label]) => (
              <Field key={key} label={label} compact>
                <input type="number" value={s[key]} onChange={(e) => upd({ [key]: +e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </Field>
            ))}
          </div>
        </Section>

        {/* Margin */}
        <Section title="Внешние отступы">
          <div className="grid grid-cols-2 gap-2">
            {([['marginTop', '↑ Верх'], ['marginRight', '→ Право'], ['marginBottom', '↓ Низ'], ['marginLeft', '← Лево']] as const).map(([key, label]) => (
              <Field key={key} label={label} compact>
                <input type="number" value={s[key]} onChange={(e) => upd({ [key]: +e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </Field>
            ))}
          </div>
        </Section>

        {/* Border */}
        <Section title="Обводка">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Толщина" compact>
              <input type="number" value={s.borderWidth} onChange={(e) => upd({ borderWidth: +e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </Field>
            <Field label="Радиус" compact>
              <input type="number" value={s.borderRadius} onChange={(e) => upd({ borderRadius: +e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </Field>
          </div>
          <Field label="Цвет обводки" compact>
            <div className="relative">
              <input type="color" value={s.borderColor} onChange={(e) => upd({ borderColor: e.target.value })} className="w-full h-9 rounded-lg border border-input cursor-pointer opacity-0 absolute inset-0" />
              <div className="w-full h-9 rounded-lg border border-input flex items-center gap-2 px-2">
                <div className="w-5 h-5 rounded-md border border-border" style={{ backgroundColor: s.borderColor }} />
                <span className="text-xs text-muted-foreground font-mono">{s.borderColor}</span>
              </div>
            </div>
          </Field>
        </Section>

        {/* Per-column styles */}
        {(() => {
          const row = template.rows.find(r => r.id === rowId);
          if (!row || row.columns <= 1) return null;
          return (
            <Section title="Колонки">
              <Field label="Мобильная версия" compact>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateRowMobileStack(rowId, true)}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${row.mobileStack !== false ? 'gradient-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                  >
                    В 1 колонку
                  </button>
                  <button
                    onClick={() => updateRowMobileStack(rowId, false)}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${row.mobileStack === false ? 'gradient-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                  >
                    Оставить колонки
                  </button>
                </div>
              </Field>
              <Field label="Отступ между колонками" compact>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={row.cellGap || 0}
                    onChange={(e) => updateCellGap(rowId, +e.target.value)}
                    className="flex-1 h-2 accent-primary"
                  />
                  <span className="text-xs text-muted-foreground font-mono w-10 text-right">{row.cellGap || 0}px</span>
                </div>
              </Field>
              <div className="space-y-3">
                {row.cells.map((_, ci) => {
                  const cs = row.cellStyles?.[ci] || { backgroundColor: 'transparent', borderRadius: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 };
                  return (
                    <div key={ci} className="space-y-2 p-2 rounded-lg bg-secondary/30 border border-border/30">
                      <span className="text-[11px] font-semibold text-card-foreground/60 uppercase tracking-widest">Колонка {ci + 1}</span>
                      <Field label="Фон" compact>
                        <div className="relative">
                          <input
                            type="color"
                            value={cs.backgroundColor === 'transparent' ? '#ffffff' : cs.backgroundColor}
                            onChange={(e) => updateCellStyle(rowId, ci, { backgroundColor: e.target.value })}
                            className="w-full h-8 rounded-lg border border-input cursor-pointer opacity-0 absolute inset-0"
                          />
                          <div className="w-full h-8 rounded-lg border border-input flex items-center gap-2 px-2">
                            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: cs.backgroundColor === 'transparent' ? '#ffffff' : cs.backgroundColor }} />
                            <span className="text-xs text-muted-foreground font-mono">{cs.backgroundColor === 'transparent' ? 'прозр.' : cs.backgroundColor}</span>
                            {cs.backgroundColor !== 'transparent' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); updateCellStyle(rowId, ci, { backgroundColor: 'transparent' }); }}
                                className="ml-auto text-[10px] text-muted-foreground hover:text-foreground"
                              >✕</button>
                            )}
                          </div>
                        </div>
                      </Field>
                      <Field label="Закругление" compact>
                        <div className="flex items-center gap-2">
                          <input type="range" min={0} max={40} value={cs.borderRadius || 0} onChange={(e) => updateCellStyle(rowId, ci, { borderRadius: +e.target.value })} className="flex-1 h-2 accent-primary" />
                          <span className="text-xs text-muted-foreground font-mono w-10 text-right">{cs.borderRadius || 0}px</span>
                        </div>
                      </Field>
                      <div className="grid grid-cols-2 gap-1.5">
                        {([['paddingTop', '↑'], ['paddingRight', '→'], ['paddingBottom', '↓'], ['paddingLeft', '←']] as const).map(([key, icon]) => (
                          <Field key={key} label={icon} compact>
                            <input type="number" value={(cs as any)[key] || 0} onChange={(e) => updateCellStyle(rowId, ci, { [key]: +e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1 text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                          </Field>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          );
        })()}
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
          <input type="text" value={src} onChange={(e) => onUpdate({ src: e.target.value })} placeholder="URL изображения" className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
          <div className="flex gap-1.5">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Загрузить
            </button>
            <button
              onClick={handlePaste}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              Вставить
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>
      </Field>
      <Field label="Alt текст">
        <input type="text" value={alt} onChange={(e) => onUpdate({ alt: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
      </Field>
      <Field label="Ссылка при клике">
        <div className="relative">
          <Link className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={href} onChange={(e) => onUpdate({ href: e.target.value })} placeholder="https://example.com" className="w-full rounded-lg border border-input bg-secondary/50 pl-8 pr-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
        </div>
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
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                className="flex-1 rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button onClick={addItem} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors">
            <Plus className="h-3.5 w-3.5" /> Добавить пункт
          </button>
        </div>
      </Section>

      <Section title="Маркер">
        <Field label="Тип маркера" compact>
          <select
            value={bs.type}
            onChange={(e) => onUpdateBullet({ ...bs, type: e.target.value as BulletType })}
            className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="disc">● Точка</option>
            <option value="check">✓ Галочка</option>
            <option value="number">1. Цифры</option>
            <option value="custom">🖼 Своя иконка</option>
          </select>
        </Field>

        {bs.type === 'custom' && (
          <Field label="Иконка маркера" compact>
            <div className="space-y-1.5">
              <input type="text" value={bs.customIcon} onChange={(e) => onUpdateBullet({ ...bs, customIcon: e.target.value })} placeholder="URL изображения" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
              <button
                onClick={() => iconFileRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
              >
                <Upload className="h-3.5 w-3.5" /> Загрузить иконку
              </button>
              <input ref={iconFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleIconFile(e.target.files[0]); }} />
              {bs.customIcon && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border/30">
                  <img src={bs.customIcon} alt="" className="w-6 h-6 object-contain" />
                  <span className="text-xs text-muted-foreground flex-1 truncate">Иконка загружена</span>
                </div>
              )}
            </div>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Field label="Цвет" compact>
            <div className="relative">
              <input type="color" value={bs.color} onChange={(e) => onUpdateBullet({ ...bs, color: e.target.value })} className="w-full h-8 rounded-lg border border-input cursor-pointer opacity-0 absolute inset-0" />
              <div className="w-full h-8 rounded-lg border border-input flex items-center gap-2 px-2">
                <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: bs.color }} />
                <span className="text-xs text-muted-foreground font-mono">{bs.color}</span>
              </div>
            </div>
          </Field>
          <Field label="Размер" compact>
            <input type="number" value={bs.size} onChange={(e) => onUpdateBullet({ ...bs, size: +e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </Field>
        </div>

        <Field label="Жирность" compact>
          <select value={bs.fontWeight} onChange={(e) => onUpdateBullet({ ...bs, fontWeight: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
            <option value="400">Обычный</option>
            <option value="500">Средний</option>
            <option value="600">Полужирный</option>
            <option value="700">Жирный</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Сдвиг X" compact>
            <div className="flex items-center gap-2">
              <input type="range" min={-20} max={20} value={bs.offsetX} onChange={(e) => onUpdateBullet({ ...bs, offsetX: +e.target.value })} className="flex-1 h-2 accent-primary" />
              <span className="text-xs text-muted-foreground font-mono w-8 text-right">{bs.offsetX}</span>
            </div>
          </Field>
          <Field label="Сдвиг Y" compact>
            <div className="flex items-center gap-2">
              <input type="range" min={-20} max={20} value={bs.offsetY} onChange={(e) => onUpdateBullet({ ...bs, offsetY: +e.target.value })} className="flex-1 h-2 accent-primary" />
              <span className="text-xs text-muted-foreground font-mono w-8 text-right">{bs.offsetY}</span>
            </div>
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
            <button key={l} onClick={() => onUpdate({ menuLayout: l })} className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${layout === l ? 'gradient-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
              {l === 'horizontal' ? 'Горизонтально' : 'Вертикально'}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Логотип">
        <Field label="Изображение" compact>
          <div className="space-y-1.5">
            <input type="text" value={logoSrc} onChange={(e) => onUpdate({ menuLogoSrc: e.target.value })} placeholder="URL логотипа" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            <button onClick={() => logoFileRef.current?.click()} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors">
              <Upload className="h-3.5 w-3.5" /> Загрузить
            </button>
            <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleLogoFile(e.target.files[0]); }} />
            {logoSrc && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border/30">
                <img src={logoSrc} alt="" className="h-6 object-contain" />
                <span className="text-xs text-muted-foreground flex-1 truncate">Лого загружено</span>
                <button onClick={() => onUpdate({ menuLogoSrc: '' })} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
              </div>
            )}
          </div>
        </Field>
        {logoSrc && (
          <>
            <Field label="Ширина лого" compact>
              <div className="flex items-center gap-2">
                <input type="range" min={30} max={300} value={logoWidth} onChange={(e) => onUpdate({ menuLogoWidth: +e.target.value })} className="flex-1 h-2 accent-primary" />
                <span className="text-xs text-muted-foreground font-mono w-10 text-right">{logoWidth}px</span>
              </div>
            </Field>
            <Field label="Ссылка лого" compact>
              <input type="text" value={logoHref} onChange={(e) => onUpdate({ menuLogoHref: e.target.value })} placeholder="https://" className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </Field>
          </>
        )}
      </Section>

      <Section title="Пункты меню">
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="space-y-1 p-2 rounded-lg bg-secondary/30 border border-border/30">
              <div className="flex items-center gap-1">
                <input type="text" value={item.label} onChange={(e) => updateItem(i, 'label', e.target.value)} placeholder="Название" className="flex-1 rounded-lg border border-input bg-secondary/50 px-2 py-1 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="relative">
                <Link className="h-3 w-3 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
                <input type="text" value={item.href} onChange={(e) => updateItem(i, 'href', e.target.value)} placeholder="https://" className="w-full rounded-lg border border-input bg-secondary/50 pl-7 pr-2 py-1 text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
            </div>
          ))}
          {items.length < 5 && (
            <button onClick={addItem} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors">
              <Plus className="h-3.5 w-3.5" /> Добавить пункт
            </button>
          )}
        </div>
      </Section>

      <Field label="Отступ между элементами" compact>
        <div className="flex items-center gap-2">
          <input type="range" min={4} max={40} value={gap} onChange={(e) => onUpdate({ menuGap: +e.target.value })} className="flex-1 h-2 accent-primary" />
          <span className="text-xs text-muted-foreground font-mono w-10 text-right">{gap}px</span>
        </div>
      </Field>
    </>
  );
};

export default PropertyPanel;
