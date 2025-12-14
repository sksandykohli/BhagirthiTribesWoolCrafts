const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts')
.then(async () => {
    const Category = mongoose.model('Category', new mongoose.Schema({ name: String, slug: String }));
    const Subcategory = mongoose.model('Subcategory', new mongoose.Schema({ 
        categoryId: mongoose.Schema.Types.ObjectId, 
        name: String, 
        slug: String 
    }));
    
    const categories = await Category.find().sort({ order: 1 });
    
    for (const cat of categories) {
        console.log(`\n${cat.name} (${cat.slug}):`);
        const subs = await Subcategory.find({ categoryId: cat._id });
        subs.forEach(s => console.log(`  - ${s.name} (${s.slug})`));
    }
    
    process.exit(0);
});
