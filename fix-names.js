const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts').then(async () => {
    console.log('🔧 Updating category names...\n');
    
    // Update Man to Men
    const menResult = await mongoose.connection.db.collection('categories').updateMany(
        { name: 'Man' },
        { $set: { name: 'Men', slug: 'men' } }
    );
    console.log(`✅ Man -> Men: ${menResult.modifiedCount} updated`);
    
    // Update Woman to Women  
    const womenResult = await mongoose.connection.db.collection('categories').updateMany(
        { name: 'Woman' },
        { $set: { name: 'Women', slug: 'women' } }
    );
    console.log(`✅ Woman -> Women: ${womenResult.modifiedCount} updated`);
    
    console.log('\n✨ Database categories updated!');
    mongoose.connection.close();
});
