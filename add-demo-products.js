const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts');

// Schemas
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 }
}, { timestamps: true });

const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String },
    images: [{ type: String }],
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
    sizeOptions: [{ type: String }]
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);
const Product = mongoose.model('Product', productSchema);

// Generate slug
function generateSlug(name) {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

// Sample wool product images from Unsplash/Picsum (placeholder URLs)
const woolImages = {
    sweaters: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600',
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
        'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=600',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600'
    ],
    shawls: [
        'https://images.unsplash.com/photo-1601244005535-a48d21d951ac?w=600',
        'https://images.unsplash.com/photo-1584030373081-f37a06e1a2ab?w=600',
        'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600',
        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600',
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600'
    ],
    jackets: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
        'https://images.unsplash.com/photo-1544923246-77307dd628b9?w=600',
        'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
        'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600',
        'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=600'
    ],
    caps: [
        'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600',
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600',
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600',
        'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600',
        'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=600',
        'https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=600'
    ],
    socks: [
        'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600',
        'https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=600',
        'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600',
        'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=600',
        'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600',
        'https://images.unsplash.com/photo-1591195853866-70bf1bb0e23e?w=600'
    ],
    gloves: [
        'https://images.unsplash.com/photo-1545594861-3bef43ff2fc8?w=600',
        'https://images.unsplash.com/photo-1584184924103-e310d9a82f27?w=600',
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600',
        'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=600',
        'https://images.unsplash.com/photo-1609909710773-85839d89e0a9?w=600'
    ],
    mufflers: [
        'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600',
        'https://images.unsplash.com/photo-1609909710773-85839d89e0a9?w=600',
        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600',
        'https://images.unsplash.com/photo-1601244005535-a48d21d951ac?w=600',
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600'
    ],
    blankets: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600',
        'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'
    ]
};

// Colors for variety
const colors = ['Natural White', 'Charcoal Grey', 'Maroon', 'Navy Blue', 'Forest Green', 'Brown', 'Cream', 'Black', 'Rust Orange', 'Burgundy', 'Olive', 'Camel', 'Mustard', 'Teal'];

// Patterns
const patterns = ['Cable Knit', 'Fair Isle', 'Ribbed', 'Herringbone', 'Chevron', 'Diamond', 'Plain', 'Striped', 'Checkered', 'Traditional'];

// Get random items from array
function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Product templates
const productTemplates = {
    men: {
        sweaters: [
            'Premium Wool Pullover', 'Classic V-Neck Sweater', 'Chunky Knit Cardigan', 'Merino Wool Turtleneck',
            'Cable Knit Jumper', 'Full Sleeve Wool Sweater', 'Zipper Front Cardigan', 'Crew Neck Pullover'
        ],
        shawls: [
            'Traditional Wool Shawl', 'Pashmina Blend Stole', 'Handwoven Wool Wrap', 'Classic Men\'s Shawl'
        ],
        jackets: [
            'Wool Blend Jacket', 'Heavy Duty Winter Jacket', 'Sherpa Lined Coat', 'Quilted Wool Jacket',
            'Bomber Style Wool Jacket', 'Classic Overcoat'
        ],
        caps: [
            'Wool Beanie', 'Knitted Winter Cap', 'Traditional Pahadi Topi', 'Fleece Lined Cap'
        ],
        mufflers: [
            'Wool Muffler', 'Knitted Scarf', 'Chunky Winter Scarf', 'Striped Wool Muffler'
        ],
        socks: [
            'Wool Hiking Socks', 'Thermal Winter Socks', 'Crew Length Wool Socks', 'Heavy Duty Boot Socks'
        ],
        gloves: [
            'Wool Winter Gloves', 'Knitted Hand Gloves', 'Thermal Wool Mittens', 'Touchscreen Wool Gloves'
        ]
    },
    women: {
        sweaters: [
            'Elegant Wool Cardigan', 'Cozy Knit Pullover', 'Stylish Turtleneck Sweater', 'Embroidered Wool Top',
            'Bell Sleeve Sweater', 'Cropped Wool Cardigan', 'Oversized Knit Sweater', 'Fitted Ribbed Sweater'
        ],
        shawls: [
            'Embroidered Pashmina', 'Designer Wool Shawl', 'Floral Pattern Stole', 'Traditional Kullu Shawl',
            'Cashmere Blend Wrap', 'Wedding Special Shawl', 'Party Wear Stole'
        ],
        jackets: [
            'Wool Trench Coat', 'Stylish Winter Jacket', 'Belted Wool Coat', 'Fur Collar Jacket',
            'Slim Fit Wool Jacket', 'Long Winter Coat'
        ],
        caps: [
            'Knitted Beret', 'Wool Headband', 'Pompom Winter Cap', 'Slouchy Beanie'
        ],
        mufflers: [
            'Infinity Scarf', 'Printed Wool Stole', 'Fringed Wool Scarf', 'Delicate Knit Muffler'
        ],
        socks: [
            'Cozy Wool Socks', 'Ankle Length Wool Socks', 'Patterned Winter Socks', 'Soft Merino Socks'
        ],
        gloves: [
            'Elegant Wool Gloves', 'Fingerless Knit Gloves', 'Embellished Winter Gloves', 'Soft Wool Mittens'
        ]
    },
    kids: {
        sweaters: [
            'Colorful Kids Sweater', 'Cartoon Print Pullover', 'Hooded Wool Sweater', 'Button Front Cardigan',
            'Playful Knit Jumper', 'Warm Winter Sweater'
        ],
        jackets: [
            'Kids Winter Jacket', 'Hooded Wool Coat', 'Teddy Bear Jacket', 'Quilted Kids Jacket'
        ],
        caps: [
            'Animal Ear Beanie', 'Colorful Pompom Cap', 'Kids Wool Hat', 'Fun Character Cap'
        ],
        mufflers: [
            'Kids Wool Scarf', 'Cartoon Print Muffler', 'Soft Knit Scarf', 'Fun Pattern Muffler'
        ],
        socks: [
            'Kids Wool Socks', 'Cartoon Character Socks', 'Colorful Winter Socks', 'Soft Baby Socks'
        ],
        gloves: [
            'Kids Winter Mittens', 'String Connected Gloves', 'Colorful Wool Gloves', 'Animal Print Mittens'
        ]
    },
    others: {
        blankets: [
            'Handwoven Wool Blanket', 'Traditional Throw Blanket', 'Cozy Bed Blanket', 'Travel Wool Blanket',
            'Luxury Cashmere Blanket', 'Decorative Throw'
        ],
        accessories: [
            'Wool Laptop Sleeve', 'Knitted Phone Pouch', 'Wool Tote Bag', 'Handmade Wool Purse'
        ]
    }
};

