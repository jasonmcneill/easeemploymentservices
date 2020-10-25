function populateClockTime() {
  const clockTime = document.querySelector("#clockTime");
  const clockDate = document.querySelector("#clockDate");

  const showTime = () => {
    const dateObj = new Date();
    const currentDate = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const currentTime = dateObj.toLocaleTimeString();

    clockDate.innerHTML = `${currentDate}`;
    clockTime.innerHTML = `<h3 class="h3">${currentTime}</h3>`;
  };

  showTime();

  setInterval(() => {
    showTime();
  }, 1000);
}

async function onClockInClicked(e) {
  e.preventDefault();
  hideAlertMessage();

  const timeZone = moment.tz.guess();
  const timeZoneOffset = new Date().getTimezoneOffset() * 60;
  const btnClockIn = document.querySelector("#btnClockIn");
  const btnClockOut = document.querySelector("#btnClockOut");
  const participantid = document.querySelector("#clockInFor").value || "";
  const timeEntries = document.querySelector("#timeEntries");
  const spinner = `
  <div class="text-center my-3">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>`;

  if (participantid === "") {
    showToast(
      `Please select an item under <strong class="text-nowrap">"Clock in for."</strong>`,
      "Incomplete",
      "danger"
    );
    return;
  }

  timeEntries.innerHTML = spinner;
  btnClockIn.setAttribute("disabled", true);

  const accessToken = await getAccessToken();
  const endpoint = "/api/timeentry-in";
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      participantid: participantid,
      timeZone: timeZone,
      timeZoneOffset: timeZoneOffset,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.msg) {
        case "unable to insert time entry":
          showError(
            "A glitch occurred which prevented the clock-in from being processed.  Please wait a moment then try again.",
            "Clock In Failed"
          );
          break;
        case "unable to query for time entries":
          showError(
            "A glitch occurred which prevented your clock-in from being displayed, but <strong>your clock-in succeeded.</strong>",
            "Unable to List Time Entries"
          );
          break;
        case "clock-in succeeded":
          showToast(
            "You are now clocked in.",
            "Clock-in Succeeded",
            "success",
            2500
          );
          showTimeEntries(data.entries);
          break;
      }
    })
    .catch((err) => console.error(err))
    .finally(() => {
      btnClockIn.removeAttribute("disabled");
      btnClockIn.classList.add("d-none");
      btnClockOut.classList.remove("d-none");
    });
}

function onClockOutClicked(e) {
  e.preventDefault();
  $("#modalConfirmClockOut").modal();
}

async function onClockOutConfirmed(e) {
  e.preventDefault();
  const timeZone = moment.tz.guess();
  const timeZoneOffset = new Date().getTimezoneOffset() * 60;
  const btnClockIn = document.querySelector("#btnClockIn");
  const btnClockOut = document.querySelector("#btnClockOut");
  const timeEntries = document.querySelector("#timeEntries");
  const clockInFor = document.querySelector("#clockInFor");
  const spinner = `
  <div class="text-center my-3">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>`;

  timeEntries.innerHTML = spinner;
  btnClockOut.setAttribute("disabled", true);

  const accessToken = await getAccessToken();
  const endpoint = "/api/timeentry-out";
  $("#modalConfirmClockOut").modal("hide");

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      timeZone: timeZone,
      timeZoneOffset: timeZoneOffset,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.msg) {
        case "unable to insert time entry":
          showError(
            "A glitch occurred which prevented the clock-in from being processed.  Please wait a moment then try again.",
            "Clock Out Failed"
          );
          break;
        case "unable to query for time entries":
          showError(
            "A glitch occurred which prevented your clock-out from being displayed, but <strong>your clock-out succeeded.</strong>",
            "Unable to List Time Entries"
          );
          break;
        case "clock-out succeeded":
          showToast(
            "You are now clocked out.",
            "Clock-out Succeeded",
            "info",
            2500
          );
          showTimeEntries(data.entries);
          clockInFor.options[0].selected = true;
          break;
      }
    })
    .catch((err) => console.error(err))
    .finally(() => {
      btnClockOut.removeAttribute("disabled");
      btnClockOut.classList.add("d-none");
      btnClockIn.classList.remove("d-none");
    });
}

