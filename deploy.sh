#!/bin/bash

# HSE News Platform - Deployment Script
# This script helps deploy both the main website and admin PWA to Vercel

echo "🚀 HSE News Platform - Deployment Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

echo -e "${BLUE}📋 Deployment Options:${NC}"
echo "1. Deploy Main Website"
echo "2. Deploy Admin PWA"
echo "3. Deploy Both"
echo "4. Production Deployment (Main Website)"
echo "5. Production Deployment (Admin PWA)"
echo "6. Production Deployment (Both)"
echo ""

read -p "Select option (1-6): " option

case $option in
    1)
        echo -e "${GREEN}🌐 Deploying Main Website (Preview)...${NC}"
        vercel
        ;;
    2)
        echo -e "${GREEN}📱 Deploying Admin PWA (Preview)...${NC}"
        cd admin-pwa
        vercel
        cd ..
        ;;
    3)
        echo -e "${GREEN}🚀 Deploying Both (Preview)...${NC}"
        echo "Deploying Main Website..."
        vercel
        echo "Deploying Admin PWA..."
        cd admin-pwa
        vercel
        cd ..
        ;;
    4)
        echo -e "${GREEN}🌐 Deploying Main Website (Production)...${NC}"
        vercel --prod
        ;;
    5)
        echo -e "${GREEN}📱 Deploying Admin PWA (Production)...${NC}"
        cd admin-pwa
        vercel --prod
        cd ..
        ;;
    6)
        echo -e "${GREEN}🚀 Deploying Both (Production)...${NC}"
        echo "Deploying Main Website..."
        vercel --prod
        echo ""
        echo "Deploying Admin PWA..."
        cd admin-pwa
        vercel --prod
        cd ..
        ;;
    *)
        echo -e "${YELLOW}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📚 Next Steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Update Supabase with production URLs"
echo "3. Test your live site"
echo "4. Update n8n webhooks with production URLs"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
