function verifyRefreshToken(logoutUrl) {
  const refreshToken = localStorage.getItem("refreshToken") || "";
  const isAuthorized = refreshToken.length;
  if (!isAuthorized) window.location.href = logoutUrl;
}

async function enforceUserRoles(redirectUrl, allowedRoles) {
  let accessToken = sessionStorage.accessToken || "";
  if (!accessToken.length) accessToken = await getAccessToken();
  const userRole =
    JSON.parse(atob(sessionStorage.getItem("accessToken").split(".")[1]))
      .type || "regular";
  const isAuthorized = allowedRoles.includes(userRole);
  if (!isAuthorized) window.location.href = redirectUrl;
  showAuthorizedContent(userRole);
}

function showAuthorizedContent(userRole) {
  $("document").ready(($) => {
    $(`[data-access-${userRole}]`).removeClass("d-none");
  });
}
