function getStates(selectedState) {
  const state = document.querySelector("#state");
  const endpoint = "../../../_assets/json/states.json";

  fetch(endpoint)
    .then((res) => res.json())
    .then((states) => {
      let html = `<option value="">(Select)</option>`;
      for (i in states) {
        const abbrev = i;
        const state = states[i];
        const option = `<option value="${abbrev}" ${
          abbrev === "WA" && "selected"
        }>${state}</option>`;
        html += option;
      }
      state.innerHTML = html;
      state.value = selectedState;
    })
    .catch((err) => {
      console.error(err);
    });
}

function populateProviders(data, selectedProviderId) {
  const providerid = document.querySelector("#providerid");
  let html = `<option value="">(Select)</option>`;
  data.forEach((item) => {
    const { providerid, companyname } = item;
    let option = `<option value="${providerid}">${companyname}</option>`;
    html += option;
  });
  providerid.innerHTML = html;
  providerid.value = selectedProviderId;
}

async function getProviders(selectedProviderId) {
  const endpoint = "/api/provider-list";
  const accessToken = await getAccessToken();
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

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
          addToast(
            "You do not have sufficient permissions to add a home to the system.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "unable to query for providers":
          showError(
            "There was a technical glitch preventing a list of housing providers from being retrieved, which is necessary in order to add a home. Please wait a moment then reload the page.",
            "Can't Load Housing Providers"
          );
          break;
        case "providers retrieved":
          if (!data.data.length) {
            window.location.href = "../../providers/add/";
          } else {
            populateProviders(data.data, selectedProviderId);
          }
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

async function getEmployees() {
  const accessToken = await getAccessToken();
  const endpoint = "/api/employee/employees-list";
  const foundbyemployeeid = document.querySelector("#foundbyemployeeid");
  const userEmployeeid = JSON.parse(atob(accessToken.split(".")[1])).employeeid;

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
      let html = `<option value="">(Select)</option>`;
      data.forEach((item) => {
        const { employeeid, firstname, lastname } = item;
        html += `<option value="${employeeid}" ${
          employeeid == userEmployeeid && "selected"
        }>${firstname} ${lastname}</option>`;
      });
      html += `<option value="0">EASE</option>`;
      foundbyemployeeid.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
    });
}

