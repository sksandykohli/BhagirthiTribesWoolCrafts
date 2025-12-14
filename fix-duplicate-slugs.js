const { MongoClient } = require('mongodb');

async function fixDuplicateSlugs() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('bhagirthi-wool-crafts');
    
    const categories = await db.collection('categories').find().toArray();
    const subcategories = await db.collection('subcategories').find().toArray();
    
    console.log('Fixing duplicate slugs...\n');
    
    for (const sub of subcategories) {
        const category = categories.find(c => c._id.toString() === sub.categoryId.toString());
        if (!category) continue;
        
        // Create unique slug: category-slug + subcategory-slug
        const newSlug = `${category.slug}-${sub.slug}`;
        
        if (newSlug !== sub.slug) {
            await db.collection('subcategories').updateOne(
                { _id: sub._id },
                { $set: { slug: newSlug } }
            );
            console.log(`Updated: ${sub.name} (${category.name}) from "${sub.slug}" to "${newSlug}"`);
        }
    }
    
    console.log('\n✅ All subcategory slugs updated!');
    
    // Now update products to use new subcategory slugs (products store subcategoryId, so no change needed)
    console.log('\n✅ Products already use subcategoryId, no update needed!');
    
    await client.close();
}

fixDuplicateSlugs().catch(console.error);
