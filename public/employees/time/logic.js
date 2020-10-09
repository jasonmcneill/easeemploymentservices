function supportsTimeInputType() {
  let result = false;
  var test = document.createElement("input");

  try {
    test.type = "time";
    result = true;
  } catch (e) {
    console.log(e.description);
  }

  return result;
}

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
  const timeZoneOffset = new Date().getTimezoneOffset() / 60;
  const accessToken = await getAccessToken();

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      employeeid: employeeid,
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
      const timeInputSupported = supportsTimeInputType() || false;
      if (!timeInputSupported) {
        document.querySelector(".time-input-supported").classList.add("d-none");
        document
          .querySelector(".time-input-unsupported")
          .classList.remove("d-none");
      }
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
  elRevisedTime.value = moment(currentTime, ["h:mm A"]).format("HH:mm");

  const elRevisedtime_alt = document.querySelector("#revisedtime_alt");
  elRevisedtime_alt.value = moment(currentTime).format("h:mm:ss");

  const elRevisedtime_alt_ampm = document.querySelector(
    "#revisedtime_alt_ampm"
  );
  elRevisedtime_alt_ampm.value = moment(currentTime).format("A");

  const revisedTypeIn = document.querySelector("#revisedTypeIn");
  revisedTypeIn.checked = currentType === "in" ? true : false;

  const revisedTypeOut = document.querySelector("#revisedTypeOut");
  revisedTypeOut.checked = currentType === "out" ? true : false;

  $("#modalChangeTimeEntry").modal();
}

function onDeleteTimeEntry(e) {
  e.preventDefault();
  console.log("onDeleteTimeEntry()");
}

function onUpdateTimeEntry(e) {
  e.preventDefault();
  console.log("onUpdateTimeEntry()");
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
