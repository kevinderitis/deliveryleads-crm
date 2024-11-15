let chart;

document.addEventListener("click", function (event) {
    const menu = document.getElementById("hamburger-menu");
    const button = document.querySelector(".hamburger-button");

    if (!menu.contains(event.target) && !button.contains(event.target)) {
        menu.classList.remove("show");
    }
});

function toggleMenu() {
    const menu = document.getElementById("hamburger-menu");
    menu.classList.toggle("show");
}

function goToMain() {
    window.location.href = "/crm";
}

function initDashboard() {
    setInitialDates();
    updateTodayLeads();
    updateChart();
}

function setInitialDates() {
    const today = new Date().toLocaleDateString('en-CA');
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;
}

async function updateTodayLeads() {
    const today = new Date().toLocaleDateString('en-CA');
    const data = await fetchReportData(today, today);

    const todayLeads = data.leads[today] || 0;
    const todayPayments = data.payments[today] || 0;

    const todayConversion = todayLeads ? ((todayPayments / todayLeads) * 100).toFixed(0) : 0;

    document.getElementById('todayLeads').textContent = todayLeads;
    document.getElementById('totalAmount').textContent = data.totalAmount;
    document.getElementById('responseTime').textContent = data.averageResponseTime.toFixed(2);
    document.getElementById('todayPayments').textContent = todayConversion + '%';
}

async function searchLeads() {
    const searchDate = document.getElementById('searchDate').value;
    const data = await fetchReportData(searchDate, searchDate);

    const leads = data.leads[searchDate] || 0;
    const payments = data.payments[searchDate] || 0;

    const conversion = leads ? ((payments / leads) * 100).toFixed(0) : 0;

    document.getElementById('searchLeads').textContent = leads;
    document.getElementById('searchTotalAmount').textContent = data.totalAmount;
    document.getElementById('searchResponseTime').textContent = data.averageResponseTime.toFixed(2);
    document.getElementById('searchPayments').textContent = conversion + '%';
    document.getElementById('searchResult').style.display = 'block';
}

async function fetchReportData(startDate, endDate) {
    try {
        const response = await fetch('crm/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate: startDate,
                endDate: endDate
            })
        });

        if (!response.ok) throw new Error('Error fetching data');

        const responseData = await response.json();

        return responseData;
    } catch (error) {
        console.error('Error fetching report data:', error);
        return {};
    }
}

async function updateChart() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const ctx = document.getElementById('leadsChart').getContext('2d');

    const reportData = await fetchReportData(startDate, endDate);
    console.log(reportData.payments);

    if (chart) {
        chart.destroy();
    }

    const sortedDates = Object.keys(reportData.leads).sort();

    const leadsData = sortedDates.map(date => reportData.leads[date] || 0);
    const paymentsData = sortedDates.map(date => reportData.payments[date] || 0);

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Leads',
                data: leadsData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                tension: 0.1
            }, {
                label: 'Pagos',
                data: paymentsData,
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// async function updateChart() {
//     const startDate = document.getElementById('startDate').value;
//     const endDate = document.getElementById('endDate').value;
//     const ctx = document.getElementById('leadsChart').getContext('2d');

//     const reportData = await fetchReportData(startDate, endDate);
//     console.log(reportData.payments);

//     if (chart) {
//         chart.destroy();
//     }

//     const sortedDates = Object.keys(reportData.leads).sort();

//     const leadsData = sortedDates.map(date => reportData.leads[date] || 0);
//     const paymentsData = sortedDates.map(date => reportData.payments[date] || 0);

//     chart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: sortedDates,
//             datasets: [{
//                 label: 'Leads',
//                 data: leadsData,
//                 borderColor: '#3498db',
//                 backgroundColor: 'rgba(52, 152, 219, 0.5)',
//                 borderWidth: 1,
//                 barPercentage: 0.8,
//                 categoryPercentage: 1.0
//             }, {
//                 label: 'Pagos',
//                 data: paymentsData,
//                 borderColor: '#9b59b6',
//                 backgroundColor: 'rgba(155, 89, 182, 0.5)',
//                 borderWidth: 1,
//                 barPercentage: 0.8,
//                 categoryPercentage: 1.0
//             }]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 x: {
//                     stacked: true // Habilita la superposición en el eje x
//                 },
//                 y: {
//                     stacked: true, // Habilita la superposición en el eje y
//                     beginAtZero: true
//                 }
//             }
//         }
//     });
// }

window.onload = initDashboard;