function populateStates() {
  const defaultState = "WA";
  const statesEl = document.querySelector("#state");

  fetch("../../../_assets/json/states.json")
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

  fetch("../../../_assets/json/world-countries/data/en/countries.json")
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
  const caseWorkerEmploymentEl = document.querySelector(
    "#caseworkeremployment"
  );
  const caseWorkerHousingEl = document.querySelector("#caseworkerhousing");
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
      let options = `<option value="">Unassigned</option>`;
      employees.forEach((employee) => {
        const { employeeid, firstname, lastname, status } = employee;
        options += `<option value="${employeeid}">${firstname} ${lastname}</option>`;
      });

      caseWorkerEmploymentEl.innerHTML = options;
      caseWorkerHousingEl.innerHTML = options;

      getParticipant();
    })
    .catch((err) => {
      console.error(err);
    });
}

async function getParticipant() {
  const participantid = getId();
  const accessToken = await getAccessToken();
  const endpoint = "/api/participant-view";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      participantid: participantid,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideSpinner(content, spinner);

      const {
        address,
        city,
        employeeFirstName,
        employeeLastName,
        employeeid,
        caseworkeremployment,
        caseworkerhousing,
        firstname,
        lastname,
        participantid,
        phone,
        phonecountry,
        state,
        zip,
        authorizationdate,
        seeksemployment,
        seekshousing,
      } = data.data;

      // Display full name where needed
      document
        .querySelectorAll("[data-name]")
        .forEach((item) => (item.innerHTML = `${firstname} ${lastname}`));

      // Populate breadcrumb link
      document
        .querySelector("#breadcrumblink")
        .setAttribute("href", `../#${participantid}`);

      // Populate fields

      const participantidEl = document.querySelector("#participantid");
      participantidEl.value = participantid;

      const firstnameEl = document.querySelector("#firstname");
      firstnameEl.value = firstname;

      const lastnameEl = document.querySelector("#lastname");
      lastnameEl.value = lastname;

      const phoneEl = document.querySelector("#phone");
      phoneEl.value = phone;

      const phonecountryEl = document.querySelector("#phonecountry");
      phonecountryEl.value = phonecountry;

      const addressEl = document.querySelector("#address");
      addressEl.value = address;

      const cityEl = document.querySelector("#city");
      cityEl.value = city;

      const stateEl = document.querySelector("#state");
      stateEl.value = state;

      const zipEl = document.querySelector("#zip");
      zipEl.value = zip;

      const needsEmploymentEl = document.querySelector("#needsEmployment");
      needsEmploymentEl.checked = seeksemployment === 1 ? true : false;

      const needsHousingEl = document.querySelector("#needsHousing");
      needsHousingEl.checked = seekshousing === 1 ? true : false;

      const authorizationdateEl = document.querySelector("#authorizationdate");
      const isValidAuthorizationDate =
        moment(authorizationdate).isValid() || false;
      if (isValidAuthorizationDate)
        authorizationdateEl.value =
          moment(authorizationdate).format("YYYY-MM-DD");

      const employeeidEl = document.querySelector("#employeeid");
      employeeidEl.value = employeeid;

      const caseWorkerEmploymentEl = document.querySelector(
        "#caseworkeremployment"
      );
      if (caseworkeremployment !== null)
        caseWorkerEmploymentEl.value = caseworkeremployment;

      const caseWorkerHousingEl = document.querySelector("#caseworkerhousing");
      if (caseworkerhousing !== null)
        caseWorkerHousingEl.value = caseworkerhousing;
    })
    .catch((err) => {
      console.error(err);
    });
}

async function onSubmit(e) {
  e.preventDefault();
  const participantid = document.querySelector("#participantid");
  const firstname = document.querySelector("#firstname");
  const lastname = document.querySelector("#lastname");
  const phone = document.querySelector("#phone");
  const phonecountry = document.querySelector("#phonecountry");
  const address = document.querySelector("#address");
  const city = document.querySelector("#city");
  const state = document.querySelector("#state");
  const zip = document.querySelector("#zip");
  const authorizationdate = document.querySelector("#authorizationdate");
  const needsEmployment =
    document.querySelector("#needsEmployment").checked || false;
  const needsHousing = document.querySelector("#needsHousing").checked || false;
  const employeeid = document.querySelector("#employeeid");
  const caseworkeremployment = document.querySelector("#caseworkeremployment");
  const caseworkerhousing = document.querySelector("#caseworkerhousing");
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");
  const endpoint = "/api/participant-edit";
  const accessToken = await getAccessToken();

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      participantid: participantid.value,
      firstname: firstname.value.trim(),
      lastname: lastname.value.trim(),
      phone: phone.value.trim(),
      phonecountry: phonecountry.value,
      address: address.value.trim(),
      city: city.value.trim(),
      state: state.value,
      zip: zip.value.trim(),
      authorizationdate: authorizationdate.value.trim(),
      needsEmployment: needsEmployment,
      needsHousing: needsHousing,
      employeeid: employeeid.value,
      caseworkeremployment: caseworkeremployment.value,
      caseworkerhousing: caseworkerhousing.value,
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
            "Your account does not have sufficient permissions to perform that action.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
        case "invalid participant id":
          addToast(
            "The edit was unsuccessful because the participant ID was invalid.",
            "Invalid Participant ID",
            "danger"
          );
          window.location.href = "../../";
          break;
        case "first name is missing":
          showError(
            "<div class='text-center'>Please input the first name.</div>",
            "Form Incomplete"
          );
          break;
        case "last name is missing":
          showError(
            "<div class='text-center'>Please input the last name.</div>",
            "Form Incomplete"
          );
          break;
        case "city is missing":
          showError(
            "<div class='text-center'>Please input the city.</div>",
            "Form Incomplete"
          );
          break;
        case "state is missing":
          showError(
            "<div class='text-center'>Please select the state.</div>",
            "Form Incomplete"
          );
          break;
        case "missing authorization date":
          showError("Please input the authorization date.", "Form Incomplete");
          break;
        case "invalid authorization date":
          showError(
            "Please check the authorization date for accuracy and proper formatting."
          );
          break;
        case "invalid phone number":
          showError(
            "The phone number is invalid. Please check it for accuracy and proper formatting.",
            "Form Incomplete"
          );
          break;
        case "phone country required if phone is not blank":
          showError(
            "<div class='text-center'>Please select the country for the phone number.</div>",
            "Country Required"
          );
          break;
        case "invalid phone number for region":
          showError(
            "<div class='text-center'>The phone number does not match the selected country.</div>",
            "Country Mismatch"
          );
          break;
        case "participant updated":
          showSuccess(
            "<div class='text-center'>The participant was updated successfully.</div>",
            "Participant Updated"
          );
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
    .querySelector("#formEditParticipant")
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
