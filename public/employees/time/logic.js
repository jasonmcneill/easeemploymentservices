async function populateContent(scrollAfterFetch = false) {
  const employeeid = parseInt(document.location.hash.split("#")[1]) || "";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");
  const breadcrumbProfileLink = document.querySelector(
    "#breadcrumbProfileLink"
  );
  const fromDateEl = document.querySelector("#fromdate");
  const toDateEl = document.querySelector("#todate");
  const endpoint = "/api/timeentries/employee";
  const timeZone = moment.tz.guess();
  const timeZoneOffset = new Date().getTimezoneOffset() * 60;
  const accessToken = await getAccessToken();

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      employeeid: employeeid,
      timeZone: timeZone,
      timeZoneOffset: timeZoneOffset,
      fromdate: fromDateEl.value,
      todate: toDateEl.value,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      const {
        firstname,
        lastname,
        type,
        status,
        entries,
        fromdate,
        todate,
      } = data;

      document.title = `Time Entries for ${firstname} ${lastname}`;
      breadcrumbProfileLink.innerText = `${data.firstname} ${data.lastname}`;
      breadcrumbProfileLink.setAttribute("href", `../profile/#${employeeid}`);
      document
        .querySelectorAll(".employeeName")
        .forEach((item) => (item.innerHTML = `${firstname} ${lastname}`));

      // Populate date range
      fromDateEl.value = fromdate.substring(0, 10);
      toDateEl.value = todate.substring(0, 10);

      // Get handles
      const timeentries = document.querySelector("#timeentries");
      const timerange = document.querySelector("#timerange");

      // If no entries, only show a message
      if (data.msg === "no time entries found") {
        timeentries.innerHTML = `<p class="text-center mb-5">No records matched the date range above.</p>`;
        timeentries.classList.remove("d-none");
        return setTimeout(() => {
          if (scrollAfterFetch) timeentries.scrollIntoView();
        }, 10);
      }

      // Populate time entries
      let html = "";
      let lastDate = "";

      entries.forEach((item, i) => {
        let date =
          lastDate !== item.date
            ? `${item.date} <span class="ml-2 text-muted">(${item.weekday}.)</span>`
            : "";

        const fulldate = item.fulldate;

        html += `
          <tr>
            <td>${date}</td>
            <td>
              <a href="#"
                data-entry-id="${item.id}"
                data-name="${firstname} ${lastname}"
                data-id="${item.id}"
                data-type="${item.type}"
                data-time="${item.time}"
                data-date="${item.date}"
                data-fulldate="${item.fulldate}"
                data-weekday="${item.weekday}"
              >${item.time}</a></td>
            <td>${item.type.toUpperCase()}</td>
          </tr>`;
        lastDate = item.date;
      });

      html = `
        <table class="table">
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>In/Out</th>
          </tr>
          ${html}
        </table>`;

      timeentries.innerHTML = html;
      timeentries.classList.remove("d-none");
      timerange.classList.remove("d-none");

      // Make time entry editable in a modal
      document.querySelectorAll("[data-entry-id]").forEach((item) => {
        item.addEventListener("click", onTimeEntryClick);
      });

      if (scrollAfterFetch) {
        setTimeout(() => {
          timeentries.scrollIntoView();
        }, 10);
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      hideSpinner(content, spinner);
    });
}

function onUpdateTimeRange(e) {
  e.preventDefault();
  populateContent(true);
}

function onTimeEntryClick(e) {
  e.preventDefault();
  const id = e.target.getAttribute("data-entry-id");
  const currentName = e.target.getAttribute("data-name");
  const currentDate = e.target.getAttribute("data-date");
  const fullDate = e.target.getAttribute("data-fulldate");
  const currentWeekday = e.target.getAttribute("data-weekday");
  const currentTime = e.target.getAttribute("data-time");
  const currentType = e.target.getAttribute("data-type");

  const elEmployeeName = document.querySelector(
    "[data-changeEntryEmployeeName]"
  );
  elEmployeeName.innerText = currentName;

  const elCurrentdDate = document.querySelector(
    "[data-changeEntryCurrentDate]"
  );
  elCurrentdDate.innerText = moment(fullDate).format("MMM. D");

  const elCurrentWeekday = document.querySelector(
    "[data-changeEntryCurrentWeekday]"
  );
  elCurrentWeekday.innerText = `(${currentWeekday}.)`;

  const elChangeEntryCurrentTime = document.querySelector(
    "[data-changeEntryCurrentTime]"
  );
  elChangeEntryCurrentTime.innerText = currentTime;

  const elChangeEntryInOut = document.querySelector("[data-changeEntryInOut]");
  elChangeEntryInOut.innerText = currentType.toUpperCase();

  const elRevisedDate = document.querySelector("#reviseddate");
  elRevisedDate.value = moment(fullDate).format("YYYY-MM-DD");

  const elRevisedTime = document.querySelector("#revisedtime");
  elRevisedTime.value = moment(currentTime, ["h:mm:ss A"]).format("HH:mm:ss");

  const elRevisedtime_alt = document.querySelector("#revisedtime_alt");
  elRevisedtime_alt.value = moment(currentTime, ["h:mm:ss A"]).format(
    "h:mm:ss"
  );

  const elRevisedtime_alt_ampm = document.querySelector(
    "#revisedtime_alt_ampm"
  );
  const ampm = moment(currentTime, ["h:mm:ss A"]).format("A");
  elRevisedtime_alt_ampm.value = ampm;

  const revisedTypeIn = document.querySelector("#revisedTypeIn");
  revisedTypeIn.checked = currentType === "in" ? true : false;

  const revisedTypeOut = document.querySelector("#revisedTypeOut");
  revisedTypeOut.checked = currentType === "out" ? true : false;

  document.querySelector("#btnDeleteTimeEntry").setAttribute("data-id", id);
  document.querySelector("#btnUpdateTimeEntry").setAttribute("data-id", id);

  $("#modalChangeTimeEntry").modal();

  const test = document.createElement("input");

  // Hide or show alternatives for input[type=time]
  try {
    test.type = "time";
    console.log("input[type=time] is supported");
  } catch (e) {
    document.querySelectorAll(".time-input-unsupported").forEach((item) => {
      item.classList.remove("d-none");
    });
    document.querySelectorAll(".time-input-supported").forEach((item) => {
      item.classList.add("d-none");
    });
  }
}

