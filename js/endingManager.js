/**
 * エンディング管理システム
 * エンディング表示と演出を管理する
 */

class EndingManager {
    constructor(uiController, audioManager, visualManager) {
        this.uiController = uiController;
        this.audioManager = audioManager;
        this.visualManager = visualManager;
    }

    /**
     * エンディングを表示する
     * @param {string} endingType - エンディングタイプ
     * @param {Object} gameState - ゲーム状態
     */
    showEnding(endingType, gameState) {
        console.log('=== showEnding() 呼び出し ===');
        console.log('エンディングタイプ:', endingType);

        const endingTitle = gameState.getEndingName(endingType);
        console.log('エンディングタイトル:', endingTitle);

        // perfect_endの場合、Canvas導入会話を表示
        if (endingType === 'perfect_end') {
            console.log('理想の共存エンド - Canvas導入会話を表示');
            return { type: 'canvas_intro' };
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
        this.audioManager.playEndingBGM(endingTitle);

        // エンディング背景をクリア（通常エンディングはグラデーション背景）
        this.clearEndingBackground();

        this.uiController.setEndingContent(endingTitle, endingTexts[endingType] || '');
        this.uiController.showScreen('ending');
        console.log('=== showEnding() 完了 ===');
        
        return { type: 'normal_ending' };
    }

    /**
     * エンディング背景を設定
     * @param {string} imagePath - 画像パス
     */
    setEndingBackground(imagePath) {
        const endingScreen = document.getElementById('ending-screen');
        const endingBackground = document.getElementById('ending-background');

        if (endingScreen && endingBackground) {
            endingScreen.classList.add('with-background');
            endingBackground.style.backgroundImage = `url('${imagePath}')`;
            console.log('エンディング背景を設定:', imagePath);
        }
    }

    /**
     * エンディング背景をクリア
     */
    clearEndingBackground() {
        const endingScreen = document.getElementById('ending-screen');
        const endingBackground = document.getElementById('ending-background');

        if (endingScreen && endingBackground) {
            endingScreen.classList.remove('with-background');
            endingBackground.style.backgroundImage = '';
            console.log('エンディング背景をクリア');
        }
    }

    /**
     * 最終エンディング画面を表示
     */
    showFinalEnding() {
        console.log('最終エンディング画面へ遷移');

        const endingTitle = '理想の共存エンド';
        const endingText = 'ずっと、一緒にいてくださいね。あなたの家族より。';

        // エンディングBGMを再生
        this.audioManager.playEndingBGM(endingTitle);

        // perfect_endの背景画像を設定
        this.setEndingBackground('assets/images/ending.jpg');

        // 完全達成エンド用のクラスを追加（視覚演出用）
        const endingScreen = document.getElementById('ending-screen');
        if (endingScreen) {
            endingScreen.classList.add('perfect-end');
        }

        this.uiController.setEndingContent(endingTitle, endingText);
        this.uiController.showScreen('ending');

        // 視覚演出を発動
        this.startPerfectEndingEffects();

        console.log('=== エンディング画面表示完了 ===');
    }

    /**
     * 完全達成エンドの視覚演出を開始
     */
    startPerfectEndingEffects() {
        // 光のオーバーレイを追加
        const lightOverlay = document.createElement('div');
        lightOverlay.className = 'light-overlay';
        lightOverlay.id = 'perfect-end-light-overlay';
        document.body.appendChild(lightOverlay);

        // パーティクルエフェクトを開始
        this.startParticleEffect();

        // 10秒後にエフェクトを停止
        setTimeout(() => {
            this.stopPerfectEndingEffects();
        }, 10000);
    }

    /**
     * パーティクルエフェクトを開始
     */
    startParticleEffect() {
        // パーティクルコンテナを作成
        const container = document.createElement('div');
        container.className = 'particles-container';
        container.id = 'perfect-end-particles';
        document.body.appendChild(container);

        // パーティクルを生成する関数
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // ランダムな位置とサイズ
            const startX = Math.random() * 100;
            const size = Math.random() * 10 + 5;
            const duration = Math.random() * 3 + 2;
            const hue = Math.random() * 60 + 30; // 金色系の色相

            particle.style.left = `${startX}%`;
            particle.style.top = '-20px';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.background = `radial-gradient(circle, hsla(${hue}, 100%, 60%, 1) 0%, hsla(${hue}, 100%, 60%, 0) 70%)`;

            container.appendChild(particle);

            // アニメーション終了後に削除
            setTimeout(() => {
                particle.remove();
            }, duration * 1000);
        };

        // 定期的にパーティクルを生成
        const particleInterval = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                createParticle();
            }
        }, 200);

        // 10秒後に生成を停止
        setTimeout(() => {
            clearInterval(particleInterval);
        }, 10000);

        // インターバルIDを保存
        window.perfectEndParticleInterval = particleInterval;
    }

    /**
     * 完全達成エンドのエフェクトを停止
     */
    stopPerfectEndingEffects() {
        // パーティクルを停止
        if (window.perfectEndParticleInterval) {
            clearInterval(window.perfectEndParticleInterval);
        }

        // 要素を削除
        const particles = document.getElementById('perfect-end-particles');
        if (particles) {
            particles.remove();
        }

        const lightOverlay = document.getElementById('perfect-end-light-overlay');
        if (lightOverlay) {
            lightOverlay.remove();
        }
    }

    /**
     * エンディングのクリーンアップ
     */
    cleanup() {
        this.stopPerfectEndingEffects();

        // perfect-endクラスを削除
        const endingScreen = document.getElementById('ending-screen');
        if (endingScreen) {
            endingScreen.classList.remove('perfect-end');
        }
    }
}

export default EndingManager;
