import React, { useState } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EmailRow, BlockType } from '@/types/email-builder';
import CanvasBlock from './CanvasBlock';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  row: EmailRow;
  isMobile: boolean;
}

const CanvasRow: React.FC<Props> = ({ row, isMobile }) => {
  const { addBlockToCell, deleteRow, moveRow } = useEmailBuilder();
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);

  const handleDragOver = (e: React.DragEvent, cellIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredCell(cellIndex);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setHoveredCell(null);
  };

  const handleDrop = (e: React.DragEvent, cellIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData('blockType') as BlockType;
    if (type) addBlockToCell(row.id, cellIndex, type);
    setHoveredCell(null);
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
          className={`flex ${isMobile ? 'flex-col' : 'flex-row'}`}
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
                  width: isMobile ? '100%' : `${100 / row.columns}%`,
                  backgroundColor: cellBg,
                  borderRadius: cellStyle?.borderRadius ? `${cellStyle.borderRadius}px` : undefined,
                  padding: cellStyle ? `${cellStyle.paddingTop || 0}px ${cellStyle.paddingRight || 0}px ${cellStyle.paddingBottom || 0}px ${cellStyle.paddingLeft || 0}px` : undefined,
                }}
                onDragOver={(e) => handleDragOver(e, cellIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, cellIndex)}
              >
                {cell.length === 0 ? (
                  <div className="h-full min-h-[60px] border border-dashed border-border/30 rounded-md flex items-center justify-center text-xs text-muted-foreground/50 m-1">
                    Перетащите сюда
                  </div>
                ) : (
                  cell.map(block => (
                    <CanvasBlock key={block.id} block={block} rowId={row.id} cellIndex={cellIndex} />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CanvasRow;