// Descriptions
const descriptions = {
    sweaters: `<p>Experience the warmth and comfort of our premium Himalayan wool sweater. Handcrafted by skilled local artisans using traditional techniques passed down through generations.</p>
<ul>
<li>100% Pure Himalayan Wool</li>
<li>Naturally warm and breathable</li>
<li>Soft and comfortable against skin</li>
<li>Durable and long-lasting</li>
<li>Easy care - hand wash recommended</li>
</ul>
<p>Perfect for cold winters and mountain adventures. Each piece is unique with slight variations that reflect its handmade nature.</p>`,

    shawls: `<p>Wrap yourself in luxury with our exquisite handwoven wool shawl. Made from the finest Himalayan wool, this shawl combines traditional craftsmanship with timeless elegance.</p>
<ul>
<li>Premium quality wool</li>
<li>Intricate handwoven patterns</li>
<li>Lightweight yet warm</li>
<li>Versatile styling options</li>
<li>Perfect for all occasions</li>
</ul>
<p>A true piece of Himalayan heritage that adds grace to any outfit.</p>`,

    jackets: `<p>Stay warm and stylish with our premium wool jacket. Designed for harsh winters while maintaining exceptional style and comfort.</p>
<ul>
<li>Heavy-duty wool construction</li>
<li>Wind and cold resistant</li>
<li>Multiple pockets for convenience</li>
<li>Durable stitching</li>
<li>Classic timeless design</li>
</ul>
<p>Built to last through many winters while keeping you cozy and fashionable.</p>`,

    caps: `<p>Keep your head warm with our cozy wool cap. Perfect for winter outings and everyday wear during cold months.</p>
<ul>
<li>Soft wool construction</li>
<li>Comfortable fit</li>
<li>One size fits most</li>
<li>Durable and warm</li>
</ul>`,

    socks: `<p>Treat your feet to the comfort of pure wool socks. Essential for keeping warm during cold days.</p>
<ul>
<li>100% natural wool</li>
<li>Moisture-wicking properties</li>
<li>Cushioned comfort</li>
<li>Reinforced heel and toe</li>
</ul>`,

    gloves: `<p>Protect your hands from the cold with our premium wool gloves. Soft, warm, and perfectly crafted.</p>
<ul>
<li>Warm wool material</li>
<li>Flexible fit</li>
<li>Excellent grip</li>
<li>Durable construction</li>
</ul>`,

    mufflers: `<p>Add style and warmth with our handcrafted wool muffler. A perfect accessory for winter days.</p>
<ul>
<li>Soft and cozy</li>
<li>Generous length</li>
<li>Beautiful patterns</li>
<li>Versatile styling</li>
</ul>`,

    blankets: `<p>Experience ultimate comfort with our handwoven wool blanket. Perfect for cozy nights and home decor.</p>
<ul>
<li>100% natural wool</li>
<li>Handwoven by artisans</li>
<li>Warm and breathable</li>
<li>Beautiful traditional patterns</li>
<li>Perfect for gifting</li>
</ul>`
};

