const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");
const User = require("../../models/user.model");

// [GET] /admin/dashboard
module.exports.dashboard = async (req, res) => {
  const statistic = {
    categoryProduct: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    product: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    account: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    user: {
      total: 0,
      active: 0,
      inactive: 0,
    }
  };
  //Category
  statistic.categoryProduct.total = await ProductCategory.count({
    deleted: false
  });

  statistic.categoryProduct.active = await ProductCategory.count({
    status: "active",
    deleted: false
  });

  statistic.categoryProduct.inactive = await ProductCategory.count({
    status: "inactive",
    deleted: false
  });
  //Product
  statistic.product.total = await Product.count({
    deleted: false
  })

  statistic.product.active = await Product.count({
    status: "active",
    deleted: false
  })

  statistic.product.inactive = await Product.count({
    status: "inactive",
    deleted: false
  })
  // Account
  statistic.account.total = await Account.count({
    deleted: false
  })

  statistic.account.active = await Account.count({
    status: "active",
    deleted: false
  })

  statistic.account.inactive = await Account.count({
    status: "inactive",
    deleted: false
  })
  // User 
  statistic.user.total = await User.count({
    deleted: false
  })

  statistic.user.active = await User.count({
    status: "active",
    deleted: false
  })

  statistic.user.inactive = await User.count({
    status: "inactive",
    deleted: false
  })

  res.render("admin/pages/dashboard/index.pug", {
    pageTitle: "Trang chủ",
    statistic: statistic,
  });
};
