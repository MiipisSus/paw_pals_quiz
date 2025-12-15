const BASE_URL = "/api/";

export async function startGameSession() {
  const response = await fetch(`${BASE_URL}start-game/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to start game session");
  }
  return response.json();
}

export async function endGameSession(gameSessionId) {
  const response = await fetch(`${BASE_URL}end-game/`, {
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
    throw new Error("Failed to end game session");
  }
  return response.json();
}

export async function fetchQuestion(gameSessionId) {
  const response = await fetch(`${BASE_URL}question/`, {
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
  const response = await fetch(`${BASE_URL}answer/`, {
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
