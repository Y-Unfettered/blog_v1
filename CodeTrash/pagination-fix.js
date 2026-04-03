// 分页修复补丁 - 将此文件内容合并到 index-single.html 的 script 标签中

// 1. 在全局数据部分添加（约第 445 行）：
/*
    let sectionsPage = 1;
    let categoriesPage = 1;
    let tagsPage = 1;
    const sectionsPageSize = 10;
    const categoriesPageSize = 10;
    const tagsPageSize = 10;
*/

// 2. 替换 loadSectionsTable 函数为带分页的版本
function loadSectionsTable() {
  const sections = [
    {id:0,name:'首页',slug:'home',type:'special'},
    {id:1,name:'设计创作',slug:'design',type:'category'},
    {id:2,name:'技术笔记',slug:'tech',type:'category'},
    {id:3,name:'工具分享',slug:'tools',type:'category'},
    {id:4,name:'问题记录',slug:'issues',type:'category'},
    {id:5,name:'生活随笔',slug:'life',type:'category'},
    {id:6,name:'关于我',slug:'about',type:'special'}
  ];
  
  const total = sections.length;
  const totalPages = Math.ceil(total / sectionsPageSize);
  const start = (sectionsPage - 1) * sectionsPageSize;
  const pageData = sections.slice(start, start + sectionsPageSize);
  
  document.getElementById('sectionsTableBody').innerHTML = pageData.map(s => {
    const catCount = s.type === 'special' ? '-' : allCategories.filter(c => String(c.sectionId) === String(s.id)).length;
    return `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.slug}</td><td>${s.type}</td><td>-</td><td>-</td><td>${catCount}</td><td><button>编辑</button><button>删除</button></td></tr>`;
  }).join('');
  
  document.getElementById('sectionsCurrentPage').textContent = sectionsPage;
  document.getElementById('sectionsTotalPages').textContent = totalPages;
  document.getElementById('sectionsTotal').textContent = total;
  
  renderPagination('sectionsPagination', sectionsPage, totalPages, 'changeSectionsPage');
}

function changeSectionsPage(p) {
  const totalPages = Math.ceil(7 / sectionsPageSize);
  if (p < 1 || p > totalPages) return;
  sectionsPage = p;
  loadSectionsTable();
}

// 3. 替换 loadCategoriesTable 函数
function loadCategoriesTable() {
  const sections = {1:'设计创作',2:'技术笔记',3:'工具分享',4:'问题记录',5:'生活随笔'};
  const total = allCategories.length;
  const totalPages = Math.ceil(total / categoriesPageSize);
  const start = (categoriesPage - 1) * categoriesPageSize;
  const pageData = allCategories.slice(start, start + categoriesPageSize);
  
  document.getElementById('categoriesTableBody').innerHTML = pageData.map(c => {
    const articleCount = allPosts.filter(p => String(p.categoryId) === String(c.id) || (p.categoryIds||[]).some(id => String(id) === String(c.id))).length;
    return `<tr><td>${c.name}</td><td>${c.slug}</td><td>${sections[c.sectionId]||'-'}</td><td>${c.color}</td><td>${articleCount}</td><td><button>编辑</button><button>删除</button></td></tr>`;
  }).join('');
  
  document.getElementById('categoriesCurrentPage').textContent = categoriesPage;
  document.getElementById('categoriesTotalPages').textContent = totalPages;
  document.getElementById('categoriesTotal').textContent = total;
  
  renderPagination('categoriesPagination', categoriesPage, totalPages, 'changeCategoriesPage');
}

function changeCategoriesPage(p) {
  const totalPages = Math.ceil(allCategories.length / categoriesPageSize);
  if (p < 1 || p > totalPages) return;
  categoriesPage = p;
  loadCategoriesTable();
}

// 4. 替换 loadTagsPage 函数
function loadTagsPage() {
  const total = allTags.length;
  const totalPages = Math.ceil(total / tagsPageSize);
  const start = (tagsPage - 1) * tagsPageSize;
  const pageData = allTags.slice(start, start + tagsPageSize);
  
  document.getElementById('tagCloud').innerHTML = allTags.map(t => 
    `<span class="px-3 py-1.5 bg-gray-800 rounded-lg text-sm">${t.name}</span>`
  ).join('');
  
  document.getElementById('tagsTableBody').innerHTML = pageData.map(t => {
    const usage = allPosts.filter(p => (p.tagIds||[]).includes(t.id)).length;
    return `<tr><td>${t.name}</td><td>${t.slug}</td><td>${t.color}</td><td>${usage}</td><td><button>编辑</button><button>删除</button></td></tr>`;
  }).join('');
  
  document.getElementById('tagsCurrentPage').textContent = tagsPage;
  document.getElementById('tagsTotalPages').textContent = totalPages;
  document.getElementById('tagsTotal').textContent = total;
  
  renderPagination('tagsPagination', tagsPage, totalPages, 'changeTagsPage');
}

function changeTagsPage(p) {
  const totalPages = Math.ceil(allTags.length / tagsPageSize);
  if (p < 1 || p > totalPages) return;
  tagsPage = p;
  loadTagsPage();
}

// 通用分页渲染函数
function renderPagination(containerId, current, total, changeFn) {
  let html = `<button onclick="${changeFn}(${current-1})" ${current===1?'disabled':''}>上一页</button>`;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current-1 && i <= current+1)) {
      html += `<button onclick="${changeFn}(${i})" class="${i===current?'active':''}">${i}</button>`;
    } else if (i === current-2 || i === current+2) {
      html += `<span>...</span>`;
    }
  }
  html += `<button onclick="${changeFn}(${current+1})" ${current===total?'disabled':''}>下一页</button>`;
  document.getElementById(containerId).innerHTML = html;
}
