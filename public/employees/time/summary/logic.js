function buildTable(data) {
  let rows = "";
  let hours = 0;
  let fromTime;
  let toTime;
  const round = (number, decimalPlaces) => {
    const factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(number * factorOfTen) / factorOfTen;
  };
  data.forEach((item) => {
    const { entry, type, participantid, firstname, lastname } = item;
    const name =
      participantid === 0
        ? "EASE"
        : `<a href="/participants/profile/#${participantid}">${firstname} ${lastname}</a>`;
    if (type === "in") {
      hours = 0;
      fromTime = entry;
      toTime = entry;
    }
    if (type === "out") {
      toTime = entry;
      hours = moment(toTime).diff(fromTime, "hours", true);
      const rowHtml = `
        <tr>
          <td>${name}</td>
          <td class="text-nowrap">${moment(toTime)
            .tz("America/Los_Angeles")
            .format("YYYY-MM-DD")}
          <td class="text-nowrap">${moment(fromTime)
            .tz("America/Los_Angeles")
            .format("h:mm:ss A")}</td>
          <td class="text-nowrap">${moment(toTime)
            .tz("America/Los_Angeles")
            .format("h:mm:ss A")}</td>
          <td class="text-nowrap">${round(hours, 4)}</td>
        </tr>
      `;
      rows += rowHtml;
    }
  });
  const html = `
  <table class="table table-responsive-md">
    <thead>
      <tr>
        <th>For</th>
        <th>Date</th>
        <th>From</th>
        <th>To</th>
        <th>Hours</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`;

  document.querySelector("#summary").innerHTML = html;
}

async function populateBreadcrumbs() {
  const employeeid = getId();
  const accessToken = await getAccessToken();
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");
  const endpoint = `/api/employee/${employeeid}`;

  showSpinner(content, spinner);

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
      const { firstname, lastname } = data[0];
      document.querySelectorAll(".employeeName").forEach((item) => {
        item.innerHTML = `${firstname} ${lastname}`;
      });
      document
        .querySelector("#breadcrumbProfileLink")
        .setAttribute("href", `../../#${employeeid}`);
      document
        .querySelector("#breadcrumbTimeEntriesLink")
        .setAttribute("href", `../#${employeeid}`);
      document.querySelector(
        "title"
      ).innerHTML = `Time Summary for ${firstname} ${lastname}`;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      hideSpinner(content, spinner);
    });
}

async function populateContent() {
  const employeeid = getId();
  const endpoint = "/api/timesummary";
  const timeZone = moment.tz.guess();
  const accessToken = await getAccessToken();

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
    body: JSON.stringify({
      employeeid: employeeid,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.msg) {
        case "user is not authorized for this action":
          addToast(
            "Your account does not have sufficient permissions to perform that action.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
        case "invalid employee id":
          const invalidId = window.location.hash.substring(
            1,
            window.location.hash.length
          );
          showError(
            `No employee with the employee ID of "<strong>${invalidId}</strong>" could be found.`,
            "Invalid employee ID"
          );
          break;
        case "insufficient access to view specified employee":
          addToast(
            "Your account does not have sufficient permissions to perform that action.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
        case "unable to query for time summary":
          showError(
            `There was a glitch preventing the summary from being displayed. Please wait a moment, then <a href="javascript:window.location.reload()" class="alert-link">reload the page</a>.`,
            "Database is down"
          );
          break;
        case "no time summary records found":
          const summary = document.querySelector("#summary");
          summary.innerHTML =
            "No time records were found for the current pay period.";
          break;
        case "records retrieved":
          buildTable(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function init() {
  /* attachListeners(); */
  populateBreadcrumbs();
  populateContent();
  showToasts();
}

init();
