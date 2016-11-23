function stockCharts(container, opts) {
  var me = this;
  extend(true, me, stockCharts.defaults, opts);
  me.container = container;

	if (me.container.constructor === String) {
		me.container = document.getElementById(me.container)
	}

  if (me.width == null) {
		me.width = me.container.clientWidth;
	}

  if (me.height == null) {
		me.height = me.container.clientHeight;
	}

  me.paper = Raphael(me.container, me.width, me.height);
  me.root = me.paper.canvas;
  me.charts = [];
}

stockCharts.defaults = {
  width: null, // 画布宽, 默认为容器宽
  height: null // 画布高, 默认为容器高
};

stockCharts.prototype = {
  chart: function(opts) {
    var me = this;
    var chart = new stockCharts.chart(me, opts);
    me.charts.push(chart);
    return chart;
  }
};

stockCharts.chart = function(chartset, opts) {
  var me = this;
  extend(true, me, stockCharts.chart.defaults, opts);

  me.chartset = chartset;
  me.paper = chartset.paper;
  me.lines = [];
  me.elems = [];

  if (me.width == null) {
		me.width = chartset.width;
	}

  if (me.height == null) {
		me.height = chartset.height;
	}

  me.innerX = me.x + me.tick.width + me.tick.padding;
  me.innerWidth = me.width - (me.tick.width + me.tick.padding) * 2;
  me.innerY = me.y + me.tick.height + me.tick.padding;
  me.innerHeight = me.height - (me.tick.height + me.tick.padding) * 2;

  var rect = 'M' + me.innerX + ',' + me.innerY + 'L' + (me.innerX + me.innerWidth) + ',' + me.innerY + 'L' + (me.innerX + me.innerWidth) + ',' + (me.innerY + me.innerHeight) + 'L' + me.innerX + ',' + (me.innerY + me.innerHeight) + 'L' + me.innerX + ',' + me.innerY;

  /*
  When SVG lines lie at their apparently correct coordinates they actually lie inbetween pixels, so when you state M1 1 L50 1 it paints half a pixel on the top and the other half in the bottom of the pixel, making it look like a thick, semitransparent line.

  To solve this problem you need to either paint at half pixels, or translate your elements half a pixel, ie. element.transform('t0.5,0.5')
  */
  me.border = me.paper.path(rect).attr({
    stroke: me.borderColor,
    'fill-opacity': 0
  }).transform('t0.5,0.5');

  if (Raphael.type === 'SVG') {
		var eventLayer = rect;
	} else { // IE VML
		var eventLayer = 'M' + me.innerX + ',' + me.innerY + 'L' + (me.innerX + me.innerWidth + 1) + ',' + me.innerY + 'L' + (me.innerX + me.innerWidth + 1) + ',' + (me.innerY + me.innerHeight) + 'L' + me.innerX + ',' + (me.innerY + me.innerHeight) + 'L' + me.innerX + ',' + me.innerY;
	}

  me.eventLayer = me.paper.path(eventLayer).attr({
    fill: '#FFF',
    'stroke-width': 0,
    opacity: 0
  }).mousemove(function(e) {
    if (!me.mousemove) {
			return;
		}

    if (Raphael.type === 'SVG') {
			var x = (e.offsetX || e.layerX) - me.innerX;
		} else { // IE VML
			var x = e.offsetX - 1;
		}

    me.mousemove(Math.round(x / me.axisX.unit));
  });

  me.draw();
};

