function onSubmit(e) {
  e.preventDefault();
  const firstname = e.target["firstname"].value.trim();
  const lastname = e.target["lastname"].value.trim();
  const email = e.target["email"].value.trim();
  const smsphone = e.target["smsphone"].value.trim();
  const smsphonecountry = e.target["smsphonecountry"].value;
  const username = e.target["username"].value.trim();
  const password = e.target["password"].value.trim();
  const endpoint = `${window.location.protocol}//${window.location.host}/register`;
  const spinner = document.querySelector("#registerSpinner");
  const content = document.querySelector("#registerContent");

  if (smsphone.length && !smsphonecountry.length) {
    return showError(
      "Please select the country of your mobile phone.",
      "Form Incomplete"
    );
  }

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      firstname: firstname,
      lastname: lastname,
      email: email,
      smsphone: smsphone,
      smsphonecountry: smsphonecountry,
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
          showError(
            "<div class='text-center'>Please input your first name.</div>",
            "Form Incomplete"
          );
          break;
        case "missing last name":
          showError(
            "<div class='text-center'>Please input your last name.</div>",
            "Form Incomplete"
          );
          break;
        case "missing e-mail":
          showError(
            "<div class='text-center'>Please input your e-mail address.</div>",
            "Form Incomplete"
          );
          break;
        case "mobile phone number not valid":
          showError("Please use a valid phone number.", "Form Incomplete");
          break;
        case "mobile phone number not valid for country":
          showError(
            "Please use a mobile phone number that matches the country you selected."
          );
          break;
        case "mobile phone number is not sms capable":
          showError(
            "Please use a mobile phone number that is capable of receiving text messages.",
            "Form Incomplete"
          );
          break;
        case "missing username":
          showError(
            "<div class='text-center'>Please input your username.</div>",
            "Form Incomplete"
          );
          break;
        case "missing password":
          showError(
            "<div class='text-center'>Please input your password.</div>",
            "Form Incomplete"
          );
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

function populateSmsPhoneCountries() {
  const countriesDropdown = document.querySelector("#smsphonecountry");
  const endpoint = "/_assets/json/world-countries/data/en/countries.json";
  fetch(endpoint)
    .then((res) => res.json())
    .then((data) => {
      countriesDropdown.append(`<option value="">(Select)</option>`);
      data.forEach((item) => {
        const newOption = document.createElement("option");
        const optionText = document.createTextNode(item.name);
        newOption.appendChild(optionText);
        newOption.setAttribute("value", item.alpha2);
        if (item.alpha2 === "us") newOption.setAttribute("selected", true);
        countriesDropdown.appendChild(newOption);
      });
    })
    .catch((error) => console.error(error));
}

function attachEventListeners() {
  document.querySelector("#registerform").addEventListener("submit", onSubmit);
}

function init() {
  attachEventListeners();
  populateSmsPhoneCountries();
}

init();
