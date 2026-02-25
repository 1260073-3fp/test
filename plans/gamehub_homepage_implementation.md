# 遊戲中心主頁實施計劃

## 項目概述
合併現有的深色模式和淺色模式遊戲中心主頁，創建一個帶有主題切換功能的單一主頁，並整合三個遊戲的導航。

## 實施步驟

### 1. 創建整合的主頁 (index.html)
- 位置: `gamehub.github.io/index.html`
- 功能:
  - 響應式設計，支援移動設備和桌面
  - 深色/淺色主題切換
  - 三個遊戲的卡片展示
  - 遊戲說明和快速導航

### 2. 主題切換功能
- 使用 Tailwind CSS 的 `dark:` 類別
- 主題切換按鈕（頭部和頁腳）
- 將用戶偏好保存到 localStorage
- 平滑的主題過渡動畫

### 3. 遊戲整合
- 為每個遊戲創建專屬卡片:
  - **遊戲1**: 雙蘋果貪食蛇 (game1.html)
  - **遊戲2**: 小恐龍遊戲 (game2.html)
  - **遊戲3**: 簡易迷宮鬼捉人 (game3.html)
- 每個卡片包含:
  - 遊戲標題和描述
  - 難度標籤（簡單/中等/困難）
  - 評分顯示
  - "立即遊玩" 按鈕

### 4. 導航功能
- 快速導航區塊
- 遊戲分類標籤
- 底部導航（可選）

### 5. 設計元素
- 主色調: `#f2cc0d` (黃色)
- 深色背景: `#1e3a5f` (深藍色)
- 淺色背景: `#f8f8f5` (淺米色)
- 卡片陰影和懸停效果
- 漸變背景和圖標

## 技術規格

### HTML 結構
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <!-- Meta tags, title, fonts, Tailwind CSS -->
</head>
<body class="light-theme dark:dark-theme">
    <!-- Header with theme toggle -->
    <!-- Hero section -->
    <!-- Games grid (3 cards) -->
    <!-- Game instructions -->
    <!-- Quick navigation -->
    <!-- Footer -->
    <!-- JavaScript for theme toggle -->
</body>
</html>
```

### CSS/樣式
- Tailwind CSS 框架
- 自定義顏色配置
- 響應式斷點:
  - 移動設備: < 768px
  - 平板: 768px - 1024px
  - 桌面: > 1024px

### JavaScript 功能
- 主題切換邏輯
- localStorage 存儲
- 卡片懸停效果
- 頁面初始化

## 文件結構
```
gamehub.github.io/
├── index.html          # 新的整合主頁
├── game1.html          # 貪食蛇遊戲
├── game2.html          # 小恐龍遊戲
├── game3.html          # 迷宮鬼捉人遊戲
├── style.css           # 現有樣式（可選更新）
├── main.js             # 現有JavaScript（可選更新）
├── games.json          # 遊戲數據
└── game_center_home_*  # 原始設計文件（保留）
```

## 測試計劃
1. 主題切換功能測試
2. 遊戲連結跳轉測試
3. 響應式設計測試
4. 瀏覽器兼容性測試

## 完成標準
- [ ] 主頁成功加載並顯示三個遊戲
- [ ] 主題切換功能正常工作
- [ ] 所有遊戲連結正確跳轉
- [ ] 頁面在移動設備和桌面上顯示正常
- [ ] 用戶體驗流暢，無明顯錯誤

## 後續優化建議
1. 添加更多遊戲
2. 實現遊戲分類篩選
3. 添加搜尋功能
4. 集成用戶分數系統
5. 添加遊戲預覽圖或影片