function renderData(data) {
  const {
    address,
    city,
    employeeFirstName,
    employeeLastName,
    employeeid,
    caseworkeremployment,
    caseworkeremploymentname,
    caseworkerhousing,
    caseworkerhousingname,
    firstname,
    lastname,
    participantid,
    phone,
    phonecountry,
    state,
    zip,
    authorizationdate,
    seeksemployment,
    seekshousing,
    case_notes_filename,
    case_notes_filesize,
  } = data;
  const phoneDigitsOnly = phone.replace(/\D/g, "");

  const strAuthorizationDate = moment(authorizationdate).isValid()
    ? moment(authorizationdate).format("MMMM D, YYYY")
    : "N/A";

  // Populate full name
  document.querySelectorAll("[data-name]").forEach((item) => {
    item.innerHTML = `${firstname} ${lastname}`;
  });

  const participantdataEl = document.querySelector("#participantdata");
  let html = "";

  // Needs
  let needsRows = 0;
  if (seeksemployment === 1) needsRows += 1;
  if (seekshousing === 1) needsRows += 1;
  if (needsRows > 0) {
    html += `
      <tr>
        <th>Needs:</th>
        <td>
          <ul class="m-0 pl-4">
            <li ${
              seeksemployment !== 1 && 'class="d-none"'
            }><a href="../../employment/">Employment</a></li>
            <li ${
              seekshousing !== 1 && 'class="d-none"'
            }><a href="../../housing/">Housing</a></li>
          </ul>
        </td>
      </tr>
    `;
  }

  // Phone
  if (phone.length) {
    html += `
      <tr>
        <th>Phone:</th>
        <td>
          ${phone}
          <p class="mt-2 mb-0">
            <a href="tel:${phoneDigitsOnly}">Call</a>
            <span class="mx-3">|</span>
            <a href="sms:${phoneDigitsOnly}">Text</a>
          </p>
        </td>
      </tr>
    `;
  }

  // Address
  html += `
    <tr>
      <th>Address:</th>
      <td>
        <div>${address}</div>
        <div>${city}, ${state} ${zip}</div>
      </td>
    </tr>
  `;

  // Authorization Date
  html += `
    <tr>
      <th>Authorization Date:</th>
      <td>
        ${strAuthorizationDate}
      </td>
    </tr>
  `;

  // Employment Case Worker
  if (!caseworkeremployment) {
    html += `
      <tr>
        <th>Case Worker for Employment:</th>
        <td>
          Unassigned
        </td>
      </tr>
    `;
  } else {
    html += `
    <tr>
      <th>Case Worker for Employment:</th>
      <td>
        <a href="../../employees/profile/#${caseworkeremployment}">${caseworkeremploymentname}</a>
      </td>
    </tr>
  `;
  }

  // Housing Case Worker
  if (!caseworkerhousing) {
    html += `
      <tr>
        <th>Case Worker for Housing:</th>
        <td>
          Unassigned
        </td>
      </tr>
    `;
  } else {
    html += `
    <tr>
      <th>Case Worker for Housing:</th>
      <td>
        <a href="../../employees/profile/#${caseworkerhousing}">${caseworkerhousingname}</a>
      </td>
    </tr>
  `;
  }

  html = `<table class="table table-bordered my-3">${html}</table>`;
  participantdataEl.innerHTML = html;

  const actionButtons = document.querySelector("#actionButtons");
  actionButtons.classList.remove("d-none");

  // Case notes download button
  if (case_notes_filename.length) {
    const casenotesdownload = document.querySelector("#casenotesdownload");
    const casenotesdownloadcontainer = document.querySelector(
      "#casenotesdownloadcontainer"
    );

    const casenotesdownloadsize = document.querySelector(
      "#casenotesdownloadsize"
    );
    const kb = Math.round(parseInt(case_notes_filesize) / 1024);
    let sizeUnit = "kb";
    if (kb >= 1000) sizeUnit = "mb";
    let sizeText = `${kb} ${sizeUnit}`;
    if (case_notes_filesize < 1024) {
      sizeText = "Less than 1 kb";
    }

    casenotesdownload.setAttribute("download", case_notes_filename);
    casenotesdownloadsize.innerHTML = `Size: ${sizeText}`;
    casenotesdownloadcontainer.classList.remove("d-none");
  }
}

function renderPlacements(data) {
  const placements = document.querySelector("#placements");
  const placementdata = document.querySelector("#placementdata");

  if (!data.length) return;

  let html = "";
  data.forEach((item) => {
    const { jobid, jobtitle, companyname, city, state } = item;
    html += `
      <a href="../../employment/profile/#${jobid}" class="list-group-item list-group-item-action">
        <big><strong>${jobtitle}</strong></big><br>
        <div class="text-muted">${companyname}</div>
        <div class="text-muted">${city}, ${state}</div>
      </a>
    `;
  });
  html = `<div class="list-group">${html}</div>`;

  placementdata.innerHTML = html;
  placements.classList.remove("d-none");
}

