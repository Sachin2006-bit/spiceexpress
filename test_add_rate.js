
const http = require('http');

function update(id, data) {
    const postData = JSON.stringify(data);
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/customers/${id}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Body:', responseData);
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

http.get('http://localhost:5000/api/customers', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const customers = JSON.parse(data);
            // Find a customer.
            const c = customers.find(c => c.code === 'CUST001') || customers[0];
            if (c) {
                console.log('Testing update on:', c.code);
                const laneKey = 'test-lane';
                const newRateEntry = {
                    from: 'Test',
                    to: 'Lane',
                    rate: 100,
                    rateType: 'perKg'
                };

                // Mimic frontend logic: preserve existing, add new
                const updatedRate = { ...(c.rate || {}) };
                updatedRate[laneKey] = newRateEntry;

                const updatePayload = {
                    ...c,
                    rate: updatedRate
                };

                update(c._id, updatePayload);
            } else {
                console.log('No customers found');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });
});
