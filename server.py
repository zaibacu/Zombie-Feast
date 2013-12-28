from bottle import route, run, template, static_file, request
import json

@route("/style/<file>")
def style(file):
	return static_file(file, root="css")

@route("/js/<script>")
def script(script):
    return static_file(script, root="js")

@route("/js/old/<script>")
def old(script):
    return static_file(script, root="js/old")

@route("/lib/<script>")
def lib(script):
    return static_file(script, root="lib")

@route("/img/<file>")
def img(file):
    return static_file(file, root="img")

@route("/")
def index():
	return static_file("index.html", root="")

@route("/game")
def game():
	return static_file("game.html", root="")

@route("/over")
def over():
	return static_file("over.html", root="")

@route("/test")
def test():
	return static_file("tests.html", root="")

@route("/scores")
def scores():
	return static_file("scores.json", root="")

@route("/save", method="POST")
def save():
	data = {}
	with open("scores.json", "r") as json_data:
		data = json.load(json_data)
		data.append(request.json)
		
	with open("scores.json", "w") as f:
		json.dump(data, f)
	return ""

run(host="192.168.1.103", port=7777)