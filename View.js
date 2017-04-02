var View = (function($){

    function renderView(){
      //default render Method
      this.$el.html('<div>Default rendering!</div>');

      return this;

    }

    function removeView(){

      //unbind any attached listeners
      for(var event in this.events){

        if(this.events.hasOwnProperty(event)){
            var eventParts = event.split(' ');
            this.$el.undelegate(eventParts[1], eventParts[0], this[this.events[event]]);
        }

      }

      //remove from DOM
      this.$el.remove();

      return this;

    }

    function attachHandlers(events){

      for(var event in events){

        if(events.hasOwnProperty(event)){

          var eventParts = event.split(' ');

          this.$el.delegate(eventParts[1], eventParts[0], this[events[event]]);

        }

      }

    }

    function instanceCreator(opts){

      var viewToExport = Object.create(this);
          Object.assign(viewToExport, opts);

      this.createElement.call(viewToExport, opts.tagName, opts.className);
      this.addHandlers.call(viewToExport, opts.events);

      return viewToExport;

    }

    function createElement(tagName, attributes){

      //creates the view el
      var el = document.createElement(tagName);
      Object.assign(el, attributes);
      this.el = el;
      this.$el = $(el);

      return this;

    }

    var viewPrototype = {

        render: renderView,
        remove: removeView,
        createElement: createElement,
        extend: instanceCreator,
        addHandlers: attachHandlers

      };

    return Object.create(viewPrototype);

})(jQuery);
