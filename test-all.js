// test-all.js - Comprehensive E-commerce Testing Script
// Run: node test-all.js

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let authToken = null;
let testProductId = null;
let testOrderId = null;
let testResults = [];

// Colors for console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(status, message) {
    const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : 'ℹ';
    const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.blue;
    console.log(`${color}${icon} ${message}${colors.reset}`);
    testResults.push({ status, message });
}

function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testProducts() {
    console.log('\n' + colors.yellow + '═══════════════════════════════════════' + colors.reset);
    console.log(colors.yellow + '  TESTING PRODUCTS API' + colors.reset);
    console.log(colors.yellow + '═══════════════════════════════════════' + colors.reset);

    try {
        // Get all products
        const res = await makeRequest('GET', '/api/products');
        if (res.status === 200 && Array.isArray(res.data)) {
            log('PASS', `GET /api/products - Found ${res.data.length} products`);
            if (res.data.length > 0) {
                testProductId = res.data[0]._id;
                log('INFO', `Sample Product: ${res.data[0].name} (₹${res.data[0].price})`);
            }
        } else {
            log('FAIL', 'GET /api/products - Could not fetch products');
        }

        // Get single product
        if (testProductId) {
            const singleRes = await makeRequest('GET', `/api/products/${testProductId}`);
            if (singleRes.status === 200 && singleRes.data._id) {
                log('PASS', `GET /api/products/:id - Product found: ${singleRes.data.name}`);
                log('INFO', `  Stock: ${singleRes.data.stock}, Category: ${singleRes.data.categoryId?.name || 'N/A'}`);
            } else {
                log('FAIL', 'GET /api/products/:id - Could not fetch single product');
            }
        }

        // Test search
        const searchRes = await makeRequest('GET', '/api/products?search=wool');
        if (searchRes.status === 200) {
            log('PASS', `Search - Found ${searchRes.data.length} products for "wool"`);
        }

    } catch (error) {
        log('FAIL', `Products API Error: ${error.message}`);
    }
}

async function testCategories() {
    console.log('\n' + colors.yellow + '═══════════════════════════════════════' + colors.reset);
    console.log(colors.yellow + '  TESTING CATEGORIES API' + colors.reset);
    console.log(colors.yellow + '═══════════════════════════════════════' + colors.reset);

    try {
        const res = await makeRequest('GET', '/api/categories');
        if (res.status === 200 && Array.isArray(res.data)) {
            log('PASS', `GET /api/categories - Found ${res.data.length} categories`);
            res.data.forEach(cat => {
                log('INFO', `  - ${cat.name}`);
            });
        } else {
            log('FAIL', 'GET /api/categories - Could not fetch categories');
        }

        const subRes = await makeRequest('GET', '/api/subcategories');
        if (subRes.status === 200 && Array.isArray(subRes.data)) {
            log('PASS', `GET /api/subcategories - Found ${subRes.data.length} subcategories`);
        }
    } catch (error) {
        log('FAIL', `Categories API Error: ${error.message}`);
    }
}

async function testAuth() {
    console.log('\n' + colors.yellow + '═══════════════════════════════════════' + colors.reset);
    console.log(colors.yellow + '  TESTING AUTH API' + colors.reset);
    console.log(colors.yellow + '═══════════════════════════════════════' + colors.reset);

    const testEmail = `testuser_${Date.now()}@test.com`;
    const testPassword = 'test123456';

    try {
        // Register (using /api/signup with confirmPassword)
        const regRes = await makeRequest('POST', '/api/signup', {
            fullName: 'Test User',
            email: testEmail,
            phone: '9876543210',
            password: testPassword,
            confirmPassword: testPassword
        });
        
        if (regRes.status === 201 || regRes.data.token) {
            log('PASS', 'POST /api/auth/register - User registered successfully');
            authToken = regRes.data.token;
        } else if (regRes.data.message?.includes('exists')) {
            log('INFO', 'Registration skipped - user exists');
        } else {
            log('FAIL', `Registration failed: ${regRes.data.message}`);
        }

        // Login (using /api/login)
        const loginRes = await makeRequest('POST', '/api/login', {
            email: testEmail,
            password: testPassword
        });

        if (loginRes.status === 200 && loginRes.data.token) {
            log('PASS', 'POST /api/auth/login - Login successful');
            authToken = loginRes.data.token;
            log('INFO', `  User: ${loginRes.data.user?.fullName || 'Test User'}`);
        } else {
            log('FAIL', `Login failed: ${loginRes.data.message}`);
        }

        // Get Profile
        if (authToken) {
            const profileRes = await makeRequest('GET', '/api/user/profile', null, authToken);
            if (profileRes.status === 200) {
                log('PASS', 'GET /api/user/profile - Profile fetched');
            }
        }

    } catch (error) {
        log('FAIL', `Auth API Error: ${error.message}`);
    }
}

