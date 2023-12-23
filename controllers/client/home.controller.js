const ProductCategory = require("../../models/product-category.model");

const Product = require("../../models/product.model");

const createTreeHelper = require("../../helpers/createTree");
const productsHelper = require("../../helpers/products");

// [GET] /
module.exports.index = async (req, res) => {
  const productsFeatured = await Product.find({
    featured: "1",
    deleted: false,
    status: "active"
  });

  const newProducts = productsHelper.priceNewProducts(productsFeatured);

  // Hiển thị sản phẩm mới nhất
  const productsNew = await Product.find({
    deleted: false,
    status: "active",
  }).sort({position: "desc"}).limit(6);

  res.render("client/pages/home/index.pug", {
    pageTitle: "Trang chủ",
    productsFeatured: newProducts,
    productsNew: productsNew,
  });
};
