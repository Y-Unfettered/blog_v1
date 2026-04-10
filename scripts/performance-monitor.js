import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PERFORMANCE_LOG_DIR = path.resolve(process.cwd(), 'performance-logs');
const BENCHMARK_FILE = path.join(PERFORMANCE_LOG_DIR, 'benchmarks.json');

if (!fs.existsSync(PERFORMANCE_LOG_DIR)) {
  fs.mkdirSync(PERFORMANCE_LOG_DIR, { recursive: true });
}

async function measurePageLoad(page, url) {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  const endTime = Date.now();
  return endTime - startTime;
}

async function measurePageSize(page, url) {
  await page.goto(url);
  const content = await page.content();
  return content.length;
}

async function measureAPIResponse(request, url) {
  const startTime = Date.now();
  const response = await request.get(url);
  const endTime = Date.now();
  return {
    time: endTime - startTime,
    ok: response.ok(),
    status: response.status()
  };
}

async function runPerformanceBenchmarks() {
  console.log('🚀 开始性能基准测试...\n');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const request = context.request;

  const benchmarks = {
    timestamp: new Date().toISOString(),
    pages: [],
    apis: []
  };

  // 测试前端页面
  const pagesToTest = [
    { name: '首页', url: 'http://127.0.0.1:5173/' },
    { name: '生活随笔', url: 'http://127.0.0.1:5173/#/life' }
  ];

  console.log('📄 测试页面加载性能:');
  for (const pageTest of pagesToTest) {
    try {
      const loadTime = await measurePageLoad(page, pageTest.url);
      const pageSize = await measurePageSize(page, pageTest.url);
      
      benchmarks.pages.push({
        name: pageTest.name,
        url: pageTest.url,
        loadTime: loadTime,
        pageSize: pageSize,
        status: 'success'
      });

      console.log(`  ✅ ${pageTest.name}: ${loadTime}ms (${(pageSize / 1024).toFixed(2)} KB)`);
    } catch (error) {
      benchmarks.pages.push({
        name: pageTest.name,
        url: pageTest.url,
        error: error.message,
        status: 'error'
      });
      console.log(`  ❌ ${pageTest.name}: ${error.message}`);
    }
  }

  // 测试后端API
  const apisToTest = [
    { name: '文章列表', url: 'http://127.0.0.1:3031/api/posts' },
    { name: '分类列表', url: 'http://127.0.0.1:3031/api/categories' },
    { name: '标签列表', url: 'http://127.0.0.1:3031/api/tags' },
    { name: '设置', url: 'http://127.0.0.1:3031/api/settings' }
  ];

  console.log('\n🔌 测试API响应性能:');
  for (const apiTest of apisToTest) {
    try {
      const result = await measureAPIResponse(request, apiTest.url);
      
      benchmarks.apis.push({
        name: apiTest.name,
        url: apiTest.url,
        responseTime: result.time,
        status: result.status,
        ok: result.ok
      });

      const statusIcon = result.ok ? '✅' : '⚠️';
      console.log(`  ${statusIcon} ${apiTest.name}: ${result.time}ms (Status: ${result.status})`);
    } catch (error) {
      benchmarks.apis.push({
        name: apiTest.name,
        url: apiTest.url,
        error: error.message,
        status: 'error'
      });
      console.log(`  ❌ ${apiTest.name}: ${error.message}`);
    }
  }

  await browser.close();

  // 保存基准测试结果
  let allBenchmarks = [];
  if (fs.existsSync(BENCHMARK_FILE)) {
    allBenchmarks = JSON.parse(fs.readFileSync(BENCHMARK_FILE, 'utf8'));
  }
  allBenchmarks.push(benchmarks);
  fs.writeFileSync(BENCHMARK_FILE, JSON.stringify(allBenchmarks, null, 2));

  // 打印总结
  console.log('\n📊 性能基准测试总结:');
  console.log(`  测试时间: ${benchmarks.timestamp}`);
  console.log(`  页面测试: ${benchmarks.pages.filter(p => p.status === 'success').length}/${benchmarks.pages.length} 成功`);
  console.log(`  API测试: ${benchmarks.apis.filter(a => a.ok).length}/${benchmarks.apis.length} 成功`);
  console.log(`\n💾 基准测试结果已保存到: ${BENCHMARK_FILE}`);

  return benchmarks;
}

runPerformanceBenchmarks().catch(console.error);
