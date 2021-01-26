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
    "border-danger",
    "border-success",
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
  messageContent.classList.add("border-danger");
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
  messageContent.classList.add("border-success");
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
  el.classList.add("text-truncate");
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

function showToasts(samePageToasts) {
  const toastContainer = document.querySelector("#toasts");
  let toasts = [];

  if (!toastContainer) return;

  toastContainer.innerHTML = "";

  if (!samePageToasts) {
    // Get and clear toasts from sessionStorage
    toasts = JSON.parse(sessionStorage.getItem("toasts")) || [];
    sessionStorage.removeItem("toasts");
  } else {
    // Get toasts from args
    toasts = samePageToasts;
  }

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

  // Inject toasts as first child of <body>
  toastContainer.innerHTML = toastHtml;
  $(".toast")
    .toast("show")
    .on("hidden.bs.toast", () => {
      toastContainer.innerHTML = "";
    });
}

function showToast(
  text = "",
  headline = "EASE",
  type = "",
  delay = "5000",
  autohide = "true"
) {
  const samePageToasts = [];

  samePageToasts.push({
    text: text,
    headline: headline,
    type: type,
    delay: delay,
    autohide: autohide,
  });

  showToasts(samePageToasts);
}

function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js");
    });
  }
}

function checkIfOffline() {
  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;
  const isRedirectOK = currentPath !== "/offline/";

  function doCheck() {
    if (!navigator.onLine) {
      if (isRedirectOK) {
        console.error("Now offline.  Redirecting...", currentPath);
        sessionStorage.setItem("redirectWhenOnline", currentUrl);
        window.location.href = "/offline/";
      }
    }
  }

  doCheck();
  setInterval(() => {
    doCheck();
  }, 3000);
}

function linebreak(str) {
  return str.replace(/(?:\r\n|\r|\n)/g, "<br>");
}

function getId() {
  return parseInt(document.location.hash.split("#")[1]) || "";
}

function clearEverything() {
  caches.keys().then(function (cacheNames) {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("subscriptionToken");
    sessionStorage.removeItem("accessToken");
    return Promise.all(
      cacheNames
        .filter(function (cacheName) {
          return true;
        })
        .map(function (cacheName) {
          return caches.delete(cacheName);
        })
    );
  });
}

function init() {
  registerSW();
  checkIfOffline();
}

init();
