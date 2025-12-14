const mongoose = require('mongoose');
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
    fullName: String,
    email: String,
    phone: String,
    password: String,
    role: String
});

const User = mongoose.model('User', userSchema);

async function checkAdmin() {
    try {
        const admin = await User.findOne({ email: 'admin@bhagirthi.com' });
        
        if (!admin) {
            console.log('❌ Admin user not found!');
            process.exit(1);
            return;
        }
        
        console.log('✅ Admin user found:');
        console.log('=====================================');
        console.log('Email:', admin.email);
        console.log('Name:', admin.fullName);
        console.log('Role:', admin.role);
        console.log('=====================================');
        
        if (admin.role !== 'admin') {
            console.log('\n⚠️  Role is not "admin", updating...');
            admin.role = 'admin';
            await admin.save();
            console.log('✅ Role updated to "admin"');
        } else {
            console.log('\n✅ Role is correct');
        }
        
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAdmin();
