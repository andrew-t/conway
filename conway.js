document.addEventListener('DOMContentLoaded', function() {
	var cells = {
			'0,2': true,
			'0,3': true,
			'0,4': true
		};

	setInterval(function() {
		iterate();
		draw();
	}, 300);

	function iterate() {
		var neighbours = {}, id;
		function increment(x, y) {
			var id = x + ',' + y;
			if (!++neighbours[id])
				neighbours[id] = 1;
		}
		for (id in cells) {
			var coords = coordinates(id);
			increment(coords[0] - 1, coords[1] - 1);
			increment(coords[0],     coords[1] - 1);
			increment(coords[0] + 1, coords[1] - 1);
			increment(coords[0] - 1, coords[1]);
			increment(coords[0] + 1, coords[1]);
			increment(coords[0] - 1, coords[1] + 1);
			increment(coords[0],     coords[1] + 1);
			increment(coords[0] + 1, coords[1] + 1);
		}
		for (id in cells)
			if (neighbours[id] < 2 || neighbours[id] > 3)
				cells[id] = false;
		for (id in neighbours)
			if (neighbours[id] == 3)
				cells[id] = true;

	}

	var draw = (function() {
		var board = document.getElementById('life'),
			m, cx, cy;

		scale(-5, 5, 5, -5);

		function draw() {
			var top = Infinity,
				left = Infinity,
				right = -Infinity,
				bottom = -Infinity;

			for (var id in cells) {
				var coords = coordinates(id);
				if (top > coords[1]) top = coords[1];
				if (left > coords[0]) left = coords[0];
				if (right < coords[0]) right = coords[0];
				if (bottom < coords[1]) bottom = coords[1];
				var element = document.getElementById(id);
				if (!element) {
					element = document.createElement('div');
					element.id = id;
					board.appendChild(element);
				}
				element.style.top = m * coords[1] + cy + 'px';
				element.style.left = m * coords[0] + cx + 'px';
				element.style.width = element.style.height = m + 'px';
				element.className = cells[id] ? 'alive' : 'dead';
			}
			scale(top, right, bottom, left);
		}

		function scale(top, right, bottom, left) {
			bottom++; right++;
			var w = board.offsetWidth,
				h = board.offsetHeight,
				mx = w / (right - left + 2),
				my = h / (bottom - top + 2);
			m = mx < my ? mx : my;
			cx = w / 2 - m * (right + left) / 2;
			cy = h / 2 - m * (bottom + top) / 2;
		}

		return draw;
	})();

	function coordinates(id) {
		return id.split(',')
		         .map(function(x) { return parseInt(x, 10); });
	}
	
});