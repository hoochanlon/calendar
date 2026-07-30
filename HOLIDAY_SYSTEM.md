# 假期数据自动更新系统

这个日历应用现在支持自动从 API 获取最新的假期数据，无需每年手动更新代码。

## 工作原理

### 1. 运行时动态加载（方案 1）

应用启动时会自动从 [天行数据假期 API](https://timor.tech/api/holiday) 获取当前年份和下一年的假期数据：

- **首次加载**：从 API 获取数据
- **本地缓存**：数据缓存 7 天，避免频繁请求
- **降级处理**：如果 API 失败，使用代码中的 fallback 数据

**文件位置：**
- `src/services/holidayService.ts` - 假期数据服务
- `src/hooks/useHolidayData.ts` - 假期数据 Hook
- `src/contexts/HolidayContext.tsx` - 全局假期数据 Context

### 2. 自动更新工作流（方案 2）

GitHub Action 会定期自动更新代码中的 fallback 假期数据：

- **触发时机**：每年 1 月 1 日和 7 月 1 日自动运行
- **手动触发**：在 GitHub Actions 页面手动运行
- **更新方式**：自动创建 PR，需要人工审核后合并

**配置文件：** `.github/workflows/update-holidays.yml`

## 使用方法

### 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式（自动从 API 获取数据）
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

### 部署到 GitHub Pages

1. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择：**GitHub Actions**

2. **推送代码触发部署**
   ```bash
   git add .
   git commit -m "Update calendar app"
   git push
   ```

3. **访问应用**
   - 部署完成后访问：`https://<你的用户名>.github.io/calendar/`

### 手动触发假期数据更新

如果需要立即更新假期数据：

1. 进入仓库的 **Actions** 页面
2. 选择 **Update Holiday Data** 工作流
3. 点击 **Run workflow** 按钮
4. 等待工作流完成并创建 PR
5. 审核 PR 并合并

## 数据来源

- **主要数据源**：[天行数据假期 API](https://timor.tech/api/holiday)
- **Fallback 数据**：`src/configs/holidays.ts`（2024-2026 年数据）

## 架构优势

✅ **无需每年手动更新** - 运行时自动获取最新数据  
✅ **离线可用** - 本地缓存 + fallback 数据保证可用性  
✅ **自动化维护** - GitHub Action 定期更新 fallback 数据  
✅ **用户体验好** - 首屏不阻塞，异步加载数据  

## 技术细节

### 假期数据流

```
用户访问应用
    ↓
检查本地缓存（localStorage）
    ↓
缓存有效？
  是 → 使用缓存数据
  否 ↓
    调用 API 获取数据
        ↓
    API 成功？
      是 → 更新缓存 + 使用新数据
      否 → 使用 fallback 数据
```

### Context 架构

```
HolidayProvider（App 根组件）
    ↓
useHolidayData（数据加载）
    ↓
holidayService（API 调用 + 缓存）
    ↓
useHoliday（子组件消费）
```

## 疑难解答

**Q: 假期数据显示不正确？**  
A: 清除浏览器 localStorage，刷新页面重新获取数据。

**Q: API 请求失败怎么办？**  
A: 应用会自动降级使用本地 fallback 数据，不影响使用。

**Q: 如何添加自定义假期？**  
A: 修改 `src/configs/holidays.ts`，添加到相应的 Map 中。

**Q: 如何修改 API 地址？**  
A: 修改 `src/services/holidayService.ts` 中的 `HOLIDAY_API_URL` 常量。
