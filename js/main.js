// メインエントリーポイント
// 他のモジュールをインポートして初期化を行う

// モジュールのインポート
import { GameState } from './gameState.js';
import { EventSystem } from './eventSystem.js';
import UIController from './uiController.js';
import AudioManager from './audioManager.js';
import VisualManager from './visualManager.js';
import CanvasEditor from './canvasEditor.js';
// import { SaveSystem } from './saveSystem.js';

// グローバルゲーム状態（一時的）
let gameState = null;
let uiController = null;
let eventSystem = null;
let audioManager = null;
let visualManager = null;
let canvasEditor = null;
let customCharacterImage = null;

// 自動送り状態
let isAutoAdvanceEnabled = false;

// 一時的な初期化処理（プロジェクト基盤確認用）
document.addEventListener('DOMContentLoaded', function () {
    console.log('ビジュアルノベルゲーム - プロジェクト基盤が正常に読み込まれました');

    // GameStateクラスの動作確認
    gameState = new GameState();
    console.log('GameState初期化完了:', gameState.getState());

    // AudioManagerクラスの動作確認
    audioManager = new AudioManager();
    console.log('AudioManager初期化完了');

    // VisualManagerクラスの動作確認
    visualManager = new VisualManager();
    visualManager.initialize();
    console.log('VisualManager初期化完了');

    // UIControllerクラスの動作確認
    uiController = new UIController(audioManager, visualManager);
    console.log('UIController初期化完了');

    // EventSystemクラスの動作確認
    eventSystem = new EventSystem();
    console.log('EventSystem初期化完了');

    // イベントデータの読み込み
    initializeEventSystem();

    // ステータスバーの初期表示
    uiController.updateStatusBar(gameState.getState());

    // 基本的なUI要素の存在確認
    const requiredElements = [
        'title-screen',
        'main-screen',
        'event-screen',
        'ending-screen',
        'status-bar',
        'dialogue-box',
        'action-buttons'
    ];

    let allElementsFound = true;
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`必要な要素が見つかりません: ${id}`);
            allElementsFound = false;
        }
    });

    if (allElementsFound) {
        console.log('すべての必要なUI要素が正常に配置されています');

        // ゲームシステムの初期化
        initializeGameSystem();
    }
});



// EventSystemの初期化
async function initializeEventSystem() {
    try {
        await eventSystem.loadEvents();
        console.log('イベントシステムの初期化が完了しました');
    } catch (error) {
        console.error('イベントシステムの初期化に失敗しました:', error);
    }
}

// ゲームシステムの初期化
function initializeGameSystem() {
    console.log('ゲームシステム初期化開始');

    // タイトル画面ボタンのイベントリスナー設定
    uiController.setTitleButtonListeners(
        () => {
            console.log('新規ゲーム開始');
            startNewGame();
        },
        () => {
            console.log('ゲーム継続');
            continueGame();
        }
    );

    // 行動ボタンのイベントリスナー設定
    uiController.setActionButtonListeners(
        () => handlePlayerAction('play'),
        () => handlePlayerAction('work'),
        () => handlePlayerAction('none')
    );

    // その他のボタンのイベントリスナー設定
    // 注意: イベント継続ボタンは各イベント内で個別に制御するため、ここではnullを渡す
    uiController.setOtherButtonListeners(
        null, // イベント継続ボタンは各イベント処理内で制御
        () => {
            console.log('タイトルに戻る');
            returnToTitle();
        }
    );

    // 説明画面のボタンのイベントリスナー設定
    uiController.setExplanationButtonListener(() => {
        console.log('ゲーム開始');
        // 初回プレイフラグを設定
        localStorage.setItem('sisuto_has_played', 'true');
        startGameFromExplanation();
    });

    // 説明画面スキップボタンのイベントリスナー設定
    uiController.setSkipExplanationButtonListener(() => {
        console.log('説明画面をスキップ');
        // 初回プレイフラグを設定
        localStorage.setItem('sisuto_has_played', 'true');
        startGameFromExplanation();
    });

    // Canvas編集完了ボタンのイベントリスナー設定
    uiController.setCanvasCompleteButtonListener(() => {
        console.log('Canvas編集完了');
        finishCanvasEditor();
    });

    // エンディング前画面の次へボタンのイベントリスナー設定
    uiController.setPreEndingButtonListener(() => {
        console.log('エンディング前画面から次へ');
        showFinalEnding();
    });

    // 自動送りボタンのイベントリスナー設定
    const autoAdvanceToggleBtn = document.getElementById('auto-advance-toggle-btn');
    if (autoAdvanceToggleBtn) {
        autoAdvanceToggleBtn.addEventListener('click', () => {
            isAutoAdvanceEnabled = !isAutoAdvanceEnabled;
            console.log(`自動送り: ${isAutoAdvanceEnabled ? 'ON' : 'OFF'}`);

            if (isAutoAdvanceEnabled) {
                uiController.showAutoAdvanceIndicator();
                audioManager.playSFX('select');
            } else {
                uiController.hideAutoAdvanceIndicator();
                audioManager.playSFX('click');
            }
        });
    }

    console.log('ゲームシステム初期化完了');
}

