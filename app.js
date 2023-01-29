//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://admin-safadi:safadi95@cluster0.zompqse.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your Todo list!"
});

const item2 = new Item({
  name: "Hit the + to add a new item"
});

const item3 = new Item({
  name: "<--- Tick to delete done items"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    };
  });
});


app.get("/:newCustomList", function (req, res) {
  const newCustomList = _.capitalize(req.params.newCustomList);

  List.findOne({ name: newCustomList }, function (err, foundList) {
    if (!err) {
      if (foundList) {
        console.log(newCustomList + " exists");
        res.render("List", { listTitle: foundList.name, newListItems: foundList.items })
      } else {
        const list = new List({
          name: newCustomList,
          items: defaultItems
        });
        list.save();
        console.log(newCustomList + " doesnt exist created new list");
        res.redirect("/" + newCustomList)
      };
    };
  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Success in deletion");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});