function pollForOffline() {
  setInterval(() => {
    if (navigator.onLine) {
      const redirectOnceOnline = sessionStorage.getItem("redirectOnceOnline") || "";
      window.location.href = redirectOnceOnline.length ? redirectOnceOnline : "/";
    }
  }, 3000);
}

function showAlert() {
  showError("<div class='text-center'>You appear to be offline.  Please connect to the internet.</div>", "Can't Connect");
}

function init() {
  pollForOffline();
  showAlert();
}

init();