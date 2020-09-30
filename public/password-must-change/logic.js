async function confirmMustChange() {
  const accessToken = await getAccessToken();
  let shouldPasswordChange = false;

  try {
    shouldPasswordChange = JSON.parse(atob(accessToken.split(".")[1]))
      .passwordmustchange;
  } catch (err) {
    console.error(err);
  }

  if (typeof shouldPasswordChange !== "boolean") {
    shouldPasswordChange = false;
  }

  if (!shouldPasswordChange) {
    window.location.href = "/";
  }
}

async function onSubmit(e) {
  e.preventDefault();
  const accessToken = await getAccessToken();
  const endpoint = "/api/password-must-change";
  const spinner = document.querySelector("#spinner");
  const content = document.querySelector("#formChangePassword");
  const newpassword = e.target["newpassword"].value.trim();

  // Validation
  if (!newpassword.length) {
    return showError(
      "<div class='text-center'>Please input your new password.</div>",
      "Form Incomplete"
    );
  }

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      newpassword: newpassword,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.msg) {
        case "missing access token":
          window.location.href = "/logout/";
          break;
        case "invalid access token":
          window.location.href = "/logout/";
          break;
        case "no need to change password":
          showError(
            "Upon further verification, your password did not actually need to be changed. Therefore <strong>your new password has not been saved.</strong> To prevent this mixup from occurring again, you should <nobr><a href='/logout/' class='alert-link'>sign out</a></nobr> and then sign in again.",
            "No need to change"
          );
          break;
        case "password is missing":
          showError(
            "<div class='text-center'>Please input your new password.</div>",
            "Form Incomplete"
          );
          break;
        case "password lacks sufficient complexity":
          showError(
            `
              <p>Please revise your new password.  For your protection, we require that it must have a minimum level of unpredictability in order to prevent potential hackers from guessing it.</p>
              <p>A minimum length of 8 characters is required.  Using a phrase (rather than a single word) is encouraged, because phrases are less predictable.
            `,
            "Password is Too Predictable"
          );
          break;
        case "password updated":
          showSuccess(
            `
            Your password was changed successfully.  In a moment you will be redirected...

            <div class="my-3 text-center">
              <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          `,
            "Password Changed"
          );
          setTimeout(() => {
            const nexturl = sessionStorage.getItem("nexturl") || "";
            if (nexturl.length) {
              sessionStorage.removeItem("nexturl");
              window.location.href = nexturl;
            } else {
              window.location.href = "/";
            }
          }, 5000);
          break;
        default:
          showError(
            "There was a technical glitch that prevented your new password from being saved.  Please wait a moment then try again.",
            "Unable to Save Password"
          );
          break;
      }
    })
    .catch((error) => console.error(error))
    .finally(() => {
      hideSpinner(content, spinner);
    });
}

function attachListeners() {
  document
    .querySelector("#formChangePassword")
    .addEventListener("submit", onSubmit);
}

function init() {
  protectRoute();
  confirmMustChange();
  attachListeners();
}

init();
