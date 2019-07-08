$(document).ready(function() {

    function search_track() {
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

    function checkStatus() {
        if (document.hidden) return; //don't check status if page is in background
        var musicIds = $("tr[data-music-id]").map(function() { return parseInt(this.getAttribute("data-music-id")); });
        if (musicIds.length == 0) return;
        $.post(deezer_downloader.api_root + '/status', { music_ids : musicIds }, function(data) {
            data.forEach(function(item) {
                var tr = $("tr[data-music-id='"+item.music_id+"']");
                if (item.status == "unknown") {
                    tr.find(".status").hide();
                    tr.find(".playbtn, .downloadbtn").show();
                    tr.find(".playbtn button, .downloadbtn button").attr("disabled",false);
                } else if (item.status == "done") {
                    tr.find(".status").hide();
                    tr.find(".playbtn, .downloadbtn").show();
                    tr.find(".playbtn button").attr("disabled",true);
                    tr.find(".downloadbtn button").attr("disabled",false);
                } else {
                    tr.find(".status").show().text(item.status);
                    tr.find(".playbtn, .downloadbtn").hide();
                }
            })
        });
    }
    setInterval(checkStatus, 4000);
    
    deezer_downloader.download = function(music_id, type, add) {
        $.post(deezer_downloader.api_root + '/download', 
            JSON.stringify({ type: type, music_id: parseInt(music_id), add: add}),
            function(data) {
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
                $.jGrowl(text, { life: 4000 });
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
});