// 新規ゲーム開始
function startNewGame() {
    gameState = new GameState();

    // 効果音再生
    audioManager.playSFX('select');

    // 初回プレイ判定
    const hasPlayedBefore = localStorage.getItem('sisuto_has_played');

    if (hasPlayedBefore) {
        // 2回目以降は説明画面をスキップしてメインゲームへ
        console.log('既プレイ検出 - 説明画面をスキップ');
        audioManager.playBGM('normal');
        if (visualManager) {
            visualManager.setBackground('day', false);
        }
        startGameFromExplanation();
    } else {
        // 初回プレイ時のみ説明画面を表示
        console.log('初回プレイ - 説明画面を表示');
        uiController.showScreen('explanation');
        audioManager.playBGM('normal');
        if (visualManager) {
            visualManager.setBackground('day', false);
        }
    }
}

// 説明画面からゲームを開始
function startGameFromExplanation() {
    // メイン画面へ遷移
    uiController.showScreen('main');

    // ビジュアル要素の初期化
    if (visualManager) {
        visualManager.setCharacter('default', false);
        visualManager.showCharacter();
    }

    uiController.updateStatusBar(gameState.getState());

    uiController.displayDialogue('ゲームを開始します。今日は何をしますか？', () => {
        uiController.showActionButtons();
    });
}

// ゲーム継続
function continueGame() {
    // TODO: セーブデータの読み込み処理

    // 効果音再生
    audioManager.playSFX('select');

    // 画面切り替えとBGM開始
    uiController.showScreen('main');
    audioManager.playBGM('normal');

    // ビジュアル要素の復元
    if (visualManager) {
        visualManager.setBackgroundByDay(gameState.getState().day);
        visualManager.setCharacter('default', false);
        visualManager.showCharacter();
    }

    uiController.updateStatusBar(gameState.getState());

    uiController.displayDialogue('ゲームを再開します。', () => {
        uiController.showActionButtons();
    });
}

// プレイヤーの行動処理
function handlePlayerAction(actionType) {
    console.log(`${actionType}が選択されました`);

    // 効果音はUIControllerで既に再生されているので、ここでは不要

    // 行動ボタンを無効化
    uiController.hideActionButtons();

    // イベントを選択
    const event = eventSystem.pickEvent(actionType, gameState.getState().day);
    console.log('選択されたイベント:', event);

    if (event) {
        console.log('イベントが存在します - イベント処理開始');
        // イベント効果を計算
        const effects = eventSystem.calculateEventEffects(event);

        // ゲーム状態に行動を適用
        gameState.applyAction(actionType, effects);

        // イベントにキャラクター表情が指定されている場合は変更
        if (event.character && visualManager) {
            visualManager.setCharacter(event.character);
        }

        // イベント画面でテキストを表示
        uiController.showScreen('event');

        let textIndex = 0;
        let autoAdvanceTimer = null; // 自動送りタイマー

        const showNextText = () => {
            // 既存のタイマーをクリア
            if (autoAdvanceTimer) {
                clearTimeout(autoAdvanceTimer);
                autoAdvanceTimer = null;
            }

            if (textIndex < event.text.length) {
                console.log(`イベントテキスト表示: ${textIndex + 1}/${event.text.length}`);
                uiController.displayEventText(event.text[textIndex], () => {
                    console.log(`タイプライター完了: ${textIndex + 1}/${event.text.length}`);
                    textIndex++;
                    if (textIndex < event.text.length) {
                        // 次のテキストがある場合
                        uiController.showEventContinueButton();

                        // 自動送りONの場合のみ: 2秒後に自動的に次のテキストへ進む
                        if (isAutoAdvanceEnabled) {
                            console.log('自動送りタイマー設定: 2秒後に次のテキストへ');
                            autoAdvanceTimer = setTimeout(() => {
                                console.log('自動送り実行: 次のテキストへ進む');
                                showNextText();
                            }, 2000);
                        } else {
                            console.log('自動送りOFF: 手動で「続ける」ボタンをクリックしてください');
                        }
                    } else {
                        // 全てのテキストを表示完了
                        console.log('イベントテキスト表示完了');

                        // 自動送りONの場合: 2秒後に自動的に次の日へ進む
                        if (isAutoAdvanceEnabled) {
                            console.log('自動送りタイマー設定: 2秒後に次の日へ進む');
                            autoAdvanceTimer = setTimeout(() => {
                                console.log('自動送り実行: 次の日へ進む');
                                continueFromEvent();
                            }, 2000);
                        } else {
                            console.log('イベント完了 - 手動で画面をクリックして次の日へ進んでください');
                        }
                    }
                });
            }
        };

        // イベント継続ボタンのリスナーを更新
        const eventContinueBtn = document.getElementById('event-continue-btn');
        if (eventContinueBtn) {
            eventContinueBtn.onclick = () => {
                // ボタンクリックで手動進行した場合、自動送りタイマーをクリア
                if (autoAdvanceTimer) {
                    clearTimeout(autoAdvanceTimer);
                    autoAdvanceTimer = null;
                }
                uiController.hideEventContinueButton();
                showNextText();
            };
        }

        // 最初のテキストを表示
        showNextText();

    } else {
        console.log('イベントが存在しません - フォールバック処理');
        // イベントがない場合のフォールバック
        gameState.applyAction(actionType);

        const messages = {
            'play': 'しすと楽しく遊びました！',
            'work': 'お疲れ様でした！お金を稼ぎました。',
            'none': '今日は何もしませんでした...'
        };

        uiController.displayDialogue(messages[actionType] || '何かが起こりました。', () => {
            finishDay();
        });
    }
}

