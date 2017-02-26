import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { jqueryUI } from 'meteor/glasser:jqueryui';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';

Features = new Mongo.Collection('features');

import './main.html';

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_ONLY',
});

Template.body.rendered = function() {
  $.datepicker.setDefaults({
		dayNamesMin: $.datepicker._defaults.dayNamesShort
	});
	$("#datepicker").datepicker({
		showOtherMonths: true,
		selectOtherMonths: true,
		dateFormat: "m/d/yy",
		changeMonth: true,
    	changeYear: true,
    	monthNamesShort: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
	}).datepicker("setDate", "0");
	var currentDate = $.datepicker.formatDate("ddMy", $("#datepicker").datepicker("getDate"));
  if (Meteor.user()) {
		Session.set('featureName', Features.find({
			owner: Meteor.user()._id
		}, {
			sort: {
				text: 1
			}
		}).fetch()[0].text);
	}
  Session.set("versionNumber", $('#version').val());
	Session.set("date", currentDate);
  $('#copyButton').click(function(event) {
		$('#generatedtext').select();
		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
			$("#copyButton").text("Copied to Clipboard");
			$("#copyButton").addClass('copied');
		} catch (err) {
		}
	$('#generatedtext').blur();
	addFeature();
	});
	$("#generatedtext").bind({
		copy : function(){
			addFeature();
		},
		cut : function(){
			addFeature();
		}
	});
};

Template.body.helpers({
	hidden() {
		if (!Meteor.user()) {
			return 'hidden';
		}
	}
});

Template.body.events({
	'focus #login-username' (event) {
		$('#login-password').val("123123");
		$('#login-password-again').val("123123");
	},
	'change #version' (event) {
		Session.set("versionNumber", $('#version').val());
	},
	'change #datepicker' (event) {
		var currentDate = $.datepicker.formatDate("ddMy", $("#datepicker").datepicker("getDate"));
		Session.set("date", currentDate);
	}
});

Template.login.events({
	'submit #login-form': function(e, t) {
		e.preventDefault();
		var alias = $('#login-alias').val();
		var password = '123123';
		Meteor.loginWithPassword(alias, password, function(err) {
			if (err) {
				if (err.reason == "User not found") {
					Accounts.createUser({
						username: alias,
						password: password,
						createdAt: new Date()
					});
				}
			}
		});
		return false;
	}
});

Template.logoutButton.helpers({
	username() {
		return Meteor.user().username;
	}
});

Template.logoutButton.events({
	'click .logout': function(event) {
		event.preventDefault();
		Meteor.logout();
	}
});

Template.generated.helpers({
	filename() {
		if (Session.get('featureName') === undefined) {
			if (Meteor.user()) {
				if (Features.find({
						owner: Meteor.user()._id
					}).count() > 0) {
					Session.set('featureName', Features.find({
						owner: Meteor.user()._id
					}, {
						sort: {
							text: 1
						}
					}).fetch()[0].text);
				}
			}
		}
		var featureName = Session.get("featureName");
		var versionNumber = Session.get("versionNumber");
		var date = Session.get("date");
		var alias = 'alias';
		if (Meteor.user()) {
			alias = Meteor.user().username;
		}
		$("#copyButton").text("Copy to Clipboard");
		$("#copyButton").removeClass('copied');
		if(featureName !== undefined){
		return featureName + "_" + "v" + versionNumber + "_" + alias + "_" + date;
	} else {
		return "FeatureName_" + "v" + versionNumber + "_" + alias + "_" + date;
	}
	},
	safariHint() {
		var ua = navigator.userAgent.toLowerCase();
		if (ua.indexOf('safari') != -1) {
		  if (ua.indexOf('chrome') > -1) {
		    return false;
		  } else {
		    return true;
		  }
		}
	}
});

Template.generated.events({
	'input #generatedtext' (event) {
		$("#copyButton").text("Copy to Clipboard");
		$("#copyButton").removeClass('copied');
	},
	'change #generatedtext' (event) {
		$("#copyButton").text("Copy to Clipboard");
		$("#copyButton").removeClass('copied');
	}
});

Template.feature.helpers({
	features() {
		if (Meteor.user()) {
			return Features.find({
				owner: Meteor.user()._id
			}, {
				sort: {
					text: 1
				}
			});
		}
	}
});

Template.feature.events({
	'change .custom-combobox-input' (event) {
		Session.set("featureName", $('.custom-combobox-input').val());
	},
	'input .custom-combobox-input' (event) {
		Session.set("featureName", $('.custom-combobox-input').val());
	},
	'keydown .custom-combobox-input' (event) {
		if(event.which === 13){
			addFeature();
		}
		return event.which !== 32;
	}
});

function addFeature(){
	var text = $('.custom-combobox-input').val();
	if (text !== '') {
		if(Features.find({text:text}).fetch().length===0){
		Features.insert({
			text: text,
			owner: Meteor.userId(),
			username: Meteor.user().username,
			createdAt: new Date()
		});
	}
}
}

$( function() {
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );

        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },

      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";

        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
					.attr( "placeholder", "E.g. FormDesigner")
					.attr( "autofocus", "autofocus")
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" ),
						close: function( event, ui ) {
							Session.set("featureName", $('.custom-combobox-input').val());
						}
          });

        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option
            });
          }
        });
      },

      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;

        $( "<a>" )
          .attr( "tabIndex", -1 )
          .attr( "title", "Show All Items" )
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .on( "mousedown", function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .on( "click", function() {
            input.trigger( "focus" );

            // Close if already visible
            if ( wasOpen ) {
              return;
            }

            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          });
      },

      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text();
          if ( this.value && ( !request.term || matcher.test(text) ) )
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      }
    });

    $( "#combobox" ).combobox();
		$("#generatedtext").focus(function() { $(this).select(); } );
  } );
