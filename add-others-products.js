const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bhagirthi-wool-crafts', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.log('MongoDB Connection Error:', err));

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

async function addOthersProducts() {
    try {
        console.log('Fetching Others category and subcategories...\n');
        
        const othersCategory = await Category.findOne({ slug: 'others' });
        
        if (!othersCategory) {
            console.error('❌ Others category not found!');
            process.exit(1);
        }
        
        const subcategories = await Subcategory.find({ categoryId: othersCategory._id });
        
        console.log(`Found ${subcategories.length} subcategories in Others category\n`);
        
        const products = [];
        
        // Helper function
        const createProduct = (name, subcategorySlug, price, stock, imageId) => {
            const subcategory = subcategories.find(s => s.slug === subcategorySlug);
            
            if (!subcategory) {
                console.log(`⚠️  Skipping ${name} - subcategory ${subcategorySlug} not found`);
                return null;
            }
            
            return {
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                categoryId: othersCategory._id,
                subcategoryId: subcategory._id,
                description: `Premium quality ${name.toLowerCase()} made from finest wool. Handcrafted by skilled artisans from Bhagirthi region.`,
                price,
                stock,
                image: `https://images.unsplash.com/photo-${imageId}?w=500&h=625&fit=crop`,
                images: [`https://images.unsplash.com/photo-${imageId}?w=500&h=625&fit=crop`],
                rating: (Math.random() * (5 - 4) + 4).toFixed(1)
            };
        };
        
        console.log('Adding Others Products...\n');
        
        // Hand Warmers
        products.push(createProduct("Wool Hand Warmers Pair", "hand-warmers", 899, 50, "1576871337622-b2d8b64a5b3d"));
        products.push(createProduct("Fleece Lined Hand Warmers", "hand-warmers", 999, 45, "1576871337622-b2d8b64a5b3d"));
        products.push(createProduct("Fingerless Wool Gloves", "hand-warmers", 799, 60, "1576871337622-b2d8b64a5b3d"));
        products.push(createProduct("Thermal Hand Warmers", "hand-warmers", 1099, 40, "1576871337622-b2d8b64a5b3d"));
        products.push(createProduct("Knitted Hand Warmers", "hand-warmers", 849, 55, "1576871337622-b2d8b64a5b3d"));
        
        // Pashmina Shawls (saal)
        products.push(createProduct("Pure Pashmina Shawl", "pasmina salls", 8999, 20, "1610701148509-3c6b6e0e1bd6"));
        products.push(createProduct("Embroidered Pashmina Shawl", "pasmina salls", 9999, 18, "1610701148509-3c6b6e0e1bd6"));
        products.push(createProduct("Cashmere Pashmina Blend", "pasmina salls", 7999, 22, "1610701148509-3c6b6e0e1bd6"));
        products.push(createProduct("Designer Pashmina Shawl", "pasmina salls", 10999, 15, "1610701148509-3c6b6e0e1bd6"));
        products.push(createProduct("Handwoven Pashmina Shawl", "pasmina salls", 8499, 20, "1610701148509-3c6b6e0e1bd6"));
        
        // Filter null products
        const validProducts = products.filter(p => p !== null);
        
        console.log(`📦 Found ${validProducts.length} products to add\n`);
        
        // Delete existing Others products
        await Product.deleteMany({ categoryId: othersCategory._id });
        console.log('🗑️  Cleared existing Others products\n');
        
        // Insert new products
        for (const product of validProducts) {
            await Product.create(product);
            console.log(`✓ ${product.name} - ₹${product.price}`);
        }
        
        console.log('\n✅ Others category products added successfully!');
        console.log(`📊 Total Others Products: ${validProducts.length}`);
        
        // Show breakdown by subcategory
        const bySubcategory = {};
        for (const product of validProducts) {
            const sub = subcategories.find(s => s._id.toString() === product.subcategoryId.toString());
            if (sub) {
                bySubcategory[sub.name] = (bySubcategory[sub.name] || 0) + 1;
            }
        }
        
        console.log('\n📈 Products by Subcategory:');
        Object.entries(bySubcategory).forEach(([sub, count]) => {
            console.log(`   ${sub}: ${count} products`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addOthersProducts();
