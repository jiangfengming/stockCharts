function convertFenshi(fs, interval) {
	console.log(fs);

  var data = [];
  var prices = [];
  for (var i = 0; i < fs.length; i++) {
    var time = new Date(fs[i][0]);
    prices.push(fs[i][1]);
    if (prices.length != 1 && time.getMinutes() % interval == 0) {
      var time = fs[i][0],
        open = prices[0],
        close = fs[i][1];

      prices.sort(function(a, b) {
        return a - b
      });

      var high = prices[prices.length - 1],
        low = prices[0];

      data.push([time, open, high, low, close]);
      prices = [];
    }
  }
  return data;
}
