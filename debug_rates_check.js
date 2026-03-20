// Native fetch is available in Node 18+

async function checkRates() {
    try {
        const response = await fetch('http://localhost:5000/api/customers');
        const customers = await response.json();

        console.log('Total customers:', customers.length);
        if (customers.length > 0) {
            console.log('--- Printing ALL customers with rates ---');
            customers.forEach(c => {
                if (c.rate && Object.keys(c.rate).length > 0) {
                    console.log(`Customer: ${c.name || c.company} (${c.code})`);
                    console.log(JSON.stringify(c.rate, null, 2));
                    console.log('-----------------------------------');
                }
            });
        }
    } catch (error) {
        console.error('Error fetching:', error);
    }
}

checkRates();
