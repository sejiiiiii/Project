document.addEventListener('DOMContentLoaded', () => {
    const pointsTableContainer = document.getElementById('points-table');
    
    const fetchData = async () => {
        try {
            const response = await fetch('/api/points');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            renderPointsTable(pointsTableContainer, data);
        } catch (error) {
            pointsTableContainer.innerHTML = `<p class="text-red-500 text-center">Failed to load scores. Please try again later.</p>`;
            console.error('Fetch error:', error);
        }
    };
    
    fetchData(); // Initial fetch
    setInterval(fetchData, 5000); // Poll for updates every 5 seconds
});

function renderPointsTable(container, data) {
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400">No scores available yet.</p>';
        return;
    }

    const sortedData = [...data].sort((a, b) => b.points - a.points);
    let tableHTML = '';

    sortedData.forEach((dept, index) => {
        const rank = index + 1;
        const isFirst = rank === 1;
        const rowClass = `table-row-base ${isFirst ? 'table-row-rank-1' : ''}`;

        tableHTML += `
            <div class="${rowClass}" style="--animation-delay: ${index * 100}ms;">
                <div class="flex items-center space-x-4">
                    <span class="text-xl font-bold w-8 text-center ${isFirst ? 'text-accent' : 'text-gray-500'}">${rank}</span>
                    <span class="text-lg md:text-xl font-bold text-white">${dept.name}</span>
                    ${isFirst ? '<i data-lucide="crown" class="w-5 h-5 text-accent"></i>' : ''}
                </div>
                <div class="text-2xl md:text-3xl font-extrabold text-white">
                    ${dept.points}
                    <span class="text-base font-medium text-gray-400 ml-1">pts</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = tableHTML;
    lucide.createIcons();
}