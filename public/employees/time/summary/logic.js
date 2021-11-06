function buildTable(data) {
  let rows = "";
  let participantid;
  let hours = 0;
  let fromTime;
  let toTime;
  const round = (number, decimalPlaces) => {
    const factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(number * factorOfTen) / factorOfTen;
  };

  // Calculate hours:

  const hoursTally = {};

  data.forEach((item) => {
    const {
      entry,
      type,
      participantid: itemParticipant,
      firstname,
      lastname,
    } = item;
    const name = participantid === 0 ? "EASE" : `${firstname} ${lastname}`;

    if (type === "in") {
      hours = 0;
      fromTime = entry;
      toTime = entry;
      participantid = itemParticipant;
    }

    if (type === "out") {
      if (participantid !== itemParticipant) return;
      if (!hoursTally.hasOwnProperty("participantid")) {
        hoursTally[participantid] = {
          participantid: 0,
          hours: 0,
          name: "",
        };
      }
      toTime = entry;
      hours = moment(toTime).diff(fromTime, "hours", true);
      hoursTally[participantid].participantid = participantid;
      hoursTally[participantid].hours += hours;
      hoursTally[participantid].name = name;
    }
  });

  let totalHoursAsDecimal = 0;
  let totalHoursAsTime = "";

  // Build HTML:

  for (let i in hoursTally) {
    const { participantid, hours, name } = hoursTally[i];
    const hoursAsDecimal = round(hours, 4);
    totalHoursAsDecimal += hoursAsDecimal;
    const hoursAsTime = parseHoursAsTime(hoursAsDecimal);
    const decoratedName =
      participantid === 0
        ? "EASE"
        : `<a href="/participants/profile/#${participantid}">${name}</a>`;

    rows += `
      <tr>
        <td class="text-left">${decoratedName}</td>
        <td class="text-right">${hoursAsDecimal}</td>
        <td class="text-right">${hoursAsTime}</td>
      </tr>
    `;
  }

  totalHoursAsTime = parseHoursAsTime(totalHoursAsDecimal);

  const html = `
  <table class="table table-bordered">
    <thead>
      <tr>
        <th width="50%" class="align-middle text-center bg-light">For</th>
        <th width="25%" class="bg-light">
          Hours
          <div class="text-nowrap">
            <small>as Decimal</small>
          </div>
        </th>
        <th width="25%" class="bg-light">
          Hours
          <div class="text-nowrap">
            <small>as Time</small>
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr>
        <th class="bg-light text-right border">TOTAL:</th>
        <th class="bg-light text-right">${round(totalHoursAsDecimal, 2)}</th>
        <th class="bg-light text-right">${totalHoursAsTime}</th>
      </tr>
    </tfoot>
  </table>`;

  document.querySelector("#summary").innerHTML = html;
}

function parseHoursAsTime(hoursAsDecimal) {
  const hoursAsDuration = moment.duration(hoursAsDecimal, "hours");
  let hoursAsTime = hoursAsDuration._data.hours;
  const minutesAsTime =
    hoursAsDuration._data.minutes < 10
      ? `0${hoursAsDuration._data.minutes}`
      : hoursAsDuration._data.minutes;
  const secondsAsTime =
    hoursAsDuration._data.seconds < 10
      ? `0${hoursAsDuration._data.seconds}`
      : hoursAsDuration._data.seconds;
  hoursAsTime += `:${minutesAsTime}:${secondsAsTime}`;
  return hoursAsTime;
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
          showPayPeriod(data.payperiod);
          buildTable(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function showPayPeriod(payperiod) {
  const payPeriodContainer = document.querySelector("#payperiod");
  const { from, to } = payperiod;
  const fromDate = moment(from).tz("America/Los_Angeles").format("D");
  const toDate = moment(to).tz("America/Los_Angeles").format("D");
  const fromMonth = moment(from).tz("America/Los_Angeles").format("MMMM");
  const toMonth = moment(to).tz("America/Los_Angeles").format("MMMM");

  let dates = `${fromMonth} ${fromDate} - ${toDate}`;
  let datesHTML = `Pay Period: ${dates}`;

  if (fromMonth !== toMonth) {
    dates = `${fromMonth} ${fromDate} - ${toMonth} ${toDate}`;
    datesHTML = `Pay Period:<br />${dates}`;
  } else {
  }

  payPeriodContainer.innerHTML = datesHTML;
}

function init() {
  populateBreadcrumbs();
  populateContent();
  showToasts();
}

init();
