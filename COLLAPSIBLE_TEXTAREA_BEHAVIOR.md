# Collapsible Textarea Implementation Notes

This document describes the behavior and implementation details for collapsible textarea controls in the application.

## Overview

Collapsible textareas are UI controls that can be expanded or collapsed to show/hide their content. They are used in various modals throughout the application, such as:

- Shortcuts modal (`shortcuts-raw`)
- Writing Instruction Editor modal (`writing-instruction-text`)
- Character modal system prompts
- Memory modal

## Key Implementation Details

### 1. autoExpandTextarea Function

The `autoExpandTextarea` function (located in `app.js`) handles the auto-expanding behavior when users type in the textarea. **Critical**: It must save and restore the parent modal-body's scroll position to prevent the scrollbar from jumping.

```javascript
function autoExpandTextarea(textarea) {
  if (!textarea) return;
  const scrollContainer =
    textarea.closest(".system-prompt-list") || textarea.closest(".modal-body");
  const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
  // ... resize logic ...
  if (scrollContainer) {
    requestAnimationFrame(() => {
      scrollContainer.scrollTop = scrollTop;
    });
  }
}
```

### 2. setupModalTextareas Function

This function (in `app.js`) wraps textareas in collapsible containers and sets up the proper event handlers. It should be called when modals open:

```javascript
setupModalTextareas(editorModal);
```

The function automatically:

- Wraps the textarea in a `.textarea-collapse` container
- Creates a header with expand/collapse toggle
- Adds input and focus event handlers that call `autoExpandTextarea`
- Saves collapse state to localStorage when toggled

### 3. resetModalTextareaCollapseStates Function

This function resets textarea collapse states when modals open. Certain modals should be excluded to prevent scroll jumping issues:

```javascript
function resetModalTextareaCollapseStates(root = document) {
  if (!root) return;
  const modal = root.matches?.(".modal") ? root : root.closest?.(".modal");
  if (modal?.id === "character-modal") return;
  if (modal?.id === "memory-modal") return;
  if (modal?.id === "writing-instruction-editor-modal") return;
  // ... reset logic ...
}
```

### 4. Modal-Specific Behavior

#### Writing Instruction Editor Modal

The `writing-instruction-editor-modal` requires special handling because its textarea content editing caused scroll jumping issues.

**Problem**: When editing the textarea content, the modal-body's scroll position would jump to the top.

**Solution**:

1. Exclude the modal from `resetModalTextareaCollapseStates`
2. Let `setupModalTextareas` handle the event binding when the modal opens (called in `openWritingInstructionEditor`)

#### Shortcuts Modal

The `shortcuts-raw` textarea works correctly with the standard implementation because:

- `setupModalTextareas()` is called at initialization (line 1363)
- The modal is opened/closed without going through `resetModalTextareaCollapseStates`

## Best Practices

1. **Do not add direct event listeners** for textareas that need auto-expand behavior in `setupEvents()`. Instead, rely on `setupModalTextareas()` to handle this.

2. **Always save/restore scroll position** in `autoExpandTextarea` to prevent scroll jumping.

3. **Exclude special modals** from `resetModalTextareaCollapseStates` if they exhibit scroll jumping issues.

4. **Call setupModalTextareas** when opening modals that contain collapsible textareas to ensure proper initialization.

## File Locations

- `app.js` - Main application logic
- `style.css` - Styling for `.textarea-collapse`, `.textarea-collapse-header`, `.textarea-collapse-body`
- `index.html` - Modal definitions
