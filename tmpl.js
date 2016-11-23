function tmpl(str){
	return new Function("data",
		"var p=[],print=function(){p.push.apply(p,arguments)};" +
		"p.push('" +
		// Convert the template into pure JavaScript
		str.replace(/[\r\t\n]/g, " ")
		   .split("<:").join("\t")
		   .replace(/((^|:>)[^\t]*)'/g, "$1\r")
		   .replace(/\t=(.*?):>/g, "',$1,'")
		   .split("\t").join("');")
		   .split(":>").join(";p.push('")
		   .split("\r").join("\\'")
		+ "');return p.join('');");
}
