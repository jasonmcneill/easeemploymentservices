function getCallingCodes() {
  const endpoint = "../../../../_assets/json/calling-codes.json";
  return new Promise((resolve, reject) => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

async function getEmployer() {
  const employerid = parseInt(document.location.hash.split("#")[1]) || "";
  const accessToken = await getAccessToken();
  const endpoint = `/api/employer/${employerid}`;
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  if (typeof employerid !== "number") {
    addToast("Invalid employer ID", "Can't show employer", "danger");
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
        case "invalid employer id":
          addToast("Invalid employer ID", "Can't show employer", "danger");
          window.location.href = "../";
          break;
        case "unable to query for employer":
          showError(
            "There was a technical glitch preventing this employer from being displayed.  Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "employer retrieved":
          showEmployer(data.data);
          break;
      }
    })
    .catch((err) => {
      hideSpinner(content, spinner);
      console.error(err);
    });
}

async function showEmployer(data) {
  const {
    companyname,
    website,
    phone,
    phonecountry,
    address,
    city,
    state,
    zip,
  } = data;

  const callingCodes = await getCallingCodes();
  let dialCode = "";
  if (callingCodes.length) {
    callingCodes.forEach((item) => {
      if (item.isoCode.toLowerCase() === phonecountry) {
        dialCode = item.dialCode;
      }
    });
  }

  document.querySelectorAll("[data-name]").forEach((item) => {
    item.innerHTML = companyname;
  });

  document.querySelector(
    "#website"
  ).innerHTML = `<a href="${website}">${website}</a>`;
  document.querySelector("#phone").innerHTML =
    phonecountry === "us" ? `${phone}` : `${dialCode} ${phone}`;
  document.querySelector(
    "#address"
  ).innerHTML = `${address}<br>${city}, ${state} ${zip}`;
}

function onEdit(e) {
  e.preventDefault();
  const employerid = parseInt(document.location.hash.split("#")[1]) || "";
  window.location.href = `edit/#${employerid}`;
}

function onDelete(e) {
  e.preventDefault();
  $("#modalDeleteEmployer").modal("show");
}

async function onConfirmDelete(e) {
  const employerid = parseInt(document.location.hash.split("#")[1]) || "";
  const accessToken = await getAccessToken();
  const endpoint = "/api/employer-delete";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  e.preventDefault();

  // Validate
  if (typeof employerid !== "number") {
    $("#modalDeleteEmployer").modal("hide");
    return showError(
      "The ID of the employer could not be determined from the URL to this page, and so the delete could not be processed.",
      "Could not delete"
    );
  }

  $("#modalDeleteEmployer").modal("hide");
  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      employerid: employerid,
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
            "You do not have sufficient permissions to delete an employer.",
            "Could not delete",
            "danger"
          );
          window.location.href = "../";
          break;
        case "invalid employer id":
          showError(
            "The ID of the employer could not be determined from the URL to this page, and so the delete could not be processed.",
            "Could not delete"
          );
          break;
        case "employer deleted":
          addToast(
            "The employer was deleted successfully.",
            "Employer deleted",
            "success"
          );
          window.location.href = "../";
          break;
        default:
          showError(
            "There was a technical glitch preventing the employer from being deleted.  Please wait a moment then try again.",
            "Could not delete"
          );
          console.error(data.error);
          break;
      }
    })
    .catch((err) => {
      hideSpinner(content, spinner);
      console.error(err);
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
  getEmployer();
  attachListeners();
  showToasts();
}

init();
