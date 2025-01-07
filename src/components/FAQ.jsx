import React from 'react';
import styled from '@emotion/styled';

const FAQSection = styled.section`
  margin-top: 3rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
`;

const Question = styled.h3`
  color: #1d1d1f;
  margin-bottom: 0.5rem;
`;

const Answer = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
`;

function FAQ() {
  return (
    <FAQSection>
      <h2>常见问题</h2>
      <Question>1. 这个工具是免费的吗？</Question>
      <Answer>是的，完全免费，没有任何限制。</Answer>

      <Question>2. 我的图片会上传到服务器吗？</Question>
      <Answer>不会。所有处理都在您的浏览器中完成，保护您的隐私。</Answer>

      <Question>3. 支持哪些图片格式？</Question>
      <Answer>目前支持 JPG、PNG 等常见格式。</Answer>

      <Question>4. 压缩后的图片质量如何？</Question>
      <Answer>您可以通过滑块自由调节压缩质量，在文件大小和图片质量之间找到平衡。</Answer>

      <Question>5. 有文件大小限制吗？</Question>
      <Answer>没有严格限制，但建议单个文件不超过 10MB 以获得最佳性能。</Answer>
    </FAQSection>
  );
}

export default FAQ; 