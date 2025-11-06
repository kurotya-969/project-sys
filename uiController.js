/**
 * UI制御システム
 * 4つの画面（タイトル、メイン、イベント、エンディング）の表示制御
 * ステータスバーの表示と更新機能
 * 行動ボタンとインタラクション機能
 * タイプライター効果とテキスト表示
 */

class UIController {
    constructor(audioManager = null) {
        this.currentScreen = 'title';
        this.typewriterSpeed = 50; // ミリ秒
        this.isTypewriting = false;
        this.typewriterCallback = null;
        this.audioManager = audioManager;
        
        // DOM要素の参照を取得
        this.screens = {
            title: document.getElementById('title-screen'),
            main: document.getElementById('main-screen'),
            event: document.getElementById('event-screen'),
            ending: document.getElementById('ending-screen')
        };
        
        // ステータスバー要素
        this.statusElements = {
            day: document.getElementById('day-display'),
            affection: document.getElementById('affection-display'),
            money: document.getElementById('money-display')
        };
        
        // ボタン要素
        this.buttons = {
            newGame: document.getElementById('new-game-btn'),
            continue: document.getElementById('continue-btn'),
            play: document.getElementById('play-btn'),
            work: document.getElementById('work-btn'),
            none: document.getElementById('none-btn'),
            eventContinue: document.getElementById('event-continue-btn'),
            endingReturn: document.getElementById('ending-return-btn')
        };
        
        // テキスト表示要素
        this.textElements = {
            dialogue: document.getElementById('dialogue-text'),
            dialogueContinue: document.getElementById('dialogue-continue'),
            eventText: document.getElementById('event-text'),
            endingTitle: document.getElementById('ending-title'),
            endingText: document.getElementById('ending-text')
        };
        
        // 行動ボタンコンテナ
        this.actionButtonsContainer = document.getElementById('action-buttons');
        
        this.initializeEventListeners();
    }
    
