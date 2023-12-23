const md5 = require("md5");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

const systemConfig = require("../../config/system");

// [GET] /admin/accounts
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
    find.fullName = objectSearch.regex;
  }

  const countAccount = await Account.count(find);

  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countAccount
  );

  // Sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }
  // End Sort

  const records = await Account.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    .select("-password -token");

  for (const record of records) {
    const role = await Role.findOne({
      _id: record.role_id,
      deleted: false,
    });
    record.role = role;
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

  res.render("admin/pages/accounts/index", {
    pageTitle: "Danh sách tài khoản",
    records: records,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

// [PATCH] /admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("accounts_edit")) {
    const status = req.params.status;
    const id = req.params.id;

    const updateBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date(),
    };

    await Account.updateOne(
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

// [PATCH] /admin/accounts/
module.exports.changeMulti = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("accounts_edit")) {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    const updatedBy = {
      account_id: res.locals.user.id,
      updateAt: new Date(),
    };

    switch (type) {
      case "active":
        await Account.updateMany(
          { _id: { $in: ids } },
          {
            status: "active",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} tài khoản`
        );
        break;
      case "inactive":
        await Account.updateMany(
          { _id: { $in: ids } },
          {
            status: "inactive",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} tài khoản`
        );
        break;
      default:
        break;
      case "delete-all":
        await Account.updateMany(
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
        req.flash("success", `Xóa thành công ${ids.length} tài khoản`);
        break;
    }
    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};

// [DELETE] /admin/accounts/delete/:id
module.exports.deleteItem = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("accounts_delete")) {
    const id = req.params.id;
    // await Product.deleteOne({_id: id});
    await Account.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: {
          account_id: res.locals.user.id,
          deletedAt: new Date(),
        },
      }
    );
    req.flash("success", `Xóa thành công sản phẩm`);
    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
  const roles = await Role.find({
    deleted: false,
  });

  res.render("admin/pages/accounts/create", {
    pageTitle: "Tạo mới tài khoản",
    roles: roles,
  });
};

// [POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("accounts_create")) {
    const emailExist = await Account.findOne({
      email: req.body.email,
      deleted: false,
    });

    if (emailExist) {
      req.flash("error", `Email ${req.body.email} đã tồn tại`);
      res.redirect("back");
    } else {
      req.body.password = md5(req.body.password);

      const record = new Account(req.body);
      await record.save();

      res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const data = await Account.findOne(find);
    const roles = await Role.find({
      deleted: false,
    });

    res.render("admin/pages/accounts/edit.pug", {
      pageTitle: "Chỉnh sửa tài khoản",
      data: data,
      roles: roles,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    req.flash("error", `sản phẩm không tồn tại`);
  }
};

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("accounts_edit")) {
    const id = req.params.id;

    const emailExist = await Account.findOne({
      _id: { $ne: id },
      email: req.body.email,
      deleted: false,
    });

    if (emailExist) {
      req.flash("error", `Email ${req.body.email} đã tồn tại`);
    } else {
      if (req.body.password) {
        req.body.password = md5(req.body.password);
      } else {
        delete req.body.password;
      }

      await Account.updateOne({ _id: id }, req.body);

      req.flash("success", "Cập nhật tài khoản thành công!");
    }

    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/products/detail
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const account = await Account.findOne(find);

    const role = await Role.findOne({
      _id: account.role_id,
      deleted: false,
    });
    account.role = role;

    res.render("admin/pages/accounts/detail", {
      pageTitle: account.fullName,
      account: account,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
  }
};
