function pollForOffline() {
  setInterval(() => {
    if (navigator.onLine) {
      const urlBeforeRedirection =
        sessionStorage.getItem("redirectWhenOnline") || "";

      if (urlBeforeRedirection.length) {
        console.warn("Now online.  Redirecting to former URL...");
        sessionStorage.removeItem("redirectWhenOnline");
        window.location.href = urlBeforeRedirection;
      } else {
        console.warn("Now online.  Redirecting to home page...");
        window.location.href = "/";
      }
    }
  }, 300);
}

function showAlert() {
  showError(
    "<div class='text-center'>You appear to be offline.  Please connect to the internet.</div>",
    "Can't Connect"
  );
}

function init() {
  pollForOffline();
  showAlert();
}

init();
