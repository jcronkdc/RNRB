# Demo Audio Files

This directory contains demo audio files for the AI Music Generation feature in demo mode.

## Required Files

Add the following files to enable demo mode:

- `ai-demo-track.mp3` - A royalty-free demo track (5-30 seconds)

## Usage

When `REPLICATE_API_TOKEN` is not configured, the AI Music Generation feature
operates in demo mode. It creates placeholder songs that reference these audio files.

## Sourcing Demo Audio

Use royalty-free sources like:

- https://freesound.org
- https://pixabay.com/music/
- https://freemusicarchive.org

Or generate a simple loop using any DAW with a Creative Commons license.

## Note

In production, configure `REPLICATE_API_TOKEN` for real AI music generation.
