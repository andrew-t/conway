document.addEventListener('DOMContentLoaded', function() {
	var cells = {
			'0,2': true,
			'0,3': true,
			'0,4': true,
			'1,4': true,
			'2,3': true
		},
		zoom = 1;

	(function(play, delayInput) {
		var interval, delay,
			style;

		for (var i = 0; i < document.styleSheets.length; ++i) {
			var rules = document.styleSheets[i].cssRules;
			for (var j = 0; j < rules.length; ++j) {
				var rule = rules[j];
				if (rule.selectorText == '#life > *')
					style = rule.style;
			}
		}

		play.addEventListener('click', function(e) {
			if (interval) {
				clearInterval(interval);
				interval = undefined;
				play.classList.add('paused');
			} else {
				interval = setInterval(iterate, delay);
				play.classList.remove('paused');
			};
		});
		delayInput.addEventListener('input', updateDelay);
		updateDelay();

		function updateDelay() {
			if (!delayInput.value) return;
			delay = delayInput.value;
			if (interval) {
				clearInterval(interval);
				interval = setInterval(iterate, delay);
			}
			style.transition = 'all ' + (delay * 0.75) + 'ms';
		}
	})(document.getElementById('play'),
	   document.getElementById('delay'));

	document.getElementById('zoom-in')
		.addEventListener('click', function(e) {
			zoom *= 1.25;
			draw();
		});
	document.getElementById('zoom-out')
		.addEventListener('click', function(e) {
			zoom *= 0.8;
			draw();
		});
	document.getElementById('zoom-reset')
		.addEventListener('click', function(e) {
			zoom = 1;
			draw();
		});

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
			if (!m)
				m = (w < h ? w : h) / 5;
			m *= zoom;
			cx = w / 2 - m * (right + left) / 2;
			cy = h / 2 - m * (bottom + top) / 2;
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