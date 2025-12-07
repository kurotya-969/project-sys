/**
 * 音量管理システム
 * 音量調整UIとAudioManagerを連携させる
 */

class VolumeManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.isMuted = false;
        
        // DOM要素の参照
        this.elements = {
            bgmSlider: document.getElementById('bgm-volume'),
            sfxSlider: document.getElementById('sfx-volume'),
            bgmValue: document.getElementById('bgm-volume-value'),
            sfxValue: document.getElementById('sfx-volume-value'),
            muteBtn: document.getElementById('mute-toggle-btn')
        };
    }

    /**
     * 音量管理システムを初期化
     */
    initialize() {
        // localStorageから音量設定を読み込む
        this.loadVolumeSettings();
        
        // イベントリスナーを設定
        this.setupEventListeners();
        
        console.log('VolumeManager初期化完了');
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // BGM音量スライダー
        if (this.elements.bgmSlider) {
            this.elements.bgmSlider.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value);
                this.setBGMVolume(volume);
            });
        }

        // 効果音音量スライダー
        if (this.elements.sfxSlider) {
            this.elements.sfxSlider.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value);
                this.setSFXVolume(volume);
            });
        }

        // ミュートボタン
        if (this.elements.muteBtn) {
            this.elements.muteBtn.addEventListener('click', () => {
                this.toggleMute();
            });
        }
    }

    /**
     * BGM音量を設定
     * @param {number} volume - 音量（0-100）
     */
    setBGMVolume(volume) {
        const normalizedVolume = volume / 100;
        this.audioManager.setBGMVolume(normalizedVolume);
        
        // 表示を更新
        if (this.elements.bgmValue) {
            this.elements.bgmValue.textContent = `${volume}%`;
        }
        
        // localStorageに保存
        this.saveVolumeSettings();
        
        console.log(`BGM音量を設定: ${volume}%`);
    }

    /**
     * 効果音音量を設定
     * @param {number} volume - 音量（0-100）
     */
    setSFXVolume(volume) {
        const normalizedVolume = volume / 100;
        this.audioManager.setSFXVolume(normalizedVolume);
        
        // 表示を更新
        if (this.elements.sfxValue) {
            this.elements.sfxValue.textContent = `${volume}%`;
        }
        
        // localStorageに保存
        this.saveVolumeSettings();
        
        console.log(`効果音音量を設定: ${volume}%`);
    }

    /**
     * ミュート状態を切り替え
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.audioManager.mute();
            if (this.elements.muteBtn) {
                this.elements.muteBtn.textContent = '🔇 ミュート解除';
                this.elements.muteBtn.classList.add('muted');
            }
            console.log('ミュートON');
        } else {
            this.audioManager.unmute();
            if (this.elements.muteBtn) {
                this.elements.muteBtn.textContent = '🔊 ミュート';
                this.elements.muteBtn.classList.remove('muted');
            }
            console.log('ミュートOFF');
        }
        
        // localStorageに保存
        this.saveVolumeSettings();
    }

    /**
     * 音量設定をlocalStorageに保存
     */
    saveVolumeSettings() {
        const settings = {
            bgmVolume: this.elements.bgmSlider ? parseInt(this.elements.bgmSlider.value) : 70,
            sfxVolume: this.elements.sfxSlider ? parseInt(this.elements.sfxSlider.value) : 80,
            isMuted: this.isMuted
        };
        
        try {
            localStorage.setItem('sisuto_volume_settings', JSON.stringify(settings));
            console.log('音量設定を保存しました:', settings);
        } catch (error) {
            console.error('音量設定の保存に失敗しました:', error);
        }
    }

    /**
     * 音量設定をlocalStorageから読み込む
     */
    loadVolumeSettings() {
        try {
            const savedSettings = localStorage.getItem('sisuto_volume_settings');
            
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                // BGM音量を復元
                if (this.elements.bgmSlider && settings.bgmVolume !== undefined) {
                    this.elements.bgmSlider.value = settings.bgmVolume;
                    this.setBGMVolume(settings.bgmVolume);
                }
                
                // 効果音音量を復元
                if (this.elements.sfxSlider && settings.sfxVolume !== undefined) {
                    this.elements.sfxSlider.value = settings.sfxVolume;
                    this.setSFXVolume(settings.sfxVolume);
                }
                
                // ミュート状態を復元
                if (settings.isMuted) {
                    this.isMuted = false; // toggleMuteで反転させるため
                    this.toggleMute();
                }
                
                console.log('音量設定を読み込みました:', settings);
            } else {
                // 初回起動時はデフォルト値を適用
                this.setBGMVolume(70);
                this.setSFXVolume(80);
            }
        } catch (error) {
            console.error('音量設定の読み込みに失敗しました:', error);
            // エラー時はデフォルト値を適用
            this.setBGMVolume(70);
            this.setSFXVolume(80);
        }
    }
}

export default VolumeManager;
