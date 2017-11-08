/* Flot plugin for showing crosshairs when the mouse hovers over the plot.

Copyright (c) 2007-2013 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin supports these options:

	crosshair: {
		mode: null or "x" or "y" or "xy"
		color: color
		lineWidth: number
	}

Set the mode to one of "x", "y" or "xy". The "x" mode enables a vertical
crosshair that lets you trace the values on the x axis, "y" enables a
horizontal crosshair and "xy" enables them both. "color" is the color of the
crosshair (default is "rgba(170, 0, 0, 0.80)"), "lineWidth" is the width of
the drawn lines (default is 1).

The plugin also adds four public methods:

  - setCrosshair( pos )

    Set the position of the crosshair. Note that this is cleared if the user
    moves the mouse. "pos" is in coordinates of the plot and should be on the
    form { x: xpos, y: ypos } (you can use x2/x3/... if you're using multiple
    axes), which is coincidentally the same format as what you get from a
    "plothover" event. If "pos" is null, the crosshair is cleared.

  - clearCrosshair()

    Clear the crosshair.

  - lockCrosshair(pos)

    Cause the crosshair to lock to the current location, no longer updating if
    the user moves the mouse. Optionally supply a position (passed on to
    setCrosshair()) to move it to.

    Example usage:

	var myFlot = $.plot( $("#graph"), ..., { crosshair: { mode: "x" } } };
	$("#graph").bind( "plothover", function ( evt, position, item ) {
		if ( item ) {
			// Lock the crosshair to the data point being hovered
			myFlot.lockCrosshair({
				x: item.datapoint[ 0 ],
				y: item.datapoint[ 1 ]
			});
		} else {
			// Return normal crosshair operation
			myFlot.unlockCrosshair();
		}
	});

  - unlockCrosshair()

    Free the crosshair to move again after locking it.
*/

(function ($) {
    var options = {
        crosshairTime: {
            mode: null, // one of null, "x", "y" or "xy",
            color: "rgba(170, 0, 0, 0.50)",
            lineWidth: 1
        }
    };
    
    function init(plot) {
        // position of crosshair in pixels
        var crosshairTime = { x: -1, y: -1, locked: false };

        plot.setCrosshairTime = function setCrosshairTime(pos) {
            if (!pos)
                crosshair.x = 10;
            else {
                var o = plot.p2c(pos);
                crosshairTime.x = Math.max(0, Math.min(o.left, plot.width()));
                crosshairTime.y = Math.max(0, Math.min(o.top, plot.height()));
            }
            
            plot.triggerRedrawOverlay();
        };
        
        plot.clearCrosshairTime = plot.setCrosshairTime; // passes null for pos
        
        plot.lockCrosshairTime = function lockCrosshairTime(pos) {
            if (pos)
                plot.setCrosshairTime(pos);
            crosshairTime.locked = true;
        };

        plot.unlockCrosshairTime = function unlockCrosshairTime() {
            crosshairTime.locked = false;
        };

        function onMouseOut(e) {
            if (crosshairTime.locked)
                return;

            if (crosshairTime.x != -1) {
                crosshairTime.x = -1;
                plot.triggerRedrawOverlay();
            }
        }

        function onMouseMove(e) {
            if (crosshairTime.locked)
                return;
                
            if (plot.getSelection && plot.getSelection()) {
                crosshairTime.x = -1; // hide the crosshairTime while selecting
                return;
            }
                
            var offset = plot.offset();
            crosshairTime.x = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
            crosshairTime.y = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));
            plot.triggerRedrawOverlay();
        }
        
        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            if (!plot.getOptions().crosshairTime.mode)
                return;

            //eventHolder.mouseout(onMouseOut);
            //eventHolder.mousemove(onMouseMove);
        });

        plot.hooks.drawOverlay.push(function (plot, ctx) {
            var c = plot.getOptions().crosshairTime;
            if (!c.mode)
                return;

            var plotOffset = plot.getPlotOffset();
            
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            if (crosshairTime.x != -1) {
                var adj = plot.getOptions().crosshairTime.lineWidth % 2 === 0 ? 0 : 0.5;

                ctx.strokeStyle = c.color;
                ctx.lineWidth = c.lineWidth;
                ctx.lineJoin = "round";

                ctx.beginPath();
                if (c.mode.indexOf("x") != -1) {
                    var drawX = Math.round(crosshairTime.x) + adj;
                    ctx.moveTo(drawX, 0);
                    ctx.lineTo(drawX, plot.height());
                }
                if (c.mode.indexOf("y") != -1) {
                    var drawY = Math.round(crosshairTime.y) + adj;
                    ctx.moveTo(0, drawY);
                    ctx.lineTo(plot.width(), drawY);
                }
                ctx.stroke();
            }
            ctx.restore();
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder.unbind("mouseout", onMouseOut);
            eventHolder.unbind("mousemove", onMouseMove);
        });
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'crosshairTime',
        version: '1.0'
    });
})(jQuery);
