const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts').then(async () => {
    const db = mongoose.connection.db;
    
    // Fix ALL categories - regenerate slug from name
    const cats = await db.collection('categories').find().toArray();
    
    for (const cat of cats) {
        const correctSlug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (cat.slug !== correctSlug) {
            await db.collection('categories').updateOne(
                { _id: cat._id },
                { $set: { slug: correctSlug } }
            );
            console.log(`Fixed: ${cat.name} -> slug: ${correctSlug} (was: ${cat.slug})`);
        }
    }
    
    // Show all categories
    const updatedCats = await db.collection('categories').find().toArray();
    console.log('\n=== All Categories ===');
    updatedCats.forEach(c => console.log(c.name, '- slug:', c.slug));
    
    mongoose.disconnect();
});
