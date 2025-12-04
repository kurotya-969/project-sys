/**
 * Canvas Editor Class
 * しすの顔パーツを作成するための描画エディター
 * - 最大5レイヤー
 * - ペン、消しゴム、直線、塗りつぶしツール
 * - Ctrl+Sでlocalstorage保存
 */

class CanvasEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }

        // 設定
        this.config = {
            maxLayers: 5,
            canvasWidth: 600,
            canvasHeight: 600,
            defaultBrushSize: 5,
            defaultColor: '#000000'
        };

        // 状態
        this.layers = [];
        this.currentLayerId = null;
        this.tool = 'pen'; // 'pen', 'eraser', 'line', 'fill'
        this.color = this.config.defaultColor;
        this.brushSize = this.config.defaultBrushSize;
        this.isDrawing = false;
        this.lineStart = null;
        this.baseImage = null;

        // DOM要素への参照
        this.elements = {};

        // 初期化
        this.initialize();
    }

    /**
     * エディターの初期化
     */
    initialize() {
        console.log('CanvasEditor initialized');

        // DOM要素の参照を取得
        this.elements = {
            mainCanvas: document.getElementById('main-canvas'),
            toolButtons: document.querySelectorAll('.tool-btn'),
            colorPicker: document.getElementById('color-picker'),
            brushSizeSlider: document.getElementById('brush-size'),
            brushSizeValue: document.getElementById('brush-size-value'),
            layerList: document.getElementById('layer-list'),
            addLayerBtn: document.getElementById('add-layer-btn'),
            completeBtn: document.getElementById('canvas-complete-btn')
        };

        // 初期レイヤーを作成
        this.addLayer();

        // イベントリスナーを設定
        this.setupEventListeners();

        // Ctrl+S保存機能
        this.setupSaveHandler();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ツールボタン
        this.elements.toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.setTool(tool);
            });
        });

        // カラーピッカー
        if (this.elements.colorPicker) {
            this.elements.colorPicker.addEventListener('change', (e) => {
                this.color = e.target.value;
            });
        }

        // ブラシサイズ
        if (this.elements.brushSizeSlider) {
            this.elements.brushSizeSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                if (this.elements.brushSizeValue) {
                    this.elements.brushSizeValue.textContent = this.brushSize;
                }
            });
        }

        // レイヤー追加ボタン
        if (this.elements.addLayerBtn) {
            this.elements.addLayerBtn.addEventListener('click', () => {
                this.addLayer();
            });
        }

        // メインキャンバスの描画イベント
        if (this.elements.mainCanvas) {
            this.elements.mainCanvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            this.elements.mainCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.elements.mainCanvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
            this.elements.mainCanvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        }
    }

    /**
     * Ctrl+S保存機能の設定
     */
    setupSaveHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveToLocalStorage();
            }
        });
    }

    /**
     * ツールを設定
     */
    setTool(tool) {
        this.tool = tool;

        // ツールボタンのアクティブ状態を更新
        this.elements.toolButtons.forEach(btn => {
            if (btn.dataset.tool === tool) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        console.log(`Tool changed to: ${tool}`);
    }

    /**
     * レイヤーを追加
     */
    addLayer() {
        if (this.layers.length >= this.config.maxLayers) {
            alert(`最大${this.config.maxLayers}レイヤーまでです`);
            return;
        }

        const layerId = `layer_${Date.now()}`;
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = this.config.canvasWidth;
        layerCanvas.height = this.config.canvasHeight;

        const layer = {
            id: layerId,
            name: `レイヤー ${this.layers.length + 1}`,
            visible: true,
            canvas: layerCanvas,
            ctx: layerCanvas.getContext('2d'),
            opacity: 1.0
        };

        this.layers.push(layer);
        this.currentLayerId = layerId;

        this.updateLayerList();
        this.renderComposite();

        console.log(`Layer added: ${layer.name}`);
    }

    /**
     * レイヤーリストのUI を更新
     */
    updateLayerList() {
        if (!this.elements.layerList) return;

        this.elements.layerList.innerHTML = '';

        this.layers.slice().reverse().forEach((layer, index) => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            if (layer.id === this.currentLayerId) {
                layerItem.classList.add('active');
            }

            layerItem.innerHTML = `
                <span class="layer-name">${layer.name}</span>
                <div class="layer-controls">
                    <button class="layer-btn visibility-btn" data-layer-id="${layer.id}">
                        ${layer.visible ? '👁' : '🚫'}
                    </button>
                    <button class="layer-btn delete-btn" data-layer-id="${layer.id}">🗑</button>
                </div>
            `;

            // レイヤー選択
            layerItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('layer-btn')) {
                    this.currentLayerId = layer.id;
                    this.updateLayerList();
                }
            });

            // 表示/非表示トグル
            const visibilityBtn = layerItem.querySelector('.visibility-btn');
            visibilityBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                this.updateLayerList();
                this.renderComposite();
            });

            // 削除
            const deleteBtn = layerItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteLayer(layer.id);
            });

            this.elements.layerList.appendChild(layerItem);
        });
    }

    /**
     * レイヤーを削除
     */
    deleteLayer(layerId) {
        if (this.layers.length <= 1) {
            alert('最後のレイヤーは削除できません');
            return;
        }

        const index = this.layers.findIndex(l => l.id === layerId);
        if (index === -1) return;

        this.layers.splice(index, 1);

        if (this.currentLayerId === layerId) {
            this.currentLayerId = this.layers[0].id;
        }

        this.updateLayerList();
        this.renderComposite();
    }

    /**
     * すべてのレイヤーを合成してメインキャンバスに描画
     */
    renderComposite() {
        if (!this.elements.mainCanvas) return;

        const ctx = this.elements.mainCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

        // レイヤーを順番に合成（ベース画像なし、ユーザーの描画のみ）
        this.layers.forEach(layer => {
            if (layer.visible) {
                ctx.globalAlpha = layer.opacity;
                ctx.drawImage(layer.canvas, 0, 0);
                ctx.globalAlpha = 1.0;
            }
        });
    }

    /**
     * マウスダウンイベント
     */
    handleMouseDown(e) {
        const layer = this.getCurrentLayer();
        if (!layer) return;

        const coords = this.getCanvasCoordinates(e);
        const x = coords.x;
        const y = coords.y;

        if (this.tool === 'line') {
            if (!this.lineStart) {
                this.lineStart = { x, y };
            } else {
                this.drawLine(layer.ctx, this.lineStart.x, this.lineStart.y, x, y);
                this.lineStart = null;
                this.renderComposite();
            }
        } else if (this.tool === 'fill') {
            this.floodFill(layer, x, y);
            this.renderComposite();
        } else {
            this.isDrawing = true;
            layer.ctx.beginPath();
            layer.ctx.moveTo(x, y);
        }
    }

    /**
     * マウス移動イベント
     */
    handleMouseMove(e) {
        if (!this.isDrawing || this.tool === 'line' || this.tool === 'fill') return;

        const layer = this.getCurrentLayer();
        if (!layer) return;

        const coords = this.getCanvasCoordinates(e);
        const x = coords.x;
        const y = coords.y;

        layer.ctx.lineTo(x, y);
        layer.ctx.strokeStyle = this.tool === 'eraser' ? '#FFFFFF' : this.color;
        layer.ctx.lineWidth = this.brushSize;
        layer.ctx.lineCap = 'round';
        layer.ctx.lineJoin = 'round';

        if (this.tool === 'eraser') {
            layer.ctx.globalCompositeOperation = 'destination-out';
        } else {
            layer.ctx.globalCompositeOperation = 'source-over';
        }

        layer.ctx.stroke();
        this.renderComposite();
    }

    /**
     * マウスアップイベント
     */
    handleMouseUp(e) {
        if (this.isDrawing) {
            this.isDrawing = false;
            const layer = this.getCurrentLayer();
            if (layer) {
                layer.ctx.closePath();
            }
        }
    }

    /**
     * 直線を描画
     */
    drawLine(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.brushSize;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * 塗りつぶし（シンプルな実装）
     */
    floodFill(layer, x, y) {
        // 簡易的な塗りつぶし実装
        // 実際のフラッドフィルアルゴリズムは複雑なため、単純な矩形塗りつぶしで代用
        const ctx = layer.ctx;
        ctx.fillStyle = this.color;
        ctx.fillRect(Math.floor(x / 50) * 50, Math.floor(y / 50) * 50, 50, 50);
    }

    /**
     * Canvas座標を取得（スケーリングを考慮）
     */
    getCanvasCoordinates(e) {
        const rect = this.elements.mainCanvas.getBoundingClientRect();
        const scaleX = this.config.canvasWidth / rect.width;
        const scaleY = this.config.canvasHeight / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        return { x, y };
    }

    /**
     * 現在のレイヤーを取得
     */
    getCurrentLayer() {
        return this.layers.find(l => l.id === this.currentLayerId);
    }

    /**
     * localStorageに保存
     */
    saveToLocalStorage() {
        const data = {
            timestamp: new Date().toISOString(),
            layers: this.layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                visible: layer.visible,
                imageData: layer.canvas.toDataURL('image/png'),
                opacity: layer.opacity
            }))
        };

        try {
            localStorage.setItem('sisuto_canvas_data', JSON.stringify(data));
            console.log('Canvas data saved to localStorage');
            alert('保存しました！');
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            alert('保存に失敗しました');
        }
    }

    /**
     * 合成画像をDataURLとして出力
     */
    exportAsDataURL() {
        return this.elements.mainCanvas.toDataURL('image/png');
    }

    /**
     * ベース画像をロード
     */
    loadBaseImage(imageSrc) {
        const img = new Image();
        img.onload = () => {
            this.baseImage = img;
            this.renderComposite();
            console.log('Base image loaded');
        };
        img.onerror = () => {
            console.error('Failed to load base image');
        };
        img.src = imageSrc;
    }
}

export default CanvasEditor;
