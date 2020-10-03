function verifyRegistrationToken() {
  const token = window.location.hash.split("=")[1] || "";
  const endpoint = "/register-confirm";
  const spinner = document.querySelector("#spinner");
  const content = document.querySelector("#content");

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      token: token,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideSpinner(content, spinner);
      switch (data.msg) {
        case "unable to query for registration token":
          showError(
            "It appears that the database is not accessible.  Please wait a moment, then try again (by reloading the page).",
            "Database is Down"
          );
          break;
        case "registration token not found":
          showError(
            "The link that you clicked on from your e-mail appears to be malformed or modified.  Please try clicking on the link from your e-mail again.",
            "Link Not Recognized"
          );
          break;
        case "unable to remove employee tokens":
          showError(
            "The link that you clicked on from your e-mail has expired. Please arrange with your direct report to register again.",
            "Link Expired"
          );
          break;
        case "unable to remove employee":
          showError(
            "The link that you clicked on from your e-mail has expired. Please arrange with your direct report to register again.",
            "Link Expired"
          );
          break;
        case "registration token expired":
          showError(
            "The link that you clicked on from your e-mail has expired.  Please arrange with your direct report to register again.",
            "Link Expired"
          );
          break;
        case "unable to query to set employee status":
          showError(
            "There was a technical glitch that prevented your registration from being confirmed.  Please wait a moment, then try again (by reloading the page).",
            "Registration Unsuccessful"
          );
          break;
        case "token validated":
          showSuccess(
            "You have registered successfully.  In a few seconds you will automatically be redirected to <nobr><a href='/login' class='alert-link'>Sign In</a>.</nobr>",
            "Registration Complete"
          );
          setTimeout(() => {
            window.location.href = "/login/";
          }, 5000);
          break;
      }
    })
    .catch((error) => {
      hideSpinner(content, spinner);
      showError(
        "There was a technical glitch that prevented your registration from being confirmed.  Please wait a moment, then try again (by reloading the page).",
        "Registration Unsuccessful"
      );
      console.error(error);
    });
}

function init() {
  verifyRegistrationToken();
}

init();
