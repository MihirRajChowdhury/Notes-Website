const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
mongoose.connect("mongodb+srv://admin-mihir:test123@firstcluster.pki69w8.mongodb.net/todolistDB");

const itemSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Welcome to the to-do list",
});
const item2 = new Item({
  name: "Hit the + button to add new items",
});
const item3 = new Item({
  name: "<--Hit this button to delete the item",
});

const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model("list", listSchema);

// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log(err);
//   }
//  else{
//   console.log("Successfully inserted");
// }
// });

app.get("/", (req, res) => {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added the fruits");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newItems: foundItems });
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
     if(!foundList){
      const list = new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+ customListName)
     }
      else{
        res.render("list", { listTitle: foundList.name, newItems: foundList.items });
      }
    }
    });
  });
  

app.post("/", (req, res) => {
  const itemName = req.body.item;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if(listName==="Today"){
  item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }
});

app.post("/delete", (req, res) => {
  const checkboxItemid = req.body.checkbox;
  const listName = req.body.listName;
  if(listName ==="Today"){
    Item.findByIdAndRemove({ _id: checkboxItemid }, function (err) {
      if (!err) {
        console.log("Successfully deleted the selected items");
        res.redirect("/");
      } 
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxItemid}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log("Server has been started Successfully "+PORT);
});




// List.findOne({ name: customListName }, function (err, List) {
//   if (!err) {
//     if (!List) {
//       // create new list
//       const list = new List({
//         name: customListName,
//         items: defaultItems,
//       });
//       // console.log("Doesn't exist");
//       list.save();
//     } else {
//       // show existing list
//       res.render("list", { listTitle: List.name, newItems: List.items });
//       // console.log("Exists");
//     }
//   }
// });