stockCharts.chart.defaults = {
  x: 0, // 图表在画布的位置 x
  y: 0, // 图表在画布的位置 y
  width: null, // 图表宽度, 默认画布宽
  height: null, // 图表高度, 默认画布高

  borderColor: '#9B9B9B', // 图表外框颜色

  // mouseover事件, x为点在X轴的单位，line.data[x]为线条在X轴x单位处对应的数据。
  mousemove: function(x) {
    var me = this;
    for (var i = 0; i < me.lines.length; i++) {
      var line = me.lines[i];
      line.removeMarkers(); // 清除之前的标记点
      if (line.data[x]) {
        line.mark(x); // 在线条x单位做标记
      }
    }
  },

  // 绘表前callback
  drawBefore: function() {

  },

  // 绘表后callback
  drawAfter: function() {

  },

  // 刻度
  tick: {
    width: 48, // 刻度标记宽
    height: 12, // 刻度标记高
    fontFamily: 'Arial, Helvetica, 微软雅黑, 宋体, sans-serif', // 字体
    fontSize: 12, // 字号
    padding: 2 // 标记与图表间距
  },

  axisX: {
    padding: 0, // X轴与边框间隔
    units: 242, // X轴单位总量
    tickColor: '#001E7C', // 刻度标记颜色
    lineColor: '#D2D2D2' // 刻度线颜色
  },

  axisY: {
    min: 0, // 初始化最小值
    max: 100, // 初始化最大值

    /*
    datachange: Y轴数据的最大值最小值改变时，重新设置Y轴最小、最大值
    args: 数据的最小、最大值
    return [min, max]
    */
    datachange: function(min, max) {
      if (min == max) // 只有一个点
        return [min * 0.99, max * 1.01];

      var padding = (max - min) / 8 / 4; // 上下留白
      return [min - padding, max + padding];
    },

    tickshow: true, // 是否显示刻度

    ticknum: 9, // 刻度标记数数量

    // 刻度标记格式
    tickFormat: function(val) {
      return val.toFixed(2);
    },

    // 刻度标记颜色 颜色值或callback
    // tickColor: '#000000',
    tickColor: function(val) {
      return '#000000';
    },

    // 刻度线颜色 颜色值或callback
    // lineColor: '#D2D2D2',
    lineColor: function(val) {
      return '#D2D2D2';
    },

    // 右侧Y轴
    y2: {
      show: true, // 是否显示

      // 刻度标记格式
      tickFormat: function(num) {
        return num;
      },

      // 刻度标记颜色
      tickColor: function(val) {
        return '#000000';
      }
    }
  }
};

stockCharts.chart.prototype = {
  clear: function() {
    var me = this;
    var elem;
    while (elem = me.elems.pop()) {
			elem.remove();
		}
  },

  draw: function() {
    var me = this;
    if (me.drawBefore && me.drawBefore() === false) {
			return;
		}
    me.clear();
    me.drawAxisX();
    me.drawAxisY();
    me.border.toFront();
    me.drawLines();
    me.eventLayer.toFront();
    if (me.drawAfter) {
			me.drawAfter();
		}
  },

  drawAxisX: function() {
    var me = this;

    me.axisX.x = me.innerX + me.axisX.padding;
    me.axisX.width = me.innerWidth - me.axisX.padding * 2;

    me.axisX.unit = me.axisX.width / (me.axisX.units - 1); // 0 based index

    var y = me.innerY + me.innerHeight + me.tick.padding + me.tick.height / 2;

    for (var i = 0; i < me.axisX.ticks.length; i++) {
      var x = me.getX(me.axisX.ticks[i][0] - 1);
      var tick = me.axisX.ticks[i][1];
      var text = me.paper.text(x, y, tick).attr({
        'font-family': me.tick.fontFamily + 'px',
        'font-size': me.tick.fontSize,
        fill: me.axisX.tickColor.constructor == String ? me.axisX.tickColor : me.axisX.tickColor.call(me, tick)
      });

      me.elems.push(text);

      if (me.axisX.ticks[i][0] === 1) {
				text.attr({
          x: x + text.getBBox().width / 2
        });
			} else if (me.axisX.ticks[i][0] === me.axisX.units) {
				text.attr({
          x: x - text.getBBox().width / 2
        });
			}

      if (me.axisX.lineColor) {
        me.elems.push(me.paper.path('M' + x + ',' + me.innerY + 'L' + x + ',' + (me.innerY + me.innerHeight)).attr({
          stroke: me.axisX.lineColor.constructor == String ? me.axisX.lineColor : me.axisX.lineColor.call(me, tick),
          'stroke-dasharray': '-'
        }).transform('t0.5,0.5'));
      }
    }
  },

  drawAxisY: function() {
    var me = this;

    me.axisY.unit = me.innerHeight / (me.axisY.max - me.axisY.min);

    var tickstep = (me.axisY.max - me.axisY.min) / (me.axisY.ticknum - 1);

    for (var i = 0; i < me.axisY.ticknum; i++) {
      var tick = me.axisY.min + tickstep * i;
      var y = Math.floor(me.innerY + me.innerHeight - tickstep * i * me.axisY.unit);

      if (me.axisY.tickFormat) {
				tick = me.axisY.tickFormat.call(me, tick);
			}

      var text = me.paper.text(0, y, tick).attr({
        'font-family': me.tick.fontFamily + 'px',
        'font-size': me.tick.fontSize,
        fill: me.axisY.tickColor.constructor == String ? me.axisY.tickColor : me.axisY.tickColor.call(me, tick)
      });

      me.elems.push(text);

      text.attr({
        x: me.x + Math.floor((2 * me.tick.width - text.getBBox().width) / 2)
      });

      if (me.axisY.lineColor) {
        me.elems.push(me.paper.path('M' + me.innerX + ',' + y + 'L' + (me.innerX + me.innerWidth) + ',' + y).attr({
          stroke: me.axisY.lineColor.constructor === String ? me.axisY.lineColor : me.axisY.lineColor.call(me, tick),
          'stroke-dasharray': '-'
        }).transform('t0.5,0.5'));
      }

      if (me.axisY.y2.show) {
        if (me.axisY.y2.tickFormat) {
					tick = me.axisY.y2.tickFormat.call(me, tick);
				}

        var x = me.x + me.width - me.tick.width;
        var text = me.paper.text(x, y, tick).attr({
          'font-family': me.tick.fontFamily + 'px',
          'font-size': me.tick.fontSize,
          fill: me.axisY.y2.tickColor.constructor == String ? me.axisY.y2.tickColor : me.axisY.y2.tickColor.call(me, tick)
        });

        me.elems.push(text);

        text.attr({
          x: x + Math.floor(text.getBBox().width / 2)
        });
      }
    }
  },

  dataRange: function(data) {
    var me = this;

    if (!data.length) {
			return [null, null];
		}

    data.sort(function(a, b) {
      return a - b;
    });

    return [data[0], data[data.length - 1]];
  },

  needRedraw: function() {
    var me = this;

    var data = [];
    for (var i = 0; i < me.lines.length; i++) {
      var line = me.lines[i];
      if (line.min != null) {
				data.push(line.min, line.max);
			}
    }

    range = me.dataRange(data);

    if (range[0] != null && (range[0] != me.axisY.datamin || range[1] != me.axisY.datamax)) {
      me.axisY.datamin = range[0];
      me.axisY.datamax = range[1];

      if (me.axisY.datachange) {
				range = me.axisY.datachange.call(me, range[0], range[1]);
			}

      me.axisY.min = range[0];
      me.axisY.max = range[1];

      me.draw();

      return true;
    } else {
      return false;
    }
  },

  getX: function(x) {
    var me = this;
    return Math.floor(me.axisX.x + x * me.axisX.unit);
  },

  getY: function(y) {
    var me = this;
    return Math.floor(me.innerY + me.innerHeight - (y - me.axisY.min) * me.axisY.unit);
  },


  drawLines: function() {
    var me = this;
    for (var i = 0; i < me.lines.length; i++) {
			me.lines[i]._draw();
		}
  },

  lineFactory: function(type, opts) {
    var me = this;
    var line = new stockCharts.chart[type](me, opts);
    me.lines.push(line);
    me.eventLayer.toFront();
    return line;
  },

  // line
  line: function(opts) {
    var me = this;
    return me.lineFactory('line', opts);
  },

  // candlestick
  candlestick: function(opts) {
    var me = this;
    return me.lineFactory('candlestick', opts);
  }
};


