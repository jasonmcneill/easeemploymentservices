function showParticipantsChart() {
  const chartParticipants = document.getElementById("chartParticipants");
}

function populateClockTime() {
  const clockTime = document.querySelector("#clocktime");

  setInterval(() => {
    const currentTime = new Date().toLocaleTimeString();
    clockTime.textContent = currentTime;
  }, 1000);
}

function init() {
  protectRoute();
  // showParticipantsChart();
  showToasts();
  populateClockTime();
}

init();
