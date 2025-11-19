'use client';

import { useState } from 'react';
import { CreationConfig, CreationStartConfig } from '@/components/creation/CreationConfig';
import { PreviewArea } from '@/components/creation/PreviewArea';
import { ImageManager } from '@/components/creation/ImageManager';

export default function CreatePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleStartCreation = (config: CreationStartConfig) => {
    setIsGenerating(true);
    console.log('开始创作，配置：', config);
    // 模拟生成过程
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">内容创作工作台</h1>
        <p className="text-gray-600">使用AI快速生成高质量内容</p>
      </div>

      <CreationConfig onStartCreation={handleStartCreation} isGenerating={isGenerating} />

      {showPreview && (
        <>
          <PreviewArea />
          <ImageManager />
        </>
      )}
    </div>
  );
}
