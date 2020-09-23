function removeTokens() {
  sessionStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

function redirect() {
  window.location.href = "/";
}

function init() {
  removeTokens();
  redirect();
}

init();
