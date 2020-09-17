function onSubmit(e) {
  e.preventDefault();
  const email = document.querySelector("#passwordResetEmail").value.trim();
  const el = document.querySelector("#passwordResetContent");
  const elExceptAlert = document.querySelector("#forgotPasswordContent");
  const spinner = document.querySelector("#passwordResetSpinner");
  const { protocol, host } = window.location;

  if (email.length === 0) {
    return showError("Please input your e-mail address.");
  }

  showSpinner(el, spinner);
  fetch("/forgot-password", {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      email: email,
      protocol: protocol,
      host: host,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      elExceptAlert.classList.remove("d-none");
      hideSpinner(el, spinner);
      switch (data.msg) {
        case "invalid e-mail format":
          showError(
            "Please check your e-mail address for accuracy and proper formatting."
          );
          break;
        case "user not found":
          showError(
            "Sorry, but there is no record of this e-mail address in the system."
          );
          break;
        case "password reset e-mail could not be sent":
          showError(
            "Sorry, but there was a technical glitch preventing the sending of your password reset e-mail.  Please try again later."
          );
          break;
        case "password reset e-mail sent":
          elExceptAlert.classList.add("d-none");
          showSuccess(
            "<div class='text-center'>Please check your e-mail.  We have sent you a message containing a special link that you must click on in order to reset your password.</div>",
            "Check Your E-mail"
          );
          break;
        default:
          window.location.href = "/forgot-password";
          break;
      }
    })
    .catch((error) => {
      console.error(error);
      hideSpinner(el, spinner);
    });
}

function attachEventListeners() {
  document
    .querySelector("#passwordResetForm")
    .addEventListener("submit", onSubmit);
}

function init() {
  attachEventListeners();
}

init();
