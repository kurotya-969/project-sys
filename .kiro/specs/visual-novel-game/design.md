# 設計書

## 概要

30ターン分岐型ノベルゲームは、HTML/CSS/JavaScriptを使用したシングルページアプリケーション（SPA）として実装します。Vanilla JavaScriptを採用し、軽量で高速な動作を実現します。ゲーム状態管理、イベントシステム、UI制御を分離したモジュラー設計とします。

## アーキテクチャ

### システム構成

```
visual-novel-game/
├── index.html              # メインHTMLファイル
├── css/
│   └── style.css          # スタイルシート
├── js/
│   ├── main.js            # エントリーポイント
│   ├── gameState.js       # ゲーム状態管理
│   ├── eventSystem.js     # イベント処理システム
│   ├── uiController.js    # UI制御
│   ├── saveSystem.js      # セーブ・ロード機能
│   └── audioManager.js    # 音響管理
├── assets/
│   ├── images/
│   │   ├── bg_room_day.png
│   │   ├── bg_room_evening.png
│   │   ├── bg_room_night.png
│   │   └── sis_default.png
│   ├── audio/
│   │   ├── bgm_loop.mp3
│   │   ├── ending_good.mp3
│   │   └── ending_bad.mp3
│   └── data/
│       └── events.json    # イベントデータ
└── README.md
```

### 技術スタック

- **フロントエンド**: Vanilla JavaScript (ES6+)
- **スタイリング**: CSS3 (Flexbox/Grid)
- **音響**: Howler.js ライブラリ
- **データ保存**: localStorage API
- **モジュール管理**: ES6 Modules

## コンポーネントとインターフェース

### 1. ゲーム状態管理 (gameState.js)

```javascript
class GameState {
  constructor(config = {}) {
    this.config = Object.assign({
      goal_money: 100000,
      affection_threshold: 70,
      max_days: 30,
      bad_end_threshold: 10,
      initial_affection: 30
    }, config);
    
    this.day = 1;
    this.affection = this.config.initial_affection;
    this.money = 0;
    this.consecutive_none = 0;
  }
  
  // 状態更新メソッド
  applyAction(actionType, eventData);
  checkEndingCondition();
  incrementDay();
  resetConsecutiveNone();
  updateConfig(newConfig);
}
```

### 2. イベントシステム (eventSystem.js)

```javascript
class EventSystem {
  constructor() {
    this.events = [];
  }
  
  // イベント管理メソッド
  async loadEvents();
  pickEvent(type, day);
  calculateEventEffects(event);
  getRandomVariation(base, min, max);
}
```

### 3. UI制御 (uiController.js)

```javascript
class UIController {
  constructor() {
    this.currentScreen = 'title';
    this.typewriterSpeed = 50;
  }
  
  // 画面制御メソッド
  showScreen(screenName);
  updateStatusBar(gameState);
  displayDialogue(text, callback);
  showActionButtons();
  hideActionButtons();
  typewriterEffect(element, text, speed);
}
```

### 4. セーブシステム (saveSystem.js)

```javascript
class SaveSystem {
  // セーブ・ロード機能
  saveGame(gameState);
  loadGame();
  hasSaveData();
  clearSaveData();
}
```

### 5. 音響管理 (audioManager.js)

```javascript
class AudioManager {
  constructor() {
    this.bgm = null;
    this.sfx = {};
  }
  
  // 音響制御メソッド
  playBGM(filename, loop);
  stopBGM();
  playSFX(filename);
  setVolume(type, volume);
}
```

## データモデル

### ゲーム状態オブジェクト

```javascript
const gameStateSchema = {
  day: Number,              // 1-30
  affection: Number,        // 0-100
  money: Number,            // 0以上の整数
  consecutive_none: Number, // 0以上の整数
  goal_money: Number,       // 目標金額（デフォルト: 100000）
  affection_threshold: Number // 好感度閾値（デフォルト: 70）
};
```

### ゲーム設定オブジェクト

```javascript
const gameConfigSchema = {
  goal_money: 100000,           // 目標金額
  affection_threshold: 70,      // 好感度閾値
  max_days: 30,                // 最大日数
  bad_end_threshold: 10,        // バッドエンド連続回数
  initial_affection: 30,        // 初期好感度
  work_base_income: 5000,       // 仕事基本収入
  work_income_variation: 2000,  // 仕事収入変動幅
  play_affection_base: 5,       // 遊ぶ基本好感度
  play_affection_variation: 3   // 遊ぶ好感度変動幅
};
```

### イベントデータ構造

```javascript
const eventSchema = {
  id: String,              // 一意識別子
  type: String,            // "play" | "work" | "none"
  weight: Number,          // 選択重み（1-10）
  day_specific: Number,    // 特定日イベント（null可）
  text: Array,             // 表示テキスト配列
  affection_delta: Number, // 好感度変化量
  money_delta: Number,     // 所持金変化量
  special: Boolean         // 特別イベントフラグ
};
```

## エラーハンドリング

### 1. データ読み込みエラー

- イベントJSONファイル読み込み失敗時のフォールバック
- 音声ファイル読み込み失敗時の無音継続
- 画像ファイル読み込み失敗時のプレースホルダー表示

### 2. ゲーム状態エラー

- 不正な値の自動修正（範囲外の数値を適正範囲にクランプ）
- セーブデータ破損時の初期状態復元
- 予期しない状態遷移の防止

### 3. UI操作エラー

- 連続クリック防止（ボタン無効化）
- 不正な画面遷移の阻止
- タイプライター効果中の操作制限

```javascript
// エラーハンドリング例
class ErrorHandler {
  static handleDataLoadError(error, fallbackData) {
    console.warn('データ読み込みエラー:', error);
    return fallbackData;
  }
  
  static validateGameState(state) {
    return {
      day: Math.max(1, Math.min(30, state.day || 1)),
      affection: Math.max(0, Math.min(100, state.affection || 30)),
      money: Math.max(0, state.money || 0),
      consecutive_none: Math.max(0, state.consecutive_none || 0)
    };
  }
}
```

## テスト戦略

### 1. 単体テスト

- ゲーム状態管理ロジックのテスト
- イベント選択アルゴリズムのテスト
- エンディング判定ロジックのテスト
- セーブ・ロード機能のテスト

### 2. 統合テスト

- 画面遷移フローのテスト
- ゲーム進行の30日間シミュレーション
- 各エンディング到達パスのテスト
- セーブデータ互換性テスト

### 3. ユーザビリティテスト

- UI応答性の確認
- タイプライター効果の速度調整
- BGM・効果音の音量バランス
- モバイル端末での操作性確認

### テスト実装方針

```javascript
// テスト用のモック関数例
class TestUtils {
  static mockGameState(overrides = {}) {
    return Object.assign({
      day: 1,
      affection: 30,
      money: 0,
      consecutive_none: 0
    }, overrides);
  }
  
  static simulateGameDay(gameState, action) {
    // 1日分のゲーム進行をシミュレート
  }
  
  static testEndingConditions() {
    // 全エンディング条件をテスト
  }
}
```

### パフォーマンス最適化

1. **画像最適化**: WebP形式の使用、適切なサイズ設定
2. **音声最適化**: 圧縮率とファイルサイズのバランス調整
3. **DOM操作最適化**: 必要最小限の要素更新
4. **メモリ管理**: 不要なイベントリスナーの削除

この設計により、要件で定義された全機能を効率的に実装し、保守性と拡張性を確保します。