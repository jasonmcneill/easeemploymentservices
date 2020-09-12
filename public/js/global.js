function showSpinner(elementToToggle, spinnerElement) {
  elementToToggle.classList.add("d-none");
  console.log("spinner activated", elementToToggle);
}

function hideSpinner(elementToToggle, spinnerElement) {
  elementToToggle.classList.remove("d-none");
  console.log("spinner deactivated", elementToToggle);
}

function clearAlertMessageContent() {
  const messageElement = document.querySelector("#alertMessage");
  const messageContent = messageElement.querySelector("[data-alert-content]");
  const classesToRemove = [
    "alert-primary",
    "alert-secondary",
    "alert-success",
    "alert-danger",
    "alert-warning",
    "alert-info",
    "alert-light",
    "alert-dark",
  ];
  classesToRemove.forEach((item) => messageContent.classList.remove(item));
  messageContent.innerText = "";
}

function showError(message) {
  const messageElement = document.querySelector("#alertMessage");
  const messageContent = messageElement.querySelector("[data-alert-content]");

  clearAlertMessageContent(messageElement);
  messageContent.classList.add("alert-danger");
  messageContent.innerText = message || "";
  messageElement.classList.remove("d-none");
  messageElement.scrollIntoView();
}

function hideAlertMessage() {
  const messageElement = document.querySelector("#alertMessage");
  messageElement.classList.remove("d-none");
}
