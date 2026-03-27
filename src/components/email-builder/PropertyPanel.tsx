import { useRef, useCallback, useState, useEffect } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EMAIL_FONTS, BulletType, MenuItem, MenuLayout } from '@/types/email-builder';
import { Trash2, ArrowUp, ArrowDown, Settings2, Upload, ClipboardPaste, Link, Plus, X, Bold, Palette, Highlighter, Minus } from 'lucide-react';

// Компонент числового ввода с кнопками + и -
const NumberInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  size?: 'sm' | 'md';
}> = ({ value, onChange, min = 0, max = 9999, step = 1, suffix = '', size = 'md' }) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, Number((value - step).toFixed(1)));
    onChange(newValue);
  };
  
  const handleIncrement = () => {
    const newValue = Math.min(max, Number((value + step).toFixed(1)));
    onChange(newValue);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      const newValue = Math.min(max, Math.max(min, val));
      onChange(newValue);
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleDecrement}
        className="p-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
      >
        <Minus className={`h-3 w-3 ${size === 'sm' ? 'h-2.5 w-2.5' : ''}`} />
      </button>
      <div className="relative flex-1">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-lg border border-input bg-secondary/50 text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 text-center ${
            size === 'sm' ? 'px-1 py-1 text-xs' : 'px-2 py-1.5 text-sm'
          }`}
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleIncrement}
        className="p-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
      >
        <Plus className={`h-3 w-3 ${size === 'sm' ? 'h-2.5 w-2.5' : ''}`} />
      </button>
    </div>
  );
};

// Компонент выбора цвета с палитрой
const ColorPicker: React.FC<{
  value: string;
  onChange: (color: string) => void;
  label?: string;
}> = ({ value, onChange, label }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const presetColors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#b4a7d6', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#8e7cc3', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#674ea7', '#3d85c6', '#674ea7', '#a64d79',
    '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#351c75', '#0b5394', '#351c75', '#741b47',
    '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c1a47', '#073763', '#1c1a47', '#4c1130',
  ];

  return (
    <div className="space-y-1">
      {label && <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</label>}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-full h-9 rounded-lg border border-input flex items-center gap-2 px-2 hover:bg-secondary/50 transition-colors"
        >
          <div className="w-5 h-5 rounded-md border border-border shadow-sm" style={{ backgroundColor: value }} />
          <span className="text-xs text-muted-foreground font-mono flex-1">{value}</span>
        </button>
        
        {showPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-card border border-border rounded-lg shadow-xl z-50">
              <div className="grid grid-cols-10 gap-1 mb-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onChange(color);
                      setShowPicker(false);
                    }}
                    className="w-full aspect-square rounded border border-border/50 hover:scale-110 hover:z-10 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  type="color"
                  value={value === 'transparent' ? '#ffffff' : value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 rounded border border-input bg-secondary/50 px-2 py-1 text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

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
  
  const typeLabels: Record<string, string> = { 
    heading: 'Заголовок', 
    text: 'Текст', 
    image: 'Изображение', 
    button: 'Кнопка', 
    list: 'Список', 
    menu: 'Меню' 
  };
  
  return (
    <div className="w-72 bg-card border-l border-border h-full overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full gradient-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">{typeLabels[block.type]}</h3>
        </div>
        <div className="flex gap-0.5">
          <button 
            onClick={() => moveBlock(rowId, cellIndex, block.id, 'up')} 
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-secondary-foreground transition-colors"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={() => moveBlock(rowId, cellIndex, block.id, 'down')} 
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-secondary-foreground transition-colors"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={() => deleteBlock(rowId, cellIndex, block.id)} 
            className="p-1.5 rounded-md hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-5">
        {/* Content with rich text */}
        {(block.type === 'heading' || block.type === 'text' || block.type === 'button') && (
          <RichTextField 
            content={block.content} 
            onChange={(content) => updBlock({ content })} 
            multiline={block.type === 'text'} 
          />
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
          <ImageFields 
            src={block.src || ''} 
            alt={block.alt || ''} 
            href={block.href || ''} 
            onUpdate={updBlock} 
          />
        )}
        
        {block.type === 'button' && (
          <Field label="Ссылка (href)">
            <input 
              type="text" 
              value={block.href || ''} 
              onChange={(e) => updBlock({ href: e.target.value })} 
              className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" 
            />
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
              <NumberInput 
                value={s.fontSize} 
                onChange={(v) => upd({ fontSize: v })} 
                min={8} max={72} step={1}
                suffix="px"
              />
            </Field>
            <Field label="Высота строки" compact>
              <NumberInput 
                value={s.lineHeight} 
                onChange={(v) => upd({ lineHeight: v })} 
                min={0.8} max={2.5} step={0.1}
              />
            </Field>
          </div>
          <Field label="Жирность" compact>
            <select 
              value={s.fontWeight} 
              onChange={(e) => upd({ fontWeight: e.target.value })} 
              className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="400">Обычный</option>
              <option value="500">Средний</option>
              <option value="600">Полужирный</option>
              <option value="700">Жирный</option>
            </select>
          </Field>
          <Field label="Выравнивание" compact>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(a => (
                <button 
                  key={a} 
                  onClick={() => upd({ textAlign: a })} 
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    s.textAlign === a 
                      ? 'gradient-primary text-primary-foreground shadow-sm' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {a === 'left' ? 'Лево' : a === 'center' ? 'Центр' : 'Право'}
                </button>
              ))}
            </div>
          </Field>
        </Section>
        
        {/* Colors */}
        <Section title="Цвета">
          <div className="grid grid-cols-1 gap-2">
            <Field label="Цвет текста" compact>
              <ColorPicker 
                value={s.color} 
                onChange={(color) => upd({ color })}
              />
            </Field>
            <Field label="Цвет фона" compact>
              <ColorPicker 
                value={s.backgroundColor === 'transparent' ? '#ffffff' : s.backgroundColor} 
                onChange={(color) => upd({ backgroundColor: color })}
              />
            </Field>
          </div>
        </Section>
        
        {/* Width */}
        <Section title="Размер">
          <Field label="Ширина (десктоп)" compact>
            <NumberInput 
              value={parseInt(s.width) || 100} 
              onChange={(v) => upd({ width: `${v}%` })} 
              min={10} max={100} step={1}
              suffix="%"
            />
          </Field>
          <Field label="Ширина (мобильная)" compact>
            <NumberInput 
              value={parseInt(s.mobileWidth) || 100} 
              onChange={(v) => upd({ mobileWidth: `${v}%` })} 
              min={10} max={100} step={1}
              suffix="%"
            />
          </Field>
        </Section>
        
        {/* Padding */}
        <Section title="Внутренние отступы">
          <div className="grid grid-cols-2 gap-2">
            {([['paddingTop', '↑ Верх'], ['paddingRight', '→ Право'], ['paddingBottom', '↓ Низ'], ['paddingLeft', '← Лево']] as const).map(([key, label]) => (
              <Field key={key} label={label} compact>
                <NumberInput 
                  value={s[key]} 
                  onChange={(v) => upd({ [key]: v })} 
                  min={0} max={200} step={1}
                  suffix="px"
                />
              </Field>
            ))}
          </div>
        </Section>
        
        {/* Margin */}
        <Section title="Внешние отступы">
          <div className="grid grid-cols-2 gap-2">
            {([['marginTop', '↑ Верх'], ['marginRight', '→ Право'], ['marginBottom', '↓ Низ'], ['marginLeft', '← Лево']] as const).map(([key, label]) => (
              <Field key={key} label={label} compact>
                <NumberInput 
                  value={s[key]} 
                  onChange={(v) => upd({ [key]: v })} 
                  min={0} max={200} step={1}
                  suffix="px"
                />
              </Field>
            ))}
          </div>
        </Section>
        
        {/* Border */}
        <Section title="Обводка">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Толщина" compact>
              <NumberInput 
                value={s.borderWidth} 
                onChange={(v) => upd({ borderWidth: v })} 
                min={0} max={20} step={1}
                suffix="px"
              />
            </Field>
            <Field label="Радиус" compact>
              <NumberInput 
                value={s.borderRadius} 
                onChange={(v) => upd({ borderRadius: v })} 
                min={0} max={50} step={1}
                suffix="px"
              />
            </Field>
          </div>
          <Field label="Цвет обводки" compact>
            <ColorPicker 
              value={s.borderColor} 
              onChange={(color) => upd({ borderColor: color })}
            />
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
                    className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
                      row.mobileStack !== false 
                        ? 'gradient-primary text-primary-foreground shadow-sm' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    В 1 колонку
                  </button>
                  <button
                    onClick={() => updateRowMobileStack(rowId, false)}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
                      row.mobileStack === false 
                        ? 'gradient-primary text-primary-foreground shadow-sm' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Оставить колонки
                  </button>
                </div>
              </Field>
              <Field label="Отступ между колонками" compact>
                <NumberInput 
                  value={row.cellGap || 0} 
                  onChange={(v) => updateCellGap(rowId, v)} 
                  min={0} max={40} step={1}
                  suffix="px"
                />
              </Field>
              <div className="space-y-3">
                {row.cells.map((_, ci) => {
                  const cs = row.cellStyles?.[ci] || { backgroundColor: 'transparent', borderRadius: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 };
                  return (
                    <div key={ci} className="space-y-2 p-2 rounded-lg bg-secondary/30 border border-border/30">
                      <span className="text-[11px] font-semibold text-card-foreground/60 uppercase tracking-widest">Колонка {ci + 1}</span>
                      <Field label="Фон" compact>
                        <ColorPicker
                          value={cs.backgroundColor === 'transparent' ? '#ffffff' : cs.backgroundColor}
                          onChange={(color) => updateCellStyle(rowId, ci, { backgroundColor: color })}
                        />
                      </Field>
                      <Field label="Закругление" compact>
                        <NumberInput 
                          value={cs.borderRadius || 0} 
                          onChange={(v) => updateCellStyle(rowId, ci, { borderRadius: v })} 
                          min={0} max={40} step={1}
                          suffix="px"
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-1.5">
                        {([['paddingTop', '↑'], ['paddingRight', '→'], ['paddingBottom', '↓'], ['paddingLeft', '←']] as const).map(([key, icon]) => (
                          <Field key={key} label={icon} compact>
                            <NumberInput 
                              value={(cs as any)[key] || 0} 
                              onChange={(v) => updateCellStyle(rowId, ci, { [key]: v })} 
                              min={0} max={100} step={1}
                              suffix="px"
                              size="sm"
                            />
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
          <input 
            type="text" 
            value={src} 
            onChange={(e) => onUpdate({ src: e.target.value })} 
            placeholder="URL изображения" 
            className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" 
          />
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
          <input 
            ref={fileRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} 
          />
        </div>
      </Field>
      <Field label="Alt текст">
        <input 
          type="text" 
          value={alt} 
          onChange={(e) => onUpdate({ alt: e.target.value })} 
          className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" 
        />
      </Field>
      <Field label="Ссылка при клике">
        <div className="relative">
          <Link className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={href} 
            onChange={(e) => onUpdate({ href: e.target.value })} 
            placeholder="https://example.com" 
            className="w-full rounded-lg border border-input bg-secondary/50 pl-8 pr-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" 
          />
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

// RichTextField - упрощенный без форматирования для надежности
const RichTextField: React.FC<{ content: string; onChange: (content: string) => void; multiline?: boolean }> = ({ 
  content, 
  onChange, 
  multiline 
}) => {
  const [text, setText] = useState(content || '');
  const textareaRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  
  // Синхронизация с внешним контентом
  useEffect(() => {
    setText(content || '');
  }, [content]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    onChange(newValue);
  };
  
  const applyFormat = (before: string, after: string = '') => {
    const element = textareaRef.current;
    if (!element) return;
    
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const selected = text.substring(start, end);
    
    if (!selected) {
      // Если нет выделения - просто вставляем теги с плейсхолдером
      const newText = text.substring(0, start) + before + 'текст' + after + text.substring(end);
      setText(newText);
      onChange(newText);
      setTimeout(() => {
        element.focus();
        element.setSelectionRange(start + before.length, start + before.length + 4);
      }, 0);
      return;
    }
    
    // Оборачиваем выделенный текст
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    setText(newText);
    onChange(newText);
    
    setTimeout(() => {
      element.focus();
      element.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };
  
  return (
    <Field label="Контент">
      <div className="space-y-1.5">
        {/* Панель инструментов */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-input">
          <button
            type="button"
            onClick={() => applyFormat('**', '**')}
            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Жирный"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('{color:#ff0000}', '{/color}')}
            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Красный цвет"
          >
            <Palette className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('{bgcolor:#ffff00}', '{/bgcolor}')}
            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Желтый фон"
          >
            <Highlighter className="h-3.5 w-3.5" />
          </button>
        </div>
        
        {/* Поле ввода */}
        {multiline ? (
          <textarea
            ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
            value={text}
            onChange={handleChange}
            rows={6}
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            placeholder="Введите текст. Выделите часть и нажмите кнопку форматирования"
          />
        ) : (
          <input
            ref={textareaRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={text}
            onChange={handleChange}
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left' }}
            className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        )}
        <p className="text-[10px] text-muted-foreground">
          Выделите текст и нажмите кнопку для форматирования
        </p>
      </div>
    </Field>
  );
};

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
              <button 
                onClick={() => removeItem(i)} 
                className="p-1 rounded hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button 
            onClick={addItem} 
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
          >
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
              <input 
                type="text" 
                value={bs.customIcon} 
                onChange={(e) => onUpdateBullet({ ...bs, customIcon: e.target.value })} 
                placeholder="URL изображения" 
                className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" 
              />
              <button
                onClick={() => iconFileRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
              >
                <Upload className="h-3.5 w-3.5" /> Загрузить иконку
              </button>
              <input 
                ref={iconFileRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => { if (e.target.files?.[0]) handleIconFile(e.target.files[0]); }} 
              />
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
            <ColorPicker
              value={bs.color}
              onChange={(color) => onUpdateBullet({ ...bs, color })}
            />
          </Field>
          <Field label="Размер" compact>
            <NumberInput 
              value={bs.size} 
              onChange={(v) => onUpdateBullet({ ...bs, size: v })} 
              min={8} max={48} step={1}
              suffix="px"
            />
          </Field>
        </div>
        <Field label="Жирность" compact>
          <select 
            value={bs.fontWeight} 
            onChange={(e) => onUpdateBullet({ ...bs, fontWeight: e.target.value })} 
            className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="400">Обычный</option>
            <option value="500">Средний</option>
            <option value="600">Полужирный</option>
            <option value="700">Жирный</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Сдвиг X" compact>
            <NumberInput 
              value={bs.offsetX} 
              onChange={(v) => onUpdateBullet({ ...bs, offsetX: v })} 
              min={-20} max={20} step={1}
              suffix="px"
            />
          </Field>
          <Field label="Сдвиг Y" compact>
            <NumberInput 
              value={bs.offsetY} 
              onChange={(v) => onUpdateBullet({ ...bs, offsetY: v })} 
              min={-20} max={20} step={1}
              suffix="px"
            />
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
            <button 
              key={l} 
              onClick={() => onUpdate({ menuLayout: l })} 
              className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
                layout === l 
                  ? 'gradient-primary text-primary-foreground shadow-sm' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {l === 'horizontal' ? 'Горизонтально' : 'Вертикально'}
            </button>
          ))}
        </div>
      </Section>
      <Section title="Логотип">
        <Field label="Изображение" compact>
          <div className="space-y-1.5">
            <input 
              type="text" 
              value={logoSrc} 
              onChange={(e) => onUpdate({ menuLogoSrc: e.target.value })} 
              placeholder="URL логотипа" 
              className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" 
            />
            <button 
              onClick={() => logoFileRef.current?.click()} 
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
            >
              <Upload className="h-3.5 w-3.5" /> Загрузить
            </button>
            <input 
              ref={logoFileRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => { if (e.target.files?.[0]) handleLogoFile(e.target.files[0]); }} 
            />
            {logoSrc && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border/30">
                <img src={logoSrc} alt="" className="h-6 object-contain" />
                <span className="text-xs text-muted-foreground flex-1 truncate">Лого загружено</span>
                <button 
                  onClick={() => onUpdate({ menuLogoSrc: '' })} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </Field>
        {logoSrc && (
          <>
            <Field label="Ширина лого" compact>
              <NumberInput 
                value={logoWidth} 
                onChange={(v) => onUpdate({ menuLogoWidth: v })} 
                min={30} max={300} step={10}
                suffix="px"
              />
            </Field>
            <Field label="Ссылка лого" compact>
              <input 
                type="text" 
                value={logoHref} 
                onChange={(e) => onUpdate({ menuLogoHref: e.target.value })} 
                placeholder="https://" 
                className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" 
              />
            </Field>
          </>
        )}
      </Section>
      <Section title="Пункты меню">
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="space-y-1 p-2 rounded-lg bg-secondary/30 border border-border/30">
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  value={item.label} 
                  onChange={(e) => updateItem(i, 'label', e.target.value)} 
                  placeholder="Название" 
                  className="flex-1 rounded-lg border border-input bg-secondary/50 px-2 py-1 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" 
                />
                <button 
                  onClick={() => removeItem(i)} 
                  className="p-1 rounded hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="relative">
                <Link className="h-3 w-3 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={item.href} 
                  onChange={(e) => updateItem(i, 'href', e.target.value)} 
                  placeholder="https://" 
                  className="w-full rounded-lg border border-input bg-secondary/50 pl-7 pr-2 py-1 text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" 
                />
              </div>
            </div>
          ))}
          {items.length < 5 && (
            <button 
              onClick={addItem} 
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Добавить пункт
            </button>
          )}
        </div>
      </Section>
      <Field label="Отступ между элементами" compact>
        <NumberInput 
          value={gap} 
          onChange={(v) => onUpdate({ menuGap: v })} 
          min={4} max={40} step={1}
          suffix="px"
        />
      </Field>
    </>
  );
};

export default PropertyPanel;
