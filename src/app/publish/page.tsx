'use client';

import { useState } from 'react';
import { FilterAndSearch } from '@/components/publish/FilterAndSearch';
import { ArticleList } from '@/components/publish/ArticleList';
import { PublishPreview } from '@/components/publish/PublishPreview';

export default function PublishPage() {
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [previewArticle, setPreviewArticle] = useState<any>(null);

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticles(prev =>
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleSelectAll = () => {
    setSelectedArticles(['1', '2', '3', '4']);
  };

  const handlePreview = (article: any) => {
    setPreviewArticle(article);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">发布管理中心</h1>
        <p className="text-gray-600">管理您的内容发布到多个平台</p>
      </div>

      <FilterAndSearch
        selectedCount={selectedArticles.length}
        onSelectAll={handleSelectAll}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ArticleList
            selectedArticles={selectedArticles}
            onSelectArticle={handleSelectArticle}
            onPreview={handlePreview}
          />
        </div>
        <div className="lg:col-span-1">
          {previewArticle && <PublishPreview article={previewArticle} />}
        </div>
      </div>
    </div>
  );
}