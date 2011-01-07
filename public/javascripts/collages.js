jQuery.extend({

    addLayerToCookie: function(cookieName,layerId){
        var currentVals = jQuery.unserializeHash(jQuery.cookie(cookieName));
        currentVals[layerId] = 1;
        var cookieVal = jQuery.serializeHash(currentVals);
        jQuery.cookie(cookieName, cookieVal, {
            expires: 365
        });
    },

    submitAnnotation: function(){
        var collageId = jQuery('.collage-id').attr('id').split('-')[1];
        jQuery('#annotation-form form').ajaxSubmit({
            error: function(xhr){
                jQuery('#spinner_block').hide();
                jQuery('#new-annotation-error').show().append(xhr.responseText);
            },
            beforeSend: function(){
                jQuery('#spinner_block').show();
                jQuery('div.ajax-error').html('').hide();
                jQuery('#new-annotation-error').html('').hide();
                jQuery.showPleaseWait();
            },
            success: function(response){
                jQuery('#spinner_block').hide();
                jQuery.cookie('layer-names', jQuery('#annotation_layer_list').val(), {
                    expires: 365
                });
                jQuery('#annotation-form').dialog('close');
                document.location = jQuery.rootPath() + 'collages/' + collageId;
            }
        });
    },

    removeLayerFromCookie: function(cookieName,layerId){
        var currentVals = jQuery.unserializeHash(jQuery.cookie(cookieName));
        delete currentVals[layerId];
        var cookieVal = jQuery.serializeHash(currentVals);
        jQuery.cookie(cookieName,cookieVal,{
            expires: 365
        });
    },

    annotateRange: function(obj,activeId,aIndex){
        var start = obj.annotation_start.substring(1);
        var end = obj.annotation_end.substring(1);
        var points = [parseInt(start), parseInt(end)];
        var elStart = points[0];
        var elEnd = points[1];
        var i = 0;
        var ids = [];
        for(i = elStart; i <= elEnd; i++){
            ids.push('#t' + i);
        }
        var activeLayers = jQuery.unserializeHash(jQuery.cookie('active-layer-ids'));
        var layerNames = [];
        var lastLayerId = 0;
        jQuery(obj.layers).each(function(){
            layerNames.push(this.name);
            lastLayerId = this.id;
        });

        var detailNode = jQuery('<span class="annotation-control annotation-start ' + 'c' + (lastLayerId % 10) + ' annotation-control-' + obj.id + '"></span>');
        jQuery(detailNode).html('<a href="#" class="close-annotation-details adetails-' + obj.id + '"><img src="/images/elements/close.gif" /></a>' + layerNames.join(', ') + ((obj.annotation_word_count > 0) ? ' (' + aIndex + ') ' : '' ) + ' <span class="print-inline">#' + obj.id + '</span>');

        var startArrow = jQuery('<span class="arr rc' + (lastLayerId % 10) + '">&#9654;</span>');
        jQuery("#t" + elStart).before(detailNode, startArrow);

        var endArrow = jQuery('<span class="arr rc' + (lastLayerId % 10) + '">&#9664;</span>');
        jQuery("#t" + elEnd).after(endArrow);

        var idList = ids.join(',');

/*        jQuery([startNode,endNode]).each(function(){
          jQuery(this).bind({
              click: function(e){
                jQuery.annotationButton(e,obj.id);
              },
              mouseover: function(e){
                jQuery('.a' + obj.id).addClass('highlight');
              },
              mouseout: function(e){
                jQuery('.a' + obj.id).removeClass('highlight');
              }
            });
          }); */
          var btOptions = {
            contentSelector: "jQuery('.annotation-control-" + obj.id + "').html()",
            fill: '#F7F7F7',
            clickAnywhereToClose: false,
            strokeStyle: '#B7B7B7', 
            spikeLength: 20, 
            shadow: true,
            spikeGirth: 10, 
            padding: 8, 
            cornerRadius: 5,
            positions: ['top'],
            cssStyles: {
              fontFamily: '"lucida grande",tahoma,verdana,arial,sans-serif', 
              fontSize: '11px'
            },
            postShow: function(box){
              jQuery('.adetails-' + obj.id).click(function(e){
                // FIXME
                e.preventDefault();
                console.log(box);
                jQuery(box).find('.adetails-' + obj.id).btOff();
              });
            },
            hoverIntentOpts: {
              interval: 500,
              timeout: 10000000
            }
          };

          jQuery([startArrow, endArrow]).each(function(){
            jQuery(this).bt(btOptions);
            jQuery(this).bind({
              click: function(e){
                e.preventDefault();
                if(jQuery('.a' + obj.id + ':visible').length > 0){
                  jQuery('.a' + obj.id).hide();
                } else {
                  jQuery('.a' + obj.id).show();
                }
              },
              mouseover: function(e){
                jQuery('.a' + obj.id).addClass('highlight');
              },
              mouseout: function(e){
                jQuery('.a' + obj.id).removeClass('highlight');
              }
            });
        });

        if(obj.id == activeId){
          jQuery(".annotation-control-" + obj.id).click();
        }

    },

annotationButton: function(e,annotationId){
    e.preventDefault();
    var collageId = jQuery('.collage-id').attr('id').split('-')[1];
    if(jQuery('#annotation-details-' + annotationId).length == 0){
        jQuery.ajax({
            type: 'GET',
            cache: false,
            url: jQuery.rootPath() + 'annotations/' + annotationId,
            beforeSend: function(){
                jQuery('#spinner_block').show();
                jQuery('div.ajax-error').html('').hide();
            },
            error: function(xhr){
                jQuery('#spinner_block').hide();
                jQuery('div.ajax-error').show().append(xhr.responseText);
            },
            success: function(html){
                // Set up the annotation node to be loaded into a dialog
                jQuery('#spinner_block').hide();
                var node = jQuery(html);
                jQuery('body').append(node);
                var dialog = jQuery('#annotation-details-' + annotationId).dialog({
                    height: 500,
                    title: 'Annotation Details',
                    width: 600,
                    position: [e.clientX,e.clientY - 330],
                    buttons: {
                        Close: function(){
                            jQuery(this).dialog('close');
                        },
                        Delete: function(){
                            if(confirm('Are you sure?')){
                                jQuery.ajax({
                                    cache: false,
                                    type: 'POST',
                                    data: {
                                        '_method': 'delete'
                                    },
                                    url: jQuery.rootPath() + 'annotations/destroy/' + annotationId,
                                    beforeSend: function(){
                                        jQuery('#spinner_block').show();
                                        jQuery.showPleaseWait();
                                    },
                                    error: function(xhr){
                                        jQuery('#spinner_block').hide();
                                        jQuery('div.ajax-error').show().append(xhr.responseText);
                                    },
                                    success: function(response){
                                        jQuery('#annotation-details-' + annotationId).dialog('close');
                                        document.location = jQuery.rootPath() + 'collages/' + collageId;
                                    },
                                    complete: function(){
                                        jQuery('#please-wait').dialog('close');
                                    }
                                });
                            }
                        },
                        Edit: function(){
                            jQuery(this).dialog('close');
                            jQuery.ajax({
                                type: 'GET',
                                cache: false,
                                url: jQuery.rootPath() + 'annotations/edit/' + annotationId,
                                beforeSend: function(){
                                    jQuery('#spinner_block').show();
                                    jQuery('#new-annotation-error').html('').hide();
                                },
                                error: function(xhr){
                                    jQuery('#spinner_block').hide();
                                    jQuery('#new-annotation-error').show().append(xhr.responseText);
                                },
                                success: function(html){
                                    jQuery('#spinner_block').hide();
                                    jQuery('#annotation-form').html(html);
                                    jQuery.updateAnnotationPreview(collageId);
                                    jQuery('#annotation-form').dialog({
                                        bgiframe: true,
                                        minWidth: 950,
                                        width: 950,
                                        modal: true,
                                        title: 'Edit Annotation',
                                        buttons: {
                                            'Save': function(){
                                                jQuery.submitAnnotation();
                                            },
                                            Cancel: function(){
                                                jQuery('#new-annotation-error').html('').hide();
                                                jQuery(this).dialog('close');
                                            }
                                        }
                                    });
                                    jQuery("#annotation_annotation").markItUp(myTextileSettings);

                                    /*                    jQuery(document).bind('keypress','ctrl+shift+k',
                        function(e){
                        alert('pressed!');
                        jQuery.submitAnnotation();
                        }
                        ); */
                                    jQuery('#annotation_layer_list').keypress(function(e){
                                        if(e.keyCode == '13'){
                                            e.preventDefault();
                                            jQuery.submitAnnotation();
                                        }
                                    });
                                }
                            });
                        }
                    }
                });

                jQuery('#annotation-tabs-' + annotationId).tabs();
                // Wipe out edit buttons if not owner.
                if(jQuery('#is_owner').html() != 'true'){
                    jQuery('#annotation-details-' + annotationId).dialog('option','buttons',{
                        Close: function(){
                            jQuery(this).dialog('close');
                        }
                    });
            }
        }
        });
} else {
    jQuery('#annotation-details-' + annotationId).dialog('open');
}
},

showPleaseWait: function(){
    jQuery('#please-wait').dialog({
        closeOnEscape: false,
        draggable: false,
        modal: true,
        resizable: false,
        autoOpen: true
    });
},

hideEmptyElements: function(){
    // So - as brute force as this would appear, this seems to represent the best compromise between performance and cross-browser compatibility.
    jQuery('#annotatable-content tt:hidden').remove();
    //jQuery('#annotatable-content center, #annotatable-content p, #annotatable-content li, #annotatable-content ul, #annotatable-content blockquote, #annotatable-content ol, #annotatable-content h1').filter(function(){
    jQuery('#annotatable-content').find('center,p,li,ul,blockquote,ol,h1,h2,h3,h4,h5').filter(function(){
        var text = jQuery(this).text();
        var collapsedText = jQuery.trim11(text);
//        if(collapsedText.length > 0){
//          console.log('|' + escape(text) + '|')
//        }
        return (collapsedText.length == 0);
    }).remove();
},

initializeAnnotations: function(){
    // This iterates through the annotations on this collage and emits the controls.
    var collageId = jQuery('.collage-id').attr('id').split('-')[1];
    jQuery.ajax({
        type: 'GET',
        url: jQuery.rootPath() + 'collages/annotations/' + collageId,
        dataType: 'json',
        cache: false,
        beforeSend: function(){
            jQuery('#spinner_block').show();
            jQuery.showPleaseWait();
            jQuery('div.ajax-error').html('').hide();
        },
        success: function(json){
          var aIndex = 1;
            jQuery(json).each(function(){
                var activeId = false;
                if(window.location.hash){
                    activeId = window.location.hash.split('#')[1];
                }
                jQuery.annotateRange(this.annotation,activeId,aIndex);
                aIndex++;
            });
            jQuery.observeWords();
            jQuery.hideEmptyElements();
            jQuery('#spinner_block').hide();
        },
        complete: function(){
            jQuery('#please-wait').dialog('close');
        },
        error: function(xhr){
            jQuery('#spinner_block').hide();
            jQuery('div.ajax-error').show().append(xhr.responseText);
        }

    });
},

observeLayers: function(){
    var collageId = jQuery('.collage-id').attr('id').split('-')[1];
    jQuery('.layer-control').click(function(e){
        var layerId = jQuery(this).attr('id').split('-')[2];
        if(jQuery('#layer-checkbox-' + layerId).is(':checked')){
            // Set the name and id of the active layers.
            jQuery.addLayerToCookie('active-layer-ids',layerId);
        } else {
            jQuery.removeLayerFromCookie('active-layer-ids',layerId);
        }
    });
},

updateCollagePreview: function(){
    jQuery("#collage_description").observeField(5,function(){
        jQuery.ajax({
            cache: false,
            type: 'POST',
            url: jQuery.rootPath() + 'collages/description_preview',
            data: {
                preview: jQuery('#collage_description').val()
                },
            success: function(html){
                jQuery('#collage_preview').html(html);
            }
        });
    });
},

updateAnnotationPreview: function(collageId){
    jQuery("#annotation_annotation").observeField(5,function(){
        jQuery.ajax({
            cache: false,
            type: 'POST',
            url: jQuery.rootPath() + 'annotations/annotation_preview',
            data: {
                preview: jQuery('#annotation_annotation').val(),
                collage_id: collageId
            },
            success: function(html){
                jQuery('#annotation_preview').html(html);
            }
        });
    });
},

wordEvent: function(e){
    if(e.type == 'mouseover'){
        jQuery(this).addClass('highlight')
    }
    if(e.type == 'mouseout'){
        jQuery(this).removeClass('highlight');
    } else if(e.type == 'click'){
        e.preventDefault();
        if(jQuery('#new-annotation-start').html().length > 0){
            // Set end point and annotate.
            jQuery('#new-annotation-end').html(jQuery(this).attr('id'));
            var collageId = jQuery('.collage-id').attr('id').split('-')[1];
            jQuery('#annotation-form').dialog({
                bgiframe: true,
                autoOpen: false,
                minWidth: 950,
                width: 950,
                modal: true,
                title: 'New Annotation',
                buttons: {
                    'Save': function(){
                        jQuery.submitAnnotation();
                    },
                    'Cancel': function(){
                        jQuery('#new-annotation-error').html('').hide();
                        jQuery(this).dialog('close');
                    }
                }
            });
            // close tooltip.
            jQuery('#' + jQuery('#new-annotation-start').html()).btOff();
            e.preventDefault();
            jQuery.ajax({
                type: 'GET',
                url: jQuery.rootPath() + 'annotations/new',
                data: {
                    collage_id: collageId,
                    annotation_start: jQuery('#new-annotation-start').html(),
                    annotation_end: jQuery('#new-annotation-end').html()
                    },
                cache: false,
                beforeSend: function(){
                    jQuery('#spinner_block').show();
                    jQuery('div.ajax-error').html('').hide();
                },
                success: function(html){
                    jQuery('#spinner_block').hide();
                    jQuery('#annotation-form').html(html);
                    jQuery('#annotation-form').dialog('open');
                    jQuery("#annotation_annotation").markItUp(myTextileSettings);
                    /*            jQuery('#annotation_annotation').bind('keypress','alt+k',function(e){
              alert('pressed!');
              jQuery.submitAnnotation()
              }); */
                    jQuery('#annotation_layer_list').keypress(function(e){
                        if(e.keyCode == '13'){
                            e.preventDefault();
                            jQuery.submitAnnotation();
                        }
                    });
                    jQuery.updateAnnotationPreview(collageId);
                    if(jQuery('#annotation_layer_list').val() == ''){
                        jQuery('#annotation_layer_list').val(jQuery.cookie('layer-names'));
                    }
                },
                error: function(xhr){
                    jQuery('#spinner_block').hide();
                    jQuery('div.ajax-error').show().append(xhr.responseText);
                }
            });
            jQuery('#new-annotation-start').html('');
            jQuery('#new-annotation-end').html('');
        } else {
            // Set start point
            jQuery('#' + jQuery(this).attr('id')).bt({
                trigger: 'none',
                contentSelector: 'jQuery("#annotation-start-marker")',
                fill: '#F7F7F7',
                positions: ['top','most'],
                active_class: 'subhighlight',
                clickAnywhereToClose: false,
                closeWhenOthersOpen: true
            });
            jQuery('#' + jQuery(this).attr('id')).btOn();
            jQuery('#new-annotation-start').html(jQuery(this).attr('id'));
        }
    }
},

observeWords: function(){
    // This is a significant burden in that it binds to every "word node" on the page, so running it must
    // align with the rights a user has to this collage, otherwise we're just wasting cpu cycles. Also
    // the controller enforces privs - so feel free to fiddle with the DOM, it won't get you anywhere.
    // jQuery('tt:visible') as a query is much less efficient - unfortunately.
  
    if(jQuery('#is_owner').html() == 'true'){
        jQuery('tt').bind('mouseover mouseout click', jQuery.wordEvent);
    }
}

});

