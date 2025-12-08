# Requirements Document

## Introduction

通常エンド（normal_end）の本実装を行います。このエンディングは、好感度とお金の目標を達成せず、かつworldendにも移行しなかった場合に表示されるエンディングです。現在、シナリオがmain.jsとendingManager.jsの両方に重複して記載されており、バグの原因となっています。また、シナリオの内容が不十分であるため、情景描写と感情移入を強化する必要があります。

## Glossary

- **通常エンド（normal_end）**: 好感度とお金の目標を達成せず、worldendにも移行しなかった場合のエンディング
- **しす**: 主人公が作成したアンドロイドキャラクター
- **worldend**: 連続10回何もしない行動を取った場合のバッドエンド
- **main.js**: ゲームのメインエントリーポイントとなるJavaScriptファイル
- **endingManager.js**: エンディング表示と演出を管理するJavaScriptファイル
- **BGM**: 背景音楽（Background Music）
- **エンド前背景**: エンディングシナリオ表示時の背景画像

## Requirements

### Requirement 1

**User Story:** As a developer, I want to consolidate the normal ending scenario code into a single location, so that the code is maintainable and bug-free.

#### Acceptance Criteria

1. WHEN the normal ending is triggered THEN the system SHALL execute the scenario from main.js only
2. WHEN the endingManager.js file is reviewed THEN the system SHALL NOT contain duplicate normal ending scenario code
3. WHEN the showNormalEndingEvent function is called THEN the system SHALL execute without conflicts or duplicate event listeners

### Requirement 2

**User Story:** As a player, I want to experience an emotionally engaging normal ending scenario, so that I feel satisfied with the story conclusion even when goals are not achieved.

#### Acceptance Criteria

1. WHEN the normal ending scenario is displayed THEN the system SHALL present sufficient descriptive text for emotional immersion
2. WHEN the scenario progresses THEN the system SHALL convey a guardian-like relationship between the protagonist and しす
3. WHEN the scenario concludes THEN the system SHALL create a sense of unresolved daily life that is distinct from both the perfect ending and the worldend
4. WHEN the scenario text is displayed THEN the system SHALL include at least 15 dialogue segments to provide adequate narrative depth

### Requirement 3

**User Story:** As a player, I want the normal ending to have appropriate audio-visual presentation, so that the ending feels complete and polished.

#### Acceptance Criteria

1. WHEN the normal ending scenario begins THEN the system SHALL play the BGM file "yoisyo.mp3"
2. WHEN the normal ending scenario is displayed THEN the system SHALL show the background image "normal.jpg"
3. WHEN the character sprite is displayed THEN the system SHALL maintain the existing UI without changes
4. WHEN the BGM plays THEN the system SHALL loop the audio continuously until the ending screen transition

### Requirement 4

**User Story:** As a developer, I want the normal ending to integrate seamlessly with the existing game flow, so that players experience a smooth transition.

#### Acceptance Criteria

1. WHEN the game reaches day 20 without meeting goals THEN the system SHALL trigger the normal ending check
2. WHEN the normal ending is triggered THEN the system SHALL transition from the event screen to the ending screen
3. WHEN the auto-advance feature is enabled THEN the system SHALL automatically progress through dialogue segments
4. WHEN the final dialogue is displayed THEN the system SHALL transition to the ending title screen after a delay
