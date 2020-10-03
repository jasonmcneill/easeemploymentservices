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

function _scrollTo(selector, yOffset = 0) {
  const x = selector.getBoundingClientRect().x + window.pageXOffset;
  const y = selector.getBoundingClientRect().top + window.pageYOffset + yOffset;

  try {
    window.scrollTo({ top: y, behavior: "smooth" });
  } catch (err) {
    window.scrollTo(x, y);
  }
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
  _scrollTo(messageElement, -10);
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
  _scrollTo(messageElement, -10);
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

function addToast(
  text = "",
  headline = "EASE",
  type = "",
  delay = "5000",
  autohide = "true"
) {
  const toasts = JSON.parse(sessionStorage.getItem("toasts")) || [];

  toasts.push({
    text: text,
    headline: headline,
    type: type,
    delay: delay,
    autohide: autohide,
  });

  sessionStorage.setItem("toasts", JSON.stringify(toasts));
}

function showToasts() {
  // Get and clear toasts from sessionStorage
  const toasts = JSON.parse(sessionStorage.getItem("toasts")) || [];
  sessionStorage.removeItem("toasts");

  // Return if there are no toasts
  if (!toasts.length) return;

  // Hide spinners
  document.querySelectorAll(".spinner-border", (item) =>
    item.parent.classList.add("d-none")
  );

  // Build toasts
  let toastHtml = "";
  toasts.length &&
    toasts.forEach((item) => {
      let headerBg = "";
      let headerText = "";
      switch (item.type) {
        case "primary":
          headerBg = "primary";
          headerText = "light";
          break;
        case "secondary":
          headerBg = "secondary";
          headerText = "light";
          break;
        case "success":
          headerBg = "success";
          headerText = "light";
          break;
        case "danger":
          headerBg = "danger";
          headerText = "white";
          break;
        case "warning":
          headerBg = "warning";
          headerText = "dark";
          break;
        case "info":
          headerBg = "info";
          headerText = "white";
          break;
        case "light":
          headerBg = "light";
          headerText = "dark";
          break;
        case "dark":
          headerBg = "dark";
          headerText = "white";
          break;
        case "white":
          headerBg = "white";
          headerText = "dark";
          break;
        case "transparent":
          headerBg = "transparent";
          headerText = "dark";
          break;
        default:
          headerBg = "secondary";
          headerText = "light";
          break;
      }
      toastHtml += `
        <div class="toast bg-white" role="alert" aria-live="assertive" aria-atomic="true" data-delay="${item.delay}" data-autohide="${item.autohide}">
          <div class="toast-header bg-${headerBg}">
            <strong class="mr-auto text-${headerText}">
              ${item.headline}
            </strong>
            <small class="text-${headerText}">just now</small>
            <button type="button" class="ml-2 mb-1 close text-${headerText}" data-dismiss="toast" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="toast-body bg-white">
            ${item.text}
          </div>
        </div>
      `;
    });
  // toastHtml = `<div aria-live="polite" aria-atomic="true" class="d-flex justify-content-center align-items-center">${toastHtml}</div>`;

  // Inject toasts as first child of <body>
  const toastContainer = document.querySelector("#toasts");
  toastContainer.innerHTML = toastHtml;
  $(".toast")
    .toast("show")
    .on("show.bs.toast", () => {
      toastContainer.classList.remove("d-none");
    })
    .on("hidden.bs.toast", () => {
      toastContainer.classList.add("d-none");
    });
}

function showToast(
  text = "",
  headline = "EASE",
  type = "primary",
  delay = "5000",
  autohide = "true"
) {
  addToast(text, headline, type, delay, autohide);
  showToasts();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
