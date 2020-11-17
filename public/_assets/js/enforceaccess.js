function verifyRefreshToken(logoutUrl) {
  const refreshToken = localStorage.getItem("refreshToken") || "";
  const isAuthorized = refreshToken.length;
  if (!isAuthorized) window.location.href = logoutUrl;
}

function enforceUserRoles(redirectUrl, allowedRoles) {
  const userRole =
    JSON.parse(atob(sessionStorage.getItem("accessToken").split(".")[1]))
      .type || "regular";
  const isAuthorized = allowedRoles.includes(userRole);
  if (!isAuthorized) window.location.href = redirectUrl;
}
