import React from 'react';
import ImageCompressor from './components/ImageCompressor';
import styled from '@emotion/styled';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f7;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  color: #1d1d1f;
  margin-bottom: 2rem;
`;

function App() {
  return (
    <AppContainer>
      <Title>图片压缩工具</Title>
      <ImageCompressor />
    </AppContainer>
  );
}

export default App;