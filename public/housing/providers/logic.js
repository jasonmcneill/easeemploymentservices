function populate(data) {
  const housinglist = document.querySelector("#providerlist");
  let html = "";
  html +=
    data.length === 1
      ? `<p class='text-center'><strong>1 provider:</strong></p>`
      : `<p class='text-center'><strong>${data.length} providers:</p>`;
  data.forEach((item) => {
    const { providerid, companyname, city, state } = item;
    html += `<a href="profile/#${providerid}" class="list-group-item list-group-item-action">${companyname}<br><small class="text-muted">${city}, ${state}</small></a>`;
  });
  html = `<div class="list-group">${html}</div>`;
  housinglist.innerHTML = html;
}

async function getProviderList() {
  const providerlist = document.querySelector("#providerlist");
  const accessToken = await getAccessToken();
  const endpoint = "/api/provider-list";
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
        case "unable to query for providers":
          showError(
            "There was a technical glitch preventing housing providers from being displayed.  Please wait a moment, then reload the page.",
            "Database is Down"
          );
          break;
        case "providers retrieved":
          if (!data.data.length) {
            providerlist.innerHTML =
              "<div class='text-center'>There are no providers in the system.</div>";
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
  getProviderList();
  showToasts();
}

init();
