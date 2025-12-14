const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bhagirthi-wool-crafts', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Schemas
const categorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    icon: String,
    order: Number,
    createdAt: { type: Date, default: Date.now }
});

const subcategorySchema = new mongoose.Schema({
    categoryId: mongoose.Schema.Types.ObjectId,
    name: String,
    slug: String,
    order: Number,
    createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    name: String,
    slug: String,
    categoryId: mongoose.Schema.Types.ObjectId,
    subcategoryId: mongoose.Schema.Types.ObjectId,
    description: String,
    price: Number,
    stock: Number,
    image: String,
    images: [String],
    rating: Number,
    createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);
const Product = mongoose.model('Product', productSchema);

async function addSampleProducts() {
    try {
        // Get categories
        const manCategory = await Category.findOne({ slug: 'man' });
        const womanCategory = await Category.findOne({ slug: 'woman' });
        
        if (!manCategory || !womanCategory) {
            console.error('Categories not found. Please run initialize-menu-data.js first');
            process.exit(1);
        }
        
        // Get subcategories
        const manTshirts = await Subcategory.findOne({ categoryId: manCategory._id, slug: 't-shirts' });
        const manShirts = await Subcategory.findOne({ categoryId: manCategory._id, slug: 'shirts' });
        const manJackets = await Subcategory.findOne({ categoryId: manCategory._id, slug: 'jackets' });
        const manSweaters = await Subcategory.findOne({ categoryId: manCategory._id, slug: 'sweaters' });
        
        const womanDresses = await Subcategory.findOne({ categoryId: womanCategory._id, slug: 'dresses' });
        const womanTops = await Subcategory.findOne({ categoryId: womanCategory._id, slug: 'tops' });
        const womanJackets = await Subcategory.findOne({ categoryId: womanCategory._id, slug: 'jackets' });
        const womanCardigans = await Subcategory.findOne({ categoryId: womanCategory._id, slug: 'cardigans' });
        
        console.log('Adding sample products...');
        
        // Men's Products
        const menProducts = [
            {
                name: "Premium Merino Wool T-Shirt",
                slug: "premium-merino-wool-tshirt",
                categoryId: manCategory._id,
                subcategoryId: manTshirts._id,
                description: "Soft and comfortable merino wool t-shirt, perfect for all seasons. Naturally breathable and odor-resistant.",
                price: 1899,
                stock: 50,
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=625&fit=crop"],
                rating: 4.5
            },
            {
                name: "Classic Wool Shirt",
                slug: "classic-wool-shirt",
                categoryId: manCategory._id,
                subcategoryId: manShirts._id,
                description: "Elegant wool shirt with modern fit. Perfect for formal and casual occasions.",
                price: 2499,
                stock: 35,
                image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=625&fit=crop"],
                rating: 4.7
            },
            {
                name: "Woolen Winter Jacket",
                slug: "woolen-winter-jacket",
                categoryId: manCategory._id,
                subcategoryId: manJackets._id,
                description: "Heavy-duty winter jacket made from premium wool. Keeps you warm in extreme cold.",
                price: 4999,
                stock: 25,
                image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=625&fit=crop"],
                rating: 4.8
            },
            {
                name: "Handknit Wool Sweater",
                slug: "handknit-wool-sweater",
                categoryId: manCategory._id,
                subcategoryId: manSweaters._id,
                description: "Handcrafted wool sweater with traditional patterns. Made by local artisans.",
                price: 3299,
                stock: 40,
                image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=625&fit=crop"],
                rating: 4.6
            },
            {
                name: "Striped Merino T-Shirt",
                slug: "striped-merino-tshirt",
                categoryId: manCategory._id,
                subcategoryId: manTshirts._id,
                description: "Stylish striped merino wool t-shirt. Comfortable and fashionable.",
                price: 1699,
                stock: 60,
                image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=625&fit=crop"],
                rating: 4.4
            },
            {
                name: "Formal Wool Blazer",
                slug: "formal-wool-blazer",
                categoryId: manCategory._id,
                subcategoryId: manJackets._id,
                description: "Professional wool blazer for office and formal events. Tailored fit.",
                price: 5499,
                stock: 20,
                image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&h=625&fit=crop"],
                rating: 4.9
            }
        ];
        
        // Women's Products
        const womenProducts = [
            {
                name: "Elegant Wool Dress",
                slug: "elegant-wool-dress",
                categoryId: womanCategory._id,
                subcategoryId: womanDresses._id,
                description: "Beautiful wool dress with modern design. Perfect for parties and special occasions.",
                price: 3499,
                stock: 30,
                image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=625&fit=crop"],
                rating: 4.7
            },
            {
                name: "Merino Wool Top",
                slug: "merino-wool-top",
                categoryId: womanCategory._id,
                subcategoryId: womanTops._id,
                description: "Soft merino wool top with elegant drape. Versatile and comfortable.",
                price: 2199,
                stock: 45,
                image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=625&fit=crop"],
                rating: 4.5
            },
            {
                name: "Designer Wool Jacket",
                slug: "designer-wool-jacket",
                categoryId: womanCategory._id,
                subcategoryId: womanJackets._id,
                description: "Stylish designer wool jacket. Perfect blend of fashion and warmth.",
                price: 4799,
                stock: 28,
                image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&h=625&fit=crop"],
                rating: 4.8
            },
            {
                name: "Cozy Wool Cardigan",
                slug: "cozy-wool-cardigan",
                categoryId: womanCategory._id,
                subcategoryId: womanCardigans._id,
                description: "Comfortable wool cardigan for everyday wear. Soft and warm.",
                price: 2899,
                stock: 40,
                image: "https://images.unsplash.com/photo-1517298257259-f72ccd2db392?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1517298257259-f72ccd2db392?w=500&h=625&fit=crop"],
                rating: 4.6
            },
            {
                name: "Floral Wool Dress",
                slug: "floral-wool-dress",
                categoryId: womanCategory._id,
                subcategoryId: womanDresses._id,
                description: "Beautiful floral pattern wool dress. Feminine and elegant.",
                price: 3799,
                stock: 25,
                image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=625&fit=crop"],
                rating: 4.9
            },
            {
                name: "Striped Wool Top",
                slug: "striped-wool-top",
                categoryId: womanCategory._id,
                subcategoryId: womanTops._id,
                description: "Trendy striped wool top. Casual and comfortable for daily wear.",
                price: 1999,
                stock: 50,
                image: "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=500&h=625&fit=crop",
                images: ["https://images.unsplash.com/photo-1564859228273-274232fdb516?w=500&h=625&fit=crop"],
                rating: 4.4
            }
        ];
        
        // Insert products
        await Product.deleteMany({}); // Clear existing products
        
        for (const product of menProducts) {
            await Product.create(product);
            console.log(`✓ Added: ${product.name}`);
        }
        
        for (const product of womenProducts) {
            await Product.create(product);
            console.log(`✓ Added: ${product.name}`);
        }
        
        console.log('\n✅ Sample products added successfully!');
        console.log(`Total Men's Products: ${menProducts.length}`);
        console.log(`Total Women's Products: ${womenProducts.length}`);
        console.log(`Total Products: ${menProducts.length + womenProducts.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error adding sample products:', error);
        process.exit(1);
    }
}

addSampleProducts();
