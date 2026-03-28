import { useState } from 'react';
import { EmailBuilderProvider, useEmailBuilder } from '@/context/EmailBuilderContext';
import ElementsSidebar from '@/components/email-builder/ElementsSidebar';
import EmailCanvas from '@/components/email-builder/EmailCanvas';
import PropertyPanel from '@/components/email-builder/PropertyPanel';
import ExportDialog from '@/components/email-builder/ExportDialog';
import ArchivePanel from '@/components/email-builder/ArchivePanel';
import BlockLibrary from '@/components/email-builder/BlockLibrary';
import { Code2, Mail, Archive, Download, Upload, Package, X } from 'lucide-react';

// Внутренний компонент, который использует useEmailBuilder
const MainContent = () => {
  const [exportOpen, setExportOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { template, setTemplate } = useEmailBuilder();

  // Экспорт шаблона в JSON файл
  const handleExportTemplate = () => {
    const dataStr = JSON.stringify(template, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-template-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Импорт шаблона из JSON файла
  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTemplate = JSON.parse(e.target?.result as string);
        if (importedTemplate && typeof importedTemplate === 'object' && Array.isArray(importedTemplate.rows)) {
          setTemplate(importedTemplate);
          alert('✅ Шаблон успешно загружен!');
        } else {
          alert('❌ Неверный формат файла');
        }
      } catch (error) {
        alert('❌ Ошибка при чтении файла');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <>
      {/* Header */}
      <header className="h-14 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center glow-primary">
            <Mail className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">MailCraft</span>
          <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">beta</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLibraryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-semibold transition-all"
            title="Библиотека блоков"
          >
            <Package className="h-4 w-4" />
            Блоки
          </button>
          
          <button
            onClick={handleExportTemplate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-semibold transition-all"
            title="Сохранить шаблон в файл"
          >
            <Download className="h-4 w-4" />
            Сохранить
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-semibold transition-all cursor-pointer">
            <Upload className="h-4 w-4" />
            Загрузить
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplate}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => setArchiveOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-semibold transition-all"
          >
            <Archive className="h-4 w-4" />
            Архив
          </button>
          
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 text-sm font-semibold transition-all glow-primary"
          >
            <Code2 className="h-4 w-4" />
            Экспорт HTML
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <ElementsSidebar />
        <EmailCanvas />
        <PropertyPanel />
      </div>

      {/* Диалоги */}
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <ArchivePanel open={archiveOpen} onClose={() => setArchiveOpen(false)} />
      
      {/* Модальное окно библиотеки блоков */}
      {libraryOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl w-[450px] max-h-[80vh] overflow-hidden shadow-xl border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-lg">📦 Библиотека блоков</h2>
              <button 
                onClick={() => setLibraryOpen(false)} 
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
              <BlockLibrary />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Главный компонент с провайдером
const Index = () => {
  return (
    <EmailBuilderProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <MainContent />
      </div>
    </EmailBuilderProvider>
  );
};

export default Index;
