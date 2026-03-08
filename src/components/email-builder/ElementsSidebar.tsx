import { Type, Image, Heading1, MousePointerClick, Columns2, Columns3, LayoutList } from 'lucide-react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { BlockType, ColumnLayout } from '@/types/email-builder';

const elements: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'heading', label: 'Заголовок', icon: <Heading1 className="h-5 w-5" /> },
  { type: 'text', label: 'Текст', icon: <Type className="h-5 w-5" /> },
  { type: 'image', label: 'Изображение', icon: <Image className="h-5 w-5" /> },
  { type: 'button', label: 'Кнопка', icon: <MousePointerClick className="h-5 w-5" /> },
];

const layouts: { columns: ColumnLayout; label: string; icon: React.ReactNode }[] = [
  { columns: 1, label: '1 колонка', icon: <LayoutList className="h-5 w-5" /> },
  { columns: 2, label: '2 колонки', icon: <Columns2 className="h-5 w-5" /> },
  { columns: 3, label: '3 колонки', icon: <Columns3 className="h-5 w-5" /> },
];

const ElementsSidebar = () => {
  const { addRow } = useEmailBuilder();

  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('blockType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-60 bg-card border-r border-border flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Структура</h2>
        <div className="mt-3 grid gap-2">
          {layouts.map(l => (
            <button
              key={l.columns}
              onClick={() => addRow(l.columns)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
            >
              {l.icon}
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Элементы</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-3">Перетащите в ячейку</p>
        <div className="grid gap-2">
          {elements.map(el => (
            <div
              key={el.type}
              draggable
              onDragStart={(e) => handleDragStart(e, el.type)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium cursor-grab active:cursor-grabbing"
            >
              {el.icon}
              {el.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElementsSidebar;
