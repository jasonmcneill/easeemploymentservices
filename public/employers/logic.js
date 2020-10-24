async function getEmployerList() {
  const employerlist = document.querySelector("#employerlist");
  const accessToken = await getAccessToken();
  const endpoint = "/api/employer-list";
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
          window.location.href = "/";
          break;
        case "unable to query for employers":
          showError(
            "There was a technical glitch preventing employers from being displayed.  Please wait a moment, then reload the page.",
            "Database is Down"
          );
          break;
        case "employers retrieved":
          if (!data.data.length) {
            employerlist.innerHTML =
              "<div class='text-center'>There are no employers in the system.</div>";
            break;
          }
          break;
      }
    })
    .catch((err) => {
      console.error(err);
      hideSpinner(content, spinner);
    });
}

function init() {
  getEmployerList();
}

init();
