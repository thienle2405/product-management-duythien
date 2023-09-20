const express = require("express");
const flash = require("express-flash");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const session = require("express-session");

const database = require("./config/database");

const systemConfig = require("./config/system");

const routeAdmin = require("./routes/client/index.route");
const route = require("./routes/admin/index.route");

database.connect();

const app = express();
const port = process.env.PORT;

app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.use(methodOverride("_method"));
app.use(express.static(`${__dirname}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// Flash
app.use(cookieParser("JHGJKLKLGFLJK"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
// End Flash

//App Locaks Variables

route(app);
routeAdmin(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