// 1日を終了する処理
function finishDay() {
    // 日数を進める
    gameState.incrementDay();

    // ステータスバーを更新
    uiController.updateStatusBar(gameState.getState());

    // 現在のゲーム状態を取得
    const currentState = gameState.getState();
    console.log('finishDay - 現在のゲーム状態:', currentState);

    // 日数に応じて背景を変更
    if (visualManager) {
        visualManager.setBackgroundByDay(currentState.day);
    }

    // バッドエンド条件（連続10回何もしない）のチェック
    if (currentState.consecutive_none >= 10) {
        console.log('バッドエンド条件達成: 連続何もしない');
        showEnding('bad_end');
        return;
    }

    // 最大日数経過時のエンディング判定
    if (currentState.day >= currentState.config.max_days) {
        console.log(`${currentState.config.max_days}日経過 - エンディング判定開始`);
        const endingType = gameState.checkEndingCondition();
        console.log('エンディング判定結果:', endingType);
        showEnding(endingType);
        return;
    }

    // ゲーム継続
    console.log('ゲーム継続');
    uiController.showScreen('main');
    audioManager.playBGM('normal');

    // キャラクターをデフォルトに戻す
    if (visualManager) {
        visualManager.setCharacter('default');
    }

    const dayMessage = `${currentState.day}日目の朝です。今日は何をしますか？`;
    uiController.displayDialogue(dayMessage, () => {
        uiController.showActionButtons();
    });
}

// イベントから継続
function continueFromEvent() {
    finishDay();
}

// エンディング表示
function showEnding(endingType) {
    console.log('=== showEnding() 呼び出し ===');
    console.log('エンディングタイプ:', endingType);
    console.log('現在のゲーム状態:', gameState ? gameState.getState() : 'gameState is null');

    const endingTitle = gameState.getEndingName(endingType);
    console.log('エンディングタイトル:', endingTitle);

    // perfect_endの場合、Canvas導入会話を表示
    if (endingType === 'perfect_end') {
        console.log('理想の共存エンド - Canvas導入会話を表示');
        showCanvasIntro();
        return;
    }

    // その他のエンディング
    const endingTexts = {
        'perfect_end': '理想の共存を実現しました！しすとの関係も良好で、夢も叶えることができました。',
        'money_end': '夢を叶えることができました！目標金額を達成しましたが、しすとの関係はもう少し深められたかもしれません。',
        'affection_end': 'しすとの心のつながりを深めることができました！お金は目標に届きませんでしたが、大切なものを得られました。',
        'normal_end': '20日間お疲れ様でした。目標は達成できませんでしたが、それなりに充実した日々でした。',
        'bad_end': '何もしない日々が続きすぎました...もう少し積極的に行動すれば良かったかもしれません。'
    };

    // エンディングに応じたBGMを再生
    console.log('BGM再生開始 - エンディングタイトル:', endingTitle);
    audioManager.playEndingBGM(endingTitle);

    // エンディング背景をクリア（通常エンディングはグラデーション背景）
    clearEndingBackground();

    uiController.setEndingContent(endingTitle, endingTexts[endingType] || '');
    uiController.showScreen('ending');
    console.log('=== showEnding() 完了 ===');
}