function showTimeEntries(entries) {
  const timeEntries = document.querySelector("#timeEntries");
  const btnClockIn = document.querySelector("#btnClockIn");
  const btnClockOut = document.querySelector("#btnClockOut");
  const formClockInFor = document.querySelector("#formClockInFor");
  let timeHtml = ``;

  // Return if no entries received
  if (!Array.isArray(entries)) return;
  if (!entries.length) return;

  // Decide whether to show "Clock In" or "Clock Out" button
  if (entries[entries.length - 1].type === "in") {
    // Show "Clock Out"
    btnClockIn.classList.add("d-none");
    btnClockOut.classList.remove("d-none");
    formClockInFor.classList.add("d-none");
  } else {
    // Show "Clock In"
    btnClockIn.classList.remove("d-none");
    btnClockOut.classList.add("d-none");
    formClockInFor.classList.remove("d-none");
  }

  entries.forEach((item) => {
    const { type, entry } = item;
    const { name } = item.participant;
    let entryHtml = "";

    if (type === "in") {
      entryHtml += `
        <div class="timein">
          <strong>${name}</strong><br>
          ${entry}
          <strong class="text-success float-right">IN</strong>
        </div>
      `;
    } else {
      entryHtml += `
        <div class="timeout mb-3">
          ${entry}
          <strong class="text-success float-right">OUT</strong>
        </div>
        <hr>
      `;
    }

    timeHtml += entryHtml;
  });

  timeHtml = `<hr><div class="mt-3">${timeHtml}</div>`;
  timeEntries.innerHTML = timeHtml;
}

async function getTimeEntriesForToday() {
  const timeEntries = document.querySelector("#timeEntries");
  const btnClockIn = document.querySelector("#btnClockIn");
  const btnClockOut = document.querySelector("#btnClockOut");
  const timeZone = moment.tz.guess();
  const timeZoneOffset = new Date().getTimezoneOffset() * 60;
  const endpoint = "/api/timeentries-today";
  const accessToken = await getAccessToken();
  const spinner = `
  <div class="text-center my-3">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>`;

  timeEntries.innerHTML = spinner;
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      timeZone: timeZone,
      timeZoneOffset: timeZoneOffset,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearar ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.msg) {
        case "unable to query for time entries for today":
          showToast(
            "Unable to retrieve time entries",
            "Database is down",
            "danger"
          );
          break;
        case "time entries for today retrieved":
          if (!data.entries.length) {
            timeEntries.innerHTML = "";
            btnClockIn.classList.remove("d-none");
            btnClockOut.classList.add("d-none");
          } else {
            showTimeEntries(data.entries);
          }
          break;
      }
    })
    .catch((err) => {
      console.log(err);
      timeEntries.innerHTML = "";
    });
}

async function getParticipantsOfEmployee() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/participants-of-employee";

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
      switch (data.msg) {
        case "user is not authorized for this action":
          window.location.href = "/logout/";
          break;
        case "unable to query for participants of employee":
          showToast(
            "Participants of employee could not be retrieved",
            "Database is Down",
            "danger"
          );
          break;
        case "participants of employee retrieved":
          const clockInFor = document.querySelector("#clockInFor");
          let clockInForOptions = `
            <option value="">(Select)</option>
            <option value="0">EASE</option>
          `;
          if (data.participants.length) {
            data.participants.forEach((item) => {
              const { participantid, firstname, lastname } = item;
              clockInForOptions += `<option value="${participantid}">${firstname} ${lastname}</option>`;
            });
          }
          clockInFor.innerHTML = clockInForOptions;
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function attachListeners() {
  document
    .querySelector("#btnClockIn")
    .addEventListener("click", onClockInClicked);

  document
    .querySelector("#btnClockOut")
    .addEventListener("click", onClockOutClicked);

  document
    .querySelector("#btnClockOutConfirm")
    .addEventListener("click", onClockOutConfirmed);
}

function init() {
  checkIfOffline();
  attachListeners();
  populateClockTime();
  getParticipantsOfEmployee();
  getTimeEntriesForToday();
  showToasts();
}

init();
