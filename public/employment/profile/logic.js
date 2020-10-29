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
    createdAt,
  } = data;
  document.title = `${jobtitle} @ ${companyname} (job id: ${jobid})`;

  // Title
  document
    .querySelectorAll("[data-jobtitle]")
    .forEach((item) => (item.innerHTML = jobtitle));

  // Company name
  document
    .querySelectorAll("[data-companyname]")
    .forEach((item) => (item.innerHTML = companyname));

  // Posted on date
  document
    .querySelectorAll("[data-createdAt]")
    .forEach(
      (item) =>
        (item.innerHTML = `Posted: ${moment()
          .tz(timeZone, createdAt)
          .format("MMMM D, YYYY")}`)
    );

  // Hours
  document
    .querySelectorAll("[data-hours]")
    .forEach((item) => (item.innerHTML = hours));

  // Description
  let jobdescriptionbr = jobdescription.replace(/(?:\r\n|\r|\n)/g, "<br>");
  document
    .querySelectorAll("[data-jobdescription]")
    .forEach((item) => (item.innerHTML = jobdescriptionbr));

  // Contact
  document
    .querySelectorAll("[data-contact-name]")
    .forEach((item) => (item.innerHTML = contactname));
  document
    .querySelectorAll("[data-contact-phone]")
    .forEach(
      (item) =>
        (item.innerHTML = `${
          contactphoneext.length >= 1 ? contactphone + "," : contactphone
        }`)
    );
  document
    .querySelectorAll("[data-contact-phone-ext]")
    .forEach(
      (item) =>
        (item.innerHTML = `${
          contactphoneext.length && "Ext. " + contactphoneext
        }`)
    );
  document
    .querySelectorAll("[data-contact-email]")
    .forEach(
      (item) =>
        (item.innerHTML = `<a href="mailto:${contactemail}">${contactemail}</a>`)
    );
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
