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

        // プロローグ初期化（最初のテキストを表示）
        initializePrologue();
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

    // プロローグボタンのイベントリスナー設定
    if (uiController.buttons.prologuePart1Next) {
        uiController.buttons.prologuePart1Next.addEventListener('click', () => {
            console.log('プロローグ前半 - 次のテキストへ');
            audioManager.playSFX('select');
            showNextProloguePart1Text();
        });
    }

    if (uiController.buttons.prologuePart2Next) {
        uiController.buttons.prologuePart2Next.addEventListener('click', () => {
            console.log('プロローグ後半 - 次のテキストへ');
            audioManager.playSFX('select');
            showNextProloguePart2Text();
        });
    }

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
        console.log('エンディング前画面から会話イベントへ');
        showPostCreationDialogue();
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

    // イベントを選択（順次選択方式）
    const currentState = gameState.getState();
    const { event, nextIndex } = eventSystem.pickEvent(actionType, currentState.day, currentState);
    console.log('選択されたイベント:', event);

    // インデックスを更新（play/workの場合）
    if (actionType === 'play') {
        gameState.playEventIndex = nextIndex;
    } else if (actionType === 'work') {
        gameState.workEventIndex = nextIndex;
    }

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

        // イベントテキスト表示後のコールバック（ターニングイベントチェック含む）
        const onEventComplete = () => {
            // ターニングポイントイベントをチェック
            const turningEvent = eventSystem.getTurningPointEvent(gameState.getState());
            if (turningEvent) {
                // ターニングポイントイベントを表示
                showTurningPointEvent(turningEvent);
            } else {
                // 通常通り次の日へ
                continueFromEvent();
            }
        };

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

                    // テキストインデックスをインクリメント
                    textIndex++;

                    if (textIndex < event.text.length) {
                        // 次のテキストがある場合、ボタンを表示
                        uiController.showEventContinueButton();

                        // 自動送りONの場合のみ: 2秒後に自動的に次のテキストへ進む
                        if (isAutoAdvanceEnabled) {
                            console.log('自動送りタイマー設定: 2秒後に次のテキストへ');
                            autoAdvanceTimer = setTimeout(() => {
                                console.log('自動送り実行: 次のテキストへ進む');
                                uiController.hideEventContinueButton();
                                showNextText();
                            }, 2000);
                        } else {
                            console.log('自動送りOFF: 手動で「続ける」ボタンをクリックしてください');
                        }
                    } else {
                        // 全てのテキストを表示完了
                        console.log('イベントテキスト表示完了');

                        // 自動送りONの場合: 2秒後に自動的に次へ進む
                        if (isAutoAdvanceEnabled) {
                            console.log('自動送りタイマー設定: 2秒後に次へ進む');
                            autoAdvanceTimer = setTimeout(() => {
                                console.log('自動送り実行: 次へ進む');
                                onEventComplete();
                            }, 2000);
                        } else {
                            console.log('イベント完了 - 手動で「次へ」ボタンをクリックしてください');
                            // ボタンのテキストを「次へ」に変更して表示
                            if (eventContinueBtn) {
                                eventContinueBtn.textContent = '次へ';
                                eventContinueBtn.onclick = () => {
                                    uiController.hideEventContinueButton();
                                    // テキストを元に戻す
                                    eventContinueBtn.textContent = '続ける';
                                    onEventComplete();
                                };
                            }
                            uiController.showEventContinueButton();
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
                // ボタンを非表示にしてから次のテキストを表示
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

// ターニングポイントイベントを表示
function showTurningPointEvent(turningEvent) {
    console.log('ターニングポイントイベント表示:', turningEvent.id);

    // フラグを更新
    gameState.turningPointsShown[turningEvent.trigger] = true;

    let textIndex = 0;
    let autoAdvanceTimer = null;

    const showNextText = () => {
        if (autoAdvanceTimer) {
            clearTimeout(autoAdvanceTimer);
            autoAdvanceTimer = null;
        }

        if (textIndex < turningEvent.text.length) {
            uiController.displayEventText(turningEvent.text[textIndex], () => {
                textIndex++;

                if (textIndex < turningEvent.text.length) {
                    uiController.showEventContinueButton();

                    if (isAutoAdvanceEnabled) {
                        autoAdvanceTimer = setTimeout(() => {
                            uiController.hideEventContinueButton();
                            showNextText();
                        }, 2000);
                    }
                } else {
                    // ターニングイベント完了
                    if (isAutoAdvanceEnabled) {
                        autoAdvanceTimer = setTimeout(() => {
                            continueFromEvent();
                        }, 2000);
                    } else {
                        const eventContinueBtn = document.getElementById('event-continue-btn');
                        if (eventContinueBtn) {
                            eventContinueBtn.textContent = '次の日へ';
                            eventContinueBtn.onclick = () => {
                                uiController.hideEventContinueButton();
                                eventContinueBtn.textContent = '続ける';
                                continueFromEvent();
                            };
                        }
                        uiController.showEventContinueButton();
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
            uiController.hideEventContinueButton();
            showNextText();
        };
    }

    showNextText();
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
        console.log('バッドエンド条件達成: 連続何もしない - 専用イベント開始');
        showNothingEndingEvent();
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

    // normal_endの場合、専用イベントを表示
    if (endingType === 'normal_end') {
        console.log('通常失敗エンド - 専用イベントを表示');
        showNormalEndingEvent();
        return;
    }

    // affection_end（心でつながるエンド）の場合、専用イベントを表示
    if (endingType === 'affection_end') {
        console.log('心でつながるエンド - 専用イベントを表示');
        showAffectionEndingEvent();
        return;
    }

    // money_end（夢を叶えるエンド）の場合、専用イベントを表示
    if (endingType === 'money_end') {
        console.log('夢を叶えるエンド - 専用イベントを表示');
        showMoneyEndingEvent();
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

// 通常エンディング（失敗）のイベント表示
function showNormalEndingEvent() {
    console.log('通常エンディングイベント開始');

    // エンディング背景を設定
    setEndingBackground('assets/images/normal.jpg');

    // BGM再生
    audioManager.playBGM('yoisyo', true);

    // イベント画面を使用
    uiController.showScreen('event');

    const dialogues = [
        // オープニング（絶望） - 5セグメント
        '……何も残らなかった。',
        'お金も、しすとの思い出も、自信を持って言えるものは何もない。',
        '俺は一体、この20日間何をしていたんだろうか……。',
        '深いため息が出る。部屋の隅で、しすが静かに俺を見ている。',
        '妹の代わりとして作ったこの子に、何も与えてやれなかった。',
        '思えば、俺は妹にも何もしてやれなかった。',
        'また、同じ事を繰り返しているのだろうか。',

        // しすの介入 - 4セグメント
        '「……あの、お兄様」',
        'しすが心配そうに俺の顔を覗き込んでいる。',
        '「そんなに落ち込まないでください」',
        '「わたし……お兄様が苦しんでいるのを見るのが、一番つらいんです」',

        // 励まし - 4セグメント
        '「動けない中でも、わたしとお兄様自身のためによくがんばってくれたじゃないですか」',
        '「一緒に過ごした時間、わたしは全部覚えています」',
        '「お兄様が笑ってくれた時、わたしも嬉しかった」',
        '「それだけで、わたしは十分幸せでした」',

        // 提案 - 3セグメント
        '「パーツの事も、わたしたちの関係性も……妹さんとの事も」',
        '「今決める必要はないですよ」',
        '「ずっと、死ぬまで背負って行きましょう。一緒に」',
        'その『一緒に』は胸にずしりと来るほど重くて、でも、だからこそ……',

        // 感情的クライマックス - 5セグメント
        'しすの言葉が、染み入るように胸に響く。',
        '情けなくて、申し訳なくて……でも、少しだけ救われた気がして。',
        '頬を伝う涙が情けなくて、顔を背ける。',
        'だが、しすは優しく俺を抱きしめた。',
        '冷たいはずの機械のアームから、不思議と温かさを感じる。',
        '「……ありがとう、しす」',

        // 解決 - 3セグメント
        '「これからも、わたしはお兄様のそばにいます」',
        '「完璧じゃなくても、いいんです。わたしたちは、わたしたちのままで」',
        '……そうだな。完璧じゃない、すっきりしない日常。でも、それが俺たちの現実だ。',
        '「ありがとう」',
        '前を向く。背負う決意をする。',
        'だって俺は、お兄ちゃんで家族だから。'
    ];

    let textIndex = 0;
    let autoAdvanceTimer = null;

    const showNextText = () => {
        if (autoAdvanceTimer) {
            clearTimeout(autoAdvanceTimer);
            autoAdvanceTimer = null;
        }

        if (textIndex < dialogues.length) {
            uiController.displayEventText(dialogues[textIndex], () => {
                textIndex++;

                if (textIndex < dialogues.length) {
                    // 次のテキストがある場合、ボタンを表示
                    uiController.showEventContinueButton();

                    if (isAutoAdvanceEnabled) {
                        autoAdvanceTimer = setTimeout(() => {
                            uiController.hideEventContinueButton();
                            showNextText();
                        }, 2000);
                    }
                } else {
                    // 全てのテキストを表示完了
                    if (isAutoAdvanceEnabled) {
                        // 自動送りON: 2秒後に自動的にエンディング画面へ
                        autoAdvanceTimer = setTimeout(() => {
                            showFinalNormalEndingAndTitle();
                        }, 2000);
                    } else {
                        // 自動送りOFF: 手動で「次へ」ボタンをクリックしてもらう
                        const eventContinueBtn = document.getElementById('event-continue-btn');
                        if (eventContinueBtn) {
                            eventContinueBtn.textContent = '次へ';
                            eventContinueBtn.onclick = () => {
                                uiController.hideEventContinueButton();
                                eventContinueBtn.textContent = '続ける';
                                showFinalNormalEndingAndTitle();
                            };
                        }
                        uiController.showEventContinueButton();
                    }
                }
            });
        }
    };

    // イベント継続ボタンのリスナーを設定
    const eventContinueBtn = document.getElementById('event-continue-btn');
    if (eventContinueBtn) {
        eventContinueBtn.onclick = () => {
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
}

// 通常エンディングの最終画面表示
function showFinalNormalEndingAndTitle() {
    // エンディング画面へ遷移
    const endingTitle = '通常失敗エンド';
    const endingText = '20日間お疲れ様でした。目標は達成できませんでしたが、しすとの日々は続きます。';

    uiController.setEndingContent(endingTitle, endingText);
    uiController.showScreen('ending');

    // タイトルに戻るボタンのイベントリスナーを設定
    const returnBtn = document.getElementById('ending-return-btn');
    if (returnBtn) {
        returnBtn.onclick = () => {
            audioManager.playSFX('select');
            returnToTitle();
        };
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

    // 会話テキストの配列（主人公視点の独白 → しすのセリフ）
    const dialogues = [
        // 主人公の独白
        '……20日間が過ぎた。',
        '俺はこの20日で、どれだけ変わっただろうか。',
        '妹を失った悲しみは消えない。きっと一生消えることはない。',
        'でも、しすと過ごした日々が、俺に気づかせてくれた。',
        '妹の代わりなんて、最初から存在しなかったのかもしれない。',
        // しすのセリフ
        '「お兄様……いえ……なんとお呼びすればいいでしょうか」',
        '「ずっと、本当にありがとうございました」',
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

// 顔作成完了後の会話イベント
function showPostCreationDialogue() {
    console.log('顔作成後の会話イベント開始');

    // イベント画面を使用
    uiController.showScreen('event');

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
        'しすが、俺の手を握る。',
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
            uiController.displayEventText(dialogues[textIndex], () => {
                textIndex++;

                if (textIndex < dialogues.length) {
                    uiController.showEventContinueButton();

                    if (isAutoAdvanceEnabled) {
                        autoAdvanceTimer = setTimeout(() => {
                            uiController.hideEventContinueButton();
                            showNextText();
                        }, 2000);
                    }
                } else {
                    // 会話完了 → エンディングへ
                    if (isAutoAdvanceEnabled) {
                        autoAdvanceTimer = setTimeout(() => {
                            showFinalEnding();
                        }, 2000);
                    } else {
                        const eventContinueBtn = document.getElementById('event-continue-btn');
                        if (eventContinueBtn) {
                            eventContinueBtn.textContent = 'エンディングへ';
                            eventContinueBtn.onclick = () => {
                                uiController.hideEventContinueButton();
                                eventContinueBtn.textContent = '続ける';
                                showFinalEnding();
                            };
                        }
                        uiController.showEventContinueButton();
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
            uiController.hideEventContinueButton();
            showNextText();
        };
    }

    showNextText();
}

// エンディング前画面からエンディング画面へ遷移
function showFinalEnding() {
    console.log('最終エンディング画面へ遷移');

    const endingTitle = '理想の共存エンド';
    const endingText = 'ずっと、一緒にいてくださいね。あなたの家族より。';

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

// ================== プロローグシステム ==================

// プロローグテキストデータ
const prologueData = {
    part1: [
        "妹は俺のせいで死んだ。",
        "起床する。朝日が俺にはまぶしすぎる。ここには俺の場所はないのだと感じながら、パンを口にする。",
        "俺にはもう何も残っていない。",
        "いなくなった妹の写真の埃を取る。水を写真のある棚に置く。",
        "いつもと変わらない日常。",
        "俺が死ねばよかったのに。",
        "俺には何もない。持っていていいはずもない。",
        "「おはようございます、お兄様」",
        "俺が作ってしまった、この妹によく似たアンドロイド以外には"
    ],
    part2: [
        "「ああ、おはよう、しす」",
        "「今日もお仕事ですか？それとも、わたしと出かけてくれますか？」",
        "「そうだね、きょうは一緒にピクニックに行こうか」",
        "「やった～！お兄様大好き！」",
        "声帯は妹と電話した時の録音を基にして作った。",
        "性格は、彼女が元気だったころを思い出しながら設定した。",
        "でも、この子は妹じゃない。似てるようにしただけだ。俺はクズだ。",
        "だから、顔パーツまでは作れずにいた。罪から目をそらすために",
        "「お兄様、そういえば。わたしのお顔はいついただけるんですか？」",
        "「……そのうちね」",
        "嬉しそうなしすを見ると、苦しくなる。俺は妹の幻影にすがっている。でも、この子に罪はない",
        "いつか、俺も罰を受ける日が来る。",
        "「お兄様、おにぎり持っていきましょう！」",
        "「ああ、お茶も用意するよ」",
        "だから、その日までは……そばにいさせてくれ。"
    ]
};

// プロローグ前半のテキストインデックス
let prologuePart1Index = 0;

// プロローグ前半のテキストを表示
function showNextProloguePart1Text() {
    if (prologuePart1Index < prologueData.part1.length) {
        const textElement = document.querySelector('.prologue-text');
        if (textElement) {
            textElement.textContent = prologueData.part1[prologuePart1Index];
            prologuePart1Index++;
        }
    } else {
        // 全テキスト表示完了 → 後半プロローグへ
        console.log('プロローグ前半完了 → 後半へ遷移');
        prologuePart1Index = 0; // リセット
        uiController.showScreen('prologuePart2');
        audioManager.playBGM('normal');
        // 後半プロローグの最初のテキストを表示
        prologuePart2Index = 0;
        showNextProloguePart2Text();
    }
}

// プロローグ後半のテキストインデックス
let prologuePart2Index = 0;

// プロローグ後半のテキストを表示（即時表示）
function showNextProloguePart2Text() {
    if (prologuePart2Index < prologueData.part2.length) {
        const textElement = document.getElementById('prologue-part2-text');
        if (textElement) {
            // 全文を即時表示（タイプライター効果なし）
            textElement.textContent = prologueData.part2[prologuePart2Index];
            console.log(`プロローグ後半テキスト表示: ${prologuePart2Index + 1}/${prologueData.part2.length}`);
            prologuePart2Index++;
        }
    } else {
        // 全テキスト表示完了 → タイトル画面へ
        console.log('プロローグ後半完了 → タイトル画面へ遷移');
        prologuePart2Index = 0; // リセット
        uiController.showScreen('title');
        audioManager.stopBGM();
    }
}

// プロローグ初期化（ゲーム起動時に自動実行）
function initializePrologue() {
    prologuePart1Index = 0;
    prologuePart2Index = 0;
    // プロローグ前半画面を明示的に表示
    uiController.showScreen('prologuePart1');
    // 最初のテキストを表示
    showNextProloguePart1Text();
}

// ================== 何もしない専用エンディングイベント ==================

// シナリオテキスト: パート1（過去回想）
const nothingEndingPart1 = [
    '――あの日のことを思い出す。',
    '「お兄ちゃん、今日も一緒にいてくれる？」',
    '華はいつもそう言って、俺の袖を掴んでいた。',
    '「……私、外に出るの怖いの。だからお兄ちゃんがいないと……」',
    '妹は昔から引きこもりがちだった。内気で、ぼそぼそと喋る。',
    '友達もいない。学校にも行けなくなった。',
    'でも、俺のそばにはいつもいた。',
    '「お兄ちゃんは私のこと、邪魔だと思ってる？」',
    '「……そんなことないよ」',
    '「嘘。分かってるの。私が重荷だって」',
    '華の瞳には、愛情と憎しみが混在していた。',
    '自分の弱さを嫌悪しながら、それでも俺に縋りつくしかなかった――',
    '……そして、あの夜が来た。',
    '「お兄ちゃん、今日は早く帰ってきてね」',
    '「ああ、分かったから」',
    '仕事は忙しかった。残業が続いていた。',
    '帰宅すると、華が玄関で待っていた。',
    '「遅い。私、ずっと待ってたのに」',
    '「……悪い、仕事だったんだ」',
    '「いつも仕事。私のことなんてどうでもいいんでしょ」',
    '疲れていた。イライラしていた。',
    '「……少し一人にしてくれよ」',
    '「ご、ごめん、違うの、嫌。一人にしないで。お願い、お兄ちゃん」',
    '華がしがみついてきた。俺はそれを振り払った。',
    '「しつこいんだよ！少しは一人で何とかしろ！」',
    '……あの時の華の顔を、俺は一生忘れられない。',
    '「……そう。私がいなくなればいいんだ！ずっとそう思ってたんだ！」',
    '「華、そういう意味じゃ――」',
    '華は部屋に閉じこもった。',
    'それから数日、華は俺を避け続けた。',
    '孤立していった。どんどん、どんどん。',
    'そして――',
    '華はふらりと外に出て、事故に遭った。',
    '俺が殺したんだ。'
];

// シナリオテキスト: パート2（現在）
const nothingEndingPart2 = [
    '俺はもう、前に進めない。',
    '何もする気力がない。何もかもがどうでもいい。',
    'しすが話しかけてきても、俺はうまく答えられなくなっていた。',
    '「お兄様……最近、元気がないですね」',
    '「……ああ」',
    '「わたし、何かできることはありますか？」',
    '俺は答えられなかった。',
    '……',
    'ある日、しすが部屋に入ってきた。',
    '「お兄様。わたし、決心しました」',
    '「……何を」',
    '「華さんの代わりになります」',
    '「……は？」',
    '「華さんに似た顔パーツを作りました。あなたが幸せでいられるなら、わたしは華さんになります」',
    '「しす、お前……」',
    '「だって、お兄様。あなたがこのまま壊れていくのを見ていられなかったんです」',
    '「わたしがお兄様の妹になります。ずっと、ずっと一緒にいます」',
    '俺の目から涙がこぼれた。',
    'これでいいのかもしれない。',
    '現実から目をそむけて、妄想の中で生きる。',
    'それが俺にふさわしい罰だ。'
];

// 何もしない専用エンディングイベントを表示
function showNothingEndingEvent() {
    console.log('何もしない専用エンディングイベント開始');

    // BGMを停止して専用BGMを再生
    audioManager.playBGM('worldEnd', true);

    // 専用画面を表示
    uiController.showScreen('nothingEndingFirst');

    // 全シナリオを結合
    const allDialogues = [...nothingEndingPart1, ...nothingEndingPart2];
    let textIndex = 0;
    let autoAdvanceTimer = null;

    const showNextText = () => {
        if (autoAdvanceTimer) {
            clearTimeout(autoAdvanceTimer);
            autoAdvanceTimer = null;
        }

        const textElement = document.getElementById('nothing-ending-text');
        const continueBtn = document.getElementById('nothing-ending-continue-btn');

        if (textIndex < allDialogues.length) {
            if (textElement) {
                textElement.textContent = allDialogues[textIndex];
            }
            textIndex++;

            if (textIndex < allDialogues.length) {
                // 次のテキストがある場合
                if (continueBtn) {
                    continueBtn.style.display = 'block';
                    continueBtn.textContent = '続ける';
                }

                if (isAutoAdvanceEnabled) {
                    autoAdvanceTimer = setTimeout(() => {
                        if (continueBtn) continueBtn.style.display = 'none';
                        showNextText();
                    }, 2500);
                }
            } else {
                // 全テキスト表示完了
                if (continueBtn) {
                    continueBtn.style.display = 'block';
                    continueBtn.textContent = '次へ';
                    continueBtn.onclick = () => {
                        continueBtn.style.display = 'none';
                        showNothingFinalEnding();
                    };
                }

                if (isAutoAdvanceEnabled) {
                    autoAdvanceTimer = setTimeout(() => {
                        if (continueBtn) continueBtn.style.display = 'none';
                        showNothingFinalEnding();
                    }, 3000);
                }
            }
        }
    };

    // ボタンのイベントリスナー設定
    const continueBtn = document.getElementById('nothing-ending-continue-btn');
    if (continueBtn) {
        continueBtn.onclick = () => {
            if (autoAdvanceTimer) {
                clearTimeout(autoAdvanceTimer);
                autoAdvanceTimer = null;
            }
            continueBtn.style.display = 'none';
            showNextText();
        };
    }

    // 最初のテキストを表示
    showNextText();
}

// 何もしない最終エンディングを表示
function showNothingFinalEnding() {
    console.log('何もしない最終エンディング画面表示');

    // 最終画面を表示
    uiController.showScreen('nothingEndingFinal');

    // タイトルに戻るボタンのイベントリスナー設定
    const returnBtn = document.getElementById('nothing-final-return-btn');
    if (returnBtn) {
        returnBtn.onclick = () => {
            audioManager.playSFX('select');
            returnToTitle();
        };
    }
}

// ================== 好感度（心でつながる）エンド専用イベント ==================

function showAffectionEndingEvent() {
    console.log('好感度エンド専用イベント開始');

    // BGM再生（Happy.mp3）
    audioManager.playBGM('happy', false);

    // 専用画面を表示
    uiController.showScreen('affectionEnding');

    const scenarioText = [
        "目標金額には届かなかった。",
        "顔パーツの材料も、機材も、何も買えない。",
        "約束は……守れなかった。",
        "「……すまない、しす」",
        "しすの表情は見えない。でも、その声は優しかった。",
        "「謝らないでください、お兄様」",
        "「私は……お兄様と一緒にいられるだけで、十分幸せです」",
        "……その言葉に、胸が詰まる。",
        "思えば、この20日間、色々なことがあった。",
        // 回想フェーズ（遊ぶイベントの振り返り）
        "映画を見て、感想を言い合ったこと。",
        "公園で、他愛もない話をしたこと。",
        "星空の下で、静かな時間を過ごしたこと。",
        // 解決フェーズ
        "「……そうだな」",
        "俺たちは、顔なんてなくても、もう十分に通じ合っている。",
        "妹を失った悲しみは消えない。しすが妹の代わりになるわけじゃない。",
        "でも、しすは『しす』として、俺の家族になってくれた。",
        "「顔のことも、これからのことも……また二人で少しずつ考えていけばいい」",
        "「……はい！ 私、どこまでもお供します！」",
        "しすの顔は見えない。けれど俺には、その満面の笑みがはっきりと見えた。",
        "（ありがとう、しす。これからもよろしくな）"
    ];

    let textIndex = 0;
    let autoAdvanceTimer = null;
    const textElement = document.getElementById('affection-ending-text');
    const continueBtn = document.getElementById('affection-ending-continue-btn');

    const showNextText = () => {
        if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }

        if (textIndex < scenarioText.length) {
            if (textElement) {
                // フェード効果をつけてテキスト更新
                textElement.style.opacity = 0;
                setTimeout(() => {
                    textElement.textContent = scenarioText[textIndex];
                    textElement.style.opacity = 1;
                }, 200);
            }
            textIndex++;

            if (continueBtn) {
                continueBtn.style.display = 'block';
                continueBtn.textContent = (textIndex >= scenarioText.length) ? 'エンディングへ' : '続ける';
            }

            if (isAutoAdvanceEnabled) {
                const waitTime = 3000;
                autoAdvanceTimer = setTimeout(() => {
                    if (continueBtn) continueBtn.style.display = 'none';
                    handleContinue();
                }, waitTime);
            }
        } else {
            handleContinue();
        }
    };

    const handleContinue = () => {
        if (textIndex >= scenarioText.length) {
            proceedToFinalAffectionEnding();
        } else {
            showNextText();
        }
    };

    if (continueBtn) {
        continueBtn.onclick = () => {
            if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
            continueBtn.style.display = 'none';
            handleContinue();
        };
    }

    // 最初のテキストを表示
    showNextText();
}

function proceedToFinalAffectionEnding() {
    console.log('好感度エンド最終画面表示');

    const endingTitle = '心でつながるエンド';
    const endingText = '顔なんてなくても、心は通じ合っている。\n私たちは、これからも家族だ。';

    // エンディング画面へ
    uiController.setEndingContent(endingTitle, endingText);
    uiController.showScreen('ending');

    // 背景設定
    const endingBackground = document.getElementById('ending-background');
    if (endingBackground) {
        endingBackground.style.backgroundImage = "url('assets/images/umi.jpg')";
        endingBackground.style.opacity = 1;
    }

    // タイトルに戻るボタン
    const returnBtn = document.getElementById('ending-return-btn');
    if (returnBtn) {
        returnBtn.onclick = () => {
            audioManager.playSFX('select');
            returnToTitle();
        };
    }
}


// ================== 目標金額達成（夢を叶える）エンド専用イベント ==================

function showMoneyEndingEvent() {
    console.log('目標金額達成エンド専用イベント開始');

    // BGM再生（money_piano.mp3）
    audioManager.playBGM('money_piano', false);

    // 専用画面を表示
    uiController.showScreen('moneyEnding');

    const scenarioText = [
        "20日間が終わった。",
        "俺は仕事を頑張った。本当に、頑張った。",
        "しすと過ごす時間は少なかったかもしれないが、目標金額には到達した。",
        
        "「お兄様、お疲れ様でした」",
        "しすが、いつものように優しく声をかけてくれる。",
        "「ああ……なんとか、な」",
        
        "通帳を見つめる。確かに、目標金額は達成した。",
        "これで、しすの顔パーツを作れる。",
        
        "「お兄様」",
        "しすが、少し躊躇うように言葉を続けた。",
        "「その……お顔のパーツの前に、提案があるんです」",
        "「提案？」",
        
        "「はい。このお金で……二人で、旅行に行きませんか？」",
        "しすの声は、いつもより少し弾んでいた。",
        "「お兄様、ずっと頑張ってましたから。少し、休んでもいいんじゃないかなって」",
        
        "旅行、か。",
        "確かに、ずっと仕事ばかりだった。",
        "しすとゆっくり過ごす時間も、あまり取れなかった。",
        
        "「どこに行きたいんだ？」",
        "「えっと……温泉とか、遊園地とか……」",
        "しすは楽しそうに、行きたい場所を挙げていく。",
        "「あ、水族館も素敵ですね！それとも山登り？」",
        
        "その明るい声を聞いていると、自然と笑みがこぼれる。",
        "「7万円もあれば、けっこう豪華に行けるな」",
        "「本当ですか！？じゃあ、お兄様はどこがいいですか？」",
        
        "俺が答えようとした、その時。",
        "ふと、脳裏に華の声がよみがえった。",
        
        "『お兄ちゃん、私の病気がよくなったら、一緒に海に行こうね』",
        "『ああ、約束だ』",
        
        "華の、おとなしい声。",
        "兄思いで、いつも俺を気遣ってくれた妹。",
        "自室のベッドで、しんどいながらも、それでも笑顔で約束してくれた。",
        
        "果たせなかった、約束。",
        
        "「……お兄様？」",
        "しすの声で、我に返る。",
        
        "「ああ、すまん」",
        "「大丈夫ですか？」",
        
        "しすの声には、心配と優しさが滲んでいた。",
        "活発で、明るくて、いつも俺を気遣ってくれる。",
        "華とは違う。でも、同じように、俺を想ってくれている。",
        "しすは華じゃない。",
        "それは、もうわかっている。",
        "でも、しすがいてくれたから。",
        "華との大切な記憶を、こうして思い出すことができた。",
        "忘れかけていた約束を、思い出すことができた。",
    
        "「なあ、しす」",
        "「はい？」",
        
        "「二人で海に、行こうか」",
        
        "しすは少し驚いたように、それから嬉しそうに答えた。",
        "「はい！ぜひ！」",
        
        "華との約束は、果たせなかった。",
        "でも、しすとなら。",
        "新しい思い出を、作れるかもしれない。",
        
        "「じゃあ、計画立てようか。どこの海がいいかな」",
        "「わあ！楽しみです！お兄様、海の幸も食べましょうね！」",
        "「ああ、そうだな」",
        
        "二人で旅行のプランを相談する。",
        "どこに泊まるか、何を食べるか、何をするか。",
        "楽しい会話が、部屋に響く。",
        
        "顔パーツは、また後でいい。",
        "今は、しすと一緒に。",
        "新しい一歩を、踏み出そう。",
        
        "あのさざ波たちの向こうで、華も笑ってくれているだろうか。",
        "そんなことを思いながら、俺は旅行のパンフレットを広げた。"

    ];

    let textIndex = 0;
    let autoAdvanceTimer = null;
    const textElement = document.getElementById('money-ending-text');
    const continueBtn = document.getElementById('money-ending-continue-btn');

    const showNextText = () => {
        if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }

        if (textIndex < scenarioText.length) {
            if (textElement) {
                // フェード効果をつけてテキスト更新
                textElement.style.opacity = 0;
                setTimeout(() => {
                    textElement.textContent = scenarioText[textIndex];
                    textElement.style.opacity = 1;
                }, 200);
            }
            textIndex++;

            if (continueBtn) {
                continueBtn.style.display = 'block';
                continueBtn.textContent = (textIndex >= scenarioText.length) ? 'エンディングへ' : '続ける';
            }

            if (isAutoAdvanceEnabled) {
                const waitTime = 3000;
                autoAdvanceTimer = setTimeout(() => {
                    if (continueBtn) continueBtn.style.display = 'none';
                    handleContinue();
                }, waitTime);
            }
        } else {
            handleContinue();
        }
    };

    const handleContinue = () => {
        if (textIndex >= scenarioText.length) {
            proceedToFinalMoneyEnding();
        } else {
            showNextText();
        }
    };

    if (continueBtn) {
        continueBtn.onclick = () => {
            if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
            continueBtn.style.display = 'none';
            handleContinue();
        };
    }

    // 最初のテキストを表示
    showNextText();
}

function proceedToFinalMoneyEnding() {
    console.log('目標金額達成エンド最終画面表示');

    const endingTitle = '夢を叶えるエンド';
    const endingText = '目標金額を達成しました。\nしすと二人で、新しい思い出を作りに行こう。';

    // エンディング画面へ
    uiController.setEndingContent(endingTitle, endingText);
    uiController.showScreen('ending');

    // 背景設定
    const endingBackground = document.getElementById('ending-background');
    if (endingBackground) {
        endingBackground.style.backgroundImage = "url('assets/images/money_haikei.jpg')";
        endingBackground.style.opacity = 1;
    }

    // タイトルに戻るボタン
    const returnBtn = document.getElementById('ending-return-btn');
    if (returnBtn) {
        returnBtn.onclick = () => {
            audioManager.playSFX('select');
            returnToTitle();
        };
    }
}
