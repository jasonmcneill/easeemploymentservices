function onSubmit(e) {
  e.preventDefault();
  const elementToToggle = document.querySelector("#form-signin");
  const spinnerElement = document.querySelector(".spinner");
  const username = e.target.inputUsername.value.trim().toLowerCase();
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
      switch (data.msg) {
        case "unable to query for user":
          hideSpinner(elementToToggle, spinnerElement);
          showError(
            "The system is unable to verify your login at this time.  Please try again later.",
            "System is down"
          );
          break;
        case "unable to verify login":
          hideSpinner(elementToToggle, spinnerElement);
          showError(
            "The system is unable to verify your login at this time.  Please try again later.",
            "System is down"
          );
          break;
        case "employee status is not registered":
          hideSpinner(elementToToggle, spinnerElement);
          showError(
            "It appears that you either haven't completed registration, or your registration status was changed.  If you recently registered, you should have received an e-mail with a special link that you must click on in order to complete your registration.",
            "Not Registered"
          );
          break;
        case "invalid login":
          hideSpinner(elementToToggle, spinnerElement);
          showError(
            "Please check your username and/or password for accuracy, then try again.",
            "Unable to Sign In"
          );
          break;
        case "user authenticated":
          const refreshToken = data.refreshToken;
          const accessToken = data.accessToken;
          localStorage.setItem("refreshToken", refreshToken);
          sessionStorage.setItem("accessToken", accessToken);
          window.location.href = "/";
          break;
        default:
          hideSpinner(elementToToggle, spinnerElement);
          showError(
            "Please check your username and/or password for accuracy, then try again.",
            "Unable to Sign In"
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
