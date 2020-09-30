function listEmployees() {
  const endpoint = "/api/employee/employees-list";

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
            <a href="profile/#${item.employeeid}" class="list-group-item list-group-item-action list-group-item-dark">
              ${firstname} ${lastname}
              <span class="badge badge-dark badge-pill ml-2">
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

  async function getContent() {
    const spinner = document.querySelector("#spinner");
    const content = document.querySelector("#employeelist");
    const accessToken = await getAccessToken();

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
        hideSpinner(content, spinner);
      });
  }

  const spinner = document.querySelector("#spinner");
  const content = document.querySelector("#employeelist");
  localforage
    .getItem(endpoint)
    .then((data) => {
      if (data && data.length) {
        populateContent(data);
      } else {
        showSpinner(content, spinner);
      }
    })
    .then(() => {
      getContent();
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      hideSpinner(content, spinner);
    });
}

function init() {
  protectRoute();
  listEmployees();
}

init();
