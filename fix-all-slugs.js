const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts').then(async () => {
    console.log('Connected to MongoDB');
    
    // Fix categories with bad slugs
    const Category = mongoose.model('Category', new mongoose.Schema({
        name: String,
        slug: String,
        icon: String,
        order: Number
    }));
    
    const categories = await Category.find();
    console.log('Categories found:', categories.length);
    
    for (const cat of categories) {
        const correctSlug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        console.log(`Category: ${cat.name} | Current slug: "${cat.slug}" | Correct slug: "${correctSlug}"`);
        
        if (!cat.slug || cat.slug === '-' || cat.slug !== correctSlug) {
            console.log(`  -> Fixing slug for ${cat.name}`);
            await Category.updateOne({ _id: cat._id }, { $set: { slug: correctSlug } });
        }
    }
    
    // Fix subcategories with bad slugs
    const Subcategory = mongoose.model('Subcategory', new mongoose.Schema({
        name: String,
        slug: String,
        categoryId: String,
        order: Number
    }));
    
    const subcategories = await Subcategory.find();
    console.log('\nSubcategories found:', subcategories.length);
    
    for (const sub of subcategories) {
        const correctSlug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        console.log(`Subcategory: ${sub.name} | Current slug: "${sub.slug}" | Correct slug: "${correctSlug}"`);
        
        if (!sub.slug || sub.slug === '-' || sub.slug !== correctSlug) {
            console.log(`  -> Fixing slug for ${sub.name}`);
            await Subcategory.updateOne({ _id: sub._id }, { $set: { slug: correctSlug } });
        }
    }
    
    console.log('\n✅ Done! All slugs fixed.');
    mongoose.connection.close();
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
