export const sortTracksByFilename = (tracks = []) => {
  if (!Array.isArray(tracks)) return [];
  return [...tracks].sort((a, b) => {
    const aKey = (a?.filename || a?.title || '').toString().toLowerCase();
    const bKey = (b?.filename || b?.title || '').toString().toLowerCase();
    return aKey.localeCompare(bKey, undefined, { numeric: true, sensitivity: 'base' });
  });
};