function renderHousingPlacement(data) {
  const housingplacement = document.querySelector("#housingplacement");
  const housingplacementdata = document.querySelector("#housingplacementdata");

  if (!data.length) return;

  const { homeid, hometitle, companyname, address, city, state, zip } = data[0];
  let html = "";
  html += `
    <a href="../../housing/profile/#${homeid}" class="list-group-item list-group-item-action">
      <big><strong>${hometitle}</strong></big><br>
      <div class="text-muted">${companyname}</div>
      <div class="text-muted">${address}</div>
      <div class="text-muted">${city}, ${state} ${zip}</div>
    </a>
  `;
  html = `<div class="list-group">${html}</div>`;

  housingplacementdata.innerHTML = html;
  housingplacement.classList.remove("d-none");
}

async function getProfileData() {
  const participantid = getId();
  const accessToken = await getAccessToken();
  const endpoint = "/api/participant-view";

  const spinner = document.querySelector("#participantdata_spinner");
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      participantid: participantid,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      spinner.classList.add("d-none");
      switch (data.msg) {
        case "user is not authorized for this action":
          addToast(
            "Your account does not have sufficient permissions to perform that action.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
        case "unable to query for participant":
          showError(
            "There was a technical glitch preventing the participant from being displayed. Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "no record of participant":
          addToast(
            "This participant is no longer in the system.",
            "No record of participant",
            "danger"
          );
          history.go(-1);
          break;
        case "participant retrieved":
          renderData(data.data);
          break;
      }
    })
    .catch((err) => {
      spinner.classList.add("d-none");
      console.error(err);
    });
}

function onEdit() {
  const participantid = getId();

  window.location.href = `edit/#${participantid}`;
}

function onDelete() {
  $("#modalDeleteParticipant").modal("show");
}

async function onConfirmDelete() {
  const participantid = getId();
  const accessToken = await getAccessToken();
  const endpoint = "/api/participant-delete";
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      participantid: participantid,
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
          window.location.href = "../../logout/";
          break;
        case "participant id is missing":
          $("#modalDeleteParticipant").modal("hide");
          addToast(
            "The participant could not be deleted because the participant's ID could not be determined.",
            "Unable to Delete",
            "danger"
          );
          window.location.href = "../";
          break;
        case "participant id must be a number":
          addToast(
            "The participant could not be deleted because the participant's ID must be a number.",
            "Unable to Delete",
            "danger"
          );
          window.location.href = "../";
          break;
        case "participant deleted":
          addToast(
            "The participant was deleted successfully.",
            "Participant Deleted",
            "success"
          );
          window.location.href = "../";
          break;
        default:
          $("#modalDeleteParticipant").modal("hide");
          showError(
            "Due to a technical glitch, the participant could not be deleted.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
      }
    });
}

