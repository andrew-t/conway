document.addEventListener('DOMContentLoaded', function() {
	var cells,
		zoom = 1;

	var player = (function(play, delayInput, step) {
		var interval, delay,
			style,
			self = {
				play: function play() {
					interval = setInterval(self.step, delay);
					document.body.classList.remove('paused');
					self.paused = false;
				},
				pause: function pause() {
					clearInterval(interval);
					self.paused = true;
					interval = undefined;
					document.body.classList.add('paused');
					updateHash();
				},
				step: function step() {
					if (cells.length == 0) {
						player.pause();
						return;
					}
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
				},
				paused: true
			};

		for (var i = 0; i < document.styleSheets.length; ++i) {
			var rules = document.styleSheets[i].cssRules;
			if (rules) for (var j = 0; j < rules.length; ++j) {
				var rule = rules[j];
				if (rule.selectorText == '#life > *')
					style = rule.style;
			}
		}
		if (!style) console.log('ERROR: Stylesheet not found.');

		play.addEventListener('click', function() {
			self.paused ? self.play() : self.pause();
		});
		step.addEventListener('click', self.step);
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

		return self;
	})(document.getElementById('play'),
	   document.getElementById('delay'),
	   document.getElementById('step'));

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
		var m, cx, cy,
			hoverElement = document.createElement('div'),
			lastHoverCoords,
			mouseDown = false,
			paintMode;
		board.appendChild(hoverElement);
		hoverElement.classList.add('hover');

		board.addEventListener('mousedown', function(e) {
			if (!player.paused || mouseDown) return;
			var coords = reverseCoordinates(e),
				id = coords[0] + ',' + coords[1];
			cells[id] = paintMode = !cells[id];
			draw.noScale();
			mouseDown = true;
		});
		board.addEventListener('mousemove', function(e) {
			var coords = reverseCoordinates(e);
			positionElement(coords, hoverElement);
			if (mouseDown) {
				var id = coords[0] + ',' + coords[1];
				if (!cells[id] != !paintMode)
					cells[id] = paintMode;
				draw.noScale();
			}
		});
		window.addEventListener('mouseup', function() {
			if (mouseDown) {
				mouseDown = false;
				draw();
				updateHash();
			}
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

			setTimeout(draw.noScale);
		}

		draw.noScale = function() {
			for (var id in cells)
				drawCell(coordinates(id), id);
		};

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
			positionElement(coords, element);
			return element;	
		}

		function positionElement(coords, element) {
			element.style.top = m * coords[1] + cy + 'px';
			element.style.left = m * coords[0] + cx + 'px';
			element.style.width = element.style.height = m + 'px';
		}

		function scale(top, right, bottom, left) {
			bottom++; right++;
			var w = board.offsetWidth,
				h = board.offsetHeight,
				mx = w / (right - left + 2),
				my = h / (bottom - top + 2);
			m = mx < my ? mx : my;
			if (m) {
				m *= zoom;
				cx = w / 2 - m * (right + left) / 2;
				cy = h / 2 - m * (bottom + top) / 2;
			} else {
				m = (w < h ? w : h) * zoom / 5;
				cx = w / 2 - m;
				cy = h / 2 - m;
			}
		}

		function reverseCoordinates(e) {
			return [
				Math.floor((e.pageX - cx) / m),
				Math.floor((e.pageY - cy) / m)
			];
		}

		return draw;
	})(document.getElementById('life'));

	var ignoreHashChange = false;
	function updateHash() {
		var hash = '';
		var done = {};
		for (id in cells) if (cells[id] && !done[id]) {
			if (hash) hash += ';';
			var coords = coordinates(id);
			while (cells[(coords[0] - 1) + ',' + coords[1]])
				coords[0]--;
			id = coords[0] + ',' + coords[1];
			hash += id;
			done[id] = true;
			var count = 1;
			while (true) {
				coords[0]++;
				id = coords[0] + ',' + coords[1];
				if (!cells[id]) break;
				count++;
				done[id] = true;
			}
			if (count > 1) hash += ',' + count;
		}
		ignoreHashChange = true;
		document.getElementById('permalink').href = '#' + hash;
	}

	function parseHash() {
		if (ignoreHashChange) {
			ignoreHashChange = false;
			return;
		}
		if (!window.location.hash) return;
		cells = {};
		window.location.hash.substr(1).split(';').forEach(function(part) {
			var parts = coordinates(part),
				count = parts[2] || 1;
			while (count--) {
				cells[parts[0] + ',' + parts[1]] = true;
				parts[0]++;
			}
		});
		draw();
	}
	window.addEventListener('hashchange', parseHash);

	if (window.location.hash)
		parseHash();
	else cells = {
		'0,0': true,
		'1,0': true,
		'1,1': true,
		'2,1': true,
		'1,2': true
	};

	draw();

	function coordinates(id) {
		return id.split(',')
		         .map(function(x) { return parseInt(x, 10); });
	}
});