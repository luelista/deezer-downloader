$(document).ready(function() {

    function search_track() {
        messageBar.loading.show();
        $.post(deezer_downloader.api_root + '/search', 
            JSON.stringify({ type: "track", query: $('#query').val() }),
            function(data) {
                $("#results > tbody").html("");
                for (var i = 0; i < data.length; i++) {
                    drawTableEntry(data[i], "track");
                }
        });
    }

    function search_album() {
        messageBar.loading.show();
        $.post(deezer_downloader.api_root + '/search', 
            JSON.stringify({ type: "album", query: $('#query').val() }),
            function(data) {
                $("#results > tbody").html("");
                for (var i = 0; i < data.length; i++) {
                    drawTableEntry(data[i], "album");
                }
        });
    }

    function drawTableEntry(rowData, mtype) {
        var row = $("<tr data-music-id='"+rowData.id+"' />")
        console.log(rowData);
        $("#results").append(row); 
        row.append($("<td>" + rowData.artist + "</td>"));
        row.append($("<td>" + rowData.title + "</td>"));
        row.append($("<td>" + rowData.album + "</td>"));
        row.append($("<td class='status' colspan=2 style='display:none'></td>"));
            row.append($('<td class="downloadbtn">' + 
                '<button class="btn btn-default" onclick="deezer_downloader.download(\'' + rowData.id  + '\', \''+ mtype + '\', false);" > <i class="fa fa-download" title="download" ></i> </button>'  +
            "</td>"));
            row.append($('<td class="playbtn">' + 
                '<button class="btn btn-default" onclick="deezer_downloader.download(\'' + rowData.id  + '\', \''+ mtype + '\', true);" > <i class="fa fa-play-circle" title="download and add to playlist" ></i> </button>'  +
            "</td>"));
        if(mtype == "album") {
            row.append($("<td class='listbtn'>" + 
               '<button class="btn btn-default" onclick="deezer_downloader.list_album(\'' + rowData.id  + '\');" >list album </button>'  +
               "</td>"));
        }
    }

    var statusCheckDelay = 4, statusCheckCounter = 0;
    function checkStatus() {
        if (++statusCheckCounter < statusCheckDelay) return;
        statusCheckCounter = 0;
        if (document.hidden) return; //don't check status if page is in background
        var musicIds = [];
        $("tr[data-music-id]").each(function() { musicIds.push(parseInt(this.getAttribute("data-music-id"))); });
        if (musicIds.length == 0) return;
        $.post(deezer_downloader.api_root + '/status', JSON.stringify({ music_ids : musicIds }),
        function(data) {
            statusCheckDelay = 4;
            data.forEach(function(item) {
                var tr = $("tr[data-music-id='"+item.music_id+"']");
                if (item.status == "unknown") {
                    tr.find(".status").hide();
                    tr.find(".playbtn, .downloadbtn").show();
                    tr.find(".playbtn button, .downloadbtn button").attr("disabled",false);
                } else if (item.status == "done") {
                    tr.find(".status").hide();
                    tr.find(".playbtn, .downloadbtn").show();
                    tr.find(".playbtn button").attr("disabled",false);
                    tr.find(".downloadbtn button").attr("disabled",true);
                } else {
                    statusCheckDelay = 1; //fast checking if download in progress
                    tr.find(".status").show().text(item.status);
                    tr.find(".playbtn, .downloadbtn").hide();
                }
            })
        });
    }
    setInterval(checkStatus, 1000);
    
    deezer_downloader.download = function(music_id, type, add) {
        var tr = $("tr[data-music-id='"+music_id+"']");
        tr.find(".status").show().text("starting");
        tr.find(".playbtn, .downloadbtn").hide();
        messageBar.loading.show();
        $.post(deezer_downloader.api_root + '/download', 
            JSON.stringify({ type: type, music_id: parseInt(music_id), add: add}),
            function(data) {
                statusCheckDelay = 1; //fast checking if download in progress
                if(type == "album") {
                    if(add == true) {
                        text = "Good choice! The album will be downloaded and queued to the playlist";
                    } else {
                        text = "Good choice! The album will be downloaded.";
                    }
                } else {
                    if(add == true) {
                        text = "Good choice! The song will be downloaded and queued to the playlist";
                    } else {
                        text = "Good choice! The song will be downloaded.";
                    }
                }
                messageBar.show("success", text, 4000, false);
        });
    }

    deezer_downloader.list_album = function(music_id) {
        $.post(deezer_downloader.api_root + '/album/list', 
            JSON.stringify({ music_id: parseInt(music_id) }),
            function(data) {
                $("#results > tbody").html("");
                for (var i = 0; i < data.length; i++) {
                    drawTableEntry(data[i], "album");
                }
        });
    }

    $("#search_track").click(function() {
        search_track();
    });

    $("#search_album").click(function() {
        search_album();
    });

    var bbody = document.getElementById('body');
    bbody.onkeydown = function (event) {
        if (event.key !== undefined) {
           if (event.key === 'Enter' && event.altKey) {
              search_album();
           }  else if (event.key === 'Enter' ) {
              search_track();
           } else if (event.key === 'm' && event.ctrlKey) {
              $("#query").val("");
              $("#query").focus();
           } else if (event.key === 'b' && event.ctrlKey) {
              window.location = "/";
           }
        }
    };

    window.messageBar = new MessageBar();
});


//==>
//==> MessageBar helper

function MessageBar() {
    var self = this;
    this.show = function(className, text, interval, isHtml) {
      var id = "loadingWidget_" + className;
      if ($('#'+id).length == 0)
        $('<div id="'+id+'" class="messageBar"></div>').prependTo("body").click(function(){messageBar.hide(className)});
      var $el = $('#'+id);
      if (isHtml) $el.html(text); else $el.text(text);
      $el.addClass(className).slideDown();
      if (interval) setInterval(function() { messageBar.hide(className); }, interval);
    };
    this.hide = function(className) {
      $("#loadingWidget_"+className).slideUp();
    };
    this.loading = $("<div class='progressBar'></div>").prependTo("body").hide();
    
    /*$(document).ajaxStart(function() {
        self.loading.show();
    });*/
    $(document).ajaxStop(function() {
        self.loading.hide();
    });
    $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
        console.log("ajaxError",event,jqxhr,thrownError);
        if (event.data) {
            messageBar.show("error", "Fehler: " + event.data.error, 3000);
        } else if (jqxhr.status) {
            messageBar.show("error", "Allgemeiner Fehler: " + jqxhr.status + " " + jqxhr.statusText, 3000);
        } else {
            messageBar.show("error", "Exception: " + thrownError, 3000);
        }
    });
    
};

