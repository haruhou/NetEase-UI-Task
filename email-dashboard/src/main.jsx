import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <ConfigProvider
    locale={zhCN}
    theme={{
      token: { colorPrimary: '#2e2e2c', colorText: '#1d1d1b', borderRadius: 12, fontSize: 13, controlHeight: 34, colorBorder: '#dcdad3', fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' },
      components: { Button: { defaultShadow: 'none', primaryShadow: 'none', borderRadius: 17 }, Select: { borderRadius: 12 } },
    }}
  >
    <App />
  </ConfigProvider>
);
