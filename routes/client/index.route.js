const homeRoutes = require("./home.route");
const productRoutes = require("./product.route");
const chatRoutes = require("./chat.route");
const userRoutes = require("./user.route");
const searchRoutes = require("./search.route");
const cartRoutes = require("./cart.route");
const checkoutRoutes = require("./checkout.route")

const categoryMiddleware = require("../../middlewares/client/category.middleware");
const userMiddleware = require("../../middlewares/client/user.middleware");
const authMiddleware = require("../../middlewares/client/auth.middleware");
const cartMiddleware = require("../../middlewares/client/cart.middleware");
const settingMiddleware = require("../../middlewares/client/setting.middleware");

module.exports = (app) => {
  app.use(categoryMiddleware.category);
  app.use(userMiddleware.infoUser);
  app.use(cartMiddleware.cartId);
  app.use(settingMiddleware.settingGeneral);

  app.use("/", homeRoutes);
  app.use("/products", productRoutes);
  app.use("/chat", authMiddleware.requireAuth, chatRoutes);
  app.use("/user", userRoutes);
  app.use("/search", searchRoutes);
  app.use("/cart", cartRoutes);
  app.use("/checkout", checkoutRoutes)
};
