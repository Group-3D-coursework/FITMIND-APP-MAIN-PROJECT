document.addEventListener("DOMContentLoaded", function () {
    // Sidebar Menu Toggle
    const menuBtn = document.querySelector("#menu-icon");
    const menuBox = document.querySelector("#menu-box");
    const body = document.querySelector("body");

    menuBtn.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevents immediate closure when clicking menu icon
        menuBox.classList.toggle("active");
    });

    // Click anywhere outside to close menu
    document.addEventListener("click", function (event) {
        if (!menuBox.contains(event.target) && !menuBtn.contains(event.target)) {
            menuBox.classList.remove("active");
        }
    });

    // Exercise Form Elements
    const form = document.querySelector("#exercise-form");
    const exerciseTypeSelect = document.querySelector("#exercise-type");
    const customInput = document.querySelector("#custom-exercise");
    const exerciseList = document.querySelector("#exercise-list");
    const durationInput = document.querySelector("#duration");
    const ctx = document.querySelector("#progress-chart").getContext("2d");
    const suggestionsList = document.querySelector("#suggestions-list");

    let exerciseData = JSON.parse(localStorage.getItem("exercises")) || [];
    let progressChart;

    // Show custom exercise input field if "Custom" is selected
    exerciseTypeSelect.addEventListener("change", () => {
        customInput.style.display = exerciseTypeSelect.value === "Custom" ? "block" : "none";
    });

    // Form Submission: Log Exercise
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const type = exerciseTypeSelect.value === "Custom" ? customInput.value.trim() : exerciseTypeSelect.value;
        const duration = parseInt(durationInput.value);

        if (!type || duration <= 0) {
            alert("Please enter a valid exercise and duration.");
            return;
        }

        exerciseData.push({ type, duration, date: new Date().toLocaleDateString() });
        saveAndRender();
        updateSuggestions(type);
        form.reset();
        customInput.style.display = "none";
    });

    // Save & Render Data
    function saveAndRender() {
        localStorage.setItem("exercises", JSON.stringify(exerciseData));
        renderExerciseLog();
        updateChart();
    }

    // Render Exercise Log
    function renderExerciseLog() {
        exerciseList.innerHTML = "";
        exerciseData.forEach((exercise, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${exercise.date} - ${exercise.type} - ${exercise.duration} mins 
                <button class="remove-btn" onclick="removeExercise(${index})">🗑️ Delete</button>
            `;
            exerciseList.appendChild(li);
        });
    }

    // Remove Exercise
    window.removeExercise = (index) => {
        exerciseData.splice(index, 1);
        saveAndRender();
    };

    // Update Chart.js Graph
    function updateChart() {
        if (progressChart) progressChart.destroy();

        const labels = exerciseData.map(e => `${e.date} (${e.type})`);
        const durations = exerciseData.map(e => e.duration);

        progressChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Duration (mins)",
                    data: durations,
                    backgroundColor: "#00bfa5",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // Generate Personalized Recommendations
    function updateSuggestions(type) {
        suggestionsList.innerHTML = "";

        const suggestions = {
            Cardio: ["Stay hydrated!", "Mix cardio with strength training for balance."],
            Stretching: ["Stretch daily to improve flexibility.", "Hold each stretch for 30 seconds."],
            Strength: ["Focus on form, not weight.", "Take rest days to recover."],
            Recreational: ["Join a group for fun!", "Track your distance if running."],
            Yoga: ["Focus on your breathing.", "Morning yoga is energizing."],
            HIIT: ["Alternate high and low intensity.", "Don't skip your warm-up."],
            Pilates: ["Engage your core.", "Controlled movements improve results."]
        };

        if (suggestions[type]) {
            suggestions[type].forEach(suggestion => {
                const li = document.createElement("li");
                li.textContent = suggestion;
                suggestionsList.appendChild(li);
            });
        } else {
            const customSuggestions = [
                `Great choice with "${type}"! Keep it fun.`,
                `Track your progress with "${type}" to stay motivated.`,
                `Pair "${type}" with relaxation exercises for balance.`
            ];
            customSuggestions.forEach(suggestion => {
                const li = document.createElement("li");
                li.textContent = suggestion;
                suggestionsList.appendChild(li);
            });
        }
    }

    // Load Existing Data on Page Load
    saveAndRender();
});
