const Role = require("../../models/role.model");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");

// [GET] /admin/roles
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await Role.find(find);

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

  res.render("admin/pages/roles/index", {
    pageTitle: "Nhóm quyền",
    records: records,
  });
};

// [GET] /admin/roles/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Tạo nhóm quyền",
  });
};

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("roles_create")) {
    req.body.createdBy = {
      account_id: res.locals.user.id,
    };
    const record = new Role(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  } else {
    res.send("403");
    return;
  }
};

// [DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("roles_delete")) {
    const id = req.params.id;
    // await Product.deleteOne({_id: id});
    await Role.updateOne(
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

// [GET] /admin/roles/edit/id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    let find = {
      _id: id,
      deleted: false,
    };

    const data = await Role.findOne(find);
    res.render("admin/pages/roles/edit", {
      pageTitle: "Sửa nhóm quyền",
      data: data,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("roles_edit")) {
    try {
      const id = req.params.id;
      const updateBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date(),
      };

      await Role.updateOne(
        { _id: id },
        { ...req.body, $push: { updatedBy: updateBy } }
      );

      req.flash("success", "Cập nhật nhóm quyền thành công!");
    } catch (error) {
      req.flash("error", "Cập nhật nhóm quyền thất bại!");
    }

    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/roles/detail
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const role = await Role.findOne(find);

    res.render("admin/pages/roles/detail", {
      pageTitle: role.title,
      item: role,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
  try {
    let find = {
      deleted: false,
    };

    const records = await Role.find(find);

    res.render("admin/pages/roles/permissions", {
      pageTitle: "Phân quyền",
      records: records,
    });
  } catch (error) {
    req.flash("error", "Cập nhật nhóm quyền thất bại!");
  }
};

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
  const checkPermissions = res.locals.role.permissions;
  if (checkPermissions.includes("roles_permissions")) {
    const permissions = JSON.parse(req.body.permissions);

    for (const item of permissions) {
      await Role.updateOne({ _id: item.id }, { permissions: item.permissions });
    }

    req.flash("success", "Cập nhật phân quyền thành công!");

    res.redirect("back");
  } else {
    res.send("403");
    return;
  }
};

