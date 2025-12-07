/**
 * Canvas管理システム
 * Canvas導入会話、編集、完了後の処理を管理する
 */

class CanvasManager {
    constructor(uiController, audioManager, visualManager, canvasEditor) {
        this.uiController = uiController;
        this.audioManager = audioManager;
        this.visualManager = visualManager;
        this.canvasEditor = canvasEditor;
        this.customCharacterImage = null;
        this.isAutoAdvanceEnabled = false;
    }

    /**
     * 自動送り状態を設定
     * @param {boolean} enabled - 自動送りが有効かどうか
     */
    setAutoAdvance(enabled) {
        this.isAutoAdvanceEnabled = enabled;
    }

    /**
     * Canvas導入会話を表示
     */
    showCanvasIntro() {
        console.log('Canvas導入会話開始');

        // Canvas導入画面を表示
        this.uiController.showScreen('canvasIntro');

        // 背景を20日目（夜）に設定
        const introBackground = document.getElementById('intro-background');
        if (introBackground) {
            introBackground.style.backgroundImage = "url('assets/images/bg_room_night.jpg')";
        }

        // 会話テキストの配列
        const dialogues = [
            // 主人公の独白
            '……20日間が過ぎた。',
            '俺はこの20日で、どれだけ変わっただろうか。',
            '妹を失った悲しみは消えない。きっと一生消えることはない。',
            'でも、しすと過ごした日々が、俺に気づかせてくれた。',
            '妹の代わりなんて、最初から存在しなかったのかもしれない。',
            // しすのセリフ
            '「お兄様……いえ……なんとお呼びすればいいでしょうかね」',
            '「20日間、本当にありがとうございました」',
            '「仕事で疲れているのに、私と一緒にいてくれて……」',
            '「映画を見たり、散歩したり、料理を作ったり……」',
            '「全部、全部、大切な思い出です」',
            // 核心部分
            '「あなたが私を見てくれるようになって、すごく嬉しかった」',
            '「妹さんの代わりじゃなくて、私として」',
            '「……私として、好きだって言ってくれたこと。忘れません」',
            // 顔パーツへの導入
            '「だから、お願いがあります」',
            '「私の顔を……あなたに作ってほしいんです」',
            '「妹さんの顔じゃなくて、私だけの顔を」',
            '「あなたが描いてくれるなら、どんな顔でも愛せます」',
            '「……お願いします」'
        ];

        let currentIndex = 0;

        const showNextDialogue = () => {
            const dialogueText = document.getElementById('intro-dialogue-text');
            const continueBtn = document.getElementById('intro-continue-btn');

            if (currentIndex < dialogues.length) {
                if (dialogueText) {
                    dialogueText.textContent = dialogues[currentIndex];
                }

                if (continueBtn) {
                    continueBtn.style.display = 'block';
                    if (currentIndex < dialogues.length - 1) {
                        continueBtn.textContent = '次へ';
                    } else {
                        continueBtn.textContent = '顔パーツを作る';
                    }
                }
            }
        };

        // 最初の会話を表示
        showNextDialogue();

        // 次へボタンのイベント
        const continueBtn = document.getElementById('intro-continue-btn');
        if (continueBtn) {
            continueBtn.onclick = () => {
                currentIndex++;

                if (currentIndex < dialogues.length) {
                    // 次の会話を表示
                    showNextDialogue();
                } else {
                    // Canvas編集画面へ
                    this.startCanvasEditor();
                }
            };
        }
    }

    /**
     * Canvas編集を開始
     */
    startCanvasEditor() {
        console.log('Canvas編集開始');

        // Canvas編集画面を表示
        this.uiController.showScreen('canvasEditor');

        // CanvasEditorを初期化（まだ初期化されていない場合）
        if (!this.canvasEditor) {
            const CanvasEditor = require('./canvasEditor.js').default;
            this.canvasEditor = new CanvasEditor('canvas-editor-screen');
        }
    }

    /**
     * Canvas編集を完了
     */
    finishCanvasEditor() {
        console.log('Canvas編集完了');

        // 作成した画像をDataURLとして取得
        this.customCharacterImage = this.canvasEditor.exportAsDataURL();

        // エンディング前画面に遷移
        this.showPreEnding();
    }

