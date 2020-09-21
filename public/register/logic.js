function onSubmit(e) {
  e.preventDefault();
  const firstname = e.target["firstname"].value.trim();
  const lastname = e.target["lastname"].value.trim();
  const email = e.target["email"].value.trim();
  const smsphone = e.target["smsphone"].value.trim();
  const smsphonecountry = e.target["smsphonecountry"].value;
  const username = e.target["username"].value.trim();
  const password = e.target["password"].value.trim();
  const endpoint = "/register";
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
          showError(
            "<div class='text-center'>Please use a valid phone number.</div>",
            "Form Incomplete"
          );
          break;
        case "mobile phone number not valid for country":
          showError(
            "Please use a mobile phone number that matches the country you selected.",
            "Incorrect Country"
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
        case "unable to query for eligibility":
          showError(
            "<div class='text-center'>It appears that the database is not accessible.  Please wait a moment then try again.</div>",
            "Database is Down"
          );
          break;
        case "not eligible to register":
          showError(
            "In order to register, your e-mail address must be pre-approved and input into the system in advance.  Please arrange this with your direct report, then try registering again.",
            "Not Eligible"
          );
          break;
        case "e-mail address is taken":
          showError(
            "<div class='text-center'>Your e-mail address is already being used by a registered user.</div>",
            "E-mail in Use"
          );
          break;
        case "mobile phone number not valid":
          showError(
            "<div class='text-center'>Please input a valid mobile phone number.</div>",
            "Invalid Phone Number"
          );
          break;
        case "mobile phone number not valid for country":
          showError(
            "Please select the country that correctly corresponds to your mobile phone number.",
            "Invalid Phone Country"
          );
          break;
        case "mobile phone number is not sms capable":
          showError(
            "Please use a mobile phone number that is capable of receiving text messages.",
            "Invalid Phone Number"
          );
          break;
        case "unable to query for username":
          showError(
            "It appears that the database is not accessible.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "username is taken":
          showError(
            "The username that you have provided is already being used by a registered user.",
            "Username in Use"
          );
          break;
        case "password lacks sufficient complexity":
          showError(
            `
              <p>Please revise your password.  For your protection, we require that it must have a minimum level of unpredictability in order to prevent potential hackers from guessing it.</p>
              <p>A minimum length of 8 characters is required.  Using a phrase (rather than a single word) is encouraged, because phrases are less predictable.
            `,
            "Password is Too Predictable"
          );
          break;
        case "unable to query for sms phone":
          showError(
            "It appears that the database is not accessible.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "sms phone is taken":
          showError(
            "<div class='text-center'>Your mobile phone number is already being used by a registered user.</div>",
            "Phone Number in Use"
          );
          break;
        case "unable to generate password salt":
          showError(
            "There was a technical glitch which prevented us from processing your registration.  Please wait a moment, then try registering 0again.",
            "System is Down"
          );
          break;
        case "unable to generate password hash":
          showError(
            "There was a technical glitch which prevented us from processing your registration.  Please wait a moment, then try registering again.",
            "System is Down"
          );
          break;
        case "unable to insert new user":
          showError(
            "It appears that the database is not accessible.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "unable to insert registration token":
          showError(
            "It appears that the database is not accessible.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "confirmation e-mail could not be sent":
          showError(
            "There was a technical glitch which prevented us from processing your registration.  Please wait a moment, then try registering again.",
            "System is Down"
          );
          break;
        case "confirmation e-mail sent":
          document.querySelector("#registerform").classList.add("d-none");
          showSuccess(
            "Please check your e-mail.  We have sent you a link that you must click on in order to confirm your e-mail address and complete your registration.",
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
