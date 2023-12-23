const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/products");

// [GET] /search
module.exports.index = async (req, res) => {
  const keyword = req.query.keyword;

  let newProducts = [];

  console.log(keyword);

  if (keyword) {
    const regex = new RegExp(keyword, "i");
    const product = await Product.find({
      title: regex,
      deleted: false,
      status: "active",
    });
    newProducts = productsHelper.priceNewProducts(product);
  }

  res.render("client/pages/search/index", {
    pageTitle: "Kết quả tìm kiếm",
    keyword: keyword,
    products: newProducts,
  });
};
