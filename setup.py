"""
Setup configuration for Solar Swarm Intelligence
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read README for long description
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

# Read requirements
requirements_file = Path(__file__).parent / "requirements.txt"
requirements = []
if requirements_file.exists():
    requirements = [
        line.strip() 
        for line in requirements_file.read_text().splitlines() 
        if line.strip() and not line.startswith('#')
    ]

setup(
    name="solar-swarm-intelligence",
    version="1.0.0",
    author="Solar Swarm Intelligence Team",
    author_email="your.email@example.com",
    description="Multi-Agent Reinforcement Learning for Community Solar Optimization",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/solar-swarm-intelligence",
    packages=find_packages(exclude=["tests", "docs", "frontend"]),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Science/Research",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.10",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-cov>=4.1.0",
            "black>=23.7.0",
            "flake8>=6.1.0",
            "mypy>=1.5.0",
        ],
        "docs": [
            "sphinx>=7.1.0",
            "sphinx-rtd-theme>=1.3.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "solar-swarm=main:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.yaml", "*.yml", "*.json"],
    },
    zip_safe=False,
    keywords=[
        "solar energy",
        "reinforcement learning",
        "multi-agent systems",
        "swarm intelligence",
        "renewable energy",
        "optimization",
        "smart grid",
    ],
    project_urls={
        "Bug Reports": "https://github.com/yourusername/solar-swarm-intelligence/issues",
        "Source": "https://github.com/yourusername/solar-swarm-intelligence",
        "Documentation": "https://github.com/yourusername/solar-swarm-intelligence/docs",
    },
)
