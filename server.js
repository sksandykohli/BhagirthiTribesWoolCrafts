const express = require('express');
const mongoose = require('mongoose');
// removed duplicate bcrypt and jwt require
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'public', 'uploads', 'banners');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for banner uploads
const bannerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const bannerUpload = multer({
    storage: bannerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// NOTE: Real Orders routes are defined after models are declared below.

// Enable GZIP compression for faster loading
app.use(compression());

// CORS Configuration - Allow all origins for ngrok
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with caching
app.use(express.static('public', {
    maxAge: '1h', // Cache static files for 1 hour
    etag: true
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // set to true if using https
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// MongoDB Connection
// Helper to safely encode passwords that contain special characters (like @)
function normalizeMongoUri(uri) {
    if (!uri) return uri;
    try {
        const schemeEnd = uri.indexOf('://');
        if (schemeEnd === -1) return uri;
        const credsEnd = uri.lastIndexOf('@');
        if (credsEnd <= schemeEnd) return uri; // no credentials present

        const creds = uri.slice(schemeEnd + 3, credsEnd); // user:pass (may include @ in pass)
        const rest = uri.slice(credsEnd + 1);
        if (!creds.includes(':')) return uri; // no password to encode
        const [user, ...passParts] = creds.split(':');
        const password = passParts.join(':');
        // If password already seems percent-encoded, leave it
        if (/%[0-9A-Fa-f]{2}/.test(password)) return uri;
        const encoded = encodeURIComponent(password);
        return uri.slice(0, schemeEnd + 3) + user + ':' + encoded + '@' + rest;
    } catch (e) {
        return uri;
    }
}

const rawMongoUri = process.env.MONGODB_URI;
const mongoUri = rawMongoUri ? normalizeMongoUri(rawMongoUri) : 'mongodb://localhost:27017/bhagirthi-wool-crafts';

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => {
    console.log('MongoDB Connection Error:', err);
    // Provide clearer hint for a common mistake
    if (rawMongoUri && rawMongoUri.includes('@') && rawMongoUri.includes('mongodb')) {
        console.log('Hint: If your MongoDB password contains special characters (for example "@"), URL-encode them or let the app encode them by ensuring the URI follows this format:');
        console.log('  mongodb+srv://username:password@host... (encode password special chars like @ -> %40)');
    }
});

// User Schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    address: [{
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart: [{
        productId: String,
        quantity: Number,
        price: Number,
        size: String,
        productName: String,
        image: String
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Category Schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        trim: true,
        lowercase: true
    },
    icon: String,
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Category = mongoose.model('Category', categorySchema);

// Settings Schema (for banners, site config etc)
const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: mongoose.Schema.Types.Mixed,
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Subcategory Schema
const subcategorySchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

// Product Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    image: {
        type: String,
        required: true
    },
    images: [String],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: [{
        userId: mongoose.Schema.Types.ObjectId,
        name: String,
        rating: Number,
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    sizeType: {
        type: String,
        enum: ['none', 'clothing', 'kids'],
        default: 'none'
    },
    sizeOptions: {
        type: [String],
        default: []
    }
});

const Product = mongoose.model('Product', productSchema);

// Order Schema
const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String }
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String },
    phone: { type: String },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['UPI', 'Card', 'COD', 'upi', 'card', 'cod', 'paypal', 'PayPal', ''], default: '' },
    transactionId: { type: String, default: '' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Completed', 'pending', 'paid', 'failed', 'completed'], default: 'Pending' },
    rejectionReason: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Signup Route
app.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, phone, password, confirmPassword } = req.body;

        // Validation
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Create new user
        const user = new User({
            fullName,
            email,
            phone,
            password
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again later.' 
        });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Store session
        req.session.userId = user._id;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                cart: user.cart,
                wishlist: user.wishlist,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again later.' 
        });
    }
});

// Admin Login Route
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user with admin role
        const user = await User.findOne({ email, role: 'admin' });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid admin credentials' 
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid admin credentials' 
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Store session
        req.session.userId = user._id;
        req.session.isAdmin = true;

        res.json({
            success: true,
            message: 'Admin login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again later.' 
        });
    }
});

