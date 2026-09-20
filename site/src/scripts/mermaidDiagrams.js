const defaultLoadMermaid = async () => (await import('mermaid')).default;

export const setupMermaidDiagrams = ({
  document,
  window,
  loadMermaid = defaultLoadMermaid
}) => {
  const mermaidLanguages = new Set(['mermaid', 'marmaid']);
  let mermaidModulePromise = null;
  let activeMermaidTheme = null;
  let pendingMermaidRender = false;
  let activeMermaidRender = null;

  const getMermaidTheme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default';

  const getMermaid = async () => {
    mermaidModulePromise ??= loadMermaid().catch((error) => {
      mermaidModulePromise = null;
      throw error;
    });

    return mermaidModulePromise;
  };

  const isMermaidCodeBlock = (pre) => {
    const language = pre.dataset.language?.toLowerCase();

    if (language && mermaidLanguages.has(language)) {
      return true;
    }

    return Boolean(pre.querySelector('code')?.className.match(/\blanguage-(mermaid|marmaid)\b/i));
  };

  const getDiagramSource = (pre) => (
    pre.querySelector('code')?.textContent ?? pre.textContent ?? ''
  ).trim();

  const createZoomButton = (label, title, onClick) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mermaid-control';
    button.textContent = label;
    button.title = title;
    button.setAttribute('aria-label', title);
    button.addEventListener('click', onClick);
    return button;
  };

  const setDiagramScale = (container, scale) => {
    const svg = container.querySelector('svg');

    if (!svg) {
      return;
    }

    const nextScale = Math.min(2.5, Math.max(0.5, scale));
    container.dataset.zoom = String(nextScale);
    svg.style.transform = `scale(${nextScale})`;
    svg.style.transformOrigin = 'center top';
    svg.style.marginBlock = nextScale === 1 ? '' : `${(nextScale - 1) * 1.5}rem`;
  };

  const openDiagramLightbox = (container) => {
    const svg = container.querySelector('svg');

    if (!svg) {
      return;
    }

    const dialog = document.createElement('dialog');
    dialog.className = 'mermaid-lightbox';
    dialog.setAttribute('aria-label', 'Full Mermaid diagram view');

    const toolbar = document.createElement('div');
    toolbar.className = 'mermaid-lightbox-toolbar';
    const closeButton = createZoomButton('Close', 'Close full diagram view', () => dialog.close());
    toolbar.append(closeButton);

    const diagram = document.createElement('div');
    diagram.className = 'mermaid-lightbox-diagram';
    const lightboxSvg = svg.cloneNode(true);
    lightboxSvg.style.transform = 'none';
    lightboxSvg.style.margin = '0';
    diagram.append(lightboxSvg);

    const closeOnBackdrop = (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    };

    dialog.append(toolbar, diagram);
    dialog.addEventListener('click', closeOnBackdrop);
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    document.body.append(dialog);
    dialog.showModal();
  };

  const enhanceMermaidContainer = (container) => {
    if (container.dataset.controlsReady === 'true' || !container.querySelector('svg')) {
      return;
    }

    const shell = document.createElement('div');
    shell.className = 'mermaid-shell';
    container.replaceWith(shell);
    shell.append(container);

    const toolbar = document.createElement('div');
    toolbar.className = 'mermaid-toolbar';
    const zoomLabel = document.createElement('span');
    zoomLabel.className = 'mermaid-zoom-label';
    zoomLabel.textContent = '100%';
    const updateZoomLabel = () => {
      zoomLabel.textContent = `${Math.round(Number(container.dataset.zoom ?? 1) * 100)}%`;
    };
    const changeScale = (amount) => {
      setDiagramScale(container, Number(container.dataset.zoom ?? 1) + amount);
      updateZoomLabel();
    };

    toolbar.append(
      createZoomButton('-', 'Zoom out diagram', () => changeScale(-0.25)),
      zoomLabel,
      createZoomButton('+', 'Zoom in diagram', () => changeScale(0.25)),
      createZoomButton('Reset', 'Reset diagram zoom', () => {
        setDiagramScale(container, 1);
        updateZoomLabel();
      }),
      createZoomButton('Full view', 'Open diagram in full view', () => openDiagramLightbox(container))
    );
    shell.insertBefore(toolbar, container);
    container.dataset.controlsReady = 'true';
    setDiagramScale(container, 1);
  };

  const ensureMermaidContainers = (theme) => {
    const containers = [];

    document.querySelectorAll('pre').forEach((pre) => {
      if (!isMermaidCodeBlock(pre)) {
        return;
      }

      const source = getDiagramSource(pre);

      if (!source) {
        return;
      }

      const container = document.createElement('div');
      container.className = 'mermaid';
      container.dataset.source = source;
      container.textContent = source;
      pre.replaceWith(container);
      containers.push(container);
    });

    document.querySelectorAll('.mermaid[data-source]').forEach((container) => {
      const source = container.dataset.source;

      if (!source || container.dataset.renderedTheme === theme) {
        return;
      }

      container.textContent = source;
      containers.push(container);
    });

    return containers.filter((container, index, items) => items.indexOf(container) === index);
  };

  const renderMermaidDiagrams = async () => {
    const theme = getMermaidTheme();
    const containers = ensureMermaidContainers(theme);

    if (!containers.length) {
      return;
    }

    const mermaid = await getMermaid();

    if (activeMermaidTheme !== theme) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme
      });
    }

    try {
      await mermaid.run({ nodes: containers });
      activeMermaidTheme = theme;
    } catch (error) {
      activeMermaidTheme = null;
      containers.forEach((container) => {
        const source = container.dataset.source;

        if (!source) {
          return;
        }

        container.dataset.renderError = 'true';
        container.textContent = `Mermaid diagram could not be rendered.\n\n${source}`;
      });
      throw error;
    }

    containers.forEach((container) => {
      container.dataset.renderedTheme = theme;
      delete container.dataset.renderError;
      enhanceMermaidContainer(container);
    });
  };

  const scheduleMermaidRender = () => {
    if (activeMermaidRender) {
      pendingMermaidRender = true;
      return;
    }

    pendingMermaidRender = false;
    activeMermaidRender = renderMermaidDiagrams()
      .catch((error) => {
        console.error('Failed to render Mermaid diagrams.', error);
      })
      .finally(() => {
        activeMermaidRender = null;

        if (pendingMermaidRender) {
          scheduleMermaidRender();
        }
      });
  };

  const mermaidDocument = document;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleMermaidRender, { once: true });
  } else {
    scheduleMermaidRender();
  }

  if (!mermaidDocument.__modernizationKitMermaidListenersRegistered) {
    document.addEventListener('astro:page-load', scheduleMermaidRender);
    document.addEventListener('modernization-kit-theme-change', scheduleMermaidRender);
    mermaidDocument.__modernizationKitMermaidListenersRegistered = true;
  }

  return {
    scheduleMermaidRender
  };
};
