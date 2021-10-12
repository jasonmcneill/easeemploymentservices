function showEmployee() {
  const spinner = document.querySelector("#spinner");
  const contentEl = document.querySelector("#employeescontainer");
  const employeeid = getId();
  if (typeof employeeid !== "number") window.location.href = "/employees/";
  const endpoint = `/api/employee/${employeeid}`;

  async function populateContent(data) {
    if (Array.isArray(data) && !data.length) {
      return showError(
        `
        <p class='text-center'>There is no record corresponding to this employee ID.</p>
        <p class='text-center'><a href='../' class='alert-link'>Return to Employees list</a></p>
      `,
        "Employee Not Found"
      );
    }

    switch (data.msg) {
      case "user is not authorized for this action":
        addToast(
          "Your account does not have sufficient permissions to perform that action.",
          "Not Authorized",
          "danger"
        );
        window.location.href = "/";
        break;
    }

    const {
      firstname,
      lastname,
      type,
      status,
      phone,
      smsphone,
      email,
      email_personal,
    } = data[0];
    const phoneNums = new String(phone).replace(/\D/g, "");
    const smsphoneNums = new String(smsphone).replace(/\D/g, "");
    const name = `${firstname} ${lastname}`;
    const accessToken = await getAccessToken();
    const employeeid_of_requestor = JSON.parse(atob(accessToken.split(".")[1]));

    // Hide delete button if user is employee shown
    if (employeeid === employeeid_of_requestor) {
      document
        .querySelector("#btnShowDeleteModal_container")
        .classList.add("d-none");
    }

    document.querySelectorAll(".employeeName").forEach((item) => {
      item.innerHTML = name;
    });
    render("type", type, `${type}`);
    render(
      "phone",
      phone,
      `
        ${phone}
        <p class="mt-2 mb-0">
          <a href="tel:${phoneNums}">Call</a>
        </p>
      `
    );
    render(
      "smsphone",
      smsphone,
      `
        ${smsphone}
        <p class="mt-2 mb-0">
          <a href="tel:${smsphoneNums}">Call</a> <span class="mx-3">|</span> <a href="sms:${smsphoneNums}">Text</a>
        </p>
      `
    );
    render("email", email, `<a href="mailto:${email}">${email}</a>`);
    render(
      "email-personal",
      email_personal,
      `<a href="mailto:${email_personal}">${email_personal}</a>`
    );
    render("status", status, `${status}`);
    if (status === "pending") {
      document.querySelector("#btnEdit").setAttribute("disabled", true);
    }

    const linkTimeEntries = document.querySelector("#linkTimeEntries");
    linkTimeEntries.setAttribute("href", `../time/#${employeeid}`);

    const linkHoursSummary = document.querySelector("#linkHoursSummary");
    linkHoursSummary.setAttribute("href", `../time/summary/#${employeeid}`);
  }

  async function getContent() {
    const accessToken = await getAccessToken();
    const employeeid = getId();
    const endpoint = `/api/employee/${employeeid}`;
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
        switch (data.msg) {
          case "user is not authorized for this action":
            addToast(
              "Your account does not have sufficient permissions to view that content.",
              "Not Authorized",
              "danger"
            );
            window.location.href = "/";
            break;
        }

        populateContent(data);
      })
      .catch((error) => {
        console.error(error);
        if (!navigator.onLine) {
          return showError(
            "You appear to be offline. Please connect to the internet, then reload the page.",
            "No Connection"
          );
        }
      })
      .finally(() => {
        hideSpinner(contentEl, spinner);
      });
  }

  showSpinner(contentEl, spinner);
  getContent();
  hideSpinner(contentEl, spinner);
}

function onShowDeleteModal(e) {
  e.preventDefault();
  $("#modalDeleteEmployee").modal();
}

