export const API_BASE = '/api';

export const HOME_LIMIT = 10;
export const COLUMN_PAGE_SIZE = 5;

export const DEFAULT_NAV = [
  { id: 'nav-home', label: '首页', href: '/' },
  { id: 'nav-design', label: '设计创作', href: '/design' },
  { id: 'nav-tech', label: '技术笔记', href: '/tech' },
  { id: 'nav-tools', label: '工具分享', href: '/tools' },
  { id: 'nav-issues', label: '问题记录', href: '/issues' },
  { id: 'nav-life', label: '生活随笔', href: '/life' },
  { id: 'nav-about', label: '关于我', href: '/about' },
];

export const DEFAULT_COLUMN_IMAGES = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop',
];

export const COLUMN_IMAGE_MAP = {
  设计创作: 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?q=80&w=1600&auto=format&fit=crop',
  技术笔记: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
  工具分享: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
  问题记录: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600&auto=format&fit=crop',
  生活随笔: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
};

export const DEFAULT_PROFILE = {
  name: 'Lemon',
  subtitle: '记录灵感 · 设计 · 代码',
  motto: '以持续输出为信仰，把每一次学习都变成可复用的经验。',
  avatar: '',
  coverImage: '',
  github: '',
  planet: '',
  email: '',
};

export const DEFAULT_ABOUT = {
  title: '关于这个博客',
  content: '这里记录我的学习、实验与思考，内容聚焦于现代 Web 开发、效率工具和工程实践。',
  skillsTitle: '核心技能栈',
  skills: [
    { label: 'TypeScript', icon: 'logos:typescript-icon', color: '#34d399' },
    { label: 'Rust', icon: 'logos:rust', color: '#f97316' },
    { label: 'React', icon: 'logos:react', color: '#60a5fa' },
    { label: 'Cloud Native', icon: 'logos:ebpf', color: '#a855f7' },
  ],
};
