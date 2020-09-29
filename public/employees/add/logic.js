async function onSubmit(e) {
  e.preventDefault();
  hideAlertMessage();
  const firstname = e.target[(id = "firstname")];
  const lastname = e.target[(id = "lastname")];
  const email = e.target[(id = "email")];
  const type = e.target[(id = "type")];
  const startdate = e.target[(id = "startdate")];
  const notifyemployee = document.querySelector("#notifyEmployeeYes").checked
    ? "yes"
    : "no";

  // Clear form fields of error indicators
  document
    .querySelectorAll(".is-invalid")
    .forEach((item) => item.classList.remove("is-invalid"));

  // Validate before submit
  if (!firstname.value.trim().length) {
    firstname.classList.add("is-invalid");
    return showError(
      "<div class='text-center'>Please input the first name.</div>",
      "Form Incomplete"
    );
  }

  if (!lastname.value.trim().length) {
    lastname.classList.add("is-invalid");
    return showError(
      "<div class='text-center'>Please input the last name.</div>",
      "Form Incomplete"
    );
  }
  if (!email.value.trim().length) {
    email.classList.add("is-invalid");
    return showError(
      "<div class='text-center'>Please input the e-mail address.</div>",
      "Form Incomplete"
    );
  }
  if (!type.value.trim().length) {
    type.classList.add("is-invalid");
    return showError(
      "<div class='text-center'>Please select the role.</div>",
      "Form Incomplete"
    );
  }
  if (!startdate.value.trim().length) {
    startdate.classList.add("is-invalid");
    return showError(
      "<div class='text-center'>Please input the employment date.</div>",
      "Form Incomplete"
    );
  }

  const endpoint = "/api/employee/add";
  const content = document.querySelector("#addemployeeform");
  const spinner = document.querySelector("#spinner");
  const accessToken = await getAccessToken();

  showSpinner(content, spinner);
  fetch(endpoint, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      firstname: firstname.value.trim(),
      lastname: lastname.value.trim(),
      email: email.value.trim(),
      type: type.value,
      startdate: startdate.value.trim(),
      notifyemployee: notifyemployee,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.msg) {
        case "missing first name":
          firstname.classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please input the first name.</div>",
            "Form Incomplete"
          );
          break;
        case "missing last name":
          lastname.classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please input the last name.</div>",
            "Form Incomplete"
          );
          break;
        case "missing email":
          email.classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please input the e-mail address.</div>",
            "Form Incomplete"
          );
          break;
        case "invalid email format":
          email.classList.add("is-invalid");
          showError(
            "Please check the e-mail address for accuracy and proper formatting.",
            "Form Incomplete"
          );
          break;
        case "missing type":
          type.classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please select the role.</div>",
            "Form Incomplete"
          );
          break;
        case "missing start date":
          email.classList.add("is-invalid");
          showError(
            "<div class='text-center'>Please input the employment date.</div>",
            "Form Incomplete"
          );
          break;
        case "invalid start date format":
          startdate.classList.add("is-invalid");
          showError(
            "Please check the employment date for accuracy and proper formatting.",
            "Form Incomplete"
          );
          break;
        case "unable to check database for duplicate email":
          showError(
            "There was a technical glitch that prevented the employee from being added.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "email is already in use":
          email.classList.add("is-invalid");
          showError(
            `This e-mail address is already being used by a <a href='/employees/profile/#${data.employeeid}' class='alert-link'>registered user</a>.`,
            "E-mail In Use"
          );
          break;
        case "unable to insert record":
          showError(
            "There was a technical glitch that prevented the employee from being added.  Please wait a moment then try again.",
            "Database is Down"
          );
          break;
        case "notification e-mail could not be sent":
          showError(
            "The employee was added successfully, but a technical glitch prevented the e-mail from being sent to invite the employee to register. Please verify that your e-mail account is in good standing with your provider, SendGrid.",
            "E-mail is Down"
          );
          document.querySelector("#addemployeeform").reset();
          break;
        case "employee added":
          document.querySelector("#addemployeeform").reset();
          showSuccess(
            "<div class='text-center'>The employee was added successfully.</div>",
            "Employee Added"
          );
          break;
        case "notification e-mail sent":
          document.querySelector("#addemployeeform").reset();
          showSuccess(
            "The employee was added successfully, and has been e-mailed an invitation to register.",
            "Employee Added"
          );
          break;
        default:
          showError(
            "There was a technical glitch that prevented the employee from being added.  Please wait a moment then try again.",
            "Employee Not Added"
          );
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      hideSpinner(content, spinner);
    });
}

function attachListeners() {
  document
    .querySelector("#addemployeeform")
    .addEventListener("submit", onSubmit);
}

function init() {
  protectRoute();
  attachListeners();
}

init();
