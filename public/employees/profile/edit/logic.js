function populateBreadcrumbLink() {
  const employeeid = document.location.hash || "";
  if (employeeid.length) {
    document
      .querySelector("#employeeProfile")
      .setAttribute("href", `../${employeeid}`);
  }
}

async function populateContent() {
  const employeeid = getId();
  const endpoint = `/api/employee/${employeeid}`;
  const accessToken = await getAccessToken();
  const employeeid_of_requestor = JSON.parse(atob(accessToken.split(".")[1]))
    .employeeid;

  if (typeof employeeid !== "number") {
    return showError(
      "<div class='text-center'>An invalid value for the employee ID is specified in the address bar.</div>",
      "Invalid Employee ID"
    );
  }

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
        case "user is not authorized for this action":
          addToast(
            "Your account does not have sufficient permissions to perform that action.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
      }

      const {
        employeeid,
        email,
        email_personal,
        phone,
        smsphone,
        smsphonecountry,
        firstname,
        lastname,
        type,
        status,
        username,
        passwordmustchange,
        startdate,
        enddate,
      } = data[0];
      const name = `${firstname} ${lastname}`;
      const startDateTruncated =
        typeof startdate === "string" && startdate.length
          ? startdate.substring(0, 10)
          : "";
      const endDateTruncated =
        typeof enddate === "string" && enddate.length
          ? enddate.substring(0, 10)
          : "";

      // Populate areas of page requiring the employee's full name
      document.querySelectorAll(".employeeName").forEach((item) => {
        item.innerHTML = name;
      });

      document.querySelector("[data-email]").value = email || "";

      document.querySelector("[data-email-personal]").value =
        email_personal || "";

      document.querySelector("[data-phone]").value = phone || "";

      document.querySelector("[data-smsphone]").value = smsphone || "";

      document.querySelector("[data-firstname]").value = firstname || "";

      document.querySelector("[data-lastname]").value = lastname || "";

      document
        .querySelector("[data-type]")
        .querySelector(`option[value=${type}`).selected = true;

      document
        .querySelector("[data-status]")
        .querySelector(`option[value=${status}`).selected = true;

      document.querySelector("[data-username]").value = username || "";

      document.querySelector("#passwordmustchange").checked =
        passwordmustchange == 1 ? true : false;

      document.querySelector(
        "[data-startdate]"
      ).value = startDateTruncated.length
        ? moment(startDateTruncated).format("YYYY-MM-DD")
        : null;

      document.querySelector("[data-enddate]").value = endDateTruncated.length
        ? moment(endDateTruncated).format("YYYY-MM-DD")
        : null;
    })
    .catch((error) => {
      console.error(error);
    });
}

async function onSubmit(e) {
  e.preventDefault();
  const employeeid = getId();
  const firstname = document.querySelector("#firstname").value.trim();
  const lastname = document.querySelector("#lastname").value.trim();
  const type = document.querySelector("#type").value;
  const status = document.querySelector("#status").value;
  const username = document.querySelector("#username").value.trim();
  const passwordmustchange = document.querySelector("#passwordmustchange")
    .checked
    ? 1
    : 0;
  const email = document.querySelector("#email").value.trim();
  const email_personal = document.querySelector("#email_personal").value.trim();
  const smsphone = document.querySelector("#smsphone").value.trim();
  const smsphonecountry = document.querySelector("#smsphonecountry").value;
  const phone = document.querySelector("#phone").value.trim();
  const startdate = document.querySelector("#startdate").value.trim();
  const enddate = document.querySelector("#enddate").value.trim();

  if (typeof employeeid !== "number") {
    return showError(
      "<div class='text-center'>Employee ID missing in URL</div>",
      "URL Error"
    );
  }

  if (!firstname.length) {
    return showError(
      "Please input the employee's first name.",
      "Form Incomplete"
    );
  }

  if (!lastname.length) {
    return showError(
      "Please input the employee's last name.",
      "Form Incomplete"
    );
  }

  if (!type.length) {
    return showError("Please select the employee's role.", "Form Incomplete");
  }

  if (!status.length) {
    return showError("Please select the employee's status.", "Form Incomplete");
  }

  if (!username.length) {
    return showError(
      "Please input the employee's username.",
      "Form Incomplete"
    );
  }

  if (!email.length) {
    return showError(
      "Please input the employee's e-mail address.",
      "Form Incomplete"
    );
  }

  if (!smsphone.length) {
    return showError(
      "Please input the employee's mobile phone number.",
      "Form Incomplete"
    );
  }

  const endpoint = `/api/employee/edit/${employeeid}`;
  const accessToken = await getAccessToken();

  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      employeeid: employeeid,
      firstname: firstname,
      lastname: lastname,
      type: type,
      status: status,
      username: username,
      passwordmustchange: passwordmustchange,
      email: email,
      email_personal: email_personal,
      smsphone: smsphone,
      smsphonecountry: smsphonecountry,
      phone: phone,
      startdate: startdate,
      enddate: enddate,
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
            "Your account does not have sufficient permissions to perform that action.",
            "Not Authorized",
            "danger"
          );
          window.location.href = "/";
          break;
        default:
          window.location.href = `../#${employeeid}`;
          break;
      }
    });
}

function populateSmsPhoneCountries() {
  const countriesDropdown = document.querySelector("#smsphonecountry");
  const endpoint = "/_assets/json/world-countries/data/en/countries.json";
  fetch(endpoint)
    .then((res) => res.json())
    .then((data) => {
      countriesDropdown.append(`<option value="">(Select)</option>`);
      data.forEach((item) => {
        const newOption = document.createElement("option");
        const optionText = document.createTextNode(item.name);
        newOption.appendChild(optionText);
        newOption.setAttribute("value", item.alpha2);
        if (item.alpha2 === "us") newOption.setAttribute("selected", true);
        countriesDropdown.appendChild(newOption);
      });
    })
    .catch((error) => console.error(error));
}

function attachListeners() {
  document.querySelector("#editemployee").addEventListener("submit", onSubmit);
}

function init() {
  populateBreadcrumbLink();
  populateContent();
  populateSmsPhoneCountries();
  attachListeners();
  showToasts();
}

init();
