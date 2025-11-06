/**
 * ゲーム状態管理クラス
 * プレイヤーの進行状況、好感度、所持金などを管理する
 */
export class GameState {
    constructor(config = {}) {
        // デフォルト設定
        this.config = Object.assign({
            goal_money: 100000,           // 目標金額
            affection_threshold: 70,      // 好感度閾値
            max_days: 30,                // 最大日数
            bad_end_threshold: 10,        // バッドエンド連続回数
            initial_affection: 30,        // 初期好感度
            work_base_income: 5000,       // 仕事基本収入
            work_income_variation: 2000,  // 仕事収入変動幅
            play_affection_base: 5,       // 遊ぶ基本好感度
            play_affection_variation: 3   // 遊ぶ好感度変動幅
        }, config);
        
        // ゲーム状態の初期化
        this.day = 1;
        this.affection = this.config.initial_affection;
        this.money = 0;
        this.consecutive_none = 0;
    }
    
    /**
     * プレイヤーの行動を適用してゲーム状態を更新する
     * @param {string} actionType - 行動タイプ（'play', 'work', 'none'）
     * @param {Object} eventData - イベントデータ（オプション）
     */
    applyAction(actionType, eventData = {}) {
        switch (actionType) {
            case 'play':
                // 遊ぶ：好感度を3-8ポイント増加（要件1.3）
                const affectionGain = this.config.play_affection_base + 
                    Math.floor(Math.random() * (this.config.play_affection_variation * 2 + 1)) - 
                    this.config.play_affection_variation;
                this.affection = Math.min(100, this.affection + Math.max(3, affectionGain));
                this.resetConsecutiveNone();
                break;
                
            case 'work':
                // 仕事：所持金を4000-7000円増加（要件1.4）
                const moneyGain = this.config.work_base_income + 
                    Math.floor(Math.random() * (this.config.work_income_variation * 2 + 1)) - 
                    this.config.work_income_variation;
                this.money += Math.max(4000, Math.min(7000, moneyGain));
                this.resetConsecutiveNone();
                break;
                
            case 'none':
                // 何もしない：連続回数を増加（要件1.5）
                this.consecutive_none++;
                break;
                
            default:
                console.warn(`不明な行動タイプ: ${actionType}`);
        }
        
        // イベントデータによる追加効果を適用
        if (eventData.affection_delta) {
            this.affection = Math.max(0, Math.min(100, this.affection + eventData.affection_delta));
        }
        if (eventData.money_delta) {
            this.money = Math.max(0, this.money + eventData.money_delta);
        }
    }
    
    /**
     * 日数を1日進める
     */
    incrementDay() {
        if (this.day < this.config.max_days) {
            this.day++;
        }
    }
    
    /**
     * 連続何もしない回数をリセットする
     */
    resetConsecutiveNone() {
        this.consecutive_none = 0;
    }
    
    /**
     * 設定を更新する
     * @param {Object} newConfig - 新しい設定オブジェクト
     */
    updateConfig(newConfig) {
        this.config = Object.assign(this.config, newConfig);
    }
    
    /**
     * 現在のゲーム状態を取得する
     * @returns {Object} ゲーム状態オブジェクト
     */
    getState() {
        return {
            day: this.day,
            affection: this.affection,
            money: this.money,
            consecutive_none: this.consecutive_none,
            config: { ...this.config }
        };
    }
    
    /**
     * ゲーム状態を設定する（セーブデータ復元用）
     * @param {Object} state - 復元するゲーム状態
     */
    setState(state) {
        this.day = Math.max(1, Math.min(this.config.max_days, state.day || 1));
        this.affection = Math.max(0, Math.min(100, state.affection || this.config.initial_affection));
        this.money = Math.max(0, state.money || 0);
        this.consecutive_none = Math.max(0, state.consecutive_none || 0);
        
        if (state.config) {
            this.updateConfig(state.config);
        }
    }
    
    /**
     * エンディング条件をチェックする
     * @returns {string|null} エンディングタイプまたはnull（ゲーム継続）
     */
    checkEndingCondition() {
        // バッドエンド条件：連続10回何もしない（要件5.1）
        if (this.consecutive_none >= this.config.bad_end_threshold) {
            return 'bad_end';
        }
        
        // 30日経過時のエンディング判定（要件4.1）
        if (this.day >= this.config.max_days) {
            // 理想の共存エンド：好感度70以上かつ所持金100000円以上（要件4.2）
            if (this.affection >= this.config.affection_threshold && 
                this.money >= this.config.goal_money) {
                return 'perfect_end';
            }
            
            // 夢を叶えるエンド：所持金100000円以上（要件4.3）
            if (this.money >= this.config.goal_money) {
                return 'money_end';
            }
            
            // 心でつながるエンド：好感度70以上（要件4.4）
            if (this.affection >= this.config.affection_threshold) {
                return 'affection_end';
            }
            
            // 通常失敗エンド：上記条件を満たさない（要件4.5）
            return 'normal_end';
        }
        
        // ゲーム継続
        return null;
    }
    
    /**
     * エンディングタイプに対応する日本語名を取得する
     * @param {string} endingType - エンディングタイプ
     * @returns {string} エンディングの日本語名
     */
    getEndingName(endingType) {
        const endingNames = {
            'perfect_end': '理想の共存エンド',
            'money_end': '夢を叶えるエンド',
            'affection_end': '心でつながるエンド',
            'normal_end': '通常失敗エンド',
            'bad_end': '空白エンド'
        };
        
        return endingNames[endingType] || '不明なエンディング';
    }
    
    /**
     * ゲームが終了しているかどうかを確認する
     * @returns {boolean} ゲームが終了しているかどうか
     */
    isGameOver() {
        return this.checkEndingCondition() !== null;
    }
    
    /**
     * ゲーム状態の妥当性を検証する
     * @returns {boolean} 状態が有効かどうか
     */
    validateState() {
        return (
            this.day >= 1 && this.day <= this.config.max_days &&
            this.affection >= 0 && this.affection <= 100 &&
            this.money >= 0 &&
            this.consecutive_none >= 0
        );
    }
}