import React, { useState } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { Copy, Download, X, Check } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ExportDialog: React.FC<Props> = ({ open, onClose }) => {
  const { generateHTML } = useEmailBuilder();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const html = generateHTML();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-template.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Экспорт HTML</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="bg-secondary rounded-md p-4 text-xs font-mono text-secondary-foreground overflow-auto max-h-[50vh] whitespace-pre-wrap break-all">{html}</pre>
        </div>
        <div className="p-4 border-t border-border flex gap-2 justify-end">
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium">
            <Download className="h-4 w-4" />
            Скачать HTML
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
