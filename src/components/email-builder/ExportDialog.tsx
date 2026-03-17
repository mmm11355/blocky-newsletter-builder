import React, { useState, useMemo } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { Copy, Download, X, Check, FileCode, AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ExportDialog: React.FC<Props> = ({ open, onClose }) => {
  const { generateHTML, template } = useEmailBuilder();
  const [copied, setCopied] = useState(false);

  const hasBase64Images = useMemo(() => {
    return template.rows.some(row =>
      row.cells.some(cell =>
        cell.some(block =>
          (block.src && block.src.startsWith('data:')) ||
          (block.menuLogoSrc && block.menuLogoSrc.startsWith('data:')) ||
          (block.bulletStyle?.customIcon && block.bulletStyle.customIcon.startsWith('data:'))
        )
      )
    );
  }, [template]);

  if (!open) return null;

  const html = generateHTML();
  const htmlSizeKB = Math.round(new Blob([html]).size / 1024);
  const isLargeEmail = htmlSizeKB > 100;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = html;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
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
            <span className="text-xs text-muted-foreground">({htmlSizeKB} KB)</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
        </div>

        {(hasBase64Images || isLargeEmail) && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex gap-2.5 items-start">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 space-y-1">
              {hasBase64Images && (
                <p><strong>Изображения загружены с ПК</strong> — большинство почтовых клиентов (Gmail, Outlook, Mail.ru) не отображают встроенные base64-изображения. Замените на URL-ссылки на хостинг изображений (imgbb.com, imgur.com и др.).</p>
              )}
              {isLargeEmail && (
                <p><strong>Большой размер письма ({htmlSizeKB} KB)</strong> — Gmail обрезает письма более 102 KB. Уменьшите количество контента или используйте внешние ссылки на изображения.</p>
              )}
            </div>
          </div>
        )}

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
