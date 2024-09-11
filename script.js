const express = require("express");

const app = express();

require("./utils/db");
const Contact = require("./model/contact");

const methodOverride = require('method-override')

app.use(methodOverride('_method'))

// set ejs
const expresLayout = require("express-ejs-layouts");
app.use(expresLayout);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// menambahkan flash notif saat data berhasil ditambahkan
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

// express validator
const { query, validationResult, body, check } = require("express-validator");

app.use(cookieParser("secret"));
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());
//---------

app.get("/", (req, res) => {
    res.render("index", {
        layout: "./layouts/mainlayot",
        title: "Home page",
        nama: "azmi ghazy asyrof",
        alamat: "jalan pala2 timur",
    });
});

app.get("/about", (req, res) => {
    res.render("about", {
        layout: "./layouts/mainlayot",
        title: "About page",
    });
});

app.get("/contact", async (req, res) => {
    const contact = await Contact.find();
    res.render("contact", {
        layout: "./layouts/mainlayot",
        contact,
        title: "Home contact",
        msg: req.flash("msg"),
    });
});

app.post(
    "/contact",
    [
        check("email", "Masukan sesuai format penulisan email!").isEmail(),
        check(
            "no_Hp",
            "Masukan sesuai format penulisan No_Hp(08)"
        ).isMobilePhone("id-ID"),
        body("nama").custom(async (value) => {
            const contact = await Contact.findOne({ nama: value });
            if (contact) {
                throw new Error("nama sudah ada!");
            }
            return true;
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("add", {
                layout: "./layouts/mainlayot",
                title: "add contact",
                errors: errors.array(),
            });
        } else {
            await Contact.insertMany(req.body);
            req.flash("msg", "Data berhasil ditambahkan");
            res.redirect("/contact");
        }
    }
);

app.get("/contact/add", (req, res) => {
    res.render("add", {
        layout: "./layouts/mainlayot",
        title: "Add contact",
    });
});

app.delete("/contact", async (req, res) => {
    await Contact.deleteOne({ nama: req.body.nama });
    req.flash("msg", "Data berhasil dihapus");
    res.redirect("/contact")
});

app.get("/contact/edit/:nama", async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama });
    const dataContact = req.body
    const updateData = await Contact.findOneAndUpdate({nama : req.params.nama},dataContact)
    res.render("edit", {
        layout: "./layouts/mainlayot",
        title: "edit contact",
        contact,

    });
});

app.put("/contact",[
    check("email", "Email yang anda masukan salah").isEmail(),
    check("no_Hp", "Nomor yang anda masukan salah").isMobilePhone("id-ID"),
    body("nama").custom( async (value, { req }) => {
        const duplikasi = await Contact.findOne({ nama: value });
        if (value !== req.body.oldNama && duplikasi) {
            throw new Error("Nama sudah digunakan!");
        }
        return true;
    }),
], async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("edit", {
                layout: "./layouts/mainlayot",
                title: "edit contact",
                errors: errors.array(),
                contact : req.body
            });
        } else {
            await Contact.updateOne(
                {
                    _id : req.body._id
                },
                {
                    $set : {
                        nama : req.body.nama,
                        no_Hp : req.body.no_Hp,
                        email : req.body.email
                    }
                }
            ).then((result) => { 
                req.flash("msg", "Data berhasil diubah");
                res.redirect("/contact");
            });
        }
    });

app.get("/contact/:nama", async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama });
    res.render("detail", {
        layout: "./layouts/mainlayot",
        contact,
        title: "Home detail contact",
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Port running in : ${port}`);
});
