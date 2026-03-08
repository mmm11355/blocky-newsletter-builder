import { useEmailBuilder } from '@/context/EmailBuilderContext';
import CanvasRow from './CanvasRow';
import { Monitor, Smartphone } from 'lucide-react';

const EmailCanvas = () => {
  const { template, previewMode, setPreviewMode, setSelection } = useEmailBuilder();
  const maxW = previewMode === 'mobile' ? 375 : template.globalStyle.maxWidth;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" onClick={() => setSelection(null)}>
      {/* Toolbar */}
      <div className="h-12 bg-card border-b border-border flex items-center justify-center gap-2 px-4 shrink-0">
        <button
          onClick={() => setPreviewMode('desktop')}
          className={`p-2 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
        >
          <Monitor className="h-4 w-4" />
        </button>
        <button
          onClick={() => setPreviewMode('mobile')}
          className={`p-2 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
        >
          <Smartphone className="h-4 w-4" />
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto bg-canvas p-6">
        <div
          className="mx-auto transition-all duration-300"
          style={{
            maxWidth: maxW,
            backgroundColor: template.globalStyle.backgroundColor,
            fontFamily: template.globalStyle.fontFamily,
          }}
        >
          {template.rows.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
              <p className="text-lg font-medium">Добавьте строку</p>
              <p className="text-sm mt-1">Выберите структуру на боковой панели слева</p>
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
