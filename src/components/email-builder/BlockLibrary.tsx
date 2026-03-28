import { useState, useEffect } from 'react';
import { useEmailBuilder } from '@/context/EmailBuilderContext';
import { EmailBlock, createBlock } from '@/types/email-builder';
import { Save, FolderOpen, Plus, X, Trash2 } from 'lucide-react';

interface SavedBlock {
  id: string;
  name: string;
  type: string;
  data: EmailBlock;
  createdAt: number;
}

const STORAGE_KEY = 'mailcraft_saved_blocks';

const BlockLibrary = () => {
  const { addBlockFromSaved, selection, template } = useEmailBuilder();
  const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>([]);
  const [blockName, setBlockName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<EmailBlock | null>(null);

  // Загрузка сохранённых блоков из localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedBlocks(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load saved blocks');
      }
    }
  }, []);

  // Сохранение блоков в localStorage
  const saveToStorage = (blocks: SavedBlock[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    setSavedBlocks(blocks);
  };

  // Сохранение текущего выделенного блока
  const handleSaveBlock = () => {
    if (!selectedBlock || !blockName.trim()) return;
    
    const newBlock: SavedBlock = {
      id: crypto.randomUUID(),
      name: blockName.trim(),
      type: selectedBlock.type,
      data: selectedBlock,
      createdAt: Date.now(),
    };
    
    saveToStorage([...savedBlocks, newBlock]);
    setBlockName('');
    setShowSaveDialog(false);
    setSelectedBlock(null);
  };

  // Добавление блока на канвас
  const handleAddBlock = (savedBlock: SavedBlock) => {
    if (!selection) {
      alert('Сначала выберите ячейку, куда добавить блок');
      return;
    }
    const { rowId, cellIndex } = selection;
    addBlockFromSaved(rowId, cellIndex, savedBlock.data);
  };

  // Удаление сохранённого блока
  const handleDeleteBlock = (id: string) => {
    saveToStorage(savedBlocks.filter(b => b.id !== id));
  };

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-y-auto scrollbar-thin p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">📦 Библиотека блоков</h3>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="p-1.5 rounded-lg bg-primary text-white text-xs flex items-center gap-1"
          disabled={!selectedBlock}
          title={!selectedBlock ? "Сначала выберите блок на канвасе" : "Сохранить выбранный блок"}
        >
          <Save className="h-3 w-3" />
          Сохранить блок
        </button>
      </div>

      {savedBlocks.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm py-8">
          <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Нет сохранённых блоков</p>
          <p className="text-xs mt-1">Выберите блок на канвасе и нажмите "Сохранить блок"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {savedBlocks.map(block => (
            <div
              key={block.id}
              className="p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => handleAddBlock(block)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm truncate">{block.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {block.type === 'heading' && 'Заголовок'}
                {block.type === 'text' && 'Текст'}
                {block.type === 'image' && 'Изображение'}
                {block.type === 'button' && 'Кнопка'}
                {block.type === 'list' && 'Список'}
                {block.type === 'menu' && 'Меню'}
                {block.type === 'social' && 'Соцсети'}
                {block.type === 'testimonial' && 'Отзыв'}
                {block.type === 'speaker' && 'Спикер'}
                {block.type === 'contact' && 'Контакты'}
                {block.type === 'links' && 'Ссылки'}
                {' · '}
                {new Date(block.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Диалог сохранения блока */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-5 w-80 shadow-xl border border-border">
            <h4 className="font-semibold mb-3">Сохранить блок</h4>
            <input
              type="text"
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              placeholder="Название блока"
              className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowSaveDialog(false); setBlockName(''); }}
                className="px-3 py-1.5 rounded-lg bg-secondary text-sm"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveBlock}
                disabled={!blockName.trim()}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm disabled:opacity-50"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockLibrary;
