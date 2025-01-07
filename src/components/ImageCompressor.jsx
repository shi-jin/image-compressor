import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import styled from '@emotion/styled';

const CompressorContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const UploadSection = styled.div`
  border: 2px dashed #007AFF;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 122, 255, 0.1);
  }
  
  &.dragging {
    background-color: rgba(0, 122, 255, 0.2);
    border-color: #0051D5;
  }
`;

const ImagePreviewSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewCard = styled.div`
  background: #f5f5f7;
  padding: 1rem;
  border-radius: 12px;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: contain;
    max-height: 300px;
  }
`;

const Button = styled.button`
  background: #007AFF;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #0051D5;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ImageInfo = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const RangeInput = styled.input`
  width: 100%;
  margin: 1rem 0;
  -webkit-appearance: none;
  height: 4px;
  background: #007AFF;
  border-radius: 2px;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #007AFF;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const QualityLabel = styled.p`
  text-align: center;
  color: #666;
  margin: 0.5rem 0;
`;

const HistorySection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
`;

const HistoryTitle = styled.h3`
  color: #1d1d1f;
  margin-bottom: 1rem;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HistoryItem = styled.div`
  background: #f5f5f7;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HistoryInfo = styled.div`
  flex: 1;
  
  p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }
`;

const ProgressContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  z-index: 9999;
  animation: slideIn 0.3s ease;
  border: 1px solid #eee;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin: 10px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #007AFF;
  border-radius: 4px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const ProgressText = styled.div`
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 8px;
`;

const TimeRemaining = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-top: 8px;
`;

function ImageCompressor() {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressionRatio, setCompressionRatio] = useState(0.5);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionHistory, setCompressionHistory] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const savedHistory = localStorage.getItem('compressionHistory');
    if (savedHistory) {
      try {
        setCompressionHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('加载历史记录失败:', error);
        localStorage.removeItem('compressionHistory');
      }
    }
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setOriginalImage({
        file,
        url: URL.createObjectURL(file)
      });
      await compressImage(file, compressionRatio);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('dragging');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragging');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragging');
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setOriginalImage({
        file,
        url: URL.createObjectURL(file)
      });
      compressImage(file, compressionRatio);
    } else {
      alert('请上传图片文件');
    }
  };

  const compressImage = async (file, quality) => {
    setIsCompressing(true);
    setProcessingStatus('准备压缩...');
    
    // 根据文件大小估算压缩时间（每MB预计3秒）
    const estimatedSeconds = Math.max(3, Math.ceil(file.size / (1024 * 1024) * 3));
    setTimeRemaining(estimatedSeconds);
  
    let progressTimer = null;
    let secondsLeft = estimatedSeconds;
    let currentProgress = 0;
  
    // 进度更新
    progressTimer = setInterval(() => {
      if (secondsLeft > 0) {
        currentProgress = Math.min(95, Math.round(((estimatedSeconds - secondsLeft) / estimatedSeconds) * 100));
        setProcessingStatus(`压缩进度：${currentProgress}%`);
        setTimeRemaining(secondsLeft);
        secondsLeft--;
      }
    }, 1000);
  
    const options = {
      maxSizeMB: file.size / (1024 * 1024) * quality,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      clearInterval(progressTimer);
      setCompressedImage({
        file: compressedFile,
        url: URL.createObjectURL(compressedFile)
      });
      setProcessingStatus('压缩完成！100%');
      setTimeRemaining(0);
      
      // 延迟关闭进度显示
      setTimeout(() => {
        setIsCompressing(false);
        setProcessingStatus('');
      }, 2000);
    } catch (error) {
      console.error('压缩失败:', error);
      clearInterval(progressTimer);
      setProcessingStatus('压缩失败，请重试');
      setTimeRemaining(0);
      
      setTimeout(() => {
        setIsCompressing(false);
        setProcessingStatus('');
      }, 2000);
      
      alert('图片压缩失败，请重试');
    }
  };

  const handleCompressionChange = async (event) => {
    const ratio = parseFloat(event.target.value);
    setCompressionRatio(ratio);
    if (originalImage) {
      await compressImage(originalImage.file, ratio);
    }
  };

  const saveToHistory = (originalFile, compressedFile) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      originalName: originalFile.name,
      originalSize: originalFile.size,
      compressedSize: compressedFile.size,
      compressionRatio: compressionRatio,
    };

    const newHistory = [historyItem, ...compressionHistory].slice(0, 10);
    setCompressionHistory(newHistory);
    localStorage.setItem('compressionHistory', JSON.stringify(newHistory));
  };

  const handleDownload = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage.url;
      link.download = `compressed_${originalImage.file.name}`;
      link.click();
      
      saveToHistory(originalImage.file, compressedImage.file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <CompressorContainer>
      <UploadSection 
        onClick={() => document.getElementById('fileInput').click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <p>点击或拖拽图片到此处上传</p>
      </UploadSection>

      {originalImage && (
        <>
          <RangeInput
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={compressionRatio}
            onChange={handleCompressionChange}
            disabled={isCompressing}
          />
          <QualityLabel>压缩质量: {(compressionRatio * 100).toFixed(0)}%</QualityLabel>

          <ImagePreviewSection>
            <PreviewCard>
              <h3>原始图片</h3>
              <img src={originalImage.url} alt="原始图片" />
              <ImageInfo>
                文件大小: {formatFileSize(originalImage.file.size)}
              </ImageInfo>
            </PreviewCard>

            {compressedImage && (
              <PreviewCard>
                <h3>压缩后</h3>
                <img src={compressedImage.url} alt="压缩后的图片" />
                <ImageInfo>
                  文件大小: {formatFileSize(compressedImage.file.size)}
                  <br />
                  压缩率: {((1 - compressedImage.file.size / originalImage.file.size) * 100).toFixed(1)}%
                </ImageInfo>
              </PreviewCard>
            )}
          </ImagePreviewSection>

          {compressedImage && (
            <Button onClick={handleDownload} disabled={isCompressing}>
              {isCompressing ? '压缩中...' : '下载压缩后的图片'}
            </Button>
          )}
        </>
      )}

      <HistorySection>
        <HistoryTitle>压缩历史记录</HistoryTitle>
        {compressionHistory.length > 0 ? (
          <HistoryList>
            {compressionHistory.map((item) => (
              <HistoryItem key={item.id}>
                <HistoryInfo>
                  <p>文件名: {item.originalName}</p>
                  <p>压缩时间: {item.timestamp}</p>
                  <p>原始大小: {formatFileSize(item.originalSize)}</p>
                  <p>压缩后大小: {formatFileSize(item.compressedSize)}</p>
                  <p>压缩质量: {(item.compressionRatio * 100).toFixed(0)}%</p>
                  <p>压缩比例: {((1 - item.compressedSize / item.originalSize) * 100).toFixed(1)}%</p>
                </HistoryInfo>
              </HistoryItem>
            ))}
          </HistoryList>
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>暂无压缩记录</p>
        )}
      </HistorySection>

      {isCompressing && (
        <ProgressContainer>
          <ProgressText>{processingStatus || '准备压缩...'}</ProgressText>
          <ProgressBar>
            <ProgressFill 
              progress={
                processingStatus.includes('%') 
                  ? parseInt(processingStatus.match(/\d+/)[0]) 
                  : 0
              } 
            />
          </ProgressBar>
          {timeRemaining > 0 && (
            <TimeRemaining>
              预计剩余时间：{timeRemaining} 秒
            </TimeRemaining>
          )}
        </ProgressContainer>
      )}
    </CompressorContainer>
  );
}

export default ImageCompressor;