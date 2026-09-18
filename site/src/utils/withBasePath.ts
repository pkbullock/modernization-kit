export const withBasePath = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  if (!base) {
    return normalizedPath;
  }

  return normalizedPath === '/' ? `${base}/` : `${base}${normalizedPath}`;
};
