function onSubmit(e) {
  e.preventDefault();
  const elementToToggle = document.querySelector("#form-signin");
  const spinnerElement = document.querySelector(".spinner");
  const username = e.target.inputUsername.value.trim();
  const password = e.target.inputPassword.value.trim();
  showSpinner(elementToToggle, spinnerElement);
  hideAlertMessage();
  fetch("../login", {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      username: username,
      password: password,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  })
    .then((res) => (res.ok ? res.json() : {}))
    .then((data) => {
      hideSpinner(elementToToggle, spinnerElement);
      switch (data.msg) {
        case "authentication failed":
          showError(
            "Please check your username and/or password for accuracy, then try again.",
            "Login Failed"
          );
          break;
        default:
          showError(
            "Please check your username and/or password for accuracy, then try again.",
            "Login Failed"
          );
          break;
      }
    })
    .catch((error) => {
      hideSpinner(elementToToggle, spinnerElement);
      return {
        msg: error,
        msgType: "error",
      };
    });
}

function clearLoginTokens() {
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("accessToken");
}

function attachEventListeners() {
  const form = document.querySelector("#form-signin");
  form.addEventListener("submit", onSubmit);
}

function init() {
  clearLoginTokens();
  attachEventListeners();
}

init();
