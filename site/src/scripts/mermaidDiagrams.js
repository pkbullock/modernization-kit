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

  const mermaidWindow = window;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleMermaidRender, { once: true });
  } else {
    scheduleMermaidRender();
  }

  if (!mermaidWindow.__modernizationKitMermaidListenersRegistered) {
    document.addEventListener('astro:page-load', scheduleMermaidRender);
    document.addEventListener('modernization-kit-theme-change', scheduleMermaidRender);
    mermaidWindow.__modernizationKitMermaidListenersRegistered = true;
  }

  return {
    scheduleMermaidRender
  };
};
