/**
 * ビジュアル管理システム
 * 背景画像とキャラクター立ち絵の表示・切り替え機能
 */

class VisualManager {
    constructor() {
        // DOM要素の参照
        this.backgroundElement = document.getElementById('background');
        this.characterElement = document.getElementById('character');
        this.characterImage = document.getElementById('character-image');
        
        // 背景画像のパス設定
        this.backgrounds = {
            day: 'assets/images/bg_room_day.jpg',
            evening: 'assets/images/bg_room_evening.jpg',
            night: 'assets/images/bg_room_night.jpg',
            default: 'assets/images/bg_room_day.jpg'
        };
        
        // キャラクター立ち絵のパス設定
        this.characters = {
            default: 'assets/images/sis_default.png',
            happy: 'assets/images/sis_happy.png',
            sad: 'assets/images/sis_sad.png',
            surprised: 'assets/images/sis_surprised.png'
        };
        
        // 現在の状態
        this.currentBackground = 'day';
        this.currentCharacter = 'default';
        
        // フォールバック用のプレースホルダー
        this.placeholderBackground = this.createPlaceholderBackground();
        this.placeholderCharacter = this.createPlaceholderCharacter();
    }
    
    /**
     * 背景画像を設定する
     * @param {string} backgroundKey - 背景のキー（day, evening, night）
     * @param {boolean} fade - フェード効果を使用するか
     */
    setBackground(backgroundKey, fade = true) {
        if (!this.backgroundElement) {
            console.error('Background element not found');
            return;
        }
        
        const backgroundPath = this.backgrounds[backgroundKey] || this.backgrounds.default;
        
        if (fade && this.currentBackground !== backgroundKey) {
            // フェード効果付きで背景を切り替え
            this.backgroundElement.style.opacity = '0';
            
            setTimeout(() => {
                this.applyBackground(backgroundPath);
                this.backgroundElement.style.opacity = '1';
                this.currentBackground = backgroundKey;
            }, 300);
        } else {
            // 即座に背景を切り替え
            this.applyBackground(backgroundPath);
            this.currentBackground = backgroundKey;
        }
    }
    
    /**
     * 背景画像を適用する（内部メソッド）
     * @param {string} backgroundPath - 背景画像のパス
     */
    applyBackground(backgroundPath) {
        // 画像の存在確認
        this.checkImageExists(backgroundPath).then(exists => {
            if (exists) {
                this.backgroundElement.style.backgroundImage = `url('${backgroundPath}')`;
            } else {
                console.warn(`Background image not found: ${backgroundPath}, using placeholder`);
                this.backgroundElement.style.backgroundImage = this.placeholderBackground;
            }
        });
    }
    
    /**
     * 日数に基づいて背景を自動設定する
     * @param {number} day - 現在の日数（1-30）
     */
    setBackgroundByDay(day) {
        // 日数を3で割った余りで時間帯を決定
        const timeOfDay = day % 3;
        
        if (timeOfDay === 0) {
            this.setBackground('night');
        } else if (timeOfDay === 1) {
            this.setBackground('day');
        } else {
            this.setBackground('evening');
        }
    }
    
    /**
     * キャラクター立ち絵を設定する
     * @param {string} characterKey - キャラクターのキー（default, happy, sad, surprised）
     * @param {boolean} fade - フェード効果を使用するか
     */
    setCharacter(characterKey, fade = true) {
        if (!this.characterImage) {
            console.error('Character image element not found');
            return;
        }
        
        const characterPath = this.characters[characterKey] || this.characters.default;
        
        if (fade && this.currentCharacter !== characterKey) {
            // フェード効果付きで立ち絵を切り替え
            this.characterElement.style.opacity = '0';
            
            setTimeout(() => {
                this.applyCharacter(characterPath);
                this.characterElement.style.opacity = '1';
                this.currentCharacter = characterKey;
            }, 300);
        } else {
            // 即座に立ち絵を切り替え
            this.applyCharacter(characterPath);
            this.currentCharacter = characterKey;
        }
    }
    
    /**
     * キャラクター立ち絵を適用する（内部メソッド）
     * @param {string} characterPath - キャラクター画像のパス
     */
    applyCharacter(characterPath) {
        // 画像の存在確認
        this.checkImageExists(characterPath).then(exists => {
            if (exists) {
                this.characterImage.src = characterPath;
                this.characterImage.alt = 'しす';
            } else {
                console.warn(`Character image not found: ${characterPath}, using placeholder`);
                this.characterImage.src = this.placeholderCharacter;
                this.characterImage.alt = 'しす（プレースホルダー）';
            }
        });
    }
    
    /**
     * キャラクターを表示する
     */
    showCharacter() {
        if (this.characterElement) {
            this.characterElement.style.display = 'flex';
        }
    }
    
    /**
     * キャラクターを非表示にする
     */
    hideCharacter() {
        if (this.characterElement) {
            this.characterElement.style.display = 'none';
        }
    }
    
    /**
     * 画像の存在を確認する
     * @param {string} imagePath - 画像のパス
     * @returns {Promise<boolean>} 画像が存在するかどうか
     */
    checkImageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
        });
    }
    
    /**
     * プレースホルダー背景を作成する
     * @returns {string} CSS gradient文字列
     */
    createPlaceholderBackground() {
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    /**
     * プレースホルダーキャラクター画像を作成する
     * @returns {string} Data URL
     */
    createPlaceholderCharacter() {
        // 簡単なSVGプレースホルダーを作成
        const svg = `
            <svg width="300" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="600" fill="#e0e0e0"/>
                <text x="150" y="300" font-size="24" text-anchor="middle" fill="#666">
                    しす
                </text>
                <text x="150" y="330" font-size="16" text-anchor="middle" fill="#999">
                    (画像未設定)
                </text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }
    
    /**
     * 新しい背景画像を登録する
     * @param {string} key - 背景のキー
     * @param {string} path - 画像のパス
     */
    registerBackground(key, path) {
        this.backgrounds[key] = path;
    }
    
    /**
     * 新しいキャラクター立ち絵を登録する
     * @param {string} key - キャラクターのキー
     * @param {string} path - 画像のパス
     */
    registerCharacter(key, path) {
        this.characters[key] = path;
    }
    
    /**
     * 現在の背景キーを取得する
     * @returns {string} 現在の背景キー
     */
    getCurrentBackground() {
        return this.currentBackground;
    }
    
    /**
     * 現在のキャラクターキーを取得する
     * @returns {string} 現在のキャラクターキー
     */
    getCurrentCharacter() {
        return this.currentCharacter;
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        // デフォルトの背景とキャラクターを設定
        this.setBackground('day', false);
        this.setCharacter('default', false);
        
        // CSSトランジションを追加
        if (this.backgroundElement) {
            this.backgroundElement.style.transition = 'opacity 0.3s ease-in-out';
        }
        if (this.characterElement) {
            this.characterElement.style.transition = 'opacity 0.3s ease-in-out';
        }
    }
}

export default VisualManager;
