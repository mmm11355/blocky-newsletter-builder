import { useState, useEffect } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import {
  getSavedTemplates, saveTemplate, deleteTemplate,
  getSavedBlocks, saveBlock, deleteSavedBlock,
  SavedTemplate, SavedBlock,
} from '@/lib/archive-storage';
import { Archive, FileText, Puzzle, Trash2, Download, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ArchivePanel: React.FC<Props> = ({ open, onClose }) => {
  const { template, setTemplate, getSelectedBlock, selection, addBlockFromSaved } = useEmailBuilder();
  const [tab, setTab] = useState<'templates' | 'blocks'>('templates');
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [blocks, setBlocks] = useState<SavedBlock[]>([]);
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    if (open) {
      setTemplates(getSavedTemplates());
      setBlocks(getSavedBlocks());
    }
  }, [open]);

  if (!open) return null;

  const handleSaveTemplate = () => {
    if (!saveName.trim()) return;
    saveTemplate(saveName.trim(), template);
    setTemplates(getSavedTemplates());
    setSaveName('');
    setShowSave(false);
    toast.success('Шаблон сохранён');
  };

  const handleSaveBlock = () => {
    const selected = getSelectedBlock();
    if (!selected) {
      toast.error('Сначала выберите блок на канвасе');
      return;
    }
    if (!saveName.trim()) return;
    saveBlock(saveName.trim(), selected.block);
    setBlocks(getSavedBlocks());
    setSaveName('');
    setShowSave(false);
    toast.success('Блок сохранён');
  };

  const handleLoadTemplate = (saved: SavedTemplate) => {
    setTemplate(JSON.parse(JSON.stringify(saved.template)));
    toast.success(`Шаблон "${saved.name}" загружен`);
    onClose();
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    setTemplates(getSavedTemplates());
    toast.success('Шаблон удалён');
  };

  const handleDeleteBlock = (id: string) => {
    deleteSavedBlock(id);
    setBlocks(getSavedBlocks());
    toast.success('Блок удалён');
  };

  const handleLoadBlock = (saved: SavedBlock) => {
    if (!selection) {
      toast.error('Сначала выберите ячейку на канвасе');
      return;
    }
    addBlockFromSaved(selection.rowId, selection.cellIndex, saved.block);
    toast.success(`Блок "${saved.name}" добавлен`);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const typeLabels: Record<string, string> = { heading: 'Заголовок', text: 'Текст', image: 'Изображение', button: 'Кнопка' };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative ml-auto w-[420px] max-w-full h-full bg-card border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Archive className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="font-bold text-card-foreground text-base">Архив</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-secondary-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          <button
            onClick={() => setTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2 ${tab === 'templates' ? 'border-primary text-card-foreground' : 'border-transparent text-muted-foreground hover:text-card-foreground'}`}
          >
            <FileText className="h-4 w-4" />
            Шаблоны ({templates.length})
          </button>
          <button
            onClick={() => setTab('blocks')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2 ${tab === 'blocks' ? 'border-primary text-card-foreground' : 'border-transparent text-muted-foreground hover:text-card-foreground'}`}
          >
            <Puzzle className="h-4 w-4" />
            Блоки ({blocks.length})
          </button>
        </div>

        {/* Save bar */}
        <div className="p-3 border-b border-border shrink-0">
          {showSave ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (tab === 'templates' ? handleSaveTemplate() : handleSaveBlock())}
                placeholder={tab === 'templates' ? 'Название шаблона...' : 'Название блока...'}
                className="flex-1 rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                onClick={tab === 'templates' ? handleSaveTemplate : handleSaveBlock}
                className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Save className="h-4 w-4" />
              </button>
              <button onClick={() => { setShowSave(false); setSaveName(''); }} className="px-2 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSave(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-card-foreground text-sm font-medium transition-all"
            >
              <Plus className="h-4 w-4" />
              {tab === 'templates' ? 'Сохранить текущий шаблон' : 'Сохранить выбранный блок'}
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {tab === 'templates' ? (
            templates.length === 0 ? (
              <EmptyState text="Нет сохранённых шаблонов" sub="Создайте рассылку и сохраните её для повторного использования" />
            ) : (
              templates.map(t => (
                <div key={t.id} className="group rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-all">
                  <div className="p-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-card-foreground truncate">{t.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t.template.rows.length} строк · {formatDate(t.savedAt)}</p>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleLoadTemplate(t)} className="p-1.5 rounded-md hover:bg-primary/20 text-primary transition-colors" title="Загрузить">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteTemplate(t.id)} className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive transition-colors" title="Удалить">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            blocks.length === 0 ? (
              <EmptyState text="Нет сохранённых блоков" sub="Выберите блок на канвасе и сохраните его для повторного использования" />
            ) : (
              blocks.map(b => (
                <div key={b.id} className="group rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-all">
                  <div className="p-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <Puzzle className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-card-foreground truncate">{b.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{typeLabels[b.block.type] || b.block.type} · {formatDate(b.savedAt)}</p>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleLoadBlock(b)} className="p-1.5 rounded-md hover:bg-primary/20 text-primary transition-colors" title="Вставить">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteBlock(b.id)} className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive transition-colors" title="Удалить">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ text: string; sub: string }> = ({ text, sub }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
      <Archive className="h-7 w-7 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-card-foreground/70">{text}</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">{sub}</p>
  </div>
);

export default ArchivePanel;
