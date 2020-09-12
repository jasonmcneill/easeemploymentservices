function tryLogin(e) {
  const username = e.target.inputUsername.value.trim();
  const password = e.target.inputPassword.value.trim();
  const fetchEndpoint = "/api/login";
  hideAlertMessage();
  try {
    const abortController = new AbortController();
    const signal = abortController.signal;
    setTimeout(() => {
      abortController.abort(), 5000;
      return {
        msg: "fetch timed out",
        msgType: "error",
      };
    });
    fetch(fetchEndpoint, {
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
      .then((loginResult) => {
        return {
          msg: loginResult.msg || "result of fetch is not valid json",
          msgType: loginResult.msgType || "error",
          data: loginResult.data || {},
        };
      })
      .catch((error) => {
        return {
          msg: error,
          msgType: "error",
        };
      });
    return "could not connect";
  } catch (error) {
    return {
      msg: error,
      msgType: "error",
    };
  }
}

async function onSubmit(e) {
  e.preventDefault();
  const elementToToggle = document.querySelector("#form-signin");
  const spinnerElement = document.querySelector(".spinner");
  showSpinner(elementToToggle, spinnerElement);
  const login = await tryLogin(e);
  hideSpinner(elementToToggle, spinnerElement);
  if (login == "could not connect") {
    showError(
      "Unable to connect to the server. Please ensure that you are online, then try again."
    );
  }
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
