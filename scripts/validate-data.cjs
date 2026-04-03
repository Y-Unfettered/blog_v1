#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(ROOT_DIR, process.env.BLOG_DATA_DIR || 'data/seed');

function readJson(fileName, fallback) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return { path: filePath, data: fallback, exists: false };
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = raw.trim() ? JSON.parse(raw) : fallback;
  return { path: filePath, data, exists: true };
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function parseIdList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (value === null || value === undefined || value === '') {
    return [];
  }
  return [String(value).trim()].filter(Boolean);
}

function assertArray(name, data, errors) {
  if (!Array.isArray(data)) {
    errors.push(`${name}.json must be an array`);
    return false;
  }
  return true;
}

function assertObject(name, data, errors) {
  if (!isObject(data)) {
    errors.push(`${name}.json must be an object`);
    return false;
  }
  return true;
}

function validateCollectionIds(collectionName, list, errors) {
  const seen = new Set();
  list.forEach((item, index) => {
    if (!isObject(item)) {
      errors.push(`${collectionName}[${index}] must be an object`);
      return;
    }
    if (!isNonEmptyString(item.id)) {
      errors.push(`${collectionName}[${index}].id is required`);
      return;
    }
    const id = String(item.id).trim();
    if (seen.has(id)) {
      errors.push(`${collectionName} contains duplicate id: ${id}`);
    }
    seen.add(id);
  });
}

function validateNamedCollection(collectionName, list, errors, warnings) {
  validateCollectionIds(collectionName, list, errors);
  const slugSet = new Set();

  list.forEach((item, index) => {
    if (!isObject(item)) return;
    if (!isNonEmptyString(item.name) && !isNonEmptyString(item.label)) {
      errors.push(`${collectionName}[${index}] must define name or label`);
    }

    const slug = String(item.slug || '').trim();
    if (slug) {
      if (slugSet.has(slug)) {
        warnings.push(`${collectionName} contains duplicate slug: ${slug}`);
      }
      slugSet.add(slug);
    }

    if (item.order !== undefined && !Number.isFinite(Number(item.order))) {
      errors.push(`${collectionName}[${index}].order must be numeric`);
    }
  });
}

function validateSettings(settings, errors) {
  if (!settings.profile) return;
  if (!isObject(settings.profile)) {
    errors.push('settings.profile must be an object');
  }
  if (settings.about && !isObject(settings.about)) {
    errors.push('settings.about must be an object');
  }
  if (settings.about && Array.isArray(settings.about.skills)) {
    settings.about.skills.forEach((skill, index) => {
      if (!isObject(skill)) {
        errors.push(`settings.about.skills[${index}] must be an object`);
        return;
      }
      if (!isNonEmptyString(skill.label)) {
        errors.push(`settings.about.skills[${index}].label is required`);
      }
    });
  }
  if (settings.postsPerPage !== undefined) {
    const value = Number(settings.postsPerPage);
    if (!Number.isFinite(value) || value <= 0) {
      errors.push('settings.postsPerPage must be a positive number');
    }
  }
}

