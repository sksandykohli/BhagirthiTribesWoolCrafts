const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts').then(async () => {
    console.log('🔧 Adding missing subcategories...\n');
    
    const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
    const existingSubcategories = await mongoose.connection.db.collection('subcategories').find({}).toArray();
    
    const menCat = categories.find(c => c.name === 'Men');
    const womenCat = categories.find(c => c.name === 'Women');
    const kidsCat = categories.find(c => c.name === 'Kids');
    const othersCat = categories.find(c => c.name === 'Others' || c.slug === 'others');
    
    // Define required subcategories for each category
    const requiredSubcategories = {
        men: ['Sweaters', 'Jackets', 'Shawls', 'Caps', 'Mufflers', 'Socks', 'Gloves'],
        women: ['Sweaters', 'Jackets', 'Cardigans', 'Ponchos', 'Stoles', 'Shawls', 'Caps', 'Mufflers', 'Socks', 'Gloves'],
        kids: ['Sweaters', 'Jackets', 'Caps', 'Mufflers', 'Socks', 'Gloves'],
        others: ['Blankets', 'Rugs', 'Bags', 'Socks', 'Gloves', 'Accessories']
    };
    
    const categoryMap = {
        men: menCat,
        women: womenCat,
        kids: kidsCat,
        others: othersCat
    };
    
    let addedCount = 0;
    
    for (const [catKey, subcatNames] of Object.entries(requiredSubcategories)) {
        const category = categoryMap[catKey];
        if (!category) {
            console.log(`⚠️ Category ${catKey} not found, skipping...`);
            continue;
        }
        
        for (const name of subcatNames) {
            const slug = name.toLowerCase().replace(/\s+/g, '-');
            
            // Check if already exists
            const exists = existingSubcategories.find(s => 
                s.categoryId.toString() === category._id.toString() && 
                s.slug === slug
            );
            
            if (!exists) {
                await mongoose.connection.db.collection('subcategories').insertOne({
                    name: name,
                    slug: slug,
                    categoryId: category._id,
                    order: subcatNames.indexOf(name),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`✅ Added: ${name} (${slug}) -> ${category.name}`);
                addedCount++;
            }
        }
    }
    
    if (addedCount === 0) {
        console.log('✅ All subcategories already exist!');
    } else {
        console.log(`\n✨ Added ${addedCount} missing subcategories!`);
    }
    
    // Show final count
    const finalSubcategories = await mongoose.connection.db.collection('subcategories').find({}).toArray();
    console.log(`\n📊 Total subcategories: ${finalSubcategories.length}`);
    
    mongoose.connection.close();
});
