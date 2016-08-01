if (process.env.NODE_ENV != "production") {
	require('dotenv').config();
}

var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialectOptions: {
		ssl: true
	}
});

var Quote = sequelize.define('quote', {
	text: Sequelize.TEXT,
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	list: Sequelize.STRING
})

Quote.sync()

const app = require('express')();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
	extended: true
})); // for parsing application/x-www-form-urlencoded

app.get("/", function(req, res) {
	res.sendfile(__dirname + "/randomquote.html");
})

var port = process.env.PORT || 1234


// get all quotes in a list
app.get("/api/lists/:list_name", function(req, res) {
	res.send("hello")
})


// add a new quote to a list
app.post("/api/lists/:list_name", function(req, res) {
	console.log(req.params.list_name);
	console.log(req.body);
	if (req.params.list_name.trim() == "") {
		return res.status(400).send({
			"status": "error",
			"error": "List name cannot be blank"
		})
	} else if (!("text" in req.body)) {
		return res.status(400).send({
			"status": "error",
			"error": "Could not find `text` in request body"
		})
	} else if (req.body.text.trim() == "") {
		return res.status(400).send({
			"status": "error",
			"error": "Quotes cannot be blank"
		})
	} else if (req.body.text.trim().length > 500) {
		return res.status(400).send({
			"status": "error",
			"error": "Quotes must be less than 500 characters in length"
		})
	} else {
		Quote.create({
			text: req.body.text,
			list: req.params.list_name
		}).then(function(newQuote) {
			console.log(newQuote.get());
			res.status(201).send(Object.assign({}, newQuote.get(), {
				"status": "ok"
			}))
		})
	}
})

app.listen(port, function() {
	console.log("Listening on " + port + "...");
})
