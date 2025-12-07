/**
 * プロローグ管理システム
 * プロローグの表示とテキスト進行を管理する
 */

class PrologueManager {
    constructor(uiController, audioManager) {
        this.uiController = uiController;
        this.audioManager = audioManager;
        
        // プロローグテキストデータ
        this.prologueData = {
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
                "だから、その日まではそばにいさせてくれ。そばに、いてくれ。"
            ]
        };
        
        this.part1Index = 0;
        this.part2Index = 0;
    }

    /**
     * プロローグを初期化する
     */
    initialize() {
        // プロローグ前半の最初のテキストを表示
        this.showPart1Text();
    }

    /**
     * プロローグ前半のテキストを表示
     */
    showPart1Text() {
        const textElement = document.querySelector('.prologue-text');
        if (textElement && this.part1Index < this.prologueData.part1.length) {
            textElement.textContent = this.prologueData.part1[this.part1Index];
        }
    }

    /**
     * プロローグ前半の次のテキストへ進む
     */
    nextPart1Text() {
        this.part1Index++;
        
        if (this.part1Index < this.prologueData.part1.length) {
            this.showPart1Text();
        } else {
            // 全テキスト表示完了 → 後半プロローグへ
            console.log('プロローグ前半完了 → 後半へ遷移');
            this.part1Index = 0; // リセット
            this.uiController.showScreen('prologuePart2');
            this.audioManager.playBGM('normal');
            
            // 後半プロローグの最初のテキストを表示
            this.part2Index = 0;
            this.showPart2Text();
        }
    }

    /**
     * プロローグ後半のテキストを表示
     */
    showPart2Text() {
        const textElement = document.getElementById('prologue-part2-text');
        if (textElement && this.part2Index < this.prologueData.part2.length) {
            textElement.textContent = this.prologueData.part2[this.part2Index];
        }
    }

    /**
     * プロローグ後半の次のテキストへ進む
     * @param {Function} onComplete - 完了時のコールバック
     */
    nextPart2Text(onComplete) {
        this.part2Index++;
        
        if (this.part2Index < this.prologueData.part2.length) {
            this.showPart2Text();
        } else {
            // 全テキスト表示完了 → タイトル画面へ
            console.log('プロローグ後半完了 → タイトル画面へ');
            this.part2Index = 0; // リセット
            if (onComplete) {
                onComplete();
            }
        }
    }
}

export default PrologueManager;
