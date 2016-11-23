// Grab from jQuery.extend()

function extend(){
	var options, name, src, copy, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if(target.constructor == Boolean){
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	for(; i < length; i++){
		// Only deal with non-null/undefined values
		if((options = arguments[i]) != null){
			// Extend the base object
			for(name in options){
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if(target === copy){
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if(deep && copy && (copy.constructor == Object || copy.constructor == Array)){
					clone = src && src.constructor == copy.constructor ? src : new copy.constructor();
					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				}else if(copy !== undefined){
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
}
