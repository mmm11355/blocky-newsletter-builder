import { useState } from 'react';
import { EmailBuilderProvider } from '@/context/EmailBuilderContext';
import ElementsSidebar from '@/components/email-builder/ElementsSidebar';
import EmailCanvas from '@/components/email-builder/EmailCanvas';
import PropertyPanel from '@/components/email-builder/PropertyPanel';
import ExportDialog from '@/components/email-builder/ExportDialog';
import { Code2, Mail, Sparkles } from 'lucide-react';

const Index = () => {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <EmailBuilderProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center glow-primary">
              <Mail className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">MailCraft</span>
            <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">beta</span>
          </div>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 text-sm font-semibold transition-all glow-primary"
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
