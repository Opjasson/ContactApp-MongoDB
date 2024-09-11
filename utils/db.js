const mongoose = require("mongoose");

// connect mongodb using mongoose
mongoose
    .connect("mongodb://127.0.0.1:27017/test")
    .then(() => console.log("Connected!"));



// // Menambah 1 data 
// const contact1 =  new Contact({
//     nama : 'azmi ghazy asyrof',
//     no_Hp : '087895031524',
//     email : 'azmi@gmail.com'
// })

// Simpan ke collections
// contact1.save().then((contact)=> console.log(contact))
