# 3D VRM Model Support Implementation

## Overview
Added support for 3D VRM/GLB/GLTF model display in chat view with a floating draggable/resizable panel.

## Files Modified

### index.html
- Added import map for Three.js and three-vrm library
- Added "3D" tab button in character modal (`char-model3d-tab-btn`)
- Added `.model3d-field` section in modal body for uploading 3D models
- Added 3D panel container (`model3d-panel`) inside `#chat-view`
- Added toggle button in chat header (`toggle-model3d-panel-btn`)
- Added four resize handles (NW, NE, SW, SE) for the panel
- Added script tag for `three-vrm-loader.js` module

### style.css
- Added styles for `.model3d-field` section (toolbar, preview, info display)
- Added styles for `#model3d-panel` (floating panel with drag handle)
- Added styles for `.model3d-panel-header` (draggable header)
- Added styles for resize handles (NW, NE, SW, SE corners)
- Added `.is-active` style for `#toggle-model3d-panel-btn` (highlighted state)

### app.js
- Added `charModalCache` and `charModalModel3d` state variables
- Added `model3dTabBtn` event listener for 3D tab
- Added `model3d` field to save payload in `saveCharacterFromModal()`
- Added cases for "model3d" tab in `setCharacterModalTab()`
- Added `renderModel3DPreview()`, `handleModel3DUpload()`, `removeModel3D()`
- Added `toggleModel3DPanel()`, `showModel3DPanel()`, `hideModel3DPanel()`
- Added `updateModel3DToggleButton()`
- Added `persistModel3DPanelState()` - saves panel state to thread
- Added `restoreModel3DPanelState()` - restores panel state from thread
- Added `loadModel3DFromCharacter()` - converts base64 to blob and loads
- Added `initModel3DPanelDragResize()` - drag and resize logic
- Added `constrainModel3DPanelPosition()` - keeps panel in bounds
- Added `adjustModel3DPanelForPaneChange()` - adjusts position when pane toggles
- Added `model3dPanelState` object tracking drag/resize state
- Added `model3d-close-btn` and `toggle-model3d-panel-btn` event listeners
- Added `model3d-toggle-visibility-btn` event listener (toggles model visibility)
- Updated `openThread()` to call `hideModel3DPanel()` and `restoreModel3DPanelState()`
- Updated `saveCharacterFromModal()` to update 3D panel when character edited
- Updated `togglePane()` to call `adjustModel3DPanelForPaneChange()`
- Updated `init()` to call `initModel3DPanelDragResize()`
- Updated `closeActiveModal()` to reset modal 3D state

### db.js
- Added database version 23 with `model3d` field migration for characters

### three-vrm-loader.js (NEW FILE)
- ES module using Three.js + @pixiv/three-vrm
- `Model3DLoader` class with:
  - `init(canvasId)` - initializes Three.js scene, camera, renderer, OrbitControls
  - `loadModel(blob)` - loads VRM model, centers on ground (feet at y=0)
  - `startAnimationLoop()` - animation loop with VRM update
  - `setVisible(visible)` - shows/hides model
  - `disposeVRM()` - cleans up VRM resources
  - `dispose()` - cleans up all resources
  - `resize(width, height)` - resizes renderer
- Exports: `loadModel3D`, `setModel3DVisible`, `disposeModel3D`, `resizeModel3D`
- Added: `getModel3DCameraState()`, `restoreModel3DCameraState()`
- Window exposure of all functions for app.js access

### locales/*.json (all language files)
- Added translation keys for 3D features:
  - `model3dTab`, `addModel3d`, `noModel3dSelected`
  - `removeModel3d`, `model3dPanelTitle`, `toggleModel3dPanel`
  - `toggleModel3dVisibility`, `closeModel3dPanel`
  - `loadingModel3d`, `failedToLoadModel3d`, `unsupportedFileType`

## Features Implemented

### 1. Character Modal - 3D Tab
- Upload VRM/GLB/GLTF files via file input
- Preview shows filename when model uploaded
- Remove button to delete model
- Model stored as base64 in character.model3d.data

### 2. Floating 3D Panel
- Draggable by header (title bar)
- Resizable from all four corners (NW, NE, SW, SE)
- Position/size constrained within chat view bounds
- Toggle button in chat header (shows only when character has model)
- Close button (X) in panel header
- Show/Hide model visibility button (eye icon)

### 3. Panel State Persistence (per thread)
Stored in `thread.model3dPanel`:
- `visible` - panel visibility state
- `left`, `top` - panel position
- `width`, `height` - panel size
- `chatViewWidth` - chat view width when saved (for validation)
- `camera` - camera position and target for restoration

### 4. Three.js/VRM Features
- Orbit controls: Left-drag rotate, Right-drag pan, Scroll zoom
- Ground plane for spatial reference
- Ambient and directional lighting
- VRM model auto-centered with feet at ground level
- Proper resource cleanup on dispose

### 5. UI Behavior
- Toggle button highlighted when panel is hidden (inverted visual cue)
- Panel hides when switching threads
- Panel position adjusts when left pane is collapsed/expanded
- Panel position constrained to viewport on window resize
- Edit character modal changes reflect in real-time in chat

## Current Toggle Button Logic
- **Button highlighted (blue glow)**: Panel is HIDDEN (3D enabled but not shown)
- **Button normal**: Panel is VISIBLE (model displayed)
- Clicking toggle: Opens panel, removes highlight
- Clicking close (X): Closes panel, adds highlight
- Clicking visibility (eye): Shows/hides model without closing panel

## Known Behaviors
1. Panel position stored relative to chat view (not viewport)
2. If chat view width changes >100px, position not restored
3. Camera state (rotation/zoom) persists per thread
4. Four-corner resize handles with visual indicators

## Database Schema
```javascript
// db.js version 23
characters: {
  model3d: {
    name: string,      // filename
    type: string,      // vrm, glb, gltf
    size: number,      // file size
    data: string       // base64 encoded
  }
}

threads: {
  model3dPanel: {
    visible: boolean,
    left: number,
    top: number,
    width: number,
    height: number,
    chatViewWidth: number,
    camera: {
      position: { x, y, z },
      target: { x, y, z }
    }
  }
}
```

## Libraries (via CDN import map)
```
three: https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js
three/addons/: https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/
@pixiv/three-vrm: https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@3/lib/three-vrm.module.min.js
```

## Future Enhancements (Not Implemented)
- Animated model reactions to messages
- Model expression control
- Lighting adjustments
- Background color/gradient customization
- Multiple model support
- Import models from URL
