const express = require("express");
const flash = require("express-flash");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const moment = require("moment");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");

const database = require("./config/database");

const systemConfig = require("./config/system");

const routeAdmin = require("./routes/client/index.route");
const route = require("./routes/admin/index.route");

database.connect();

const app = express();
const port = process.env.PORT;

//SocketIO
const server = http.createServer(app);
const io = new Server(server);
global._io = io;
//End SocketIO

//App Locals Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;

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

//TinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);

//Routes
route(app);
routeAdmin(app);
app.get("*", (req, res) => {
  res.render("client/pages/errors/404", {
    pageTitle: "404 NOT FOUND",
  })
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
