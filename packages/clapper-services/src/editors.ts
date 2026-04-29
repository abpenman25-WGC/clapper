export enum EditorView {
  PROJECT = "PROJECT",
  SCRIPT = "SCRIPT",
  ENTITY = "ENTITY",
  SEGMENT = "SEGMENT",
  HISTORY = "HISTORY",
  WORKFLOW = "WORKFLOW",
  PROMPT_BOOK = "PROMPT_BOOK",
}

export type EditorsState = {
  view: EditorView
}

export type EditorsControls = {
  setView: (editorView: EditorView) => void
}

export type EditorsStore = EditorsState & EditorsControls