// line
stockCharts.chart.line = function(chart, opts) {
  var me = this;
  extend(true, me, stockCharts.chart.line.defaults, opts);
  me.chart = chart;
  me.paper = chart.paper;
  me.path = me.paper.path().attr({
    stroke: me.color
  }).transform('t0.5,0.5');
  me.data = [];
  me.markers = [];
};

stockCharts.chart.line.defaults = {
  color: '#007CC8', // 线条颜色
  markColor: '#007CC8' // 标记颜色
};

stockCharts.chart.line.prototype = {
  min: null,
  max: null,

  // data: [[x, y], ...]
  addData: function(data) {
    if (!data.length) {
			return;
		}

    var me = this;
    me.data = me.data.concat(data);
    me.draw();
  },

  setData: function(data) {
    var me = this;
    me.data = data;
    me.draw();
  },

  clear: function() {
    var me = this;
    me.data = [];
    me.draw();
  },

  draw: function() {
    var me = this;

    var d = [];
    for (var i = 0; i < me.data.length; i++) {
			d.push(me.data[i][1]);
		}

    var dataRange = me.chart.dataRange(d);
    me.min = dataRange[0];
    me.max = dataRange[1];

    if (me.chart.needRedraw()) {
			return;
		} else {
			me._draw();
		}
  },

  _draw: function() {
    var me = this;

    me.removeMarkers();
    if (!me.data.length) {
			me.path.attr({
        path: ''
      });
		} else {
      var path = '';
      for (var i = 0; i < me.data.length; i++)
        path += 'L' + me.chart.getX(i) + ',' + me.chart.getY(me.data[i][1]);
      me.path.attr({
        path: 'M' + path.substring(1)
      });
      me.path.toFront();
    }
  },

  /*
  在x单位做标记
  return: mark index, removeMarkers()使用.
  */
  mark: function(x) {
    var me = this;
    var marker = me.paper.circle(me.chart.getX(x), me.chart.getY(me.data[x][1]), 2).attr({
      'stroke-width': 0,
      fill: me.markColor
    });
    return me.markers.push(marker) - 1;
  },

  /*
  移除标记
  args:
  	i: mark()返回的index值
  省略参数则移除所有标记
  */
  removeMarkers: function( /*i, ... */ ) {
    var me = this;
    if (!arguments.length) {
      for (var i = 0; i < me.markers.length; i++) {
        if (me.markers[i]) {
          me.markers[i].remove();
          me.markers[i] = null;
        }
      }
    } else {
      for (var j = 0; j < arguments.length; j++) {
        var i = arguments[j];
        if (me.markers[i]) {
          me.markers[i].remove();
          me.markers[i] = null;
        }
      }
    }
  }
};