function main() {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Data directory does not exist: ${DATA_DIR}`);
    process.exit(1);
  }

  const sectionsFile = readJson('sections.json', []);
  const categoriesFile = readJson('categories.json', []);
  const tagsFile = readJson('tags.json', []);
  const navFile = readJson('nav.json', []);
  const postsFile = readJson('posts.json', []);
  const graphicsFile = readJson('graphics.json', []);
  const settingsFile = readJson('settings.json', {});
  const issuesFile = readJson('issues.json', []);
  const toolsFile = readJson('tools.json', []);

  if (assertArray('sections', sectionsFile.data, errors)) {
    validateNamedCollection('sections', sectionsFile.data, errors, warnings);
  }
  if (assertArray('categories', categoriesFile.data, errors)) {
    validateNamedCollection('categories', categoriesFile.data, errors, warnings);
  }
  if (assertArray('tags', tagsFile.data, errors)) {
    validateNamedCollection('tags', tagsFile.data, errors, warnings);
  }
  if (assertArray('nav', navFile.data, errors)) {
    validateCollectionIds('nav', navFile.data, errors);
    navFile.data.forEach((item, index) => {
      if (!isObject(item)) return;
      if (!isNonEmptyString(item.label) && !isNonEmptyString(item.name)) {
        errors.push(`nav[${index}] must define label or name`);
      }
      if (!isNonEmptyString(item.href) && !isNonEmptyString(item.url)) {
        errors.push(`nav[${index}] must define href or url`);
      }
      if (item.order !== undefined && !Number.isFinite(Number(item.order))) {
        errors.push(`nav[${index}].order must be numeric`);
      }
    });
  }
  if (assertArray('posts', postsFile.data, errors)) {
    validateCollectionIds('posts', postsFile.data, errors);
  }
  if (assertArray('graphics', graphicsFile.data, errors)) {
    validateCollectionIds('graphics', graphicsFile.data, errors);
  }
  assertArray('issues', issuesFile.data, errors);
  assertArray('tools', toolsFile.data, errors);
  if (assertObject('settings', settingsFile.data, errors)) {
    validateSettings(settingsFile.data, errors);
  }

  const sectionIds = new Set((Array.isArray(sectionsFile.data) ? sectionsFile.data : []).map((item) => String(item.id)));
  const categoryIds = new Set((Array.isArray(categoriesFile.data) ? categoriesFile.data : []).map((item) => String(item.id)));
  const tagIds = new Set((Array.isArray(tagsFile.data) ? tagsFile.data : []).map((item) => String(item.id)));
  const postSlugs = new Set();

  (Array.isArray(categoriesFile.data) ? categoriesFile.data : []).forEach((item, index) => {
    if (!isObject(item)) return;
    if (item.sectionId && !sectionIds.has(String(item.sectionId))) {
      warnings.push(`categories[${index}].sectionId references missing section: ${item.sectionId}`);
    }
  });

  (Array.isArray(postsFile.data) ? postsFile.data : []).forEach((post, index) => {
    if (!isObject(post)) return;

    if (!isNonEmptyString(post.title)) {
      errors.push(`posts[${index}].title is required`);
    }
    if (!isNonEmptyString(post.slug)) {
      errors.push(`posts[${index}].slug is required`);
    } else {
      const slug = String(post.slug).trim();
      if (postSlugs.has(slug)) {
        errors.push(`posts contains duplicate slug: ${slug}`);
      }
      postSlugs.add(slug);
    }

    const categories = parseIdList(
      post.categories !== undefined
        ? post.categories
        : (post.categoryIds !== undefined ? post.categoryIds : post.categoryId),
    );
    categories.forEach((id) => {
      if (!categoryIds.has(String(id))) {
        errors.push(`posts[${index}] references missing category: ${id}`);
      }
    });

    const tags = parseIdList(post.tags !== undefined ? post.tags : post.tagIds);
    tags.forEach((id) => {
      if (!tagIds.has(String(id))) {
        errors.push(`posts[${index}] references missing tag: ${id}`);
      }
    });

    if (post.sectionId && !sectionIds.has(String(post.sectionId))) {
      errors.push(`posts[${index}] references missing section: ${post.sectionId}`);
    }

    if (post.status !== undefined && !['draft', 'published'].includes(String(post.status))) {
      errors.push(`posts[${index}].status must be draft or published`);
    }

    ['createdAt', 'updatedAt'].forEach((field) => {
      if (post[field] && Number.isNaN(new Date(post[field]).getTime())) {
        warnings.push(`posts[${index}].${field} is not a valid ISO date`);
      }
    });
  });

  (Array.isArray(graphicsFile.data) ? graphicsFile.data : []).forEach((item, index) => {
    if (!isObject(item)) return;

    if (item.sectionId && !sectionIds.has(String(item.sectionId))) {
      errors.push(`graphics[${index}] references missing section: ${item.sectionId}`);
    }
    if (item.categoryId && !categoryIds.has(String(item.categoryId))) {
      errors.push(`graphics[${index}] references missing category: ${item.categoryId}`);
    }

    parseIdList(item.tagIds !== undefined ? item.tagIds : item.tags).forEach((id) => {
      if (!tagIds.has(String(id))) {
        errors.push(`graphics[${index}] references missing tag: ${id}`);
      }
    });

    if (item.status !== undefined && !['draft', 'published'].includes(String(item.status))) {
      errors.push(`graphics[${index}].status must be draft or published`);
    }

    if (item.images !== undefined && !Array.isArray(item.images)) {
      errors.push(`graphics[${index}].images must be an array`);
    }
  });

  if (warnings.length > 0) {
    console.warn('Data validation warnings:');
    warnings.forEach((item) => console.warn(`- ${item}`));
  }

  if (errors.length > 0) {
    console.error('Data validation failed:');
    errors.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }

  console.log(
    `DATA_VALID (${postsFile.data.length} posts, ${graphicsFile.data.length} graphics, ${categoriesFile.data.length} categories, ${tagsFile.data.length} tags, ${sectionsFile.data.length} sections, ${navFile.data.length} nav items)`,
  );
}

main();
