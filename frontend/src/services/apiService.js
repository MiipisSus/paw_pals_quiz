export const BASE_URL = import.meta.env.VITE_API_URL || "/api/";

function getCurrentLanguage() {
  const savedLang = localStorage.getItem("i18nextLng");
  if (savedLang) {
    return savedLang;
  }

  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith("zh") ? "zh" : "en";
}

function addLanguageParam(url) {
  const lang = getCurrentLanguage();
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}lang=${lang}`;
}

export const tokenManager = {
  setAccessToken: (token) => {
    localStorage.setItem("access_token", token);
  },

  getAccessToken: () => {
    return localStorage.getItem("access_token");
  },

  setRefreshToken: (token) => {
    localStorage.setItem("refresh_token", token);
  },

  getRefreshToken: () => {
    return localStorage.getItem("refresh_token");
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  },

  clearAllTokens: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },
};

async function authenticatedFetch(url, options = {}) {
  const token = tokenManager.getAccessToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(url, config);

  if (response.status === 401 && tokenManager.getRefreshToken()) {
    try {
      await refreshToken();

      const newToken = tokenManager.getAccessToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, config);
      }
    } catch (error) {
      const hadToken = tokenManager.isAuthenticated();
      tokenManager.clearAllTokens();

      if (hadToken) {
        window.dispatchEvent(new CustomEvent("token-expired"));
      }
      throw new Error("Authentication failed");
    }
  }

  return response;
}

export async function startGameSession(totalRounds = 10) {
  const response = await authenticatedFetch(`${BASE_URL}start-game/`, {
    method: "POST",
    body: JSON.stringify({
      total_rounds: totalRounds,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to start game session");
  }
  return response.json();
}

export async function endGameSession(gameSessionId) {
  const url = addLanguageParam(`${BASE_URL}end-game/`);
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify({
      game_session_id: gameSessionId,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to end game session");
  }
  return response.json();
}

export async function terminateGameSession(gameSessionId) {
  const url = addLanguageParam(`${BASE_URL}terminate-game/`);
  const response = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify({
      game_session_id: gameSessionId,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to terminate game session");
  }
  return response.json();
}

export async function fetchQuestion(gameSessionId) {
  const url = addLanguageParam(`${BASE_URL}question/`);
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      game_session_id: gameSessionId,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}

export async function submitAnswer(data) {
  const url = addLanguageParam(`${BASE_URL}answer/`);
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to submit answer");
  }
  return response.json();
}

export async function loginUser(username, password) {
  const response = await fetch(`${BASE_URL}login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  const data = await response.json();

  if (data.access && data.refresh) {
    tokenManager.setTokens(data.access, data.refresh);
  }

  return data;
}

export async function logoutUser() {
  const refreshToken = tokenManager.getRefreshToken();

  const response = await authenticatedFetch(`${BASE_URL}logout/`, {
    method: "POST",
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  tokenManager.clearAllTokens();

  if (!response.ok) {
    console.warn("Logout request failed, but local tokens cleared");
  }

  return { success: true };
}

export async function registerUser(username, password) {
  const response = await fetch(`${BASE_URL}register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Registration failed");
  }

  const data = await response.json();
  return data;
}

export async function fetchUserInfo() {
  const response = await authenticatedFetch(`${BASE_URL}user/me/`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  return response.json();
}

export async function fetchGlobalStats() {
  const url = addLanguageParam(`${BASE_URL}global-stats/`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch global stats");
  }

  return response.json();
}

export async function refreshToken() {
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${BASE_URL}token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      refresh: refreshToken,
    }),
  });

  if (!response.ok) {
    tokenManager.clearAllTokens();
    throw new Error("Token refresh failed");
  }

  const data = await response.json();

  if (data.access) {
    tokenManager.setAccessToken(data.access);
  }

  return data;
}

export async function checkEmailExists(email) {
  const url = addLanguageParam(`${BASE_URL}check-email/`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Email is not registered");
  }

  return response.json();
}

export async function fetchUserInfoUpdate(params) {
  const url = addLanguageParam(`${BASE_URL}user/me/`);
  const response = await authenticatedFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to update user info");
  }

  return response.json();
}

export async function requestPasswordReset(email) {
  const response = await fetch(`${BASE_URL}request-password-reset/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to send reset email");
  }

  return response.json();
}

export async function resetPassword(token, newPassword) {
  const response = await fetch(`${BASE_URL}reset-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to reset password");
  }

  return response.json();
}
