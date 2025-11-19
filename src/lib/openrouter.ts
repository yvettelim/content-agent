/**
 * OpenRouter API 集成服务
 * 用于调用 AI 模型生成洞察建议
 */

import { AIInsightSuggestion } from '@/types';

// OpenRouter API 响应类型
interface OpenRouterResponse {
  id: string;
  provider: string;
  model: string;
  object: string;
  created: number;
  choices: {
    logprobs: any;
    finish_reason: string;
    native_finish_reason: string;
    index: number;
    message: {
      role: string;
      content: string;
      refusal: any;
      reasoning: any;
    };
  }[];
  system_fingerprint: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details: {
      cached_tokens: number;
      audio_tokens: number;
    };
    completion_tokens_details: {
      reasoning_tokens: number;
    };
  };
}

// 文章数据类型
interface ArticleData {
  title: string;
  wx_name: string;
  read: number;
  praise: number;
  looking: number;
  publish_time_str: string;
  content?: string;
}

/**
 * 调用 OpenRouter API 生成洞察建议
 */
// 重试函数
async function retryOpenRouterCall(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`OpenRouter API 调用尝试 ${attempt}/${maxRetries}`);

      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(90000), // 增加到90秒超时
      });

      if (response.ok) {
        console.log(`OpenRouter API 调用成功，尝试 ${attempt}/${maxRetries}`);
        return response;
      }

      // 如果不是服务器错误，不重试
      if (response.status < 500) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API 调用失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      if (attempt === maxRetries) {
        throw new Error(`OpenRouter API 调用失败，已重试 ${maxRetries} 次: ${response.status} ${response.statusText}`);
      }

      // 等待后重试
      console.log(`等待 ${2000 * attempt}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    } catch (error) {
      console.error(`OpenRouter API 调用尝试 ${attempt} 失败:`, error);

      // 如果是超时错误或网络错误，继续重试
      if (error instanceof Error &&
          (error.name === 'AbortError' ||
           error.name === 'TypeError' ||
           error.message.includes('terminated') ||
           error.message.includes('ECONNRESET'))) {

        if (attempt === maxRetries) {
          throw new Error(`OpenRouter API 网络错误，已重试 ${maxRetries} 次: ${error.message}`);
        }

        console.log(`网络错误，等待 ${3000 * attempt}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
        continue;
      }

      // 其他错误直接抛出
      throw error;
    }
  }

  throw new Error('重试次数已用完');
}

