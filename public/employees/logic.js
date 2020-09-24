function listEmployees() {
  const spinner = document.querySelector("#spinner");
  const content = document.querySelector("#employeescontainer");
  const endpoint = "/api/employee/employees-list";

  showSpinner(content, spinner);
  fetch(endpoint)
    .then((res) => res.json())
    .then((data) => {
      data.forEach((item) => {
        const el = document.querySelector("#employeelist");
        const employee = document.createElement("a");
        const { firstname, lastname } = item;
        employee.setAttribute(
          "class",
          "list-group-item list-group-item-action"
        );
        employee.setAttribute("href", `id/#${item.employeeid}`);
        const content = document.createTextNode(`${firstname} ${lastname}`);
        employee.appendChild(content);
        el.appendChild(employee);
      });
    })
    .catch((error) => console.error(error))
    .finally(() => hideSpinner(content, spinner));
}

function init() {
  listEmployees();
}

init();