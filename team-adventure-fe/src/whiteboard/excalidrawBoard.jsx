import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Excalidraw, MainMenu, WelcomeScreen, getSceneVersion } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

const DEFAULT_APP_STATE = {
  viewBackgroundColor: '#ffffff',
  currentItemFontFamily: 1
};

export class ExcalidrawBoardHost {
  constructor(socket) {
    this.socket = socket;
    this.root = null;
    this.api = null;
    this.boardId = null;
    this.pendingScene = null;
    this.suppressChange = false;
    this.listeners = new EventTarget();

    this.socket.on('board-state', board => this.receiveBoard(board));
    this.socket.on('board-updated', board => this.receiveBoard(board));
  }

  mount(container) {
    this.root = createRoot(container);
    this.root.render(
      <BoardApp
        host={this}
        onApi={api => {
          this.api = api;
          if (this.pendingScene) {
            this.applyScene(this.pendingScene);
            this.pendingScene = null;
          }
        }}
      />
    );
  }

  open(boardId) {
    this.boardId = boardId;
    this.socket.send('open-board', { boardId });
    this.listeners.dispatchEvent(new CustomEvent('board-opened', { detail: boardId }));
  }

  onChange(listener) {
    this.listeners.addEventListener('board-opened', event => listener(event.detail));
  }

  handleLocalChange(elements, appState, files) {
    if (!this.boardId || this.suppressChange) {
      return;
    }

    const scene = toScene(elements, appState, files);
    this.socket.send('update-board', {
      boardId: this.boardId,
      scene,
      version: getSceneVersion(elements)
    });
  }

  receiveBoard(board) {
    if (!board || board.boardId !== this.boardId) {
      return;
    }

    if (!this.api) {
      this.pendingScene = board.scene;
      return;
    }

    this.applyScene(board.scene);
  }

  applyScene(scene) {
    const data = normalizeScene(scene);
    this.suppressChange = true;
    this.api.updateScene({
      elements: data.elements,
      appState: data.appState,
      collaborators: new Map()
    });

    if (data.files && Object.keys(data.files).length > 0 && this.api.addFiles) {
      this.api.addFiles(Object.values(data.files));
    }

    window.setTimeout(() => {
      this.suppressChange = false;
    }, 0);
  }
}

function BoardApp({ host, onApi }) {
  const saveTimer = useRef(null);
  const [activeBoardId, setActiveBoardId] = useState(null);

  useEffect(() => {
    host.onChange(setActiveBoardId);
  }, [host]);

  const initialData = useMemo(() => ({
    elements: [],
    appState: DEFAULT_APP_STATE,
    files: {}
  }), []);

  return (
    <div className="excalidraw-board">
      <Excalidraw
        excalidrawAPI={onApi}
        initialData={initialData}
        isCollaborating={Boolean(activeBoardId)}
        onChange={(elements, appState, files) => {
          window.clearTimeout(saveTimer.current);
          saveTimer.current = window.setTimeout(() => {
            host.handleLocalChange(elements, appState, files);
          }, 300);
        }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.SaveToActiveFile />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.Help />
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo />
            <WelcomeScreen.Center.Heading>
              {activeBoardId ? `Board: ${activeBoardId}` : 'Team Adventure Board'}
            </WelcomeScreen.Center.Heading>
            <WelcomeScreen.Center.Menu>
              <WelcomeScreen.Center.MenuItemHelp />
            </WelcomeScreen.Center.Menu>
          </WelcomeScreen.Center>
        </WelcomeScreen>
      </Excalidraw>
    </div>
  );
}

function normalizeScene(scene) {
  return {
    elements: Array.isArray(scene?.elements) ? scene.elements : [],
    appState: {
      ...DEFAULT_APP_STATE,
      ...(scene?.appState || {})
    },
    files: scene?.files || {}
  };
}

function toScene(elements, appState, files) {
  const {
    collaborators,
    selectedElementIds,
    selectedGroupIds,
    editingElement,
    editingGroupId,
    activeEmbeddable,
    ...persistableAppState
  } = appState || {};

  return {
    type: 'excalidraw',
    version: 2,
    source: 'team-adventure',
    elements,
    appState: {
      ...persistableAppState,
      selectedElementIds: {},
      selectedGroupIds: {}
    },
    files: files || {}
  };
}
