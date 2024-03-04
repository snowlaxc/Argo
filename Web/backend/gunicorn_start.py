import gunicorn.app.base
import os
import sys
import dotenv

# .env 파일을 로드합니다.
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
dotenv.load_dotenv(dotenv_path)

# 프로젝트 폴더의 경로를 계산합니다.
project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.'))

# Gunicorn 설정을 정의합니다.
class StandaloneApplication(gunicorn.app.base.BaseApplication):
    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        super().__init__()

    def load_config(self):
        config = {key: value for key, value in self.options.items() if key in self.cfg.settings and value is not None}
        for key, value in config.items():
            self.cfg.set(key.lower(), value)

    def load(self):
        sys.path.insert(0, project_path)  # 프로젝트 폴더를 Python 경로에 추가합니다.
        os.chdir(project_path)  # 현재 작업 디렉토리를 프로젝트 폴더로 변경합니다.
        return self.application

# Gunicorn 실행 스크립트와 설정 파일을 합칩니다.
if __name__ == "__main__":
    # 프로젝트의 WSGI 애플리케이션을 가져옵니다.
    # 'argo' 폴더 안의 'wsgi.py' 파일을 참조합니다.
    sys.path.insert(0, os.path.join(project_path, 'argo'))
    from wsgi import application

    options = {
        'bind': '0.0.0.0:8000',
        'workers': 2,  # 원하는 워커 수로 조절합니다.
    }

    StandaloneApplication(application, options).run()
