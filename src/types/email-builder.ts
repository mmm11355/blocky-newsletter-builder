export type BlockType = 'heading' | 'text' | 'image' | 'button';
export type ColumnLayout = 1 | 2 | 3;

export interface BlockStyle {
  color: string;
  fontSize: number;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  lineHeight: number;
}

export interface EmailBlock {
  id: string;
  type: BlockType;
  content: string;
  style: BlockStyle;
  // for image
  src?: string;
  alt?: string;
  // for button
  href?: string;
}

export interface EmailRow {
  id: string;
  columns: ColumnLayout;
  cells: EmailBlock[][];
  style: {
    backgroundColor: string;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
  };
}

export interface EmailTemplate {
  rows: EmailRow[];
  globalStyle: {
    backgroundColor: string;
    maxWidth: number;
    fontFamily: string;
  };
}

export const defaultBlockStyle: BlockStyle = {
  color: '#333333',
  fontSize: 16,
  fontWeight: '400',
  textAlign: 'left',
  backgroundColor: 'transparent',
  paddingTop: 10,
  paddingRight: 10,
  paddingBottom: 10,
  paddingLeft: 10,
  borderWidth: 0,
  borderColor: '#cccccc',
  borderRadius: 0,
  lineHeight: 1.5,
};

export const createBlock = (type: BlockType): EmailBlock => {
  const id = crypto.randomUUID();
  const base = { id, type, style: { ...defaultBlockStyle } };

  switch (type) {
    case 'heading':
      return { ...base, content: 'Заголовок', style: { ...base.style, fontSize: 28, fontWeight: '700', textAlign: 'center' } };
    case 'text':
      return { ...base, content: 'Здесь ваш текст. Нажмите чтобы отредактировать.' };
    case 'image':
      return { ...base, content: '', src: 'https://placehold.co/600x300/e2e8f0/64748b?text=Image', alt: 'Image', style: { ...base.style, textAlign: 'center' } };
    case 'button':
      return { ...base, content: 'Нажми меня', href: '#', style: { ...base.style, backgroundColor: '#3b5bdb', color: '#ffffff', textAlign: 'center', paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, borderRadius: 6, fontWeight: '600' } };
  }
};

export const createRow = (columns: ColumnLayout): EmailRow => ({
  id: crypto.randomUUID(),
  columns,
  cells: Array.from({ length: columns }, () => []),
  style: {
    backgroundColor: '#ffffff',
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
});
