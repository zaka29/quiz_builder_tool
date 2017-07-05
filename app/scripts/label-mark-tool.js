 // Raphael Extensions
 /**
  * Returns a point rotated by the given parameters.
  * @param {number} x x-coordinate of the point to rotate
  * @param {number} y y-coordinate of the point to rotate
  * @param {number} cx x-coordinate of center on which to rotate
  * @param {number} cy y-coordinate of center on which to rotate
  * @param {number} rad angle (in radians) to rotate point
  * @return object containing x and y properties
  */
 Raphael.fn.rotatePoint = function(x, y, cx, cy, rad) {
     var newX = Math.cos(rad) * (x - cx) - Math.sin(rad) * (y - cy),
         newY = Math.sin(rad) * (x - cx) + Math.cos(rad) * (y - cy);
     return {
         x: (newX + cx),
         y: (newY + cy)
     };
 };

 /**
  * Returns arrow path info created from the given parameters.
  * @param {number} x1 x-coordinate of the base of the arrow
  * @param {number} y1 y-coordinate of the base of the arrow
  * @param {number} x2 x-coordinate of the tip of the arrow
  * @param {number} y2 y-coordinate of the tip of the arrow
  * @param {number} arrowWidth width factor used to determine width of arrow
  * @param {number} arrowHeight height factor used to determine height of arrow
  * @return object containing the following properties: line & head (path arrays), start & end (x & y objects), and size (width & height)
  */
 Raphael.fn.getArrowPaths = function(x1, y1, x2, y2, arrowWidth, arrowHeight) {
     // Get angle and arrow points
     var angle = Math.atan2(x1 - x2, y2 - y1) + Math.PI / 2,
         p = [{
             x: x2 - arrowHeight,
             y: y2
         }, {
             x: (x2 - arrowHeight),
             y: (y2 - arrowWidth)
         }, {
             x: (x2 - arrowHeight),
             y: (y2 + arrowWidth)
         }, {
             x: x2,
             y: y2
         }],
         c = {
             x: x2,
             y: y2
         },
         newP = [];

     // Calculate points to rotate arrow head based on given line angle
     for (var i = 0; i < p.length; i++) {
         newP.push(this.rotatePoint(p[i].x, p[i].y, c.x, c.y, angle));
     }

     var linePath = ["M", x1, y1, "L", newP[0].x, newP[0].y],
         headPath = ["M", newP[3].x, newP[3].y, "L", newP[1].x, newP[1].y, "L", newP[2].x, newP[2].y, "Z"];

     return {
         line: linePath,
         head: headPath,
         start: {
             x: x1,
             y: y1
         },
         end: {
             x: x2,
             y: y2
         },
         size: {
             width: arrowWidth,
             height: arrowHeight
         }
     };
 };

 /**
  * Draws an arrow.
  * @param {number} x1 x-coordinate of the base of the arrow
  * @param {number} y1 y-coordinate of the base of the arrow
  * @param {number} x2 x-coordinate of the tip of the arrow
  * @param {number} y2 y-coordinate of the tip of the arrow
  * @param {object} opts options
  * @param {number} [opts.arrowWidth] width factor used to determine width of arrow
  * @param {number} [opts.arrowHeight] height factor used to determine height of arrow
  * @param {number} [opts.lineWidth] width of the line
  * @param {string} [opts.color] color of the arrow
  * @return arrow object
  */
 Raphael.fn.arrow = function(x1, y1, x2, y2, opts) {
     opts = opts || {};
     // Get options & set default options
     var arrowWidth = opts.arrowWidth || 5,
         arrowHeight = opts.arrowHeight || 15,
         lineWidth = opts.lineWidth || 2,
         color = opts.color || '#660033';

     // Calculate paths
     var paths = this.getArrowPaths(x1, y1, x2, y2, arrowWidth, arrowHeight),
         line = this.path(paths.line),
         head = this.path(paths.head);

     // Apply options
     line.attr({
         stroke: color,
         'stroke-width': lineWidth
     });
     head.attr({
         fill: color,
         stroke: color
     });

     var group = this.set(),
         paper = this;

     group.push(head, line);

     group.line = line;
     group.head = head;
     group.start = {
         x: x1,
         y: y1
     };
     group.end = {
         x: x2,
         y: y2
     };
     group.size = {
         width: arrowWidth,
         height: arrowHeight
     };
     group.update = function(x1, y1, x2, y2) {
         var paths = paper.getArrowPaths(x1, y1, x2, y2, this.size.width, this.size.height);
         this.head.attr('path', paths.head);
         this.line.attr('path', paths.line);
         this.start = paths.start;
         this.end = paths.end;
     };

     return group;
 };

 /**
  * Draws a label.
  * @param {number} x x-coordinate of top left corner of label
  * @param {number} y y-coordintae of top left corner of label
  * @param {string} t text of the label
  * @param {object} opts options
  * @param {string} [opts.color] Color of the label text and border
  * @param {number} [opts.fontSize] Font size of the label text
  * @param {number} [opts.padding] Padding between label text and border
  * @param {string} [opts.backgroundColor] Background color of label
  */
 Raphael.fn.label = function(x, y, t, opts) {
     opts = opts || {};
     var color = opts.color || this.raphael.getColor(),
         fontSize = opts.fontSize || 16,
         padding = opts.padding || 5,
         backgroundColor = opts.backgroundColor || '#fff';

     var group = this.set(),
         text = this.text(x, y, t).attr({
             'font-size': fontSize,
             fill: color
         }),
         bb = text.getBBox(),
         border = this.rect(bb.x - padding, bb.y - padding, bb.width + padding * 2, bb.height + padding * 2).attr({
             fill: backgroundColor,
             stroke: color
         });

     border.insertBefore(text);

     group.push(text, border);
     group.text = text;
     group.border = border;

     return group;
 };

 // Creates an arrow whose base is centered on the given label
 // and tip is centered on the given coordinates.
 /**
  * Draws an arrow connected to the given label. Both the label
  * and the arrow become draggable.
  * @param {object} label Label to which to connect arrow
  * @param {number} x x-coordinate of the tip of the arrow
  * @param {number} y y-coordinate of the tip of the arrow
  * @param {object} opts arrow options
  */
 Raphael.fn.connectedArrow = function(label, x, y, opts) {
     opts = opts || {};
     var bounds = opts.bounds,
         bb = label.getBBox(),
         arrow = this.arrow(bb.x + bb.width / 2, bb.y + bb.height / 2, x, y, opts),
         arrowStart = function() {
             this.ox = arrow.end.x;
             this.oy = arrow.end.y;
             arrow.bb = arrow.head.getBBox();
         },
         arrowMove = function(dx, dy) {
             var newX = this.ox + dx,
                 newY = this.oy + dy;

             if (bounds) {
                 var mx = arrow.bb.x + dx;
                 if (mx < bounds.x || mx > bounds.x + bounds.width - arrow.bb.width) {
                     newX = arrow.end.x;
                 }

                 var my = arrow.bb.y + dy;
                 if (my < bounds.y || my > bounds.y + bounds.height - arrow.bb.height) {
                     newY = arrow.end.y;
                 }
             }

             arrow.update(arrow.start.x, arrow.start.y, newX, newY);
         },
         arrowUp = function() {
             // Do nothing
         },
         labelStart = function() {
             label.bb = label.getBBox();
         },
         labelMove = function(dx, dy) {
             // Move label
             var bb = label.getBBox(),
                 labelX, labelY;

             labelX = label.bb.x - bb.x + dx;
             labelY = label.bb.y - bb.y + dy;

             if (bounds) {
                 var mx = label.bb.x + dx;
                 if (mx < bounds.x || mx > bounds.x + bounds.width - label.bb.width) {
                     labelX = 0;
                 }

                 var my = label.bb.y + dy;
                 if (my < bounds.y || my > bounds.y + bounds.height - label.bb.height) {
                     labelY = 0;
                 }
             }

             label.translate(labelX, labelY);

             // Move arrow
             var newBB = label.getBBox();
             arrow.update(newBB.x + newBB.width / 2, newBB.y + newBB.height / 2, arrow.end.x, arrow.end.y);
         },
         labelUp = function() {
             // Do nothing
         };

     arrow.head.insertBefore(label.border);
     arrow.line.insertBefore(label.border);

     arrow.head.attr('cursor', 'move');
     arrow.head.drag(arrowMove, arrowStart, arrowUp);

     label.attr('cursor', 'move');
     label.drag(labelMove, labelStart, labelUp);

     return arrow;
 };

 // Expands the given width and height to fit
 // the given max width and height, preserving aspect ratio.

 function fitToCanvas(width, height, maxWidth, maxHeight) {
     var obj = {};

     if (width > height) {
         obj.width = maxWidth;
         obj.height = Math.round(height * maxWidth / width);
     } else if (width < height) {
         obj.height = maxHeight;
         obj.width = Math.round(width * maxHeight / height);
     } else {
         obj.width = maxWidth;
         obj.height = maxHeight;
     }

     return obj;
 }


 function $(id) {
     return document.getElementById(id);
 }

 var canvasWidth = 404,
     canvasHeight = 500,
     imageWidth = 404,
     imageHeight = 500,
     paper = Raphael('canvas', canvasWidth, canvasHeight),
     bgDim = fitToCanvas(imageWidth, imageHeight, canvasWidth, canvasHeight),
     bg = paper.image('http://www.emperor-penguin.com/penguin-chick.jpg', 0, 0, bgDim.width, bgDim.height),

     // label1 = paper.label(31, 90, 'Label 1', {
     //     color: '#f00'
     // }),
     
     // arrow1 = paper.connectedArrow(label1, 98, 60),
     
     // label2 = paper.label(31, 121, 'Label 2', {
     //     color: '#00f'
     // }),

     // arrow2 = paper.connectedArrow(label2, 140, 60),
     
     c = paper.rect(0, 0, canvasWidth, canvasHeight);
 
 c.attr({fill: 'red', opacity: 0.1});
 var pathMap = []
 
 c.click(function(event){
    var currentPos = (event.x-10) + "," + (event.y-10);
    var start = "M";
    var lineTo = "L";
    
    pathMap.push(currentPos);
    
    // Build the path
    start += pathMap.length === 1 ? pathMap[0] : pathMap[pathMap.length - 2];
    lineTo += pathMap[pathMap.length - 1];
    
    var wholePath = start + lineTo;
    var line = paper.path(wholePath);
    
    line.attr({stroke: "#009933", "stroke-width": 5});

    if (line.prev.node.nodeName == "circle") {
        line.prev.toFront();
        console.log(line.prev);
    };
    
    var circle = paper.circle(event.x - 10, event.y - 10, 10);
    circle.attr({fill: "#6699ff"});
     
 });
 
 paper.setSize(bgDim.width, bgDim.height);
 

 var zoom = 1;

 $('max').onclick = function() {
     zoom += 0.1;
     bg.scale(zoom);
     if (zoom > 1) {
         $('min').disabled = false;
         bg.drag(imageMove, imageStart, up);
     }

 };

 $('min').onclick = function() {
     zoom -= 0.1;
     bg.scale(zoom);
     if (zoom <= 1) {
         $('min').disabled = true;
         bg.undrag();
     }

 };

 function imageStart() {
     this.bb = this.getBBox();
     this.attr('cursor', 'move');
 }

 function imageMove(dx, dy) {

     var newBB = this.getBBox(),
         newLabelBB = label1.getBBox(),
         imageX = this.bb.x - newBB.x + dx,
         imageY = this.bb.y - newBB.y + dy,
         //newLabelBBx = label1.bb.x - newLabelBB + dx,
         //newLabelBBy = label1.bb.y - newLabelBB + dy,
         boundX = 300 - this.attr('width'),
         boundY = 300 - this.attr('height'),
         boundW = this.attr('width') + (this.attr('width') - 300),
         boundH = this.attr('height') + (this.attr('height') - 300),
         bounds = {
             x: boundX,
             y: boundY,
             width: boundW,
             height: boundH
         };

     if (bounds) {
         var mx = this.bb.x + dx;
         if (mx < bounds.x || mx > bounds.x + bounds.width - this.bb.width) {
             imageX = 0;
         }

         var my = this.bb.y + dy;
         if (my < bounds.y || my > bounds.y + bounds.height - this.bb.height) {
             imageY = 0;
         }
     }
     this.translate(imageX, imageY);

 }

 function up() {
     this.attr('cursor', 'default');
 }