// エンディング背景を設定
function setEndingBackground(imagePath) {
    const endingScreen = document.getElementById('ending-screen');
    const endingBackground = document.getElementById('ending-background');

    if (endingScreen && endingBackground) {
        endingScreen.classList.add('with-background');
        endingBackground.style.backgroundImage = `url('${imagePath}')`;
        console.log('エンディング背景を設定:', imagePath);
    }
}

// エンディング背景をクリア
function clearEndingBackground() {
    const endingScreen = document.getElementById('ending-screen');
    const endingBackground = document.getElementById('ending-background');

    if (endingScreen && endingBackground) {
        endingScreen.classList.remove('with-background');
        endingBackground.style.backgroundImage = '';
        console.log('エンディング背景をクリア');
    }
}

// Canvas導入会話を表示
function showCanvasIntro() {
    console.log('Canvas導入会話開始');

    // Canvas導入画面を表示
    uiController.showScreen('canvasIntro');

    // 背景を30日目（夜）に設定
    const introBackground = document.getElementById('intro-background');
    if (introBackground) {
        introBackground.style.backgroundImage = "url('assets/images/bg_room_night.jpg')";
    }

    // 会話テキストの配列
    const dialogues = [
        'マスター、本当にありがとうございます...！',
        '20日間、わたしのために頑張ってくれて...仕事も、頑張ってくれましたね',
        'わたしと遊んでくれる時間も作ってくれて、すごく嬉しかったです。',
        '毎日、あなたが仕事で疲れているのを見て...それでもわたしのために時間を使ってくれて...',
        'わたし、本当に幸せでした。',
        'そして今日、ついに...わたしの顔パーツを作る準備が整いましたね！',
        'あなたが貯めてくれたお金で、材料も全部揃えられました。',
        'でも...最後の仕上げは、あなたにお願いしたいんです。',
        'わたしの顔、あなたに作ってほしいんです。',
        'あなたが描いてくれる顔なら、きっと世界で一番素敵な顔になると思うから...！',
        'お願いします。わたしの顔、作ってください！'
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
                startCanvasEditor();
            }
        };
    }
}

// Canvas編集を開始
function startCanvasEditor() {
    console.log('Canvas編集開始');

    // Canvas編集画面を表示
    uiController.showScreen('canvasEditor');

    // CanvasEditorを初期化（ベース画像なし、まっさらな状態）
    if (!canvasEditor) {
        canvasEditor = new CanvasEditor('canvas-editor-screen');
    }
}

// Canvas編集を完了
function finishCanvasEditor() {
    console.log('Canvas編集完了');

    // 作成した画像をDataURLとして取得
    customCharacterImage = canvasEditor.exportAsDataURL();

    // エンディング前画面に遷移
    showPreEnding();
}

// エンディング前画面を表示
function showPreEnding() {
    console.log('エンディング前画面表示');

    // 作成した画像を適用
    if (customCharacterImage) {
        // エンディング前画面の画像要素に設定
        const createdCharacterImg = document.getElementById('created-character-image');
        if (createdCharacterImg) {
            createdCharacterImg.src = customCharacterImage;
        }

        // メイン画面のキャラクター画像にも適用
        if (visualManager) {
            visualManager.applyCustomCharacterImage(customCharacterImage);
        }
    }

    // エンディング前画面を表示
    uiController.showScreen('preEnding');
}

// エンディング前画面からエンディング画面へ遷移
function showFinalEnding() {
    console.log('最終エンディング画面へ遷移');

    const endingTitle = '理想の共存エンド';
    const endingText = '理想の共存を実現しました！しすとの関係も良好で、夢も叶えることができました。';

    // エンディングBGMを再生
    audioManager.playEndingBGM(endingTitle);

    // perfect_endの背景画像を設定
    setEndingBackground('assets/images/ending.jpg');

    uiController.setEndingContent(endingTitle, endingText);
    uiController.showScreen('ending');
    console.log('=== エンディング画面表示完了 ===');
}

// タイトルに戻る
function returnToTitle() {
    // 効果音再生
    audioManager.playSFX('select');

    // 画面切り替え（BGM停止は自動処理される）
    uiController.showScreen('title');

    // ゲーム状態をリセット（オプション）
    gameState = new GameState();
    uiController.updateStatusBar(gameState.getState());
}