// Adult sizes
const adultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
// Kids sizes
const kidsSizes = ['2-3Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'];
// Accessories (no size needed)
const noSize = ['Free Size'];

async function addDemoProducts() {
    try {
        console.log('🚀 Starting to add demo products...\n');

        // First, ensure we have categories
        let menCategory = await Category.findOne({ name: /men/i });
        let womenCategory = await Category.findOne({ name: /wom[ae]n/i });
        let kidsCategory = await Category.findOne({ name: /kid/i });
        let othersCategory = await Category.findOne({ name: /other/i });

        // Create categories if they don't exist
        if (!menCategory) {
            menCategory = await Category.create({ name: 'Men', slug: 'men', icon: 'fa-male', order: 1 });
            console.log('✅ Created Men category');
        }
        if (!womenCategory) {
            womenCategory = await Category.create({ name: 'Women', slug: 'women', icon: 'fa-female', order: 2 });
            console.log('✅ Created Women category');
        }
        if (!kidsCategory) {
            kidsCategory = await Category.create({ name: 'Kids', slug: 'kids', icon: 'fa-child', order: 3 });
            console.log('✅ Created Kids category');
        }
        if (!othersCategory) {
            othersCategory = await Category.create({ name: 'Others', slug: 'others', icon: 'fa-ellipsis-h', order: 4 });
            console.log('✅ Created Others category');
        }

        // Define subcategory types per category
        const subcategoryTypes = {
            men: ['Sweaters', 'Shawls', 'Jackets', 'Caps', 'Mufflers', 'Socks', 'Gloves'],
            women: ['Sweaters', 'Shawls', 'Jackets', 'Caps', 'Mufflers', 'Socks', 'Gloves'],
            kids: ['Sweaters', 'Jackets', 'Caps', 'Mufflers', 'Socks', 'Gloves'],
            others: ['Blankets', 'Accessories']
        };

        // Create/find subcategories
        const subcategories = {
            men: {},
            women: {},
            kids: {},
            others: {}
        };

        const categoryMap = {
            men: menCategory,
            women: womenCategory,
            kids: kidsCategory,
            others: othersCategory
        };

        for (const [catKey, subTypes] of Object.entries(subcategoryTypes)) {
            const category = categoryMap[catKey];
            for (const subType of subTypes) {
                let sub = await Subcategory.findOne({ 
                    name: new RegExp(`^${subType}$`, 'i'), 
                    categoryId: category._id 
                });
                if (!sub) {
                    sub = await Subcategory.create({
                        name: subType,
                        slug: generateSlug(subType),
                        categoryId: category._id,
                        order: subTypes.indexOf(subType)
                    });
                    console.log(`✅ Created ${subType} subcategory for ${category.name}`);
                }
                subcategories[catKey][subType.toLowerCase()] = sub;
            }
        }

        console.log('\n📦 Adding products...\n');

        let productCount = 0;
        const targetProducts = 100;
        const productsToCreate = [];

        // Helper to get images for a product type
        function getProductImages(type) {
            const typeKey = type.toLowerCase();
            let imagePool = woolImages.sweaters; // default
            
            if (woolImages[typeKey]) {
                imagePool = woolImages[typeKey];
            } else if (typeKey.includes('shawl') || typeKey.includes('stole')) {
                imagePool = woolImages.shawls;
            } else if (typeKey.includes('jacket') || typeKey.includes('coat')) {
                imagePool = woolImages.jackets;
            } else if (typeKey.includes('cap') || typeKey.includes('beanie') || typeKey.includes('hat')) {
                imagePool = woolImages.caps;
            } else if (typeKey.includes('sock')) {
                imagePool = woolImages.socks;
            } else if (typeKey.includes('glove') || typeKey.includes('mitten')) {
                imagePool = woolImages.gloves;
            } else if (typeKey.includes('muffler') || typeKey.includes('scarf')) {
                imagePool = woolImages.mufflers;
            } else if (typeKey.includes('blanket') || typeKey.includes('throw')) {
                imagePool = woolImages.blankets;
            }

            // Get 5-6 random images
            const count = getRandomInt(5, 6);
            return getRandomItems(imagePool, Math.min(count, imagePool.length));
        }

        // Generate products for each category
        for (const [catKey, templates] of Object.entries(productTemplates)) {
            const category = categoryMap[catKey];
            
            for (const [subKey, names] of Object.entries(templates)) {
                const subcategory = subcategories[catKey][subKey];
                if (!subcategory) continue;

                for (const baseName of names) {
                    if (productCount >= targetProducts) break;

                    // Add color/pattern variations
                    const color = colors[getRandomInt(0, colors.length - 1)];
                    const pattern = patterns[getRandomInt(0, patterns.length - 1)];
                    
                    const productName = `${color} ${pattern} ${baseName}`;
                    const slug = generateSlug(productName) + '-' + Date.now().toString().slice(-4) + getRandomInt(100, 999);
                    
                    // Get appropriate description
                    let description = descriptions.sweaters;
                    if (descriptions[subKey]) {
                        description = descriptions[subKey];
                    }

                    // Get images
                    const images = getProductImages(subKey);
                    const mainImage = images[0];
                    const additionalImages = images.slice(1);

                    // Determine sizes
                    let sizeOptions = adultSizes;
                    if (catKey === 'kids') {
                        sizeOptions = kidsSizes;
                    } else if (subKey === 'blankets' || subKey === 'accessories') {
                        sizeOptions = noSize;
                    }

                    // Random price based on product type
                    let basePrice = 1500;
                    if (subKey === 'sweaters') basePrice = getRandomInt(1800, 3500);
                    else if (subKey === 'shawls') basePrice = getRandomInt(2500, 6000);
                    else if (subKey === 'jackets') basePrice = getRandomInt(3500, 7500);
                    else if (subKey === 'caps') basePrice = getRandomInt(450, 900);
                    else if (subKey === 'socks') basePrice = getRandomInt(250, 550);
                    else if (subKey === 'gloves') basePrice = getRandomInt(400, 850);
                    else if (subKey === 'mufflers') basePrice = getRandomInt(600, 1500);
                    else if (subKey === 'blankets') basePrice = getRandomInt(3000, 8000);
                    else if (subKey === 'accessories') basePrice = getRandomInt(500, 1500);

                    // Kids products are slightly cheaper
                    if (catKey === 'kids') {
                        basePrice = Math.floor(basePrice * 0.7);
                    }

                    productsToCreate.push({
                        name: productName,
                        slug: slug,
                        description: description,
                        price: basePrice,
                        stock: getRandomInt(5, 50),
                        image: mainImage,
                        images: additionalImages,
                        categoryId: category._id,
                        subcategoryId: subcategory._id,
                        sizeOptions: sizeOptions
                    });

                    productCount++;
                }
            }
        }

        // If we haven't reached 100, add more variations
        while (productsToCreate.length < targetProducts) {
            const categories = ['men', 'women', 'kids'];
            const catKey = categories[getRandomInt(0, categories.length - 1)];
            const category = categoryMap[catKey];
            
            const subKeys = Object.keys(subcategories[catKey]);
            const subKey = subKeys[getRandomInt(0, subKeys.length - 1)];
            const subcategory = subcategories[catKey][subKey];
            
            if (!subcategory) continue;

            const color = colors[getRandomInt(0, colors.length - 1)];
            const pattern = patterns[getRandomInt(0, patterns.length - 1)];
            const baseNames = ['Wool Product', 'Handmade Item', 'Premium Piece', 'Artisan Craft'];
            const baseName = baseNames[getRandomInt(0, baseNames.length - 1)];
            
            const productName = `${color} ${pattern} ${subKey.charAt(0).toUpperCase() + subKey.slice(1)} ${baseName}`;
            const slug = generateSlug(productName) + '-' + Date.now().toString().slice(-4) + getRandomInt(100, 999);
            
            const images = getProductImages(subKey);
            
            let sizeOptions = catKey === 'kids' ? kidsSizes : adultSizes;
            
            productsToCreate.push({
                name: productName,
                slug: slug,
                description: descriptions[subKey] || descriptions.sweaters,
                price: getRandomInt(800, 5000),
                stock: getRandomInt(5, 50),
                image: images[0],
                images: images.slice(1),
                categoryId: category._id,
                subcategoryId: subcategory._id,
                sizeOptions: sizeOptions
            });
        }

        // Insert all products
        console.log(`📝 Inserting ${productsToCreate.length} products...`);
        
        for (let i = 0; i < productsToCreate.length; i++) {
            await Product.create(productsToCreate[i]);
            if ((i + 1) % 10 === 0) {
                console.log(`   Added ${i + 1} products...`);
            }
        }

        // Summary
        const totalProducts = await Product.countDocuments();
        const totalCategories = await Category.countDocuments();
        const totalSubcategories = await Subcategory.countDocuments();

        console.log('\n✨ Demo data added successfully!\n');
        console.log('📊 Summary:');
        console.log(`   Categories: ${totalCategories}`);
        console.log(`   Subcategories: ${totalSubcategories}`);
        console.log(`   Total Products: ${totalProducts}`);
        console.log(`   New Products Added: ${productsToCreate.length}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed.');
    }
}

addDemoProducts();
