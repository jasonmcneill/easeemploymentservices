async function populateContent() {
  const employeeid = parseInt(document.location.hash.split("#")[1]) || "";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");
  const breadcrumbProfileLink = document.querySelector(
    "#breadcrumbProfileLink"
  );
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
      const fromDateEl = document.querySelector("#fromdate");
      const toDateEl = document.querySelector("#todate");
      fromDateEl.value = fromdate;
      toDateEl.value = todate;

      // Get handles
      const timeentries = document.querySelector("#timeentries");
      const timerange = document.querySelector("#timerange");

      // If no entries, only show a message
      if (data.msg === "no time entries found") {
        timeentries.innerHTML = `<p class="text-center my-3">${firstname} ${lastname} does not have any time entries.</p>`;
        timerange.classList.add("d-none");
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
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      hideSpinner(content, spinner);
    });
}

function init() {
  populateContent();
}

init();
