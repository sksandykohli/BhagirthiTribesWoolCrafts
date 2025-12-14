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

const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

// Menu structure from your HTML
const menuData = {
    man: {
        name: 'Man',
        slug: 'man',
        icon: 'fa-user',
        order: 1,
        subcategories: [
            { name: 'T-Shirts', slug: 't-shirts', order: 1 },
            { name: 'Shirts', slug: 'shirts', order: 2 },
            { name: 'Jackets', slug: 'jackets', order: 3 },
            { name: 'Sweaters', slug: 'sweaters', order: 4 },
            { name: 'Pants', slug: 'pants', order: 5 },
            { name: 'Shawls', slug: 'shawls', order: 6 },
            { name: 'Scarves', slug: 'scarves', order: 7 },
            { name: 'Caps', slug: 'caps', order: 8 }
        ]
    },
    woman: {
        name: 'Woman',
        slug: 'woman',
        icon: 'fa-user-female',
        order: 2,
        subcategories: [
            { name: 'Dresses', slug: 'dresses', order: 1 },
            { name: 'Tops', slug: 'tops', order: 2 },
            { name: 'Jackets', slug: 'jackets', order: 3 },
            { name: 'Cardigans', slug: 'cardigans', order: 4 },
            { name: 'Ponchos', slug: 'ponchos', order: 5 },
            { name: 'Stoles', slug: 'stoles', order: 6 },
            { name: 'Shawls', slug: 'shawls', order: 7 },
            { name: 'Scarves', slug: 'scarves', order: 8 }
        ]
    },
    kids: {
        name: 'Kids',
        slug: 'kids',
        icon: 'fa-child',
        order: 3,
        subcategories: [
            { name: 'Sweaters', slug: 'sweaters', order: 1 },
            { name: 'Jackets', slug: 'jackets', order: 2 },
            { name: 'Cardigans', slug: 'cardigans', order: 3 },
            { name: 'Hoodies', slug: 'hoodies', order: 4 },
            { name: 'Caps', slug: 'caps', order: 5 },
            { name: 'Mufflers', slug: 'mufflers', order: 6 },
            { name: 'Gloves', slug: 'gloves', order: 7 }
        ]
    },
    allProducts: {
        name: 'All Products',
        slug: 'all-products',
        icon: 'fa-th',
        order: 4,
        subcategories: [
            { name: 'Featured Products', slug: 'featured', order: 1 },
            { name: 'New Arrivals', slug: 'new-arrivals', order: 2 },
            { name: 'Best Sellers', slug: 'bestsellers', order: 3 },
            { name: 'Sale Items', slug: 'sale', order: 4 }
        ]
    },
    others: {
        name: 'Others',
        slug: 'others',
        icon: 'fa-ellipsis-h',
        order: 5,
        subcategories: [
            { name: 'Blankets', slug: 'blankets', order: 1 },
            { name: 'Cushion Covers', slug: 'cushions', order: 2 },
            { name: 'Rugs', slug: 'rugs', order: 3 },
            { name: 'Throws', slug: 'throws', order: 4 },
            { name: 'Bags', slug: 'bags', order: 5 },
            { name: 'Socks', slug: 'socks', order: 6 },
            { name: 'Hand Warmers', slug: 'hand-warmers', order: 7 }
        ]
    }
};

async function initializeMenuData() {
    try {
        // Clear existing data
        console.log('Clearing existing categories and subcategories...');
        await Category.deleteMany({});
        await Subcategory.deleteMany({});
        
        console.log('Creating categories and subcategories...');
        
        for (const [key, data] of Object.entries(menuData)) {
            // Create category
            const category = new Category({
                name: data.name,
                slug: data.slug,
                icon: data.icon,
                order: data.order
            });
            await category.save();
            console.log(`✓ Created category: ${data.name}`);
            
            // Create subcategories
            for (const sub of data.subcategories) {
                const subcategory = new Subcategory({
                    categoryId: category._id,
                    name: sub.name,
                    slug: sub.slug,
                    order: sub.order
                });
                await subcategory.save();
                console.log(`  ✓ Created subcategory: ${sub.name}`);
            }
        }
        
        console.log('\n✅ Menu data initialized successfully!');
        console.log(`Total Categories: ${Object.keys(menuData).length}`);
        console.log(`Total Subcategories: ${Object.values(menuData).reduce((sum, cat) => sum + cat.subcategories.length, 0)}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error initializing menu data:', error);
        process.exit(1);
    }
}

initializeMenuData();
