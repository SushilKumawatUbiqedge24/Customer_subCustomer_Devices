// const fetch = require("node-fetch");
const XLSX = require("xlsx");


const CUSTOMER_API = "https://samasth.io/api/customerInfos/all?pageSize=10&page=0&includeCustomers=true&textSearch=	EZONE ENVIROTECH";
const AUTH_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzaGwua210MjAwMEBnbWFpbC5jb20iLCJ1c2VySWQiOiJmMGM3ZDdlMC1kZjVmLTExZWUtYjhmZi00ZGQ4YzhkNDEwMjMiLCJzY29wZXMiOlsiQ1VTVE9NRVJfVVNFUiJdLCJzZXNzaW9uSWQiOiI0MTAzNmE1MC00M2VhLTQ2N2EtYjgzMS05OWQ1Zjg3MzJiYTciLCJleHAiOjE3NDE2ODgxNzMsImlzcyI6InNhbWFzdGguaW8iLCJpYXQiOjE3NDE2MDE3NzMsImZpcnN0TmFtZSI6IlN1c2hpbCIsImVuYWJsZWQiOnRydWUsImlzUHVibGljIjpmYWxzZSwidGVuYW50SWQiOiIxMTJmNDZmMC0yYmVjLTExZWMtYjU0YS01MTcwYWJlYTk0MmQiLCJjdXN0b21lcklkIjoiZmI0ZDM1ODAtY2FmYS0xMWVlLWI4ZmYtNGRkOGM4ZDQxMDIzIn0.cL1oWDbkyXxx_HBY6irldK77-NgGuJ5tEk-mWsbwXTXDf6b7aq2XaEw6M9bPlUkpNU1CkgFvTIWB7rYKuHzcKA"; // 🔹 Replace with your actual token


async function fetchCustomers() {
    try {
        const response = await fetch(CUSTOMER_API, {
            method: "GET",
            headers: { "Authorization": `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        return data.data || []; // Return customer array
    } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
}

async function fetchDevices(customerId) {
    const DEVICE_API = `https://samasth.io/api/customer/${customerId}/deviceInfos?pageSize=10&page=0`;
    try {
        const response = await fetch(DEVICE_API, {
            method: "GET",
            headers: { "Authorization": `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        return (data.data || []).map(device => device.name || "Unknown Device");
    } catch (error) {
        console.error(`Error fetching devices for Customer ${customerId}:`, error);
        return [];
    }
}

async function exportToExcel() {
    const customers = await fetchCustomers();

    if (customers.length === 0) {
        console.error("No customer data found.");
        return;
    }

    let excelData = [];

    for (const customer of customers) {
        const { id, name, ownerName, createdTime } = customer;
        const customerId = id.id; 

        if (!customerId) {
            console.error(`Skipping customer due to missing ID: ${name}`);
            continue;
        }

        const devices = await fetchDevices(customerId);

        if (devices.length === 0) {
            excelData.push({
                CustomerName: name || "Unknown",
                OwnerName: ownerName || "Unknown",
                CreationTime: createdTime ? new Date(createdTime).toLocaleString() : "Unknown",
                // CustomerID: customerId,
                DeviceName: "No Devices"
            });
        } else {
            for (const deviceName of devices) {
                excelData.push({
                    CustomerName: name || "Unknown",
                    OwnerName: ownerName || "Unknown",
                    CreationTime: createdTime ? new Date(createdTime).toLocaleString() : "Unknown",
                    // CustomerID: customerId,
                    DeviceName: deviceName
                });
            }
        }
    }

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers & Devices");

    const filePath = "customer_device_data1.xlsx";
    XLSX.writeFile(wb, filePath);
    console.log(`Excel file saved: ${filePath}`);
}

exportToExcel();
