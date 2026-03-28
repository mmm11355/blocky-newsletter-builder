import React, { useState } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EmailRow, BlockType } from '@/types/email-builder';
import CanvasBlock from './CanvasBlock';
import { Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';

interface Props {
  row: EmailRow;
  isMobile: boolean;
}

const CanvasRow: React.FC<Props> = ({ row, isMobile }) => {
  const { addBlockToCell, deleteRow, moveRow, reorderBlock, moveBlockBetweenCells } = useEmailBuilder();
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{ cellIndex: number; position: number } | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState<{ cellIndex: number; show: boolean } | null>(null);

  const blockTypes: { type: BlockType; label: string }[] = [
    { type: 'heading', label: 'Заголовок' },
    { type: 'text', label: 'Текст' },
    { type: 'image', label: 'Изображение' },
    { type: 'button', label: 'Кнопка' },
    { type: 'list', label: 'Список' },
    { type: 'menu', label: 'Меню' },
    { type: 'social', label: 'Соцсети' },
    { type: 'testimonial', label: 'Отзыв' },
    { type: 'speaker', label: 'Спикер' },
    { type: 'contact', label: 'Контакты' },
    { type: 'links', label: 'Ссылки' },
  ];

  const handleDragOver = (e: React.DragEvent, cellIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const isMoveBlock = e.dataTransfer.types.includes('moveblock');
    const isNewBlock = e.dataTransfer.types.includes('blocktype');

    if (isMoveBlock) {
      const cellEl = e.currentTarget as HTMLElement;
      const children = Array.from(cellEl.querySelectorAll(':scope > [style], :scope > .group\\/block, :scope > button'));
      const rect = cellEl.getBoundingClientRect();
      const y = e.clientY - rect.top;
      
      let position = row.cells[cellIndex]?.length || 0;
      for (let i = 0; i < children.length; i++) {
        const childRect = children[i].getBoundingClientRect();
        const childMid = childRect.top - rect.top + childRect.height / 2;
        if (y < childMid) {
          position = i;
          break;
        }
      }
      setDropIndicator({ cellIndex, position });
      e.dataTransfer.dropEffect = 'move';
    } else if (isNewBlock) {
      setHoveredCell(cellIndex);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setHoveredCell(null);
    setDropIndicator(null);
  };

  const handleDrop = (e: React.DragEvent, cellIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const moveData = e.dataTransfer.getData('moveBlock');
    if (moveData) {
      const { rowId: fromRowId, cellIndex: fromCellIndex, blockId } = JSON.parse(moveData);
      const targetPosition = dropIndicator?.cellIndex === cellIndex ? dropIndicator.position : (row.cells[cellIndex]?.length || 0);
      
      if (fromRowId === row.id && fromCellIndex === cellIndex) {
        reorderBlock(row.id, cellIndex, blockId, targetPosition);
      } else {
        moveBlockBetweenCells(fromRowId, fromCellIndex, blockId, row.id, cellIndex, targetPosition);
      }
    } else {
      const type = e.dataTransfer.getData('blockType') as BlockType;
      if (type) addBlockToCell(row.id, cellIndex, type);
    }

    setHoveredCell(null);
    setDropIndicator(null);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="absolute -left-11 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-10">
          <button onClick={() => moveRow(row.id, 'up')} className="p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <ArrowUp className="h-3 w-3" />
          </button>
          <button onClick={() => deleteRow(row.id)} className="p-1.5 rounded-md bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors">
            <Trash2 className="h-3 w-3" />
          </button>
          <button onClick={() => moveRow(row.id, 'down')} className="p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className={`transition-all ${hovered ? 'ring-1 ring-primary/30 rounded-sm' : ''}`}>
        <div
          className={`flex ${isMobile && row.mobileStack !== false ? 'flex-col' : 'flex-row'}`}
          style={{
            backgroundColor: row.style.backgroundColor,
            padding: `${row.style.paddingTop}px ${row.style.paddingRight}px ${row.style.paddingBottom}px ${row.style.paddingLeft}px`,
            gap: `${row.cellGap || 0}px`,
          }}
        >
          {row.cells.map((cell, cellIndex) => {
            const cellStyle = row.cellStyles?.[cellIndex];
            const cellBg = cellStyle?.backgroundColor && cellStyle.backgroundColor !== 'transparent'
              ? cellStyle.backgroundColor
              : undefined;

            return (
              <div
                key={cellIndex}
                className={`${isMobile ? 'w-full' : ''} min-h-[60px] transition-all ${hoveredCell === cellIndex ? 'drag-over rounded-md' : ''}`}
                style={{
                  width: (isMobile && row.mobileStack !== false) ? '100%' : `${100 / row.columns}%`,
                  backgroundColor: cellBg,
                  borderRadius: cellStyle?.borderRadius ? `${cellStyle.borderRadius}px` : undefined,
                  padding: cellStyle ? `${cellStyle.paddingTop || 0}px ${cellStyle.paddingRight || 0}px ${cellStyle.paddingBottom || 0}px ${cellStyle.paddingLeft || 0}px` : undefined,
                }}
                onDragOver={(e) => handleDragOver(e, cellIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, cellIndex)}
              >
                {/* Существующие блоки */}
                {cell.map((block, blockIndex) => (
                  <React.Fragment key={block.id}>
                    {dropIndicator?.cellIndex === cellIndex && dropIndicator.position === blockIndex && (
                      <div className="h-0.5 bg-primary rounded-full mx-2 my-1" />
                    )}
                    <CanvasBlock block={block} rowId={row.id} cellIndex={cellIndex} />
                  </React.Fragment>
                ))}
                
                {/* Индикатор drop в конце */}
                {dropIndicator?.cellIndex === cellIndex && dropIndicator.position === cell.length && cell.length > 0 && (
                  <div className="h-0.5 bg-primary rounded-full mx-2 my-1" />
                )}
                
                {/* Кнопка добавления нового блока */}
                <div className="relative mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBlockMenu(showBlockMenu?.cellIndex === cellIndex && showBlockMenu.show ? null : { cellIndex, show: true });
                    }}
                    className="w-full py-2 text-xs text-muted-foreground border border-dashed border-border rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Добавить блок
                  </button>
                  
                  {showBlockMenu?.cellIndex === cellIndex && showBlockMenu.show && (
                    <div className="absolute bottom-full left-0 mb-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
                      {blockTypes.map((bt) => (
                        <button
                          key={bt.type}
                          onClick={() => {
                            addBlockToCell(row.id, cellIndex, bt.type);
                            setShowBlockMenu(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                        >
                          {bt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CanvasRow;
