/**
 * API Service for KITCommunity
 * Handles API calls to backend endpoints with automatic JWT token attachment
 * and refresh token rotation logic.
 */

const rawBaseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '/api';
const API_BASE_URL = rawBaseUrl.endsWith('/api') || rawBaseUrl === '/api' ? rawBaseUrl : `${rawBaseUrl}/api`;

export const getStoredTokens = () => ({
  accessToken: localStorage.getItem('cc_access_token'),
  refreshToken: localStorage.getItem('cc_refresh_token'),
});

export const setStoredTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('cc_access_token', accessToken);
  if (refreshToken) localStorage.setItem('cc_refresh_token', refreshToken);
};

export const clearStoredTokens = () => {
  localStorage.removeItem('cc_access_token');
  localStorage.removeItem('cc_refresh_token');
  localStorage.removeItem('cc_user');
};

/**
 * Fetch wrapper with JWT headers and automatic refresh
 */
export const apiFetch = async (endpoint, options = {}) => {
  const { accessToken, refreshToken } = getStoredTokens();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 Unauthorized and refresh token exists, attempt refresh
  if (response.status === 401 && refreshToken && !options._retry) {
    options._retry = true;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setStoredTokens(refreshData.accessToken, refreshData.refreshToken);

        // Retry original request with new token
        headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        clearStoredTokens();
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Failed to refresh token', err);
      clearStoredTokens();
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

// Posts API
export const deletePostApi = (id) => apiFetch(`/posts/${id}`, { method: 'DELETE' });

// Marketplace API
export const getMarketplaceListings = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/marketplace${query ? `?${query}` : ''}`);
};
export const createMarketplaceListing = (listingData) =>
  apiFetch('/marketplace', { method: 'POST', body: JSON.stringify(listingData) });
export const updateMarketplaceListing = (id, updateData) =>
  apiFetch(`/marketplace/${id}`, { method: 'PUT', body: JSON.stringify(updateData) });
export const flagMarketplaceListing = (id, reason) =>
  apiFetch(`/marketplace/${id}/flag`, { method: 'POST', body: JSON.stringify({ reason }) });
export const getMarketplaceModerationQueue = () => apiFetch('/marketplace/moderation/queue');
export const moderateMarketplaceListing = (id, action) =>
  apiFetch(`/marketplace/${id}/moderate`, { method: 'POST', body: JSON.stringify({ action }) });

// Community Requests API
export const getCommunityRequests = () => apiFetch('/community-requests');
export const createCommunityRequest = (requestData) =>
  apiFetch('/community-requests', { method: 'POST', body: JSON.stringify(requestData) });
export const approveCommunityRequest = (id, reviewComment) =>
  apiFetch(`/community-requests/${id}/approve`, { method: 'POST', body: JSON.stringify({ reviewComment }) });
export const rejectCommunityRequest = (id, reviewComment) =>
  apiFetch(`/community-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ reviewComment }) });

// Academic Calendar API
export const getActiveAcademicCalendar = () => apiFetch('/academic-calendar');
export const getAllAcademicCalendars = () => apiFetch('/academic-calendar/all');
export const getAcademicCalendarById = (id) => apiFetch(`/academic-calendar/${id}`);
export const createAcademicCalendar = (data) =>
  apiFetch('/academic-calendar', { method: 'POST', body: JSON.stringify(data) });
export const updateAcademicCalendar = (id, data) =>
  apiFetch(`/academic-calendar/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const activateAcademicCalendar = (id) =>
  apiFetch(`/academic-calendar/${id}/activate`, { method: 'POST' });
export const deleteAcademicCalendar = (id) =>
  apiFetch(`/academic-calendar/${id}`, { method: 'DELETE' });

// Polls API
export const createCampusPoll = (pollData) =>
  apiFetch('/polls', { method: 'POST', body: JSON.stringify(pollData) });
export const voteCampusPoll = (id, optionId) =>
  apiFetch(`/polls/${id}/vote`, { method: 'POST', body: JSON.stringify({ optionId }) });
export const getCampusPoll = (id) => apiFetch(`/polls/${id}`);
