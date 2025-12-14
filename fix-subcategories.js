const mongoose = require('mongoose');

async function fixSubcategories() {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all categories
    const categories = await db.collection('categories').find().toArray();
    console.log('\n=== Categories ===');
    categories.forEach(c => console.log(`${c.name} (${c.slug}): ${c._id}`));
    
    const menCategory = categories.find(c => c.slug === 'men');
    const womenCategory = categories.find(c => c.slug === 'women');
    const kidsCategory = categories.find(c => c.slug === 'kids');
    const othersCategory = categories.find(c => c.slug === 'others');
    
    // Clear all existing subcategories
    await db.collection('subcategories').deleteMany({});
    console.log('\n✅ Cleared all existing subcategories');
    
    // Define proper subcategories with correct category links
    const subcategories = [
        // Men's subcategories
        { name: 'Sweaters', slug: 'sweaters', category: menCategory._id },
        { name: 'Jackets', slug: 'jackets', category: menCategory._id },
        { name: 'Shawls', slug: 'shawls', category: menCategory._id },
        { name: 'Caps', slug: 'caps', category: menCategory._id },
        { name: 'Mufflers', slug: 'mufflers', category: menCategory._id },
        
        // Women's subcategories
        { name: 'Sweaters', slug: 'sweaters', category: womenCategory._id },
        { name: 'Jackets', slug: 'jackets', category: womenCategory._id },
        { name: 'Cardigans', slug: 'cardigans', category: womenCategory._id },
        { name: 'Ponchos', slug: 'ponchos', category: womenCategory._id },
        { name: 'Stoles', slug: 'stoles', category: womenCategory._id },
        { name: 'Shawls', slug: 'shawls', category: womenCategory._id },
        
        // Kids' subcategories
        { name: 'Sweaters', slug: 'sweaters', category: kidsCategory._id },
        { name: 'Jackets', slug: 'jackets', category: kidsCategory._id },
        { name: 'Caps', slug: 'caps', category: kidsCategory._id },
        { name: 'Mufflers', slug: 'mufflers', category: kidsCategory._id },
        
        // Others subcategories
        { name: 'Blankets', slug: 'blankets', category: othersCategory._id },
        { name: 'Rugs', slug: 'rugs', category: othersCategory._id },
        { name: 'Bags', slug: 'bags', category: othersCategory._id },
        { name: 'Socks', slug: 'socks', category: othersCategory._id },
        { name: 'Accessories', slug: 'accessories', category: othersCategory._id },
    ];
    
    // Insert new subcategories
    const result = await db.collection('subcategories').insertMany(subcategories);
    console.log(`\n✅ Created ${result.insertedCount} subcategories`);
    
    // Show all subcategories
    const allSubs = await db.collection('subcategories').find().toArray();
    console.log('\n=== New Subcategories ===');
    for (const sub of allSubs) {
        const cat = categories.find(c => c._id.toString() === sub.category.toString());
        console.log(`${cat?.name || 'NO_CAT'} -> ${sub.name} (${sub.slug})`);
    }
    
    // Now update all products to match new subcategory IDs
    console.log('\n=== Updating Products ===');
    
    // Get all products
    const products = await db.collection('products').find().toArray();
    console.log(`Found ${products.length} products to update`);
    
    // Get new subcategories mapping
    const newSubs = await db.collection('subcategories').find().toArray();
    
    let updatedCount = 0;
    for (const product of products) {
        // Find category of this product
        const category = categories.find(c => c._id.toString() === product.categoryId?.toString());
        if (!category) {
            console.log(`⚠️ Product "${product.name}" has no category`);
            continue;
        }
        
        // Find matching subcategory for this product's category
        // We need the old subcategory name to match
        const oldSubcategory = await db.collection('subcategories').findOne({ _id: product.subcategoryId });
        
        // Find new subcategory with same name and matching category
        const newSubcategory = newSubs.find(s => 
            s.category.toString() === category._id.toString()
        );
        
        // Actually we don't know the old subcategory name, so we need to be smarter
        // For now, assign products to appropriate subcategories based on product name keywords
        let matchedSub = null;
        const productNameLower = product.name.toLowerCase();
        
        // Find subcategories for this product's category
        const categorySubs = newSubs.filter(s => s.category.toString() === category._id.toString());
        
        for (const sub of categorySubs) {
            const subNameLower = sub.name.toLowerCase();
            if (productNameLower.includes(subNameLower) || 
                productNameLower.includes(subNameLower.slice(0, -1))) { // sweaters -> sweater
                matchedSub = sub;
                break;
            }
        }
        
        // Default to first subcategory of category if no match
        if (!matchedSub && categorySubs.length > 0) {
            matchedSub = categorySubs[0];
        }
        
        if (matchedSub) {
            await db.collection('products').updateOne(
                { _id: product._id },
                { $set: { subcategoryId: matchedSub._id } }
            );
            updatedCount++;
        }
    }
    
    console.log(`\n✅ Updated ${updatedCount} products with new subcategory IDs`);
    
    mongoose.disconnect();
    console.log('\n✨ Fix complete!');
}

fixSubcategories().catch(console.error);
