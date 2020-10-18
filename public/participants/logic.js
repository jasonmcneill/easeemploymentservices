function showSummary(searchterm, data) {
  const resultsEl = document.querySelector("#formSearchResults");

  if (!Array.isArray(data))
    return console.error("showSummary(data): data is not of type array");

  if (!data.length) {
    resultsEl.innerHTML = `
      <p>
        <strong>No results found.</strong>
      </p>
    `;
    return;
  }

  let htmlItems = "";
  data.forEach((item) => {
    const name = `${item.firstname} ${item.lastname}`;
    htmlItems += `
      <a href="profile/#${item.participantid}" class="list-group-item list-group-item-action">
        ${name}
      </a>
    `;
  });

  const htmlResults = `
    <div id="formSearchSummary" class="text-dark mt-4 mb-2">
      <strong>
        Found ${data.length} 
        ${data.length === 1 ? "result" : "results"}:
      </strong>
    </div>
    <div class="list-group">
      ${htmlItems}
    </div>
  `;

  resultsEl.innerHTML = htmlResults;
}

async function onSearchSubmitted(e) {
  e.preventDefault();
  const resultsEl = document.querySelector("#formSearchResults");
  const searchterm = e.target[(id = "participantsearch")].value.trim();
  const content = document.querySelector("#formSearchResults");
  const spinner = document.querySelector("#formSearchResults_spinner");
  const accessToken = await getAccessToken();
  const endpoint = "/api/participant-search";

  resultsEl.innerHTML = "";

  if (!searchterm.length) return;

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      term: searchterm,
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
        case "unable to query for search term":
          console.error("unable to query for search term");
          break;
        case "no results found for search term":
          showSummary(searchterm, []);
          break;
        case "results found for search term":
          showSummary(searchterm, data.results);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

async function getOverview() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/participants-overview";

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
      const summary = document.querySelector("#summary");
      const participantsUnassignedEl = document.querySelector(
        "#participants_unassigned"
      );
      const participantsTotalEl = document.querySelector("#participants_total");
      const employeesUnassignedEl = document.querySelector(
        "#employees_unassigned"
      );
      const employeesTotalEl = document.querySelector("#employees_total");

      switch (data.msg) {
        case "unable to query for summary":
          console.error(data.msg);
          summary.classList.add("d-none");
          break;
        case "summary retrieved":
          const {
            numParticipants,
            numParticipantsUnassigned,
            numEmployees,
            numEmployeesUnassigned,
          } = data.summary;
          participantsUnassignedEl.innerHTML = numParticipantsUnassigned;
          participantsTotalEl.innerHTML = numParticipants;
          employeesUnassignedEl.innerHTML = numEmployeesUnassigned;
          employeesTotalEl.innerHTML = numEmployees;
          break;
      }
    });
}

function attachListeners() {
  document
    .querySelector("#formSearch")
    .addEventListener("submit", onSearchSubmitted);
}

function init() {
  getOverview();
  attachListeners();
}

init();
