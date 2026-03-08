import { EmailTemplate, EmailBlock } from '@/types/email-builder';

export interface SavedTemplate {
  id: string;
  name: string;
  savedAt: number;
  template: EmailTemplate;
  thumbnail?: string; // first row preview description
}

export interface SavedBlock {
  id: string;
  name: string;
  savedAt: number;
  block: EmailBlock;
}

const TEMPLATES_KEY = 'mailcraft_saved_templates';
const BLOCKS_KEY = 'mailcraft_saved_blocks';

export const getSavedTemplates = (): SavedTemplate[] => {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
  } catch { return []; }
};

export const saveTemplate = (name: string, template: EmailTemplate): SavedTemplate => {
  const saved: SavedTemplate = {
    id: crypto.randomUUID(),
    name,
    savedAt: Date.now(),
    template: JSON.parse(JSON.stringify(template)),
  };
  const all = getSavedTemplates();
  all.unshift(saved);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(all));
  return saved;
};

export const deleteTemplate = (id: string) => {
  const all = getSavedTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(all));
};

export const getSavedBlocks = (): SavedBlock[] => {
  try {
    return JSON.parse(localStorage.getItem(BLOCKS_KEY) || '[]');
  } catch { return []; }
};

export const saveBlock = (name: string, block: EmailBlock): SavedBlock => {
  const saved: SavedBlock = {
    id: crypto.randomUUID(),
    name,
    savedAt: Date.now(),
    block: JSON.parse(JSON.stringify(block)),
  };
  const all = getSavedBlocks();
  all.unshift(saved);
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(all));
  return saved;
};

export const deleteSavedBlock = (id: string) => {
  const all = getSavedBlocks().filter(b => b.id !== id);
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(all));
};
