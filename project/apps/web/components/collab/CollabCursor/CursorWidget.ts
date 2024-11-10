import * as monaco from 'monaco-editor';

class CursorWidget implements monaco.editor.IContentWidget {
  private domNode: HTMLDivElement;
  private position: monaco.Position;
  private id: string;

  constructor(
    private editor: monaco.editor.IStandaloneCodeEditor,
    private username: string,
    private color: string,
    clientId: number,
  ) {
    this.id = `cursor-widget-${clientId}`;
    this.position = new monaco.Position(1, 1);
    this.domNode = document.createElement('div');
    this.domNode.className = 'cursor-widget';
    this.domNode.style.cssText = `
        background-color: ${color};
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        position: absolute;
        white-space: nowrap;
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      `;
    this.domNode.textContent = username;
  }

  getId(): string {
    return this.id;
  }

  getDomNode(): HTMLElement {
    return this.domNode;
  }

  getPosition(): monaco.editor.IContentWidgetPosition | null {
    return {
      position: this.position,
      preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE],
    };
  }

  updatePosition(position: monaco.Position): void {
    this.position = position;
    this.editor.layoutContentWidget(this);
  }
}

export default CursorWidget;
