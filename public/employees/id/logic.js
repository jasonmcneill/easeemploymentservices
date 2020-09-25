async function showEmployee() {
  const spinner = document.querySelector("#spinner");
  const contentEl = document.querySelector("#employeescontainer");
  const employeeid = document.location.hash.split("")[1] || "";
  if (!employeeid.length) window.location.href = "/employees/";
  const accessToken = await getAccessToken();
  const endpoint = `/api/employee/${employeeid}`;

  showSpinner(contentEl, spinner);
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
      if (!data.length)
        return showError(
          `
            <p class='text-center'>There is no record corresponding to this employee ID.</p>
            <p class='text-center'><a href='../' class='alert-link'>Return to Employees list</a></p>
          `,
          "Employee Not Found"
        );
      const { firstname, lastname } = data[0];
      const name = `${firstname} ${lastname}`;
      document.querySelectorAll(".employeeName").forEach((item) => {
        item.innerHTML = name;
      });
    })
    .catch((error) => console.error(error))
    .finally(() => {
      hideSpinner(contentEl, spinner);
    });
}

function init() {
  protectRoute();
  showEmployee();
}

init();
