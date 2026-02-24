import sys
import json
import time

try:
    import bizra_ffi
    print(json.dumps({"ffi": "active", "status": "sovereign", "version": bizra_ffi.get_version()}))
except ImportError as exc:
    print(json.dumps({
        "ffi": "missing",
        "status": "error",
        "reason": f"native_extension_not_loaded: {exc}"
    }))
    sys.exit(1)