jQuery(document).ready(function(){
  jQuery('.per-page-selector').change(function(){
    jQuery.cookie('per_page', jQuery(this).val(), {
      expires: 365
    });
    document.location = document.location;
  });
  jQuery('.per-page-selector').val(jQuery.cookie('per_page'));
  jQuery('.tablesorter').tablesorter();
  jQuery('.button').button();
  jQuery('#collage_submit').button({
    icons: {
      primary: 'ui-icon-circle-plus'
    }
  });
  jQuery('.layer-button').button({
    icons: {
      primary: 'ui-icon-check'
    }
  });
  if(jQuery('#collage_description').length > 0){
    jQuery("#collage_description").markItUp(myTextileSettings);
    jQuery.updateCollagePreview();
  }
  jQuery("#annotation_annotation").markItUp(myTextileSettings);

  jQuery.observeToolbar();
  jQuery.observeMetadataForm();

  if(jQuery('.just_born').length > 0){
    // New collage. Deactivate control.
    jQuery.cookie('hide-non-annotated-text', null);
  }

  if(jQuery.cookie('hide-non-annotated-text') == 'hide'){
    jQuery('#hide-non-annotated-text').attr('checked',true);
  }

  jQuery('#hide-non-annotated-text').click(function(e){
    if(jQuery.cookie('hide-non-annotated-text') == 'hide'){
      jQuery.cookie('hide-non-annotated-text',null);
      jQuery('#hide-non-annotated-text').attr('checked',false);
    } else {
      jQuery.cookie('hide-non-annotated-text','hide',{
        expires: 365
      });
      jQuery('#hide-non-annotated-text').attr('checked',true);
    }
  });

  jQuery('a#cancel-annotation').click(function(e){
    e.preventDefault();
    // close tip.
    jQuery('#' + jQuery('#new-annotation-start').html()).btOff();
    jQuery('#new-annotation-start').html('');
    jQuery('#new-annotation-end').html('');
  });

  if(jQuery('.collage-id').length > 0){
    jQuery.observeLayers();
    jQuery.initializeAnnotations();
    jQuery(".tagging-autofill-layers").live('click',function(){
      jQuery(this).tagSuggest({
        url: jQuery.rootPath() + 'annotations/autocomplete_layers',
        separator: ', ',
        delay: 500
      });
    });
  }
});
