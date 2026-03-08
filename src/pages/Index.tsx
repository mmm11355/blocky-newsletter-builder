import { useState } from 'react';
import { EmailBuilderProvider } from '@/context/EmailBuilderContext';
import ElementsSidebar from '@/components/email-builder/ElementsSidebar';
import EmailCanvas from '@/components/email-builder/EmailCanvas';
import PropertyPanel from '@/components/email-builder/PropertyPanel';
import ExportDialog from '@/components/email-builder/ExportDialog';
import { Code2, Mail } from 'lucide-react';

const Index = () => {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <EmailBuilderProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">MailCraft</span>
          </div>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
          >
            <Code2 className="h-4 w-4" />
            Экспорт HTML
          </button>
        </header>

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">
          <ElementsSidebar />
          <EmailCanvas />
          <PropertyPanel />
        </div>
      </div>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </EmailBuilderProvider>
  );
};

export default Index;
