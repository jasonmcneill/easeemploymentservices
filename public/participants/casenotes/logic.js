function populateParticipantName(name) {
  const participantid = getId();
  document.querySelector("#breadcrumblink").setAttribute("href", `../profile/#${participantid}`);
  document.querySelectorAll(".participantname").forEach(item => {
    item.innerHTML = name;
  });
  document.title = `Case Notes for ${name}`;
}

function populateCaseNotes(data) {
  const caseNotesFound = document.querySelector("#caseNotesFound");
  const caseNotesNotFound = document.querySelector("#caseNotesNotFound");

  caseNotesFound.classList.add("d-none");
  caseNotesNotFound.classList.add("d-none");

  // TODO: build interface for notes
}

function handleNoCaseNotesFound() {
  const caseNotesFound = document.querySelector("#caseNotesFound");
  const caseNotesNotFound = document.querySelector("#caseNotesNotFound");
  
  caseNotesFound.classList.add("d-none");
  caseNotesNotFound.classList.remove("d-none");
}

async function getCaseNotesData() {
  const participantid = getId();
  const accessToken = await getAccessToken();
  const endpoint = "/api/case-notes-view";
  const timeZone = moment.tz.guess();
  const spinner = document.querySelector("#spinner");

  spinner.classList.remove("d-none");
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      participantid: participantid,
      timeZone: timeZone
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`
    })
  })
    .then(res => res.json())
    .then(data => {
      spinner.classList.add("d-none");
      switch(data.msg) {
        case "user is not authorized for this action":
          addToast("You are not authorized to view case notes for that participant.", "Not Authorized", "danger");
          window.location.href = "../../";
          break;
        case "invalid participant id":
          addToast("Participant ID must be a number.", "Invalid participant ID", "danger");
          window.location.href = "../../";
          break;
        case "unable to query for participant":
          showError("There was a technical glitch preventing the participant's name from being retrieved. Please wait a moment then reload the page.", "Database is Down");
          break;
        case "participant not found":
          addToast("There is no record of that participant in the system.", "Participant Not Found", "danger");
          window.location.href = "../../";
          break;
        case "unable to verify if employee has viewing permissions":
          populateParticipantName(data.participantName);
          showError("There was a technical glitch preventing the participant's case notes from being retrieved. Please wait a moment then reload the page.", "Database is Down");
          break;
        case "participant not assigned to employee":
          addToast("You are not authorized to view this participant's case notes.", "Not Authorized", "danger");
          window.location.href = "../../";
          break;
        case "unable to query for case notes":
          populateParticipantName(data.participantName);
          showError("There was a technical glitch preventing the participant's case notes from being retrieved. Please wait a moment then reload the page.", "Database is Down");
          break;
        case "no case notes found":
          populateParticipantName(data.participantName);
          handleNoCaseNotesFound();
          break;
        case "case notes retrieved":
          populateParticipantName(data.participantName);
          populateCaseNotes(data.data);
          break;
      }
    })
    .catch(err => {
      console.error(err);
      spinner.classList.add("d-none");
    });
}

function onClickAddCaseNote(e) {
  e.preventDefault();
  console.log("onClickAddCaseNote()");
}

function attachEventListeners() {
  document.querySelectorAll(".btnAddCaseNotes").forEach(item => item.addEventListener("click", onClickAddCaseNote));
}

function init() {
  getCaseNotesData();
  checkIfOffline();
  attachEventListeners();
  showToasts();
}

init();
