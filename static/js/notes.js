document.addEventListener("DOMContentLoaded", function () {
    // Sidebar Menu Toggle
    const menuBtn = document.querySelector("#menu-icon");
    const menuBox = document.querySelector("#menu-box");

    menuBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        menuBox.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
        if (!menuBox.contains(event.target) && !menuBtn.contains(event.target)) {
            menuBox.classList.remove("active");
        }
    });

    // Note Taking System
    const saveNoteBtn = document.querySelector("#save-note-btn");
    const noteTitle = document.querySelector("#note-title");
    const noteContent = document.querySelector("#note-content");
    const notesList = document.querySelector("#notes-list");
    const searchNotes = document.querySelector("#search-notes");
    const searchBtn = document.querySelector("#search-btn");
    const showAllBtn = document.querySelector("#show-all-btn");

    let notes = JSON.parse(localStorage.getItem("fitmindNotes")) || [];

    // Save New Note
    saveNoteBtn.addEventListener("click", () => {
        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();

        if (title && content) {
            const note = { 
                title, 
                content, 
                date: new Date().toLocaleString() 
            };

            notes.unshift(note);
            saveAndRenderNotes();
            noteTitle.value = "";
            noteContent.value = "";
        } else {
            alert("Please enter a note title and content.");
        }
    });

    // Save to Local Storage and Render Notes
    function saveAndRenderNotes() {
        localStorage.setItem("fitmindNotes", JSON.stringify(notes));
        renderNotes();
    }

    // Render Notes
    function renderNotes(filteredNotes = notes) {
        notesList.innerHTML = "";
        filteredNotes.forEach((note, index) => {
            const li = document.createElement("li");
            li.classList.add("note-card");
            li.innerHTML = `
                <div class="note-header">
                    <strong>${note.title}</strong>
                    <span class="note-date">${note.date}</span>
                </div>
                <div class="note-content">${note.content}</div>
                <button class="delete-note" onclick="deleteNote(${index})">🗑️ Delete</button>
            `;
            notesList.appendChild(li);
        });
    }

    // Delete Note
    window.deleteNote = function (index) {
        notes.splice(index, 1);
        saveAndRenderNotes();
    };

    // Search Notes
    searchBtn.addEventListener("click", () => {
        const query = searchNotes.value.toLowerCase();
        const filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(query) || 
            note.content.toLowerCase().includes(query)
        );
        renderNotes(filteredNotes);
    });

    // Show All Notes Button
    showAllBtn.addEventListener("click", () => {
        searchNotes.value = ""; // Clear search input
        renderNotes(notes); // Display all notes again
    });

    // Auto-load saved notes on page load
    saveAndRenderNotes();
});
