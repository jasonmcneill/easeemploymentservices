function populateSmsPhoneCountries() {
  const countriesDropdown = document.querySelector("#smsphonecountry");
  const endpoint = "/_assets/json/world-countries/data/en/countries.json";

  return new Promise((resolve, reject) => {
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
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

function populateProfileData(data) {
  const {
    email = "",
    email_personal = "",
    firstname = "",
    lastname = "",
    phone = "",
    smsphone = "",
    smsphonecountry = "",
    username = "",
  } = data;

  const emailEl = document.querySelector("#email");
  const emailPersonalEl = document.querySelector("#email_personal");
  const firstnameEl = document.querySelector("#firstname");
  const lastnameEl = document.querySelector("#lastname");
  const smsphoneEl = document.querySelector("#smsphone");
  const smsphonecountryEl = document.querySelector("#smsphonecountry");
  const phoneEl = document.querySelector("#phone");
  const usernameEl = document.querySelector("#username");

  emailEl.value = email;
  emailPersonalEl.value = email_personal;
  firstnameEl.value = firstname;
  lastnameEl.value = lastname;
  smsphoneEl.value = smsphone;
  smsphonecountryEl.value = smsphonecountry;
  phoneEl.value = phone;
  usernameEl.value = username;

  const userRole =
    JSON.parse(atob(sessionStorage.getItem("accessToken").split(".")[1]))
      .type || "regular";

  const mayEditEmail = ["director", "sysadmin"].includes(userRole) || false;

  if (mayEditEmail) emailEl.removeAttribute("readonly");
}

async function getProfileData() {
  const endpoint = "/api/profile-view";
  const accessToken = await getAccessToken();

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.msg) {
        case "user is not authorized for this action":
          window.location.href = "/logout/";
          break;
        case "unable to query for employee":
          showError(
            "There was a technical glitch preventing your profile information from being retrieved. Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "employee not found":
          window.location.href = "/logout/";
          break;
        case "profile retrieved":
          populateProfileData(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

async function onSubmit(e) {
  e.preventDefault();
  const endpoint = "/api/profile-edit";
  const accessToken = await getAccessToken();
  const form = document.querySelector("#profileform");
  const spinner = document.querySelector("#spinner");

  const emailEl = document.querySelector("#email");
  const emailPersonalEl = document.querySelector("#email_personal");
  const firstnameEl = document.querySelector("#firstname");
  const lastnameEl = document.querySelector("#lastname");
  const smsphoneEl = document.querySelector("#smsphone");
  const smsphonecountryEl = document.querySelector("#smsphonecountry");
  const phoneEl = document.querySelector("#phone");
  const usernameEl = document.querySelector("#username");
  const passwordEl = document.querySelector("#password");

  document
    .querySelectorAll(".is-invalid")
    .forEach((item) => item.classList.remove("is-invalid"));

  hideAlertMessage();
  showSpinner(form, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      email: emailEl.value.trim(),
      email_personal: emailPersonalEl.value.trim(),
      firstname: firstnameEl.value.trim(),
      lastname: lastnameEl.value.trim(),
      smsphone: smsphoneEl.value.trim(),
      smsphonecountry: smsphonecountryEl.value,
      phone: phoneEl.value.trim(),
      username: usernameEl.value.trim(),
      password: passwordEl.value.trim(),
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideSpinner(form, spinner);
      switch (data.msg) {
        case "first name is missing":
          firstnameEl.classList.add("is-invalid");
          showError(
            `<div class='text-center'>Please input your first name.</div>`,
            "Form Incomplete"
          );
          break;
        case "last name is missing":
          lastnameEl.classList.add("is-invalid");
          showError(
            `<div class='text-center'>Please input your last name.</div>`,
            "Form Incomplete"
          );
          break;
        case "email is missing":
          emailEl.classList.add("is-invalid");
          showError(
            `<div class='text-center'>Please input your e-mail address.</div>`,
            "Form Incomplete"
          );
          break;
        case "sms phone is missing":
          smsphoneEl.classList.add("is-invalid");
          showError(
            `<div class='text-center'>Please input your mobile phone number.</div>`,
            "Form Incomplete"
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
        case "sms phone country is missing":
          smsphonecountryEl.classList.add("is-invalid");
          showError(
            `<div class='text-center'>Please select the country of your mobile phone.</div>`,
            "Form Incomplete"
          );
          break;
        case "sms phone already taken":
          smsphoneEl.classList.add("is-invalid");
          showError(
            "Your mobile phone number is already being used by another user. Please input a different mobile phone number.",
            "Mobile Phone Already Taken"
          );
          break;
        case "username is missing":
          usernameEl.classList.add("is-invalid");
          showError(
            `<div class='text-center'>Please input your username.</div>`,
            "Form Incomplete"
          );
          break;
        case "password lacks sufficient complexity":
          passwordEl.classList.add("is-invalid");
          showError(
            `
              <p>Please revise your password.  For your protection, we require that it must have a minimum level of unpredictability in order to prevent potential hackers from guessing it.</p>
              <p>A minimum length of 8 characters is required.  Using a phrase (rather than a single word) is encouraged, because phrases are less predictable.
            `,
            "Password is Too Predictable"
          );
          break;
        case "record updated":
          showSuccess(
            `<div class="text-center">Your changes have been saved.</div>`,
            "Profile Updated"
          );
          passwordEl.value = "";
          smsphoneEl.value = data.smsphoneNationalFormat || smsphone;
          phoneEl.value = data.phoneNationalFormat || "";
          break;
        default:
          showError(
            "There was a technical glitch preventing your profile from being updated. Please wait a moment then try again.",
            "Database is Down"
          );
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(form, spinner);
    });
}

function attachEventListeners() {
  document.querySelector("#profileform").addEventListener("submit", onSubmit);
}

async function init() {
  await populateSmsPhoneCountries();
  getProfileData();
  checkIfOffline();
  attachEventListeners();
  showToasts();
}

init();
