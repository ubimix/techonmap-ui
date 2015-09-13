var _ = require('underscore');
var React = require('react');

/**
 * This class is responsible for automatic tracking and updating of vertical
 * panel sizes.
 */
var PanelSizeTracker = React.createClass({
    displayName : 'PanelSizeTracker',

    /** Updates the size of this zone */
    _resizeContent : function() {
        if (!this.isMounted())
            return;
        var container = this.props.container;
        var containerNode = container.getDOMNode();
        var node = this.getDOMNode();
        var minSize = this.props.minSize || 10;
        this._updateSize(containerNode, node, minSize);
    },

    componentWillMount : function() {
        this._resizeContent = _.debounce(this._resizeContent, 10);
        window.addEventListener('resize', this._resizeContent);
    },

    /** Add resize listener for the window */
    componentDidMount : function() {
        this._resizeContent();
    },

    /** Removes resize listener for the window */
    componentWillUnmount : function() {
        window.removeEventListener('resize', this._resizeContent);
    },

    /**
     * Renders children and track the size of a child with the specified key.
     */
    render : function() {
        return React.Children.only(this.props.children);
    },

    // -----------------------------------------------------------------------
    // Utility methods

    /**
     * Updates the size of the specified element in the container to be sure
     * that all previous siblings have sufficient place. If the resulting size
     * is less than specified minimal value then this minimal value is used
     * instead.
     */
    _updateSize : function(container, element, minSize) {
        minSize = minSize || 0;
        var height = container.offsetHeight;
        var pos = this._getPosition(container, element);
        var size = Math.max(minSize, Math.min(height - pos.top));
        element.style.height = size + 'px';
    },

    /**
     * Returns position of an element in the specified container.
     */
    _getPosition : function(el, parent) {
        var _x = 0;
        var _y = 0;
        while (el && el !== parent && !isNaN(el.offsetLeft)
                && !isNaN(el.offsetTop)) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return {
            top : _y,
            left : _x
        };
    },

});

module.exports = PanelSizeTracker;
