function renderData(selector, data) {
  document.querySelectorAll(selector).forEach((item) => {
    item.innerHTML = data;
    item.classList.add("text-truncate");
  });
}

function showHome(data) {
  const {
    homeid,
    hometitle,
    participantid,
    participantFirstName,
    participantLastName,
    placementBeginDate,
    homedescription,
    companyname,
    providerid,
    contactname,
    contactphone,
    contactphoneext,
    contactemail,
    address,
    city,
    state,
    zip,
    createdAt,
  } = data;
  document.title = `${hometitle} @ ${companyname} (home id: ${homeid})`;
  const timeZone = moment.tz.guess();

  // Title
  renderData("[data-hometitle]", hometitle);

  // Company name
  renderData("[data-companyname]", companyname);

  // Posted on date
  renderData(
    "[data-createdAt]",
    `Posted: ${moment(createdAt).tz(timeZone, false).format("MMMM D, YYYY")}`
  );

  // Filled by participant
  if (participantid !== null) {
    const filledby = document.querySelector("#filledby");
    renderData(
      "[data-participant]",
      `<a href="../../participants/profile/#${participantid}">${participantFirstName} ${participantLastName}</a>`
    );
    renderData(
      "[data-begindate]",
      `On ${moment(placementBeginDate).tz(timeZone).format("MMMM D, YYYY")}`
    );
    filledby.classList.remove("d-none");
  }

  // Description
  renderData("[data-homedescription]", linebreak(homedescription));

  // Contact
  if (contactname === companyname) {
    renderData(
      "[data-company-name]",
      `<a href="../providers/profile/#${providerid}">${companyname}</a>`
    );
  } else {
    renderData("[data-contact-name]", contactname);
    renderData(
      "[data-company-name]",
      `<a href="../providers/profile/#${providerid}">${companyname}</a>`
    );
  }

  renderData(
    "[data-contact-phone]",
    `${contactphoneext.length >= 1 ? contactphone + "," : contactphone}`
  );
  if (contactphoneext.length) {
    renderData(
      "[data-contact-phone-ext]",
      `${contactphoneext.length && "Ext. " + contactphoneext}`
    );
  }
  renderData(
    "[data-contact-email]",
    `<a href="mailto:${contactemail}">${contactemail}</a>`
  );

  // Address
  renderData("[data-address]", address);
  renderData("[data-city]", city);
  renderData("[data-state]", state);
  renderData("[data-zip]", zip);

  // Map Link
  const mapAddress = `${address}, ${city}, ${state}, ${zip}`;
  const encodedAddress = encodeURI(mapAddress);

  const mapLinkHtml = `
    <a href="https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&sensor=true" class="btn btn-outline-info btn-sm">
      Map
      <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-geo-alt" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M12.166 8.94C12.696 7.867 13 6.862 13 6A5 5 0 0 0 3 6c0 .862.305 1.867.834 2.94.524 1.062 1.234 2.12 1.96 3.07A31.481 31.481 0 0 0 8 14.58l.208-.22a31.493 31.493 0 0 0 1.998-2.35c.726-.95 1.436-2.008 1.96-3.07zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
        <path fill-rule="evenodd" d="M8 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
      </svg>
    </a>
  `;
  renderData("#maplink", mapLinkHtml);
}

async function getHomeInfo() {
  const timeZone = moment.tz.guess();
  const accessToken = await getAccessToken();
  const homeid = getId();
  const endpoint = `/api/home`;
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      homeid: homeid,
      timeZone: timeZone,
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
            "You are not authorized to view this home.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "invalid home id":
          addToast(
            "The home could not be viewed because the home id could not be determined",
            "Unable to display home info",
            "danger"
          );
          window.location.href = "../";
          break;
        case "unable to query for home":
          console.error(data.error);
          showError(
            "There was a technical glitch preventing the home info from being displayed. Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "retrieved home":
          showHome(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

function onEdit(e) {
  e.preventDefault();
  const homeid = getId();
  window.location.href = `edit/#${homeid}`;
}

function onDelete(e) {
  e.preventDefault();
  $("#modalDeleteHome").modal("show");
}

async function onConfirmDelete(e) {
  e.preventDefault();
  const homeid = getId();
  const accessToken = await getAccessToken();
  const endpoint = "/api/home-delete";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      id: homeid,
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
            "You do not have sufficient permissions to delete a home.",
            "Not authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "invalid home id":
          addToast(
            "The home could not be deleted. Please try again.",
            "Could not delete home",
            "danger"
          );
          break;
        case "unable to query for home placements":
          showError(
            "There was a technical glitch preventing this home from being deleted.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "unable to delete from placement notes":
          showError(
            "There was a technical glitch preventing this home from being deleted.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "unable to delete from placements":
          showError(
            "There was a technical glitch preventing this home from being deleted.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "unable to delete home":
          showError(
            "There was a technical glitch preventing this home from being deleted.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "home deleted":
          addToast(
            "The home was deleted successfully.",
            "Home deleted",
            "success"
          );
          window.location.href = "../";
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

function attachListeners() {
  document.querySelector("#btnEditHome").addEventListener("click", onEdit);
  document.querySelector("#btnDeleteHome").addEventListener("click", onDelete);
  document
    .querySelector("#btnConfirmDelete")
    .addEventListener("click", onConfirmDelete);
}

function init() {
  getHomeInfo();
  attachListeners();
  showToasts();
}

init();
