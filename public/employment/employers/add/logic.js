function loadCountries() {
  const endpoint =
    "../../../_assets/json/world-countries/data/en/countries.json";
  const countriesEl = document.querySelector("#phonecountry");

  fetch(endpoint)
    .then((res) => res.json())
    .then((countries) => {
      let html = `<option value="">(Select)</option>`;
      countries.forEach((country) => {
        const { alpha2, name } = country;
        let option = `<option value="${alpha2}" ${
          alpha2 === "us" && "selected"
        }>${name}</option>`;
        html += option;
      });
      countriesEl.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
    });
}

function loadStates() {
  const endpoint = "../../../_assets/json/states.json";
  const stateEl = document.querySelector("#state");

  fetch(endpoint)
    .then((res) => res.json())
    .then((states) => {
      let html = `<option value="">(Select)</option>`;
      for (i in states) {
        const abbrev = i;
        const state = states[i];
        const option = `<option value="${abbrev}" ${
          abbrev === "WA" && "selected"
        }>${state}</option>`;
        html += option;
      }
      stateEl.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
    });
}

async function onSubmit(e) {
  e.preventDefault();
  const accessToken = await getAccessToken();
  const spinner = document.querySelector("#spinner");
  const content = document.querySelector("#content");
  const endpoint = "/api/employer-add";

  let website = e.target["website"].value.trim().toLowerCase();
  if (
    website.substr(0, 7) !== "http://" &&
    website.substr(0, 8) !== "https://"
  ) {
    website = `http://${website}`;
  }

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      companyname: e.target["companyname"].value.trim(),
      website: website,
      phone: e.target["phone"].value.trim(),
      phonecountry: e.target["phonecountry"].value,
      address: e.target["address"].value.trim(),
      city: e.target["city"].value.trim(),
      state: e.target["state"].value,
      zip: e.target["zip"].value.trim(),
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      const employerid = data.employerid || "";

      switch (data.msg) {
        case "user is not authorized for this action":
          addToast(
            "You do not have sufficient permissions for that action.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
        case "missing company name":
          hideSpinner(content, spinner);
          showError(
            "<div class='text-center'>Please input the company name.</div>",
            "Form Incomplete"
          );
          break;
        case "invalid website":
          hideSpinner(content, spinner);
          showError(
            "<div class='text-center'>Please check the Web site address for accuracy and proper formatting.</div>",
            "Form Incomplete"
          );
          break;
        case "missing phone":
          hideSpinner(content, spinner);
          showError(
            "<div class='text-center'>Please input the phone number.</div>",
            "Form Incomplete"
          );
          break;
        case "missing phone country":
          hideSpinner(content, spinner);
          showError(
            "<div class='text-center'>Please select the country for the phone number.</div>",
            "Form Incomplete"
          );
          break;
        case "missing address":
          hideSpinner(content, spinner);
          showError(
            "<div class='text-center'>Please input the address.</div>",
            "Form Incomplete"
          );
          break;
        case "missing city":
          hideSpinner(content, spinner);
          showError(
            "<div class='text-center'>Please input the city.</div>",
            "Form Incomplete"
          );
          break;
        case "missing state":
          hideSpinner(content, spinner);
          showError(
            "<div class='text-center'>Please input the state.</div>",
            "Form Incomplete"
          );
          break;
        case "missing zip":
          hideSpinner(content, spinner);
          showError(
            "<div class='text-center'>Please input the ZIP.</div>",
            "Form Incomplete"
          );
          break;
        case "unable to query for duplicate company name":
          hideSpinner(content, spinner);
          showError(
            "There was a technical glitch preventing the system from adding the company.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "company name already exists":
          hideSpinner(content, spinner);
          showError(
            `This company is <a href="../profile/#${data.employerid}" class="alert-link">already in the system</a>.`,
            "Duplicate"
          );
          break;
        case "unable to query for duplicate phone number":
          hideSpinner(content, spinner);
          showError(
            "There was a technical glitch preventing the system from adding the company.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "phone number already exists":
          hideSpinner(content, spinner);
          showError(
            `This company is <a href="../profile/#${data.employerid}" class="alert-link">already in the system</a>.`,
            "Duplicate"
          );
          break;
        case "unable to query for duplicate website":
          hideSpinner(content, spinner);
          showError(
            "There was a technical glitch preventing the system from adding the company.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "website already exists":
          hideSpinner(content, spinner);
          showError(
            `This company is <a href="../profile/#${data.employerid}" class="alert-link">already in the system</a>.`,
            "Duplicate"
          );
          break;
        case "invalid phone number":
          hideSpinner(content, spinner);
          showError(
            "<div class='text-center'>Please check the phone number for accuracy and completeness.</div>",
            "Invalid phone number"
          );
          break;
        case "invalid phone number for region":
          hideSpinner(content, spinner);
          showError(
            "<div class='text-center'>The phone number you entered is not valid in the country specified.</div>",
            "Phone Invalid for Country"
          );
          break;
        case "unable to insert new employer":
          hideSpinner(content, spinner);
          showError(
            "There was a technical glitch preventing the system from adding the company.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "employer added successfully":
          addToast(
            "The employer was added successfully.",
            "Employer Added",
            "success"
          );
          window.location.href = "../";
          break;
      }
    })
    .catch((err) => {
      console.log(err);
      hideSpinner(content, spinner);
    });
}

function attachListeners() {
  document
    .querySelector("#formAddEmployer")
    .addEventListener("submit", onSubmit);
}

function init() {
  loadCountries();
  loadStates();
  attachListeners();
  showToasts();
}

init();
