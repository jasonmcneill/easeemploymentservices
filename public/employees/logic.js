async function listEmployees() {
  const content = await getContent();
  populateContent(content);
}

async function getContent() {
  const spinner = document.querySelector("#spinner");
  const content = document.querySelector("#employeelist");
  const accessToken = await getAccessToken();
  const endpoint = "/api/employee/employees-list";

  showSpinner(content, spinner);
  fetch(endpoint, {
    method: "GET",
    mode: "cors",
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

      populateContent(data);
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
      hideSpinner(content, spinner);
    });
}

function populateContent(data) {
  if (Array.isArray(data)) {
    const el = document.querySelector("#employeelist");
    let employees = document.createElement("div");
    data.forEach((item) => {
      const { firstname, lastname, status } = item;
      let employee = "";

      if (status !== "pending") {
        employee = `
          <a href="profile/#${item.employeeid}" class="list-group-item list-group-item-action">
            ${firstname} ${lastname}
          </a>
        `;
      } else {
        employee = `
          <a href="profile/#${item.employeeid}" class="list-group-item list-group-item-action list-group-item-secondary">
            ${firstname} ${lastname}
            <span class="badge badge-pill badge-secondary ml-2 float-right">
              unregistered
            </span>
          </a>
        `;
      }

      employees.innerHTML += employee;
    });
    if (el.innerHTML !== employees.innerHTML) {
      el.innerHTML = employees.innerHTML;
    }
  }
}

function init() {
  checkIfOffline();
  listEmployees();
  showToasts();
}

init();
