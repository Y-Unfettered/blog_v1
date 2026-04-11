# 代码更新计划

## 1. 当前代码状态

当前代码已达到预期效果，工作树干净，分支与远程仓库同步。所有问题都已解决，包括：

- 数据文件编码问题
- 文件路径问题
- 导航栏不完整问题

## 2. 在另外一台电脑上更新代码

### 2.1 克隆仓库

在另外一台电脑上，首先需要克隆仓库：

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### 2.2 拉取最新代码

如果已经克隆了仓库，只需要拉取最新代码：

```bash
git pull origin master
```

### 2.3 构建和运行项目

拉取代码后，需要构建和运行项目：

```bash
# 安装依赖
npm install

# 构建前端
npm run build

# 启动 Docker 容器
docker-compose up -d --build
```

## 3. 在后台实现代码自动拉取和更新功能

### 3.1 技术方案

在后台实现代码自动拉取和更新功能，需要以下步骤：

1. **添加 API 端点**：在 `admin-server.cjs` 中添加一个新的 API 端点，用于触发代码更新。
2. **执行 git 命令**：使用 `child_process` 模块执行 git 命令，拉取最新代码。
3. **重启服务**：拉取代码后，重启相关服务以应用更新。
4. **添加前端按钮**：在后台管理界面添加一个 "更新代码" 按钮，用于触发更新操作。

### 3.2 实现步骤

#### 3.2.1 添加 API 端点

在 `admin-server.cjs` 中添加一个新的 API 端点，用于触发代码更新：

```javascript
// 处理代码更新请求
app.post('/api/admin/update-code', async (req, res) => {
  try {
    // 执行 git pull 命令
    const { stdout, stderr } = await exec('git pull origin master');
    
    // 重启服务（可选）
    // 这里可以添加重启服务的代码
    
    sendJson(res, 200, { success: true, message: '代码更新成功', stdout, stderr });
  } catch (error) {
    sendJson(res, 500, { success: false, message: '代码更新失败', error: error.message });
  }
});
```

#### 3.2.2 添加前端按钮

在后台管理界面添加一个 "更新代码" 按钮，用于触发更新操作：

```html
<button id="update-code-btn" class="btn btn-primary">更新代码</button>

<script>
document.getElementById('update-code-btn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/admin/update-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    if (result.success) {
      alert('代码更新成功！');
    } else {
      alert('代码更新失败：' + result.message);
    }
  } catch (error) {
    alert('更新失败：' + error.message);
  }
});
</script>
```

### 3.3 注意事项

1. **权限问题**：确保执行 git 命令的用户有足够的权限拉取代码。
2. **认证问题**：如果仓库需要认证，需要配置 git 凭证。
3. **依赖问题**：拉取代码后，可能需要重新安装依赖。
4. **构建问题**：拉取代码后，可能需要重新构建前端。
5. **重启问题**：拉取代码后，可能需要重启服务以应用更新。

## 4. 测试计划

1. **测试在另外一台电脑上更新代码**：
   - 克隆仓库
   - 拉取最新代码
   - 构建和运行项目

2. **测试后台自动拉取和更新功能**：
   - 点击后台管理界面的 "更新代码" 按钮
   - 检查代码是否成功拉取
   - 检查服务是否正常运行

## 5. 风险分析

1. **权限风险**：如果执行 git 命令的用户权限不足，可能导致拉取失败。
2. **认证风险**：如果仓库需要认证，而凭证配置不正确，可能导致拉取失败。
3. **依赖风险**：如果拉取的代码引入了新的依赖，而没有重新安装，可能导致运行失败。
4. **构建风险**：如果拉取的代码需要重新构建，而没有执行构建命令，可能导致前端显示异常。
5. **重启风险**：如果拉取的代码需要重启服务，而没有执行重启命令，可能导致更新不生效。

## 6. 解决方案

1. **权限解决方案**：确保执行 git 命令的用户有足够的权限。
2. **认证解决方案**：配置 git 凭证，或使用 SSH 密钥。
3. **依赖解决方案**：在拉取代码后，自动执行 `npm install` 命令。
4. **构建解决方案**：在拉取代码后，自动执行 `npm run build` 命令。
5. **重启解决方案**：在拉取代码后，自动重启相关服务。