const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");

const filterOrderHelper = require("../../helpers/filterOrder");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const createTreeHelper = require("../../helpers/createTree");

const systemConfig = require("../../config/system");

// [GET] /admin/products
module.exports.index = async (req, res) => {
  const filterOrder = filterOrderHelper(req.query);
  let find = {
    deleted: false,
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  const objectSearch = searchHelper(req.query);

  if (objectSearch.regex) {
    find["userInfo.phone"] = objectSearch.regex;
  }

  const records = await Order.find(find);

  for (record of records) {
    let total = 0;
    let string = "Đơn hàng bao gồm: ";
    let productDetails = [];
    //Lấy ra thông tin người cập nhật
    const updatedBy = record.updatedBy.slice(-1)[0];
    if (updatedBy) {
      const userUpdated = await Account.findOne({
        _id: updatedBy.account_id,
      });
      updatedBy.accountFullName = userUpdated.fullName;
    }

    for (product of record.products) {
      const nameOrder = await Product.findOne({
        _id: product.product_id,
      }).select("title");

      productDetails.push(`${nameOrder.title} (số lượng: ${product.quantity})`);
      total +=
        product.quantity *
        (product.price * (1 - product.discountPercentage / 100));
    }

    if (productDetails.length > 0) {
      string += productDetails.join(", ") + ".";
    } else {
      string = "Đơn hàng không có sản phẩm.";
    }

    record.nameOrder = string;
    record.totalPrice = total.toFixed(0);
  }
  res.render("admin/pages/orders/index.pug", {
    pageTitle: "Danh sách đơn hàng",
    records: records,
    filterOrder: filterOrder,
    keyword: objectSearch.keyword,
  });
};

// [PATCH] /admin/products/
module.exports.changeMulti = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("orders_edit")) {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    const updatedBy = {
      account_id: res.locals.user.id,
      updateAt: new Date(),
    };

    switch (type) {
      case "pending":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            status: "pending",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm`
        );
        break;
      case "confirmed":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            status: "confirmed",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm`
        );
        break;
      case "shipping":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            status: "shipping",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm`
        );
        break;
      case "delivered":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            status: "delivered",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm`
        );
        break;
      case "cancelled":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            status: "cancelled",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm`
        );
        break;
      case "refunded":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            status: "refunded",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm`
        );
        break;
      case "delete-all":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            // deletedAt: new Date(),
            deletedBy: {
              account_id: res.locals.user.id,
              deletedAt: new Date(),
            },
          }
        );
        req.flash("success", `Xóa thành công ${ids.length} sản phẩm`);
        break;
    }
    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};
