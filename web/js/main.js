(function() {
	$(document).ready(function () {
		PluginAPI.setAppName('embedScriptPlugin');
		PluginAPI.on('pluginElementClicked', function(event) {
			if (typeof(event.data) !== 'undefined'
				&& typeof(event.data.options) !== 'undefined'
				&& typeof(event.data.options.code) !== 'undefined'
				&& typeof(event.data.options.title) !== 'undefined') {
				$('#embedcode').val(event.data.options.code);
				$('#title').val(event.data.options.title);
			}
		});
		PluginAPI.on('pluginElementSelected', function(event) {
			$('#embedcode').val('');
			$('#title').val('');
			$('.alert').delay(3000).fadeOut(500);
		});
		PluginAPI.on('pluginElementDeselected', function(event) {
			$('#embedcode').val('');
			$('#title').val('');
			$('.alert').delay(3000).fadeOut(500);
		});
	});
	function escapeHTML( string ) {
		var pre = document.createElement('pre');
		var text = document.createTextNode( string );
		pre.appendChild(text);
		return pre.innerHTML;
	}
	var QueryString = function () {
		var query_string = {};
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=");
			if (typeof query_string[pair[0]] === "undefined") {
				query_string[pair[0]] = decodeURIComponent(pair[1]);
			} else if (typeof query_string[pair[0]] === "string") {
				var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
				query_string[pair[0]] = arr;
			} else {
				query_string[pair[0]].push(decodeURIComponent(pair[1]));
			}
		} 
		return query_string;
	}();

	function isValidHtml(html) {
		var isValid = true;
		var abortWhenInvalid = false;
		if (typeof(QueryString.abortWhenInvalid) !== 'undefined'
			&& QueryString.abortWhenInvalid === 'true') {
			abortWhenInvalid = true;
		}
		try {
			var node = $(html);
			if (typeof(node[0]) === 'undefined') {
				throw new Error('Syntax error: ' + html);
			}
		} catch (error) {
			isValid = false;
			if (abortWhenInvalid) {
				$( "#preview" ).before(
					'<div class="alert alert-danger fade in">' +
					'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
					'<code>' + escapeHTML( error ) + '</code>' +
					'</div>'
				);
			} else {
				$( "#preview" ).before(
					'<div class="alert alert-warning fade in">' +
					'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
					'<code>' + escapeHTML( error ) + '</code>' +
					'</div>'
				);
			}
			return (abortWhenInvalid == false) || isValid;
		}
		try {
			$( "#htmlCheck" ).html(html);
			HTMLInspector.inspect({
				domRoot: "#htmlCheck",
				excludeRules: ["validate-attributes"],
				onComplete: function(errors) {
					errors.forEach(function(error) {
						isValid = false;
						if (abortWhenInvalid) {
							$( "#preview" ).before(
								'<div class="alert alert-danger fade in">' +
								'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
								error.message + ' Please correct: <code>' + escapeHTML( html ) + '</code>' +
								'</div>'
							);
						} else {
							$( "#preview" ).before(
								'<div class="alert alert-warning fade in">' +
								'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
								error.message + ' Please correct: <code>' + escapeHTML( html ) + '</code>' +
								'</div>'
							);
						}
					})
				}
			});
		} catch (error) {
			isValid = false;
			if (abortWhenInvalid) {
				$( "#preview" ).before(
					'<div class="alert alert-danger fade in">' +
					'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
					'HTML is not valid. Please correct: <code>' + escapeHTML( html ) + '</code>' +
					'</div>'
				);
			} else {
				$( "#preview" ).before(
					'<div class="alert alert-warning fade in">' +
					'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
					'HTML is not valid. Please correct: <code>' + escapeHTML( html ) + '</code>' +
					'</div>'
				);
			}
		}

		$( "#htmlCheck" ).replaceWith(
			'<div id="htmlCheck"></div>'
		);
		return (abortWhenInvalid == false) || isValid;
	};

	function insertScript() {
		var embedCode = $('#embedcode').val();
		var title = $('#title').val();
		title = title.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
		var markup = '<div><strong>Embed: </strong>'+ title + '</div>';
			 var callback = function() {};
			 var data = {
					 embeddedTypeId: 6,
					 assetType: 'script',
					 externalId: '',
					 assetClass: 'dp-script-asset',
					 assetSource: PluginAPI.getAppName(),
					 resourceUri: '',
					 previewUri: '',
					 options: {
							 code: embedCode,
							 title: title,
							 foo: 'bar'
					}
			 }
			 PluginAPI.Editor.insertEmbeddedAsset(markup, data, callback);
			 $( "#preview" ).before(
				'<div class="alert alert-success fade in">' +
				'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
				'Successfully inserted embed.' +
				'</div>'
			);
	};

	function preview(html) {
		$( "#preview" ).replaceWith(
				'<div id="preview" class="embed-responsive embed-responsive-16by9 well"><div class="embed-responsive-item">'+html+'</div></div>'
		);
	}

	$( document ).ready(function() {
		var isValid = true;
		$( "#insertButton" ).on( "click", function() {
				$('.alert').remove();
				if (!$('#embedcode').val()) {
					isValid = false;
					$( "#preview" ).before(
						'<div class="alert alert-danger fade in">' +
						'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
						'Please add the code that should be embedded.' +
						'</div>'
					);
				}
				if (!$('#title').val()) {
					isValid = false;
					$( "#preview" ).before(
						'<div class="alert alert-danger fade in">' +
						'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
						'Please add the title which will be added as a label.' +
						'</div>'
					);
				}

				if (!isValid || !isValidHtml($('#embedcode').val())) {
					return;
				}
				insertScript();
				$('.alert').delay(5000).fadeOut(500);
		});
		$( "#previewButton" ).on( "click", function() {
			preview($('#embedcode').val());
		});
		$('#form').validator();
	});
})();