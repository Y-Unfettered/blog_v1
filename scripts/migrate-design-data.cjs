const fs = require('fs');
const path = require('path');

// 读取posts数据
const postsPath = path.join(__dirname, '../data/seed/posts.json');
const graphicsPath = path.join(__dirname, '../data/seed/graphics.json');

const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
const graphics = JSON.parse(fs.readFileSync(graphicsPath, 'utf8'));

// 筛选出设计创作相关的文章
const designPosts = posts.filter(p => p.slug && p.slug.startsWith('design/'));

console.log('设计创作文章数量:', designPosts.length);
console.log('当前graphics数据数量:', graphics.length);

// 将设计创作文章转换为graphics格式
const newGraphics = designPosts.map(post => {
  return {
    title: post.title,
    content: post.content,
    summary: post.summary,
    images: post.cover ? [post.cover] : [],
    cover: post.cover || '',
    topics: [], // 可以从内容中提取主题
    sectionId: '1', // 设计创作栏目ID
    categoryId: post.categories && post.categories.length ? post.categories[0] : '',
    tagIds: post.tags || [],
    status: post.status || 'published',
    published: true,
    id: `graphic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    slug: post.slug,
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: post.updatedAt || new Date().toISOString(),
    created_at: post.created_at || new Date().toISOString().split('T')[0],
    updated_at: post.updated_at || new Date().toISOString().split('T')[0]
  };
});

// 合并数据
const allGraphics = [...graphics, ...newGraphics];

// 保存到graphics.json
fs.writeFileSync(graphicsPath, JSON.stringify(allGraphics, null, 2));

console.log('迁移完成！新的graphics数据数量:', allGraphics.length);
console.log('迁移的设计创作文章:');
newGraphics.forEach((g, i) => {
  console.log(`${i+1}. ${g.title} -> ${g.id}`);
});