async function getParticipants() {
  const endpoint = "/api/participants-list";
  const accessToken = await getAccessToken();

  return new Promise((resolve, reject) => {
    fetch(endpoint, {
      mode: "cors",
      method: "GET",
      headers: new Headers({
        "Content-Type": "applicatin/json",
        authorization: `Bearer ${accessToken}`,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const filledby = document.querySelector("#filledby");
        const filledby_container = document.querySelector(
          "#filledby_container"
        );

        let filledByHtml = `<option value="">Unfilled</option>`;

        switch (data.msg) {
          case "user is not authorized for this action":
            filledby_container.classList.add("d-none");
            break;
          case "unable to query for participant list":
            filledby_container.classList.add("d-none");
            break;
          case "no particpants found":
            filledby_container.classList.add("d-none");
            break;
          case "participant list retrieved":
            data.data.forEach((item) => {
              const { participantid, firstname, lastname } = item;
              filledByHtml += `<option value="${participantid}">${firstname} ${lastname}</option>`;
            });
            break;
        }
        filledby.innerHTML = filledByHtml;
        resolve();
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

async function getHomeData() {
  const homeid = getId();
  const accessToken = await getAccessToken();
  const endpoint = `/api/home-full/${homeid}`;
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");

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
          addToast(
            "You do not have sufficient permissions to edit a home.",
            "Not authorized",
            "danger"
          );
          break;
        case "unable to query for home":
          showError(
            "There was a technical glitch that prevented the home details from being retrieved.  Please wait a moment then reload the page.",
            "Database is Down"
          );
          break;
        case "home retrieved":
          populateForm(data.data);
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

function populateForm(data) {
  const timeZone = moment.tz.guess();
  const {
    address,
    city,
    companyname,
    contactemail,
    contactname,
    contactphone,
    contactphoneext,
    createdAt,
    providerid,
    foundbyemployeeid,
    homedescription,
    homeid,
    hometitle,
    state,
    zip,
  } = data;

  let participantid = data.participantid;
  if (participantid === null) participantid = "";

  document
    .querySelectorAll("[data-homename]")
    .forEach((item) => (item.innerHTML = hometitle));

  document.querySelector("#breadcrumblink").href = `../#${homeid}`;

  document.querySelector("#foundbyemployeeid").value = foundbyemployeeid;

  document.querySelector("#providerid").value = providerid;

  document.querySelector("#hometitle").value = hometitle;

  document.querySelector("[data-companyname]").innerHTML = companyname;

  document.querySelector("#homedescription").value = homedescription;

  document.querySelector("#contactname").value = contactname;

  document.querySelector("#contactphone").value = contactphone;

  document.querySelector("#contactphoneext").value = contactphoneext;

  document.querySelector("#contactemail").value = contactemail;

  document.querySelector("#address").value = address;

  document.querySelector("#city").value = city;

  document.querySelector("#state").value = state;

  document.querySelector("#zip").value = zip;

  document.querySelector("#filledby").value = participantid;

  document.querySelector("[data-createdAt]").innerHTML = `
    Posted: 
      ${moment(createdAt).tz(timeZone, false).format("MMMM D, YYYY")}`;

  getStates(state);
  getEmployees(foundbyemployeeid);
  getProviders(providerid);
}

async function onSubmit(e) {
  e.preventDefault();
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");
  const filledby = e.target["filledby"].value;
  let confirmedModal =
    e.target["confirmedmodal"].value === "true" ? true : false;

  document
    .querySelectorAll(".is-invalid")
    .forEach((item) => item.classList.remove("is-invalid"));

  showSpinner(content, spinner);

  if (!confirmedModal) {
    if (filledby !== "") {
      const participantid = parseInt(filledby);
      const otherPlacements =
        (await checkIfParticipantAlreadyPlaced(participantid)) || [];
      if (otherPlacements.length) {
        e.stopPropagation();
        hideSpinner(content, spinner);
        showConfirmation(otherPlacements, e);
      } else {
        updateHome(e);
      }
    } else {
      updateHome(e);
    }
  } else {
    updateHome(e);
  }

  confirmedModal =
    document.querySelector("#confirmedmodal").value === "true" ? true : false;
  if (confirmedModal) onConfirmedModal();
}

function showConfirmation(otherPlacements, e) {
  const confirmedModal = document.querySelector("#confirmedmodal");
  const filledby = document.querySelector("#filledby");
  const participantName = filledby.selectedOptions[0].text;
  const homeswordEl = document.querySelector(".homesword");
  const homesword = otherPlacements.length === 1 ? "home" : "homes";
  const summaryOtherPlacements = document.querySelector(
    "#summaryOtherPlacements"
  );
  let summaryHtml = "";
  const thishomename = document.querySelector("[data-homename]").innerText;

  confirmedModal.value = "false";
  homeswordEl.innerHTML = homesword;

  document
    .querySelectorAll(".participantname")
    .forEach((item) => (item.innerHTML = participantName));
  document
    .querySelectorAll(".thishomename")
    .forEach((item) => (item.innerHTML = thishomename));

  otherPlacements.forEach((item) => {
    const { homeid, hometitle, city, state, providerid, companyname } = item;
    summaryHtml += `
      <li>
        <big><a href="../#${homeid}"><strong>${hometitle}</strong></a></big><br>
        <a href="../../providers/profile/#${providerid}">${companyname}</a><br>
        <small>${city}, ${state}</small>
      </li>
    `;
  });

  summaryHtml = `<ul class="my-2">${summaryHtml}</ul>`;
  summaryOtherPlacements.innerHTML = summaryHtml;

  e.preventDefault();
  e.stopPropagation();

  $("#modalConfirmOtherPlacements").modal("show");
}

function onConfirmedModal() {
  const formEditHome = document.querySelector("#formEditHome");
  const confirmedModal = document.querySelector("#confirmedmodal");

  confirmedModal.value = "true";
  $("#modalConfirmOtherPlacements").modal("hide");
  formEditHome.querySelector("button[type=submit]").click();
}

async function updateHome(e) {
  const content = document.querySelector("#content");
  const spinner = document.querySelector("#spinner");
  const accessToken = await getAccessToken();
  const endpoint = "/api/home-edit";
  const foundbyemployeeid = e.target["foundbyemployeeid"].value;
  const providerid = e.target["providerid"].value.trim();
  const hometitle = e.target["hometitle"].value.trim();
  const homedescription = e.target["homedescription"].value.trim();
  const contactname = e.target["contactname"].value.trim();
  const contactphone = e.target["contactphone"].value.trim();
  const contactphoneext = e.target["contactphoneext"].value.trim();
  const contactemail = e.target["contactemail"].value.trim();
  const address = e.target["address"].value.trim();
  const city = e.target["city"].value.trim();
  const state = e.target["state"].value.trim();
  const zip = e.target["zip"].value.trim();
  const homeid = getId();
  const filledby = e.target["filledby"].value;
  const noLongerOnTheMarket = e.target["status_no_longer_on_the_market"].checked
    ? true
    : false;
  const timeZone = moment.tz.guess();

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      homeid: homeid,
      foundbyemployeeid: foundbyemployeeid,
      providerid: providerid,
      hometitle: hometitle,
      homedescription: homedescription,
      contactname: contactname,
      contactphone: contactphone,
      contactphoneext: contactphoneext,
      contactemail: contactemail,
      address: address,
      city: city,
      state: state,
      zip: zip,
      filledby: filledby,
      noLongerOnTheMarket: noLongerOnTheMarket,
      timeZone: timeZone,
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
        case "user is not authorized for this action":
          addToast(
            "You do not have sufficient permissions to edit a home.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "invalid homeid":
          addToast(
            "The home could not be updated.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "../";
          break;
        case "invalid foundbyemployeeid":
          document
            .querySelector("#foundbyemployeeid")
            .classList.add("is-invalid");
          showError(
            `Please select an item under "Found by" to indicate which employee found this home. If not applicable, select "EASE."`,
            "Form Incomplete"
          );
          break;
        case "invalid provider id":
          document.querySelector("#providerid").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please select the housing provider.</div>",
            "Form Incomplete"
          );
          break;
        case "missing home title":
          document.querySelector("#hometitle").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please input the home title.</div>",
            "Form Incomplete"
          );
          break;
        case "missing city":
          document.querySelector("#city").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please input the city.</div>",
            "Form Incomplete"
          );
          break;
        case "missing state":
          document.querySelector("#state").classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please select the state.</div>",
            "Form Incomplete"
          );
          break;
        case "unable to query whether provider still exists":
          console.error(data.error);
          showError(
            "There was a technical glitch which prevented the home from being updated.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "provider no longer exists":
          document.querySelector("#providerid").classList.add("is-invalid");
          addToast(
            "The housing provider that you selected no longer exists.",
            "Invalid housing provider",
            "danger"
          );
          window.location.reload();
          break;
        case "invalid email format":
          document.querySelector("#contactemail").classList.add("is-invalid");
          showError("", "Form Incomplete");
          break;
        case "unable to query whether home is a duplicate":
          console.error(data.error);
          showError(
            "There was a technical glitch which prevented the home from being updated.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "home already exists":
          showError(
            `A home with this title and this housing provider <a href="../#${data.homeid}" class="alert-link">already exists</a>.`,
            "Duplicate"
          );
          break;
        case "invalid phone number":
          document.querySelector("#contactphone").classList.add("is-invalid");
          showError(
            "Please check the phone number of the home contact for accuracy.",
            "Invalid phone number"
          );
          break;
        case "invalid phone number for region":
          document.querySelector("#contactphone").classList.add("is-invalid");
          showError(
            "Please input only a U.S. phone number for the home contact.",
            "U.S. phone number required"
          );
          break;
        case "phone is required if phone extension is not blank":
          document.querySelector("#contactphone").classList.add("is-invalid");
          showError(
            "You have provided a phone extension, but the phone number is blank. Please input the phone number.",
            "Form Incomplete"
          );
          break;
        case "unable to insert home":
          console.error(data.error);
          showError(
            "There was a technical glitch which prevented the home from being updated.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "home updated":
          addToast(
            "The home was assigned to the participant successfully.",
            "Home Updated",
            "success"
          );
          window.location.href = `../../../participants/profile/#${filledby}`;
          break;
        case "home deleted":
          addToast(
            "The home was removed successfully.",
            "Home Removed",
            "success"
          );
          window.location.href = "../../";
          break;
        default:
          showError(
            "There was a technical glitch preventing the update from being processed. Please wait a moment then try again.",
            "Database is Down"
          );
          break;
      }
    })
    .catch((err) => {
      hideSpinner(content, spinner);
      console.error(err);
    });
}

function noLongerOnTheMarket(e) {
  const filledby = document.querySelector("#filledby");
  const checked = e.target.checked || false;
  const btnSubmit = document.querySelector("button[type=submit]");

  if (checked) {
    filledby.value = "";
    filledby.setAttribute("disabled", true);
    btnSubmit.classList.remove("btn-dark");
    btnSubmit.classList.add("btn-danger");
    btnSubmit.innerHTML = "Delete home";
  } else {
    filledby.removeAttribute("disabled");
    btnSubmit.classList.remove("btn-danger");
    btnSubmit.classList.add("btn-dark");
    btnSubmit.innerHTML = "Update";
  }
}

async function checkIfParticipantAlreadyPlaced(participantid) {
  const accessToken = await getAccessToken();
  return new Promise((resolve, reject) => {
    const endpoint = "/api/housing-placements-of-participant";

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
        const homeid = getId();
        switch (data.msg) {
          case "user is not authorized for this action":
            addToast(
              "You do not have sufficient permissions to edit a home listing.",
              "Not authorized",
              "danger"
            );
            window.location.href = `../#${homeid}`;
            break;
          case "invalid participant id":
            showError(
              `The participant could not be identified by the "filled by" dropdown. Please check the selected value then try again.`,
              "Invalid participant ID"
            );
            reject("invalid participant id");
            break;
          case "unable to query for participant id":
            showError(
              "There was a technical glitch preventing the participant from filling this home.  Please wait a moment then try again.",
              "Database is Down"
            );
            reject("unable to query for participant id");
            break;
          case "housing placements retrieved":
            const otherPlacements = data.data.filter(
              (item) => item.homeid !== homeid
            );
            resolve(otherPlacements);
            break;
          default:
            resolve([]);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

function onVacancyFilled(e) {
  e.preventDefault();
  const participantid = e.target.selectedOptions[0].value;
  const checkboxNoLongerOnTheMarket = document.querySelector("#status_no_longer_on_the_market");

  if (participantid !== "") {
    checkboxNoLongerOnTheMarket.checked = false;
    checkboxNoLongerOnTheMarket.setAttribute("disabled", true);
    checkboxNoLongerOnTheMarket.parentElement.classList.add("text-muted");
    checkboxNoLongerOnTheMarket.parentElement.style.textDecoration = "line-through";
  } else {
    checkboxNoLongerOnTheMarket.removeAttribute("disabled");
    checkboxNoLongerOnTheMarket.parentElement.classList.remove("text-muted");
    checkboxNoLongerOnTheMarket.parentElement.style.textDecoration = null;
  }
}

function attachListeners() {
  document.querySelector("#formEditHome").addEventListener("submit", onSubmit);
  document
    .querySelector("#status_no_longer_on_the_market")
    .addEventListener("change", noLongerOnTheMarket);
  document
    .querySelector("#btnConfirmOtherPlacement")
    .addEventListener("click", onConfirmedModal);

  document.querySelector("#filledby").addEventListener("change", onVacancyFilled);
}

async function init() {
  await getParticipants();
  getHomeData();
  attachListeners();
  showToasts();
}

init();