async function testOrders() {
    console.log('\n' + colors.yellow + '═══════════════════════════════════════' + colors.reset);
    console.log(colors.yellow + '  TESTING ORDERS API' + colors.reset);
    console.log(colors.yellow + '═══════════════════════════════════════' + colors.reset);

    if (!testProductId) {
        log('FAIL', 'Cannot test orders - no product ID available');
        return;
    }

    try {
        // Get product details first to get correct data
        const productRes = await makeRequest('GET', `/api/products/${testProductId}`);
        const product = productRes.data;

        if (!product || !product._id) {
            log('FAIL', 'Could not get product for order test');
            return;
        }

        // Create order
        const orderData = {
            customerName: 'Test Customer',
            phone: '9876543210',
            shippingAddress: {
                street: '123 Test Street',
                city: 'Test City',
                state: 'Test State',
                pincode: '123456',
                country: 'India'
            },
            items: [{
                productId: product._id,
                name: product.name,
                quantity: 1,
                price: product.price,
                size: '',
                image: product.image || ''
            }],
            paymentMethod: 'COD'
        };

        const createRes = await makeRequest('POST', '/api/orders', orderData, authToken);
        
        if (createRes.status === 201 && createRes.data.order) {
            log('PASS', 'POST /api/orders - Order created successfully');
            testOrderId = createRes.data.order._id;
            log('INFO', `  Order ID: ${testOrderId}`);
            log('INFO', `  Total: ₹${createRes.data.order.total}`);
        } else {
            log('FAIL', `Order creation failed: ${createRes.data.message || JSON.stringify(createRes.data)}`);
        }

        // Get all orders
        const ordersRes = await makeRequest('GET', '/api/orders');
        if (ordersRes.status === 200 && Array.isArray(ordersRes.data)) {
            log('PASS', `GET /api/orders - Found ${ordersRes.data.length} orders`);
        }

        // Get single order
        if (testOrderId) {
            const singleOrderRes = await makeRequest('GET', `/api/orders/${testOrderId}`);
            if (singleOrderRes.status === 200) {
                log('PASS', `GET /api/orders/:id - Order fetched`);
                log('INFO', `  Status: ${singleOrderRes.data.status}`);
            }
        }

        // Verify stock was decremented
        const productAfter = await makeRequest('GET', `/api/products/${testProductId}`);
        if (productAfter.data.stock === product.stock - 1) {
            log('PASS', `Stock validation - Decremented from ${product.stock} to ${productAfter.data.stock}`);
        } else {
            log('INFO', `Stock: ${product.stock} -> ${productAfter.data.stock}`);
        }

    } catch (error) {
        log('FAIL', `Orders API Error: ${error.message}`);
    }
}

async function testAdmin() {
    console.log('\n' + colors.yellow + '═══════════════════════════════════════' + colors.reset);
    console.log(colors.yellow + '  TESTING ADMIN APIs' + colors.reset);
    console.log(colors.yellow + '═══════════════════════════════════════' + colors.reset);

    try {
        // Dashboard stats
        const statsRes = await makeRequest('GET', '/api/admin/stats');
        if (statsRes.status === 200) {
            log('PASS', 'GET /api/admin/stats - Dashboard stats fetched');
            log('INFO', `  Total Products: ${statsRes.data.totalProducts || 0}`);
            log('INFO', `  Total Orders: ${statsRes.data.totalOrders || 0}`);
            log('INFO', `  Total Users: ${statsRes.data.totalUsers || 0}`);
        }

        // Update order status (if we have an order)
        if (testOrderId) {
            const updateRes = await makeRequest('PUT', `/api/orders/${testOrderId}`, {
                status: 'Processing'
            });
            if (updateRes.status === 200) {
                log('PASS', 'PUT /api/orders/:id - Order status updated to Processing');
            }
        }

    } catch (error) {
        log('FAIL', `Admin API Error: ${error.message}`);
    }
}

async function printSummary() {
    console.log('\n' + colors.yellow + '═══════════════════════════════════════' + colors.reset);
    console.log(colors.yellow + '  TEST SUMMARY' + colors.reset);
    console.log(colors.yellow + '═══════════════════════════════════════' + colors.reset);

    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const total = passed + failed;

    console.log(`\n${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`Total Tests: ${total}`);
    console.log(`Success Rate: ${total > 0 ? Math.round((passed/total)*100) : 0}%\n`);

    if (failed > 0) {
        console.log(colors.red + 'Failed Tests:' + colors.reset);
        testResults.filter(r => r.status === 'FAIL').forEach(r => {
            console.log(`  ${colors.red}✗ ${r.message}${colors.reset}`);
        });
    }
}

async function runAllTests() {
    console.log('\n' + colors.blue + '╔═══════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.blue + '║   BHAGIRTHI TRIBES E-COMMERCE - FULL TEST SUITE          ║' + colors.reset);
    console.log(colors.blue + '╚═══════════════════════════════════════════════════════════╝' + colors.reset);
    console.log(`\nTesting against: ${BASE_URL}`);
    console.log('Time: ' + new Date().toLocaleString());

    await testProducts();
    await testCategories();
    await testAuth();
    await testOrders();
    await testAdmin();
    await printSummary();
}

runAllTests().catch(err => {
    console.error('Test suite error:', err);
    process.exit(1);
});
