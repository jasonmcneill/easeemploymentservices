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
    const { firstname, lastname } = data[0];
    const name = `${firstname} ${lastname}`;
    document.querySelectorAll(".employeeName").forEach((item) => {
      item.innerHTML = name;
    });
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

function init() {
  protectRoute();
  showEmployee();
}

init();
