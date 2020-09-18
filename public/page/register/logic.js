function onSubmit(e) {
  e.preventDefault();
  const firstname = e.target["firstname"].value.trim();
  const lastname = e.target["lastname"].value.trim();
  const email = e.target["email"].value.trim();
  const smsphone = e.target["smsphone"].value.trim();
  const username = e.target["username"].value.trim();
  const password = e.target["password"].value.trim();
  const endpoint = `${protocol}//${host}/register`;
  const spinner = document.querySelector("#registerSpinner");
  const content = document.querySelector("#registerContent");

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      firstname: firstname,
      lastname: lastname,
      email: email,
      smsphone: smsphone,
      username: username,
      password: password,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideSpinner(content, spinner);
      switch (data.msg) {
        case "missing first name":
          showError("Please input your first name.", "Form Incomplete");
          break;
        case "missing last name":
          showError("Please input your last name.", "Form Incomplete");
          break;
        case "missing e-mail":
          showError("Please input your e-mail address.", "Form Incomplete");
          break;
        case "missing username":
          showError("Please input your username.", "Form Incomplete");
          break;
        case "missing password":
          showError("Please input your password.", "Form Incomplete");
          break;

        case "confirmation e-mail sent":
          document.querySelector("#registerform").classList.add("d-none");
          showSuccess(
            "Please check your e-mail.  We have sent you a link that you must click on in order to complete and confirm your registration.",
            "Check Your E-mail"
          );
          break;
      }
    })
    .catch((error) => {
      console.error(error);
      hideSpinner(content, spinner);
    });
}

function attachEventListeners() {
  document.querySelector("#registerform").addEventListener("submit", onSubmit);
}

function init() {
  attachEventListeners();
}

init();
