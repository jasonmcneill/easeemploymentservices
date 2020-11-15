function renderData(selector, data) {
  document
    .querySelectorAll(selector)
    .forEach((item) => (item.innerHTML = data));
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

  const mapLinkHtml = `<small><a href="https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&sensor=true">Map</a></small>`;
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
