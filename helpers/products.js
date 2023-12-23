module.exports.priceNewProducts = (products) => {
  const newProducts = products.map((item) => {
    item.priceNew = parseInt((
      (item.price * (100 - item.discountPercentage)) /
      100
    ).toFixed(0));
    return item;
  });
  return newProducts;
};

module.exports.priceNewProduct = (product) => { 
  product.priceNew = ((product.price * (100 - product.discountPercentage)) / 100).toFixed(0);
};