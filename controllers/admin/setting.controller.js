const SettingGeneral = require("../../models/settings-general.model");

//GET /admin/settings/general
module.exports.general = async (req, res) => {
  const settingGeneral = await SettingGeneral.findOne({});
  res.render("admin/pages/settings/general", {
    pageTitle: "Cài đặt chung",
    settingGeneral: settingGeneral,
  });
};

//PATCH /admin/settings/general
module.exports.generalPatch = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if (permissions.includes("settings_edit")) { 
    const objects = {
      websiteName: req.body.websiteName,
      logo: req.body.logo,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      copyright: req.body.copyright,
      facebook: req.body.facebook,
      instagram: req.body.instagram,
    };
  
    const settingGeneral = await SettingGeneral.findOne({});
    console.log(settingGeneral);
  
    if (settingGeneral) {
      await SettingGeneral.updateOne({
        _id: settingGeneral.id
      }, objects);
    } else {
      const record = new SettingGeneral(objects);
      await record.save();
    }
  
    req.flash("success", "Cập nhật thành công!");
  
    res.redirect("back");
  }
};