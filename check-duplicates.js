const { MongoClient } = require('mongodb');

async function checkDuplicates() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('bhagirthi-wool-crafts');
    
    const categories = await db.collection('categories').find().toArray();
    console.log('Categories:');
    categories.forEach(c => console.log(`  ${c.name}: ${c._id}`));
    
    const allSubs = await db.collection('subcategories').find().toArray();
    console.log(`\nTotal subcategories in DB: ${allSubs.length}`);
    
    // Check for duplicate slugs
    const slugCounts = {};
    allSubs.forEach(s => {
        if (!slugCounts[s.slug]) slugCounts[s.slug] = [];
        slugCounts[s.slug].push({ name: s.name, categoryId: s.categoryId, _id: s._id });
    });
    
    console.log('\nDuplicate subcategory slugs:');
    Object.entries(slugCounts).forEach(([slug, items]) => {
        if (items.length > 1) {
            console.log(`\n${slug}: ${items.length} instances`);
            items.forEach(item => {
                const cat = categories.find(c => c._id.toString() === item.categoryId.toString());
                console.log(`  - ${item.name} (${cat ? cat.name : 'Unknown'}) - ID: ${item._id}`);
            });
        }
    });
    
    await client.close();
}

checkDuplicates().catch(console.error);
