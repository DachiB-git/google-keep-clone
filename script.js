const form = document.querySelector(".note-form");
const modal = document.querySelector(".modal");
const titleInput = document.querySelector("#note-title-input");
const bodyInput = document.querySelector("#note-body-input");
let notes = JSON.parse(localStorage.getItem("notes")) || [];
document.addEventListener("submit", (e) => {
  e.preventDefault();
  closeForm();
});
function submit(titleData, bodyData) {
  addNote(titleData, bodyData);
  form.reset();
}
form.addEventListener("keydown", (e) => {
  if (e.key === "Enter") e.preventDefault();
});
window.addEventListener("keydown", (e) => {
  if (document.activeElement === titleInput && e.key === "Enter") {
    bodyInput.focus();
  } else if (document.activeElement === bodyInput && e.key === "Enter") {
    bodyInput.rows++;
    bodyInput.value += "\n";
  } else if (document.activeElement === bodyInput && e.key === "Backspace") {
    const lastLineBreak = bodyInput.value.match(/\n$/)
      ? bodyInput.value.match(/\n$/)[0]
      : "";
    if (bodyInput.value[bodyInput.selectionEnd - 1] === lastLineBreak)
      bodyInput.rows--;
  } else if (
    document.activeElement === document.querySelector("#note-title") &&
    e.key === "Enter"
  ) {
    document.querySelector("#note-body").focus();
  } else if (
    document.activeElement === document.querySelector("#note-body") &&
    e.key === "Enter"
  ) {
    document.querySelector("#note-body").rows++;
  } else if (
    document.activeElement === document.querySelector("#note-body") &&
    e.key === "Backspace"
  ) {
    const lastLineBreak = document
      .querySelector("#note-body")
      .value.match(/\n$/)
      ? document.querySelector("#note-body").value.match(/\n$/)[0]
      : "";
    if (
      document.querySelector("#note-body").value[
        document.querySelector("#note-body").selectionEnd - 1
      ] === lastLineBreak
    )
      document.querySelector("#note-body").rows--;
  }
});
window.addEventListener("click", (e) => {
  if (e.target === form || e.target.parentNode === form) {
    expandForm();
  } else {
    closeForm();
    handleNoteClick(e);
  }
});
function handleNoteClick(e) {
  if (e.target.id === "modal") closeNote();
  if (e.target.className === "note" && !modal.className.includes("shown"))
    openNote(e.target);
}
function expandForm() {
  titleInput.style.display = "block";
  document.querySelector(".form-submit-btn").style.display = "block";
}
function closeForm() {
  const titleData = titleInput.value;
  const bodyData = bodyInput.value;
  (titleData || bodyData) && submit(titleData, [bodyData, bodyInput.rows]);
  titleInput.style.display = "none";
  bodyInput.rows = "1";
  document.querySelector(".form-submit-btn").style.display = "none";
}
function addNote(title, body) {
  const id = Math.random();
  notes.unshift({ id, title, body: [...body] });
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
}
function removeNote(id) {
  notes.splice(
    notes.findIndex((item) => item.id === id),
    1
  );
  localStorage.setItem("notes", JSON.stringify(notes));
  if (modal.className.includes("shown")) {
    closeNote(1);
    return;
  }
  renderNotes();
}
function renderNotes() {
  document.getElementById("empty-placeholder").style.display =
    notes.length > 0 ? "none" : "block";
  document.querySelector(".notes").innerHTML = notes
    .map(
      ({ id, title, body }) =>
        `<div data-placeholder="${id}" class="note-placeholder ${
          body[1] > 10 ? "big" : body[1] > 3 ? "medium" : ""
        }">
        <div class="note" data-id="${id}">
          <input type="text" style="${
            !title && "display: none"
          }" class="note-title" id="note-title" placeholder="Title" autocomplete="off" value=\"${title}\">
          <textarea style="${
            !body && "display: none"
          }" class="note-body" id="note-body" placeholder="Note" autocomplete="off" rows="${
          body[1]
        }">${body[0]}</textarea>
          <button class="remove-note-btn" onclick="removeNote(${id})">Remove</button>
      </div>
    </div>`
    )
    .join("");
}
function openNote(target) {
  window.addEventListener("resize", updateCenterPos);
  const note = document.querySelector(`div[data-id="${target.dataset.id}"]`);
  // make note items visible
  Array.from(note.children).forEach((item) => {
    item.style.display = "block";
    item.style.pointerEvents = "auto";
  });
  note.children[1].classList.toggle("selected");
  const rect = note.getBoundingClientRect();
  note.style.cursor = "default";
  note.style.height = `${note.offsetHeight}px`;
  modal.append(note);
  note.style.position = "relative";
  note.style.boxShadow = "0 0 10px black";
  note.style.top = `${rect.top}px`;
  note.style.left = `${rect.left}px`;
  note.style.width = `${note.offsetWidth * 2}px`;
  note.style.height = `${note.offsetHeight * 2}px`;
  note.style.top = `${modal.clientHeight / 4 - note.offsetHeight / 2}px`;
  note.style.left = `${modal.clientWidth / 2 - note.offsetWidth}px`;
  note.style.backgroundColor = "#202124";
  modal.classList.toggle("shown");
  function updateCenterPos() {
    note.style.left = `${modal.clientWidth / 2 - note.offsetWidth / 2}px`;
    note.style.top = `${modal.clientHeight / 4 - note.offsetHeight / 4}px`;
  }
}
function closeNote(...flag) {
  const note = document.querySelector(
    `div[data-id="${modal.firstChild.dataset.id}"]`
  );

  const placeholder = document.querySelector(
    `div[data-placeholder="${modal.firstChild.dataset.id}"]`
  );
  Array.from(note.children)
    .filter((item) => !item.value)
    .forEach((item) => (item.style.display = "none"));
  Array.from(note.children).forEach(
    (item) => (item.style.pointerEvents = "none")
  );

  modal.classList.toggle("shown");
  note.style.top = `${note.offsetTop + window.scrollY}px`;
  note.style.left = `${note.offsetLeft}px`;
  placeholder.append(note);
  note.style.position = "absolute";
  note.style.top = `${placeholder.offsetTop}px`;
  note.style.left = `${placeholder.offsetLeft}px`;
  note.style.width = `${note.offsetWidth / 2}px`;
  note.style.height = `${note.offsetHeight / 2}px`;

  note.addEventListener("transitionend", closeTransitionEnd);
  function closeTransitionEnd() {
    note.style = "";
    notes = notes.map((item) =>
      item.id == note.dataset.id
        ? {
            ...item,
            title: note.children[0].value,
            body: [note.children[1].value, note.children[1].rows],
          }
        : item
    );
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();
    if (flag.length > 0) renderNotes();
    note.removeEventListener("transitionend", closeTransitionEnd);
  }
}
renderNotes();
