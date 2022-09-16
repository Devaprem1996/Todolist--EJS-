//jshint esversion:6.
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');
const _ = require('lodash');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
mongoose.connect('mongodb+srv://devaprem:Dev%40sep10@cluster0.c9eepgg.mongodb.net/todolistDB');




    // Setting the model
    
 

    // Creating schema.....
const itemsSchema = {

    name: {
        type: String,
    },

};

const Item = mongoose.model('item', itemsSchema);

const listsSchema = {
    name: String,
    listitems: [itemsSchema],
};
const List = mongoose.model('list', listsSchema);
 


     // Creating the default documents.....
const item1 = new Item({
    name: "Wake Up at 5AM "
});

const item2 = new Item({
    name: "go to church and pray for grace"
});

const item3 = new Item({
    name: "come and sleep till 8AM"
});

const defaultArray = [item1, item2, item3];

// coding and seting up all the feilds...

app.get("/", function (req, res) {
    
    
    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            
            Item.insertMany(defaultArray, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully created the number of docs");
                }
            });
            res.redirect('/');
        } else {
            res.render('list', { listTitle: "Today", newItem: foundItems });   
        }
    });

});

app.get('/:customRoute', function (req, res) {
    
    const customListName = _.capitalize(req.params.customRoute);
   
    List.findOne({ name: customListName }, function (err, foundlist) {
        if (!err) {
            if (!foundlist) {
                const list = new List({
                    name: customListName,
                    listitems: defaultArray,
                });
                list.save();
                res.redirect('/' + customListName);
            } else {
                res.render('list', { listTitle: foundlist.name, newItem: foundlist.listitems });
               
            }
        } 
    });
   
    
   
 });

app.post('/', function (req, res) {
    
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName,
    });

    if (listName === "today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.listitems.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
    
   
});

app.post('/delete', function (req, res) {
    const checkedItems = req.body.checkbox; 
    const listName = req.body.listName;

    if (listName === "today") {
       
        Item.findByIdAndRemove(checkedItems, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Items deleted');
                res.redirect("/");
            }
        }); 
    } else {
        List.findOneAndUpdate({ name: listName }, {$pull: { listitems: { _id: checkedItems } } }, function (err, foundList) {
            if (!err) {
                res.redirect('/' + listName);
            }
        });

    }
    
});



app.listen(3000, function(){
  console.log("Server started on port 3000.");
});