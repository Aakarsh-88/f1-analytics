"""
Shared pytest configuration for the scripts/ test suite.

Mirrors the exact sys.path setup `import_csv.py` does at the top of its
own file (see the comment there) — tests need the same two directories
importable: `scripts/` itself (for `mappings.py`) and `backend/` (for
`app.core.config`, which `import_csv.py` reads the database URL from).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend"))
