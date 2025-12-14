const axios = require('axios');
const sizesMan = ['S', 'M', 'L', 'XL', 'XXL'];
const sizesKids = ['2-3Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'];

(async () => {
  try {
    const products = (await axios.get('http://localhost:3000/api/products')).data;
    for (const p of products) {
      let opts = [];
      if ((p.categoryName || '').toLowerCase().includes('kid')) {
        opts = sizesKids.filter(() => Math.random() > 0.5);
      } else {
        opts = sizesMan.filter(() => Math.random() > 0.5);
      }
      await axios.put(`http://localhost:3000/api/products/${p._id}`, { ...p, sizeOptions: opts });
      console.log(`Updated ${p.name} with sizes: ${opts.join(', ')}`);
    }
    console.log('Random sizes updated!');
  } catch (err) {
    console.error('Error updating sizes:', err.message);
  }
})();
