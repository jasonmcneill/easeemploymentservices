function populateClockTime() {
  const clockTime = document.querySelector("#clocktime");
  const clockDate = document.querySelector("#clockdate");

  setInterval(() => {
    const dateObj = new Date();
    const currentDate = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const currentTime = dateObj.toLocaleTimeString();
    clockDate.innerHTML = `${currentDate}`;
    clockTime.innerHTML = `<h3 class="h3">${currentTime}</h3>`;
  }, 1000);
}

function onClockInClicked() {}

function onClockOutClicked() {}

function onDoneForTheDayClicked(e) {
  const clockIn = document.querySelector("#btnClockIn");
  const clockOut = document.querySelector("#btnClockOut");
  const doneForTheDayContainer = document.querySelector(
    "#doneForTheDayContainer"
  );
  const checked = e.target.checked || false;

  if (checked) {
    clockIn.classList.add("d-none");
    clockOut.classList.add("d-none");
    doneForTheDayContainer.classList.add("d-none");
  }
}

function attachListeners() {
  document
    .querySelector("#btnClockIn")
    .addEventListener("click", onClockInClicked);

  document
    .querySelector("#btnClockOut")
    .addEventListener("click", onClockOutClicked);

  document
    .querySelector("#doneForTheDay")
    .addEventListener("click", onDoneForTheDayClicked);
}

function init() {
  protectRoute();
  attachListeners();
  showToasts();
  populateClockTime();
}

init();
