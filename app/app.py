#!/usr/bin/env python2
# -*- coding: utf-8 -*-

import sys
sys.path.append("deezer")
import os
import time
from functools import wraps
from threading import Thread

from flask import Flask, render_template, request, jsonify

import settings, credentials
from deezer import deezerSearch, my_list_album, my_download_song, my_download_album, set_session_id, get_download_status
set_session_id(credentials.sid)

from ipdb import set_trace

app = Flask(__name__)

def validate_schema(*parameters_to_check):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kw):
            j = request.get_json(force=True)
            # checks if all parameters are supplied by the user
            if set(j.keys()) != set(parameters_to_check):
                return jsonify({"error": 'Parameter not fitting. Required: {}'.format(parameters_to_check)}), 400
            if "type" in j.keys():
                if j['type'] not in ["album", "track"]:
                    return jsonify({"Error": "type muste be album or track"}),400
            if "music_id" in j.keys():
                if not isinstance(j['music_id'], int):
                    return jsonify({"Error": "music_id must be a digit"}),400
            if "music_ids" in j.keys():
                if not isinstance(j['music_ids'], list) or not all(isinstance(x,int) for x in j['music_ids']):
                    return jsonify({"Error": "music_ids must be a list of int"}),400
            if "add" in j.keys():
                if not isinstance(j['add'], bool):
                    return jsonify({"Error": "all must be a boolean"}),400
            if "query" in j.keys():
                if j['query'] == "":
                    return jsonify({"Error": "query is empty"}),400
            return f(*args, **kw)
        return wrapper
    return decorator


@app.route('/api/v1/deezer/search', methods=['POST'])
@validate_schema("type", "query")
def search():
    """
    searches for available music in the Deezer library
    para: 
        type: track|album
        query: search query
    return:
        [ { artist, music_id, (title|album) } ]
    """
    query, type = request.get_json(force=True).values()
    results = deezerSearch(query, type)
    return jsonify(results)


@app.route('/api/v1/deezer/album/list', methods=['POST'])
@validate_schema("music_id")
def list_album():
    """
    para:
        music_id (int): id of the album
    return:
        [ { album,artist,song_id,title}]
    """
    music_id = request.get_json(force=True)['music_id']
    return jsonify(my_list_album(music_id))

@app.route('/api/v1/deezer/status', methods=['POST'])
@validate_schema("music_ids")
def check_status():
    """
    para:
        music_ids (array of int): music_ids to check status of
    return:
        [ { music_id, status } ]
    """
    music_ids = request.get_json(force=True)['music_ids']
    return jsonify([ { "music_id": id, "status": get_download_status(id) } for id in music_ids ])


@app.route('/api/v1/deezer/download', methods=['POST'])
@validate_schema("type", "music_id", "add")
def download():
    """
    downloads music from the Deezer library to the dir specified in settings.py
    A album will be placed in a single directory
    para: 
        type: album|track
        music_id: id of the album or track
        add: true|false (add to mpd playlist)
    """
    add, music_id, type = request.get_json(force=True).values()
    dl_args = (music_id, settings.music_dir, settings.download_dir_name, 
                settings.update_mpd, add)
    if type == "track":
        t = Thread(target=my_download_song, args=dl_args)
    else:
        t = Thread(target=my_download_album, args=dl_args)
    t.start()
    return jsonify({"state": "have fun"})


@app.route('/static/<path:filename>')
def serve_static(filename):
    root_dir = os.path.dirname(os.getcwd())
    return send_from_directory(os.path.join(root_dir, 'static'), filename)    


@app.route("/")
def index():
    return render_template("index.html",
        api_root=settings.api_root, static_root=settings.static_root)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
