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

    // Community Posting System
    const postBtn = document.querySelector("#post-btn");
    const postContent = document.querySelector("#post-content");
    const postsList = document.querySelector("#posts-list");

    let posts = JSON.parse(localStorage.getItem("communityPosts")) || [];

    // Save new post
    postBtn.addEventListener("click", () => {
        const content = postContent.value.trim();
        if (content) {
            const post = {
                content,
                date: new Date().toLocaleString(),
                comments: [],
                showComments: false  // Track whether comments should be shown
            };
            posts.unshift(post);
            saveAndRenderPosts();
            postContent.value = "";
        } else {
            alert("Please enter a message before posting.");
        }
    });

    // Save to Local Storage and Render Posts
    function saveAndRenderPosts() {
        localStorage.setItem("communityPosts", JSON.stringify(posts));
        renderPosts();
    }

    // Render Posts
    function renderPosts() {
        postsList.innerHTML = "";
        posts.forEach((post, postIndex) => {
            const li = document.createElement("li");
            li.classList.add("post-card");
            li.innerHTML = `
                <div class="post-header">
                    <span class="post-date">${post.date}</span>
                    <button class="delete-post" onclick="deletePost(${postIndex})">🗑️ Delete Post</button>
                </div>
                <p class="post-content">${post.content}</p>
                <button class="toggle-comments" onclick="toggleComments(${postIndex})">
                    ${post.showComments ? "Hide Comments" : "View Comments"}
                </button>
                <div class="comment-section" id="comment-section-${postIndex}" style="display: ${post.showComments ? "block" : "none"};">
                    <input type="text" class="comment-input" placeholder="Add a comment..." id="comment-${postIndex}">
                    <button class="comment-btn" onclick="addComment(${postIndex})">Comment</button>
                    <ul class="comment-list" id="comment-list-${postIndex}">
                        ${post.comments
                            .map((comment, commentIndex) => `
                                <li class="comment">
                                    ${comment}
                                    <button class="delete-comment" onclick="deleteComment(${postIndex}, ${commentIndex})">🗑️ Delete</button>
                                </li>
                            `)
                            .join("")}
                    </ul>
                </div>
            `;
            postsList.appendChild(li);
        });
    }

    // Toggle Comments Section
    window.toggleComments = function (postIndex) {
        posts[postIndex].showComments = !posts[postIndex].showComments;
        saveAndRenderPosts();
    };

    // Add Comment to Post
    window.addComment = function (postIndex) {
        const commentInput = document.querySelector(`#comment-${postIndex}`);
        const commentText = commentInput.value.trim();
        if (commentText) {
            posts[postIndex].comments.push(commentText);
            saveAndRenderPosts();
            commentInput.value = "";
        }
    };

    // Delete Comment
    window.deleteComment = function (postIndex, commentIndex) {
        posts[postIndex].comments.splice(commentIndex, 1);
        saveAndRenderPosts();
    };

    // Delete Post
    window.deletePost = function (postIndex) {
        posts.splice(postIndex, 1);
        saveAndRenderPosts();
    };

    // Auto-load saved posts on page load
    saveAndRenderPosts();
});
