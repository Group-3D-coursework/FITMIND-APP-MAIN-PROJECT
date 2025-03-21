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

    // Form Elements
    const form = document.querySelector("#stress-form");
    const stressList = document.querySelector("#stress-list");
    const relaxationList = document.querySelector("#relaxation-list");

    let stressData = JSON.parse(localStorage.getItem("stress")) || [];

    // Form Submission: Log Stress
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const level = document.querySelector("input[name='stress-level']:checked")?.value;
        const cause = document.querySelector("#stress-cause").value.trim();
        const notes = document.querySelector("#additional-notes").value.trim();

        if (!level) {
            alert("Please select a stress level.");
            return;
        }

        const newEntry = {
            date: new Date().toLocaleString(),
            level: parseInt(level),
            cause: cause || "Not specified",
            notes: notes || "No additional notes"
        };

        stressData.push(newEntry);
        saveAndRender();
        updateRelaxationSuggestions(newEntry.level);
        form.reset();
    });

    // Save & Render Data
    function saveAndRender() {
        localStorage.setItem("stress", JSON.stringify(stressData));
        renderStressLog();
    }

    // Render Stress Log
    function renderStressLog() {
        stressList.innerHTML = "";
        stressData.forEach((entry, index) => {
            const li = document.createElement("li");
            li.classList.add("stress-entry");
            li.innerHTML = `
                <div class="entry-text">
                    ${entry.date} - Level ${entry.level} - ${entry.cause}
                    <p class="notes">Notes: ${entry.notes}</p>
                </div>
                <button class="remove-btn" onclick="removeStressEntry(${index})">🗑️ Delete</button>
            `;
            stressList.appendChild(li);
        });
    }

    // Remove Stress Entry
    window.removeStressEntry = function (index) {
        stressData.splice(index, 1);
        saveAndRender();
    };

    // Generate Personalized Relaxation Recommendations
    function updateRelaxationSuggestions(level) {
        relaxationList.innerHTML = "";
        const suggestions = {
            1: ["Keep up the great mood! Consider light stretching or a walk."],
            2: ["Try deep breathing for 5 minutes.", "Go for a short walk outside."],
            3: ["Take a break from screens.", "Do a 10-minute meditation."],
            4: ["Listen to calming music.", "Do a relaxing yoga session."],
            5: ["Try journaling to express emotions.", "Reach out to someone for support."]
        };

        if (suggestions[level]) {
            suggestions[level].forEach(suggestion => {
                const li = document.createElement("li");
                li.textContent = suggestion;
                relaxationList.appendChild(li);
            });
        }
    }

    // Load Existing Data on Page Load
    saveAndRender();
});
