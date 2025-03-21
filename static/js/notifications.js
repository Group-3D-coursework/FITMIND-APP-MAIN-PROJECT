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

    const addNotificationBtn = document.querySelector("#add-notification");
    const activityInput = document.querySelector("#activity-input");
    const activityTime = document.querySelector("#activity-time");
    const notificationList = document.querySelector("#notification-list");

    let notifications = JSON.parse(localStorage.getItem("userNotifications")) || [];

    // Add New Notification
    addNotificationBtn.addEventListener("click", () => {
        const activity = activityInput.value.trim();
        const time = activityTime.value;

        if (activity && time) {
            notifications.push({ activity, time, notified: false });
            localStorage.setItem("userNotifications", JSON.stringify(notifications));
            renderNotifications();
            activityInput.value = "";
            activityTime.value = "";
        } else {
            alert("Please enter an activity and select a time.");
        }
    });

    // Render Notifications
    function renderNotifications() {
        notificationList.innerHTML = "";
        notifications.forEach((notification, index) => {
            notificationList.innerHTML += `
                <li>${notification.activity} - ${formatTime(notification.time)}
                    <button class="delete-btn" onclick="deleteNotification(${index})">🗑️ Delete</button>
                </li>
            `;
        });
    }

    // Delete Notification
    window.deleteNotification = function (index) {
        notifications.splice(index, 1);
        localStorage.setItem("userNotifications", JSON.stringify(notifications));
        renderNotifications();
    };

    // Format Time for Display
    function formatTime(time) {
        const [hours, minutes] = time.split(":");
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
    }

    // Check for Notifications Every Minute
    function checkNotifications() {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        notifications.forEach((notification, index) => {
            if (notification.time === currentTime && !notification.notified) {
                showNotification(notification.activity);
                notifications[index].notified = true; // Mark as notified
                localStorage.setItem("userNotifications", JSON.stringify(notifications));
            }
        });
    }

    // Show Notification
    function showNotification(activity) {
        // Display pop-up alert
        alert(`Reminder: Time for "${activity}"!`);

        // Optional: Use browser notification API
        if (Notification.permission === "granted") {
            new Notification("FitMind Reminder", {
                body: `Time for "${activity}"!`,
                icon: "images/notification.png"
            });
        }
    }

    // Request Notification Permission
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Run Notification Check Every Minute
    setInterval(checkNotifications, 60000);

    // Initial Load
    renderNotifications();
});
