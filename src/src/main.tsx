import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './utils/seedHistoryData'; // 导入历史数据填充工具

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
