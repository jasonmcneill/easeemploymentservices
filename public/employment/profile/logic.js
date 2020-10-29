function renderData(selector, data) {
  document
    .querySelectorAll(selector)
    .forEach((item) => (item.innerHTML = data));
}

function showJob(data) {
  const timeZone = moment.tz.guess();
  const {
    jobid,
    jobtitle,
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

  // Title
  renderData("[data-jobtitle]", jobtitle);

  // Company name
  renderData("[data-companyname]", companyname);

  // Posted on date
  renderData(
    "[data-createdAt]",
    `Posted: ${moment(createdAt).tz(timeZone, false).format("MMMM D, YYYY")}`
  );

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
}

async function getJobInfo() {
  const accessToken = await getAccessToken();
  const jobid = parseInt(document.location.hash.split("#")[1]) || "";
  const endpoint = `/api/job/${jobid}`;
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

function init() {
  getJobInfo();
  showToasts();
}

init();
