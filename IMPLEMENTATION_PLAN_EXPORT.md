# Implementation Plan: Selective Database Export Modal

## Status: IMPLEMENTED

## 1. What Was Implemented

### Files Modified

1. **index.html** - Added `export-select-modal` with sections for:
   - Settings (single checkbox)
   - Characters (one per character)
   - Threads (one per thread, depends on characters)
   - Personas (one per persona)
   - Lorebooks (one per lorebook)
   - Shortcuts (single checkbox)
   - Tags (list from characters)
   - Writing Instructions (one per instruction)
   - Assets (one per asset)

2. **app.js** - Added functions:
   - `openExportSelectModal()` - Opens modal and loads data
   - `renderExportSelectSections()` - Renders checkbox sections
   - `handleExportSectionChange()` - Handles character/thread dependencies
   - `getExportSelections()` - Collects selected checkboxes
   - `exportSelectedData()` - Exports selected data with file save dialog
   - `buildSelectiveExportPayload()` - Builds export payload

3. **locales/*.json** - All 6 locale files updated with:
   - exportSelectTitle, exportAllSettings, exportSectionSettings
   - exportSectionCharacters, exportSectionThreads, exportSectionPersonas
   - exportSectionLorebooks, exportSectionShortcuts, exportSectionTags
   - exportSectionWritingInstructions, exportSectionAssets
   - exportSelectExport, exportSelectCancel, deletedCharacter
   - noThreads, unnamedCharacter, untitledThread
   - unnamedPersona, unnamedLorebook, unnamedWritingInstruction
   - unnamedAsset, exportSelectAtLeastOne

4. **style.css** - Added styles for:
   - `#export-select-modal .modal-body` - scrollable area
   - `.export-section` - fieldset styling
   - `.export-checkbox` - checkbox label styling

## 2. Dependencies Implemented

| Section | Depends On | Behavior |
|---------|-----------|----------|
| **Threads** | Characters | If character checkbox unchecked → threads disabled |

Tags are displayed but have a simplified implementation - they show all unique tags from all characters and are enabled only when any character has that tag.

## 3. File Save Dialog

Uses File System Access API (`showSaveFilePicker`) with fallback to blob download for unsupported browsers.

## 4. Not Included

The following were not in user requirements:
- Sessions table
- Memories table
- Themes table
- Click-outside-to-close (uses existing close button)

## 5. Export Schema

```
{
  schema: "rp-db-backup-v1-selective",
  exportedAt: "ISO date",
  dbName: "rp-llm-backend-db",
  dbVersion: number,
  tables: { characters, threads, personas, lorebooks, writingInstructions, assets },
  localStorage: { "rp-*": "..." }
}
```

The export uses the same schema as full backup but only includes selected items.