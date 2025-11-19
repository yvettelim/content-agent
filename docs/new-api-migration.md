# 新版公众号API迁移指南

## 概述

为了降低API成本并提高数据采集效率，我们从单一API接口迁移到三阶段并行采集的新API架构。

## API对比

### 旧版API
- **供应商**: dajiala.com
- **接口**: 1个接口获取所有数据
- **模式**: 基于关键词搜索
- **缺点**: 成本较高

### 新版API
- **供应商**: wxrank.com
- **接口**: 3个接口分阶段采集
- **模式**: 公众号直接采集 + 关键词搜索
- **优点**: 成本更低，支持并行采集

## 新API架构

### 三阶段采集流程

1. **阶段1**: 获取公众号文章列表 (`getps`)
   - 输入: 公众号ID + 游标
   - 输出: 文章基础信息列表

2. **阶段2**: 并行采集详细信息
   - **接口2** (`artinfo`): 获取文章详细内容
   - **接口3** (`getrk`): 获取互动数据
   - 依赖: 需要接口1的文章URL和comment_id

### 搜索功能
- **接口**: `getsu`
- 功能: 通过关键词搜索公众号
- 支持: 获取公众号基本信息

## 配置说明

### 环境变量
```env
# 新版API密钥 (必需)
NEXT_PUBLIC_NEW_WECHAT_API_KEY=your_wxrank_api_key

# 旧版API配置 (保留作为备用)
NEXT_PUBLIC_WECHAT_API_KEY=your_old_api_key
```

### 采集参数

```typescript
interface CollectionOptions {
  articleCount: 20 | 50 | 100;  // 采集文章数量
  batchSize: number;           // 批次大小，默认10
  batchDelay: number;          // 批次延迟(ms)，默认500
  enableContentCollection: boolean; // 是否采集文章内容
  enableRankCollection: boolean;   // 是否采集互动数据
}
```

## 使用方法

### 方法1: 直接公众号ID采集
```javascript
const result = await collectWechatArticles({
  wxid: 'gh_e036770fc439',
  articleCount: 50,
  enableContentCollection: true,
  enableRankCollection: true,
});
```

### 方法2: 关键词搜索公众号
```javascript
const result = await collectWechatArticles({
  keyword: '丁香医生',
  articleCount: 20,
});
```

## 前端界面

用户可以在搜索配置页面选择：

1. **API版本**: 新版API (推荐) 或 旧版API
2. **公众号ID**: 直接输入或通过关键词搜索
3. **文章数量**: 20/50/100篇
4. **采集选项**:
   - ✅ 采集文章内容
   - ✅ 采集互动数据

## 性能优化

### 并行采集策略
- **分批处理**: 每批10篇文章并行处理
- **两阶段设计**: 先获取列表，再并行采集详情
- **智能错误处理**: 单篇失败不影响整体采集
- **速率限制**: 批次间500ms延迟，避免API限制

### 成本控制
- **选择性采集**: 可选择只采集基础信息
- **分级采集**: 重要文章优先采集详细信息
- **错误重试**: 自动重试失败的请求

## 数据格式转换

新API返回的数据会自动转换为现有系统兼容的格式：

```typescript
// 新API数据 -> WechatArticle
const wechatArticle = convertToWechatArticle(newArticleData);
```

## 兼容性

- ✅ 完全兼容现有数据库结构
- ✅ 兼容现有分析流程
- ✅ 支持新旧API切换
- ✅ 保持现有UI交互

## 监控和统计

系统会记录采集统计信息：

```typescript
const stats = {
  total: 50,              // 总文章数
  basicCollected: 50,     // 基础信息采集数
  detailCollected: 48,    // 详细内容采集数
  rankCollected: 45,      // 互动数据采集数
  withErrors: 2,          // 采集错误数
  successRate: '96.0%',   // 成功率
};
```

## 错误处理

常见错误及解决方法：

1. **API密钥未配置**
   - 检查环境变量 `NEXT_PUBLIC_NEW_WECHAT_API_KEY`

2. **公众号ID无效**
   - 验证公众号ID格式 (如: gh_e036770fc439)
   - 或使用关键词搜索公众号

3. **采集超时**
   - 减少batchSize或增加batchDelay
   - 检查网络连接

4. **积分不足**
   - 检查API账户积分余额
   - 考虑减少采集数量

## 最佳实践

1. **优先使用新版API**: 成本更低，效率更高
2. **合理设置采集数量**: 根据需要选择20/50/100篇
3. **选择性采集**: 根据分析需求选择采集内容
4. **监控错误率**: 关注采集统计信息
5. **测试模式**: 先小批量测试，确认效果后再大规模采集

## 技术支持

如有问题，请查看：
- 控制台日志
- API响应状态
- 环境变量配置
- 网络连接状态