/**
 * AudioManager - 音響管理システム
 * Howler.jsを使用してBGMと効果音を管理する
 */
class AudioManager {
    constructor() {
        this.bgm = null;
        this.sfx = {};
        this.bgmVolume = 0.7;
        this.sfxVolume = 0.8;
        this.isMuted = false;
        
        // BGMファイルのパス定義
        this.bgmPaths = {
            normal: 'assets/audio/bgm_loop.mp3',
            goodEnding: 'assets/audio/ending_good.mp3',
            badEnding: 'assets/audio/ending_bad.mp3'
        };
        
        // 効果音ファイルのパス定義
        this.sfxPaths = {
            click: 'assets/audio/click.mp3',
            select: 'assets/audio/select.mp3',
            notification: 'assets/audio/notification.mp3'
        };
        
        this.currentBgmType = null;
    }
    
    /**
     * BGMを再生する
     * @param {string} type - BGMタイプ ('normal', 'goodEnding', 'badEnding')
     * @param {boolean} loop - ループ再生するかどうか (デフォルト: true)
     */
    playBGM(type = 'normal', loop = true) {
        try {
            // 既に同じBGMが再生中の場合は何もしない
            if (this.currentBgmType === type && this.isBGMPlaying()) {
                console.log(`BGM "${type}" は既に再生中です`);
                return;
            }
            
            // 既存のBGMを停止
            this.stopBGM();
            
            const bgmPath = this.bgmPaths[type];
            if (!bgmPath) {
                console.warn(`BGMタイプ "${type}" が見つかりません`);
                return;
            }
            
            this.bgm = new Howl({
                src: [bgmPath],
                loop: loop,
                volume: this.isMuted ? 0 : this.bgmVolume,
                onload: () => {
                    console.log(`BGM "${type}" が読み込まれました`);
                },
                onloaderror: (id, error) => {
                    console.warn(`BGM "${type}" の読み込みに失敗しました:`, error);
                },
                onplay: () => {
                    console.log(`BGM "${type}" の再生を開始しました`);
                },
                onend: () => {
                    if (!loop) {
                        console.log(`BGM "${type}" の再生が終了しました`);
                        this.bgm = null;
                        this.currentBgmType = null;
                    }
                }
            });
            
            this.bgm.play();
            this.currentBgmType = type;
            
        } catch (error) {
            console.error('BGM再生エラー:', error);
        }
    }
    
    /**
     * BGMを停止する
     */
    stopBGM() {
        if (this.bgm) {
            console.log(`BGM "${this.currentBgmType}" を停止します`);
            this.bgm.stop();
            this.bgm.unload();
            this.bgm = null;
            this.currentBgmType = null;
        }
    }
    
    /**
     * BGMを一時停止する
     */
    pauseBGM() {
        if (this.bgm && this.bgm.playing()) {
            this.bgm.pause();
        }
    }
    
    /**
     * BGMを再開する
     */
    resumeBGM() {
        if (this.bgm && !this.bgm.playing()) {
            this.bgm.play();
        }
    }
    
    /**
     * 効果音を再生する
     * @param {string} type - 効果音タイプ ('click', 'select', 'notification')
     */
    playSFX(type) {
        console.log(`=== playSFX('${type}') 呼び出し ===`);
        try {
            const sfxPath = this.sfxPaths[type];
            if (!sfxPath) {
                console.warn(`効果音タイプ "${type}" が見つかりません`);
                return;
            }
            
            // 既存の同じ効果音があれば停止
            if (this.sfx[type]) {
                console.log(`既存の効果音 "${type}" を停止`);
                this.sfx[type].stop();
                this.sfx[type].unload();
                delete this.sfx[type];
            }
            
            this.sfx[type] = new Howl({
                src: [sfxPath],
                volume: this.isMuted ? 0 : this.sfxVolume,
                onload: () => {
                    console.log(`効果音 "${type}" が読み込まれました - 再生開始`);
                    // 読み込み完了後に再生
                    if (this.sfx[type]) {
                        this.sfx[type].play();
                    }
                },
                onloaderror: (id, error) => {
                    console.warn(`効果音 "${type}" の読み込みに失敗しました:`, error);
                    // 読み込み失敗時はリソースを解放
                    if (this.sfx[type]) {
                        this.sfx[type].unload();
                        delete this.sfx[type];
                    }
                },
                onplay: () => {
                    console.log(`効果音 "${type}" 再生開始`);
                },
                onend: () => {
                    console.log(`効果音 "${type}" 再生終了`);
                    // 再生終了後にリソースを解放
                    if (this.sfx[type]) {
                        this.sfx[type].unload();
                        delete this.sfx[type];
                    }
                }
            });
            
            // play()は読み込み完了後にonloadで呼ばれるので、ここでは呼ばない
            console.log(`効果音 "${type}" 読み込み開始`);
            
        } catch (error) {
            console.error('効果音再生エラー:', error);
        }
    }
    
