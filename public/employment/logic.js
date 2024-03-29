async function getJobs() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/jobs-list";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");
  const timeZone = moment.tz.guess();

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      timeZone: timeZone,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      const joblist = document.querySelector("#joblist");
      hideSpinner(content, spinner);
      switch (data.msg) {
        case "unable to query for jobs":
          showError(
            "There was a technical glitch preventing jobs from being displayed.  Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "jobs retrieved":
          if (!data.data.length) {
            joblist.innerHTML = `
              <p class="text-center">
                <strong>There are no open jobs in the system.</strong>
              </p>
            `;
          } else {
            let html = "";
            data.data.forEach((item) => {
              const {
                jobid,
                jobtitle,
                city,
                state,
                companyname,
                createdAt,
              } = item;
              html += `
                <a href="profile/#${jobid}" class="list-group-item list-group-item-action">
                  <big><strong>${jobtitle}</strong></big>
                  <div class="text-muted">${companyname}</div>
                  <div class="text-muted">${city}, ${state}</div>
                  <div class="text-info"><small><em>
                    ${moment(createdAt).tz(timeZone).format("ddd., MMM. D")}
                  </em></small></div>
                </a>`;
            });
            html = `<div class="list-group">${html}</div>`;
            joblist.innerHTML = html;
          }
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

async function getPlacedJobs() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/jobs-placed";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");
  const timeZone = moment.tz.guess();

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      timeZone: timeZone,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      const jobsPlacedList_container = document.querySelector(
        "#jobsPlacedList_container"
      );
      const jobsPlacedList = document.querySelector("#jobsPlacedList");
      hideSpinner(content, spinner);
      switch (data.msg) {
        case "unable to query for jobs placed":
          showError(
            "There was a technical glitch preventing placed jobs from being displayed.  Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "jobs retrieved":
          if (!data.data.length) {
            jobsPlacedList.innerHTML = "";
            jobsPlacedList_container.classList.add("d-none");
          } else {
            let html = "";
            data.data.forEach((item) => {
              const {
                jobid,
                jobtitle,
                participantFirstName,
                participantLastName,
                city,
                state,
                companyname,
                createdAt,
              } = item;
              html += `
                <a href="profile/#${jobid}" class="list-group-item list-group-item-action">
                  <big><strong>${jobtitle}</strong></big>
                  <div class="text-success">Placed: <strong>${participantFirstName} ${participantLastName}</strong></div>
                  <div class="text-muted">${companyname}</div>
                  <div class="text-muted">${city}, ${state}</div>
                  <div class="text-info"><small><em>
                    ${moment(createdAt).tz(timeZone).format("ddd., MMM. D")}
                  </em></small></div>
                </a>`;
            });
            html = `<div class="list-group">${html}</div>`;
            jobsPlacedList.innerHTML = html;
            jobsPlacedList_container.classList.remove("d-none");
          }
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

function init() {
  getJobs();
  getPlacedJobs();
  showToasts();
}

init();
