const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");

const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const filterStatusHelper = require("../../helpers/filterStatus");
const createTreeHelper = require("../../helpers/createTree");
const productCategoryHelper = require("../../helpers/products-category");

const systemConfig = require("../../config/system");

// [GET] /admin/products-category
module.exports.index = async (req, res) => {
  const filterStatus = filterStatusHelper(req.query);
  let find = {
    deleted: false,
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  const objectSearch = searchHelper(req.query);
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  // const countProductsCategory = await ProductCategory.count(find);

  // let objectPagination = paginationHelper(
  //   {
  //     currentPage: 1,
  //     limitItems: 4,
  //   },
  //   req.query,
  //   countProductsCategory
  // );

  // Sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }
  // End Sort

  const records = await ProductCategory.find(find).sort(sort);
  // .limit(objectPagination.limitItems)
  // .skip(objectPagination.skip);
  // console.log(records);
  const newRecords = createTreeHelper(records);

  for (const record of records) {
    //lấy ra thông tin người tạo
    const user = await Account.findOne({
      _id: record.createdBy.account_id,
    });
    if (user) {
      record.accountFullName = user.fullName;
    }
    //Lấy ra thông tin người cập nhật
    const updatedBy = record.updatedBy.slice(-1)[0];
    if (updatedBy) {
      const userUpdated = await Account.findOne({
        _id: updatedBy.account_id,
      });
      updatedBy.accountFullName = userUpdated.fullName;
    }
  }

  res.render("admin/pages/products-category/index", {
    pageTitle: "Danh mục sản phẩm",
    records: newRecords,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    // pagination: objectPagination,
  });
};

// [PATCH] /admin/products-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("products-category_edit")) {
    const status = req.params.status;
    const id = req.params.id;

    const updateBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date(),
    };

    await ProductCategory.updateOne(
      { _id: id },
      {
        status: status,
        $push: { updatedBy: updateBy },
      }
    );

    req.flash("success", "Cập nhật trạng thái thành công!");

    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};

// [PATCH] /admin/products-category/
module.exports.changeMulti = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("products-category_edit")) {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    const updatedBy = {
      account_id: res.locals.user.id,
      updateAt: new Date(),
    };

    switch (type) {
      case "active":
        await ProductCategory.updateMany(
          { _id: { $in: ids } },
          {
            status: "active",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} danh mục sản phẩm`
        );
        break;
      case "inactive":
        await ProductCategory.updateMany(
          { _id: { $in: ids } },
          {
            status: "inactive",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} danh mục sản phẩm`
        );
        break;
      default:
        break;
      case "delete-all":
        await ProductCategory.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedAt: new Date(),
            deletedBy: {
              account_id: res.locals.user.id,
              deletedAt: new Date(),
            },
          }
        );
        req.flash("success", `Xóa thành công ${ids.length} danh mục sản phẩm`);
        break;
      case "change-position":
        for (const item of ids) {
          let [id, position] = item.split("-");
          position = parseInt(position);
          await ProductCategory.updateOne(
            { _id: id },
            {
              position: position,
              $push: { updatedBy: updatedBy },
            }
          );
        }
        req.flash(
          "success",
          `Đổi thành công vị trí ${ids.length} danh mục sản phẩm`
        );
        break;
    }
    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};

// [DELETE] /admin/products-category/delete/:id
module.exports.deleteItem = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("products-category_delete")) {
    const id = req.params.id;
    const totalProductCategory = await productCategoryHelper.getSubCategory(id);
    let totalId = [];
    totalId = totalProductCategory.map((item) => item.id);
    totalId.push(id);
    // await Product.deleteOne({_id: id});
    await ProductCategory.updateMany(
      { _id: { $in: totalId } },
      {
        $set: {
          deleted: true,
          deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
          },
        },
      }
    );
    req.flash("success", `Xóa thành công danh mục sản phẩm`);
    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await ProductCategory.find(find);
  const newRecords = createTreeHelper(records);

  res.render("admin/pages/products-category/create", {
    pageTitle: "Tạo danh mục sản phẩm",
    records: newRecords,
  });
};

// [POST] /admin/products/create

module.exports.createPost = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("products-category_create")) {
    if (req.body.position == "") {
      const count = await ProductCategory.count();
      req.body.position = count + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }

    req.body.createdBy = {
      account_id: res.locals.user.id,
    };

    const record = new ProductCategory(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await ProductCategory.findOne({
      _id: id,
      deleted: false,
    });

    const records = await ProductCategory.find({
      deleted: false,
    });
    const newRecords = createTreeHelper(records);

    res.render("admin/pages/products-category/edit", {
      pageTitle: "Chỉnh sửa danh mục sản phẩm",
      data: data,
      records: newRecords,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
  console.log(res.locals.role.permissions);
  const permissions = res.locals.role.permissions;
  if (permissions.includes("products-category_edit")) {
    const id = req.params.id;
    //Nhớ console.log(req.body); để xem định dạng đúng hay chưa
    req.body.position = parseInt(req.body.position);

    const updateBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date(),
    };

    try {
      await ProductCategory.updateOne(
        { _id: id },
        {
          ...req.body,
          $push: { updatedBy: updateBy },
        }
      );
      req.flash("success", `Cập nhật thành công!`);
    } catch (error) {
      req.flash("error", `Cập nhật thất bại!`);
    }
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/products-category/detail

module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const productCategory = await ProductCategory.findOne(find);

    res.render("admin/pages/products-category/detail", {
      pageTitle: productCategory.title,
      productCategory: productCategory,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};
