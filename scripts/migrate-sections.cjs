#!/usr/bin/env node
/**
 * 数据结构迁移脚本
 * 将文章数据迁移到新的栏目结构
 * 
 * 使用方式：node scripts/migrate-sections.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'seed');

// 栏目映射（基于 slug 前缀）
const slugToSectionMap = {
  'tech-notes': '2',    // 技术笔记
  'society-life': '5',  // 生活随笔
  'design': '1',        // 设计创作
  'tools': '3',         // 工具分享
  'issues': '4',        // 问题记录
};

// 分类映射（旧的 categoryId → 新的 categoryId）
const categoryMapping = {
  '1': '5',   // 技术笔记 → 知识库
  '2': '13',  // 社会生活 → 读书心得
};

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.trim()) {
    return null;
  }
  return JSON.parse(raw);
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function migratePosts() {
  console.log('📝 开始迁移文章数据...\n');
  
  const postsFile = path.join(DATA_DIR, 'posts.json');
  const posts = readJsonFile(postsFile);
  
  if (!posts || !Array.isArray(posts)) {
    console.error('❌ 无法读取 posts.json');
    return false;
  }
  
  console.log(`📊 找到 ${posts.length} 篇文章\n`);
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  const migratedPosts = posts.map(post => {
    // 从 slug 中提取栏目信息
    const slugParts = post.slug?.split('/') || [];
    const slugPrefix = slugParts[0];
    
    // 确定栏目 ID
    let sectionId = slugToSectionMap[slugPrefix] || '2'; // 默认技术笔记
    
    // 确定分类 ID
    let categoryId = post.categoryIds?.[0] || post.categories?.[0];
    if (categoryId && categoryMapping[categoryId]) {
      categoryId = categoryMapping[categoryId];
    }
    
    // 如果没有分类，根据栏目给一个默认分类
    if (!categoryId) {
      const defaultCategories = {
        '1': '1',  // 设计创作 → AI ART
        '2': '5',  // 技术笔记 → 知识库
        '3': '9',  // 工具分享 → 效率工具
        '4': '11', // 问题记录 → Bug 排查
        '5': '13', // 生活随笔 → 读书心得
      };
      categoryId = defaultCategories[sectionId];
    }
    
    // 更新 slug 格式
    const sectionSlugs = {
      '1': 'design',
      '2': 'tech',
      '3': 'tools',
      '4': 'issues',
      '5': 'life',
    };
    const newSlug = `${sectionSlugs[sectionId]}/${slugParts.slice(1).join('/')}`;
    
    const migratedPost = {
      ...post,
      id: post.id,
      sectionId: sectionId,
      categoryId: categoryId,
      slug: newSlug,
      // 保留旧字段用于兼容
      categoryIds: post.categoryIds || post.categories || [],
      tagIds: post.tagIds || post.tags || [],
    };
    
    console.log(`  ✓ ${post.title.substring(0, 30)}...`);
    console.log(`    栏目：${sectionId}, 分类：${categoryId}, slug: ${newSlug}`);
    migratedCount++;
    
    return migratedPost;
  });
  
  console.log(`\n✅ 迁移完成：${migratedCount} 篇文章已更新，${skippedCount} 篇跳过\n`);
  
  // 备份原文件
  const backupFile = path.join(DATA_DIR, 'posts.json.backup-' + Date.now());
  fs.copyFileSync(postsFile, backupFile);
  console.log(`💾 已备份原文件：${backupFile}\n`);
  
  // 写入新数据
  writeJsonFile(postsFile, migratedPosts);
  console.log(`✨ 新数据已写入：${postsFile}\n`);
  
  return true;
}

function migrateNav() {
  console.log('📋 更新导航配置...\n');
  
  const navFile = path.join(DATA_DIR, 'nav.json');
  const nav = readJsonFile(navFile);
  
  if (!nav || !Array.isArray(nav)) {
    console.error('❌ 无法读取 nav.json');
    return false;
  }
  
  // 保留首页，其他替换为新的栏目导航
  const homepage = nav.find(item => item.url === '/' || item.name === '首页');
  
  const newNav = [
    homepage || { id: '0', name: '首页', url: '/', order: 0 },
    ...readJsonFile(path.join(DATA_DIR, 'sections.json')) || []
  ];
  
  writeJsonFile(navFile, newNav);
  console.log(`✨ 导航配置已更新：${navFile}\n`);
  
  return true;
}

// 主函数
function main() {
  console.log('🚀 开始数据结构迁移\n');
  console.log('='.repeat(50) + '\n');
  
  const postsOk = migratePosts();
  console.log('='.repeat(50) + '\n');
  
  const navOk = migrateNav();
  console.log('='.repeat(50) + '\n');
  
  if (postsOk && navOk) {
    console.log('🎉 所有迁移完成！\n');
    console.log('⚠️  请检查数据是否正确，然后重启服务。\n');
    console.log('📝 如有问题，可以从备份文件恢复。\n');
  } else {
    console.log('❌ 迁移过程中出现错误，请检查日志。\n');
  }
}

// 运行迁移
main();
