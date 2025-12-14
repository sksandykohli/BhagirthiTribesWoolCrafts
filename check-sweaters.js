const { MongoClient, ObjectId } = require('mongodb');

async function checkSweaters() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('bhagirthi-wool-crafts');
    
    // Get Man category
    const man = await db.collection('categories').findOne({ slug: 'man' });
    console.log('Man category:', man);
    
    // Get Sweaters subcategory
    const sweaters = await db.collection('subcategories').findOne({ 
        slug: 'sweaters',
        categoryId: man._id
    });
    console.log('\nSweaters subcategory:', sweaters);
    
    // Get products with Man + Sweaters
    const products = await db.collection('products').find({
        categoryId: man._id,
        subcategoryId: sweaters._id
    }).toArray();
    
    console.log(`\nProducts with Man + Sweaters: ${products.length}`);
    products.forEach(p => {
        console.log(`- ${p.name}`);
        console.log(`  categoryId: ${p.categoryId}`);
        console.log(`  subcategoryId: ${p.subcategoryId}`);
    });
    
    // Check if there are ANY Man products
    const allManProducts = await db.collection('products').find({
        categoryId: man._id
    }).toArray();
    console.log(`\nTotal Man products: ${allManProducts.length}`);
    
    // Group by subcategory
    const grouped = {};
    allManProducts.forEach(p => {
        const subId = p.subcategoryId.toString();
        if (!grouped[subId]) grouped[subId] = [];
        grouped[subId].push(p.name);
    });
    
    console.log('\nMan products by subcategory:');
    for (const [subId, products] of Object.entries(grouped)) {
        const sub = await db.collection('subcategories').findOne({ _id: new ObjectId(subId) });
        console.log(`${sub.name}: ${products.length} products`);
    }
    
    await client.close();
}

checkSweaters().catch(console.error);
