import { chromium } from 'playwright';

async function checkWebsite() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://127.0.0.1:5173');
    
    console.log('=== 网站信息 ===');
    console.log('页面标题:', await page.title());
    
    console.log('\n=== 页面内容 ===');
    const content = await page.content();
    console.log('页面长度:', content.length, '字符');
    
    console.log('\n=== 导航元素 ===');
    const navElements = await page.$$eval('nav, .nav, .navbar, .navigation', elements => {
      return elements.map(el => {
        return {
          tag: el.tagName,
          class: el.className,
          innerText: el.innerText.substring(0, 100) + '...'
        };
      });
    });
    console.log('导航元素:', navElements);
    
    console.log('\n=== 主要链接 ===');
    const links = await page.$$eval('a', elements => {
      return elements
        .filter(el => el.innerText.trim())
        .map(el => ({
          text: el.innerText,
          href: el.href
        }));
    });
    console.log('链接数量:', links.length);
    console.log('前5个链接:', links.slice(0, 5));
    
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await browser.close();
  }
}

checkWebsite();
