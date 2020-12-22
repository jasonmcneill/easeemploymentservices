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

async function showProvider(data) {
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
  let countryName = "";
  if (callingCodes.length) {
    callingCodes.forEach((item) => {
      if (item.isoCode.toLowerCase() === phonecountry) {
        dialCode = item.dialCode;
        countryName = item.name;
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
    phonecountry === "us"
      ? `${phone}`
      : `${dialCode} ${phone} <span class="ml-3 text-muted">(${countryName})`;
  document.querySelector(
    "#address"
  ).innerHTML = `${address}<br>${city}, ${state} ${zip}`;
}

function onEdit(e) {
  e.preventDefault();
  const providerid = getId();
  window.location.href = `edit/#${providerid}`;
}

function onDelete(e) {
  e.preventDefault();
  $("#modalDeleteProvider").modal("show");
}

async function onConfirmDelete(e) {
  const providerid = getId();
  const accessToken = await getAccessToken();
  const endpoint = "/api/provider-delete";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  e.preventDefault();

  // Validate
  if (typeof providerid !== "number") {
    $("#modalDeleteProvider").modal("hide");
    return showError(
      "The ID of the housing provider could not be determined from the URL to this page, and so the delete could not be processed.",
      "Could not delete"
    );
  }

  $("#modalDeleteProvider").modal("hide");
  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      providerid: providerid,
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
            "You do not have sufficient permissions to delete a housing provider.",
            "Could not delete",
            "danger"
          );
          window.location.href = "../";
          break;
        case "invalid provider id":
          showError(
            "The ID of the housing provider could not be determined from the URL to this page, and so the delete could not be processed.",
            "Could not delete"
          );
          break;
        case "provider deleted":
          addToast(
            "The housing provider was deleted successfully.",
            "Provider deleted",
            "success"
          );
          window.location.href = "../";
          break;
        default:
          showError(
            "There was a technical glitch preventing the housing provider from being deleted.  Please wait a moment then try again.",
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

function onAddHome(e) {
  const providerid = getId();
  sessionStorage.setItem("addHomeForProvider", providerid);
}

function attachListeners() {
  document.querySelector("#btnEdit").addEventListener("click", onEdit);
  document.querySelector("#btnDelete").addEventListener("click", onDelete);
  document
    .querySelector("#btnConfirmDelete")
    .addEventListener("click", onConfirmDelete);
  document
    .querySelector("a[href='../../add-a-home/']")
    .addEventListener("click", onAddHome);
}

function init() {
  getProvider();
  attachListeners();
  showToasts();
}

init();
