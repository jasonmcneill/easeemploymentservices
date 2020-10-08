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

        html += `
          <tr>
            <td>${date}</td>
            <td><a href="#" data-entry-id="${item.id}">${item.time}</a></td>
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
  const id = e.target.getAttribute("data-entry-id");
  $("#modalChangeTimeEntry").modal();
  e.preventDefault();
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