async function onConfirmDelete(e) {
  e.preventDefault();
  const employeeid = getId();
  const endpoint = `/api/employee/delete`;
  const spinner = document.querySelector("#spinner");
  const content = document.querySelector("#employeescontainer");
  const accessToken = await getAccessToken();

  if (typeof employeeid !== "number") {
    return showError(
      "<div class='text-center'>An invalid value for the employee ID is specified in the address bar.</div>",
      "Invalid Employee ID"
    );
  }

  $("#modalDeleteEmployee").modal("hide");

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
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
        case "invalid employee id":
          showError(
            "The employee ID parameter in the address bar is in an invalid format.",
            "Unable to Delete"
          );
          break;
        case "cannot delete oneself":
          showError(
            "<div class='text-center'>You may not delete your own employee record.</div>",
            "Not Permitted"
          );
          break;
        case "unable to query for employeeid":
          showError(
            "There was a technical glitch that prevented this request from being processed.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "no record of employeeid":
          addToast(
            "There was no employee record to be deleted.",
            "Employee not Found",
            "warning",
            5000,
            false
          );
          window.location.href = "/employees/";
          break;
        case "no record of employeeid":
          showError(
            "There was a technical glitch that prevented this request from being processed.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "employee deleted":
          const employeeName = data.name || "";
          hideSpinner(content, spinner);
          addToast(
            `${employeeName} was deleted successfully.`,
            "Employee Deleted",
            "secondary",
            3500
          );
          window.location.href = "/employees/";
          break;
      }
    })
    .finally(() => {
      hideSpinner(content, spinner);
    });
}

async function getManagedParticipants() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/participants-of-employee";
  const employeeid = getId();

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
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
          showToast(
            "Participants managed by this employee could not be retrieved because you do not have sufficient permissions.",
            "Not authorized",
            "danger"
          );
          break;
        case "invalid employee id":
          addToast(
            "Employee's data could not be displayed because the page URL was malformed.",
            "Unable to display employee",
            "danger"
          );
          window.location.href = "../";
          break;
        case "unable to query for participants of employee":
          showToast(
            "Participants managed by this employee could not be retrieved.",
            "Database is Down",
            "danger"
          );
          break;
        case "participants of employee retrieved":
          const participants = data.participants || [];
          if (participants.length) showManagedParticipants(participants);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function showManagedParticipants(participants) {
  const participantList_container = document.querySelector(
    "#participantList_container"
  );
  const participantList = document.querySelector("#participantList");
  let html = "";

  participants.forEach((item) => {
    const {
      participantid,
      firstname,
      lastname,
      caseworkeremployment,
      caseworkerhousing,
    } = item;
    const employeeid =
      JSON.parse(atob(sessionStorage.getItem("accessToken").split(".")[1]))
        .employeeid || "";

    html += `
      <a href="../../participants/profile/#${participantid}" class="list-group-item list-group-item-action">
        ${firstname} ${lastname}
        <div class="float-right">
          ${
            caseworkeremployment === employeeid
              ? '<span class="badge badge-info badge-pill ml-1" data-bs-toggle="tooltip" data-bs-placement="top" title="Managed for employment">E</span>'
              : ""
          }
          ${
            caseworkerhousing === employeeid
              ? '<span class="badge badge-info badge-pill ml-1" data-bs-toggle="tooltip" data-bs-placement="top" title="Managed for housing">H</span>'
              : ""
          }
        </div>
      </a>
    `;
  });

  html = `<div class="list-group">${html}</div>`;
  participantList.innerHTML = html;
  enableTooltips();
  participantList_container.classList.remove("d-none");
}

function enableTooltips() {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

function attachListeners() {
  const employeeid = getId();

  // Edit button
  document.querySelector("#btnEdit").addEventListener("click", () => {
    const destination = `edit/#${employeeid}`;
    location.href = destination;
  });

  // Delete button and modal
  document
    .querySelector("#btnShowDeleteModal")
    .addEventListener("click", onShowDeleteModal);

  document
    .querySelector("#btnConfirmDelete")
    .addEventListener("click", onConfirmDelete);
}

function init() {
  checkIfOffline();
  showEmployee();
  getManagedParticipants();
  attachListeners();
  showToasts();
}

init();
