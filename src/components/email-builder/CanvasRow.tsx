import React from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EmailRow } from '@/types/email-builder';
import CanvasBlock from './CanvasBlock';
import { GripVertical, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface Props {
  row: EmailRow;
  rowIndex: number;
}

const CanvasRow: React.FC<Props> = ({ row, rowIndex }) => {
  const { previewMode, deleteRow, moveRow, template } = useEmailBuilder();
  const isMobile = previewMode === 'mobile';
  const gap = row.cellGap || 0;
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, targetRowId: string, targetCellIndex?: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('moveBlock');
    if (data) {
      try {
        const { rowId: fromRowId, cellIndex: fromCellIndex, blockId } = JSON.parse(data);
        const toRowId = targetRowId;
        const toCellIndex = targetCellIndex !== undefined ? targetCellIndex : 0;
        const targetRow = template.rows.find(r => r.id === toRowId);
        if (targetRow && fromRowId !== toRowId) {
          // Здесь можно добавить логику перемещения между строками
        }
      } catch (e) {}
    }
  };
  
  return (
    <div 
      className="relative group/row mb-6 border border-transparent hover:border-border/50 rounded-lg transition-all"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, row.id)}
    >
      {/* Панель управления строкой */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 flex flex-col gap-1 bg-card rounded-lg shadow-md border border-border p-1 z-10 transition-opacity">
        {rowIndex > 0 && (
          <button
            onClick={() => moveRow(row.id, 'up')}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Переместить вверх"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        )}
        {rowIndex < template.rows.length - 1 && (
          <button
            onClick={() => moveRow(row.id, 'down')}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Переместить вниз"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="w-full h-px bg-border my-0.5" />
        <button
          onClick={() => deleteRow(row.id)}
          className="p-1 rounded hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"
          title="Удалить строку"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      
      {/* Сама строка */}
      <div 
        className="flex"
        style={{
          gap: isMobile ? 0 : `${gap}px`,
          flexDirection: isMobile && row.mobileStack !== false ? 'column' : 'row',
        }}
      >
        {row.cells.map((cell, cellIndex) => (
          <div
            key={cellIndex}
            className="flex-1 min-w-0 bg-canvas/30 rounded-lg p-2 transition-all hover:bg-canvas/50"
            style={{
              marginBottom: isMobile && row.mobileStack !== false ? `${gap}px` : 0,
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, row.id, cellIndex)}
          >
            <div className="space-y-2">
              {cell.map((block) => (
                <CanvasBlock
                  key={block.id}
                  block={block}
                  rowId={row.id}
                  cellIndex={cellIndex}
                />
              ))}
              <button
                className="w-full py-2 text-xs text-muted-foreground border border-dashed border-border rounded-lg hover:border-primary hover:text-primary transition-colors"
                onClick={() => {
                  // Добавление блока — нужно передать addBlockToCell из контекста
                  // Для этого нужно поднять логику выше
                }}
              >
                + Добавить блок
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanvasRow;
