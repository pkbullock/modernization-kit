const defaultLoadMermaid = async () => (await import('mermaid')).default;

export const setupMermaidDiagrams = ({
  document,
  window,
  loadMermaid = defaultLoadMermaid
}) => {
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const controlIcons = {
    zoomOut: [
      { d: 'M5 10h10', fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-width': '1.8' }
    ],
    zoomIn: [
      { d: 'M5 10h10M10 5v10', fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-width': '1.8' }
    ],
    reset: [
      { d: 'M6.5 7.5A5.5 5.5 0 1 1 5 11.3', fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8' },
      { d: 'M4.5 5.5v4h4', fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8' }
    ],
    fullView: [
      { d: 'M7 3.75H3.75V7M13 3.75h3.25V7M7 16.25H3.75V13M13 16.25h3.25V13', fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8' }
    ],
    close: [
      { d: 'M6 6l8 8M14 6l-8 8', fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-width': '1.8' }
    ]
  };
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

  const createControlIcon = (paths) => {
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    paths.forEach((attributes) => {
      const path = document.createElementNS(svgNamespace, 'path');
      Object.entries(attributes).forEach(([name, value]) => path.setAttribute(name, value));
      svg.append(path);
    });

    return svg;
  };

  const createControlButton = ({ icon, title, onClick, className = '' }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = ['mermaid-control', className].filter(Boolean).join(' ');
    button.append(createControlIcon(icon));
    button.title = title;
    button.setAttribute('aria-label', title);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      onClick(event);
    });
    return button;
  };

  const isDiagramZoomed = (container) => Number(container.dataset.zoom ?? 1) !== 1;

  const getDiagramAriaLabel = (container) => (
    isDiagramZoomed(container)
      ? 'Mermaid diagram zoomed. Drag to pan, or use the expand button for full view.'
      : 'Mermaid diagram. Press Enter or Space to open full view.'
  );

  const centerDiagramVertically = (container) => {
    container.scrollTop = Math.max(0, (container.scrollHeight - container.clientHeight) / 2);
  };

  const scheduleDiagramVerticalCenter = (container, svg) => {
    let settled = false;

    const recenterOnce = () => {
      if (settled) {
        return;
      }

      settled = true;
      svg.removeEventListener('transitionend', handleTransitionEnd);
      centerDiagramVertically(container);
    };

    const handleTransitionEnd = (event) => {
      if (event.propertyName === 'transform') {
        recenterOnce();
      }
    };

    svg.addEventListener('transitionend', handleTransitionEnd);
    window.setTimeout(recenterOnce, 200);
  };

  const setDiagramScale = (container, scale) => {
    const svg = container.querySelector('svg');

    if (!svg) {
      return;
    }

    const nextScale = Math.min(2.5, Math.max(0.5, scale));
    container.dataset.zoom = String(nextScale);
    svg.style.transform = `scale(${nextScale})`;
    svg.style.transformOrigin = 'center center';
    svg.style.marginBlock = nextScale === 1 ? '' : `${(nextScale - 1) * 1.5}rem`;
    container.classList.toggle('mermaid--zoomed', nextScale !== 1);

    scheduleDiagramVerticalCenter(container, svg);

    if (container.getAttribute('role') === 'button') {
      container.setAttribute('aria-label', getDiagramAriaLabel(container));
    }
  };

  const setupDiagramPanning = (container) => {
    if (container.dataset.panReady === 'true') {
      return;
    }

    container.dataset.panReady = 'true';

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    container.addEventListener('pointerdown', (event) => {
      if (!isDiagramZoomed(container) || event.button !== 0) {
        return;
      }

      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startScrollLeft = container.scrollLeft;
      startScrollTop = container.scrollTop;
      container.classList.add('mermaid--dragging');
      container.setPointerCapture(pointerId);
      event.preventDefault();
    });

    container.addEventListener('pointermove', (event) => {
      if (pointerId === null || event.pointerId !== pointerId) {
        return;
      }

      container.scrollLeft = startScrollLeft - (event.clientX - startX);
      container.scrollTop = startScrollTop - (event.clientY - startY);
    });

    const endDrag = (event) => {
      if (pointerId === null || event.pointerId !== pointerId) {
        return;
      }

      container.releasePointerCapture(pointerId);
      pointerId = null;
      container.classList.remove('mermaid--dragging');
    };

    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);
  };

  const setContainerInteractivity = (container, enabled) => {
    const toolbar = container.nextElementSibling?.classList.contains('mermaid-toolbar')
      ? container.nextElementSibling
      : null;

    toolbar?.toggleAttribute('hidden', !enabled);
    container.classList.toggle('mermaid--interactive', enabled);

    if (!enabled) {
      container.removeAttribute('role');
      container.removeAttribute('tabindex');
      container.removeAttribute('aria-label');
      container.onclick = null;
      container.onkeydown = null;
      return;
    }

    container.setAttribute('role', 'button');
    container.tabIndex = 0;
    container.setAttribute('aria-label', getDiagramAriaLabel(container));
    container.onclick = () => {
      // While zoomed, a diagram click drags/pans the view, so opening the
      // lightbox on click would conflict with that gesture. The expand
      // button still opens the lightbox regardless of zoom.
      if (isDiagramZoomed(container)) {
        return;
      }

      openDiagramLightbox(container);
    };
    container.onkeydown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      openDiagramLightbox(container);
    };
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
    const closeButton = createControlButton({
      icon: controlIcons.close,
      title: 'Close full diagram view',
      onClick: () => dialog.close(),
      className: 'mermaid-control--icon'
    });
    toolbar.append(closeButton);

    const diagram = document.createElement('div');
    diagram.className = 'mermaid-lightbox-diagram';
    const lightboxSvg = svg.cloneNode(true);
    lightboxSvg.style.transform = 'none';
    lightboxSvg.style.margin = '0';

    // The cloned SVG normally carries width="100%", which relies on its parent
    // for sizing. Inside the fit-content lightbox dialog this creates a
    // circular dependency and collapses the SVG to near-zero size. Give it an
    // explicit pixel size from its viewBox so the dialog can size around it.
    const viewBoxParts = lightboxSvg.getAttribute('viewBox')?.split(/\s+/).map(Number);

    if (viewBoxParts?.length === 4 && viewBoxParts.every(Number.isFinite)) {
      lightboxSvg.removeAttribute('width');
      lightboxSvg.removeAttribute('height');
      lightboxSvg.style.width = `${viewBoxParts[2]}px`;
      lightboxSvg.style.height = `${viewBoxParts[3]}px`;
    }

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
    const changeScale = (amount) => {
      setDiagramScale(container, Number(container.dataset.zoom ?? 1) + amount);
    };

    toolbar.append(
      createControlButton({
        icon: controlIcons.zoomOut,
        title: 'Zoom out diagram',
        onClick: () => changeScale(-0.25),
        className: 'mermaid-control--icon'
      }),
      createControlButton({
        icon: controlIcons.zoomIn,
        title: 'Zoom in diagram',
        onClick: () => changeScale(0.25),
        className: 'mermaid-control--icon'
      }),
      createControlButton({
        icon: controlIcons.reset,
        title: 'Reset diagram zoom',
        onClick: () => {
          setDiagramScale(container, 1);
        },
        className: 'mermaid-control--icon'
      }),
      createControlButton({
        icon: controlIcons.fullView,
        title: 'Open diagram in full view',
        onClick: () => openDiagramLightbox(container),
        className: 'mermaid-control--icon'
      })
    );
    shell.append(toolbar);
    setContainerInteractivity(container, true);
    setupDiagramPanning(container);
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
        setContainerInteractivity(container, false);
        container.textContent = `Mermaid diagram could not be rendered.\n\n${source}`;
      });
      throw error;
    }

    containers.forEach((container) => {
      container.dataset.renderedTheme = theme;
      delete container.dataset.renderError;
      enhanceMermaidContainer(container);
      setContainerInteractivity(container, true);
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