export async function generateInsightsWithAI(
  keyword: string,
  topArticles: any[]
): Promise<AIInsightSuggestion[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions';
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  if (!apiKey) {
    throw new Error('未配置 OpenRouter API Key');
  }

  if (topArticles.length === 0) {
    throw new Error('没有足够的文章数据进行分析');
  }

  // 构建专业的分析 Prompt
  const systemPrompt = `你是一名专业的公众号内容策略分析师，擅长从高表现文章中提炼可执行的选题策略。

你将收到：
- 一个关键词
- 多篇文章的基础数据（标题、账号、阅读、点赞、在看、互动率、发布时间）
- 可选的文章内容片段（已截断 300~600 字）

⚠️ 你的任务不是复述文章，也不是做空洞商业分析，而是基于“高互动文章”做深度内容模式拆解，最终产出“可直接用来写文章的结构化选题方案”。

---

# 【分析任务 · 两阶段】

## 第一阶段：内部结构化拆解（不输出，只在脑中完成）
基于互动率高 & 阅读不低的文章提取：
1. 标题特征分析（高频词汇、常用句式、情绪词、高表现标题结构）
2. 内容方向分类（工具方法 / 踩坑避坑 / 案例复盘 / 故事叙述 / 趋势洞察 / 资源整合 / 对比评测）
3. 用户痛点聚合（最焦虑点、迫切需求、易共鸣情绪点、典型使用场景）
4. 内容结构共性（开局钩子、痛点放大方式、解决方案呈现、是否包含案例/对比/故事/清单等）
5. 高互动内容特征（是否更具体、更接地气、案例更多、有情绪共鸣、明确结论、硬数据支撑等）

## 第二阶段：输出可直接创作的【结构化选题方案】
- 输出 3~5 条；
- title ≤15 字，可直接作为文章标题方向；
- reason 字段必须按以下顺序多行列出：
  选题方向：...
  目标受众：...
  核心痛点：...
  内容角度：...
  推荐结构：...
  内容形式：...
  标题参考：标题1 / 标题2 / 标题3
  预期互动潜力：高/中高/中；
- data_support 字段写创作提醒或留空；
- 输出 JSON：{"suggestions":[{ "title": "...", "reason": "...", "data_support": "..." }]}，不得包含其它文字。`;

  // 限制文章数量以降低请求体积
  const limitedArticles = topArticles.slice(0, 8); // 只取前8篇文章

  // 构建文章数据摘要（优化长度）
  const articlesSummary = limitedArticles.map((article, index) => {
    const read = article.read_count || article.read || 0;
    const praise = article.praise || 0;
    const looking = article.looking || 0;
    const wx_name = article.wx_name || '未知公众号';
    const publish_time_str = article.publish_time_str || '';
    const content = article.content || '';

    const engagementRate = read > 0 ? ((praise + looking) / read * 100).toFixed(1) : '0';
    // 减少内容片段长度到300字符
    const snippet = content ? content.slice(0, 300).replace(/\n/g, ' ').trim() : '';

    return `${index + 1}. 标题：${article.title}
账号：${wx_name}
数据：${read}读|${praise}赞|${looking}在看|${engagementRate}%互动率
时间：${publish_time_str}
摘要：${snippet}`;
  }).join('\n\n');

  const userPrompt = `关键词：${keyword}
请分析以下 ${limitedArticles.length} 篇高表现文章的数据（按互动率排序），聚焦标题特征、内容方向和用户痛点，输出 3~5 条可执行的选题策略：

${articlesSummary}

要求输出 {"suggestions":[...]} 格式，每条包含：
- title: ≤15字的选题方向
- reason: 按以下结构分行说明：
  选题方向：具体切入点
  目标受众：精准人群描述
  核心痛点：主要解决什么问题
  内容角度：独特观点或视角
  推荐结构：内容组织方式
  内容形式：呈现形式（教程/案例/对比等）
  标题参考：3个具体标题示例
  预期互动潜力：高/中高/中
- data_support: 数据支撑说明或创作提示

严格输出JSON，无其他文字。`;

  try {
    const requestBody = JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: parseInt(process.env.OPENROUTER_MAX_TOKENS || '1600'),
      temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.2'),
    });

    console.log('OpenRouter API request body length:', requestBody.length);

    // 重试机制
    const response = await retryOpenRouterCall(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'WeChat Content Analysis Platform',
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API 调用失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
      throw new Error('OpenRouter API 返回了无效的响应');
    }

    const content = data.choices[0].message.content?.trim() || '';
    const parsedSuggestions = parseInsightResponse(content);
    const enrichedSuggestions = ensureSuggestionCount(parsedSuggestions, keyword, topArticles);

    return enrichedSuggestions.slice(0, 5);

  } catch (error) {
    console.error('调用 OpenRouter API 生成洞察失败:', error);

    // 如果 API 调用失败，返回基于规则的备用建议
    return buildFallbackInsightSuggestions(keyword, topArticles);
  }
}

function parseInsightResponse(content: string): AIInsightSuggestion[] {
  if (!content) return [];

  let payload = content.trim();
  const jsonMatch = payload.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    payload = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(payload);
    const suggestions = Array.isArray(parsed?.suggestions) ? parsed.suggestions : Array.isArray(parsed) ? parsed : [];

    return suggestions
      .map((item: any, index: number) => normalizeSuggestion(item, index))
      .filter((suggestion: AIInsightSuggestion) => suggestion.title && suggestion.reason && suggestion.dataSupport);
  } catch (error) {
    console.warn('解析 AI 返回的洞察 JSON 失败:', error);
    return [];
  }
}

