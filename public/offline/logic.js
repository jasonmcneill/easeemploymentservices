function pollForOffline() {
  setInterval(() => {
    if (navigator.onLine) {
      const redirectWhenOnline = sessionStorage.getItem("redirectWhenOnline") || "";
      const refreshToken = localStorage.getItem("refreshToken") || "";

      sessionStorage.removeItem("redirectWhenOnline");

      if (!refreshToken.length) {
        window.location.href = "/login/";
      } else {
        window.location.href = redirectWhenOnline.length ? redirectWhenOnline : "/";
      }
    }
  }, 300);
}

function showAlert() {
  showError("<div class='text-center'>You appear to be offline.  Please connect to the internet.</div>", "Can't Connect");
}

function init() {
  pollForOffline();
  showAlert();
}

init();