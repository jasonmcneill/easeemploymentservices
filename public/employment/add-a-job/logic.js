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

function populateEmployers(data) {
  const employer = document.querySelector("#employer");
  let html = `<option value="">(Select)</option>`;
  data.forEach((item) => {
    const { employerid, companyname } = item;
    let option = `<option value="${employerid}">${companyname}</option>`;
    html += option;
  });
  employer.innerHTML = html;
}

async function getEmployers() {
  const endpoint = "/api/employer-list";
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
            "You do not have sufficient permissions to add a job to the system.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "unable to query for employers":
          showError(
            "There was a technical glitch preventing a list of employers from being retrieved, which is necessary in order to add a job. Please wait a moment then reload the page.",
            "Can't Load Employers"
          );
          break;
        case "employers retrieved":
          if (!data.data.length) {
            addToast(
              "You can't add a job until you have added an employer first.",
              "Can't add job",
              "danger"
            );
            window.location.href = "../";
          } else {
            populateEmployers(data.data);
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
      foundbyemployeeid.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
    });
}

async function onSubmit(e) {
  e.preventDefault();
  const accessToken = await getAccessToken();
  const endpoint = "/api/job-add";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");
}

function attachListeners() {
  document.querySelector("#formAddJob").addEventListener("submit", onSubmit);
}

function init() {
  getEmployers();
  getEmployees();
  getStates();
  attachListeners();
  showToasts();
}

init();
