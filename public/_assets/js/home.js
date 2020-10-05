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
  const btnClockIn = document.querySelector("#btnClockIn");
  const btnClockOut = document.querySelector("#btnClockOut");
  const timeEntries = document.querySelector("#timeEntries");
  const now = new Date();
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
  let timeHtml = ``;
  let renderedFirstRow = false;

  console.log(entries);

  entries.forEach((item) => {
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
            ${item.entry_utc}
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
            ${item.entry_utc}
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
}

init();
