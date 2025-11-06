// メインエントリーポイント
// 他のモジュールをインポートして初期化を行う

// モジュールのインポート
import { GameState } from './gameState.js';
import { EventSystem } from './eventSystem.js';
import UIController from './uiController.js';
import AudioManager from './audioManager.js';
// import { SaveSystem } from './saveSystem.js';

// グローバルゲーム状態（一時的）
let gameState = null;
let uiController = null;
let eventSystem = null;
let audioManager = null;

// 一時的な初期化処理（プロジェクト基盤確認用）
document.addEventListener('DOMContentLoaded', function () {
    console.log('ビジュアルノベルゲーム - プロジェクト基盤が正常に読み込まれました');

    // GameStateクラスの動作確認
    gameState = new GameState();
    console.log('GameState初期化完了:', gameState.getState());

    // AudioManagerクラスの動作確認
    audioManager = new AudioManager();
    console.log('AudioManager初期化完了');

    // UIControllerクラスの動作確認
    uiController = new UIController(audioManager);
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
    uiController.setOtherButtonListeners(
        () => {
            console.log('イベント継続');
            continueFromEvent();
        },
        () => {
            console.log('タイトルに戻る');
            returnToTitle();
        }
    );

    console.log('ゲームシステム初期化完了');
}

// 新規ゲーム開始
function startNewGame() {
    gameState = new GameState();

    // 効果音再生
    audioManager.playSFX('select');

    // 画面切り替えとBGM開始
    uiController.showScreen('main');
    audioManager.playBGM('normal');

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

        // イベント画面でテキストを表示
        uiController.showScreen('event');

        let textIndex = 0;
        const showNextText = () => {
            if (textIndex < event.text.length) {
                uiController.displayEventText(event.text[textIndex], () => {
                    textIndex++;
                    if (textIndex < event.text.length) {
                        // 次のテキストがある場合
                        uiController.showEventContinueButton();
                    } else {
                        // 全てのテキストを表示完了
                        // finishDay()はcontinueFromEvent()で呼ばれるので、ここでは呼ばない
                        console.log('イベントテキスト表示完了');
                    }
                });
            }
        };

        // イベント継続ボタンのリスナーを更新
        const eventContinueBtn = document.getElementById('event-continue-btn');
        if (eventContinueBtn) {
            eventContinueBtn.onclick = () => {
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

    // バッドエンド条件（連続10回何もしない）のチェック
    if (currentState.consecutive_none >= 10) {
        console.log('バッドエンド条件達成: 連続何もしない');
        showEnding('bad_end');
        return;
    }

    // 30日経過時のエンディング判定
    if (currentState.day >= 30) {
        console.log('30日経過 - エンディング判定開始');
        const endingType = gameState.checkEndingCondition();
        console.log('エンディング判定結果:', endingType);
        showEnding(endingType);
        return;
    }

    // ゲーム継続（30日未満）
    console.log('ゲーム継続');
    uiController.showScreen('main');
    audioManager.playBGM('normal');

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
    
    const endingTexts = {
        'perfect_end': '理想の共存を実現しました！しすとの関係も良好で、夢も叶えることができました。',
        'money_end': '夢を叶えることができました！目標金額を達成しましたが、しすとの関係はもう少し深められたかもしれません。',
        'affection_end': 'しすとの心のつながりを深めることができました！お金は目標に届きませんでしたが、大切なものを得られました。',
        'normal_end': '30日間お疲れ様でした。目標は達成できませんでしたが、それなりに充実した日々でした。',
        'bad_end': '何もしない日々が続きすぎました...もう少し積極的に行動すれば良かったかもしれません。'
    };

    // エンディングに応じたBGMを再生
    console.log('BGM再生開始 - エンディングタイトル:', endingTitle);
    audioManager.playEndingBGM(endingTitle);

    uiController.setEndingContent(endingTitle, endingTexts[endingType] || '');
    uiController.showScreen('ending');
    console.log('=== showEnding() 完了 ===');
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