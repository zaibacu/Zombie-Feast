function getScores(container){
	$.getJSON("/scores", function(result){
	scores = result.sort(function(left, right){
		return right.scores - left.scores;
	});
	var limit = 10;
	$.each(scores, function(index, item){
		if(index > limit)
			return;
		var html = "<tr><td>"+item.name+"</td><td>"+item.scores+"</td></tr>";
		container.append(html);
	});
}); 
}

