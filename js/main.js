(function() {
	var clear = function() {
		$('#title').val('');
		$('#width').val('');
		$('#height').val('');
		$('#embedcode').val('');
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

	function escapeHTML( string ) {
		var pre = document.createElement('pre');
		var text = document.createTextNode( string );
		pre.appendChild(text);
		return pre.innerHTML;
	}

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
			$('.alert').delay(5000).fadeOut(500);
			return (abortWhenInvalid == false) || isValid;
		}
		try {
			$( "#htmlCheck" ).html(html);
			HTMLInspector.inspect({
				domRoot: "#htmlCheck",
				excludeRules: ["validate-attributes", "unused-classes", "unnecessary-elements", "script-placement", "inline-event-handlers"],
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
					});
					$('.alert').delay(5000).fadeOut(500);
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
			$('.alert').delay(5000).fadeOut(500);
		}

		$( "#htmlCheck" ).replaceWith(
			'<div id="htmlCheck"></div>'
		);
		return (abortWhenInvalid == false) || isValid;
	};

	function insertScript() {
		var embedCode = $('#embedcode').val();
		var title = $('#title').val();
		var width = $('#width').val();
		var height = $('#height').val();
		title = title.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
		var markup = '<div><strong>Embed: </strong>'+ title + '</div>';
		 var callback = clear;
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
						 width: width,
						 height: height
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
		$('.alert').fadeOut(500);
		if (!html) {
			return;
		}
		if (!isValidHtml(html)) {
			return;
		}
		console.log(html);
		$( "#previewBox" ).html(html);
		if ($( "#width" ).val()) {
			$("#previewBox").css({
				"width": $( "#width" ).val()
			});
		}

		if ($( "#height" ).val()) {
			$("#previewBox").css({
				"padding-bottom":"0",
				"height": $( "#height" ).val()
			});
		} else {
			/*
			$("#previewBox").css({
				"padding-bottom":"115%"
			});
			*/
		}
	}

	$( document ).ready(function() {
		var isValid = true;

		PluginAPI.setAppName('embedScriptPlugin');
		PluginAPI.on('embeddedAssetFocus', function(event) {
			if (typeof(event.data) !== 'undefined'
				&& typeof(event.data.options) !== 'undefined') {

				if (typeof(event.data.options.code) !== 'undefined') {
					$('#embedcode').val(event.data.options.code);
					preview(event.data.options.code);
				}
				if (typeof(event.data.options.title) !== 'undefined') {
					$('#title').val(event.data.options.title);
				}
				if (typeof(event.data.options.width) !== 'undefined') {
					$('#width').val(event.data.options.width);
				}
				if (typeof(event.data.options.height) !== 'undefined') {
					$('#height').val(event.data.options.height);
				}
			}
		});
		PluginAPI.on('embeddedAssetBlur', function(event) {
			clear();
			console.log('pluginElementDeselected');
			console.log(event);
			$('.alert').delay(3000).fadeOut(500);
		});

		$('#form').validator();

		$('#form').validator().on('submit', function (e) {
			if (e.isDefaultPrevented()) {
				$( "#preview" ).before(
					'<div class="alert alert-danger fade in">' +
					'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
					'The embed is invalid, please check the form.' +
					'</div>'
				);
			} else {
				e.preventDefault();
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
			}
		});

		$( "#previewButton" ).on( "click", function() {
			$('.alert').fadeOut(500);
			preview($('#embedcode').val());
		});
		$( "#clearButton" ).on( "click", function() {
			$('.alert').fadeOut(500);
			clear();
		});
	});
})();