#!/bin/bash
# RNRB MCP Server Deployment Script
# Run this from the apps/mcp-server directory

set -e

echo "🚀 RNRB MCP Server Deployment"
echo "=============================="
echo ""

# Check if wrangler is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

# Generate API key if needed
generate_key() {
    openssl rand -hex 32
}

echo "📋 Step 1: Setting up secrets"
echo "------------------------------"
echo ""
echo "You'll be prompted to enter values for each secret."
echo "For API keys, you can generate random ones with: openssl rand -hex 32"
echo ""

# Check if secrets are already set
echo "Setting RNRB_API_URL (your main app URL, e.g., https://cronkwaters.com)..."
npx wrangler secret put RNRB_API_URL

echo ""
echo "Setting RNRB_API_KEY (must match MCP_SERVER_API_KEY in your main app .env)..."
echo "💡 Tip: Generate with 'openssl rand -hex 32' and save it for your .env file"
npx wrangler secret put RNRB_API_KEY

echo ""
echo "Setting COOKIE_ENCRYPTION_KEY..."
npx wrangler secret put COOKIE_ENCRYPTION_KEY

echo ""
echo "📦 Step 2: Deploying to Cloudflare Workers"
echo "-------------------------------------------"
npx wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your MCP server is now live. To use it:"
echo ""
echo "1. Add MCP_SERVER_API_KEY to your main app's .env with the same value you used for RNRB_API_KEY"
echo ""
echo "2. Connect Claude Desktop by adding to ~/Library/Application Support/Claude/claude_desktop_config.json:"
echo ""
echo '   {'
echo '     "mcpServers": {'
echo '       "rnrb": {'
echo '         "command": "npx",'
echo '         "args": ["mcp-remote", "https://rnrb-mcp-server.<your-account>.workers.dev/sse"]'
echo '       }'
echo '     }'
echo '   }'
echo ""
echo "3. Restart Claude Desktop"
echo ""
echo "🧪 Test your server:"
echo "   curl https://rnrb-mcp-server.<your-account>.workers.dev/health"






