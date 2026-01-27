"""
版本資訊管理
"""
import os
import tomllib
from pathlib import Path

# 讀取 pyproject.toml 版本
def get_version():
    """從 pyproject.toml 讀取版本號"""
    pyproject_path = Path(__file__).parent.parent.parent / "pyproject.toml"
    
    try:
        with open(pyproject_path, "rb") as f:
            pyproject_data = tomllib.load(f)
            return pyproject_data.get("project", {}).get("version", "unknown")
    except Exception:
        return "unknown"

VERSION = get_version()
API_VERSION = "v1"

# 版本資訊字典
VERSION_INFO = {
    "version": VERSION,
    "api_version": API_VERSION,
    "python_version": os.sys.version.split()[0],
}
