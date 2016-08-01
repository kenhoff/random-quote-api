const app = require('express')();

app.get("/", function (req, res) {
	res.sendfile(__dirname + "/randomquote.html");
})

app.listen(process.env.PORT || 1234, function () {
	console.log("listening on 1234");
})
