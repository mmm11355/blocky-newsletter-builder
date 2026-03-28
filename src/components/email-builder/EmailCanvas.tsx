import { useEmailBuilder } from '@/context/EmailBuilderContext';
import CanvasRow from './CanvasRow';
import { Monitor, Smartphone, Plus } from 'lucide-react';

const EmailCanvas = () => {
  const { template, previewMode, setPreviewMode, setSelection, addRow } = useEmailBuilder();
  const maxW = previewMode === 'mobile' ? 375 : template.globalStyle.maxWidth;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" onClick={() => setSelection(null)}>
      {/* Toolbar */}
      <div className="h-12 bg-card/60 backdrop-blur-md border-b border-border flex items-center justify-center gap-1 px-4 shrink-0">
        <div className="flex bg-secondary rounded-lg p-0.5">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`px-3 py-1.5 rounded-md transition-all text-xs font-medium flex items-center gap-1.5 ${previewMode === 'desktop' ? 'gradient-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`px-3 py-1.5 rounded-md transition-all text-xs font-medium flex items-center gap-1.5 ${previewMode === 'mobile' ? 'gradient-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto bg-canvas p-8">
        <div
          className="mx-auto transition-all duration-300 rounded-lg shadow-2xl shadow-black/20 overflow-hidden"
          style={{
            maxWidth: maxW,
            backgroundColor: template.globalStyle.backgroundColor,
            fontFamily: template.globalStyle.fontFamily,
          }}
        >
          {template.rows.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border/50 rounded-lg m-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4 glow-primary">
                <Plus className="h-7 w-7 text-primary-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground/80">Добавьте строку</p>
              <p className="text-sm mt-1.5 text-muted-foreground">Выберите структуру на панели слева</p>
              <button
                onClick={(e) => { e.stopPropagation(); addRow(1); }}
                className="mt-4 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors"
              >
                + Добавить строку
              </button>
            </div>
          ) : (
            template.rows.map((row) => (
              <CanvasRow key={row.id} row={row} isMobile={previewMode === 'mobile'} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailCanvas;
