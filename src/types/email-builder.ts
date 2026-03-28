export type BlockType = 'heading' | 'text' | 'image' | 'button' | 'list' | 'menu' | 'social' | 'testimonial' | 'speaker';

export type ColumnLayout = 1 | 2 | 3;

export type BulletType = 'disc' | 'check' | 'number' | 'custom';

export type MenuLayout = 'horizontal' | 'vertical';

export interface SocialLink {
  network: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'telegram' | 'tiktok' | 'vk' | 'whatsapp';
  url: string;
}

export interface SocialBlock extends BaseBlock {
  type: 'social';
  links: SocialLink[];
  iconSize: number;
  iconColor: string;
  iconBgColor: string;
  layout: 'horizontal' | 'vertical';
  gap: number;
}

export interface TestimonialBlock extends BaseBlock {
  type: 'testimonial';
  quote: string;
  authorName: string;
  authorTitle: string;
  avatarUrl: string;
  rating: number;
}

export interface SpeakerBlock extends BaseBlock {
  type: 'speaker';
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  company: string;
  socialLinks: SocialLink[];
}

export interface ListBulletStyle {
  type: BulletType;
  color: string;
  size: number;
  fontWeight: string;
  customIcon: string;
  offsetX: number;
  offsetY: number;
}

export interface MenuItem {
  label: string;
  href: string;
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  content: string;
  style: BlockStyle;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
}

export interface TextBlock extends BaseBlock {
  type: 'text';
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  href: string;
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  href: string;
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  listItems: string[];
  bulletStyle: ListBulletStyle;
}

export interface MenuBlock extends BaseBlock {
  type: 'menu';
  menuItems: MenuItem[];
  menuLayout: MenuLayout;
  menuLogoSrc: string;
  menuLogoWidth: number;
  menuLogoHref: string;
  menuGap: number;
}

export type EmailBlock = HeadingBlock | TextBlock | ImageBlock | ButtonBlock | ListBlock | MenuBlock | SocialBlock | TestimonialBlock | SpeakerBlock;

export interface BlockStyle {
  color: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  lineHeight: number;
  width: string;
  mobileWidth: string;
}

export interface CellStyle {
  backgroundColor: string;
  borderRadius: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

export interface EmailRow {
  id: string;
  columns: number;
  cells: EmailBlock[][];
  style: {
    backgroundColor: string;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
  };
  cellGap?: number;
  mobileStack?: boolean;
  cellStyles?: CellStyle[];
}

export interface EmailTemplate {
  rows: EmailRow[];
  globalStyle: {
    backgroundColor: string;
    maxWidth: number;
    fontFamily: string;
  };
}

export const createBlock = (type: BlockType): EmailBlock => {
  const baseStyle: BlockStyle = {
    color: '#000000',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'inherit',
    textAlign: 'left',
    backgroundColor: 'transparent',
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    borderWidth: 0,
    borderColor: '#cccccc',
    borderRadius: 0,
    lineHeight: 1.5,
    width: '100%',
    mobileWidth: '100%',
  };

  switch (type) {
    case 'heading':
      return {
        id: crypto.randomUUID(),
        type: 'heading',
        content: 'Заголовок',
        style: { ...baseStyle, fontSize: 24, fontWeight: '700', textAlign: 'center' },
      } as HeadingBlock;
    case 'text':
      return {
        id: crypto.randomUUID(),
        type: 'text',
        content: 'Здесь ваш текст. Нажмите чтобы отредактировать.',
        style: { ...baseStyle, textAlign: 'left' },
      } as TextBlock;
    case 'image':
      return {
        id: crypto.randomUUID(),
        type: 'image',
        content: '',
        style: { ...baseStyle, textAlign: 'center', paddingTop: 0, paddingBottom: 0 },
        src: 'https://placehold.co/600x300/e2e8f0/64748b?text=Image',
        alt: 'Изображение',
        href: '',
      } as ImageBlock;
    case 'button':
      return {
        id: crypto.randomUUID(),
        type: 'button',
        content: 'Кнопка',
        style: { ...baseStyle, backgroundColor: '#3b82f6', color: '#ffffff', textAlign: 'center', borderRadius: 8, paddingTop: 12, paddingBottom: 12, width: 'auto' },
        href: '#',
      } as ButtonBlock;
    case 'list':
      return {
        id: crypto.randomUUID(),
        type: 'list',
        content: '',
        style: { ...baseStyle, textAlign: 'left' },
        listItems: ['Пункт списка 1', 'Пункт списка 2', 'Пункт списка 3'],
        bulletStyle: { type: 'disc', color: '#333333', size: 16, fontWeight: '400', customIcon: '', offsetX: 0, offsetY: 0 },
      } as ListBlock;
    case 'menu':
      return {
        id: crypto.randomUUID(),
        type: 'menu',
        content: '',
        style: { ...baseStyle, textAlign: 'center', paddingTop: 16, paddingBottom: 16 },
        menuItems: [
          { label: 'Главная', href: '#' },
          { label: 'О нас', href: '#' },
          { label: 'Контакты', href: '#' },
        ],
        menuLayout: 'horizontal',
        menuLogoSrc: '',
        menuLogoWidth: 120,
        menuLogoHref: '#',
        menuGap: 16,
      } as MenuBlock;
    case 'social':
      return {
        id: crypto.randomUUID(),
        type: 'social',
        content: '',
        style: { ...baseStyle, textAlign: 'center', paddingTop: 16, paddingBottom: 16 },
        links: [
          { network: 'facebook', url: '#' },
          { network: 'instagram', url: '#' },
          { network: 'twitter', url: '#' },
        ],
        iconSize: 32,
        iconColor: '#ffffff',
        iconBgColor: '#3b5998',
        layout: 'horizontal',
        gap: 12,
      } as SocialBlock;
    case 'testimonial':
      return {
        id: crypto.randomUUID(),
        type: 'testimonial',
        content: '',
        style: { ...baseStyle, textAlign: 'left', backgroundColor: '#f9fafb', borderRadius: 16 },
        quote: 'Отличный сервис! Очень удобно создавать рассылки, поддержка отвечает мгновенно.',
        authorName: 'Анна Иванова',
        authorTitle: 'Менеджер проектов',
        avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
        rating: 5,
      } as TestimonialBlock;
    case 'speaker':
      return {
        id: crypto.randomUUID(),
        type: 'speaker',
        content: '',
        style: { ...baseStyle, textAlign: 'center', backgroundColor: '#667eea', borderRadius: 16, color: '#ffffff' },
        name: 'Дмитрий Петров',
        title: 'Эксперт по email-маркетингу',
        bio: '10 лет опыта в digital-маркетинге. Провел более 100 успешных кампаний.',
        photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        company: 'EmailPro',
        socialLinks: [
          { network: 'linkedin', url: '#' },
          { network: 'twitter', url: '#' },
        ],
      } as SpeakerBlock;
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
};

export const createRow = (columns: ColumnLayout): EmailRow => {
  const cells: EmailBlock[][] = Array(columns).fill(null).map(() => []);
  return {
    id: crypto.randomUUID(),
    columns,
    cells,
    style: {
      backgroundColor: 'transparent',
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    },
    cellGap: 0,
    mobileStack: true,
  };
};
