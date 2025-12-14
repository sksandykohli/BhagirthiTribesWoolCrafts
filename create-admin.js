const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bhagirthi-wool-crafts', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

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
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart: [{
        productId: String,
        quantity: Number,
        price: Number
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

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@bhagirthi.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@bhagirthi.com');
            console.log('Update password if needed...');
            
            // Update to admin role if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('User role updated to admin');
            }
            
            process.exit(0);
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        const adminUser = new User({
            fullName: 'Admin User',
            email: 'admin@bhagirthi.com',
            phone: '9876543210',
            password: hashedPassword,
            role: 'admin',
            isVerified: true
        });

        await adminUser.save();

        console.log('✅ Admin user created successfully!');
        console.log('=====================================');
        console.log('Email: admin@bhagirthi.com');
        console.log('Password: admin123');
        console.log('=====================================');
        console.log('Login at: http://localhost:3000/admin-login.html');

        process.exit(0);

    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
