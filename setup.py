from setuptools import setup, find_packages

setup(
    name="apex_engine",
    version="7.1.0",
    description="BIZRA Apex Engine - Peak Masterpiece",
    packages=find_packages(),
    entry_points={
        "console_scripts": [
            "apex=apex_engine.cli:main",
        ],
    },
    python_requires=">=3.8",
)
