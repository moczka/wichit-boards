/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Todo Router
	// ----------
	var Router = Backbone.Router.extend({
		routes: {
      
			'*filter': 'updateCategory'

		},
		updateCategory : function(category){
			console.log('The current page being called is this', page);
		}

	});

	app.MealRouter = new Router();
	Backbone.history.start();

})();