async function getPlacementsData() {
  const participantid = getId();
  const endpoint = "/api/job-placements-of-participant";
  const accessToken = await getAccessToken();

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      participantid: participantid,
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
          addToast(
            "Your account does not have sufficient permissions to view a participant's job placements.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
        case "invalid participant id":
          addToast(
            "The participant could not be viewed because the URL was malformed.",
            "Invalid participant ID",
            "danger"
          );
          window.location.href = "../";
          break;
        case "unable to query for participant id":
          showError(
            "There was a technical glitch preventing the job placements for this participant from being displayed.  Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "placements retrieved":
          renderPlacements(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

async function getHousingPlacementData() {
  const participantid = getId();
  const endpoint = "/api/housing-placements-of-participant";
  const accessToken = await getAccessToken();

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      participantid: participantid,
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
          addToast(
            "Your account does not have sufficient permissions to view a participant's housing placement.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
        case "invalid participant id":
          addToast(
            "The participant could not be viewed because the URL was malformed.",
            "Invalid participant ID",
            "danger"
          );
          window.location.href = "../";
          break;
        case "unable to query for participant id":
          showError(
            "There was a technical glitch preventing the housing placement for this participant from being displayed.  Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "housing placements retrieved":
          renderHousingPlacement(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

async function onUpload(evt) {
  const uploadform = document.querySelector("#uploadcasenotes");
  const uploadinput = document.querySelector("#casenotesfile");
  const uploadbutton = document.querySelector("#casenotesupload");
  const accessToken = await getAccessToken();
  const data = new FormData();
  const participantid = getId();

  evt.preventDefault();

  // Validate file
  const uploadFilePath = uploadinput.value.trim();
  if (uploadFilePath === "") {
    return showToast(
      "Please choose a file to upload.",
      "File missing",
      "danger"
    );
  }

  data.append("file", uploadinput.files[0]);
  data.append("participantid", participantid);

  uploadbutton.setAttribute("disabled", true);
  uploadbutton.innerText = "Uploading...";
  uploadbutton.classList.remove("btn-primary");
  uploadbutton.classList.add("btn-secondary");

  fetch("/api/case_notes_upload", {
    method: "POST",
    body: data,
    headers: new Headers({
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.msg) {
        case "upload successful":
          const label = document.querySelector("label[for='casenotesfile']");
          uploadform.reset();
          label.innerText = "Choose file";

          uploadbutton.removeAttribute("disabled");
          uploadbutton.innerText = "Upload";
          uploadbutton.classList.add("btn-primary");
          uploadbutton.classList.remove("btn-secondary");

          const case_notes_filesize = data.filesize;
          const casenotesdownloadsize = document.querySelector(
            "#casenotesdownloadsize"
          );
          const kb = Math.round(parseInt(case_notes_filesize) / 1024);
          let sizeUnit = "kb";
          if (kb >= 1000) sizeUnit = "mb";
          let sizeText = `${kb} ${sizeUnit}`;
          if (case_notes_filesize < 1024) {
            sizeText = "Less than 1 kb";
          }
          casenotesdownloadsize.innerHTML = `Size: ${sizeText}`;

          showToast(
            "Case notes uploaded successfully.",
            "Upload successful",
            "success"
          );
          break;
        case "user is not authorized for this action":
          addToast(
            "You do not have sufficient permissions to upload case notes for this participant.",
            "Upload failed",
            "danger",
            5000,
            true
          );
          window.location.href = "../";
          break;
        default:
          showToast(
            "There was a technical glitch preventing the file from being uploaded. Please try again.",
            "Upload failed",
            "danger",
            5000,
            true
          );
      }
    })
    .catch((err) => {
      console.error(err);
      uploadbutton.removeAttribute("disabled");
      uploadbutton.innerText = "Upload";
      uploadbutton.classList.add("btn-primary");
      uploadbutton.classList.remove("btn-secondary");
    });
}

function onFileSelected(evt) {
  const uploadFilePath = evt.target.files[0].name;
  const label = document.querySelector("label[for='casenotesfile']");
  label.innerText = uploadFilePath;
}

async function onDownload(evt) {
  evt.preventDefault();
  const endpoint = "/api/case_notes_download";
  const participantid = getId();
  const accessToken = await getAccessToken();
  const downloadbutton = document.querySelector("#casenotesdownload");

  downloadbutton.setAttribute("disabled", true);
  downloadbutton.innerText = "Downloading...";
  downloadbutton.classList.remove("btn-primary");
  downloadbutton.classList.add("btn-secondary");

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      participantid: participantid,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.blob())
    .then((blob) => {
      if (!blob instanceof Blob) {
        switch (blob.msg) {
          case "unable to query for participant":
            showToast(
              "An unknown error occurred. Please check your internet connection, then try again.",
              "Download failed",
              "danger",
              5000,
              true
            );
            break;
          case "participant not found":
            addToast(
              "Participant is no longer in the system.",
              "Download failed",
              "danger",
              5000,
              false
            );
            window.location.href = "../";
            break;
          case "not eligible to download case notes for this participant":
            showToast(
              "You do not have sufficient permissions to download case notes for this participant.",
              "Download failed",
              "danger",
              5000,
              true
            );
            break;
        }
      }

      const casenotesdownload = document.querySelector("#casenotesdownload");
      const a = document.createElement("a");
      a.style = "display: none";
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = casenotesdownload.getAttribute("download");
      document.body.appendChild(a);
      a.click();

      downloadbutton.removeAttribute("disabled");
      downloadbutton.innerText = "Download";
      downloadbutton.classList.add("btn-primary");
      downloadbutton.classList.remove("btn-secondary");

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    })
    .catch((err) => {
      console.error(err);
      downloadbutton.removeAttribute("disabled");
      downloadbutton.innerText = "Download";
      downloadbutton.classList.add("btn-primary");
      downloadbutton.classList.remove("btn-secondary");
    });
}

function attachListeners() {
  document.querySelector("#btnEdit").addEventListener("click", onEdit);
  document.querySelector("#btnDelete").addEventListener("click", onDelete);
  document
    .querySelector("#btnConfirmDelete")
    .addEventListener("click", onConfirmDelete);
  document
    .querySelector("#uploadcasenotes")
    .addEventListener("submit", onUpload);
  document
    .querySelector("#casenotesfile")
    .addEventListener("change", onFileSelected);
  document
    .querySelector("#casenotesdownload")
    .addEventListener("click", onDownload);
}

function init() {
  getProfileData();
  getPlacementsData();
  getHousingPlacementData();
  attachListeners();
  showToasts();
}

init();