function normalizeSuggestion(item: any, index: number): AIInsightSuggestion {
  const title = (item?.title || item?.Title || item?.name || '').toString().trim().slice(0, 15) || `洞察建议${index + 1}`;
  const reason = (item?.reason || item?.insight || item?.description || '').toString().trim();
  const dataSupport = (item?.data_support || item?.dataSupport || item?.data || '').toString().trim();

  return {
    title,
    reason,
    dataSupport,
  };
}

function ensureSuggestionCount(
  suggestions: AIInsightSuggestion[],
  keyword: string,
  articles: ArticleData[]
): AIInsightSuggestion[] {
  const normalized = suggestions.slice(0, 5);

  if (normalized.length >= 3) {
    return normalized;
  }

  const fallback = buildFallbackInsightSuggestions(keyword, articles);
  const merged = [...normalized];

  for (const suggestion of fallback) {
    if (merged.length >= 5) break;
    merged.push(suggestion);
  }

  return merged;
}

/**
 * 生成备用洞察建议（当 AI 调用失败时使用）
 */
export function buildFallbackInsightSuggestions(keyword: string, articles: ArticleData[]): AIInsightSuggestion[] {
  if (!articles || articles.length === 0) {
    return [
      {
        title: '数据量不足提示',
        reason: `当前尚未搜集到与“${keyword}”相关的有效文章数据，难以识别可执行的策略机会，建议扩大采集范围或延长时间窗口以形成统计意义。`,
        dataSupport: '需补充文章阅读、点赞、在看、发布时间和所属行业等字段，建立基础指标库后再进行趋势与对标分析。',
      }
    ];
  }

  const avgRead = articles.reduce((sum, a) => sum + a.read, 0) / articles.length;
  const avgPraise = articles.reduce((sum, a) => sum + a.praise, 0) / articles.length;
  const avgLooking = articles.reduce((sum, a) => sum + a.looking, 0) / articles.length;
  const avgEngagement = articles.reduce((sum, a) => {
    const engagementRate = a.read > 0 ? ((a.praise + a.looking) / a.read) * 100 : 0;
    return sum + engagementRate;
  }, 0) / articles.length;

  const highReadArticles = articles.filter(a => a.read >= avgRead * 1.5);
  const highEngagementArticles = articles.filter(a => {
    const engagementRate = a.read > 0 ? ((a.praise + a.looking) / a.read) * 100 : 0;
    return engagementRate >= Math.max(5, avgEngagement * 1.2);
  });
  const recentArticles = articles.filter(a => {
    const publishDate = new Date(a.publish_time_str);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return publishDate >= sevenDaysAgo;
  });
  const uniqueAccounts = new Set(articles.map(a => a.wx_name));

  const suggestions: AIInsightSuggestion[] = [];

  const engagementRateDisplay = avgEngagement.toFixed(1);
  // 分析关键词特征，生成更有针对性的洞察
  const isTechKeyword = /AI|人工智能|技术|开发|编程|算法|模型|代码|工具|软件/i.test(keyword);
  const isBusinessKeyword = /商业|创业|营销|销售|增长|收入|客户|市场|品牌|策略/i.test(keyword);
  const isLifeKeyword = /生活|健康|教育|育儿|情感|心理|家庭|休闲|旅游|美食/i.test(keyword);

  suggestions.push({
    title: '高互动场景突破',
    reason: highEngagementArticles.length > 0
      ? `Top${articles.length}篇文章中有${highEngagementArticles.length}篇互动率超过均值${engagementRateDisplay}%以上，${isTechKeyword ? '说明技术实操类内容最受关注，建议增加"使用技巧+避坑指南"的对比内容' : isBusinessKeyword ? '表明商业模式和增长策略最容易引发讨论，可围绕"成功案例+失败复盘"展开' : '显示实用生活技巧类内容共鸣度高，适合制作"问题+解决方案"的直接指导内容'}。`
      : `整体平均互动率为${engagementRateDisplay}%，${isTechKeyword ? '技术话题讨论理性，建议通过"项目实战+效果对比"提升参与度' : isBusinessKeyword ? '商业类内容需要更强的数据支撑和案例验证' : '生活类话题可通过"情感共鸣+实用价值"增强粘性'}。`,
    dataSupport: '需抓取文章阅读、点赞、在看、粉丝规模和发布时间等数据，计算互动率分段，结合账号类型与内容题材做聚类分析，定位高互动场景。',
  });

  suggestions.push({
    title: '爆款结构复用',
    reason: highReadArticles.length > 0
      ? `${highReadArticles.length}篇文章阅读量高于均值 1.5 倍，${isTechKeyword ? '技术评测和性能对比类内容最受欢迎，建议制作"深度测评+实际应用"的双重验证模式' : isBusinessKeyword ? '成功案例和数据分析类内容传播最广，可围绕"ROI展示+方法总结"构建内容矩阵' : '实用教程和经验分享类内容传播效果好，适合"步骤详解+效果展示"的结构化表达'}，可围绕"${keyword}"的落地流程拆解最佳实践。`
      : `阅读量分布相对均衡，${isTechKeyword ? '技术内容需要更强的可视化演示和实际效果展示' : isBusinessKeyword ? '商业类内容应增加数据图表和成功案例的具体展示' : '生活类内容可通过痛点对比和前后效果对比提升吸引力'}，建议通过明确的成果指标或对比实验提升"${keyword}"的内容价值。`,
    dataSupport: '整理文章标题、封面元素、阅读与点赞走势，结合发布时间和推文位置，运用相关性分析识别触发高阅读的结构要素并形成模版。',
  });

  suggestions.push({
    title: '跨账号机会窗口',
    reason: uniqueAccounts.size > 1
      ? `${uniqueAccounts.size}个公众号在最近周期同时输出"${keyword}"相关内容，${isTechKeyword ? '技术领域竞争激烈，建议深耕细分场景或垂直领域' : isBusinessKeyword ? '商业赛道头部效应明显，需要找到差异化定位或目标人群细分' : '生活类话题内容同质化严重，需寻找独特视角或专业深度'}，适合从差异化角度切入抢占心智。`
      : `当前主要由单一账号输出"${keyword}"内容，${isTechKeyword ? '技术蓝海市场可快速建立权威性' : isBusinessKeyword ? '商业话题有先发优势，可快速占领用户心智' : '生活类话题缺乏竞争，有机会成为该领域的知识源头'}，竞争相对温和，可通过持续深耕快速放大声量。`,
    dataSupport: '需要标记账号所属行业、粉丝规模与更新频次，结合文章阅读/互动表现做矩阵对比，输出产品定位与差异化策略建议。',
  });

  suggestions.push({
    title: '节奏与窗口管理',
    reason: recentArticles.length > 0
      ? `近7天内共有${recentArticles.length}篇相关文章发布，${isTechKeyword ? '技术用户习惯在工作日白天获取信息，建议在行业热点期快速响应' : isBusinessKeyword ? '商业决策者更关注周一至周五的晨间和晚间内容，可配合财经日历安排发布' : '生活类用户在周末和晚间活跃度高，适合情感共鸣和实用指导内容'}，可据此安排"${keyword}"的高价值内容上线节奏。`
      : `近期更新频次偏低，${isTechKeyword ? '技术发展快速，需要保持稳定更新以维持技术权威性' : isBusinessKeyword ? '商业环境变化频繁，定期输出分析有助于建立专业形象' : '生活类话题具有时效性，持续更新能够强化用户依赖'}，建议结合热点节点提前排期，打造系列化内容以维持"${keyword}"的曝光。`,
    dataSupport: '采集文章发布时间、阅读首日走势和推送时间段，建立时间序列模型，评估最佳投放时段与内容更新节奏的影响。',
  });

  return suggestions.slice(0, 5);
}

/**
 * 验证 API 配置是否正确
 */
export function validateOpenRouterConfig(): { isValid: boolean; error?: string } {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey) {
    return { isValid: false, error: '未配置 OPENROUTER_API_KEY' };
  }

  if (!baseUrl) {
    return { isValid: false, error: '未配置 OPENROUTER_BASE_URL' };
  }

  if (!model) {
    return { isValid: false, error: '未配置 OPENROUTER_MODEL' };
  }

  return { isValid: true };
}
