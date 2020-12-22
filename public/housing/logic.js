async function getHomes() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/housing-list";
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
      const homeList = document.querySelector("#homeList");
      hideSpinner(content, spinner);
      switch (data.msg) {
        case "unable to query for homes":
          showError(
            "There was a technical glitch preventing vacancies from being displayed.  Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "homes retrieved":
          if (!data.data.length) {
            joblist.innerHTML = `
              <p class="text-center">
                <strong>There are no vacancies in the system.</strong>
              </p>
            `;
          } else {
            let html = "";
            data.data.forEach((item) => {
              const {
                homeid,
                hometitle,
                address,
                city,
                state,
                providername,
                createdAt,
              } = item;
              html += `
                <a href="profile/#${homeid}" class="list-group-item list-group-item-action">
                  <big><strong>${hometitle}</strong></big>
                  <div class="text-muted">${providername}</div>
                  <div class="text-muted">${address}</div>
                  <div class="text-muted">${city}, ${state}</div>
                  <div class="text-info"><small><em>
                    ${moment(createdAt).tz(timeZone).format("ddd., MMM. D")}
                  </em></small></div>
                </a>`;
            });
            html = `<div class="list-group">${html}</div>`;
            homeList.innerHTML = html;
          }
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

async function getPlacedParticipants() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/participants-placed";
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
      const participantsPlacedList_container = document.querySelector(
        "#participantsPlacedList_container"
      );
      const participantsPlacedList = document.querySelector(
        "#participantsPlacedList"
      );
      hideSpinner(content, spinner);
      switch (data.msg) {
        case "unable to query for participants placed":
          showError(
            "There was a technical glitch preventing placed participants from being displayed.  Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "participants retrieved":
          if (!data.data.length) {
            participantsPlacedList.innerHTML = "";
            participantsPlacedList_container.classList.add("d-none");
          } else {
            let html = "";
            data.data.forEach((item) => {
              const {
                homeid,
                hometitle,
                participantFirstName,
                participantLastName,
                providername,
                address,
                city,
                state,
                createdAt,
              } = item;
              html += `
                <a href="profile/#${homeid}" class="list-group-item list-group-item-action">
                  <big><strong>${hometitle}</strong></big>
                  <div class="text-success">Placed: <strong>${participantFirstName} ${participantLastName}</strong></div>
                  <div class="text-muted">${providername}</div>
                  <div class="text-muted">${address}</div>
                  <div class="text-muted">${city}, ${state}</div>
                  <div class="text-info"><small><em>
                    ${moment(createdAt).tz(timeZone).format("ddd., MMM. D")}
                  </em></small></div>
                </a>`;
            });
            html = `<div class="list-group">${html}</div>`;
            participantsPlacedList.innerHTML = html;
            participantsPlacedList_container.classList.remove("d-none");
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
  getHomes();
  getPlacedParticipants();
  showToasts();
}

init();
