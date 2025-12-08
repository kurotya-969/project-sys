# Design Document

## Overview

This design document outlines the implementation of the normal ending (normal_end) for the visual novel game. The normal ending is triggered when the player completes 20 days without achieving the affection or money goals, and without triggering the worldend (bad ending). The current implementation has duplicate code in both main.js and endingManager.js, which needs to be consolidated. Additionally, the scenario content needs to be enhanced to provide better emotional engagement and narrative depth.

## Architecture

The normal ending implementation follows the existing game architecture:

1. **Ending Trigger**: The ending is triggered from the `finishDay()` function in main.js when day 20 is reached
2. **Scenario Display**: The scenario is displayed using the event screen system with dialogue progression
3. **Final Screen**: After the scenario completes, the player is transitioned to the ending screen with title and summary text
4. **Audio-Visual**: Background music (yoisyo.mp3) and background image (normal.jpg) are applied during the scenario

## Components and Interfaces

### Modified Components

#### main.js
- **showNormalEndingEvent()**: Main function that orchestrates the normal ending scenario
  - Displays dialogue segments sequentially
  - Handles auto-advance functionality
  - Transitions to final ending screen
- **showFinalNormalEndingAndTitle()**: Displays the final ending screen with title and text
- **showEnding()**: Entry point that routes to showNormalEndingEvent() when endingType is 'normal_end'

#### endingManager.js
- **Remove duplicate code**: The showNormalEndingEvent() and showFinalNormalEndingAndTitle() methods will be removed from this file
- **Keep utility methods**: setEndingBackground() and clearEndingBackground() remain as they are used by multiple endings

### Data Flow

```
finishDay() 
  → checkEndingCondition() 
  → showEnding('normal_end') 
  → showNormalEndingEvent() 
  → showFinalNormalEndingAndTitle()
```

## Data Models

### Dialogue Array Structure

```javascript
const dialogues = [
  // String array containing scenario text
  // Each element is displayed sequentially
  // Minimum 15 segments for adequate narrative depth
];
```

### Auto-Advance State

```javascript
// Global variable in main.js
let isAutoAdvanceEnabled = false;
let autoAdvanceTimer = null;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Code Consolidation
*For any* call to showNormalEndingEvent, the function should only exist in main.js and not in endingManager.js
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Scenario Depth
*For any* normal ending scenario, the dialogue array should contain at least 15 text segments
**Validates: Requirements 2.4**

### Property 3: Audio Playback
*For any* normal ending trigger, the BGM "yoisyo.mp3" should be playing with loop enabled
**Validates: Requirements 3.1, 3.4**

### Property 4: Background Display
*For any* normal ending scenario display, the background image should be set to "normal.jpg"
**Validates: Requirements 3.2**

### Property 5: Screen Transition
*For any* normal ending completion, the system should transition from event screen to ending screen
**Validates: Requirements 4.2, 4.4**

## Error Handling

### Missing Audio Files
- If yoisyo.mp3 is not found, the audioManager will log an error but continue execution
- The game will proceed without BGM rather than crashing

### Missing Background Image
- If normal.jpg is not found, the browser will display a broken image icon
- The scenario text will still be readable

### Event Listener Conflicts
- Use button cloning technique to reset event listeners before attaching new ones
- This prevents duplicate event listener issues

## Testing Strategy

### Unit Tests
- Test that showNormalEndingEvent() exists only in main.js
- Test that dialogue array contains at least 15 elements
- Test that BGM is set to 'yoisyo' when normal ending is triggered
- Test that background image path is set correctly

### Property-Based Tests
Property-based testing will be used to verify the correctness properties defined above. We will use a JavaScript property-based testing library such as fast-check.

Each property-based test should:
- Run a minimum of 100 iterations
- Be tagged with a comment referencing the specific correctness property from this design document
- Use the format: `// Feature: normal-ending-implementation, Property {number}: {property_text}`

### Integration Tests
- Test the complete flow from finishDay() through to ending screen display
- Test auto-advance functionality with normal ending
- Test manual progression through dialogue segments

## Enhanced Scenario Content

The new scenario will emphasize:

1. **Guardian Relationship**: しす takes on a more protective, guardian-like role compared to other endings
2. **Unresolved Daily Life**: The ending doesn't provide complete closure like perfect_end, but also doesn't represent complete escape like worldend
3. **Emotional Depth**: Increased descriptive text to create emotional immersion
4. **Character Development**: Show the protagonist's internal struggle and しす's supportive nature

### Scenario Structure (20+ segments)

1. **Opening (Protagonist's despair)**: 4-5 segments establishing the protagonist's sense of failure
2. **しす's Intervention**: 3-4 segments where しす notices and approaches the protagonist
3. **しす's Encouragement**: 3-4 segments where しす provides emotional support
4. **しす's Proposal**: 2-3 segments where しす suggests a way forward
5. **Emotional Climax**: 4-5 segments showing the protagonist's emotional response
6. **Resolution**: 2-3 segments showing acceptance and moving forward together

This structure provides approximately 18-24 dialogue segments, exceeding the minimum requirement of 15.

## Implementation Notes

### Code Removal from endingManager.js
The following methods will be removed:
- `showNormalEndingEvent()`
- `showFinalNormalEndingAndTitle()`

The following methods will be retained:
- `setEndingBackground(imagePath)`
- `clearEndingBackground()`
- All other ending-related methods

### BGM Configuration
The audioManager should already support 'yoisyo' as a BGM key. If not, it needs to be added to the BGM mapping in audioManager.js.

### Background Image
The background image 'normal.jpg' will be manually added to assets/images/ directory by the user after implementation.

### Auto-Advance Integration
The existing auto-advance system (isAutoAdvanceEnabled flag) will be used without modification. The scenario will respect this setting and automatically progress when enabled.
