const mongoose = require('mongoose');

async function completeFix() {
    await mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts');
    console.log('Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Get all categories
    const categories = await db.collection('categories').find().toArray();
    console.log('=== Categories ===');
    categories.forEach(c => console.log(`${c.name} (${c.slug}): ${c._id}`));
    
    // Get category IDs
    const menCat = categories.find(c => c.slug === 'men');
    const womenCat = categories.find(c => c.slug === 'women');
    const kidsCat = categories.find(c => c.slug === 'kids');
    const othersCat = categories.find(c => c.slug === 'others');
    
    // Delete all subcategories and recreate properly
    await db.collection('subcategories').deleteMany({});
    console.log('\n✅ Cleared all subcategories');
    
    // Create proper subcategories with categoryId and slug
    const subcategories = [
        // Men
        { categoryId: menCat._id, name: 'Sweaters', slug: 'sweaters', order: 1 },
        { categoryId: menCat._id, name: 'Jackets', slug: 'jackets', order: 2 },
        { categoryId: menCat._id, name: 'Shawls', slug: 'shawls', order: 3 },
        { categoryId: menCat._id, name: 'Caps', slug: 'caps', order: 4 },
        { categoryId: menCat._id, name: 'Mufflers', slug: 'mufflers', order: 5 },
        
        // Women
        { categoryId: womenCat._id, name: 'Sweaters', slug: 'sweaters', order: 1 },
        { categoryId: womenCat._id, name: 'Jackets', slug: 'jackets', order: 2 },
        { categoryId: womenCat._id, name: 'Cardigans', slug: 'cardigans', order: 3 },
        { categoryId: womenCat._id, name: 'Ponchos', slug: 'ponchos', order: 4 },
        { categoryId: womenCat._id, name: 'Stoles', slug: 'stoles', order: 5 },
        { categoryId: womenCat._id, name: 'Shawls', slug: 'shawls', order: 6 },
        
        // Kids
        { categoryId: kidsCat._id, name: 'Sweaters', slug: 'sweaters', order: 1 },
        { categoryId: kidsCat._id, name: 'Jackets', slug: 'jackets', order: 2 },
        { categoryId: kidsCat._id, name: 'Caps', slug: 'caps', order: 3 },
        { categoryId: kidsCat._id, name: 'Mufflers', slug: 'mufflers', order: 4 },
        
        // Others
        { categoryId: othersCat._id, name: 'Blankets', slug: 'blankets', order: 1 },
        { categoryId: othersCat._id, name: 'Rugs', slug: 'rugs', order: 2 },
        { categoryId: othersCat._id, name: 'Bags', slug: 'bags', order: 3 },
        { categoryId: othersCat._id, name: 'Socks', slug: 'socks', order: 4 },
        { categoryId: othersCat._id, name: 'Accessories', slug: 'accessories', order: 5 },
    ];
    
    const result = await db.collection('subcategories').insertMany(subcategories);
    console.log(`✅ Created ${result.insertedCount} subcategories\n`);
    
    // Get new subcategories
    const newSubs = await db.collection('subcategories').find().toArray();
    console.log('=== New Subcategories ===');
    newSubs.forEach(s => {
        const cat = categories.find(c => c._id.toString() === s.categoryId.toString());
        console.log(`${cat?.name} -> ${s.name} (${s.slug})`);
    });
    
    // Now update products with correct subcategoryId
    console.log('\n=== Updating Products ===');
    const products = await db.collection('products').find().toArray();
    console.log(`Found ${products.length} products`);
    
    let updatedCount = 0;
    for (const product of products) {
        // Find product's category
        const productCatId = product.categoryId?.toString();
        if (!productCatId) continue;
        
        // Find subcategories for this category
        const catSubs = newSubs.filter(s => s.categoryId.toString() === productCatId);
        if (catSubs.length === 0) continue;
        
        // Match by product name keywords
        const nameLower = product.name.toLowerCase();
        let matchedSub = null;
        
        for (const sub of catSubs) {
            const subNameLower = sub.name.toLowerCase();
            // Check if product name contains subcategory name
            if (nameLower.includes(subNameLower) || 
                nameLower.includes(subNameLower.slice(0, -1)) || // sweaters -> sweater
                nameLower.includes(subNameLower.replace(/s$/, ''))) { // caps -> cap
                matchedSub = sub;
                break;
            }
        }
        
        // Default to first subcategory if no match
        if (!matchedSub) {
            matchedSub = catSubs[0];
        }
        
        await db.collection('products').updateOne(
            { _id: product._id },
            { $set: { subcategoryId: matchedSub._id } }
        );
        updatedCount++;
    }
    
    console.log(`✅ Updated ${updatedCount} products\n`);
    
    // Verify
    console.log('=== Verification ===');
    for (const cat of [menCat, womenCat, kidsCat, othersCat]) {
        const catSubs = newSubs.filter(s => s.categoryId.toString() === cat._id.toString());
        console.log(`\n${cat.name}:`);
        for (const sub of catSubs) {
            const count = await db.collection('products').countDocuments({ subcategoryId: sub._id });
            console.log(`  ${sub.name} (${sub.slug}): ${count} products`);
        }
    }
    
    await mongoose.disconnect();
    console.log('\n✨ Complete fix done!');
}

completeFix().catch(console.error);
