function getStates() {
  const state = document.querySelector("#state");
  const endpoint = "../../_assets/json/states.json";

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
      state.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
    });
}

function populateProviders(data) {
  const providerid = document.querySelector("#providerid");
  let html = `<option value="">(Select)</option>`;
  data.forEach((item) => {
    const { providerid, companyname } = item;
    let option = `<option value="${providerid}">${companyname}</option>`;
    html += option;
  });
  providerid.innerHTML = html;
  preSelectProvider();
}

async function getProviders() {
  const endpoint = "/api/provider-list";
  const accessToken = await getAccessToken();
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

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
        case "user is not authorized for this action":
          addToast(
            "You do not have sufficient permissions to add a home to the system.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "unable to query for providers":
          showError(
            "There was a technical glitch preventing a list of housing providers from being retrieved, which is necessary in order to add a home. Please wait a moment then reload the page.",
            "Can't Load Providers"
          );
          break;
        case "providers retrieved":
          if (!data.data.length) {
            window.location.href = "../providers/add/";
          } else {
            populateProviders(data.data);
          }
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

async function getEmployees() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/employee/employees-list";
  const foundbyemployeeid = document.querySelector("#foundbyemployeeid");
  const userEmployeeid = JSON.parse(atob(accessToken.split(".")[1])).employeeid;

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
      let html = `<option value="">(Select)</option>`;
      data.forEach((item) => {
        const { employeeid, firstname, lastname } = item;
        html += `<option value="${employeeid}" ${
          employeeid == userEmployeeid && "selected"
        }>${firstname} ${lastname}</option>`;
      });
      html += `<option value="0">EASE</option>`;
      foundbyemployeeid.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
    });
}

async function onSubmit(e) {
  e.preventDefault();
  const accessToken = await getAccessToken();
  const endpoint = "/api/home-add";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  const foundbyemployeeid = e.target["foundbyemployeeid"].value;
  const providerid = e.target["providerid"].value.trim();
  const hometitle = e.target["hometitle"].value.trim();
  const homedescription = e.target["homedescription"].value.trim();
  const contactname = e.target["contactname"].value.trim();
  const contactphone = e.target["contactphone"].value.trim();
  const contactphoneext = e.target["contactphoneext"].value.trim();
  const contactemail = e.target["contactemail"].value.trim();
  const address = e.target["address"].value.trim();
  const city = e.target["city"].value.trim();
  const state = e.target["state"].value.trim();
  const zip = e.target["zip"].value.trim();

  document
    .querySelectorAll(".is-invalid")
    .forEach((item) => item.classList.remove("is-invalid"));

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      foundbyemployeeid: foundbyemployeeid,
      providerid: providerid,
      hometitle: hometitle,
      homedescription: homedescription,
      contactname: contactname,
      contactphone: contactphone,
      contactphoneext: contactphoneext,
      contactemail: contactemail,
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
            "You do not have sufficient permissions to add a home.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "invalid foundbyemployeeid":
          document
            .querySelector("#foundbyemployeeid")
            .classList.add("is-invalid");
          showError(
            `Please select an item under "Found by" to indicate which employee found this home. If not applicable, select "EASE."`,
            "Form Incomplete"
          );
          break;
        case "invalid provider id":
          document.querySelector("#providerid").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please select the housing provider.</div>",
            "Form Incomplete"
          );
          break;
        case "missing home title":
          document.querySelector("#hometitle").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please input the home title.</div>",
            "Form Incomplete"
          );
          break;
        case "missing city":
          document.querySelector("#city").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please input the city.</div>",
            "Form Incomplete"
          );
          break;
        case "missing state":
          document.querySelector("#state").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please select the state.</div>",
            "Form Incomplete"
          );
          break;
        case "unable to query whether provider still exists":
          console.error(data.error);
          showError(
            "There was a technical glitch which prevented the home from being added.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "provider no longer exists":
          document.querySelector("#providerid").classList.add("is-invalid");
          addToast(
            "The housing provider that you selected no longer exists.",
            "Invalid provider",
            "danger"
          );
          window.location.reload();
          break;
        case "invalid email format":
          document.querySelector("#contactemail").classList.add("is-invalid");
          showError("", "Form Incomplete");
          break;
        case "unable to query whether home is a duplicate":
          console.error(data.error);
          showError(
            "There was a technical glitch which prevented the home from being added.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "home already exists":
          showError(
            `A home with this title and this housing provider <a href="../profile/#${data.homeid}" class="alert-link">already exists</a>.`,
            "Duplicate"
          );
          break;
        case "invalid phone number":
          document.querySelector("#contactphone").classList.add("is-invalid");
          showError(
            "Please check the phone number of the home's contact for accuracy.",
            "Invalid phone number"
          );
          break;
        case "invalid phone number for region":
          document.querySelector("#contactphone").classList.add("is-invalid");
          showError(
            "Please input only a U.S. phone number for the home's contact.",
            "U.S. phone number required"
          );
          break;
        case "phone is required if phone extension is not blank":
          document.querySelector("#contactphone").classList.add("is-invalid");
          showError(
            "You have provided a phone extension, but the phone number is blank. Please input the phone number.",
            "Form Incomplete"
          );
          break;
        case "unable to insert home":
          console.error(data.error);
          showError(
            "There was a technical glitch which prevented the home from being added.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "home added":
          addToast("The home was added successfully.", "Home Added", "success");
          window.location.href = "../";
          break;
      }
    })
    .catch((err) => {
      hideSpinner(content, spinner);
      console.error(err);
    });
}

function preSelectProvider() {
  const preSelectedProvider =
    sessionStorage.getItem("addHomeForProvider") || "";
  const providerid = document.querySelector("#providerid");

  if (preSelectedProvider.length) providerid.value = preSelectedProvider;
  sessionStorage.removeItem("addHomeForProvider");
}

function attachListeners() {
  document.querySelector("#formAddHome").addEventListener("submit", onSubmit);
}

function init() {
  getProviders();
  getEmployees();
  getStates();
  attachListeners();
  showToasts();
}

init();
