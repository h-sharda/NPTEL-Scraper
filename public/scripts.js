const form = document.getElementById('userForm');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const errorMessageDiv = document.getElementById('errorMessage');

function validateForm(email, dob) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
    }
    if (!dobRegex.test(dob)) {
        throw new Error('Please enter a valid date in YYYY-MM-DD format');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const dob = document.getElementById('password').value;

    try {
        validateForm(email, dob);

        loadingDiv.style.display = 'flex';
        errorMessageDiv.style.display = 'none';
        resultsDiv.innerHTML = '';

        const response = await fetch('/process-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, dob })
        });

        const text = await response.text(); // Read response as text
        console.log('Response text:', text);

        const data = JSON.parse(text); // Try to parse as JSON
        if (data.error) throw new Error(data.error);
        displayResults(data.results);

    } catch (error) {
        console.log(error);
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.textContent = error.message;
    } finally {
        loadingDiv.style.display = 'none';
    }
});

function displayResults(results) {
    results.forEach((result, index) => {
        const div = document.createElement('div');
        div.className = 'result-card';            
        div.style.animationDelay = `${index * 0.1}s`;
        const total = parseFloat(result['Total (100)']);
        const statusClass = total >= 40 ? 'text-success' : 'text-error';
        
        div.innerHTML = `
            <div class="result-grid">
                <div>
                    <h3 class="student-name">${result.Name}</h3>
                    <p class="course-name">${result['Course Name']}</p>
                </div>
                <div class="scores-grid">
                    <div class="score-box">
                        <div class="score-label">Assignment</div>
                        <div class="score-value">${result['Assignment (25)']}/25</div>
                    </div>
                    <div class="score-box">
                        <div class="score-label">Exam</div>
                        <div class="score-value">${result['Exam (75)']}/75</div>
                    </div>
                    <div class="score-box">
                        <div class="score-label">Total</div>
                        <div class="score-value ${statusClass}">${result['Total (100)']}/100</div>
                    </div>
                </div>
            </div>
            <div class="helper-text ${statusClass}" style="margin-top: 1rem;">${result['Message']}</div>
        `;
        resultsDiv.appendChild(div);
    });
}
