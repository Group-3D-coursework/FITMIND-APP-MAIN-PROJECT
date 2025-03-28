// Function to show the modal with team member details
function showModal(member) {
    const modal = document.getElementById('teamModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    
    if (member === 'Augustine') {
        modalTitle.textContent = ' up2158902';
        modalDescription.textContent = 'Augustine is the CEO and the visionary behind our company. He has a passion for technology and leadership, and he loves driving innovation.';
    } else if (member === 'Riddhi') {
        modalTitle.textContent = 'up2235740';
        modalDescription.textContent = 'Rhiddi is our CEO, an expert in software engineering and a strategic thinker. She leads our development team with excellence.';
    } else if (member === 'Osarigbi') {
        modalTitle.textContent = 'up2216448';
        modalDescription.textContent = 'Osarigbi is our CEO. He has a keen eye for detail and creates seamless, intuitive user interfaces that enhance the user experience.';
    } else if (member === 'Godfrey') {
        modalTitle.textContent = 'up2053904';
        modalDescription.textContent = 'Godfrey is our CEO. Experienced CEO focused on leading the company to new heights of success.';
    } else if (member === 'Danever') {
        modalTitle.textContent = 'up2216448';
        modalDescription.textContent = 'Danever is our CEO. With a forward-thinking approach, our CEO leads with integrity, determination, and an unwavering commitment to our mission.';
    } else if (member === 'Samuel') {
        modalTitle.textContent = 'up2206078';
        modalDescription.textContent = 'Samuel is our CEO. An inspiring and hands-on leader, dedicated to shaping a legacy of success and delivering exceptional results.';
    }  else if (member === 'Luis') {
        modalTitle.textContent = 'up2208013';
        modalDescription.textContent = 'Luis is our CEO. An inspiring and hands-on leader, dedicated to shaping a legacy of success and delivering exceptional results.';
    }



    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('teamModal');
    modal.style.display = 'none';
}

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = function(event) {
    const modal = document.getElementById('teamModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
