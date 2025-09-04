document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    
    const departmentSelect = document.getElementById('department-select');
    const eventSelect = document.getElementById('event-select');
    const pointUpdateForm = document.getElementById('point-update-form');

    // Fetch initial data to populate dropdowns
    try {
        const response = await fetch('/api/data');
        const { departments, events } = await response.json();
        
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.name.toLowerCase();
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
        });

        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.name.toLowerCase();
            option.textContent = event.name;
            eventSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Failed to load initial data", error);
        showToast("Error loading departments/events", 'error');
    }

    // Manual form submission
    pointUpdateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const department = departmentSelect.value;
        const event = eventSelect.value;
        const points = parseInt(document.getElementById('points-input').value, 10);

        if (isNaN(points)) {
            showToast('Please enter a valid number for points.', 'error');
            return;
        }
        
        await updatePointsInBackend(department, points, event);
        pointUpdateForm.reset();
    });

    // Voice command setup
    const voiceCommandBtn = document.getElementById('voice-command-btn');
    const voiceStatus = document.getElementById('voice-status');
    const micIcon = document.getElementById('mic-icon');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        voiceCommandBtn.addEventListener('click', () => recognition.start());

        recognition.onstart = () => {
            voiceStatus.textContent = 'Listening...';
            voiceStatus.classList.add('text-accent');
            micIcon.classList.add('text-accent');
            voiceCommandBtn.classList.add('is-listening');
        };

        recognition.onend = () => {
            voiceStatus.innerHTML = 'Click the mic and say a command. <br> e.g., "Add 10 points to CSE"';
            voiceStatus.classList.remove('text-accent');
            micIcon.classList.remove('text-accent');
            voiceCommandBtn.classList.remove('is-listening');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            voiceStatus.textContent = `Command recognized: "${transcript}"`;
            parseAndExecuteCommand(transcript);
        };

        recognition.onerror = (event) => {
            showToast(`Voice recognition error: ${event.error}`, 'error');
        };

    } else {
        voiceStatus.textContent = "Speech recognition not supported.";
        voiceCommandBtn.disabled = true;
    }
});

async function parseAndExecuteCommand(command) {
    const commandRegex = /^(add|subtract)\s+(\d+)\s+points?\s+to\s+(cse|ece|eee|mech|civil)$/i;
    const match = command.match(commandRegex);

    if (match) {
        const action = match[1].toLowerCase();
        const points = parseInt(match[2], 10);
        const department = match[3].toLowerCase();
        const pointsValue = action === 'subtract' ? -points : points;

        await updatePointsInBackend(department, pointsValue, 'Voice Command');
    } else {
        showToast('Invalid command format. Example: "Add 10 points to CSE"', 'error');
    }
}

async function updatePointsInBackend(department, points, event) {
    try {
        const response = await fetch('/api/points/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ department, points, event }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        showToast(result.message, 'success');
        
    } catch (error) {
        console.error('Error updating points:', error);
        showToast(error.message || 'Failed to update points.', 'error');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('notification-toast');
    toast.textContent = message;

    toast.classList.remove('bg-green-500', 'bg-red-500', 'opacity-0', 'translate-y-4');
    toast.classList.add(type === 'error' ? 'bg-red-500' : 'bg-green-500', 'opacity-100', 'translate-y-0');

    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-4');
    }, 4000);
}