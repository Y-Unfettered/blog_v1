const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, process.env.BLOG_DATA_DIR || 'data/seed');

const sectionTagMap = {
  '1': ['2', '3', '9', '15'],
  '2': ['7', '13', '19', '20'],
  '3': ['6', '4', '16', '18'],
  '4': ['11', '10', '19', '14'],
  '5': ['8', '12', '15', '9'],
};

const sectionTemplates = {
  '1': {
    intros: [
      '这篇内容围绕视觉表达、构图判断和执行流程来展开，重点不是堆素材，而是把产出路径拆清楚。',
      '如果想把灵感变成可复用的方法，关键在于建立参考、草图、审阅和定稿之间的稳定节奏。',
    ],
    focuses: ['画面结构', '风格统一', '素材整理', '审美判断'],
    actions: ['先收集 10 个参考案例', '拆出 3 个主视觉关键词', '先做低保真草图再上细节', '最后统一字体和留白'],
    codeLang: 'python',
    code: [
      'palette = ["#111827", "#3b82f6", "#f59e0b"]',
      'layout_score = sum([0.35, 0.25, 0.2, 0.2])',
      'print("design-ready", layout_score)',
    ],
  },
  '2': {
    intros: [
      '这篇文章从概念、落地和避坑三个层面整理要点，方便后续回看时快速找到解决路径。',
      '与其堆零散技巧，不如先把边界、输入输出和调试方式整理清楚，后面的维护成本会低很多。',
    ],
    focuses: ['概念边界', '实现思路', '调试链路', '维护成本'],
    actions: ['先列出输入与输出', '明确最小可运行版本', '补一条自检脚本', '最后再抽公共封装'],
    codeLang: 'javascript',
    code: [
      'const pipeline = ["plan", "implement", "verify"]',
      'const status = pipeline.join(" -> ")',
      'console.log(status)',
    ],
  },
  '3': {
    intros: [
      '工具好不好，不只看功能数量，更看是否能嵌进现有工作流并持续节省时间。',
      '真正值得留下的工具，通常都满足三个条件：启动快、反馈快、迁移成本低。',
    ],
    focuses: ['使用场景', '配置成本', '协作效率', '长期维护'],
    actions: ['先限定使用场景', '记录默认配置', '列出协作注意点', '每两周复盘一次是否继续保留'],
    codeLang: 'python',
    code: [
      'workflow = {"capture": 2, "process": 3, "deliver": 4}',
      'saved_minutes = sum(workflow.values())',
      'print("saved", saved_minutes)',
    ],
  },
  '4': {
    intros: [
      '问题排查最怕只记结论不记过程，所以这篇内容会把复现条件、定位路径和最终修复一起整理。',
      '很多线上问题不是不会修，而是当时没把上下文记录下来，导致第二次还要重新踩一遍。',
    ],
    focuses: ['复现条件', '定位方法', '修复动作', '回归验证'],
    actions: ['先稳定复现条件', '缩小影响范围', '记录临时修复和最终修复差异', '补验证步骤'],
    codeLang: 'sql',
    code: [
      'SELECT id, status FROM incidents WHERE resolved = 0;',
      '-- narrow down the active issue scope',
      'UPDATE incidents SET resolved = 1 WHERE id = 1;',
    ],
  },
  '5': {
    intros: [
      '这篇内容更偏个人观察，会从体验、判断和后续行动三个角度来写，不追求结论绝对正确。',
      '有些生活主题不需要宏大叙事，把真实感受、细节触发点和后续改变写清楚反而更有价值。',
    ],
    focuses: ['真实感受', '细节观察', '个人判断', '后续行动'],
    actions: ['先记下触发点', '再写当下感受', '最后补一条后续行动', '隔一段时间回看是否仍认同'],
    codeLang: 'bash',
    code: [
      'mood = ["observe", "record", "adjust"]',
      'print("life-loop:", " / ".join(mood))',
      'print("keep going")',
    ],
  },
};

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), 'utf8'));
}

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createDate(dayOffset) {
  const start = new Date(Date.UTC(2026, 0, 1, 9, 0, 0));
  start.setUTCDate(start.getUTCDate() + dayOffset);
  return start;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildTagIds(section, category, variant, tagIds) {
  const result = [];
  const add = (id) => {
    const value = String(id || '').trim();
    if (!value || result.includes(value) || !tagIds.has(value)) {
      return;
    }
    result.push(value);
  };

  (sectionTagMap[String(section.id)] || []).forEach(add);

  const categorySlug = String(category.slug || '').toLowerCase();
  const categoryName = String(category.name || '').toLowerCase();

  if (categorySlug.includes('ai') || categoryName.includes('ai')) add('1');
  if (categorySlug.includes('design') || categoryName.includes('设计')) add('2');
  if (categorySlug.includes('tutorial') || categoryName.includes('教程')) add('5');
  if (categorySlug.includes('tools') || categoryName.includes('工具')) add('6');
  if (categorySlug.includes('learning') || categoryName.includes('学习')) add('8');
  if (categorySlug.includes('share') || categoryName.includes('分享')) add('9');
  if (categorySlug.includes('debug') || categoryName.includes('调试')) add('11');
  if (categorySlug.includes('guide') || categoryName.includes('指南')) add('19');

  add(variant === 1 ? '13' : '14');
  add(variant === 1 ? '20' : '15');

  return result.slice(0, 4);
}

function buildTitle(category, variant) {
  if (variant === 1) {
    return `${category.name}实战清单：从准备到落地的第一套流程`;
  }
  return `${category.name}复盘笔记：把一次产出整理成长期方法`;
}

function buildSummary(section, category, variant) {
  if (variant === 1) {
    return `围绕${section.name}栏目下的「${category.name}」分类，整理一套可以直接上手的执行清单，覆盖准备、判断和落地步骤。`;
  }
  return `基于${category.name}的真实实践视角，复盘一次完整产出过程，补齐决策依据、问题记录和后续优化方向。`;
}

function buildContent(section, category, variant, template, postId) {
  const focusA = template.focuses[(postId + variant) % template.focuses.length];
  const focusB = template.focuses[(postId + variant + 1) % template.focuses.length];
  const intro = template.intros[(variant - 1) % template.intros.length];
  const actionStart = (postId + variant) % template.actions.length;
  const actions = Array.from({ length: 4 }, (_, index) => template.actions[(actionStart + index) % template.actions.length]);
  const variantLine = variant === 1
    ? '这一篇偏向搭骨架，帮助后续快速启动。'
    : '这一篇偏向复盘和沉淀，重点是把经验抽象出来。';

  return [
    `# ${buildTitle(category, variant)}`,
    '',
    '## 主题背景',
    '',
    intro,
    variantLine,
    `把「${category.name}」放到当前站点里看，它更适合承载 ${focusA} 和 ${focusB} 这两类内容。`,
    '',
    '## 本次写作关注什么',
    '',
    `- 栏目：${section.name}`,
    `- 分类：${category.name}`,
    `- 关键词：${focusA}、${focusB}`,
    '- 目标：形成可复用、可继续扩写的文章骨架',
    '',
    '## 建议的执行步骤',
    '',
    ...actions.map((item, index) => `${index + 1}. ${item}`),
    '',
    '## 记录一段可复用的示例',
    '',
    `\`\`\`${template.codeLang}`,
    ...template.code,
    '```',
    '',
    '## 写完之后要补什么',
    '',
    `- 给这篇内容补一张更贴近 ${category.name} 的封面图`,
    '- 把当前做法继续拆成清单、案例或对比文章',
    '- 如果后面要做前端展示优化，这一类内容很适合拿来测卡片、列表和详情页',
    '',
    '## 小结',
    '',
    `这篇文章先作为 ${section.name} / ${category.name} 分类下的标准样板，后面你要继续细化主题时，可以直接在这套结构上扩写。`,
    '',
  ].join('\n');
}

function main() {
  const sections = readJson('sections.json');
  const categories = readJson('categories.json');
  const tags = readJson('tags.json');
  const tagIds = new Set(tags.map((tag) => String(tag.id || '').trim()).filter(Boolean));

  const posts = [];
  let postId = 1;
  let dayOffset = 0;

  sections.forEach((section) => {
    const sectionCategories = categories
      .filter((category) => String(category.sectionId) === String(section.id))
      .sort((left, right) => {
        const orderDiff = (Number(left.order) || 0) - (Number(right.order) || 0);
        if (orderDiff !== 0) {
          return orderDiff;
        }
        return String(left.name || '').localeCompare(String(right.name || ''), 'zh-CN');
      });

    const template = sectionTemplates[String(section.id)] || sectionTemplates['2'];

    sectionCategories.forEach((category, categoryIndex) => {
      [1, 2].forEach((variant) => {
        const createdAt = createDate(dayOffset);
        const updatedAt = createDate(dayOffset + (variant === 1 ? 1 : 2));
        const currentId = String(postId);
        const tagList = buildTagIds(section, category, variant, tagIds);

        posts.push({
          id: currentId,
          title: buildTitle(category, variant),
          slug: `${normalizeSlug(section.slug || section.id)}/${normalizeSlug(category.slug || category.id)}/post-${variant}`,
          summary: buildSummary(section, category, variant),
          cover: `https://picsum.photos/seed/${encodeURIComponent(`${section.slug}-${category.slug}-${variant}`)}/1400/800`,
          content: buildContent(section, category, variant, template, postId),
          categories: [String(category.id)],
          categoryIds: [String(category.id)],
          categoryId: String(category.id),
          tags: tagList,
          tagIds: tagList,
          status: 'published',
          published: true,
          pinned: variant === 1 && categoryIndex === 0,
          created_at: formatDate(createdAt),
          updated_at: formatDate(updatedAt),
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
          readingTime: 5 + ((postId + variant) % 5),
          sectionId: String(section.id),
        });

        postId += 1;
        dayOffset += 1;
      });
    });
  });

  fs.writeFileSync(path.join(DATA_DIR, 'posts.json'), JSON.stringify(posts, null, 2) + '\n', 'utf8');
  console.log(`RESET_POSTS_OK ${posts.length}`);
}

main();
