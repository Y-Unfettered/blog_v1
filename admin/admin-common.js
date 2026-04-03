(function bootstrapAdminCommon() {
  const STORAGE_LOCALE_KEY = 'admin-locale';
  const STORAGE_THEME_KEY = 'theme';
  const STORAGE_TOKEN_KEY = 'token';
  const DEFAULT_LOCALE = 'zh';
  const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt'];
  const SKIP_TRANSLATE_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE']);

  const NAV_ITEMS = [
    { key: 'dashboard', label: { en: 'Overview Panel', zh: '\u6982\u89c8\u9762\u677f' }, href: '/admin/dashboard' },
    {
      key: 'content',
      label: { en: 'Content Management', zh: '\u5185\u5bb9\u7ba1\u7406' },
      children: [
        { key: 'posts', label: { en: 'Post Management', zh: '\u6587\u7ae0\u7ba1\u7406' }, href: '/admin/posts' },
        { key: 'graphics', label: { en: 'Graphic Management', zh: '\u56fe\u6587\u7ba1\u7406' }, href: '/admin/graphics' },
        { key: 'tools', label: { en: 'Tools Management', zh: '\u5de5\u5177\u7ba1\u7406' }, href: '/admin/tools' },
      ],
    },
    { key: 'navigation', label: { en: 'Navigation', zh: '\u5bfc\u822a\u7ba1\u7406' }, href: '/admin/navigation' },
    { key: 'sections', label: { en: 'Sections', zh: '\u680f\u76ee' }, href: '/admin/sections' },
    { key: 'categories', label: { en: 'Categories', zh: '\u5206\u7c7b' }, href: '/admin/categories' },
    { key: 'tags', label: { en: 'Tags', zh: '\u6807\u7b7e' }, href: '/admin/tags' },
    { key: 'settings', label: { en: 'Settings', zh: '\u8bbe\u7f6e' }, href: '/admin/settings' },
  ];

  const SHELL_TEXT = {
    brandTitle: { en: 'DevLog Admin', zh: 'DevLog \u7ba1\u7406\u540e\u53f0' },
    brandSubtitle: {
      en: 'Manage content, navigation, and site settings.',
      zh: '\u7edf\u4e00\u7ba1\u7406\u5185\u5bb9\u3001\u5bfc\u822a\u548c\u7ad9\u70b9\u914d\u7f6e\u3002',
    },
    signOut: { en: 'Sign out', zh: '\u9000\u51fa\u767b\u5f55' },
    open: { en: 'Open', zh: '\u6253\u5f00' },
    action: { en: 'Action', zh: '\u64cd\u4f5c' },
    loginExpired: { en: 'Login has expired.', zh: '\u767b\u5f55\u5df2\u8fc7\u671f\u3002' },
    invalidJson: {
      en: 'The server returned invalid JSON.',
      zh: '\u670d\u52a1\u5668\u8fd4\u56de\u4e86\u65e0\u6548\u7684 JSON\u3002',
    },
    requestFailed: {
      en: 'Request failed with status ',
      zh: '\u8bf7\u6c42\u5931\u8d25\uff0c\u72b6\u6001\u7801 ',
    },
    lessThanMinute: { en: 'Less than 1m', zh: '\u4e0d\u5230 1 \u5206\u949f' },
  };

  const UI_TEXT_PAIRS = [
    ['Overview', '\u6982\u89c8'],
    ['Overview Panel', '\u6982\u89c8\u9762\u677f'],
    ['Posts', '\u6587\u7ae0'],
    ['Content Management', '\u5185\u5bb9\u7ba1\u7406'],
    ['Post Management', '\u6587\u7ae0\u7ba1\u7406'],
    ['Graphic Management', '\u56fe\u6587\u7ba1\u7406'],
    ['Tools Management', '\u5de5\u5177\u7ba1\u7406'],
    ['Sections', '\u680f\u76ee'],
    ['Categories', '\u5206\u7c7b'],
    ['Tags', '\u6807\u7b7e'],
    ['Settings', '\u8bbe\u7f6e'],
    ['Reload', '\u91cd\u65b0\u52a0\u8f7d'],
    ['Close', '\u5173\u95ed'],
    ['Edit', '\u7f16\u8f91'],
    ['Delete', '\u5220\u9664'],
    ['Search', '\u641c\u7d22'],
    ['Name', '\u540d\u79f0'],
    ['Slug', '\u522b\u540d'],
    ['Order', '\u6392\u5e8f'],
    ['Color', '\u989c\u8272'],
    ['Preview', '\u9884\u89c8'],
    ['Description', '\u63cf\u8ff0'],
    ['Section', '\u680f\u76ee'],
    ['Category', '\u5206\u7c7b'],
    ['Status', '\u72b6\u6001'],
    ['Usage', '\u4f7f\u7528\u60c5\u51b5'],
    ['Links', '\u5173\u8054'],
    ['URL', 'URL'],
    ['Icon', '\u56fe\u6807'],
    ['Enabled', '\u542f\u7528'],
    ['Disabled', '\u505c\u7528'],
    ['Published', '\u5df2\u53d1\u5e03'],
    ['Draft', '\u8349\u7a3f'],
    ['Pinned', '\u7f6e\u9876'],
    ['Updated', '\u66f4\u65b0\u65f6\u95f4'],
    ['Reading Time', '\u9605\u8bfb\u65f6\u95f4'],
    ['Title', '\u6807\u9898'],
    ['Summary', '\u6458\u8981'],
    ['Markdown', 'Markdown'],
    ['Slug:', '\u522b\u540d\uff1a'],
    ['ID:', 'ID\uff1a'],
    ['Section:', '\u680f\u76ee\uff1a'],
    ['Category:', '\u5206\u7c7b\uff1a'],
    ['Icon:', '\u56fe\u6807\uff1a'],
    ['Order:', '\u6392\u5e8f\uff1a'],
    ['URL:', 'URL\uff1a'],
    ['Created:', '\u521b\u5efa\u65f6\u95f4\uff1a'],
    ['Updated:', '\u66f4\u65b0\u65f6\u95f4\uff1a'],
    ['Post ID:', '\u6587\u7ae0 ID\uff1a'],
    ['No section', '\u65e0\u680f\u76ee'],
    ['No category', '\u65e0\u5206\u7c7b'],
    ['No tags', '\u65e0\u6807\u7b7e'],
    ['All sections', '\u5168\u90e8\u680f\u76ee'],
    ['All categories', '\u5168\u90e8\u5206\u7c7b'],
    ['Used only', '\u4ec5\u5df2\u4f7f\u7528'],
    ['Unused only', '\u4ec5\u672a\u4f7f\u7528'],
    ['No description.', '\u6682\u65e0\u63cf\u8ff0\u3002'],
    ['No summary.', '\u6682\u65e0\u6458\u8981\u3002'],
    ['No reading time', '\u6682\u65e0\u9605\u8bfb\u65f6\u957f'],
    ['No usage data', '\u6682\u65e0\u4f7f\u7528\u6570\u636e'],
    ['No seed counter', '\u65e0\u79cd\u5b50\u8ba1\u6570'],
    ['Sign out', '\u9000\u51fa\u767b\u5f55'],
    ['Open', '\u6253\u5f00'],
    ['Action', '\u64cd\u4f5c'],
    ['Tag Management', '\u6807\u7b7e\u7ba1\u7406'],
    ['Manage tag metadata, usage, and article references from one place. Deletion is blocked when a tag is still referenced by posts.', '\u5728\u4e00\u4e2a\u9875\u9762\u7edf\u4e00\u7ba1\u7406\u6807\u7b7e\u5143\u6570\u636e\u3001\u4f7f\u7528\u60c5\u51b5\u548c\u6587\u7ae0\u5173\u8054\u3002\u5f53\u6807\u7b7e\u4ecd\u88ab\u6587\u7ae0\u5f15\u7528\u65f6\uff0c\u4e0d\u5141\u8bb8\u5220\u9664\u3002'],
    ['New Tag', '\u65b0\u5efa\u6807\u7b7e'],
    ['Total Tags', '\u6807\u7b7e\u603b\u6570'],
    ['All stored tag records.', '\u5f53\u524d\u5b58\u50a8\u7684\u5168\u90e8\u6807\u7b7e\u8bb0\u5f55\u3002'],
    ['Used Tags', '\u5df2\u4f7f\u7528\u6807\u7b7e'],
    ['Tags referenced by at least one post.', '\u81f3\u5c11\u88ab\u4e00\u7bc7\u6587\u7ae0\u5f15\u7528\u7684\u6807\u7b7e\u3002'],
    ['Unused Tags', '\u672a\u4f7f\u7528\u6807\u7b7e'],
    ['Safe candidates for cleanup.', '\u53ef\u4f5c\u4e3a\u6e05\u7406\u5019\u9009\u9879\u3002'],
    ['Most Used', '\u4f7f\u7528\u6700\u591a'],
    ['Search by tag name, slug, or id', '\u6309\u6807\u7b7e\u540d\u3001\u522b\u540d\u6216 ID \u641c\u7d22'],
    ['Usage is calculated from current posts instead of trusting stale counters in seed data.', '\u4f7f\u7528\u91cf\u57fa\u4e8e\u5f53\u524d\u6587\u7ae0\u5b9e\u65f6\u8ba1\u7b97\uff0c\u4e0d\u76f4\u63a5\u4f9d\u8d56\u79cd\u5b50\u6570\u636e\u4e2d\u53ef\u80fd\u8fc7\u65f6\u7684\u8ba1\u6570\u3002'],
    ['Tag Editor', '\u6807\u7b7e\u7f16\u8f91'],
    ['Create Tag', '\u521b\u5efa\u6807\u7b7e'],
    ['Edit Tag', '\u7f16\u8f91\u6807\u7b7e'],
    ['Save Tag', '\u4fdd\u5b58\u6807\u7b7e'],
    ['Untitled tag', '\u672a\u547d\u540d\u6807\u7b7e'],
    ['No tags match the current search.', '\u6ca1\u6709\u5339\u914d\u5f53\u524d\u641c\u7d22\u7684\u6807\u7b7e\u3002'],
    ['Loading tags...', '\u6b63\u5728\u52a0\u8f7d\u6807\u7b7e...'],
    ['Tag name is required.', '\u8bf7\u8f93\u5165\u6807\u7b7e\u540d\u79f0\u3002'],
    ['Tag slug is required.', '\u8bf7\u8f93\u5165\u6807\u7b7e\u522b\u540d\u3002'],
    ['Tag slug must be unique.', '\u6807\u7b7e\u522b\u540d\u5fc5\u987b\u552f\u4e00\u3002'],
    ['Saving tag...', '\u6b63\u5728\u4fdd\u5b58\u6807\u7b7e...'],
    ['Tag saved.', '\u6807\u7b7e\u5df2\u4fdd\u5b58\u3002'],
    ['Delete this tag?', '\u786e\u8ba4\u5220\u9664\u8be5\u6807\u7b7e\uff1f'],
    ['Deleting tag...', '\u6b63\u5728\u5220\u9664\u6807\u7b7e...'],
    ['Tag deleted.', '\u6807\u7b7e\u5df2\u5220\u9664\u3002'],
    ['Category Management', '\u5206\u7c7b\u7ba1\u7406'],
    ['Manage category metadata, section mapping, and usage from one page. Deletion is blocked while a category is still linked to posts.', '\u5728\u4e00\u4e2a\u9875\u9762\u7edf\u4e00\u7ba1\u7406\u5206\u7c7b\u5143\u6570\u636e\u3001\u680f\u76ee\u6620\u5c04\u548c\u4f7f\u7528\u60c5\u51b5\u3002\u5f53\u5206\u7c7b\u4ecd\u88ab\u6587\u7ae0\u5173\u8054\u65f6\uff0c\u4e0d\u5141\u8bb8\u5220\u9664\u3002'],
    ['New Category', '\u65b0\u5efa\u5206\u7c7b'],
    ['Total Categories', '\u5206\u7c7b\u603b\u6570'],
    ['All category records currently stored.', '\u5f53\u524d\u5b58\u50a8\u7684\u5168\u90e8\u5206\u7c7b\u8bb0\u5f55\u3002'],
    ['Used Categories', '\u5df2\u4f7f\u7528\u5206\u7c7b'],
    ['Categories referenced by at least one post.', '\u81f3\u5c11\u88ab\u4e00\u7bc7\u6587\u7ae0\u5f15\u7528\u7684\u5206\u7c7b\u3002'],
    ['Unused Categories', '\u672a\u4f7f\u7528\u5206\u7c7b'],
    ['Safe candidates for cleanup or reassignment.', '\u53ef\u4f5c\u4e3a\u6e05\u7406\u6216\u91cd\u65b0\u5206\u914d\u7684\u5019\u9009\u9879\u3002'],
    ['Linked Sections', '\u5173\u8054\u680f\u76ee'],
    ['Unique sections referenced by categories.', '\u88ab\u5206\u7c7b\u5f15\u7528\u7684\u53bb\u91cd\u680f\u76ee\u6570\u3002'],
    ['Search by name, slug, icon, or description', '\u6309\u540d\u79f0\u3001\u522b\u540d\u3001\u56fe\u6807\u6216\u63cf\u8ff0\u641c\u7d22'],
    ['Category Editor', '\u5206\u7c7b\u7f16\u8f91'],
    ['Create Category', '\u521b\u5efa\u5206\u7c7b'],
    ['Edit Category', '\u7f16\u8f91\u5206\u7c7b'],
    ['Internal description shown to editors.', '\u4ec5\u4f9b\u7f16\u8f91\u8005\u67e5\u770b\u7684\u5185\u90e8\u63cf\u8ff0\u3002'],
    ['Save Category', '\u4fdd\u5b58\u5206\u7c7b'],
    ['No categories match the current filters.', '\u6ca1\u6709\u5339\u914d\u5f53\u524d\u7b5b\u9009\u6761\u4ef6\u7684\u5206\u7c7b\u3002'],
    ['Category name is required.', '\u8bf7\u8f93\u5165\u5206\u7c7b\u540d\u79f0\u3002'],
    ['Saving category changes...', '\u6b63\u5728\u4fdd\u5b58\u5206\u7c7b\u53d8\u66f4...'],
    ['Creating category...', '\u6b63\u5728\u521b\u5efa\u5206\u7c7b...'],
    ['Category updated.', '\u5206\u7c7b\u5df2\u66f4\u65b0\u3002'],
    ['Category created.', '\u5206\u7c7b\u5df2\u521b\u5efa\u3002'],
    ['Failed to save category.', '\u4fdd\u5b58\u5206\u7c7b\u5931\u8d25\u3002'],
    ['This category is still linked to posts. Remove those links before deleting it.', '\u8be5\u5206\u7c7b\u4ecd\u5173\u8054\u6587\u7ae0\uff0c\u8bf7\u5148\u79fb\u9664\u5173\u8054\u540e\u518d\u5220\u9664\u3002'],
    ['Deleting category...', '\u6b63\u5728\u5220\u9664\u5206\u7c7b...'],
    ['Category deleted.', '\u5206\u7c7b\u5df2\u5220\u9664\u3002'],
    ['Loading categories, sections, and usage data...', '\u6b63\u5728\u52a0\u8f7d\u5206\u7c7b\u3001\u680f\u76ee\u548c\u4f7f\u7528\u6570\u636e...'],
    ['Category data loaded.', '\u5206\u7c7b\u6570\u636e\u5df2\u52a0\u8f7d\u3002'],
    ['Failed to load category data.', '\u52a0\u8f7d\u5206\u7c7b\u6570\u636e\u5931\u8d25\u3002'],
    ['Section Management', '\u680f\u76ee\u7ba1\u7406'],
    ['Manage landing sections, entry URLs, and availability. Deletion is blocked while a section is still linked to categories or posts.', '\u7edf\u4e00\u7ba1\u7406\u9996\u5c4f\u680f\u76ee\u3001\u5165\u53e3 URL \u548c\u542f\u7528\u72b6\u6001\u3002\u5f53\u680f\u76ee\u4ecd\u88ab\u5206\u7c7b\u6216\u6587\u7ae0\u5173\u8054\u65f6\uff0c\u4e0d\u5141\u8bb8\u5220\u9664\u3002'],
    ['New Section', '\u65b0\u5efa\u680f\u76ee'],
    ['Total Sections', '\u680f\u76ee\u603b\u6570'],
    ['All section entries stored in the system.', '\u7cfb\u7edf\u4e2d\u5f53\u524d\u5b58\u50a8\u7684\u5168\u90e8\u680f\u76ee\u8bb0\u5f55\u3002'],
    ['Enabled Sections', '\u5df2\u542f\u7528\u680f\u76ee'],
    ['Visible sections that can be used by navigation and pages.', '\u53ef\u7528\u4e8e\u5bfc\u822a\u548c\u9875\u9762\u7684\u53ef\u89c1\u680f\u76ee\u3002'],
    ['Sections With Categories', '\u5df2\u5173\u8054\u5206\u7c7b\u7684\u680f\u76ee'],
    ['Sections currently referenced by categories.', '\u5f53\u524d\u88ab\u5206\u7c7b\u5f15\u7528\u7684\u680f\u76ee\u3002'],
    ['Sections With Posts', '\u5df2\u5173\u8054\u6587\u7ae0\u7684\u680f\u76ee'],
    ['Sections currently referenced by posts.', '\u5f53\u524d\u88ab\u6587\u7ae0\u5f15\u7528\u7684\u680f\u76ee\u3002'],
    ['Search by name, slug, url, or icon', '\u6309\u540d\u79f0\u3001\u522b\u540d\u3001URL \u6216\u56fe\u6807\u641c\u7d22'],
    ['Enabled only', '\u4ec5\u542f\u7528'],
    ['Disabled only', '\u4ec5\u505c\u7528'],
    ['Linked only', '\u4ec5\u5df2\u5173\u8054'],
    ['Unlinked only', '\u4ec5\u672a\u5173\u8054'],
    ['Section Editor', '\u680f\u76ee\u7f16\u8f91'],
    ['Create Section', '\u521b\u5efa\u680f\u76ee'],
    ['Optional internal note for editors.', '\u53ef\u9009\u7684\u7f16\u8f91\u5185\u90e8\u5907\u6ce8\u3002'],
    ['Save Section', '\u4fdd\u5b58\u680f\u76ee'],
    ['No sections match the current filters.', '\u6ca1\u6709\u5339\u914d\u5f53\u524d\u7b5b\u9009\u6761\u4ef6\u7684\u680f\u76ee\u3002'],
    ['Linked Categories', '\u5173\u8054\u5206\u7c7b'],
    ['Linked Posts', '\u5173\u8054\u6587\u7ae0'],
    ['Edit Section', '\u7f16\u8f91\u680f\u76ee'],
    ['Section name is required.', '\u8bf7\u8f93\u5165\u680f\u76ee\u540d\u79f0\u3002'],
    ['Saving section changes...', '\u6b63\u5728\u4fdd\u5b58\u680f\u76ee\u53d8\u66f4...'],
    ['Creating section...', '\u6b63\u5728\u521b\u5efa\u680f\u76ee...'],
    ['Section updated.', '\u680f\u76ee\u5df2\u66f4\u65b0\u3002'],
    ['Section created.', '\u680f\u76ee\u5df2\u521b\u5efa\u3002'],
    ['Failed to save section.', '\u4fdd\u5b58\u680f\u76ee\u5931\u8d25\u3002'],
    ['This section is still linked to categories or posts. Remove those links before deleting it.', '\u8be5\u680f\u76ee\u4ecd\u5173\u8054\u5206\u7c7b\u6216\u6587\u7ae0\uff0c\u8bf7\u5148\u79fb\u9664\u5173\u8054\u540e\u518d\u5220\u9664\u3002'],
    ['Deleting section...', '\u6b63\u5728\u5220\u9664\u680f\u76ee...'],
    ['Section deleted.', '\u680f\u76ee\u5df2\u5220\u9664\u3002'],
    ['Loading sections, categories, and posts...', '\u6b63\u5728\u52a0\u8f7d\u680f\u76ee\u3001\u5206\u7c7b\u548c\u6587\u7ae0...'],
    ['Section data loaded.', '\u680f\u76ee\u6570\u636e\u5df2\u52a0\u8f7d\u3002'],
    ['Failed to load section data.', '\u52a0\u8f7d\u680f\u76ee\u6570\u636e\u5931\u8d25\u3002'],
    ['Post Management', '\u6587\u7ae0\u7ba1\u7406'],
    ['Review drafts and published posts, filter by section and category, and make quick status changes without leaving the list view.', '\u5728\u5217\u8868\u9875\u4e2d\u67e5\u770b\u8349\u7a3f\u548c\u5df2\u53d1\u5e03\u6587\u7ae0\uff0c\u6309\u680f\u76ee\u548c\u5206\u7c7b\u7b5b\u9009\uff0c\u5e76\u5feb\u901f\u5207\u6362\u72b6\u6001\u3002'],
    ['New Post', '\u65b0\u5efa\u6587\u7ae0'],
    ['Total Posts', '\u6587\u7ae0\u603b\u6570'],
    ['All posts in storage, regardless of status.', '\u5b58\u50a8\u4e2d\u7684\u5168\u90e8\u6587\u7ae0\uff0c\u4e0d\u533a\u5206\u72b6\u6001\u3002'],
    ['Posts currently visible on the public site.', '\u5f53\u524d\u5728\u524d\u53f0\u53ef\u89c1\u7684\u6587\u7ae0\u3002'],
    ['Drafts', '\u8349\u7a3f'],
    ['Posts that still need editing or review.', '\u4ecd\u9700\u7f16\u8f91\u6216\u5ba1\u6838\u7684\u6587\u7ae0\u3002'],
    ['Posts marked to stay prominent.', '\u88ab\u6807\u8bb0\u4e3a\u7a81\u51fa\u5c55\u793a\u7684\u6587\u7ae0\u3002'],
    ['Search by title, slug, summary, or content', '\u6309\u6807\u9898\u3001\u522b\u540d\u3001\u6458\u8981\u6216\u5185\u5bb9\u641c\u7d22'],
    ['All statuses', '\u5168\u90e8\u72b6\u6001'],
    ['Pinned only', '\u4ec5\u7f6e\u9876'],
    ['Sort', '\u6392\u5e8f'],
    ['Recently updated', '\u6700\u8fd1\u66f4\u65b0'],
    ['Recently created', '\u6700\u8fd1\u521b\u5efa'],
    ['Title A-Z', '\u6807\u9898 A-Z'],
    ['Page size', '\u6bcf\u9875\u6570\u91cf'],
    ['Previous', '\u4e0a\u4e00\u9875'],
    ['Next', '\u4e0b\u4e00\u9875'],
    ['No posts match the current filters.', '\u6ca1\u6709\u5339\u914d\u5f53\u524d\u7b5b\u9009\u6761\u4ef6\u7684\u6587\u7ae0\u3002'],
    ['Loading posts, categories, and sections...', '\u6b63\u5728\u52a0\u8f7d\u6587\u7ae0\u3001\u5206\u7c7b\u548c\u680f\u76ee...'],
    ['Post data loaded.', '\u6587\u7ae0\u6570\u636e\u5df2\u52a0\u8f7d\u3002'],
    ['Failed to load post data.', '\u52a0\u8f7d\u6587\u7ae0\u6570\u636e\u5931\u8d25\u3002'],
    ['Updating post status...', '\u6b63\u5728\u66f4\u65b0\u6587\u7ae0\u72b6\u6001...'],
    ['Post status updated.', '\u6587\u7ae0\u72b6\u6001\u5df2\u66f4\u65b0\u3002'],
    ['Failed to update post status.', '\u66f4\u65b0\u6587\u7ae0\u72b6\u6001\u5931\u8d25\u3002'],
    ['Deleting post...', '\u6b63\u5728\u5220\u9664\u6587\u7ae0...'],
    ['Post deleted.', '\u6587\u7ae0\u5df2\u5220\u9664\u3002'],
    ['Failed to delete post.', '\u5220\u9664\u6587\u7ae0\u5931\u8d25\u3002'],
    ['No posts to display.', '\u6682\u65e0\u53ef\u663e\u793a\u7684\u6587\u7ae0\u3002'],
    ['Post Editor', '\u6587\u7ae0\u7f16\u8f91\u5668'],
    ['Create or update posts with aligned section, category, tag, summary, cover, and publication metadata.', '\u521b\u5efa\u6216\u66f4\u65b0\u6587\u7ae0\uff0c\u5e76\u7edf\u4e00\u7ef4\u62a4\u680f\u76ee\u3001\u5206\u7c7b\u3001\u6807\u7b7e\u3001\u6458\u8981\u3001\u5c01\u9762\u548c\u53d1\u5e03\u5143\u6570\u636e\u3002'],
    ['Back to Posts', '\u8fd4\u56de\u6587\u7ae0\u5217\u8868'],
    ['Save Draft', '\u4fdd\u5b58\u8349\u7a3f'],
    ['Publish / Update', '\u53d1\u5e03 / \u66f4\u65b0'],
    ['Publish', '\u53d1\u5e03'],
    ['Move to Draft', '\u79fb\u56de\u8349\u7a3f'],
    ['Enter the post title', '\u8f93\u5165\u6587\u7ae0\u6807\u9898'],
    ['Cover URL', '\u5c01\u9762 URL'],
    ['Reading Time (minutes)', '\u9605\u8bfb\u65f6\u95f4\uff08\u5206\u949f\uff09'],
    ['Pin this post', '\u7f6e\u9876\u8fd9\u7bc7\u6587\u7ae0'],
    ['Short summary used by cards, lists, and SEO excerpts.', '\u7528\u4e8e\u5361\u7247\u3001\u5217\u8868\u548c SEO \u6458\u8981\u7684\u7b80\u77ed\u63cf\u8ff0\u3002'],
    ['Post Content', '\u6587\u7ae0\u5185\u5bb9'],
    ['Tag Selection', '\u6807\u7b7e\u9009\u62e9'],
    ['Tags are stored as IDs to stay aligned with the current backend schema.', '\u6807\u7b7e\u4ee5 ID \u5f62\u5f0f\u5b58\u50a8\uff0c\u4ee5\u4fdd\u6301\u4e0e\u5f53\u524d\u540e\u7aef\u6570\u636e\u7ed3\u6784\u4e00\u81f4\u3002'],
    ['Resolved Metadata', '\u89e3\u6790\u540e\u7684\u5143\u6570\u636e'],
    ['Slug preview:', '\u522b\u540d\u9884\u89c8\uff1a'],
    ['(generated from title)', '\uff08\u6839\u636e\u6807\u9898\u81ea\u52a8\u751f\u6210\uff09'],
    ['Notes', '\u8bf4\u660e'],
    ['Editor Constraints', '\u7f16\u8f91\u5668\u9650\u5236'],
    ['Editing existing post', '\u6b63\u5728\u7f16\u8f91\u5df2\u6709\u6587\u7ae0'],
    ['New draft', '\u65b0\u8349\u7a3f'],
    ['Cover preview', '\u5c01\u9762\u9884\u89c8'],
    ['Loading sections, categories, and tags...', '\u6b63\u5728\u52a0\u8f7d\u680f\u76ee\u3001\u5206\u7c7b\u548c\u6807\u7b7e...'],
    ['Reference data loaded.', '\u5f15\u7528\u6570\u636e\u5df2\u52a0\u8f7d\u3002'],
    ['Failed to load reference data.', '\u52a0\u8f7d\u5f15\u7528\u6570\u636e\u5931\u8d25\u3002'],
    ['Loading post data...', '\u6b63\u5728\u52a0\u8f7d\u6587\u7ae0\u6570\u636e...'],
    ['Failed to load post.', '\u52a0\u8f7d\u6587\u7ae0\u5931\u8d25\u3002'],
    ['Post title is required.', '\u8bf7\u8f93\u5165\u6587\u7ae0\u6807\u9898\u3002'],
    ['Post content is required before publishing.', '\u53d1\u5e03\u524d\u8bf7\u5148\u586b\u5199\u6587\u7ae0\u5185\u5bb9\u3002'],
    ['Publishing post...', '\u6b63\u5728\u53d1\u5e03\u6587\u7ae0...'],
    ['Saving draft...', '\u6b63\u5728\u4fdd\u5b58\u8349\u7a3f...'],
    ['Post published.', '\u6587\u7ae0\u5df2\u53d1\u5e03\u3002'],
    ['Draft saved.', '\u8349\u7a3f\u5df2\u4fdd\u5b58\u3002'],
    ['Failed to save post.', '\u4fdd\u5b58\u6587\u7ae0\u5931\u8d25\u3002'],
    ['Inserted local image files as data URLs.', '\u5df2\u5c06\u672c\u5730\u56fe\u7247\u4ee5 Data URL \u5f62\u5f0f\u63d2\u5165\u3002'],
    ['Failed to read image files.', '\u8bfb\u53d6\u56fe\u7247\u6587\u4ef6\u5931\u8d25\u3002'],
    ['Failed to read image file.', '\u8bfb\u53d6\u56fe\u7247\u6587\u4ef6\u5931\u8d25\u3002'],
    ['Saving Draft...', '\u6b63\u5728\u4fdd\u5b58\u8349\u7a3f...'],
    ['Publishing...', '\u6b63\u5728\u53d1\u5e03...'],
    ['Update & Publish', '\u66f4\u65b0\u5e76\u53d1\u5e03'],
    ['Ready to create a new post.', '\u5df2\u51c6\u5907\u597d\u521b\u5efa\u65b0\u6587\u7ae0\u3002'],
  ];

  const UI_TEXT_PATTERNS = [
    {
      match: /^Loaded (\d+) tags\.$/,
      format: function formatLoadedTags(locale, match) {
        return locale === 'en' ? match[0] : '\u5df2\u52a0\u8f7d ' + match[1] + ' \u4e2a\u6807\u7b7e\u3002';
      },
    },
    {
      match: /^Failed to load tags: (.+)$/,
      format: function formatLoadTagsError(locale, match) {
        return locale === 'en' ? match[0] : '\u52a0\u8f7d\u6807\u7b7e\u5931\u8d25\uff1a' + match[1];
      },
    },
    {
      match: /^Failed to save tag: (.+)$/,
      format: function formatSaveTagError(locale, match) {
        return locale === 'en' ? match[0] : '\u4fdd\u5b58\u6807\u7b7e\u5931\u8d25\uff1a' + match[1];
      },
    },
    {
      match: /^Tag is still used by (\d+) post\(s\) and cannot be deleted\.$/,
      format: function formatTagUsed(locale, match) {
        return locale === 'en' ? match[0] : '\u8be5\u6807\u7b7e\u4ecd\u88ab ' + match[1] + ' \u7bc7\u6587\u7ae0\u4f7f\u7528\uff0c\u65e0\u6cd5\u5220\u9664\u3002';
      },
    },
    {
      match: /^Failed to delete tag: (.+)$/,
      format: function formatDeleteTagError(locale, match) {
        return locale === 'en' ? match[0] : '\u5220\u9664\u6807\u7b7e\u5931\u8d25\uff1a' + match[1];
      },
    },
    {
      match: /^Delete "(.+)"\?$/,
      format: function formatDeleteDialog(locale, match) {
        return locale === 'en' ? match[0] : '\u786e\u8ba4\u5220\u9664\u201c' + match[1] + '\u201d\uff1f';
      },
    },
    {
      match: /^(\d+) linked posts$/,
      format: function formatLinkedPosts(locale, match) {
        return locale === 'en' ? match[0] : match[1] + ' \u7bc7\u5173\u8054\u6587\u7ae0';
      },
    },
    {
      match: /^(\d+) post$/,
      format: function formatOnePost(locale, match) {
        return locale === 'en' ? match[0] : match[1] + ' \u7bc7\u6587\u7ae0';
      },
    },
    {
      match: /^(\d+) posts$/,
      format: function formatManyPosts(locale, match) {
        return locale === 'en' ? match[0] : match[1] + ' \u7bc7\u6587\u7ae0';
      },
    },
    {
      match: /^Order (\d+)$/,
      format: function formatOrder(locale, match) {
        return locale === 'en' ? match[0] : '\u6392\u5e8f ' + match[1];
      },
    },
    {
      match: /^Seed counter (\d+)$/,
      format: function formatSeedCounter(locale, match) {
        return locale === 'en' ? match[0] : '\u79cd\u5b50\u8ba1\u6570 ' + match[1];
      },
    },
    {
      match: /^icon: (.+)$/i,
      format: function formatIcon(locale, match) {
        return locale === 'en' ? match[0] : '\u56fe\u6807\uff1a' + match[1];
      },
    },
    {
      match: /^Showing (\d+)-(\d+) of (\d+) posts\. Page (\d+) of (\d+)\.$/,
      format: function formatPagination(locale, match) {
        return locale === 'en'
          ? match[0]
          : '\u663e\u793a\u7b2c ' + match[1] + '-' + match[2] + ' \u6761\uff0c\u5171 ' + match[3] + ' \u7bc7\u6587\u7ae0\u3002\u7b2c ' + match[4] + ' \u9875\uff0c\u5171 ' + match[5] + ' \u9875\u3002';
      },
    },
    {
      match: /^(\d+) min read$/,
      format: function formatMinRead(locale, match) {
        return locale === 'en' ? match[0] : '\u7ea6 ' + match[1] + ' \u5206\u949f\u9605\u8bfb';
      },
    },
  ];

  const exactTextIndex = buildExactTextIndex(UI_TEXT_PAIRS);
  let localeObserver = null;
  let isApplyingLocale = false;
  const nativeConfirm = typeof window.confirm === 'function' ? window.confirm.bind(window) : null;
  const nativeAlert = typeof window.alert === 'function' ? window.alert.bind(window) : null;

  if (nativeConfirm) {
    window.confirm = function patchedConfirm(message) {
      return nativeConfirm(translateUiString(message, getLocale()));
    };
  }

  if (nativeAlert) {
    window.alert = function patchedAlert(message) {
      nativeAlert(translateUiString(message, getLocale()));
    };
  }

  function buildExactTextIndex(pairs) {
    const index = { en: new Map(), zh: new Map() };

    pairs.forEach(function eachPair(pair) {
      const en = String(pair[0] || '');
      const zh = String(pair[1] || '');

      if (en) {
        index.en.set(en, { en: en, zh: zh });
      }
      if (zh) {
        index.zh.set(zh, { en: en, zh: zh });
      }
    });

    return index;
  }

  function normalizeLocale(locale) {
    return locale === 'en' ? 'en' : DEFAULT_LOCALE;
  }

  function getLocale() {
    return normalizeLocale(localStorage.getItem(STORAGE_LOCALE_KEY));
  }

  function translateUiString(value, locale) {
    const activeLocale = normalizeLocale(locale || getLocale());
    const source = String(value || '');

    if (!source) {
      return '';
    }

    const directPair = exactTextIndex.en.get(source) || exactTextIndex.zh.get(source);
    if (directPair) {
      return activeLocale === 'en' ? directPair.en : directPair.zh;
    }

    for (let index = 0; index < UI_TEXT_PATTERNS.length; index += 1) {
      const entry = UI_TEXT_PATTERNS[index];
      const match = source.match(entry.match);
      if (match) {
        return entry.format(activeLocale, match);
      }
    }

    return source;
  }

  function translate(value, locale) {
    const activeLocale = normalizeLocale(locale || getLocale());

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (typeof value[activeLocale] === 'string') {
        return value[activeLocale];
      }
      if (typeof value.en === 'string') {
        return value.en;
      }
      if (typeof value.zh === 'string') {
        return value.zh;
      }
    }

    return translateUiString(String(value || ''), activeLocale);
  }

  function preserveWhitespaceTranslation(value, locale) {
    const source = String(value || '');
    const trimmed = source.trim();

    if (!trimmed) {
      return source;
    }

    const translated = translateUiString(trimmed, locale);
    if (translated === trimmed) {
      return source;
    }

    const leadingLength = source.indexOf(trimmed);
    const trailingLength = source.length - leadingLength - trimmed.length;
    const leading = source.slice(0, leadingLength);
    const trailing = source.slice(source.length - trailingLength);
    return leading + translated + trailing;
  }

  function updateDocumentLanguage(locale) {
    document.documentElement.lang = normalizeLocale(locale) === 'en' ? 'en' : 'zh-CN';
  }

  function updateLocaleButton(locale) {
    const button = document.getElementById('admin-locale-toggle');
    if (!button) {
      return;
    }

    const activeLocale = normalizeLocale(locale);
    button.textContent = activeLocale === 'en' ? '\u4e2d' : 'EN';
    button.title = activeLocale === 'en' ? '\u5207\u6362\u5230\u4e2d\u6587' : 'Switch to English';
  }

  function applyPageTitle(title) {
    const resolvedTitle = String(title || '').trim();
    document.title = resolvedTitle ? 'DevLog Admin | ' + resolvedTitle : 'DevLog Admin';
  }

  function setLocale(locale) {
    const nextLocale = normalizeLocale(locale);
    localStorage.setItem(STORAGE_LOCALE_KEY, nextLocale);
    updateDocumentLanguage(nextLocale);
    updateLocaleButton(nextLocale);
    applyLocale(document.body, nextLocale);
  }

  function toggleLocale() {
    const nextLocale = getLocale() === 'en' ? 'zh' : 'en';
    setLocale(nextLocale);
    window.location.reload();
  }

  function getToken() {
    return String(localStorage.getItem(STORAGE_TOKEN_KEY) || '').trim();
  }

  function logout() {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    window.location.href = '/admin';
  }

  function requireAuth() {
    if (!getToken()) {
      logout();
      return false;
    }
    return true;
  }

  function getTheme() {
    return localStorage.getItem(STORAGE_THEME_KEY) === 'light' ? 'light' : 'dark';
  }

  function updateThemeIcon(theme) {
    const icon = document.getElementById('admin-theme-icon');
    if (!icon) {
      return;
    }

    if (theme === 'dark') {
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
      return;
    }

    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
  }

  function setTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_THEME_KEY, nextTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(nextTheme);
    updateThemeIcon(nextTheme);
  }

  function initTheme() {
    setTheme(getTheme());
  }

  function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }

  async function requestJson(url, options) {
    const config = options || {};
    const method = config.method || 'GET';
    const body = config.body;
    const headers = { ...(config.headers || {}) };
    const auth = config.auth !== false;

    if (auth) {
      const token = getToken();
      if (!token) {
        logout();
        throw new Error(translate(SHELL_TEXT.loginExpired));
      }
      headers.Authorization = 'Bearer ' + token;
    }

    let requestBody = body;
    if (
      body !== undefined &&
      body !== null &&
      typeof body === 'object' &&
      !(body instanceof FormData)
    ) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      requestBody = JSON.stringify(body);
    }

    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
    });

    if (response.status === 401) {
      logout();
      throw new Error(translate(SHELL_TEXT.loginExpired));
    }

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        throw new Error(translate(SHELL_TEXT.invalidJson));
      }
    }

    if (!response.ok) {
      throw new Error(
        (data && (data.message || data.error)) ||
        (translate(SHELL_TEXT.requestFailed) + response.status + '.')
      );
    }

    return data;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDateTime(value) {
    if (!value) {
      return '--';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '--';
    }

    return date.toLocaleString(getLocale() === 'en' ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDuration(seconds) {
    const total = Math.max(0, Number(seconds) || 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);

    if (getLocale() === 'en') {
      if (hours > 0) {
        return hours + 'h ' + minutes + 'm';
      }
      if (minutes > 0) {
        return minutes + 'm';
      }
      return translate(SHELL_TEXT.lessThanMinute);
    }

    if (hours > 0) {
      return hours + ' \u5c0f\u65f6 ' + minutes + ' \u5206\u949f';
    }
    if (minutes > 0) {
      return minutes + ' \u5206\u949f';
    }
    return translate(SHELL_TEXT.lessThanMinute);
  }

  function applyLocaleToAttributes(element, locale) {
    TRANSLATABLE_ATTRIBUTES.forEach(function eachAttribute(attributeName) {
      if (!element.hasAttribute(attributeName)) {
        return;
      }

      const currentValue = element.getAttribute(attributeName);
      const translatedValue = preserveWhitespaceTranslation(currentValue, locale);

      if (translatedValue !== currentValue) {
        element.setAttribute(attributeName, translatedValue);
      }
    });
  }

  function applyLocaleToTextNode(textNode, locale) {
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const parentElement = textNode.parentElement;
    if (parentElement && SKIP_TRANSLATE_TAGS.has(parentElement.tagName)) {
      return;
    }

    const currentValue = textNode.nodeValue;
    const translatedValue = preserveWhitespaceTranslation(currentValue, locale);

    if (translatedValue !== currentValue) {
      textNode.nodeValue = translatedValue;
    }
  }

  function applyLocale(root, locale) {
    const targetLocale = normalizeLocale(locale || getLocale());

    if (!root) {
      return;
    }

    if (root.nodeType === Node.TEXT_NODE) {
      applyLocaleToTextNode(root, targetLocale);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    if (SKIP_TRANSLATE_TAGS.has(root.tagName)) {
      return;
    }

    applyLocaleToAttributes(root, targetLocale);

    const childNodes = root.childNodes;
    for (let index = 0; index < childNodes.length; index += 1) {
      const child = childNodes[index];
      if (child.nodeType === Node.TEXT_NODE) {
        applyLocaleToTextNode(child, targetLocale);
      } else {
        applyLocale(child, targetLocale);
      }
    }
  }

  function startLocaleObserver(root) {
    if (!root || typeof MutationObserver === 'undefined') {
      return;
    }

    if (localeObserver) {
      localeObserver.disconnect();
    }

    localeObserver = new MutationObserver(function onLocaleMutation(mutations) {
      if (isApplyingLocale) {
        return;
      }

      isApplyingLocale = true;
      try {
        const locale = getLocale();

        mutations.forEach(function eachMutation(mutation) {
          if (mutation.type === 'characterData') {
            applyLocale(mutation.target, locale);
            return;
          }

          if (mutation.type === 'attributes') {
            applyLocale(mutation.target, locale);
            return;
          }

          mutation.addedNodes.forEach(function eachAddedNode(node) {
            applyLocale(node, locale);
          });
        });
      } finally {
        isApplyingLocale = false;
      }
    });

    localeObserver.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });
  }

  function subscribeToDataChanges(callback) {
    if (typeof EventSource === 'undefined' || typeof callback !== 'function') {
      return function noop() {};
    }

    const source = new EventSource('/api/events');
    const handler = function handleDataChange(event) {
      callback(event);
    };

    source.addEventListener('data-change', handler);

    return function unsubscribe() {
      source.removeEventListener('data-change', handler);
      source.close();
    };
  }

  function renderActions(actions) {
    const locale = getLocale();
    return (Array.isArray(actions) ? actions : []).map(function renderAction(action) {
      const className = escapeHtml(action.className || '');
      const id = action.id ? ' id="' + escapeHtml(action.id) + '"' : '';

      if (action.href) {
        const target = action.external ? ' target="_blank" rel="noreferrer"' : '';
        return (
          '<a href="' + escapeHtml(action.href) + '"' +
          target +
          id +
          ' class="' + className + '">' +
          escapeHtml(translate(action.label || SHELL_TEXT.open, locale)) +
          '</a>'
        );
      }

      return (
        '<button type="button"' +
        id +
        ' class="' + className + '">' +
        escapeHtml(translate(action.label || SHELL_TEXT.action, locale)) +
        '</button>'
      );
    }).join('');
  }

  function renderSidebarLink(item, activeKey, locale, className) {
    return (
      '<a href="' + item.href + '" class="sidebar-item ' + escapeHtml(className || '') + ' ' +
      (item.key === activeKey ? 'active' : '') +
      '">' +
      '<span class="font-medium">' + escapeHtml(translate(item.label, locale)) + '</span>' +
      '</a>'
    );
  }

  function renderSidebar(activeKey) {
    const locale = getLocale();
    return NAV_ITEMS.map(function renderItem(item) {
      if (Array.isArray(item.children) && item.children.length) {
        const hasActiveChild = item.children.some(function hasActive(child) {
          return child.key === activeKey;
        });

        return (
          '<section class="sidebar-group">' +
            '<div class="sidebar-group-label ' + (hasActiveChild ? 'active' : '') + '">' +
              escapeHtml(translate(item.label, locale)) +
            '</div>' +
            '<div class="sidebar-group-items">' +
              item.children.map(function renderChild(child) {
                return renderSidebarLink(child, activeKey, locale, 'sidebar-subitem px-6 py-2.5 flex items-center gap-3');
              }).join('') +
            '</div>' +
          '</section>'
        );
      }

      return renderSidebarLink(item, activeKey, locale, 'px-6 py-3 flex items-center gap-3');
    }).join('');
  }

  function findNavItemByKey(activeKey, items) {
    const source = Array.isArray(items) ? items : NAV_ITEMS;
    for (let index = 0; index < source.length; index += 1) {
      const item = source[index];
      if (item.key === activeKey) {
        return item;
      }
      if (Array.isArray(item.children) && item.children.length) {
        const childMatch = findNavItemByKey(activeKey, item.children);
        if (childMatch) {
          return childMatch;
        }
      }
    }
    return null;
  }

  function getActiveLabel(activeKey, locale) {
    const item = findNavItemByKey(activeKey, NAV_ITEMS);
    return item ? translate(item.label, locale) : translate(activeKey || '', locale);
  }

  function mountPage(options) {
    const config = options || {};
    const root = document.getElementById('admin-app');
    const locale = getLocale();

    if (!root) {
      throw new Error('Missing #admin-app container.');
    }

    const activeLabel = translate(config.activeLabel || getActiveLabel(config.active || '', locale), locale);
    const title = translate(config.title || '', locale);
    const description = translate(config.description || '', locale);

    root.innerHTML = (
      '<header class="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-[#1f1f1f] dark:bg-[#111111]">' +
        '<div class="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">' +
          '<div class="flex items-center gap-3">' +
            '<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">DL</div>' +
            '<div>' +
              '<div class="text-sm font-semibold text-gray-900 dark:text-white">' + escapeHtml(translate(SHELL_TEXT.brandTitle, locale)) + '</div>' +
              '<div class="text-xs text-gray-500 dark:text-gray-400">' + escapeHtml(translate(SHELL_TEXT.brandSubtitle, locale)) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="flex items-center gap-3">' +
            '<button id="admin-locale-toggle" type="button" class="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"></button>' +
            '<button id="admin-theme-toggle" type="button" class="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">' +
              '<svg id="admin-theme-icon" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"></svg>' +
            '</button>' +
            '<button id="admin-logout" type="button" class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">' + escapeHtml(translate(SHELL_TEXT.signOut, locale)) + '</button>' +
          '</div>' +
        '</div>' +
      '</header>' +
      '<div class="mx-auto flex max-w-[1600px]">' +
        '<aside class="sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white dark:border-[#1f1f1f] dark:bg-[#111111] lg:block">' +
          '<nav class="py-4">' + renderSidebar(config.active || '') + '</nav>' +
        '</aside>' +
        '<main class="min-h-[calc(100vh-64px)] flex-1 bg-gray-50 px-4 py-6 dark:bg-[#0a0a0a] sm:px-6">' +
          '<section class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">' +
            '<div>' +
              '<div class="admin-kicker text-gray-500 dark:text-gray-400">' + escapeHtml(activeLabel) + '</div>' +
              '<h1 class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">' + escapeHtml(title) + '</h1>' +
              '<p class="mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400">' + escapeHtml(description) + '</p>' +
            '</div>' +
            '<div class="flex flex-wrap gap-3">' + renderActions(config.actions) + '</div>' +
          '</section>' +
          '<div id="admin-notice" class="notice"></div>' +
          '<div id="admin-page-content"></div>' +
        '</main>' +
      '</div>'
    );

    document.getElementById('admin-locale-toggle').addEventListener('click', toggleLocale);
    document.getElementById('admin-theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('admin-logout').addEventListener('click', logout);

    applyPageTitle(title || activeLabel);
    updateDocumentLanguage(locale);
    updateLocaleButton(locale);
    initTheme();
    applyLocale(root, locale);
    startLocaleObserver(root);

    const notice = document.getElementById('admin-notice');

    return {
      content: document.getElementById('admin-page-content'),
      setNotice: function setNotice(message, type) {
        if (!message) {
          notice.className = 'notice';
          notice.textContent = '';
          return;
        }

        notice.className = 'notice show notice-' + (type || 'info');
        notice.textContent = translate(message, getLocale());
      },
    };
  }

  window.AdminApp = {
    applyLocale: applyLocale,
    escapeHtml: escapeHtml,
    formatDateTime: formatDateTime,
    formatDuration: formatDuration,
    getLocale: getLocale,
    getToken: getToken,
    initTheme: initTheme,
    logout: logout,
    mountPage: mountPage,
    requestJson: requestJson,
    requireAuth: requireAuth,
    setLocale: setLocale,
    setTheme: setTheme,
    startLocaleObserver: startLocaleObserver,
    subscribeToDataChanges: subscribeToDataChanges,
    toggleLocale: toggleLocale,
    toggleTheme: toggleTheme,
    translate: translate,
    translateUiString: translateUiString,
  };
})();
