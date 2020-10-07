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

      entries.forEach((item, i) => {
        let date = "";
        let previousDate = "";
        if (i === 0) {
          date = `${item.date} <span class="ml-2 text-muted">(${item.weekday})</span>`;
          previousDate = `${item.date} <span class="ml-2 text-muted">(${item.weekday})</span>`;
        } else {
          previousDate = `${entries[i].date} <span class="ml-2 text-muted">(${entries[i].weekday})</span>`;
          date = `${item.date} <span class="ml-2 text-muted">(${item.weekday})</span>`;
          if (previousDate === date) {
            date = "";
          }
        }
        html += `
          <tr>
            <td>${date}</td>
            <td>${item.time}</td>
            <td>${item.type.toUpperCase()}</td>
          </tr>`;
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

function attachListeners() {
  document
    .querySelector("#timerange_form")
    .addEventListener("submit", onUpdateTimeRange);
}

function init() {
  attachListeners();
  populateContent(false);
}

init();