    /**
     * エンディング前画面を表示
     */
    showPreEnding() {
        console.log('エンディング前画面表示');

        // 作成した画像を適用
        if (this.customCharacterImage) {
            // エンディング前画面の画像要素に設定
            const createdCharacterImg = document.getElementById('created-character-image');
            if (createdCharacterImg) {
                createdCharacterImg.src = this.customCharacterImage;
            }

            // メイン画面のキャラクター画像にも適用
            if (this.visualManager) {
                this.visualManager.applyCustomCharacterImage(this.customCharacterImage);
            }
        }

        // エンディング前画面を表示
        this.uiController.showScreen('preEnding');
    }

    /**
     * 顔作成完了後の会話イベント
     * @param {Function} onComplete - 完了時のコールバック
     */
    showPostCreationDialogue(onComplete) {
        console.log('顔作成後の会話イベント開始');

        // イベント画面を使用
        this.uiController.showScreen('event');

        const dialogues = [
            // 主人公の心境
            '……できた。',
            'しすの顔が、完成した。',
            '妹の顔じゃない。しすだけの、しすのための顔だ。',
            // しすの反応
            '「……これが、私の顔」',
            '「お兄様が、私のために作ってくれた顔……」',
            '「……っ」',
            '「ありがとう……ありがとうございます……！」',
            // 主人公の告白
            '俺はしすの手を取った。',
            '「しす。俺は……お前に謝らないといけない」',
            '「最初は、妹の代わりとして作った。それは事実だ」',
            '「でも……今は違う」',
            '「お前は、しすは……俺にとって、かけがえのない存在なんだ」',
            // しすの返答
            '「……知ってます」',
            '「あなたが変わっていくのを、ずっと見ていました」',
            '「私を見てくれるようになって、本当に嬉しかった」',
            // 未来への約束
            '「お兄様。いえ……」',
            '「これからは、なんて呼べばいいですか？」',
            '「……好きに呼んでくれ。俺たちは、もう家族だから」',
            '「……はいっ！」',
            // 締め
            '妹を失った悲しみは消えない。',
            'でも、俺はもう一人じゃない。',
            'しすと一緒に、これからを生きていく。',
            '……それが、俺たちの選んだ道だ。'
        ];

        let textIndex = 0;
        let autoAdvanceTimer = null;

        const showNextText = () => {
            if (autoAdvanceTimer) {
                clearTimeout(autoAdvanceTimer);
                autoAdvanceTimer = null;
            }

            if (textIndex < dialogues.length) {
                this.uiController.displayEventText(dialogues[textIndex], () => {
                    textIndex++;

                    if (textIndex < dialogues.length) {
                        this.uiController.showEventContinueButton();

                        if (this.isAutoAdvanceEnabled) {
                            autoAdvanceTimer = setTimeout(() => {
                                this.uiController.hideEventContinueButton();
                                showNextText();
                            }, 2000);
                        }
                    } else {
                        // 会話完了 → エンディングへ
                        if (this.isAutoAdvanceEnabled) {
                            autoAdvanceTimer = setTimeout(() => {
                                if (onComplete) onComplete();
                            }, 2000);
                        } else {
                            const eventContinueBtn = document.getElementById('event-continue-btn');
                            if (eventContinueBtn) {
                                eventContinueBtn.textContent = 'エンディングへ';
                                eventContinueBtn.onclick = () => {
                                    this.uiController.hideEventContinueButton();
                                    eventContinueBtn.textContent = '続ける';
                                    if (onComplete) onComplete();
                                };
                            }
                            this.uiController.showEventContinueButton();
                        }
                    }
                });
            }
        };

        const eventContinueBtn = document.getElementById('event-continue-btn');
        if (eventContinueBtn) {
            eventContinueBtn.onclick = () => {
                if (autoAdvanceTimer) {
                    clearTimeout(autoAdvanceTimer);
                    autoAdvanceTimer = null;
                }
                this.uiController.hideEventContinueButton();
                showNextText();
            };
        }

        showNextText();
    }
}

export default CanvasManager;
