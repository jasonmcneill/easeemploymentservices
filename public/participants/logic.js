function showSearchResults(searchterm, data) {
  const resultsEl = document.querySelector("#formSearchResults");

  if (!Array.isArray(data))
    return console.error("showSearchResults(data): data is not of type array");

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
  const listEl = document.querySelector("#participantList");
  const searchterm = e.target[(id = "participantsearch")].value.trim();
  const content = document.querySelector("#formSearchResults");
  const spinner = document.querySelector("#formSearchResults_spinner");
  const accessToken = await getAccessToken();
  const endpoint = "/api/participant-search";

  listEl.classList.add("d-none");

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
          showSearchResults(searchterm, []);
          break;
        case "results found for search term":
          showSearchResults(searchterm, data.results);
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
          participantList_showall.innerHTML = `
            ${
              numParticipants === 1
                ? "Show 1 participant"
                : "Show all " + numParticipants + " participants"
            }
          `;
          break;
      }
    });
}

async function showList() {
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#participantList_spinner");
  const accessToken = await getAccessToken();
  const endpoint = "/api/participants-list";
  const participantList = document.querySelector("#participantList");
  const searchResults = document.querySelector("#formSearchResults");

  searchResults.classList.add("d-none");

  function renderList(data) {
    let html = ``;
    data.forEach((item) => {
      const { participantid, firstname, lastname } = item;
      html += `<a href="profile/#${participantid}" class="list-group-item list-group-item-action">${firstname} ${lastname}</a>`;
    });
    html = `
      <p>
        <strong>${data.length} ${
      data.length === 1 ? "participant" : "participants"
    }:</strong>
      </p>
      <div class="list-group">${html}</div>
    `;
    participantList.innerHTML = html;
  }

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
      hideSpinner(content, spinner);
      switch (data.msg) {
        case "user is not authorized for this action":
          window.location.href = "../logout/";
          break;
        case "unable to query for participant list":
          showError(
            "There was a technical glitch that prevented the participants from being displayed. Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "no particpants found":
          participantList.innerHTML = `
          <p>
            <strong>There are currently no participants in the system.</strong>
          </p>
        `;
          break;
        case "participant list retrieved":
          renderList(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function attachListeners() {
  document
    .querySelector("#formSearch")
    .addEventListener("submit", onSearchSubmitted);

  document
    .querySelector("#participantList_showall")
    .addEventListener("click", showList);
}

function init() {
  getOverview();
  attachListeners();
}

init();
