function pollForOffline() {
  setInterval(() => {
    if (navigator.onLine) {
      try {
        history.go(-1);
      }
      catch(err) {
        window.location.href = "/";
      }
    }
  }, 10000);
}

function showAlert() {
  showError("<div class='text-center'>You appear to be offline.  Please connect to the internet.</div>", "Can't Connect");
}

function init() {
  pollForOffline();
  showAlert();
}

init();