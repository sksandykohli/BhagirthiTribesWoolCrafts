const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts');

// Category Schema
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 }
}, { timestamps: true });

// Subcategory Schema
const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

// Function to generate slug from name
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single
        .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
}

async function fixSlugs() {
    try {
        console.log('🔧 Fixing slugs for Categories and Subcategories...\n');

        // Fix Categories
        const categories = await Category.find({});
        console.log(`📁 Found ${categories.length} categories`);
        
        for (const cat of categories) {
            if (!cat.slug) {
                const slug = generateSlug(cat.name);
                await Category.updateOne({ _id: cat._id }, { slug: slug });
                console.log(`  ✅ Category "${cat.name}" -> slug: "${slug}"`);
            } else {
                console.log(`  ⏭️  Category "${cat.name}" already has slug: "${cat.slug}"`);
            }
        }

        // Fix Subcategories
        const subcategories = await Subcategory.find({});
        console.log(`\n📂 Found ${subcategories.length} subcategories`);
        
        for (const sub of subcategories) {
            if (!sub.slug) {
                const slug = generateSlug(sub.name);
                await Subcategory.updateOne({ _id: sub._id }, { slug: slug });
                console.log(`  ✅ Subcategory "${sub.name}" -> slug: "${slug}"`);
            } else {
                console.log(`  ⏭️  Subcategory "${sub.name}" already has slug: "${sub.slug}"`);
            }
        }

        console.log('\n✨ All slugs fixed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed.');
    }
}

fixSlugs();
