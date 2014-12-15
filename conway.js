document.addEventListener('DOMContentLoaded', function() {
	var cells = {
			'0,2': true,
			'0,3': true,
			'0,4': true,
			'1,4': true,
			'2,3': true
		};

	(function(play) {
		var interval;
		play.addEventListener('click', function(e) {
			if (interval) {
				clearInterval(interval);
				interval = undefined;
				play.classList.add('paused');
			} else {
				interval = setInterval(iterate, 300);
				play.classList.remove('paused');
			};
		});
	})(document.getElementById('play'));

	var draw = (function(board) {
		var m, cx, cy;

		board.addEventListener('click', function(e) {
			var x = Math.floor((e.pageX - cx) / m),
				y = Math.floor((e.pageY - cy) / m),
				id = x + ',' + y;
			cells[id] = !cells[id];
			draw();
		});

		function draw() {
			var top = Infinity,
				left = Infinity,
				right = -Infinity,
				bottom = -Infinity;

			for (var id in cells) {
				var coords = coordinates(id);
				if (drawCell(coords, id)) {
					if (top > coords[1]) top = coords[1];
					if (left > coords[0]) left = coords[0];
					if (right < coords[0]) right = coords[0];
					if (bottom < coords[1]) bottom = coords[1]
				}
			}
			scale(top, right, bottom, left);

			setTimeout(function() {
				for (var id in cells)
					drawCell(coordinates(id), id);
			});
		}

		function drawCell(coords, id) {
			var element = document.getElementById(id);
			if (!element) {
				element = document.createElement('div');
				element.id = id;
				board.appendChild(element);
			} else if (!cells[id]) {
				board.removeChild(element);
				delete cells[id];
				return undefined;
			}
			element.style.top = m * coords[1] + cy + 'px';
			element.style.left = m * coords[0] + cx + 'px';
			element.style.width = element.style.height = m + 'px';
			return element;	
		}

		function scale(top, right, bottom, left) {
			bottom++; right++;
			var w = board.offsetWidth,
				h = board.offsetHeight,
				mx = w / (right - left + 2),
				my = h / (bottom - top + 2);
			m = mx < my ? mx : my;
			if (m) {
				cx = w / 2 - m * (right + left) / 2;
				cy = h / 2 - m * (bottom + top) / 2;
			} else {
				m = (w < h ? w : h) / 5;
				cx = w / 2;
				cy = h / 2;
			}
		}

		return draw;
	})(document.getElementById('life'));

	draw();

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
			if ((neighbours[id] | 1) != 3)
				cells[id] = false;
		for (id in neighbours)
			if (neighbours[id] == 3)
				cells[id] = true;
		draw();
	}

	function coordinates(id) {
		return id.split(',')
		         .map(function(x) { return parseInt(x, 10); });
	}
});