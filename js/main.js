(function() {
	var clear = function() {
		$('#title').val('');
		$('#width').val('');
		$('#height').val('');
		$('#embedcode').val('');
		$('input[name="float"]').each(function () {
			$(this).prop('checked', false);
		});
		$('#floatOptions :input[value="none"]').prop('checked', true);
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
		var floatDirection = $('input[name="float"]:checked').val() || 'none';
		floatClass = '';
		if (floatDirection != 'none') {
			floatClass = ' dp-float-' + floatDirection;
		}

		var title = title.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
		var markup = '<div><strong>Embed: </strong>'+ title + '</div>';

		 var data = {
				 embeddedTypeId: 6,
				 assetType: 'script',
				 externalId: '',
				 assetClass: 'dp-script-asset' + floatClass,
				 assetSource: PluginAPI.getAppName(),
				 resourceUri: '',
				 previewUri: '',
				 options: {
						 code: embedCode,
						 title: title,
						 width: width,
						 height: height,
						 floatDirection: floatDirection
				}
		 }
		 PluginAPI.Editor.insertEmbeddedAsset(markup, data, function(){});
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
		$( "#previewBox" ).html(html).delay(500).fadeIn(500);
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
		}
		instgrm.Embeds.process();
	}

	$( document ).ready(function() {
		var isValid = true;

		PluginAPI.setAppName('embedScriptPlugin');
		PluginAPI.on('appAuthenticated', function() {
			PluginAPI.Editor.initMenu(['deleteButton', 'floatButtons']);
		});

		PluginAPI.on('pluginElementClicked', function(event) {
			var id = event.data.id;
			PluginAPI.on('modifiedContent', function(event) {
				$('input[name="float"]').each(function () {
					$(this).prop('checked', false);
				});
				PluginAPI.Editor.getHTMLById(id, function (el) {
					if ($(el).hasClass('dp-float-right')) {
						$('#floatOptions :input[value="right"]').prop('checked', true);
					} else if ($(el).hasClass('dp-float-left')) {
						$('#floatOptions :input[value="left"]').prop('checked', true);
					} else {
						$('#floatOptions :input[value="none"]').prop('checked', true);
					}
				});
				PluginAPI.on('modifiedContent', function(event) {});
			});
			
		});
		
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

				if (typeof(event.data.options.floatDirection) !== 'undefined') {
					var radio = $('#floatOptions :input[value="' + event.data.options.floatDirection + '"]');
					if (radio) {
						radio.prop('checked', true);
					}
				}

				
			}
		});
		PluginAPI.on('embeddedAssetBlur', function(event) {
			clear();
			$( "#previewBox" ).fadeOut(500).delay(500).html('');
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
			$( "#previewBox" ).fadeOut(500).delay(500).html('');
			clear();
		});
	});
})();