#!/usr/bin/env python3
"""
Validation script for SEC-003: neo4j/numpy compatibility mitigation
This script verifies that the dependency constraints in requirements.txt
prevent the incompatible versions from being installed.
"""

import sys
import subprocess


def get_package_version(package_name):
    """Get the installed version of a package."""
    try:
        # Try importing the package directly
        if package_name == "neo4j":
            import neo4j
            return neo4j.__version__
        elif package_name == "numpy":
            import numpy
            return numpy.__version__
    except ImportError:
        pass
    
    # Fallback to pip show
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "show", package_name],
            capture_output=True,
            text=True,
            check=True
        )
        for line in result.stdout.split('\n'):
            if line.startswith('Version:'):
                return line.split(':', 1)[1].strip()
        return "not installed"
    except subprocess.CalledProcessError:
        return "not installed"


def check_version_constraint(package_name, constraint):
    """Check if the installed version meets the constraint."""
    version = get_package_version(package_name)
    
    if version in ["not installed", "error parsing version"]:
        print(f"⚠️  {package_name}: {version}")
        return False
    
    print(f"✓ {package_name}: {version} (constraint: {constraint})")
    
    # Parse version and check constraint
    try:
        major = int(version.split('.')[0])
        
        if package_name == "neo4j" and constraint == "<5.0":
            if major >= 5:
                print(f"  ❌ FAILED: Version {version} violates constraint {constraint}")
                return False
        
        if package_name == "numpy" and constraint == "<2.0":
            if major >= 2:
                print(f"  ❌ FAILED: Version {version} violates constraint {constraint}")
                return False
        
        return True
    except (ValueError, IndexError):
        print(f"  ⚠️  WARNING: Could not parse version {version}")
        return False


def main():
    """Main validation function."""
    print("=" * 70)
    print("SEC-003: neo4j/numpy Compatibility Validation")
    print("=" * 70)
    print()
    
    print("Checking dependency constraints from requirements.txt...")
    print()
    
    all_passed = True
    
    # Check neo4j
    if not check_version_constraint("neo4j", "<5.0"):
        all_passed = False
    
    # Check numpy
    if not check_version_constraint("numpy", "<2.0"):
        all_passed = False
    
    print()
    print("=" * 70)
    
    if all_passed:
        print("✅ All dependency constraints validated successfully!")
        print("   The system is protected against SEC-003 compatibility issue.")
        return 0
    else:
        print("❌ Dependency constraint validation failed!")
        print("   Please install dependencies from requirements.txt:")
        print("   pip install -r requirements.txt")
        return 1


if __name__ == "__main__":
    sys.exit(main())
