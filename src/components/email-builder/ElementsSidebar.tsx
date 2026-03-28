import { Type, Image, Heading1, MousePointerClick, Columns2, Columns3, LayoutList, GripVertical, List, Menu, Share2, Star, Mic } from 'lucide-react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { BlockType, ColumnLayout } from '@/types/email-builder';

const elements: { type: BlockType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'heading', label: 'Заголовок', icon: <Heading1 className="h-5 w-5" />, desc: 'H1 заголовок' },
  { type: 'text', label: 'Текст', icon: <Type className="h-5 w-5" />, desc: 'Параграф текста' },
  { type: 'image', label: 'Изображение', icon: <Image className="h-5 w-5" />, desc: 'Фото или баннер' },
  { type: 'button', label: 'Кнопка', icon: <MousePointerClick className="h-5 w-5" />, desc: 'CTA кнопка' },
  { type: 'list', label: 'Список', icon: <List className="h-5 w-5" />, desc: 'Маркированный список' },
  { type: 'menu', label: 'Меню', icon: <Menu className="h-5 w-5" />, desc: 'Навигация с лого' },
  { type: 'social', label: 'Соцсети', icon: <Share2 className="h-5 w-5" />, desc: 'Иконки соцсетей' },
  { type: 'testimonial', label: 'Отзыв', icon: <Star className="h-5 w-5" />, desc: 'Отзыв клиента' },
  { type: 'speaker', label: 'Спикер', icon: <Mic className="h-5 w-5" />, desc: 'Карточка спикера' },
];

const layouts: { columns: ColumnLayout; label: string; icon: React.ReactNode; visual: number[] }[] = [
  { columns: 1, label: '1 колонка', icon: <LayoutList className="h-5 w-5" />, visual: [1] },
  { columns: 2, label: '2 колонки', icon: <Columns2 className="h-5 w-5" />, visual: [1, 1] },
  { columns: 3, label: '3 колонки', icon: <Columns3 className="h-5 w-5" />, visual: [1, 1, 1] },
];

const ElementsSidebar = () => {
  const { addRow } = useEmailBuilder();

  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('blockType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-[11px] font-semibold text-sidebar-foreground/60 uppercase tracking-widest mb-3">Структура</h2>
        <div className="grid gap-1.5">
          {layouts.map(l => (
            <button
              key={l.columns}
              onClick={() => addRow(l.columns)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all text-sm font-medium group"
            >
              <div className="flex gap-0.5">
                {l.visual.map((_, i) => (
                  <div key={i} className="w-5 h-7 rounded-sm border border-sidebar-foreground/20 group-hover:border-sidebar-primary/50 transition-colors" />
                ))}
              </div>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex-1">
        <h2 className="text-[11px] font-semibold text-sidebar-foreground/60 uppercase tracking-widest mb-1">Элементы</h2>
        <p className="text-[11px] text-sidebar-foreground/40 mb-3">Перетащите в ячейку</p>
        <div className="grid gap-1.5">
          {elements.map(el => (
            <div
              key={el.type}
              draggable
              onDragStart={(e) => handleDragStart(e, el.type)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all text-sm font-medium cursor-grab active:cursor-grabbing group"
            >
              <div className="w-8 h-8 rounded-md bg-sidebar-accent flex items-center justify-center text-sidebar-primary group-hover:gradient-primary group-hover:text-primary-foreground transition-all shrink-0">
                {el.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{el.label}</div>
                <div className="text-[10px] text-sidebar-foreground/40">{el.desc}</div>
              </div>
              <GripVertical className="h-3.5 w-3.5 text-sidebar-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElementsSidebar;
