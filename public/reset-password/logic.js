function getToken() {
  const hash = window.location.hash;
  let invalidHash = false;
  if (!hash.length) invalidHash = true;
  if (hash.indexOf("=") <= -1) invalidHash = true;
  if (invalidHash) return (window.location.href = "/forgot-password");
  const token = hash.split("=")[1] || "";
  return token;
}

function onSubmit(e) {
  const token = getToken();
  const newPassword = document.querySelector("#newpassword").value.trim() || "";
  const content = document.querySelector("#newPasswordContent");
  const contentExceptAlert = document.querySelector("#resetPasswordContent");
  const spinner = document.querySelector("#newPasswordSpinner");
  const { protocol, host } = window.location;
  const endpoint = `${protocol}//${host}/reset-password`;
  e.preventDefault();
  console.log("onSubmit()");

  showSpinner(content, spinner);

  fetch(endpoint, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      token: token,
      newPassword: newPassword,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideAlertMessage();
      contentExceptAlert.classList.remove("d-none");
      hideSpinner(content, spinner);
      switch (data.msg) {
        case "unable to query for token":
          showError(
            "There was a technical glitch.  Please wait a moment and try again.",
            "Database is Down"
          );
          break;
        case "token not found":
          contentExceptAlert.classList.add("d-none");
          showError(
            "We have no record of your password reset link.  Please make sure that it wasn't garbled in the e-mail where you clicked on the link.",
            "Link Not Found"
          );
          break;
        case "token is expired":
          contentExceptAlert.classList.add("d-none");
          showError(
            `
              <p>
                Your password cannot be reset because you did not click on the link prior to its expiration. You will now be redirected to start the process again.
              </p>
              <div class='text-center my-2'>
                <div class="spinner-border" role="status">
                  <span class="sr-only">Loading...</span>
                </div>
              </div>
            `,
            "Link Expired"
          );
          setTimeout(() => {
            window.location.href = "/forgot-password/";
          }, 5000);
          break;
        case "password is missing":
          showError(
            "<div class='text-center'>Please input your new password.</div>",
            "Form Incomplete"
          );
          break;
        case "new password lacks sufficient complexity":
          showError(
            `
              <p>Please revise your new password.  For your protection, we require that it must have a minimum level of unpredictability in order to prevent potential hackers from guessing it.</p>
              <p>A minimum length of 8 characters is required.  Using a phrase (rather than a single word) is encouraged, because phrases are less predictable.
            `,
            "Password is Too Predictable"
          );
          document.querySelector("#newpassword").value = "";
          break;
        case "unable to generate password salt":
          showError(
            "There was a technical glitch which prevented your new password from being saved.  Please wait a moment, then try saving it again.",
            "System is Down"
          );
          break;
        case "unable to generate password hash":
          showError(
            "There was a technical glitch which prevented your new password from being saved.  Please wait a moment, then try saving it again.",
            "System is Down"
          );
          break;
        case "unable to store hashed password":
          showError(
            "There was a technical glitch which prevented your new password from being saved.  Please wait a moment, then try saving it again.",
            "System is Down"
          );
          break;
        case "unable to designate token as claimed":
          showError(
            "There was a technical glitch which prevented your new password from being used.  Please wait a moment, then try saving it again.",
            "System is Down"
          );
          break;
        case "password updated":
          contentExceptAlert.classList.add("d-none");
          showSuccess(
            `
              <p class='text-center'>
                You will now be redirected to <a href='/login/' class='alert-link'><u>Sign In</u></a>.
              </p>
              <div class='text-center my-2'>
                <div class="spinner-border" role="status">
                  <span class="sr-only">Loading...</span>
                </div>
              </div>
            `,
            "Password Reset Successfully"
          );
          setTimeout(() => {
            window.location.href = "/login/";
          }, 5000);
          break;
        default:
          console.error("Did not receive a valid HTTP response from the API");
          window.location.href = "/forgot-password/";
          break;
      }
    })
    .catch((error) => {
      hideSpinner(content, spinner);
      console.error(error);
    });
}

function attachEventListeners() {
  const form = document.querySelector("#newPasswordForm");
  form.addEventListener("submit", onSubmit);
}

function init() {
  checkIfOffline();
  attachEventListeners();
}

init();
