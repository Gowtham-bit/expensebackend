// Test the deployed API
fetch("https://expensebackend-h4wu.onrender.com/api/users/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: "test@example.com",
        password: "password123"
    })
})
    .then(res => Promise.all([res.status, res.text()]))
    .then(([status, text]) => {
        console.log(`Status: ${status}`);
        console.log(`Body: ${text}`);
    })
    .catch(err => console.error(err));
