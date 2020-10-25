function loadCountries() {
  const endpoint = "../../_assets/json/world-countries/data/en/countries.json";
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
  const endpoint = "../../_assets/json/states.json";
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

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      companyname: e.target["companyname"].value.trim(),
      website: e.target["website"].value.trim().toLowerCase(),
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

      hideSpinner(content, spinner);
      switch (data.msg) {
        case "user is not authorized for this action":
          window.location.href = "/";
          break;
        case "missing company name":
          showError("", "Form Incomplete");
          break;
        case "invalid website":
          showError("", "Form Incomplete");
          break;
        case "missing phone":
          showError("", "Form Incomplete");
          break;
        case "missing address":
          showError("", "Form Incomplete");
          break;
        case "missing city":
          showError("", "Form Incomplete");
          break;
        case "missing state":
          showError("", "Form Incomplete");
          break;
        case "missing zip":
          showError("", "Form Incomplete");
          break;
        case "unable to query for duplicate company name":
          showError("", "Database is Down");
          break;
        case "company name already exists":
          showError("", "Duplicate");
          break;
        case "unable to query for duplicate phone number":
          showError("", "Database is Down");
          break;
        case "phone number already exists":
          showError("", "Duplicate");
          break;
        case "unable to query for duplicate website":
          showError("", "Database is Down");
          break;
        case "website already exists":
          showError("", "Duplicate");
          break;
        case "unable to insert new employer":
          showError("", "Database is Down");
          break;
        case "employer added successfully":
          showSuccess("", "Employer Added Successfully");
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
