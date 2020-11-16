function renderData(selector, data) {
  document.querySelectorAll(selector).forEach((item) => {
    item.innerHTML = data;
    item.classList.add("text-truncate");
  });
}

function showJob(data) {
  const {
    jobid,
    jobtitle,
    participantid,
    participantFirstName,
    participantLastName,
    placementBeginDate,
    hours,
    jobdescription,
    companyname,
    contactname,
    contactphone,
    contactphoneext,
    contactemail,
    address,
    city,
    state,
    zip,
    jobsitedetails,
    createdAt,
  } = data;
  document.title = `${jobtitle} @ ${companyname} (job id: ${jobid})`;
  const timeZone = moment.tz.guess();

  // Title
  renderData("[data-jobtitle]", jobtitle);

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

  // Hours
  renderData("[data-hours]", hours);

  // Description
  renderData("[data-jobdescription]", linebreak(jobdescription));

  // Contact
  renderData("[data-contact-name]", contactname);
  renderData(
    "[data-contact-phone]",
    `${contactphoneext.length >= 1 ? contactphone + "," : contactphone}`
  );
  renderData(
    "[data-contact-phone-ext]",
    `${contactphoneext.length && "Ext. " + contactphoneext}`
  );
  renderData(
    "[data-contact-email]",
    `<a href="mailto:${contactemail}">${contactemail}</a>`
  );

  // Job Site Details
  renderData("[data-address]", address);
  renderData("[data-city]", city);
  renderData("[data-state]", state);
  renderData("[data-zip]", zip);
  renderData("[data-jobsitedetails]", linebreak(jobsitedetails));

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

async function getJobInfo() {
  const timeZone = moment.tz.guess();
  const accessToken = await getAccessToken();
  const jobid = getId();
  const endpoint = `/api/job`;
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      jobid: jobid,
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
            "You are not authorized to view this job.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "invalid job id":
          addToast(
            "The job could not be viewed because the job id could not be determined",
            "Unable to display job info",
            "danger"
          );
          window.location.href = "../";
          break;
        case "unable to query for job":
          console.error(data.error);
          showError(
            "There was a technical glitch preventing the job info from being displayed. Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "retrieved job":
          showJob(data.data);
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
  const jobid = getId();
  window.location.href = `edit/#${jobid}`;
}

function onDelete(e) {
  e.preventDefault();
  $("#modalDeleteJob").modal("show");
}

async function onConfirmDelete(e) {
  e.preventDefault();
  const jobid = getId();
  const accessToken = await getAccessToken();
  const endpoint = "/api/job-delete";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      id: jobid,
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
            "You do not have sufficient permissions to delete a job.",
            "Not authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "invalid job id":
          addToast(
            "The job could not be deleted. Please try again.",
            "Could not delete job",
            "danger"
          );
          break;
        case "unable to query for job placements":
          showError(
            "There was a technical glitch preventing this job from being deleted.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "unable to delete from placement notes":
          showError(
            "There was a technical glitch preventing this job from being deleted.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "unable to delete from placements":
          showError(
            "There was a technical glitch preventing this job from being deleted.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "unable to delete job":
          showError(
            "There was a technical glitch preventing this job from being deleted.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "job deleted":
          addToast(
            "The job was deleted successfully.",
            "Job deleted",
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
  document.querySelector("#btnEditJob").addEventListener("click", onEdit);
  document.querySelector("#btnDeleteJob").addEventListener("click", onDelete);
  document
    .querySelector("#btnConfirmDelete")
    .addEventListener("click", onConfirmDelete);
}

function init() {
  getJobInfo();
  attachListeners();
  showToasts();
}

init();
