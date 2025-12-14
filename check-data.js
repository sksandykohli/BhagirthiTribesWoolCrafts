const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bhagirthi-wool-crafts', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('Error:', err));

const productSchema = new mongoose.Schema({}, { strict: false });
const categorySchema = new mongoose.Schema({}, { strict: false });
const subcategorySchema = new mongoose.Schema({}, { strict: false });

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

async function checkData() {
    try {
        const products = await Product.find().limit(2);
        const categories = await Category.find().limit(2);
        const subcategories = await Subcategory.find().limit(2);
        
        console.log('\n=== CATEGORIES ===');
        categories.forEach(cat => {
            console.log(`ID: ${cat._id}, Name: ${cat.name}, Slug: ${cat.slug}`);
        });
        
        console.log('\n=== SUBCATEGORIES ===');
        subcategories.forEach(sub => {
            console.log(`ID: ${sub._id}, Name: ${sub.name}, CategoryID: ${sub.categoryId}`);
        });
        
        console.log('\n=== PRODUCTS ===');
        products.forEach(prod => {
            console.log(`ID: ${prod._id}`);
            console.log(`Name: ${prod.name}`);
            console.log(`CategoryID: ${prod.categoryId}`);
            console.log(`CategoryID Type: ${typeof prod.categoryId}`);
            console.log(`SubcategoryID: ${prod.subcategoryId}`);
            console.log(`SubcategoryID Type: ${typeof prod.subcategoryId}`);
            console.log('---');
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
