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
    case_notes_employment_filename_original = "",
    case_notes_employment_filesize = 0,
    case_notes_housing_filename_original = "",
    case_notes_housing_filesize = 0
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

  // Case notes for employment: download button
  if (case_notes_employment_filename_original !== null) {
    const casenotesemploymentdownload = document.querySelector("#casenotesemploymentdownload");
    const casenotesemploymentdownloadcontainer = document.querySelector(
      "#casenotesdownloademploymentcontainer"
    );

    const casenotesemploymentdownloaddetails = document.querySelector(
      "#casenotesemploymentdownloaddetails"
    );
    const kbEmployment = Math.round(parseInt(case_notes_employment_filesize) / 1024);
    let sizeEmploymentUnit = "kb";
    if (kbEmployment >= 1000) sizeEmploymentUnit = "mb";
    let sizeEmploymentText = `${kbEmployment} ${sizeEmploymentUnit}`;
    if (case_notes_employment_filesize < 1024) {
      sizeEmploymentUnit = "Less than 1 kb";
    }

    casenotesemploymentdownload.setAttribute("download", case_notes_employment_filename_original);
    casenotesemploymentdownloaddetails.innerHTML = `<code>${case_notes_employment_filename_original}</code><br><code>${sizeEmploymentText}</code>`;
    casenotesemploymentdownloadcontainer.classList.remove("d-none");
  }

  // Case notes for housing: download button
  if (case_notes_housing_filename_original !== null) {
    const casenoteshousingdownload = document.querySelector("#casenoteshousingdownload");
    const casenoteshousingdownloadcontainer = document.querySelector(
      "#casenotesdownloadhousingcontainer"
    );

    const casenoteshousingdownloaddetails = document.querySelector(
      "#casenoteshousingdownloaddetails"
    );
    const kbHousing = Math.round(parseInt(case_notes_housing_filesize) / 1024);
    let sizeHousingUnit = "kb";
    if (kbHousing >= 1000) sizeHousingUnit = "mb";
    let sizeHousingText = `${kbHousing} ${sizeHousingUnit}`;
    if (case_notes_housing_filesize < 1024) {
      sizeHousingUnit = "Less than 1 kb";
    }

    casenoteshousingdownload.setAttribute("download", case_notes_housing_filename_original);
    casenoteshousingdownloaddetails.innerHTML = `<code>${case_notes_housing_filename_original}</code><br><code>${sizeHousingText}</code>`;
    casenoteshousingdownloadcontainer.classList.remove("d-none");
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

async function onUploadEmployment(evt) {
  const uploadform = document.querySelector("#uploademploymentcasenotes");
  const uploadinput = document.querySelector("#casenotesemploymentfile");
  const uploadbutton = document.querySelector("#casenotesemploymentupload");
  const downloadbutton = document.querySelector("#casenotesemploymentdownload");
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

  fetch("/api/case_notes_employment_upload", {
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
          const label = document.querySelector("label[for='casenotesemploymentfile']");
          uploadform.reset();
          label.innerText = "Choose file";

          uploadbutton.removeAttribute("disabled");
          uploadbutton.innerText = "Upload";
          uploadbutton.classList.add("btn-primary");
          uploadbutton.classList.remove("btn-secondary");

          const case_notes_filesize = data.filesize;
          const case_notes_filename = data.filename;
          const case_notes_mimetype = data.case_notes_mimetype;
          const casenotesdownloaddetails = document.querySelector(
            "#casenotesemploymentdownloaddetails"
          );
          const casenotesdownloadcontainer = document.querySelector("#casenotesdownloademploymentcontainer");
          const kb = Math.round(parseInt(case_notes_filesize) / 1024);
          let sizeUnit = "kb";
          if (kb >= 1000) sizeUnit = "mb";
          let sizeText = `${kb} ${sizeUnit}`;
          if (case_notes_filesize < 1024) {
            sizeText = "Less than 1 kb";
          }
          casenotesdownloaddetails.innerHTML = `<code>${case_notes_filename}</code><br><code>${sizeText}</code>`;
          casenotesdownloadcontainer.classList.remove("d-none");
          downloadbutton.setAttribute("download", case_notes_filename);

          showToast(
            "Case notes uploaded successfully.",
            "Upload successful",
            "success"
          );
          break;
        case "user is not authorized for this action":
          addToast(
            "You do not have sufficient permissions to upload employment case notes for this participant.",
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

function onFileSelectedEmployment(evt) {
  const uploadFilePath = evt.target.files[0].name;
  const label = document.querySelector("label[for='casenotesemploymentfile']");
  label.innerText = uploadFilePath;
}

async function onDownloadEmployment(evt) {
  evt.preventDefault();
  const endpoint = "/api/case_notes_employment_download";
  const participantid = getId();
  const accessToken = await getAccessToken();
  const downloadbutton = document.querySelector("#casenotesemploymentdownload");

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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadbutton.getAttribute("download");
      document.body.appendChild(a);
      a.style = "display: none";
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

async function onUploadHousing(evt) {
  const uploadform = document.querySelector("#uploadhousingcasenotes");
  const uploadinput = document.querySelector("#casenoteshousingfile");
  const uploadbutton = document.querySelector("#casenoteshousingupload");
  const downloadbutton = document.querySelector("#casenoteshousingdownload");
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

  fetch("/api/case_notes_housing_upload", {
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
          const label = document.querySelector("label[for='casenoteshousingfile']");
          uploadform.reset();
          label.innerText = "Choose file";

          uploadbutton.removeAttribute("disabled");
          uploadbutton.innerText = "Upload";
          uploadbutton.classList.add("btn-primary");
          uploadbutton.classList.remove("btn-secondary");

          const case_notes_filesize = data.filesize;
          const case_notes_filename = data.filename;
          const case_notes_mimetype = data.case_notes_mimetype;
          const casenotesdownloaddetails = document.querySelector(
            "#casenoteshousingdownloaddetails"
          );
          const casenotesdownloadcontainer = document.querySelector("#casenotesdownloadhousingcontainer");
          const kb = Math.round(parseInt(case_notes_filesize) / 1024);
          let sizeUnit = "kb";
          if (kb >= 1000) sizeUnit = "mb";
          let sizeText = `${kb} ${sizeUnit}`;
          if (case_notes_filesize < 1024) {
            sizeText = "Less than 1 kb";
          }
          casenotesdownloaddetails.innerHTML = `<code>${case_notes_filename}</code><br><code>${sizeText}</code>`;
          casenotesdownloadcontainer.classList.remove("d-none");
          downloadbutton.setAttribute("download", case_notes_filename);

          showToast(
            "Case notes uploaded successfully.",
            "Upload successful",
            "success"
          );
          break;
        case "user is not authorized for this action":
          addToast(
            "You do not have sufficient permissions to upload housing case notes for this participant.",
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

function onFileSelectedHousing(evt) {
  const uploadFilePath = evt.target.files[0].name;
  const label = document.querySelector("label[for='casenoteshousingfile']");
  label.innerText = uploadFilePath;
}

async function onDownloadHousing(evt) {
  evt.preventDefault();
  const endpoint = "/api/case_notes_housing_download";
  const participantid = getId();
  const accessToken = await getAccessToken();
  const downloadbutton = document.querySelector("#casenoteshousingdownload");

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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadbutton.getAttribute("download");
      document.body.appendChild(a);
      a.style = "display: none";
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
    .querySelector("#uploademploymentcasenotes")
    .addEventListener("submit", onUploadEmployment);
  document
    .querySelector("#casenotesemploymentfile")
    .addEventListener("change", onFileSelectedEmployment);
  document
    .querySelector("#casenotesemploymentdownload")
    .addEventListener("click", onDownloadEmployment);
    document
    .querySelector("#uploadhousingcasenotes")
    .addEventListener("submit", onUploadHousing);
  document
    .querySelector("#casenoteshousingfile")
    .addEventListener("change", onFileSelectedHousing);
  document
    .querySelector("#casenoteshousingdownload")
    .addEventListener("click", onDownloadHousing);
}

function init() {
  getProfileData();
  getPlacementsData();
  getHousingPlacementData();
  attachListeners();
  showToasts();
}

init();
