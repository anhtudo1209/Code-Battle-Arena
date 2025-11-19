# Use Ubuntu as base image for C++ compilation
FROM ubuntu:22.04

# Install necessary packages
RUN apt-get update && apt-get install -y \
    g++ gcc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /judge

# Default command
CMD ["bash"]
