function populate(data) {
  const joblist = document.querySelector("#employerlist");
  let html = "";
  html +=
    data.length === 1
      ? `<p class='text-center'><strong>1 employer:</strong></p>`
      : `<p class='text-center'><strong>${data.length} employers:</p>`;
  data.forEach((item) => {
    const { employerid, companyname, city, state } = item;
    html += `<a href="profile/#${employerid}" class="list-group-item list-group-item-action">${companyname}<br><small class="text-muted">${city}, ${state}</small></a>`;
  });
  html = `<div class="list-group">${html}</div>`;
  joblist.innerHTML = html;
}

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
          } else {
            populate(data.data);
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
  showToasts();
}

init();
