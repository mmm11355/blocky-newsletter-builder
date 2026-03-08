import React, { useState } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { Copy, Download, X, Check, FileCode } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl shadow-black/30 border border-border max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <FileCode className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Экспорт HTML</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-auto p-5">
          <pre className="bg-secondary/50 rounded-xl p-4 text-xs font-mono text-secondary-foreground overflow-auto max-h-[50vh] whitespace-pre-wrap break-all border border-border/50">{html}</pre>
        </div>
        <div className="p-5 border-t border-border flex gap-2 justify-end">
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors">
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 text-sm font-semibold transition-all glow-primary">
            <Download className="h-4 w-4" />
            Скачать HTML
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
