function listEmployees() {
  const endpoint = "/api/employee/employees-list";

  function populateContent(data) {
    if (Array.isArray(data)) {
      const el = document.querySelector("#employeelist");
      let employees = document.createElement("div");
      data.forEach((item) => {
        const employee = document.createElement("a");
        const { firstname, lastname } = item;
        employee.setAttribute(
          "class",
          "list-group-item list-group-item-action"
        );
        employee.setAttribute("href", `profile/#${item.employeeid}`);
        const content = document.createTextNode(`${firstname} ${lastname}`);
        employee.appendChild(content);
        employees.appendChild(employee);
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
    .catch((error) => {
      console.error(error);
      window.location.href = "/logout/";
    });
}

function init() {
  protectRoute();
  listEmployees();
}

init();
