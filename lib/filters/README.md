#Filter Requirements

##All filters must export a function `fn`:

```javascript
module.exports = {
    'fn': _myFilterFunction
};
```

##All filter functions must get passed a value and return a value:

```javascript
var capitalize = function(val){
    return val.charAt(0).toUpperCase() + val.slice(1);
};
```

##Filters included in `index.js` will be automatically registered with the templating engine for use:

```
<%@capitalize it.value%>
```