function getStates(selectedState) {
  const state = document.querySelector("#state");
  const endpoint = "../../../_assets/json/states.json";

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
      state.value = selectedState;
    })
    .catch((err) => {
      console.error(err);
    });
}

function populateEmployers(data, selectedEmployerId) {
  const employerid = document.querySelector("#employerid");
  let html = `<option value="">(Select)</option>`;
  data.forEach((item) => {
    const { employerid, companyname } = item;
    let option = `<option value="${employerid}">${companyname}</option>`;
    html += option;
  });
  employerid.innerHTML = html;
  employerid.value = selectedEmployerId;
}

async function getEmployers(selectedEmployerId) {
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
            populateEmployers(data.data, selectedEmployerId);
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
      html += `<option value="0">EASE</option>`;
      foundbyemployeeid.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
    });
}

async function getJobData() {
  const jobid = getId();
  const accessToken = await getAccessToken();
  const endpoint = `/api/job-full/${jobid}`;
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
            "You to not have sufficient permissions to edit a job.",
            "Not authorized",
            "danger"
          );
          break;
        case "unable to query for job":
          showError(
            "There was a technical glitch that prevented the job details from being retrieved.  Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "job retrieved":
          populateForm(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

function populateForm(data) {
  const timeZone = moment.tz.guess();
  const {
    address,
    city,
    companyname,
    contactemail,
    contactname,
    contactphone,
    contactphoneext,
    createdAt,
    employerid,
    foundbyemployeeid,
    hours,
    jobdescription,
    jobid,
    jobsitedetails,
    jobtitle,
    state,
    zip,
  } = data;

  document
    .querySelectorAll("[data-jobname]")
    .forEach((item) => (item.innerHTML = jobtitle));

  document.querySelector("#breadcrumblink").href = `../#${jobid}`;

  document.querySelector("#foundbyemployeeid").value = foundbyemployeeid;

  document.querySelector("#employerid").value = employerid;

  document.querySelector("#jobtitle").value = jobtitle;

  document.querySelector("[data-companyname]").innerHTML = companyname;

  document.querySelector("#hours").value = hours;

  document.querySelector("#jobdescription").value = jobdescription;

  document.querySelector("#contactname").value = contactname;

  document.querySelector("#contactphone").value = contactphone;

  document.querySelector("#contactphoneext").value = contactphoneext;

  document.querySelector("#contactemail").value = contactemail;

  document.querySelector("#address").value = address;

  document.querySelector("#city").value = city;

  document.querySelector("#state").value = state;

  document.querySelector("#zip").value = zip;

  document.querySelector("#jobsitedetails").value = jobsitedetails;

  document.querySelector("[data-createdAt]").innerHTML = `
    Posted: 
      ${moment(createdAt).tz(timeZone, false).format("MMMM D, YYYY")}`;

  getStates(state);
  getEmployees(foundbyemployeeid);
  getEmployers(employerid);
}

async function onSubmit(e) {
  e.preventDefault();
  const accessToken = await getAccessToken();
  const endpoint = "/api/job-edit";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  const foundbyemployeeid = e.target["foundbyemployeeid"].value;
  const employerid = e.target["employerid"].value.trim();
  const jobtitle = e.target["jobtitle"].value.trim();
  const hours = e.target["hours"].value;
  const jobdescription = e.target["jobdescription"].value.trim();
  const contactname = e.target["contactname"].value.trim();
  const contactphone = e.target["contactphone"].value.trim();
  const contactphoneext = e.target["contactphoneext"].value.trim();
  const contactemail = e.target["contactemail"].value.trim();
  const address = e.target["address"].value.trim();
  const city = e.target["city"].value.trim();
  const state = e.target["state"].value.trim();
  const zip = e.target["zip"].value.trim();
  const jobsitedetails = e.target["jobsitedetails"].value.trim();
  const jobid = getId();

  document
    .querySelectorAll(".is-invalid")
    .forEach((item) => item.classList.remove("is-invalid"));

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      jobid: jobid,
      foundbyemployeeid: foundbyemployeeid,
      employerid: employerid,
      jobtitle: jobtitle,
      hours: hours,
      jobdescription: jobdescription,
      contactname: contactname,
      contactphone: contactphone,
      contactphoneext: contactphoneext,
      contactemail: contactemail,
      address: address,
      city: city,
      state: state,
      zip: zip,
      jobsitedetails: jobsitedetails,
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
            "You do not have sufficient permissions to edit a job.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "invalid jobid":
          addToast("The job could not be updated.", "Not Authorized", "danger");
          window.location.href = "../";
          break;
        case "invalid foundbyemployeeid":
          document
            .querySelector("#foundbyemployeeid")
            .classList.add("is-invalid");
          showError(
            `Please select an item under "Found by" to indicate which employee found this job. If not applicable, select "EASE."`,
            "Form Incomplete"
          );
          break;
        case "invalid employer id":
          document.querySelector("#employerid").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please select the employer.</div>",
            "Form Incomplete"
          );
          break;
        case "missing job title":
          document.querySelector("#jobtitle").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please input the job title.</div>",
            "Form Incomplete"
          );
          break;
        case "missing hours":
          document.querySelector("#hours").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please select the hours.</div>",
            "Form Incomplete"
          );
          break;
        case "missing city":
          document.querySelector("#city").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please input the city.</div>",
            "Form Incomplete"
          );
          break;
        case "missing state":
          document.querySelector("#state").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please select the state.</div>",
            "Form Incomplete"
          );
          break;
        case "unable to query whether employer still exists":
          console.error(data.error);
          showError(
            "There was a technical glitch which prevented the job from being updated.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "employer no longer exists":
          document.querySelector("#employerid").classList.add("is-invalid");
          addToast(
            "The employer that you selected no longer exists.",
            "Invalid employer",
            "danger"
          );
          window.location.reload();
          break;
        case "invalid email format":
          document.querySelector("#contactemail").classList.add("is-invalid");
          showError("", "Form Incomplete");
          break;
        case "unable to query whether job is a duplicate":
          console.error(data.error);
          showError(
            "There was a technical glitch which prevented the job from being updated.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "job already exists":
          showError(
            `A job with this title and this employer <a href="../#${data.jobid}" class="alert-link">already exists</a>.`,
            "Duplicate"
          );
          break;
        case "invalid phone number":
          document.querySelector("#contactphone").classList.add("is-invalid");
          showError(
            "Please check the phone number of the job contact for accuracy.",
            "Invalid phone number"
          );
          break;
        case "invalid phone number for region":
          document.querySelector("#contactphone").classList.add("is-invalid");
          showError(
            "Please input only a U.S. phone number for the job contact.",
            "U.S. phone number required"
          );
          break;
        case "phone is required if phone extension is not blank":
          document.querySelector("#contactphone").classList.add("is-invalid");
          showError(
            "You have provided a phone extension, but the phone number is blank. Please input the phone number.",
            "Form Incomplete"
          );
          break;
        case "unable to insert job":
          console.error(data.error);
          showError(
            "There was a technical glitch which prevented the job from being updated.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "job updated":
          addToast(
            "The job was updated successfully.",
            "Job Updated",
            "success"
          );
          window.location.href = `../#${jobid}`;
          break;
      }
    })
    .catch((err) => {
      hideSpinner(content, spinner);
      console.error(err);
    });
}

function attachListeners() {
  document.querySelector("#formEditJob").addEventListener("submit", onSubmit);
}

function init() {
  getJobData();
  attachListeners();
  showToasts();
}

init();
