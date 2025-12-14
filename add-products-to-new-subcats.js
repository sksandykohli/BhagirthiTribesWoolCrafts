const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts').then(async () => {
    console.log('🔧 Adding products to new subcategories...\n');
    
    const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
    const subcategories = await mongoose.connection.db.collection('subcategories').find({}).toArray();
    
    const womenCat = categories.find(c => c.name === 'Women');
    const othersCat = categories.find(c => c.name === 'Others' || c.slug === 'others');
    
    // Find new subcategories
    const cardigansSub = subcategories.find(s => s.slug === 'cardigans' && s.categoryId.toString() === womenCat._id.toString());
    const ponchosSub = subcategories.find(s => s.slug === 'ponchos' && s.categoryId.toString() === womenCat._id.toString());
    const stolesSub = subcategories.find(s => s.slug === 'stoles' && s.categoryId.toString() === womenCat._id.toString());
    const rugsSub = subcategories.find(s => s.slug === 'rugs' && s.categoryId?.toString() === othersCat?._id.toString());
    const bagsSub = subcategories.find(s => s.slug === 'bags' && s.categoryId?.toString() === othersCat?._id.toString());
    
    const woolImages = [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600',
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600'
    ];
    
    const colors = ['Natural White', 'Charcoal Grey', 'Maroon', 'Navy Blue', 'Forest Green', 'Brown'];
    const patterns = ['Cable Knit', 'Fair Isle', 'Ribbed', 'Plain', 'Striped'];
    
    const newProducts = [];
    
    // Women's Cardigans
    if (cardigansSub) {
        for (let i = 0; i < 5; i++) {
            newProducts.push({
                name: `${colors[i % colors.length]} ${patterns[i % patterns.length]} Wool Cardigan`,
                slug: `wool-cardigan-${Date.now()}-${i}`,
                description: '<p>Elegant wool cardigan for women. Soft, warm, and stylish.</p>',
                price: 2500 + (i * 300),
                stock: 15 + i,
                image: woolImages[i % woolImages.length],
                images: woolImages.slice(1, 4),
                categoryId: womenCat._id,
                subcategoryId: cardigansSub._id,
                sizeOptions: ['S', 'M', 'L', 'XL', 'XXL']
            });
        }
        console.log('✅ Added 5 Cardigans for Women');
    }
    
    // Women's Ponchos
    if (ponchosSub) {
        for (let i = 0; i < 5; i++) {
            newProducts.push({
                name: `${colors[(i+1) % colors.length]} ${patterns[(i+2) % patterns.length]} Wool Poncho`,
                slug: `wool-poncho-${Date.now()}-${i}`,
                description: '<p>Beautiful wool poncho. Perfect for layering in cold weather.</p>',
                price: 3500 + (i * 400),
                stock: 10 + i,
                image: woolImages[(i+1) % woolImages.length],
                images: woolImages.slice(2, 5),
                categoryId: womenCat._id,
                subcategoryId: ponchosSub._id,
                sizeOptions: ['Free Size']
            });
        }
        console.log('✅ Added 5 Ponchos for Women');
    }
    
    // Women's Stoles
    if (stolesSub) {
        for (let i = 0; i < 5; i++) {
            newProducts.push({
                name: `${colors[(i+2) % colors.length]} ${patterns[(i+1) % patterns.length]} Wool Stole`,
                slug: `wool-stole-${Date.now()}-${i}`,
                description: '<p>Elegant wool stole. Adds grace to any outfit.</p>',
                price: 1800 + (i * 200),
                stock: 20 + i,
                image: woolImages[(i+2) % woolImages.length],
                images: woolImages.slice(0, 3),
                categoryId: womenCat._id,
                subcategoryId: stolesSub._id,
                sizeOptions: ['Free Size']
            });
        }
        console.log('✅ Added 5 Stoles for Women');
    }
    
    // Others - Rugs
    if (rugsSub && othersCat) {
        for (let i = 0; i < 3; i++) {
            newProducts.push({
                name: `${colors[i % colors.length]} Handwoven Wool Rug`,
                slug: `wool-rug-${Date.now()}-${i}`,
                description: '<p>Beautiful handwoven wool rug. Traditional craftsmanship.</p>',
                price: 5000 + (i * 1000),
                stock: 5 + i,
                image: woolImages[(i+3) % woolImages.length],
                images: woolImages.slice(1, 4),
                categoryId: othersCat._id,
                subcategoryId: rugsSub._id,
                sizeOptions: ['Small', 'Medium', 'Large']
            });
        }
        console.log('✅ Added 3 Rugs');
    }
    
    // Others - Bags
    if (bagsSub && othersCat) {
        for (let i = 0; i < 3; i++) {
            newProducts.push({
                name: `${colors[(i+1) % colors.length]} Wool Tote Bag`,
                slug: `wool-bag-${Date.now()}-${i}`,
                description: '<p>Stylish wool tote bag. Eco-friendly and durable.</p>',
                price: 1200 + (i * 300),
                stock: 12 + i,
                image: woolImages[(i+4) % woolImages.length],
                images: woolImages.slice(2, 5),
                categoryId: othersCat._id,
                subcategoryId: bagsSub._id,
                sizeOptions: ['Free Size']
            });
        }
        console.log('✅ Added 3 Bags');
    }
    
    // Insert all products
    if (newProducts.length > 0) {
        await mongoose.connection.db.collection('products').insertMany(newProducts);
        console.log(`\n✨ Total ${newProducts.length} new products added!`);
    }
    
    mongoose.connection.close();
});
