const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts')
.then(async () => {
    const banners = [
        '/uploads/banners/banner-1764956655974-672303438.png',
        '/uploads/banners/banner-1764956660472-20328490.png',
        '/uploads/banners/banner-1764956670127-416406127.png',
        '/uploads/banners/banner-1764956672751-898166840.png'
    ];
    
    await mongoose.connection.db.collection('settings').updateOne(
        { key: 'homepage_banners' },
        { $set: { value: banners, updatedAt: new Date() } }
    );
    
    console.log('Banners updated to uploaded files!');
    console.log('URLs:', banners);
    mongoose.disconnect();
})
.catch(err => console.error(err));
