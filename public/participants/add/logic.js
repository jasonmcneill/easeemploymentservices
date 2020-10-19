async function onSubmit(e) {
  e.preventDefault();
  const firstname = e.target[(id = "firstname")].value.trim();
  const lastname = e.target[(id = "lastname")].value.trim();
  const phone = e.target[(id = "phone")].value.trim();
  const phonecountry = e.target[(id = "phonecountry")].value;
  const address = e.target[(id = "address")].value.trim();
  const city = e.target[(id = "city")].value.trim();
  const state = e.target[(id = "state")].value;
  const zip = e.target[(id = "zip")].value.trim();
  const employeeid = e.target[(id = "employeeid")].value;
  const endpoint = "/api/participant-add";
  const accessToken = await getAccessToken();

  hideAlertMessage();

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      firstname: firstname,
      lastname: lastname,
      phone: phone,
      phonecountry: phonecountry,
      address: address,
      city: city,
      state: state,
      zip: zip,
      employeeid: employeeid,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.msg) {
        case "user is not authorized for this action":
          addToast(
            "Your account does not have sufficient permissions to perform that action.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
        case "missing first name":
          showError("Please input the first name.", "Form Incomplete");
          break;
        case "missing last name":
          showError("Please input the last name.", "Form Incomplete");
          break;
        case "missing city":
          showError("Please input the city.", "Form Incomplete");
          break;
        case "missing state":
          showError("Please select the state.", "Form Incomplete");
          break;
        case "invalid phone number":
          showError(
            "The phone number is invalid. Please check it for accuracy and proper formatting.",
            "Form Incomplete"
          );
          break;
        case "phone country required if phone is not blank":
          showError(
            "Please select the country for the phone number.",
            "Country Required"
          );
          break;
        case "invalid phone number for region":
          showError(
            "The phone number does not match the selected country.",
            "Country Mismatch"
          );
          break;
        case "unable to query for existing participants":
          showError(
            "There was a technical glitch preventing the participant from being added.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "participant already exists":
          showError(
            `This participant is <a href="../profile/#${data.participantid}" class="alert-link">already in the system</a>.`,
            "Duplicate Participant"
          );
          break;
        case "unable to insert participant":
          showError(
            "There was a technical glitch preventing the participant from being added.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "participant added, but unable to query for employee":
          addToast(
            `The participant was added successfully. However, the <a href="../../employees/profile/#${data.employeeid}" class="alert-link">selected employee</a> could not be assigned to the participant.`,
            "Participant Added",
            "warning",
            5000,
            false
          );
          window.location.href = `../profile/#${data.participantid}`;
          break;
        case "participant added, but employee not found":
          addToast(
            `The participant was added successfully. However, the selected employee no longer exists in the system.`,
            "Participant Added",
            "warning",
            5000,
            false
          );
          window.location.href = `../profile/#${data.participantid}`;
          break;
        case "participant added, but unable to associate with employee":
          addToast(
            `The participant was added successfully. However, the <a href="../../employees/profile/#${data.employeeid}" class="alert-link">selected employee</a> could not be assigned to the participant.`,
            "Participant Added",
            "warning",
            5000,
            false
          );
          window.location.href = `../profile/#${data.participantid}`;
          break;
        case "participant added":
          addToast(
            `The participant was added successfully.`,
            "Participant Added Successfully",
            "success",
            3000,
            false
          );
          window.location.href = `../`;
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function populateStates() {
  const defaultState = "WA";
  const statesEl = document.querySelector("#state");

  fetch("../../_assets/json/states.json")
    .then((res) => res.json())
    .then((states) => {
      let options = `<option value="">(Select)</option>`;

      for (const abbrev in states) {
        const value = abbrev;
        const name = states[abbrev];
        if (value === defaultState) {
          options += `<option value="${value}" selected>${name}</option>`;
        } else {
          options += `<option value="${value}">${name}</option>`;
        }
      }

      statesEl.innerHTML = options;
    })
    .catch((err) => {
      console.error(err);
    });
}

function populateCountries() {
  const defaultCountry = "us";
  const countriesEl = document.querySelector("#phonecountry");

  fetch("../../_assets/json/world-countries/data/en/countries.json")
    .then((res) => res.json())
    .then((countries) => {
      let options = `<option value="">(Select)</option>`;
      countries.forEach((country) => {
        const { name, alpha2 } = country;
        if (alpha2 == defaultCountry) {
          options += `<option value="${alpha2}" selected>${name}</option>`;
        } else {
          options += `<option value="${alpha2}">${name}</option>`;
        }
      });
      countriesEl.innerHTML = options;
    })
    .catch((err) => {
      console.error(err);
    });
}

async function populateEmployees() {
  const employeesEl = document.querySelector("#employeeid");
  const endpoint = "/api/employee/employees-list";
  const accessToken = await getAccessToken();

  fetch(endpoint, {
    mode: "cors",
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((employees) => {
      let options = `<option value="">(Select)</option>`;
      const defaultEmployee =
        localStorage.getItem("default_employeeid_for_participants") || "";

      employees.forEach((employee) => {
        const { employeeid, firstname, lastname, status } = employee;

        if (employeeid == defaultEmployee) {
          options += `<option value="${employeeid}" selected>${firstname} ${lastname}</option>`;
        } else {
          options += `<option value="${employeeid}">${firstname} ${lastname}</option>`;
        }
      });

      employeesEl.innerHTML = options;

      if (employees.length === 1) {
        employeesEl[1].selected = true;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function attachListeners() {
  document
    .querySelector("#formAddParticipant")
    .addEventListener("submit", onSubmit);
}

function init() {
  populateStates();
  populateCountries();
  populateEmployees();
  attachListeners();
  showToasts();
}

init();
