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
	if (req.params.list_name.trim() == "") {
		return res.status(400).send({
			"status": "error",
			"error": "List name cannot be blank"
		})
	} else {
		Quote.findAll({
			where: {
				list: req.params.list_name.trim()
			}
		}).then(function(results) {
			var jsonResults = [];
			for (result of results) {
				jsonResults.push(result.get())
			}
			res.send({
				"status": "ok",
				"list": req.params.list_name.trim(),
				quotes: jsonResults
			})
		})
	}
})


// add a new quote to a list
app.post("/api/lists/:list_name", function(req, res) {
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

// get a random quote from a list
app.get("/api/lists/:list_name/random", function(req, res) {
	if (req.params.list_name.trim() == "") {
		return res.status(400).send({
			"status": "error",
			"error": "List name cannot be blank"
		})
	} else {
		Quote.findOne({
			where: {
				list: req.params.list_name.trim()
			},
			order: [Sequelize.fn("RANDOM")]
		}).then(function(quote) {
			if (quote) {
				res.status(200).send(Object.assign({}, quote.get(), {
					status: "ok"
				}))
			} else {
				res.status(200).send({
					status: "ok"
				})
			}
		})
	}
})

// get a specific quote
app.get("/api/quotes/:quote_id", function(req, res) {
	var quote_id = parseInt(req.params.quote_id)
	if (isNaN(quote_id)) {
		return res.status(400).send({
			"status": "error",
			"error": "Quote id must be a number"
		})
	} else if (!("quote_id" in req.params) && (req.params.quote_id.trim() == "")) {
		return res.status(400).send({
			"status": "error",
			"error": "Quote id cannot be blank"
		})
	} else {
		// do stuff
		Quote.findById(parseInt(req.params.quote_id)).then(function(quote) {
			if (quote) {
				return res.status(200).send(Object.assign({}, quote.get(), {
					status: "ok"
				}))
			} else {
				return res.status(404).send({
					"status": "error",
					"error": "Quote not found"
				})
			}
		})
	}
})

// delete a specific quote
app.delete("/api/quotes/:quote_id", function(req, res) {
	var quote_id = parseInt(req.params.quote_id)
	if (isNaN(quote_id)) {
		return res.status(400).send({
			"status": "error",
			"error": "Quote id must be a number"
		})
	} else if (!("quote_id" in req.params) && (req.params.quote_id.trim() == "")) {
		return res.status(400).send({
			"status": "error",
			"error": "Quote id cannot be blank"
		})
	} else {
		// do stuff
		Quote.destroy({
			where: {
				id: parseInt(req.params.quote_id)
			}
		}).then(function(quote) {
			console.log(quote);
			if (quote) {
				return res.status(200).send({
					status: "ok"
				})
			} else {
				return res.status(404).send({
					"status": "error",
					"error": "Quote not found"
				})
			}
		})
	}
})


app.listen(port, function() {
	console.log("Listening on " + port + "...");
})
