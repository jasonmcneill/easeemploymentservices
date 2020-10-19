function renderData(data) {
  const {
    address,
    city,
    employeeFirstName,
    employeeLastName,
    employeeid,
    firstname,
    lastname,
    participantid,
    phone,
    phonecountry,
    state,
    zip,
  } = data;
  const phoneDigitsOnly = phone.replace(/\D/g, "");

  // Populate full name
  document.querySelectorAll("[data-name]").forEach((item) => {
    item.innerHTML = `${firstname} ${lastname}`;
  });

  const participantdataEl = document.querySelector("#participantdata");
  let html = "";

  // Phone
  if (phone.length) {
    html += `
      <tr>
        <th>Phone:</th>
        <td>
          ${phone}
          <p class="mt-2">
            <a href="tel:${phoneDigitsOnly}">Call</a>
            <span class="mx-3">|</span>
            <a href="sms:${phoneDigitsOnly}">Text</a>
          </p>
        </td>
      </tr>
    `;
  }

  // Address
  html += `
    <tr>
      <th>Address:</th>
      <td>
        <div>${address}</div>
        <div>${city}, ${state} ${zip}</div>
      </td>
    </tr>
  `;

  // Assigned Employee
  if (!employeeid) {
    html += `
      <tr>
        <th>Assigned to:</th>
        <td>
          Unassigned
        </td>
      </tr>
    `;
  } else {
    html += `
    <tr>
      <th>Assigned to:</th>
      <td>
        <a href="../../employees/profile/#${employeeid}">${employeeFirstName} ${employeeLastName}</a>
      </td>
    </tr>
  `;
  }

  html = `<table class="table table-bordered my-3">${html}</table>`;
  participantdataEl.innerHTML = html;

  const actionButtons = document.querySelector("#actionButtons");
  actionButtons.classList.remove("d-none");
}

async function getProfileData() {
  const participantid = parseInt(document.location.hash.split("#")[1]) || "";
  const accessToken = await getAccessToken();
  const endpoint = "/api/participant-view";

  const spinner = document.querySelector("#participantdata_spinner");
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
      spinner.classList.add("d-none");
      switch (data.msg) {
        case "user is not authorized for this action":
          addToast(
            "Your account does not have sufficient permissions to perform that action.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
        case "unable to query for participant":
          showError(
            "There was a technical glitch preventing the participant from being displayed. Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "no record of participant":
          addToast(
            "This participant is no longer in the system.",
            "No record of participant",
            "danger"
          );
          history.go(-1);
          break;
        case "participant retrieved":
          renderData(data.data);
          break;
      }
    })
    .catch((err) => {
      spinner.classList.add("d-none");
      console.error(err);
    });
}

function onEdit() {
  const participantid = parseInt(document.location.hash.split("#")[1]) || "";

  window.location.href = `edit/#${participantid}`;
}

function onDelete() {
  $("#modalDeleteParticipant").modal("show");
}

async function onConfirmDelete() {
  const participantid = parseInt(document.location.hash.split("#")[1]) || "";
  const accessToken = await getAccessToken();
  const endpoint = "/api/participant-delete";
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
      switch (data.msg) {
        case "user is not authorized for this action":
          window.location.href = "../../logout/";
          break;
        case "participant id is missing":
          $("#modalDeleteParticipant").modal("hide");
          addToast(
            "The participant could not be deleted because the participant's ID could not be determined.",
            "Unable to Delete",
            "danger"
          );
          window.location.href = "../";
          break;
        case "participant id must be a number":
          addToast(
            "The participant could not be deleted because the participant's ID must be a number.",
            "Unable to Delete",
            "danger"
          );
          window.location.href = "../";
          break;
        case "participant deleted":
          addToast(
            "The participant was deleted successfully.",
            "Participant Deleted",
            "success"
          );
          window.location.href = "../";
          break;
        default:
          $("#modalDeleteParticipant").modal("hide");
          showError(
            "Due to a technical glitch, the participant could not be deleted.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
      }
    });
}

function attachListeners() {
  document.querySelector("#btnEdit").addEventListener("click", onEdit);
  document.querySelector("#btnDelete").addEventListener("click", onDelete);
  document
    .querySelector("#btnConfirmDelete")
    .addEventListener("click", onConfirmDelete);
}

function init() {
  getProfileData();
  attachListeners();
  showToasts();
}

init();
