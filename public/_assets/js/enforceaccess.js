function getAccessToken() {
  let needToRefresh = false;
  const accessToken = sessionStorage.getItem("accessToken") || "";
  const now = Date.now().valueOf() / 1000;
  let expiry = now;
  try {
    expiry = JSON.parse(atob(accessToken.split(".")[1])).exp;
    if (expiry < now) needToRefresh = true;
  } catch (err) {
    needToRefresh = true;
  }
  return new Promise((resolve, reject) => {
    if (!needToRefresh) return resolve(accessToken);
    const refreshToken = localStorage.getItem("refreshToken") || "";
    if (!refreshToken.length) return reject("refresh token missing");

    const endpoint = "/api/refresh-token";

    fetch(endpoint, {
      mode: "cors",
      method: "POST",
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        switch (data.msg) {
          case "tokens renewed":
            const { accessToken, refreshToken } = data;
            localStorage.setItem("refreshToken", refreshToken);
            sessionStorage.setItem("accessToken", accessToken);
            resolve(accessToken);
            break;
          default:
            window.location.href = "/logout/";
            break;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

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
  window.addEventListener("load", () => {
    const selector = `[data-access-${userRole}]`;
    setTimeout(() => {
      document.querySelectorAll(selector).forEach((item) => {
        item.classList.remove("d-none");
      });
    }, 750);
  });
}
