const { MongoClient, ObjectId } = require('mongodb');

async function checkCaps() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('bhagirthi-wool-crafts');
    
    // Get Man category
    const man = await db.collection('categories').findOne({ slug: 'man' });
    console.log('Man category:', man);
    
    // Get Caps subcategory
    const caps = await db.collection('subcategories').findOne({ 
        slug: 'caps',
        categoryId: man._id
    });
    console.log('\nCaps subcategory:', caps);
    
    if (!caps) {
        console.log('\nERROR: Caps subcategory not found!');
        
        // Check all subcategories for Man
        const allManSubs = await db.collection('subcategories').find({ categoryId: man._id }).toArray();
        console.log('\nAll Man subcategories:');
        allManSubs.forEach(s => console.log(`- ${s.name} (slug: ${s.slug})`));
    } else {
        // Get products with Man + Caps
        const products = await db.collection('products').find({
            categoryId: man._id,
            subcategoryId: caps._id
        }).toArray();
        
        console.log(`\nProducts with Man + Caps: ${products.length}`);
        products.forEach(p => {
            console.log(`- ${p.name}`);
        });
    }
    
    await client.close();
}

checkCaps().catch(console.error);
