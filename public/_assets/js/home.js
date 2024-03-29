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

function participantsFilter(participantid) {
  if (participantid === "0") return;
  document.querySelectorAll("#myparticipants_list > a").forEach((item) => {
    item.classList.add("d-none");
  });
  const listItem = document.querySelector(
    `[data-participantid="${participantid}"]`
  );
  listItem.style.borderTop = "1px solid rgba(0, 0, 0, 0.125)";
  listItem.classList.remove("d-none");
}

function participantsUnfilter() {
  document
    .querySelectorAll("#myparticipants_list > a")
    .forEach((listItem, index) => {
      if (index > 0) listItem.style.borderTop = "none";
      listItem.classList.remove("d-none");
    });
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

  participantsFilter(participantid);

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
          participantsUnfilter();
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

function populateParticipantsForTimeEntry(participants) {
  const clockInFor = document.querySelector("#clockInFor");
  let clockInForOptions = `
    <option value="">(Select)</option>
    <option value="0">EASE</option>
  `;

  if (participants.length) {
    participants.forEach((item) => {
      const { participantid, firstname, lastname } = item;
      clockInForOptions += `<option value="${participantid}">${firstname} ${lastname}</option>`;
    });
  }
  clockInFor.innerHTML = clockInForOptions;
}

function getParticipantBadges(
  seeksemployment,
  seekshousing,
  jobplacementid,
  housingplacementid
) {
  let badgeHtml = "";

  // Employment
  if (typeof jobplacementid === "number") {
    badgeHtml += `<span class="badge badge-success badge-pill ml-1">E</span>`;
  } else {
    if (seeksemployment)
      badgeHtml += `<span class="badge badge-warning badge-pill ml-1">E</span>`;
  }

  // Housing
  if (typeof housingplacementid === "number") {
    badgeHtml += `<span class="badge badge-success badge-pill ml-1">H</span>`;
  } else {
    if (seekshousing)
      badgeHtml += `<span class="badge badge-warning badge-pill ml-1">H</span>`;
  }

  return badgeHtml;
}

function populateParticipantsForCaseManagement(participants) {
  const participantsEl = document.querySelector("#myparticipants");
  const participantsList = document.querySelector("#myparticipants_list");
  const participantCountEl = document.querySelector("#myparticipants_count");
  let participantsContent = "";

  if (participants.length) {
    participants.forEach((item, index) => {
      const {
        participantid,
        firstname,
        lastname,
        seekshousing,
        seeksemployment,
        jobplacementid = "",
        housingplacementid = "",
      } = item;
      participantsContent += `
        <a href="participants/profile/#${participantid}" data-participantid="${participantid}" class="list-group-item list-group-item-light list-group-item-action">
          ${index + 1}. ${firstname} ${lastname}
          <div class="float-right">
            ${getParticipantBadges(
              seeksemployment,
              seekshousing,
              jobplacementid,
              housingplacementid
            )}
          </div>
        </a>
      `;
    });
    participantCountEl.innerText = participants.length;
    participantsList.innerHTML = participantsContent;
    participantsEl.classList.remove("d-none");
    participantCountEl.classList.remove("d-none");
  }
}

async function getParticipantsOfEmployee() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/participants-of-user";

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
        case "unable to query for participants of user":
          showToast(
            "Participants could not be retrieved",
            "Database is Down",
            "danger"
          );
          break;
        case "participants of user retrieved":
          const { participants } = data;
          populateParticipantsForTimeEntry(participants);
          populateParticipantsForCaseManagement(participants);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function calculateEmploymentCaseLoad(employerid, data) {
  let count = 0;

  for (let i = 0; i < data.length; i++) {
    const isMatch = data[i].employerid === employerid ? true : false;
    if (isMatch) {
      count++;
    } else {
      continue;
    }
  }

  return count;
}

function calculateHousingCaseLoad(homeid, data) {
  let count = 0;

  for (let i = 0; i < data.length; i++) {
    const isMatch = data[i].homeid === homeid ? true : false;
    if (isMatch) {
      count++;
    } else {
      continue;
    }
  }

  return count;
}

function renderSupportedEmploymentReport(data) {
  const capacityReport = document.querySelector("#capacityreport");
  const spinner = document.querySelector("#supportedEmploymentReport_spinner");
  const norecords = document.querySelector(
    "#supportedEmploymentReport_norecords"
  );
  const table = document.querySelector("#supportedEmploymentReport_table");

  if (!data.length) {
    table.classList.add("d-none");
    spinner.classList.add("d-none");
    norecords.classList.remove("d-none");
    capacityReport.classList.remove("d-none");
    return;
  }

  let html = ``;
  data.forEach((item) => {
    const caseLoadCount = calculateEmploymentCaseLoad(item.employerid, data);
    const rowHtml = `
      <tr>
        <td>${item.companyname}</td>
        <td>${item.address}</td>
        <td>${item.city}</td>
        <td class="text-center">${caseLoadCount}</td>
      </tr>
    `;
    return (html += rowHtml);
  });
  table.querySelector("tbody").innerHTML = html;

  norecords.classList.add("d-none");
  spinner.classList.add("d-none");
  table.classList.remove("d-none");
  capacityReport.classList.remove("d-none");
}

async function supportedEmploymentReport() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/report_capacity_supported_employment";
  const timezone = moment.tz.guess();

  fetch(endpoint, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      timezone: timezone,
    }),
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
        case "unable to query for supported employment":
          showToast(
            "Unable to retrieve data for supported employment",
            "Database is Down",
            "error"
          );
          break;
        case "supported employment data retrieved":
          renderSupportedEmploymentReport(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function renderSupportiveHousingReport(data) {
  const capacityReport = document.querySelector("#capacityreport");
  const spinner = document.querySelector("#supportiveHousing_spinner");
  const norecords = document.querySelector("#supportiveHousing_norecords");
  const table = document.querySelector("#supportiveHousingReport_table");

  if (!data.length) {
    table.classList.add("d-none");
    spinner.classList.add("d-none");
    norecords.classList.remove("d-none");
    capacityReport.classList.remove("d-none");
    return;
  }

  let html = ``;
  const renderedHomes = [];
  data.forEach((item) => {
    if (renderedHomes.includes(item.homeid)) return;
    const caseLoadCount = calculateHousingCaseLoad(item.homeid, data);
    const rowHtml = `
      <tr>
        <td>${item.companyname}</td>
        <td>${item.address}</td>
        <td>${item.city}</td>
        <td class="text-center">${caseLoadCount}</td>
      </tr>
    `;
    renderedHomes.push(item.homeid);
    return (html += rowHtml);
  });
  table.querySelector("tbody").innerHTML = html;

  norecords.classList.add("d-none");
  spinner.classList.add("d-none");
  table.classList.remove("d-none");
  capacityReport.classList.remove("d-none");
}

async function supportiveHousingReport() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/report_capacity_supportive_housing";
  const timezone = moment.tz.guess();

  fetch(endpoint, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      timezone: timezone,
    }),
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
        case "unable to query for supportive housing":
          showToast(
            "Unable to retrieve data for supportive housing",
            "Database is Down",
            "error"
          );
          break;
        case "supportive housing data retrieved":
          renderSupportiveHousingReport(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

async function showReports() {
  const accessToken = await getAccessToken();
  const parsedToken = JSON.parse(atob(accessToken.split(".")[1]));
  const hasAccess =
    ["sysadmin", "director"].includes(parsedToken.type) || false;

  if (!hasAccess) return;

  supportedEmploymentReport();
  supportiveHousingReport();
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
  showReports();
  showToasts();
}

init();