async function onDeleteTimeEntry(e) {
  e.preventDefault();
  const entryid = e.target.getAttribute("data-id");
  const endpoint = "/api/timeentry-delete";
  const accessToken = await getAccessToken();
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  $("#modalChangeTimeEntry").modal("hide");
  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      id: entryid,
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
        case "missing time entry id":
          showError(
            "The time entry could not be deleted because it was not properly transmitted from the browser to the server.",
            "Unable to Delete"
          );
          break;
        case "unable to query for time log":
          showError(
            "The time entry could not be deleted because of a technical glitch.  Please wait a moment and try again.",
            "Database is Down"
          );
          break;
        case "time entry deleted":
          populateContent();
          showToast(
            "The time entry was deleted successfully.",
            "Time Entry Deleted",
            "success"
          );
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

async function onUpdateTimeEntry(e) {
  e.preventDefault();
  const entryid = e.target.getAttribute("data-id");
  const revisedDate = document.querySelector("#reviseddate").value;
  const revisedTime = document.querySelector("#revisedtime").value;
  const revisedType = document.querySelector("input[name=revisedtype]:checked")
    .value;
  const revisedTimeAlt = document.querySelector("#revisedtime_alt").value;
  const revisedTimeAltAmPm = document.querySelector("#revisedtime_alt_ampm")
    .value;
  let date = moment(revisedDate).trim().format("YYYY-MM_DD");
  let time = moment(revisedTime.trim()).format("HH:mm:ss");

  const endpoint = "/api/timeentry-update";
  const accessToken = await getAccessToken();
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      id: entryid,
      date: date,
      time: time,
      inout: revisedType,
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
          window.location.href = "/logout/";
          break;
        case "missing time entry id":
          showToast(
            "The ID of the time entry was missing in the request.",
            "Couldn't Delete",
            "danger"
          );
          $("#modalChangeTimeEntry").modal("hide");
          break;
        case "missing date":
          showToast("Please input the date.", "Date is missing", "danger");
          break;
        case "missing time":
          showToast("Please input the time.", "Time is missing", "danger");
          break;
        case "missing inout":
          showToast(
            `Please select either "IN" or "OUT."`,
            "Missing In/Out",
            "danger"
          );
          break;
        case "invalid date/time":
          showToast(
            "Please check the date and time for accuracy and proper formatting.",
            "Invalid date/time",
            "danger"
          );
          break;
        case "unable to query for time log id":
          showToast(
            "The update failed. Please wait a moment and try again.",
            "Database is down",
            "danger"
          );
          break;
        case "no record of id":
          showToast(
            "There is no longer a record of that time entry.",
            "Time entry no longer exists",
            "danger"
          );
          populateContent();
          $("#modalChangeTimeEntry").modal("hide");
          break;
        case "unable to query for updating":
          showToast(
            "The update failed. Please wait a moment and try again.",
            "Database is down",
            "danger"
          );
          break;
        case "time entry updated":
          showToast(
            "The time entry was updated successfully.",
            "Time Entry Updated",
            "success"
          );
          populateContent();
          $("#modalChangeTimeEntry").modal("hide");
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

function supportsTimeInputType() {
  let result = false;
  const test = document.createElement("input");

  try {
    test.type = "time";
  } catch (e) {
    console.log(e.description);
  }

  if (test.type === "text") {
    result = true;
  }

  return result;
}

function attachListeners() {
  document
    .querySelector("#timerange_form")
    .addEventListener("submit", onUpdateTimeRange);

  document
    .querySelector("#btnDeleteTimeEntry")
    .addEventListener("click", onDeleteTimeEntry);

  document
    .querySelector("#btnUpdateTimeEntry")
    .addEventListener("click", onUpdateTimeEntry);
}

function init() {
  attachListeners();
  populateContent(false);
}

init();