    /**
     * イベントリスナーの初期化
     */
    initializeEventListeners() {
        // ダイアログボックスクリックで次へ進む
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) {
            dialogueBox.addEventListener('click', () => {
                if (this.isTypewriting) {
                    // タイプライター効果中の場合は即座に完了
                    this.completeTypewriter();
                } else if (this.typewriterCallback) {
                    // テキスト表示完了後のコールバック実行
                    const callback = this.typewriterCallback;
                    this.typewriterCallback = null;
                    this.hideDialogueContinue();
                    callback();
                }
            });
        }
    }
    
    /**
     * 画面を表示する
     * @param {string} screenName - 表示する画面名（title, main, event, ending）
     */
    showScreen(screenName) {
        // 現在の画面を非表示
        if (this.screens[this.currentScreen]) {
            this.screens[this.currentScreen].classList.remove('active');
        }
        
        // 新しい画面を表示
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
            
            // AudioManagerに画面遷移を通知（ただしmain画面以外）
            if (this.audioManager && screenName !== 'main') {
                this.audioManager.handleScreenTransition(screenName);
            }
            
            // 画面切り替え時のフェードイン効果
            this.screens[screenName].classList.add('fade-in');
            setTimeout(() => {
                this.screens[screenName].classList.remove('fade-in');
            }, 500);
        } else {
            console.error(`Unknown screen: ${screenName}`);
        }
    }
    
    /**
     * ステータスバーを更新する
     * @param {Object} gameState - ゲーム状態オブジェクト
     */
    updateStatusBar(gameState) {
        if (this.statusElements.day) {
            this.statusElements.day.textContent = gameState.day;
        }
        if (this.statusElements.affection) {
            this.statusElements.affection.textContent = gameState.affection;
        }
        if (this.statusElements.money) {
            this.statusElements.money.textContent = gameState.money.toLocaleString();
        }
    }
    
    /**
     * 行動ボタンを表示する
     */
    showActionButtons() {
        if (this.actionButtonsContainer) {
            this.actionButtonsContainer.style.display = 'flex';
        }
        
        // 各ボタンを有効化
        Object.values(this.buttons).forEach(button => {
            if (button && (button.id === 'play-btn' || button.id === 'work-btn' || button.id === 'none-btn')) {
                button.disabled = false;
            }
        });
    }
    
    /**
     * 行動ボタンを非表示にする
     */
    hideActionButtons() {
        if (this.actionButtonsContainer) {
            this.actionButtonsContainer.style.display = 'none';
        }
    }
    
    /**
     * 行動ボタンを無効化する
     */
    disableActionButtons() {
        Object.values(this.buttons).forEach(button => {
            if (button && (button.id === 'play-btn' || button.id === 'work-btn' || button.id === 'none-btn')) {
                button.disabled = true;
            }
        });
    }
    
    /**
     * ダイアログテキストを表示する（タイプライター効果付き）
     * @param {string} text - 表示するテキスト
     * @param {Function} callback - テキスト表示完了後のコールバック関数
     */
    displayDialogue(text, callback = null) {
        if (!this.textElements.dialogue) {
            console.error('Dialogue element not found');
            return;
        }
        
        this.typewriterCallback = callback;
        this.typewriterEffect(this.textElements.dialogue, text, this.typewriterSpeed, () => {
            if (callback) {
                this.showDialogueContinue();
            }
        });
    }
    
    /**
     * イベントテキストを表示する（タイプライター効果付き）
     * @param {string} text - 表示するテキスト
     * @param {Function} callback - テキスト表示完了後のコールバック関数
     */
    displayEventText(text, callback = null) {
        if (!this.textElements.eventText) {
            console.error('Event text element not found');
            return;
        }
        
        this.typewriterEffect(this.textElements.eventText, text, this.typewriterSpeed, () => {
            if (callback) {
                this.showEventContinueButton();
            }
        });
    }
    
    /**
     * タイプライター効果でテキストを表示する
     * @param {HTMLElement} element - テキストを表示する要素
     * @param {string} text - 表示するテキスト
     * @param {number} speed - 表示速度（ミリ秒）
     * @param {Function} callback - 完了時のコールバック関数
     */
    typewriterEffect(element, text, speed, callback = null) {
        if (!element) return;
        
        this.isTypewriting = true;
        element.textContent = '';
        
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(typeInterval);
                this.isTypewriting = false;
                if (callback) {
                    callback();
                }
            }
        }, speed);
        
        // タイプライター効果を途中で完了させるための参照を保存
        this.currentTypeInterval = typeInterval;
        this.currentTypeText = text;
        this.currentTypeElement = element;
    }
    
    /**
     * タイプライター効果を即座に完了させる
     */
    completeTypewriter() {
        if (this.isTypewriting && this.currentTypeInterval) {
            clearInterval(this.currentTypeInterval);
            this.currentTypeElement.textContent = this.currentTypeText;
            this.isTypewriting = false;
            
            // コールバックがある場合は実行
            if (this.typewriterCallback) {
                this.showDialogueContinue();
            }
        }
    }
    
    /**
     * ダイアログ継続表示を表示する
     */
    showDialogueContinue() {
        if (this.textElements.dialogueContinue) {
            this.textElements.dialogueContinue.style.display = 'block';
        }
    }
    
    /**
     * ダイアログ継続表示を非表示にする
     */
    hideDialogueContinue() {
        if (this.textElements.dialogueContinue) {
            this.textElements.dialogueContinue.style.display = 'none';
        }
    }
    
    /**
     * イベント継続ボタンを表示する
     */
    showEventContinueButton() {
        if (this.buttons.eventContinue) {
            this.buttons.eventContinue.style.display = 'block';
        }
    }
    
    /**
     * イベント継続ボタンを非表示にする
     */
    hideEventContinueButton() {
        if (this.buttons.eventContinue) {
            this.buttons.eventContinue.style.display = 'none';
        }
    }
    
    /**
     * 継続ボタンの表示状態を設定する
     * @param {boolean} show - 表示するかどうか
     */
    setContinueButtonVisibility(show) {
        if (this.buttons.continue) {
            this.buttons.continue.style.display = show ? 'block' : 'none';
        }
    }
    
    /**
     * エンディング画面を設定する
     * @param {string} title - エンディングタイトル
     * @param {string} text - エンディングテキスト
     */
    setEndingContent(title, text) {
        if (this.textElements.endingTitle) {
            this.textElements.endingTitle.textContent = title;
        }
        if (this.textElements.endingText) {
            this.textElements.endingText.textContent = text;
        }
    }
    
    /**
     * 行動ボタンにイベントリスナーを設定する
     * @param {Function} playCallback - 遊ぶボタンのコールバック
     * @param {Function} workCallback - 仕事ボタンのコールバック
     * @param {Function} noneCallback - 何もしないボタンのコールバック
     */
    setActionButtonListeners(playCallback, workCallback, noneCallback) {
        if (this.buttons.play) {
            this.buttons.play.addEventListener('click', () => {
                if (this.audioManager) {
                    this.audioManager.playSFX('click');
                }
                this.disableActionButtons();
                playCallback();
            });
        }
        
        if (this.buttons.work) {
            this.buttons.work.addEventListener('click', () => {
                if (this.audioManager) {
                    this.audioManager.playSFX('click');
                }
                this.disableActionButtons();
                workCallback();
            });
        }
        
        if (this.buttons.none) {
            this.buttons.none.addEventListener('click', () => {
                if (this.audioManager) {
                    this.audioManager.playSFX('click');
                }
                this.disableActionButtons();
                noneCallback();
            });
        }
    }
    
    /**
     * タイトル画面ボタンにイベントリスナーを設定する
     * @param {Function} newGameCallback - 新規ゲームのコールバック
     * @param {Function} continueCallback - 継続ゲームのコールバック
     */
    setTitleButtonListeners(newGameCallback, continueCallback) {
        if (this.buttons.newGame) {
            this.buttons.newGame.addEventListener('click', () => {
                if (this.audioManager) {
                    this.audioManager.playSFX('select');
                }
                newGameCallback();
            });
        }
        
        if (this.buttons.continue) {
            this.buttons.continue.addEventListener('click', () => {
                if (this.audioManager) {
                    this.audioManager.playSFX('select');
                }
                continueCallback();
            });
        }
    }
    
    /**
     * その他のボタンにイベントリスナーを設定する
     * @param {Function} eventContinueCallback - イベント継続のコールバック
     * @param {Function} endingReturnCallback - エンディング終了のコールバック
     */
    setOtherButtonListeners(eventContinueCallback, endingReturnCallback) {
        if (this.buttons.eventContinue) {
            this.buttons.eventContinue.addEventListener('click', () => {
                if (this.audioManager) {
                    this.audioManager.playSFX('click');
                }
                this.hideEventContinueButton();
                eventContinueCallback();
            });
        }
        
        if (this.buttons.endingReturn) {
            this.buttons.endingReturn.addEventListener('click', () => {
                if (this.audioManager) {
                    this.audioManager.playSFX('select');
                }
                endingReturnCallback();
            });
        }
    }
    
    /**
     * 現在の画面名を取得する
     * @returns {string} 現在の画面名
     */
    getCurrentScreen() {
        return this.currentScreen;
    }
    
    /**
     * タイプライター速度を設定する
     * @param {number} speed - 速度（ミリ秒）
     */
    setTypewriterSpeed(speed) {
        this.typewriterSpeed = speed;
    }
}

export default UIController;