    /**
     * BGMの音量を設定する
     * @param {number} volume - 音量 (0.0 - 1.0)
     */
    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgm && !this.isMuted) {
            this.bgm.volume(this.bgmVolume);
        }
    }
    
    /**
     * 効果音の音量を設定する
     * @param {number} volume - 音量 (0.0 - 1.0)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        // 現在再生中の効果音にも適用
        Object.values(this.sfx).forEach(sound => {
            if (sound && !this.isMuted) {
                sound.volume(this.sfxVolume);
            }
        });
    }
    
    /**
     * 全体の音量を設定する
     * @param {string} type - 'bgm' または 'sfx'
     * @param {number} volume - 音量 (0.0 - 1.0)
     */
    setVolume(type, volume) {
        if (type === 'bgm') {
            this.setBGMVolume(volume);
        } else if (type === 'sfx') {
            this.setSFXVolume(volume);
        } else {
            console.warn(`不明な音量タイプ: ${type}`);
        }
    }
    
    /**
     * 音声をミュートする
     */
    mute() {
        this.isMuted = true;
        if (this.bgm) {
            this.bgm.volume(0);
        }
        Object.values(this.sfx).forEach(sound => {
            if (sound) {
                sound.volume(0);
            }
        });
    }
    
    /**
     * ミュートを解除する
     */
    unmute() {
        this.isMuted = false;
        if (this.bgm) {
            this.bgm.volume(this.bgmVolume);
        }
        Object.values(this.sfx).forEach(sound => {
            if (sound) {
                sound.volume(this.sfxVolume);
            }
        });
    }
    
    /**
     * ミュート状態を切り替える
     */
    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }
    
    /**
     * 現在のBGMタイプを取得する
     * @returns {string|null} 現在のBGMタイプ
     */
    getCurrentBGMType() {
        return this.currentBgmType;
    }
    
    /**
     * BGMが再生中かどうかを確認する
     * @returns {boolean} 再生中の場合true
     */
    isBGMPlaying() {
        return this.bgm && this.bgm.playing();
    }
    
    /**
     * 全ての音声を停止し、リソースを解放する
     */
    cleanup() {
        this.stopBGM();
        
        // 全ての効果音を停止・解放
        Object.values(this.sfx).forEach(sound => {
            if (sound) {
                sound.stop();
                sound.unload();
            }
        });
        this.sfx = {};
    }
    
    /**
     * エンディングに応じたBGMを再生する
     * @param {string} endingType - エンディングタイプ
     */
    playEndingBGM(endingType) {
        console.log('=== playEndingBGM() 呼び出し ===');
        console.log('受信したエンディングタイプ:', endingType);
        
        let bgmType = 'normal';
        
        switch (endingType) {
            case '理想の共存エンド':
            case '夢を叶えるエンド':
            case '心でつながるエンド':
                bgmType = 'goodEnding';
                console.log('良いエンディング判定 -> goodEnding BGM');
                break;
            case '通常失敗エンド':
            case '空白エンド':
                bgmType = 'badEnding';
                console.log('悪いエンディング判定 -> badEnding BGM');
                break;
            default:
                bgmType = 'normal';
                console.log('デフォルト判定 -> normal BGM');
        }
        
        console.log('最終的なBGMタイプ:', bgmType);
        this.playBGM(bgmType, false); // エンディングBGMはループしない
        console.log('=== playEndingBGM() 完了 ===');
    }
    
    /**
     * 画面遷移時のBGM管理
     * @param {string} screenType - 画面タイプ ('title', 'main', 'event', 'ending')
     */
    handleScreenTransition(screenType) {
        switch (screenType) {
            case 'title':
                // タイトル画面では音楽を停止
                this.stopBGM();
                break;
            case 'main':
                // メイン画面では通常BGMを再生
                this.playBGM('normal');
                break;
            case 'event':
                // イベント画面では現在のBGMを継続（何もしない）
                break;
            case 'ending':
                // エンディング画面では専用BGMを再生（playEndingBGMで処理）
                break;
            default:
                console.warn(`不明な画面タイプ: ${screenType}`);
        }
    }
}

export default AudioManager;