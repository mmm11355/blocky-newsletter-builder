import React, { useState } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EmailRow } from '@/types/email-builder';
import CanvasRow from './CanvasRow';
import { GripVertical, Plus, MonitorSmartphone, Smartphone } from 'lucide-react';

const EmailCanvas: React.FC = () => {
  const { template, previewMode, setPreviewMode, addRow, moveRow, deleteRow } = useEmailBuilder();
  const [draggedOver, setDraggedOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDraggedOver(true);
  };
  
  const handleDragLeave = () => {
    setDraggedOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-canvas">
      {/* Панель переключения режимов */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Предпросмотр:</span>
          <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
                previewMode === 'desktop' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MonitorSmartphone className="h-3.5 w-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
                previewMode === 'mobile' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Mobile
            </button>
          </div>
        </div>
      </div>
      
      {/* Область канваса */}
      <div 
        className={`flex-1 overflow-auto p-8 ${draggedOver ? 'bg-primary/5' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
          className="mx-auto transition-all"
          style={{ maxWidth: previewMode === 'mobile' ? '480px' : '800px' }}
        >
          {template.rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <GripVertical className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Добавьте строку</h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-md">
                Выберите структуру на панели слева
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => addRow(1)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                >
                  + Добавить строку
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {template.rows.map((row, idx) => (
                <CanvasRow
                  key={row.id}
                  row={row}
                  rowIndex={idx}
                  onMoveRow={moveRow}
                  onDeleteRow={deleteRow}
                  totalRows={template.rows.length}
                />
              ))}
              
              {/* Кнопка добавления строки внизу */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => addRow(1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Добавить строку
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailCanvas;
