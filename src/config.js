const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const ASSET_BASE_URL = process.env.REACT_APP_ASSET_URL || 'http://localhost:5000';

export const getAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Ensure path starts with a slash if it doesn't have one
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${ASSET_BASE_URL}${normalizedPath}`;
};

export default {
    API_BASE_URL,
    ASSET_BASE_URL,
    getAssetUrl
};
