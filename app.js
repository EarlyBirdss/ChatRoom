var express = require("express"),
    http = require("http"),
    socket = require("socket.io"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    cookieParser = require("cookie-parser");

var app = express,
    service = http.Server(app),
    io = socket(http);


var GLOBAL_DATA = {
    chaters: []
};

// 解析参数
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


// 解析cookie
app.use(cookieParser());

// session
app.use(session({
    secret: "secret",
    cookie: {
        maxAge: 1000 * 60 * 60 * 1 //一个小时过期时间
    },
    resave: true,
    saveUninitialized: true
}));

// 使用ejs模板引擎
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/chatroom", function(req, res) {

    // 判断用户没有登录
    var username = req.session.username;
    if (!username) {
        res.redirect("/");
        return false;
    }

    res.render("chatroom");
    if (GLOBAL_DATA.chaters.length == 1) {
        io.on("connection", function(socket) {

            socket.broadcast.emit("chat message", "hello all," + username + "is comming!");
            socket.on("chat message", function(msg) {
                io.emit("chat message", msg);
            });
        });
    }
});

app.post("/login", function(req, res) {
    var username = req.body.username || "匿名用户";
    req.session.username = username;
    GLOBAL_DATA.chaters.push(username);

    res.redirect("chatroom");
});


http.listen(3000, function() {
    console.log("listening on *:3000");
});