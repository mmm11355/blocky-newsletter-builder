import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const PropertyPanel = () => {
  const { getSelectedBlock, updateBlock, updateBlockStyle, deleteBlock, moveBlock, selection } = useEmailBuilder();
  const selected = getSelectedBlock();

  if (!selected || !selection) {
    return (
      <div className="w-64 bg-card border-l border-border p-4 h-full overflow-y-auto scrollbar-thin">
        <p className="text-sm text-muted-foreground text-center mt-10">Выберите элемент для редактирования</p>
      </div>
    );
  }

  const { block, rowId, cellIndex } = selected;
  const s = block.style;

  const upd = (style: Record<string, any>) => updateBlockStyle(rowId, cellIndex, block.id, style);
  const updBlock = (updates: Record<string, any>) => updateBlock(rowId, cellIndex, block.id, updates);

  return (
    <div className="w-64 bg-card border-l border-border h-full overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {block.type === 'heading' ? 'Заголовок' : block.type === 'text' ? 'Текст' : block.type === 'image' ? 'Изображение' : 'Кнопка'}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => moveBlock(rowId, cellIndex, block.id, 'up')} className="p-1 rounded hover:bg-secondary text-muted-foreground"><ArrowUp className="h-3.5 w-3.5" /></button>
          <button onClick={() => moveBlock(rowId, cellIndex, block.id, 'down')} className="p-1 rounded hover:bg-secondary text-muted-foreground"><ArrowDown className="h-3.5 w-3.5" /></button>
          <button onClick={() => deleteBlock(rowId, cellIndex, block.id)} className="p-1 rounded hover:bg-destructive hover:text-destructive-foreground text-muted-foreground"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Content */}
        {(block.type === 'heading' || block.type === 'text' || block.type === 'button') && (
          <Field label="Контент">
            {block.type === 'text' ? (
              <textarea
                value={block.content}
                onChange={(e) => updBlock({ content: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
              />
            ) : (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updBlock({ content: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            )}
          </Field>
        )}

        {block.type === 'image' && (
          <>
            <Field label="URL изображения">
              <input type="text" value={block.src || ''} onChange={(e) => updBlock({ src: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </Field>
            <Field label="Alt текст">
              <input type="text" value={block.alt || ''} onChange={(e) => updBlock({ alt: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </Field>
          </>
        )}

        {block.type === 'button' && (
          <Field label="Ссылка (href)">
            <input type="text" value={block.href || ''} onChange={(e) => updBlock({ href: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </Field>
        )}

        {/* Typography */}
        <Section title="Типографика">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Размер" compact>
              <input type="number" value={s.fontSize} onChange={(e) => upd({ fontSize: +e.target.value })} className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
            </Field>
            <Field label="Высота строки" compact>
              <input type="number" step={0.1} value={s.lineHeight} onChange={(e) => upd({ lineHeight: +e.target.value })} className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
            </Field>
          </div>
          <Field label="Жирность" compact>
            <select value={s.fontWeight} onChange={(e) => upd({ fontWeight: e.target.value })} className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
              <option value="400">Обычный</option>
              <option value="500">Средний</option>
              <option value="600">Полужирный</option>
              <option value="700">Жирный</option>
            </select>
          </Field>
          <Field label="Выравнивание" compact>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(a => (
                <button key={a} onClick={() => upd({ textAlign: a })} className={`flex-1 py-1 text-xs rounded ${s.textAlign === a ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
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
              <input type="color" value={s.color} onChange={(e) => upd({ color: e.target.value })} className="w-full h-8 rounded border border-input cursor-pointer" />
            </Field>
            <Field label="Фон" compact>
              <input type="color" value={s.backgroundColor === 'transparent' ? '#ffffff' : s.backgroundColor} onChange={(e) => upd({ backgroundColor: e.target.value })} className="w-full h-8 rounded border border-input cursor-pointer" />
            </Field>
          </div>
        </Section>

        {/* Padding */}
        <Section title="Отступы">
          <div className="grid grid-cols-2 gap-2">
            {([['paddingTop', 'Верх'], ['paddingRight', 'Право'], ['paddingBottom', 'Низ'], ['paddingLeft', 'Лево']] as const).map(([key, label]) => (
              <Field key={key} label={label} compact>
                <input type="number" value={s[key]} onChange={(e) => upd({ [key]: +e.target.value })} className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
              </Field>
            ))}
          </div>
        </Section>

        {/* Border */}
        <Section title="Обводка">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Толщина" compact>
              <input type="number" value={s.borderWidth} onChange={(e) => upd({ borderWidth: +e.target.value })} className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
            </Field>
            <Field label="Радиус" compact>
              <input type="number" value={s.borderRadius} onChange={(e) => upd({ borderRadius: +e.target.value })} className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
            </Field>
          </div>
          <Field label="Цвет обводки" compact>
            <input type="color" value={s.borderColor} onChange={(e) => upd({ borderColor: e.target.value })} className="w-full h-8 rounded border border-input cursor-pointer" />
          </Field>
        </Section>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; compact?: boolean; children: React.ReactNode }> = ({ label, compact, children }) => (
  <div className={compact ? '' : 'space-y-1'}>
    <label className="text-xs text-muted-foreground">{label}</label>
    {children}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</h4>
    {children}
  </div>
);

export default PropertyPanel;