// Serve index.html for root and SPA routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route for SPA: serve index.html for unmatched routes
app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

// Get User Profile (Protected Route)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Profile Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Update User Profile (Protected Route)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { fullName, phone, address } = req.body;

        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Update fields
        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Logout Route
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
});

// Check Auth Status
app.get('/api/auth/check', authenticateToken, (req, res) => {
    res.json({ 
        success: true, 
        authenticated: true,
        userId: req.user.userId
    });
});

// Forgot Password (Send Reset Link)
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'No account found with this email' 
            });
        }

        // Generate reset token (In production, send this via email)
        const resetToken = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            message: 'Password reset link sent to your email',
            resetToken // In production, send this via email
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
});

// ============ CATEGORY ROUTES ============

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get single category
app.get('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create category
app.post('/api/categories', async (req, res) => {
    try {
        const { name, slug, icon, order } = req.body;
        
        // Auto-generate slug if not provided
        const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const category = new Category({ name, slug: finalSlug, icon, order });
        await category.save();
        
        res.status(201).json({ success: true, category });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update category
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { name, slug, icon, order } = req.body;
        
        // Auto-generate slug if not provided
        const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, slug: finalSlug, icon, order },
            { new: true }
        );
        
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        
        res.json({ success: true, category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        
        // Delete all subcategories and products in this category
        await Subcategory.deleteMany({ categoryId: req.params.id });
        await Product.deleteMany({ categoryId: req.params.id });
        
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============ SUBCATEGORY ROUTES ============

// Get all subcategories
app.get('/api/subcategories', async (req, res) => {
    try {
        const subcategories = await Subcategory.find().sort({ order: 1 });
        res.json(subcategories);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get subcategories by category
app.get('/api/subcategories/category/:categoryId', async (req, res) => {
    try {
        const subcategories = await Subcategory.find({ categoryId: req.params.categoryId }).sort({ order: 1 });
        res.json(subcategories);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create subcategory
app.post('/api/subcategories', async (req, res) => {
    try {
        const { categoryId, name, slug, order } = req.body;
        
        // Auto-generate slug if not provided
        const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const subcategory = new Subcategory({ categoryId, name, slug: finalSlug, order });
        await subcategory.save();
        
        res.status(201).json({ success: true, subcategory });
    } catch (error) {
        console.error('Error creating subcategory:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update subcategory
app.put('/api/subcategories/:id', async (req, res) => {
    try {
        const { categoryId, name, slug, order } = req.body;
        
        // Auto-generate slug if not provided
        const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const subcategory = await Subcategory.findByIdAndUpdate(
            req.params.id,
            { categoryId, name, slug: finalSlug, order },
            { new: true }
        );
        
        if (!subcategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }
        
        res.json({ success: true, subcategory });
    } catch (error) {
        console.error('Error updating subcategory:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete subcategory
app.delete('/api/subcategories/:id', async (req, res) => {
    try {
        const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
        
        if (!subcategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }
        
        // Delete all products in this subcategory
        await Product.deleteMany({ subcategoryId: req.params.id });
        
        res.json({ success: true, message: 'Subcategory deleted successfully' });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============ PRODUCT ROUTES ============

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        
        // Manually populate category and subcategory names
        const categories = await Category.find();
        const subcategories = await Subcategory.find();
        
        const productsWithNames = products.map(product => {
            const category = categories.find(c => c._id.toString() === product.categoryId.toString());
            const subcategory = subcategories.find(s => s._id.toString() === product.subcategoryId.toString());
            
            return {
                ...product.toObject(),
                categoryName: category ? category.name : 'N/A',
                subcategoryName: subcategory ? subcategory.name : 'N/A'
            };
        });
        
        res.json(productsWithNames);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============ ORDER ROUTES ============

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        req.user = null;
        return next();
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        req.user = err ? null : user;
        next();
    });
};

// Create order with stock validation and update
app.post('/api/orders', optionalAuth, async (req, res) => {
    try {
        const {
            customerName,
            phone,
            shippingAddress,
            items,
            paymentMethod
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order items required' });
        }

        // Validate stock for all items before creating order
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Product "${item.name}" not found` 
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Sorry! Only ${product.stock} items of "${item.name}" available in stock` 
                });
            }
        }

        // Calculate totals server-side
        const subtotal = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity || 1)), 0);
        const shipping = subtotal > 1000 ? 0 : 50;
        const total = subtotal + shipping;

        const order = new Order({
            userId: req.user?.userId, // may be undefined for guest orders
            customerName: customerName || '',
            phone: phone || '',
            shippingAddress: shippingAddress || {},
            items: items.map(it => ({
                productId: String(it.productId || it._id || ''),
                name: it.name,
                size: it.size || '',
                quantity: Number(it.quantity || 1),
                price: Number(it.price || 0),
                image: it.image || ''
            })),
            subtotal,
            shipping,
            total,
            paymentMethod: paymentMethod || '',
            paymentStatus: 'Pending',
            status: 'Pending'
        });

        await order.save();

        // Update stock for all items after order is saved
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        res.status(201).json({ success: true, order });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all orders (admin)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get single order by id
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update order status (basic)
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        
        const previousStatus = order.status;

        // If client requests to cancel but order is already cancelled, reject early (prevents duplicate stock restore)
        if (status && status.toString().toLowerCase() === 'cancelled' && previousStatus && previousStatus.toString().toLowerCase() === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
        }

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        
        // Restore stock if order is being cancelled and was not previously cancelled
        if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity }
                });
            }
            console.log(`Stock restored for cancelled order ${order._id}`);
        }
        
        await order.save();
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update payment for order
app.put('/api/orders/:id/payment', async (req, res) => {
    try {
        const { paymentMethod, transactionId, paymentStatus, rejectionReason, status } = req.body;
        
        // First, get the current order to check previous status
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        const previousStatus = existingOrder.status;
        
        // Build update object
        const updateData = {};
        if (paymentMethod) updateData.paymentMethod = paymentMethod;
        if (transactionId) updateData.transactionId = transactionId;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (rejectionReason) updateData.rejectionReason = rejectionReason;
        
        // If status is explicitly passed, use it
        // If payment is verified (Completed), set order status to Processing
        if (status) {
            updateData.status = status;
        } else if (paymentStatus === 'Completed') {
            updateData.status = 'Processing';
        }
        
        // Restore stock if order is being cancelled and was not previously cancelled
        const newStatus = updateData.status;
        // If trying to set to Cancelled but it was already Cancelled — reject to prevent duplicate stock restore
        if (newStatus && newStatus.toString().toLowerCase() === 'cancelled' && previousStatus && previousStatus.toString().toLowerCase() === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
        }
        if (newStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
            for (const item of existingOrder.items) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity }
                });
            }
            console.log(`Stock restored for cancelled order ${existingOrder._id}`);
        }
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete order (admin)
app.delete('/api/orders/:id', async (req, res) => {
    try {
        // First get the order to restore stock
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        
        // Restore stock for all items in the order (if not already cancelled)
        if (order.status !== 'Cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity }
                });
            }
            console.log(`Stock restored for deleted order ${order._id}`);
        }
        
        // Now delete the order
        await Order.findByIdAndDelete(req.params.id);
        
        res.json({ success: true, message: 'Order deleted successfully and stock restored' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get orders for logged-in user
app.get('/api/user/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Cancel order by user - Only pending orders can be cancelled
app.put('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.userId;
        
        // Find the order
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // Check if order belongs to this user
        if (order.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'You can only cancel your own orders' });
        }
        
        // Attempt atomic update: only cancel if currently Pending (to prevent duplicate cancels/stock restores)
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, userId: userId, status: { $in: ['Pending', 'pending'] } },
            {
                $set: {
                    status: 'Cancelled',
                    paymentStatus: 'Cancelled',
                    rejectionReason: 'Cancelled by customer'
                }
            },
            { new: false } // return the document before update so we can restore stock from its items
        );

        if (!updatedOrder) {
            // Could be already cancelled/processing/etc. Use the current order object to provide message
            return res.status(400).json({
                success: false,
                message: 'Only pending orders can be cancelled. Your order is already ' + order.status
            });
        }

        // Restore stock for all items from the previous (pre-update) document
        for (const item of updatedOrder.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }
        console.log(`Stock restored for user-cancelled order ${updatedOrder._id}`);

        // Return the updated order (read fresh)
        const freshOrder = await Order.findById(orderId);
        res.json({ success: true, message: 'Order cancelled successfully', order: freshOrder });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get products by category
app.get('/api/products/category/:categoryId', async (req, res) => {
    try {
        const products = await Product.find({ categoryId: req.params.categoryId })
            .populate('categoryId', 'name slug')
            .populate('subcategoryId', 'name slug');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get products by subcategory
app.get('/api/products/subcategory/:subcategoryId', async (req, res) => {
    try {
        const products = await Product.find({ subcategoryId: req.params.subcategoryId })
            .populate('categoryId', 'name slug')
            .populate('subcategoryId', 'name slug');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('categoryId', 'name slug')
            .populate('subcategoryId', 'name slug');
            
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        // Convert to object and add categoryName/subcategoryName for frontend
        const productObj = product.toObject();
        productObj.categoryName = product.categoryId?.name || '-';
        productObj.subcategoryName = product.subcategoryId?.name || '-';
        
        res.json(productObj);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create product
app.post('/api/products', async (req, res) => {
    try {
        const { name, slug, categoryId, subcategoryId, description, price, stock, image, images, sizeOptions } = req.body;
        const product = new Product({
            name, slug, categoryId, subcategoryId, description, price, stock, image, images,
            sizeOptions: Array.isArray(sizeOptions) ? sizeOptions : (typeof sizeOptions === 'string' && sizeOptions ? [sizeOptions] : [])
        });
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, slug, categoryId, subcategoryId, description, price, stock, image, images, sizeOptions } = req.body;
        const updateData = {
            name, slug, categoryId, subcategoryId, description, price, stock, image, images,
            sizeOptions: Array.isArray(sizeOptions) ? sizeOptions : (typeof sizeOptions === 'string' && sizeOptions ? [sizeOptions] : [])
        };
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all users (for admin)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============ ADMIN DASHBOARD STATS ============
app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalCategories = await Category.countDocuments();
        
        // Revenue calculation
        const orders = await Order.find({ status: { $ne: 'Cancelled' } });
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        // Recent orders
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
        
        // Low stock products
        const lowStockProducts = await Product.find({ stock: { $lte: 5 } }).limit(10);
        
        // Orders by status
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const processingOrders = await Order.countDocuments({ status: 'Processing' });
        const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
        const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
        
        res.json({
            success: true,
            totalProducts,
            totalOrders,
            totalUsers,
            totalCategories,
            totalRevenue,
            recentOrders,
            lowStockProducts,
            ordersByStatus: {
                pending: pendingOrders,
                processing: processingOrders,
                shipped: shippedOrders,
                delivered: deliveredOrders,
                cancelled: cancelledOrders
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== Banner/Settings API Routes ==========

// Upload banner image
app.post('/api/upload/banner', bannerUpload.single('banner'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Return the URL of uploaded file
        const imageUrl = `/uploads/banners/${req.file.filename}`;
        res.json({ success: true, url: imageUrl });
    } catch (error) {
        console.error('Error uploading banner:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// Get banner settings
app.get('/api/settings/banners', async (req, res) => {
    try {
        const settings = await Settings.findOne({ key: 'homepage_banners' });
        if (settings) {
            res.json(settings.value);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Save banner settings
app.post('/api/settings/banners', async (req, res) => {
    try {
        const { banners } = req.body;
        
        await Settings.findOneAndUpdate(
            { key: 'homepage_banners' },
            { 
                key: 'homepage_banners',
                value: banners,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        
        res.json({ success: true, message: 'Banners saved successfully' });
    } catch (error) {
        console.error('Error saving banners:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});
