async function getProvider() {
  const providerid = getId();
  const accessToken = await getAccessToken();
  const endpoint = `/api/provider/${providerid}`;
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  if (typeof providerid !== "number") {
    addToast("Invalid housing provider ID", "Can't show provider", "danger");
    window.location.href = "../";
  }

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideSpinner(content, spinner);
      switch (data.msg) {
        case "invalid provider id":
          addToast(
            "Invalid housing provider ID",
            "Can't show provider",
            "danger"
          );
          window.location.href = "../";
          break;
        case "unable to query for provider":
          showError(
            "There was a technical glitch preventing this housing provider from being displayed.  Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "provider retrieved":
          showProvider(data.data);
          break;
      }
    })
    .catch((err) => {
      hideSpinner(content, spinner);
      console.error(err);
    });
}

function loadCountries() {
  const endpoint =
    "../../../../_assets/json/world-countries/data/en/countries.json";
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
  const endpoint = "../../../../_assets/json/states.json";
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

function showProvider(data) {
  const {
    providerid,
    companyname,
    website,
    phone,
    phonecountry,
    address,
    city,
    state,
    zip,
  } = data;

  const breadcrumb_link = document.querySelector("#breadcrumb_link");
  breadcrumb_link.href = `../#${providerid}`;

  document.querySelectorAll("[data-name]").forEach((item) => {
    item.innerHTML = companyname;
  });

  document.querySelector("#providerid").value = providerid;
  document.querySelector("#companyname").value = companyname;
  document.querySelector("#website").value = website;
  document.querySelector("#phone").value = phone;
  document.querySelector("#phonecountry").value = phonecountry;
  document.querySelector("#address").value = address;
  document.querySelector("#city").value = city;
  document.querySelector("#state").value = state;
  document.querySelector("#zip").value = zip;
}

async function onSubmit(e) {
  e.preventDefault();
  const providerid = e.target["providerid"].value;
  const companyname = e.target["companyname"].value.trim();
  const website = e.target["website"].value.trim();
  const phone = e.target["phone"].value.trim();
  const phonecountry = e.target["phonecountry"].value;
  const address = e.target["address"].value;
  const city = e.target["city"].value;
  const state = e.target["state"].value;
  const zip = e.target["zip"].value;
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");
  const endpoint = "/api/provider-edit";
  const accessToken = await getAccessToken();

  hideAlertMessage();
  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      providerid: providerid,
      companyname: companyname,
      website: website,
      phone: phone,
      phonecountry: phonecountry,
      address: address,
      city: city,
      state: state,
      zip: zip,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideSpinner(content, spinner);
      switch (data.msg) {
        case "user is not authorized for this action":
          addToast(
            "You do not have sufficient permissions to edit a housing provider.",
            "Not Authorized",
            "danger"
          );
          window.location.href = `../#${providerid}`;
          break;
        case "missing company name":
          showError(
            "<div class='text-center'>Please input the company name.</div>",
            "Form Incomplete"
          );
          break;
        case "invalid website":
          showError(
            "Please check the Web site address for accuracy and completeness.",
            "Form Incomplete"
          );
          break;
        case "missing phone":
          showError(
            "<div class='text-center'>Please input the phone number.</div>",
            "Form Incomplete"
          );
          break;
        case "missing phone country":
          showError(
            "<div class='text-center'>Please input the country for the phone number.</div>",
            "Form Incomplete"
          );
          break;
        case "missing address":
          showError(
            "<div class='text-center'>Please input the address.</div>",
            "Form Incomplete"
          );
          break;
        case "missing city":
          showError(
            "<div class='text-center'>Please input the city.</div>",
            "Form Incomplete"
          );
          break;
        case "missing state":
          showError(
            "<div class='text-center'>Please select the state.</div>",
            "Form Incomplete"
          );
          break;
        case "missing zip":
          showError(
            "<div class='text-center'>Please input the ZIP.</div>",
            "Form Incomplete"
          );
          break;
        case "unable to query for duplicate company name":
          showError(
            "There was a technical glitch preventing the housing provider from being updated. Please wait a moment then try again.",
            "Could not update"
          );
          break;
        case "company name already exists":
          showError(
            `This company name is already being used by <a href="../#${data.providerid}" class="alert-link">an existing housing provider</a>.`,
            "Duplicate company name"
          );
          break;
        case "unable to query for duplicate phone number":
          showError(
            "There was a technical glitch preventing the housing provider from being updated. Please wait a moment then try again.",
            "Could not update"
          );
          break;
        case "phone number already exists":
          showError(
            `This phone number is already being used by <a href="../#${data.providerid}" class="alert-link">an existing housing provider</a>.`,
            "Duplicate phone number"
          );
          break;
        case "unable to query for duplicate website":
          showError(
            "There was a technical glitch preventing the housing provider from being updated. Please wait a moment then try again.",
            "Could not update"
          );
          break;
        case "website already exists":
          showError(
            `This Web site address is already being used by <a href="../#${data.providerid}" class="alert-link">an existing housing provider</a>.`,
            "Duplicate Web site address"
          );
          break;
        case "invalid phone number":
          showError(
            "<div class='center'>Please check the phone number for accuracy and completeness.</div>",
            "Invalid phone number"
          );
          break;
        case "invalid phone number for region":
          showError(
            "<div class='center'>Please select the correct country for this phone number.</div>",
            "Country does not match phone number"
          );
          break;
        case "unable to update provider":
          showError(
            "There was a technical glitch preventing the housing provider from being updated. Please wait a moment then try again.",
            "Could not update"
          );
          break;
        case "provider updated successfully":
          addToast(
            "The housing provider was updated successfully.",
            "Provider updated",
            "success"
          );
          window.location.href = `../#${data.providerid}`;
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

function attachListeners() {
  document
    .querySelector("#formEditProvider")
    .addEventListener("submit", onSubmit);
}

function init() {
  loadCountries();
  loadStates();
  getProvider();
  attachListeners();
  showToasts();
}

init();
