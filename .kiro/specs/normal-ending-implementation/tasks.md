# 実装計画

- [x] 1. endingManager.jsから重複コードを削除





  - endingManager.jsからshowNormalEndingEvent()メソッドを削除
  - endingManager.jsからshowFinalNormalEndingAndTitle()メソッドを削除
  - setEndingBackground()とclearEndingBackground()メソッドが残っていることを確認
  - _要件: 1.1, 1.2, 1.3_

- [x] 2. main.jsの通常エンドシナリオを強化





  - [x] 2.1 showNormalEndingEvent()内のdialogues配列を更新


    - 20以上のセグメントを持つ新しいdialogue配列を作成
    - 構成: オープニング（絶望）→ しすの介入 → 励まし → 提案 → 感情的クライマックス → 解決
    - 主人公としすの保護者的な関係性を強調
    - perfect_endやworldendとは異なる、すっきりしない日常感を表現
    - _要件: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.2 BGM設定を更新


    - audioManager.playBGM()が第一引数に'yoisyo'で呼び出されていることを確認
    - loopパラメータがtrueに設定されていることを確認
    - _要件: 3.1, 3.4_

  - [x] 2.3 背景画像設定を更新


    - setEndingBackground()が'assets/images/normal.jpg'で呼び出されていることを確認
    - _要件: 3.2_

  - [x] 2.4 自動送り機能の統合を確認


    - isAutoAdvanceEnabledフラグが正しくチェックされていることを確認
    - autoAdvanceTimerが適切な遅延（2000ms）で設定されていることを確認
    - ユーザーが手動で進めた場合にタイマーがクリアされることを確認
    - _要件: 4.3_

- [x] 3. audioManagerのBGMマッピングを確認




  - audioManager.jsのBGM設定に'yoisyo'キーが存在するか確認
  - 存在しない場合、'yoisyo' → 'assets/audio/yoisyo.mp3'のマッピングを追加
  - _要件: 3.1_

- [ ] 4. 実装をテスト
  - [ ]* 4.1 コード統合のユニットテストを作成
    - showNormalEndingEventがmain.jsにのみ存在することをテスト
    - endingManager.jsに重複メソッドが含まれていないことをテスト
    - _要件: 1.1, 1.2_

  - [ ]* 4.2 シナリオ内容のユニットテストを作成
    - dialogue配列が少なくとも15要素を含むことをテスト
    - BGMパラメータが'yoisyo'であることをテスト
    - 背景画像パスが'assets/images/normal.jpg'であることをテスト
    - _要件: 2.4, 3.1, 3.2_

  - [ ]* 4.3 コード統合のプロパティテストを作成
    - **プロパティ1: コード統合**
    - **検証: 要件 1.1, 1.2, 1.3**

  - [ ]* 4.4 シナリオ深度のプロパティテストを作成
    - **プロパティ2: シナリオ深度**
    - **検証: 要件 2.4**

  - [ ]* 4.5 完全フローの統合テストを作成
    - showEnding('normal_end')から最終エンディング画面までのフローをテスト
    - 自動送り機能をテスト
    - ダイアログの手動進行をテスト
    - _要件: 4.1, 4.2, 4.3, 4.4_

- [ ] 5. チェックポイント - すべてのテストが通ることを確認
  - すべてのテストが通ることを確認し、質問があればユーザーに尋ねる。