/*
阳线：Up Tick
阴线：Down Tick
中立线：Neutral Tick
*/

stockCharts.chart.candlestick = function(chart, opts) {
  var me = this;
  extend(true, me, stockCharts.chart.candlestick.defaults, opts);
  me.chart = chart;
  me.paper = chart.paper;
  me.data = [];
  me.elems = [];
  me.markers = [];
};

stockCharts.chart.candlestick.defaults = {
  width: 6, // K线宽度
  upcolor: '#FC0404', // 阳线颜色
  downcolor: '#00A800', // 阴线颜色
  neutralcolor: '#000000', // 中立线颜色
  markColor: '#000000' // 标记颜色
};

stockCharts.chart.candlestick.prototype = {
  min: null,
  max: null,

  // data: [[x, O, H, L, C], ...]
  addData: function(data) {
    if (!data.length) {
			return;
		}

    var me = this;
    var i = data.length;
    me.data = me.data.concat(data);
    me.draw(i);
  },

  setData: function(data) {
    var me = this;
    me.data = data;
    me.draw();
  },

  clear: function() {
    var me = this;
    me.data = [];
    me.draw();
  },


  draw: function() {
    var me = this;

    var d = [];
    for (var i = 0; i < me.data.length; i++) {
      d.push(me.data[i][2], me.data[i][3]);
    }

    var dataRange = me.chart.dataRange(d);
    me.min = dataRange[0];
    me.max = dataRange[1];

    if (me.chart.needRedraw()) {
			return;
		} else {
			me._draw();
		}
  },

  // if i is set, draw ticks from me.data[i], useful when axisY hasn't been changed. otherwise remove the candles and redraw.
  _draw: function(i) {
    var me = this;

    me.removeMarkers();

    if (!i) {
      i = 0;
      var elem;
      while (elem = me.elems.pop()) {
				elem.remove();
			}
    }

    if (me.data.length) {
      var w = Math.round(me.width / 2);

      while (i < me.data.length) {
        var d = me.data[i];
        var x = me.chart.getX(i);
        var xa = x - w;
        var xb = x + w;
        var yo = me.chart.getY(d[1]);
        var yh = me.chart.getY(d[2]);
        var yl = me.chart.getY(d[3]);
        var yc = me.chart.getY(d[4]);

        if (d[1] < d[4]) {
          var yTop = yc;
          var yBottom = yo;
        } else {
          var yTop = yo;
          var yBottom = yc;
        }

        var path = 'M' + xa + ',' + yo + 'L' + xb + ',' + yo + 'L' + xb + ',' + yc + 'L' + xa + ',' + yc + 'L' + xa + ',' + yo + 'M' + x + ',' + yh + 'L' + x + ',' + yTop + 'M' + x + ',' + yBottom + 'L' + x + ',' + yl;
        var color = d[1] == d[4] ? me.neutralcolor : d[1] < d[4] ? me.upcolor : me.downcolor;
        var path = me.paper.path(path).attr({
          fill: color,
          stroke: color
        }).transform('t0.5,0.5');

        me.elems.push(path);
        i++;
      }

      me.chart.eventLayer.toFront();
    }
  },

  /*
  在第x个K线上做标记
  return: mark index, removeMarkers()使用.
  */
  mark: function(x) {
    var me = this;
    return me.markers.push(me.elems[x].attr({
      stroke: me.markColor
    })) - 1;
  },

  /*
  移除标记
  args:
  	i: mark()返回的index值
  省略参数则移除所有标记
  */
  removeMarkers: function( /* i, ... */ ) {
    var me = this;

    if (!arguments.length) {
      for (var i = 0; i < me.markers.length; i++) {
        if (me.markers[i]) {
          me.markers[i].attr({
            stroke: me.markers[i].attr('fill')
          });
          me.markers[i] = null;
        }
      }
    } else {
      for (var j = 0; j < arguments.length; j++) {
        var i = arguments[j];
        if (me.markers[i]) {
          me.markers[i].attr({
            stroke: me.markers[i].attr('fill')
          });
          me.markers[i] = null;
        }
      }
    }
  }
};
