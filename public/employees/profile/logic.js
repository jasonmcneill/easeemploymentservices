function showEmployee() {
  const spinner = document.querySelector("#spinner");
  const contentEl = document.querySelector("#employeescontainer");
  const employeeid = document.location.hash.split("")[1] || "";
  if (!employeeid.length) window.location.href = "/employees/";
  const endpoint = `/api/employee/${employeeid}`;

  function populateContent(data) {
    if (!data.length) {
      return showError(
        `
        <p class='text-center'>There is no record corresponding to this employee ID.</p>
        <p class='text-center'><a href='../' class='alert-link'>Return to Employees list</a></p>
      `,
        "Employee Not Found"
      );
    }
    const {
      firstname,
      lastname,
      type,
      status,
      phone,
      smsphone,
      email,
      email_personal,
    } = data[0];
    const phoneNums = new String(phone).replace(/\D/g, "");
    const smsphoneNums = new String(smsphone).replace(/\D/g, "");
    const name = `${firstname} ${lastname}`;
    document.querySelectorAll(".employeeName").forEach((item) => {
      item.innerHTML = name;
    });
    render("type", type, `${type}`);
    render(
      "phone",
      phone,
      `
        ${phone}
        <p class="mt-2 mb-0">
          <a href="tel:${phoneNums}">Call</a>
        </p>
      `
    );
    render(
      "smsphone",
      smsphone,
      `
        ${smsphone}
        <p class="mt-2 mb-0">
          <a href="tel:${smsphoneNums}">Call</a> <span class="mx-3">|</span> <a href="sms:${smsphoneNums}">Text</a>
        </p>
      `
    );
    render("email", email, `<a href="mailto:${email}">${email}</a>`);
    render(
      "email-personal",
      email_personal,
      `<a href="mailto:${email_personal}">${email_personal}</a>`
    );
    render("status", status, `${status}`);
  }

  async function getContent() {
    const accessToken = await getAccessToken();
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
        localforage.setItem(endpoint, data).then(() => populateContent(data));
      })
      .catch((error) => {
        console.error(error);
        if (!navigator.onLine) {
          return showError(
            "You appear to be offline. Please connect to the internet, then reload the page.",
            "No Connection"
          );
        }
      })
      .finally(() => {
        hideSpinner(contentEl, spinner);
      });
  }

  showSpinner(contentEl, spinner);
  localforage
    .getItem(endpoint)
    .then((data) => {
      if (data && data.length) {
        populateContent(data);
      }
    })
    .then(() => {
      getContent();
    })
    .catch((error) => console.error(error))
    .finally(() => {
      hideSpinner(contentEl, spinner);
    });
}

function attachListeners() {
  const employeeid = document.location.hash.split("")[1] || "";

  // Edit button
  document.querySelector("#btnEdit").addEventListener("click", () => {
    const destination = `edit/#${employeeid}`;
    location.href = destination;
  });
}

function init() {
  protectRoute();
  showEmployee();
  attachListeners();
}

init();
