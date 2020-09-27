function showSpinner(elementToToggle, spinnerElement) {
  elementToToggle.classList.add("d-none");
  spinnerElement.classList.remove("d-none");
  // console.log("spinner activated", elementToToggle);
}

function hideSpinner(elementToToggle, spinnerElement) {
  elementToToggle.classList.remove("d-none");
  spinnerElement.classList.add("d-none");
  // console.log("spinner deactivated", elementToToggle);
}

function clearAlertMessageContent() {
  const messageElement = document.querySelector("#alertMessage");
  const messageContent = messageElement.querySelector("[data-alert-content]");
  const classesToRemove = [
    "alert-primary",
    "alert-secondary",
    "alert-success",
    "alert-danger",
    "alert-warning",
    "alert-info",
    "alert-light",
    "alert-dark",
  ];
  classesToRemove.forEach((item) => messageContent.classList.remove(item));
  messageContent.innerText = "";
}

function showError(message, headline) {
  const messageElement = document.querySelector("#alertMessage");
  const messageContent = messageElement.querySelector("[data-alert-content]");

  clearAlertMessageContent(messageElement);
  messageContent.classList.add("alert-danger");
  messageContent.innerHTML = headline
    ? `<h5 class="alert-heading text-center">${headline}</h5><p>${message}</p>`
    : `${message}`;
  messageElement.classList.remove("d-none");
  messageElement.scrollIntoView();
}

function showSuccess(message, headline) {
  const messageElement = document.querySelector("#alertMessage");
  const messageContent = messageElement.querySelector("[data-alert-content]");

  clearAlertMessageContent(messageElement);
  messageContent.classList.add("alert-success");
  messageContent.innerHTML = headline
    ? `<h5 class="alert-heading text-center">${headline}</h5><p>${message}</p>`
    : `${message}`;
  messageElement.classList.remove("d-none");
  messageElement.scrollIntoView();
}

function hideAlertMessage() {
  const messageElement = document.querySelector("#alertMessage");
  messageElement.classList.add("d-none");
}

function protectRoute() {
  const refreshToken = localStorage.getItem("refreshToken") || "";
  if (!refreshToken.length) {
    window.location.href = "/login/";
  }
}

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

/*
  RENDER
  Arguments (all required):
   - where:  a value that helps to select the DOM node. Gets concatenated to "[data-]", e.g. if value is "firstname" then DOM selector will be "[data-firstname]")
   - what:  the bare value to be rendered
   - how:  the HTML-decorated value
*/
function render(where, what, how) {
  const el = document.querySelector(`[data-${where}]`);
  if (typeof what !== "string") {
    el.parentElement.classList.add("d-none");
    return;
  }
  el.innerHTML = how;
}

/* if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
} */
