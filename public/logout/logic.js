function removeTokens() {
  sessionStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

function redirect() {
  window.location.href = "/login/";
}

function init() {
  removeTokens();
  redirect();
}

init();
