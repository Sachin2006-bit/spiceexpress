
const http = require('http');

http.get('http://localhost:5000/api/customers', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const customers = JSON.parse(data);
            console.log('Count:', customers.length);
            if (customers.length > 0) {
                const c = customers.find(c => c.rate && Object.keys(c.rate).length > 0) || customers[0];
                console.log('Customer Code:', c.code);
                console.log('Rate Type:', typeof c.rate);
                console.log('Is Array?', Array.isArray(c.rate));
                console.log('Rate Keys:', Object.keys(c.rate || {}));
                if (c.rate) {
                    const firstKey = Object.keys(c.rate)[0];
                    console.log('First Rate Value:', c.rate[firstKey]);
                }
                console.log('Full Rate Object:', JSON.stringify(c.rate, null, 2));
            }
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (err) => {
    console.error("Error: " + err.message);
});
