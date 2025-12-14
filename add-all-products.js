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

async function addAllProducts() {
    try {
        console.log('Fetching categories and subcategories...\n');
        
        const categories = await Category.find().sort({ order: 1 });
        const subcategories = await Subcategory.find();
        
        const products = [];
        
        // Helper function to create product
        const createProduct = (name, categorySlug, subcategorySlug, price, stock, imageId) => {
            const category = categories.find(c => c.slug === categorySlug);
            const subcategory = subcategories.find(s => s.slug === subcategorySlug && s.categoryId.toString() === category._id.toString());
            
            if (!category || !subcategory) {
                console.log(`⚠️  Skipping ${name} - category or subcategory not found`);
                return null;
            }
            
            return {
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                categoryId: category._id,
                subcategoryId: subcategory._id,
                description: `Premium quality ${name.toLowerCase()} made from finest wool. Handcrafted by skilled artisans from Bhagirthi region.`,
                price,
                stock,
                image: `https://images.unsplash.com/photo-${imageId}?w=500&h=625&fit=crop`,
                images: [`https://images.unsplash.com/photo-${imageId}?w=500&h=625&fit=crop`],
                rating: (Math.random() * (5 - 4) + 4).toFixed(1)
            };
        };
        
        // MAN'S COLLECTION
        console.log('Adding Men\'s Products...');
        
        // Men's T-Shirts
        products.push(createProduct("Premium Merino Wool T-Shirt", "man", "t-shirts", 1899, 50, "1521572163474-6864f9cf17ab"));
        products.push(createProduct("Striped Casual T-Shirt", "man", "t-shirts", 1699, 60, "1583743814966-8936f5b7be1a"));
        products.push(createProduct("V-Neck Wool T-Shirt", "man", "t-shirts", 1799, 45, "1620799140408-edc6dcb6d633"));
        
        // Men's Shirts
        products.push(createProduct("Classic Wool Shirt", "man", "shirts", 2499, 35, "1596755094514-f87e34085b2c"));
        products.push(createProduct("Formal Dress Shirt", "man", "shirts", 2799, 30, "1602810318738-d8a9a0f7f2ab"));
        products.push(createProduct("Casual Check Shirt", "man", "shirts", 2299, 40, "1602810319330-fb9e3c6f9a66"));
        
        // Men's Jackets
        products.push(createProduct("Woolen Winter Jacket", "man", "jackets", 4999, 25, "1591047139829-d91aecb6caea"));
        products.push(createProduct("Formal Wool Blazer", "man", "jackets", 5499, 20, "1507679799987-c73779587ccf"));
        products.push(createProduct("Sports Zip Jacket", "man", "jackets", 3999, 35, "1551028719-d9286f9627d3"));
        
        // Men's Sweaters
        products.push(createProduct("Handknit Wool Sweater", "man", "sweaters", 3299, 40, "1620799140408-edc6dcb6d633"));
        products.push(createProduct("Cable Knit Sweater", "man", "sweaters", 3599, 35, "1576566588028-4147f3842f27"));
        products.push(createProduct("Turtleneck Sweater", "man", "sweaters", 3199, 45, "1434389677669-e08b4cac3105"));
        
        // Men's Pants
        products.push(createProduct("Wool Trousers", "man", "pants", 2999, 40, "1506629082955-511b1e3a14f6"));
        products.push(createProduct("Casual Wool Pants", "man", "pants", 2699, 45, "1473966968600-fa801b869a1a"));
        
        // Men's Shawls
        products.push(createProduct("Kashmiri Wool Shawl", "man", "shawls", 4999, 20, "1591195853046-86de6506f6d8"));
        products.push(createProduct("Traditional Pashmina Shawl", "man", "shawls", 5999, 15, "1610701148509-3c6b6e0e1bd6"));
        
        // Men's Scarves
        products.push(createProduct("Winter Wool Scarf", "man", "scarves", 1299, 60, "1610701148509-3c6b6e0e1bd6"));
        products.push(createProduct("Striped Muffler", "man", "scarves", 999, 70, "1610384139653-0cbaa9bfbd56"));
        
        // Men's Caps
        products.push(createProduct("Woolen Winter Cap", "man", "caps", 699, 80, "1588872867923-7c9ab6fe5a56"));
        products.push(createProduct("Knitted Beanie", "man", "caps", 599, 90, "1576871337622-b2d8b64a5b3d"));
        
        // WOMAN'S COLLECTION
        console.log('Adding Women\'s Products...');
        
        // Women's Dresses
        products.push(createProduct("Elegant Wool Dress", "woman", "dresses", 3499, 30, "1595777457583-95e059d581b8"));
        products.push(createProduct("Floral Wool Dress", "woman", "dresses", 3799, 25, "1572804013309-59a88b7e92f1"));
        products.push(createProduct("A-Line Wool Dress", "woman", "dresses", 3299, 35, "1515372039744-b8f02a3ae446"));
        
        // Women's Tops
        products.push(createProduct("Merino Wool Top", "woman", "tops", 2199, 45, "1594633312681-425c7b97ccd1"));
        products.push(createProduct("Striped Wool Top", "woman", "tops", 1999, 50, "1564859228273-274232fdb516"));
        products.push(createProduct("Casual Knit Top", "woman", "tops", 1899, 55, "1591369822096-ffd140ec948f"));
        
        // Women's Jackets
        products.push(createProduct("Designer Wool Jacket", "woman", "jackets", 4799, 28, "1591369822096-ffd140ec948f"));
        products.push(createProduct("Winter Long Coat", "woman", "jackets", 5299, 22, "1539533018865-21aee7d95d45"));
        products.push(createProduct("Blazer Style Jacket", "woman", "jackets", 4299, 30, "1594633312681-425c7b97ccd1"));
        
        // Women's Cardigans
        products.push(createProduct("Cozy Wool Cardigan", "woman", "cardigans", 2899, 40, "1517298257259-f72ccd2db392"));
        products.push(createProduct("Long Button Cardigan", "woman", "cardigans", 3199, 35, "1591369822096-ffd140ec948f"));
        products.push(createProduct("Belted Cardigan", "woman", "cardigans", 3499, 30, "1515372039744-b8f02a3ae446"));
        
        // Women's Ponchos
        products.push(createProduct("Traditional Poncho", "woman", "ponchos", 3999, 25, "1610701148509-3c6b6e0e1bd6"));
        products.push(createProduct("Hooded Poncho", "woman", "ponchos", 4299, 20, "1591195853046-86de6506f6d8"));
        
        // Women's Stoles
        products.push(createProduct("Pashmina Stole", "woman", "stoles", 2999, 35, "1610701148509-3c6b6e0e1bd6"));
        products.push(createProduct("Embroidered Stole", "woman", "stoles", 3299, 30, "1591195853046-86de6506f6d8"));
        
        // Women's Shawls
        products.push(createProduct("Kashmiri Shawl", "woman", "shawls", 5999, 18, "1610701148509-3c6b6e0e1bd6"));
        products.push(createProduct("Designer Shawl", "woman", "shawls", 6499, 15, "1591195853046-86de6506f6d8"));
        
        // Women's Scarves
        products.push(createProduct("Silk Wool Scarf", "woman", "scarves", 1499, 50, "1610384139653-0cbaa9bfbd56"));
        products.push(createProduct("Printed Scarf", "woman", "scarves", 1299, 60, "1610701148509-3c6b6e0e1bd6"));
        
        // KIDS COLLECTION
        console.log('Adding Kids Products...');
        
        // Kids Sweaters
        products.push(createProduct("Kids Wool Sweater", "kids", "sweaters", 1799, 45, "1620799140408-edc6dcb6d633"));
        products.push(createProduct("Cartoon Print Sweater", "kids", "sweaters", 1899, 40, "1576566588028-4147f3842f27"));
        products.push(createProduct("Striped Kids Sweater", "kids", "sweaters", 1699, 50, "1434389677669-e08b4cac3105"));
        
        // Kids Jackets
        products.push(createProduct("Kids Winter Jacket", "kids", "jackets", 2999, 35, "1591047139829-d91aecb6caea"));
        products.push(createProduct("Hooded Kids Jacket", "kids", "jackets", 3199, 30, "1551028719-d9286f9627d3"));
        
        // Kids Cardigans
        products.push(createProduct("Button Cardigan", "kids", "cardigans", 1999, 40, "1517298257259-f72ccd2db392"));
        products.push(createProduct("Zip Cardigan", "kids", "cardigans", 2099, 38, "1591369822096-ffd140ec948f"));
        
        // Kids Hoodies
        products.push(createProduct("Wool Hoodie", "kids", "hoodies", 2299, 42, "1620799140408-edc6dcb6d633"));
        products.push(createProduct("Printed Hoodie", "kids", "hoodies", 2199, 45, "1576566588028-4147f3842f27"));
        
        // Kids Caps
        products.push(createProduct("Kids Winter Cap", "kids", "caps", 499, 80, "1588872867923-7c9ab6fe5a56"));
        products.push(createProduct("Pom Pom Cap", "kids", "caps", 599, 75, "1576871337622-b2d8b64a5b3d"));
        
        // Kids Mufflers
        products.push(createProduct("Kids Muffler", "kids", "mufflers", 799, 60, "1610384139653-0cbaa9bfbd56"));
        products.push(createProduct("Colorful Muffler", "kids", "mufflers", 899, 55, "1610701148509-3c6b6e0e1bd6"));
        
        // Kids Gloves
        products.push(createProduct("Woolen Gloves", "kids", "gloves", 399, 100, "1576871337622-b2d8b64a5b3d"));
        products.push(createProduct("Mittens for Kids", "kids", "gloves", 449, 90, "1588872867923-7c9ab6fe5a56"));
        
        // Filter out null products and insert
        const validProducts = products.filter(p => p !== null);
        
        console.log('\n📦 Clearing existing products...');
        await Product.deleteMany({});
        
        console.log('📦 Adding new products...\n');
        for (const product of validProducts) {
            await Product.create(product);
            console.log(`✓ ${product.name} - ₹${product.price}`);
        }
        
        console.log('\n✅ All products added successfully!');
        console.log(`📊 Total Products: ${validProducts.length}`);
        
        const productsByCategory = {};
        for (const product of validProducts) {
            const cat = categories.find(c => c._id.toString() === product.categoryId.toString());
            if (cat) {
                productsByCategory[cat.name] = (productsByCategory[cat.name] || 0) + 1;
            }
        }
        
        console.log('\n📈 Products by Category:');
        Object.entries(productsByCategory).forEach(([cat, count]) => {
            console.log(`   ${cat}: ${count} products`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addAllProducts();
