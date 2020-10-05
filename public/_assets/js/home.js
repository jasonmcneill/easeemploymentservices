function populateClockTime() {
  const clockTime = document.querySelector("#clockTime");
  const clockDate = document.querySelector("#clockDate");

  setInterval(() => {
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
  }, 1000);
}

async function onClockInClicked() {
  const timeZoneOffset = new Date().getTimezoneOffset() / 60;
  const btnClockIn = document.querySelector("#btnClockIn");
  const btnClockOut = document.querySelector("#btnClockOut");
  const timeEntries = document.querySelector("#timeEntries");
  const spinner = `
  <div class="text-center my-3">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>`;

  timeEntries.innerHTML = spinner;
  btnClockIn.setAttribute("disabled", true);

  const accessToken = await getAccessToken();
  const endpoint = "/api/timeentry-in";
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
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

function onClockOutClicked() {}

function showTimeEntries(entries) {
  const timeEntries = document.querySelector("#timeEntries");
  const btnClockIn = document.querySelector("#btnClockIn");
  const btnClockOut = document.querySelector("#btnClockOut");
  let timeHtml = ``;
  let renderedFirstRow = false;

  // Decide whether to show "Clock In" or "Clock Out" button
  if (entries[entries.length - 1].type === "in") {
    // Show "Clock Out"
    btnClockIn.classList.add("d-none");
    btnClockOut.classList.remove("d-none");
  } else {
    // Show "Clock In"
    btnClockIn.classList.remove("d-none");
    btnClockOut.classList.add("d-none");
  }

  entries.forEach((item) => {
    let timeEntry = item.entry;

    if (!renderedFirstRow) {
      renderedFirstRow = true;
      timeHtml += `
        <tr>
          <td width="50%">
            <span class="text-success">
              <strong>${item.type === "in" ? "IN" : "OUT"}:</strong>
            </span>
          </td>
          <td width="50%" class="text-right">
            ${timeEntry}
          </td>
        </tr>
      `;
    } else {
      timeHtml += `
        <tr>
          <td>
            <span class="text-success">
              <strong>${item.type === "in" ? "IN" : "OUT"}:</strong>
            </span>
          </td>
          <td class="text-right">
            ${timeEntry}
          </td>
        </tr>
      `;
    }
  });

  timeHtml = `<table class="table mt-3">${timeHtml}</table>`;
  timeEntries.innerHTML = timeHtml;
}

function onDoneForTheDayClicked(e) {
  const clockTime = document.querySelector("#clockTime");
  const clockIn = document.querySelector("#btnClockIn");
  const clockOut = document.querySelector("#btnClockOut");
  const doneForTheDayContainer = document.querySelector(
    "#doneForTheDayContainer"
  );
  const checked = e.target.checked || false;

  if (checked) {
    clockTime.classList.add("d-none");
    clockIn.classList.add("d-none");
    clockOut.classList.add("d-none");
    doneForTheDayContainer.classList.add("d-none");
  }
}

async function getTimeEntriesForToday() {
  const timeEntries = document.querySelector("#timeEntries");
  const timeZoneOffset = new Date().getTimezoneOffset() / 60;
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
        case "no time entries found for today":
          timeEntries.innerHTML = "";
          break;
        case "time entries found for today":
          showTimeEntries(data.entries);
          break;
      }
    })
    .catch((err) => {
      console.log(err);
      timeEntries.innerHTML = "";
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
    .querySelector("#doneForTheDay")
    .addEventListener("click", onDoneForTheDayClicked);
}

function init() {
  protectRoute();
  attachListeners();
  showToasts();
  populateClockTime();
  getTimeEntriesForToday();
}

init();
