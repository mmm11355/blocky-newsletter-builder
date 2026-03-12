import { useRef, useCallback } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EMAIL_FONTS } from '@/types/email-builder';
import { Trash2, ArrowUp, ArrowDown, Settings2, Upload, ClipboardPaste, Link } from 'lucide-react';

const PropertyPanel = () => {
  const { getSelectedBlock, updateBlock, updateBlockStyle, deleteBlock, moveBlock, selection } = useEmailBuilder();
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

  const typeLabels: Record<string, string> = { heading: 'Заголовок', text: 'Текст', image: 'Изображение', button: 'Кнопка' };

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
        {/* Content */}
        {(block.type === 'heading' || block.type === 'text' || block.type === 'button') && (
          <Field label="Контент">
            {block.type === 'text' ? (
              <textarea
                value={block.content}
                onChange={(e) => updBlock({ content: e.target.value })}
                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm min-h-[80px] resize-y text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            ) : (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updBlock({ content: e.target.value })}
                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            )}
          </Field>
        )}

        {block.type === 'image' && (
          <ImageFields src={block.src || ''} alt={block.alt || ''} href={block.href || ''} onUpdate={updBlock} />
        )}

        {block.type === 'button' && (
          <Field label="Ссылка (href)">
            <input type="text" value={block.href || ''} onChange={(e) => updBlock({ href: e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
          </Field>
        )}

        {/* Font Family — for heading, text, button */}
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
              <input type="number" value={s.fontSize} onChange={(e) => upd({ fontSize: +e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </Field>
            <Field label="Высота строки" compact>
              <input type="number" step={0.1} value={s.lineHeight} onChange={(e) => upd({ lineHeight: +e.target.value })} className="w-full rounded-lg border border-input bg-secondary/50 px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
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
        <Section title="Отступы">
          <div className="grid grid-cols-2 gap-2">
            {([['paddingTop', '↑ Верх'], ['paddingRight', '→ Право'], ['paddingBottom', '↓ Низ'], ['paddingLeft', '← Лево']] as const).map(([key, label]) => (
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

export default PropertyPanel;
