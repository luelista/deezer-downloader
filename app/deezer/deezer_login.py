import sys
import requests
from ipdb import set_trace
import os.path
import pickle

base = "https://www.deezer.com%s"
header = {
    'Pragma': 'no-cache' ,
    'Origin': 'https://www.deezer.com' ,
    'Accept-Encoding': 'gzip, deflate, br' ,
    'Accept-Language': 'en-US,en;q=0.9' ,
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36' ,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' ,
    'Accept': '*/*' ,
    'Cache-Control': 'no-cache' ,
    'X-Requested-With': 'XMLHttpRequest' ,
    'Connection': 'keep-alive' ,
    'Referer': 'https://www.deezer.com/login' ,
    'DNT': '1' ,
    }

class DeezerLogin():

    def __init__(self):
        self.session = requests.session()
        self.session.headers.update(header)

    def set_session_id(self, session_id):
        self.session.cookies.update({'sid': session_id, 'comeback':'1'})


    def test_login(self):
        # sid cookie has no expire date. Session will be extended on the server side
        # so we will just send a request regularly to not get logged out
        from deezer import my_download_song
        
        login_successfull = True
        try:
            my_download_song("917265")
        except Exception as e:
            if e.args[0] == 'We are not logged in.':
                login_successfull = False
            else:
                raise Exception("Error during my_download_song. {}".format(e))

        if login_successfull:
            print("Login is still working.")
        else:
            print("Login is not working anymore.")
        return not login_successfull

    
if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == "test_login":
        sys.exit(DeezerLogin().test_login())
    else:
        DeezerLogin()
