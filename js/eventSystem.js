/**
 * イベントシステムクラス
 * JSONからイベントデータを読み込み、行動タイプ別の重み付きランダムイベント選択を管理する
 */
export class EventSystem {
    constructor() {
        this.events = [];
        this.isLoaded = false;
    }
    
    /**
     * JSONファイルからイベントデータを読み込む（要件3.2）
     * @returns {Promise<boolean>} 読み込み成功可否
     */
    async loadEvents() {
        try {
            const response = await fetch('./assets/data/events.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.events = data.events || [];
            this.isLoaded = true;
            
            console.log(`イベントデータを読み込みました: ${this.events.length}件`);
            return true;
        } catch (error) {
            console.error('イベントデータの読み込みに失敗しました:', error);
            
            // フォールバックデータを使用
            this.events = this.getFallbackEvents();
            this.isLoaded = true;
            console.warn('フォールバックイベントデータを使用します');
            return false;
        }
    }
    
    /**
     * 行動タイプと日数に基づいてイベントを選択する（要件3.1, 3.4）
     * @param {string} type - 行動タイプ（'play', 'work', 'none'）
     * @param {number} day - 現在の日数
     * @returns {Object|null} 選択されたイベント
     */
    pickEvent(type, day) {
        if (!this.isLoaded) {
            console.warn('イベントデータが読み込まれていません');
            return null;
        }
        
        // 指定タイプのイベントを抽出
        const typeEvents = this.events.filter(event => event.type === type);
        
        if (typeEvents.length === 0) {
            console.warn(`タイプ "${type}" のイベントが見つかりません`);
            return null;
        }
        
        // 特定日イベントがあるかチェック
        const daySpecificEvents = typeEvents.filter(event => 
            event.day_specific && event.day_specific === day
        );
        
        if (daySpecificEvents.length > 0) {
            // 特定日イベントを優先選択
            return this.selectWeightedRandom(daySpecificEvents);
        }
        
        // 通常イベントから重み付き選択
        const normalEvents = typeEvents.filter(event => !event.day_specific);
        return this.selectWeightedRandom(normalEvents);
    }    
    
/**
     * 重み付きランダム選択を実行する
     * @param {Array} events - 選択対象のイベント配列
     * @returns {Object|null} 選択されたイベント
     */
    selectWeightedRandom(events) {
        if (events.length === 0) {
            return null;
        }
        
        // 「遊ぶ」イベントの場合、特別な会話イベントの確率を20%上げる（要件3.4）
        let adjustedEvents = events;
        if (events.length > 0 && events[0].type === 'play') {
            adjustedEvents = events.map(event => ({
                ...event,
                weight: event.special ? event.weight * 1.2 : event.weight
            }));
        }
        
        // 重みの合計を計算
        const totalWeight = adjustedEvents.reduce((sum, event) => sum + event.weight, 0);
        
        if (totalWeight <= 0) {
            // 重みがない場合は均等選択
            return events[Math.floor(Math.random() * events.length)];
        }
        
        // 重み付きランダム選択
        let randomValue = Math.random() * totalWeight;
        
        for (const event of adjustedEvents) {
            randomValue -= event.weight;
            if (randomValue <= 0) {
                return event;
            }
        }
        
        // フォールバック（通常は到達しない）
        return adjustedEvents[adjustedEvents.length - 1];
    }
    
    /**
     * イベントの効果を計算する
     * @param {Object} event - イベントオブジェクト
     * @returns {Object} 計算された効果
     */
    calculateEventEffects(event) {
        if (!event) {
            return { affection_delta: 0, money_delta: 0 };
        }
        
        return {
            affection_delta: this.getRandomVariation(
                event.affection_delta || 0,
                event.affection_min || event.affection_delta || 0,
                event.affection_max || event.affection_delta || 0
            ),
            money_delta: this.getRandomVariation(
                event.money_delta || 0,
                event.money_min || event.money_delta || 0,
                event.money_max || event.money_delta || 0
            )
        };
    }
    
    /**
     * 基準値から最小値・最大値の範囲でランダムな値を生成する
     * @param {number} base - 基準値
     * @param {number} min - 最小値
     * @param {number} max - 最大値
     * @returns {number} ランダムな値
     */
    getRandomVariation(base, min, max) {
        if (min === max) {
            return base;
        }
        
        const actualMin = Math.min(min, max);
        const actualMax = Math.max(min, max);
        
        return Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
    }    

    /**
     * フォールバックイベントデータを取得する
     * @returns {Array} 基本的なイベントデータ
     */
    getFallbackEvents() {
        return [
            // 遊ぶイベント
            {
                id: "play_fallback_1",
                type: "play",
                weight: 5,
                text: ["しすと一緒に映画を見ました。", "楽しい時間を過ごせました。"],
                affection_delta: 5,
                money_delta: 0,
                special: false
            },
            {
                id: "play_fallback_2",
                type: "play",
                weight: 3,
                text: ["しすと散歩に出かけました。", "いい気分転換になりました。"],
                affection_delta: 4,
                money_delta: 0,
                special: true
            },
            
            // 仕事イベント
            {
                id: "work_fallback_1",
                type: "work",
                weight: 5,
                text: ["今日も一日お疲れさまでした。", "しっかりと稼ぐことができました。"],
                affection_delta: 0,
                money_delta: 5000,
                special: false
            },
            {
                id: "work_fallback_2",
                type: "work",
                weight: 3,
                text: ["残業をしました。", "少し疲れましたが、収入は良好です。"],
                affection_delta: -1,
                money_delta: 6000,
                special: false
            },
            
            // 何もしないイベント
            {
                id: "none_fallback_1",
                type: "none",
                weight: 5,
                text: ["今日は何もせずに過ごしました。", "のんびりとした一日でした。"],
                affection_delta: 0,
                money_delta: 0,
                special: false
            },
            {
                id: "none_fallback_2",
                type: "none",
                weight: 3,
                text: ["ぼーっと時間を過ごしました。", "特に何も起こりませんでした。"],
                affection_delta: -1,
                money_delta: 0,
                special: false
            }
        ];
    }
    
    /**
     * 指定タイプのイベント数を取得する
     * @param {string} type - イベントタイプ
     * @returns {number} イベント数
     */
    getEventCount(type) {
        if (!this.isLoaded) {
            return 0;
        }
        
        return this.events.filter(event => event.type === type).length;
    }
    
    /**
     * 全イベントデータを取得する（デバッグ用）
     * @returns {Array} 全イベントデータ
     */
    getAllEvents() {
        return [...this.events];
    }
    
    /**
     * イベントシステムが正常に初期化されているかチェックする
     * @returns {boolean} 初期化状態
     */
    isReady() {
        return this.isLoaded && this.events.length > 0;
    }
}